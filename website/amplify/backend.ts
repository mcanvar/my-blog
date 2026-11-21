import { defineBackend } from '@aws-amplify/backend'
import { CfnResource, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'
import type * as lambda from 'aws-cdk-lib/aws-lambda'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { commentGuard } from './functions/comment-guard/resource'
import { publicReader } from './functions/public-reader/resource'
import { isProductionBranch, siteOrigin } from './site-origin'
import { storage } from './storage/resource'

const backend = defineBackend({ auth, data, storage, commentGuard, publicReader })

const origin = siteOrigin()
// The address comes from the build environment (Amplify console / your shell), never the repo.
const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL

// ---- Auth: admins are created by hand; nobody can sign up.
const { cfnUserPool, cfnUserPoolClient } = backend.auth.resources.cfnResources
cfnUserPool.adminCreateUserConfig = { allowAdminCreateUserOnly: true }
cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 14,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
    temporaryPasswordValidityDays: 3,
  },
}
// Sign-in happens on managed login; the server only refreshes tokens. A stolen refresh token
// stops working within a day.
cfnUserPoolClient.explicitAuthFlows = ['ALLOW_USER_SRP_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH']
cfnUserPoolClient.accessTokenValidity = 60
cfnUserPoolClient.idTokenValidity = 60
cfnUserPoolClient.refreshTokenValidity = 1
cfnUserPoolClient.tokenValidityUnits = {
  accessToken: 'minutes',
  idToken: 'minutes',
  refreshToken: 'days',
}
cfnUserPoolClient.enableTokenRevocation = true
if (isProductionBranch) {
  cfnUserPool.deletionProtection = 'ACTIVE'
  cfnUserPool.applyRemovalPolicy(RemovalPolicy.RETAIN)
}

// Managed login (the current Cognito pages, which also walk a new admin through TOTP setup).
// App clients created by CloudFormation need a branding style before the pages work.
const userPool = backend.auth.resources.userPool
const cfnDomain = userPool.node.children
  .map((child) => child.node.defaultChild)
  .find(
    (child): child is CfnResource =>
      child instanceof CfnResource && child.cfnResourceType === 'AWS::Cognito::UserPoolDomain'
  )
if (!cfnDomain) throw new Error('Missing Cognito user pool domain (auth externalProviders)')
cfnDomain.addPropertyOverride('ManagedLoginVersion', 2)
new cognito.CfnManagedLoginBranding(Stack.of(userPool), 'ManagedLoginBranding', {
  userPoolId: cfnUserPool.ref,
  clientId: cfnUserPoolClient.ref,
  useCognitoProvidedValues: true,
})

// ---- Data: backups, TTL for purged comments.
const tables = backend.data.resources.cfnResources.amplifyDynamoDbTables
for (const name of ['Post', 'Comment', 'PostRevision', 'SiteSettings']) {
  const table = tables[name]
  if (!table) continue
  table.pointInTimeRecoveryEnabled = true
  if (isProductionBranch) {
    table.deletionProtectionEnabled = true
    table.applyRemovalPolicy(RemovalPolicy.RETAIN)
  }
}
const commentTable = tables['Comment']
if (commentTable) {
  commentTable.timeToLiveAttribute = { attributeName: 'expiresAt', enabled: true }
}

// ---- API limits. The Amplify clients use the bundled model introspection, not live
// introspection, so it can be off in production.
const { cfnGraphqlApi } = backend.data.resources.cfnResources
cfnGraphqlApi.queryDepthLimit = 10
cfnGraphqlApi.resolverCountLimit = 100
if (isProductionBranch) cfnGraphqlApi.introspectionConfig = 'DISABLED'

const modelTables = backend.data.resources.tables
function modelTable(name: 'Post' | 'Comment' | 'SiteSettings') {
  const table = modelTables[name]
  if (!table) throw new Error(`Missing ${name} table`)
  return table
}
const postTable = modelTable('Post')
const commentModelTable = modelTable('Comment')
const settingsTable = modelTable('SiteSettings')

// ---- Public reader: read-only access to the two tables it serves.
// The model tables are imported references, so `grantReadData` would cover the table
// but not its indexes; grant Query/GetItem on both explicitly.
const readerLambda = backend.publicReader.resources.lambda
for (const [table, envName] of [
  [postTable, 'POST_TABLE'],
  [commentModelTable, 'COMMENT_TABLE'],
] as const) {
  readerLambda.addToRolePolicy(
    new iam.PolicyStatement({
      actions: ['dynamodb:Query', 'dynamodb:GetItem'],
      resources: [table.tableArn, `${table.tableArn}/index/*`],
    })
  )
  backend.publicReader.addEnvironment(envName, table.tableName)
}

// ---- Comment guard: item reads, comment writes, rate-limit counters, admin notifications.
const commentLambda = backend.commentGuard.resources.lambda
const guardStack = Stack.of(commentLambda)
const allow = (actions: string[], table: { tableArn: string }) =>
  commentLambda.addToRolePolicy(new iam.PolicyStatement({ actions, resources: [table.tableArn] }))
allow(['dynamodb:GetItem'], postTable)
allow(['dynamodb:GetItem', 'dynamodb:PutItem'], commentModelTable)
allow(['dynamodb:GetItem'], settingsTable)
backend.commentGuard.addEnvironment('POST_TABLE', postTable.tableName)
backend.commentGuard.addEnvironment('COMMENT_TABLE', commentModelTable.tableName)
backend.commentGuard.addEnvironment('SETTINGS_TABLE', settingsTable.tableName)
// Tokens are only accepted from this backend's own site.
backend.commentGuard.addEnvironment('ALLOWED_HOSTNAMES', new URL(origin).hostname)
backend.commentGuard.addEnvironment('ADMIN_URL', origin)

const rateLimitTable = new dynamodb.Table(guardStack, 'CommentRateLimit', {
  partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: 'expiresAt',
  removalPolicy: RemovalPolicy.DESTROY,
})
rateLimitTable.grant(commentLambda, 'dynamodb:UpdateItem')
backend.commentGuard.addEnvironment('RATE_LIMIT_TABLE', rateLimitTable.tableName)

const commentTopic = new sns.Topic(guardStack, 'CommentNotifications', {
  displayName: 'Blog comments',
})
commentTopic.grantPublish(commentLambda)
backend.commentGuard.addEnvironment('COMMENT_TOPIC_ARN', commentTopic.topicArn)
if (notifyEmail) {
  commentTopic.addSubscription(new subscriptions.EmailSubscription(notifyEmail))
}

// ---- Media: private bucket served through CloudFront with origin access control.
const bucket = backend.storage.resources.bucket
const { cfnBucket } = backend.storage.resources.cfnResources
const mediaStack = Stack.of(bucket)

cfnBucket.publicAccessBlockConfiguration = {
  blockPublicAcls: true,
  blockPublicPolicy: true,
  ignorePublicAcls: true,
  restrictPublicBuckets: true,
}
// The browser only POSTs uploads (presigned by the server); reads go through CloudFront.
cfnBucket.corsConfiguration = {
  corsRules: [
    { allowedMethods: ['POST'], allowedOrigins: [origin], allowedHeaders: ['*'], maxAge: 3000 },
  ],
}
// Deleted or replaced files stay recoverable for 30 days.
cfnBucket.lifecycleConfiguration = {
  rules: [
    {
      id: 'ExpireOldVersions',
      status: 'Enabled',
      noncurrentVersionExpiration: { noncurrentDays: 30 },
      expiredObjectDeleteMarker: true,
      abortIncompleteMultipartUpload: { daysAfterInitiation: 7 },
    },
  ],
}

// Optional custom domain for media (production only), e.g. cdn.mcanvar.dev. Both values come from
// Amplify environment variables: MEDIA_DOMAIN and MEDIA_HOSTED_ZONE_ID (the Route 53 zone of its parent).
const mediaDomain = isProductionBranch ? process.env.MEDIA_DOMAIN?.trim() : undefined
const mediaZoneId = process.env.MEDIA_HOSTED_ZONE_ID?.trim()
const mediaZone =
  mediaDomain && mediaZoneId
    ? route53.HostedZone.fromHostedZoneAttributes(mediaStack, 'MediaZone', {
        hostedZoneId: mediaZoneId,
        zoneName: mediaDomain.split('.').slice(1).join('.'),
      })
    : undefined
const mediaCertificate =
  mediaZone && mediaDomain
    ? new acm.Certificate(mediaStack, 'MediaCertificate', {
        domainName: mediaDomain,
        validation: acm.CertificateValidation.fromDns(mediaZone),
      })
    : undefined

// Media is only ever images; if one is opened directly it gets no script, frame or plugin rights.
const mediaHeaders = new cloudfront.ResponseHeadersPolicy(mediaStack, 'MediaResponseHeaders', {
  comment: 'Blog media security headers',
  securityHeadersBehavior: {
    strictTransportSecurity: { accessControlMaxAge: Duration.days(730), override: true },
    contentTypeOptions: { override: true },
    contentSecurityPolicy: {
      contentSecurityPolicy: "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      override: true,
    },
    frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
    referrerPolicy: {
      referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
      override: true,
    },
  },
})

const mediaCdn = new cloudfront.Distribution(mediaStack, 'MediaCdn', {
  ...(mediaDomain && mediaCertificate
    ? {
        domainNames: [mediaDomain],
        certificate: mediaCertificate,
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      }
    : {}),
  comment: 'Blog media',
  defaultBehavior: {
    origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    responseHeadersPolicy: mediaHeaders,
    allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
    compress: true,
  },
  httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
  priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
})

if (mediaZone && mediaDomain) {
  const target = route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(mediaCdn))
  new route53.ARecord(mediaStack, 'MediaAliasA', {
    zone: mediaZone,
    recordName: mediaDomain,
    target,
  })
  new route53.AaaaRecord(mediaStack, 'MediaAliasAAAA', {
    zone: mediaZone,
    recordName: mediaDomain,
    target,
  })
}

// ---- Production only: alarms. No reserved concurrency: this account's Lambda quota is 50 and
// Lambda keeps all 50 unreserved at that size. After a quota increase (Service Quotas → Lambda →
// Concurrent executions), caps can be set with cfnFunction.reservedConcurrentExecutions.
if (isProductionBranch) {
  const opsTopic = new sns.Topic(guardStack, 'OpsAlarms', { displayName: 'Blog alarms' })
  if (notifyEmail) opsTopic.addSubscription(new subscriptions.EmailSubscription(notifyEmail))
  const alarmAction = new cloudwatchActions.SnsAction(opsTopic)
  const period = Duration.minutes(5)
  const alarm = (id: string, metric: cloudwatch.IMetric, threshold: number, description: string) =>
    new cloudwatch.Alarm(guardStack, id, {
      metric,
      threshold,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: description,
    }).addAlarmAction(alarmAction)

  // Outcomes logged by comment-guard/guard.ts that mean comments are broken, not that a bot failed.
  const guardProblems = new logs.MetricFilter(guardStack, 'CommentGuardProblems', {
    logGroup: (commentLambda as lambda.Function).logGroup,
    filterPattern: logs.FilterPattern.anyTerm('config_invalid', 'verify_error', 'notify_failed'),
    metricNamespace: 'Blog',
    metricName: 'CommentGuardProblems',
    metricValue: '1',
  })
  alarm(
    'CommentGuardProblemsAlarm',
    guardProblems.metric({ statistic: 'Sum', period }),
    1,
    'comment-guard cannot verify comments or send notifications. Check its log for config_invalid, verify_error or notify_failed.'
  )
  alarm(
    'CommentGuardErrors',
    commentLambda.metricErrors({ period }),
    1,
    'comment-guard is throwing errors.'
  )
  alarm(
    'CommentGuardThrottles',
    commentLambda.metricThrottles({ period }),
    1,
    'comment-guard is being throttled (account concurrency limit reached; possible flood).'
  )
  alarm(
    'PublicReaderErrors',
    readerLambda.metricErrors({ period }),
    3,
    'public-reader is throwing errors; pages may fail to refresh.'
  )
  alarm(
    'PublicReaderThrottles',
    readerLambda.metricThrottles({ period }),
    5,
    'public-reader is being throttled (account concurrency limit reached; possible read flood).'
  )
  alarm(
    'AppSyncServerErrors',
    new cloudwatch.Metric({
      namespace: 'AWS/AppSync',
      metricName: '5XXError',
      dimensionsMap: { GraphQLAPIId: backend.data.resources.graphqlApi.apiId },
      statistic: 'Sum',
      period,
    }),
    5,
    'The data API is returning server errors.'
  )
  for (const [id, table, metricName] of [
    ['PostReadThrottles', postTable, 'ReadThrottleEvents'],
    ['CommentWriteThrottles', commentModelTable, 'WriteThrottleEvents'],
  ] as const) {
    alarm(
      id,
      new cloudwatch.Metric({
        namespace: 'AWS/DynamoDB',
        metricName,
        dimensionsMap: { TableName: table.tableName },
        statistic: 'Sum',
        period,
      }),
      1,
      `DynamoDB is throttling ${metricName === 'ReadThrottleEvents' ? 'reads' : 'writes'}.`
    )
  }
}

backend.addOutput({
  custom: {
    mediaBaseUrl:
      mediaZone && mediaDomain
        ? `https://${mediaDomain}`
        : `https://${mediaCdn.distributionDomainName}`,
  },
})

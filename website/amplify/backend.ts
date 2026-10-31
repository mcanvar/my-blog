import { defineBackend } from '@aws-amplify/backend'
import { RemovalPolicy, Stack } from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { commentGuard } from './functions/comment-guard/resource'
import { publicReader } from './functions/public-reader/resource'
import { storage } from './storage/resource'

const backend = defineBackend({ auth, data, storage, commentGuard, publicReader })

// The production branch keeps its data even if the stack is deleted.
const isProductionBranch = process.env.AWS_BRANCH === 'main'

// ---- Auth: admins are created by hand; nobody can sign up.
backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
}

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

// ---- Public reader: read-only access to the two tables it serves.
// The model tables are imported references, so `grantReadData` would cover the table
// but not its indexes; grant Query/GetItem on both explicitly.
const modelTables = backend.data.resources.tables
const readerLambda = backend.publicReader.resources.lambda
for (const [name, envName] of [
  ['Post', 'POST_TABLE'],
  ['Comment', 'COMMENT_TABLE'],
] as const) {
  const table = modelTables[name]
  if (!table) throw new Error(`Missing ${name} table`)
  readerLambda.addToRolePolicy(
    new iam.PolicyStatement({
      actions: ['dynamodb:Query', 'dynamodb:GetItem'],
      resources: [table.tableArn, `${table.tableArn}/index/*`],
    })
  )
  backend.publicReader.addEnvironment(envName, table.tableName)
}

// ---- Media: private bucket served through CloudFront with origin access control.
const bucket = backend.storage.resources.bucket
const mediaStack = Stack.of(bucket)

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

const mediaCdn = new cloudfront.Distribution(mediaStack, 'MediaCdn', {
  ...(mediaDomain && mediaCertificate
    ? { domainNames: [mediaDomain], certificate: mediaCertificate }
    : {}),
  comment: 'Blog media',
  defaultBehavior: {
    origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
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

// ---- Comment guard: rate-limit counters and admin notifications.
const commentLambda = backend.commentGuard.resources.lambda
const guardStack = Stack.of(commentLambda)

const rateLimitTable = new dynamodb.Table(guardStack, 'CommentRateLimit', {
  partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: 'expiresAt',
  removalPolicy: RemovalPolicy.DESTROY,
})
rateLimitTable.grantReadWriteData(commentLambda)
backend.commentGuard.addEnvironment('RATE_LIMIT_TABLE', rateLimitTable.tableName)

const commentTopic = new sns.Topic(guardStack, 'CommentNotifications', {
  displayName: 'Blog comments',
})
commentTopic.grantPublish(commentLambda)
backend.commentGuard.addEnvironment('COMMENT_TOPIC_ARN', commentTopic.topicArn)

// The address comes from the build environment (Amplify console / your shell), never the repo.
const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL
if (notifyEmail) {
  commentTopic.addSubscription(new subscriptions.EmailSubscription(notifyEmail))
}

backend.addOutput({
  custom: {
    mediaBaseUrl:
      mediaZone && mediaDomain
        ? `https://${mediaDomain}`
        : `https://${mediaCdn.distributionDomainName}`,
  },
})

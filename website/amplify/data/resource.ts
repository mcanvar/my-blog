import { a, defineData, type ClientSchema } from '@aws-amplify/backend'
import { commentGuard } from '../functions/comment-guard/resource'
import { publicReader } from '../functions/public-reader/resource'

/**
 * Access model
 * - Models (Post, Comment, PostRevision): ADMINS group only.
 * - Visitors (identity pool guest role) only reach the custom queries below,
 *   served by the public-reader Lambda, which returns PUBLISHED posts with publishedAt <= now and APPROVED
 *   comments. Drafts, scheduled posts and pending comments never leave the API.
 * - submitComment runs the comment-guard Lambda (the only writer besides admins).
 *
 * Fields used as index keys are plain strings (locale, comment status).
 */
const schema = a
  .schema({
    PostStatus: a.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']),

    PostCover: a.customType({
      key: a.string().required(),
      alt: a.string().required(),
      width: a.integer(),
      height: a.integer(),
    }),
    FaqItem: a.customType({
      q: a.string().required(),
      a: a.string().required(),
    }),
    SourceLink: a.customType({
      title: a.string().required(),
      url: a.string().required(),
    }),

    Post: a
      .model({
        translationKey: a.string().required(),
        locale: a.string().required(),
        slug: a.string().required(),
        title: a.string().required(),
        seoTitle: a.string(),
        description: a.string().required(),
        tldr: a.string().array(),
        keyTakeaways: a.string().array(),
        content: a.string().required(),
        legacyHtml: a.string(),
        status: a.ref('PostStatus').required(),
        needsReview: a.boolean(),
        publishedAt: a.datetime(),
        tags: a.string().array(),
        cover: a.ref('PostCover'),
        faq: a.ref('FaqItem').array(),
        sources: a.ref('SourceLink').array(),
        readingMinutes: a.integer(),
        wordCount: a.integer(),
        noindex: a.boolean(),
        canonicalUrl: a.string(),
        commentsEnabled: a.boolean(),
        createdAt: a.datetime(),
        updatedAt: a.datetime(),
      })
      .secondaryIndexes((index) => [
        index('locale').sortKeys(['publishedAt']).name('byLocale').queryField('listPostsByLocale'),
        index('slug').sortKeys(['locale']).name('bySlug').queryField('listPostsBySlug'),
        index('translationKey').name('byTranslationKey').queryField('listPostsByTranslationKey'),
      ])
      .authorization((allow) => [allow.group('ADMINS')]),

    Comment: a
      .model({
        postId: a.id().required(),
        postSlug: a.string(),
        postLocale: a.string(),
        postTitle: a.string(),
        parentId: a.id(),
        authorName: a.string().required(),
        body: a.string().required(),
        status: a.string().required(),
        isAuthorReply: a.boolean(),
        recaptchaScore: a.float(),
        ipHash: a.string(),
        moderatedAt: a.datetime(),
        expiresAt: a.integer(),
        createdAt: a.datetime(),
      })
      .secondaryIndexes((index) => [
        index('postId').sortKeys(['createdAt']).name('byPost').queryField('listCommentsByPost'),
        index('status').sortKeys(['createdAt']).name('byStatus').queryField('listCommentsByStatus'),
      ])
      .authorization((allow) => [allow.group('ADMINS')]),

    PostRevision: a
      .model({
        postId: a.id().required(),
        snapshot: a.json().required(),
        note: a.string(),
        createdAt: a.datetime(),
      })
      .secondaryIndexes((index) => [
        index('postId').sortKeys(['createdAt']).name('byPost').queryField('listRevisionsByPost'),
      ])
      .authorization((allow) => [allow.group('ADMINS')]),

    SiteSettings: a
      .model({
        authorName: a.string(),
        authorJobTitle: a.string(),
        bioTr: a.string(),
        bioEn: a.string(),
        avatarUrl: a.string(),
        sameAs: a.string().array(),
        knowsAbout: a.string().array(),
        commentsEnabled: a.boolean(),
        commentsAutoCloseDays: a.integer(),
        recaptchaThreshold: a.float(),
        blockedCrawlers: a.string().array(),
      })
      .authorization((allow) => [allow.group('ADMINS'), allow.guest().to(['read'])]),

    // ---- Public read shapes (custom types carry the auth of the query that returns them)
    PublicPostSummary: a.customType({
      id: a.id().required(),
      translationKey: a.string().required(),
      locale: a.string().required(),
      slug: a.string().required(),
      title: a.string().required(),
      description: a.string().required(),
      tags: a.string().array(),
      cover: a.ref('PostCover'),
      publishedAt: a.datetime(),
      updatedAt: a.datetime(),
      readingMinutes: a.integer(),
    }),
    PublicPostSummaryPage: a.customType({
      items: a.ref('PublicPostSummary').array(),
      nextToken: a.string(),
    }),
    PublicPost: a.customType({
      id: a.id().required(),
      translationKey: a.string().required(),
      locale: a.string().required(),
      slug: a.string().required(),
      title: a.string().required(),
      seoTitle: a.string(),
      description: a.string().required(),
      tldr: a.string().array(),
      keyTakeaways: a.string().array(),
      content: a.string().required(),
      tags: a.string().array(),
      cover: a.ref('PostCover'),
      faq: a.ref('FaqItem').array(),
      sources: a.ref('SourceLink').array(),
      readingMinutes: a.integer(),
      wordCount: a.integer(),
      noindex: a.boolean(),
      canonicalUrl: a.string(),
      commentsEnabled: a.boolean(),
      publishedAt: a.datetime(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    }),
    PublicComment: a.customType({
      id: a.id().required(),
      postId: a.id().required(),
      parentId: a.id(),
      authorName: a.string().required(),
      body: a.string().required(),
      createdAt: a.datetime(),
      isAuthorReply: a.boolean(),
    }),
    SubmitCommentResult: a.customType({
      ok: a.boolean().required(),
      code: a.string(),
    }),

    listPublishedPosts: a
      .query()
      .arguments({ locale: a.string().required(), limit: a.integer(), nextToken: a.string() })
      .returns(a.ref('PublicPostSummaryPage'))
      .authorization((allow) => [allow.guest(), allow.group('ADMINS')])
      .handler(a.handler.function(publicReader)),

    getPublishedPost: a
      .query()
      .arguments({ locale: a.string().required(), slug: a.string().required() })
      .returns(a.ref('PublicPost'))
      .authorization((allow) => [allow.guest(), allow.group('ADMINS')])
      .handler(a.handler.function(publicReader)),

    listApprovedComments: a
      .query()
      .arguments({ postId: a.id().required() })
      .returns(a.ref('PublicComment').array())
      .authorization((allow) => [allow.guest(), allow.group('ADMINS')])
      .handler(a.handler.function(publicReader)),

    submitComment: a
      .mutation()
      .arguments({
        postId: a.id().required(),
        parentId: a.id(),
        authorName: a.string().required(),
        body: a.string().required(),
        recaptchaToken: a.string().required(),
        honeypot: a.string(),
        elapsedMs: a.integer(),
      })
      .returns(a.ref('SubmitCommentResult'))
      .authorization((allow) => [allow.guest()])
      .handler(a.handler.function(commentGuard)),
  })
  .authorization((allow) => [allow.resource(commentGuard)])

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})

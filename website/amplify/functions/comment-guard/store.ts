import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { GuardConfig } from './config'

export interface PostRecord {
  id: string
  slug: string
  locale: string
  title: string
  status: string
  publishedAt?: string | null
  commentsEnabled?: boolean | null
}

export interface ParentRecord {
  id: string
  postId: string
  status: string
  parentId?: string | null
}

export interface SettingsRecord {
  authorName?: string | null
  commentsEnabled?: boolean | null
  commentsAutoCloseDays?: number | null
  recaptchaThreshold?: number | null
}

export interface NewComment {
  postId: string
  postSlug: string
  postLocale: string
  postTitle: string
  parentId: string | null
  authorName: string
  body: string
  status: 'PENDING' | 'SPAM'
  recaptchaScore: number
  ipHash: string
  expiresAt: number | null
}

export interface CommentStore {
  getPost(id: string): Promise<PostRecord | null>
  getComment(id: string): Promise<ParentRecord | null>
  getSettings(): Promise<SettingsRecord | null>
  putComment(comment: NewComment, id: string, now: Date): Promise<void>
}

const SETTINGS_ID = 'site'

/**
 * Reads and writes the model tables directly (no AppSync round trip), with only the item-level
 * permissions granted in backend.ts. Items are shaped like the ones AppSync writes, so the admin
 * API reads them unchanged.
 */
export function dynamoStore(tables: GuardConfig['tables']): CommentStore {
  const documents = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
    marshallOptions: { removeUndefinedValues: true },
  })
  const get = async <T>(table: string, id: string, fields: string[]): Promise<T | null> => {
    const { Item } = await documents.send(
      new GetCommand({
        TableName: table,
        Key: { id },
        ProjectionExpression: fields.map((_, i) => `#f${i}`).join(', '),
        ExpressionAttributeNames: Object.fromEntries(fields.map((f, i) => [`#f${i}`, f])),
      })
    )
    return (Item as T | undefined) ?? null
  }

  return {
    getPost: (id) =>
      get<PostRecord>(tables.post, id, [
        'id',
        'slug',
        'locale',
        'title',
        'status',
        'publishedAt',
        'commentsEnabled',
      ]),
    getComment: (id) =>
      get<ParentRecord>(tables.comment, id, ['id', 'postId', 'status', 'parentId']),
    getSettings: () =>
      get<SettingsRecord>(tables.settings, SETTINGS_ID, [
        'authorName',
        'commentsEnabled',
        'commentsAutoCloseDays',
        'recaptchaThreshold',
      ]),
    async putComment(comment, id, now) {
      const timestamp = now.toISOString()
      await documents.send(
        new PutCommand({
          TableName: tables.comment,
          Item: {
            id,
            __typename: 'Comment',
            ...comment,
            parentId: comment.parentId ?? undefined,
            expiresAt: comment.expiresAt ?? undefined,
            isAuthorReply: false,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
          ConditionExpression: 'attribute_not_exists(id)',
        })
      )
    },
  }
}

import type { QueryCommandInput, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'

export type QueryFn = (
  input: QueryCommandInput
) => Promise<Pick<QueryCommandOutput, 'Items' | 'LastEvaluatedKey'>>

type Item = Record<string, unknown>

export function encodeToken(key: Record<string, unknown> | undefined): string | null {
  return key ? Buffer.from(JSON.stringify(key)).toString('base64url') : null
}

export function decodeToken(token: string | null | undefined): Record<string, unknown> | undefined {
  if (!token) return undefined
  try {
    const parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : undefined
  } catch {
    return undefined
  }
}

/** PUBLISHED, or SCHEDULED whose time has come — either way only once publishedAt has passed. */
export function isLive(item: Item, now: string): boolean {
  return (
    (item.status === 'PUBLISHED' || item.status === 'SCHEDULED') &&
    typeof item.publishedAt === 'string' &&
    item.publishedAt <= now
  )
}

export async function listPublishedPosts(
  query: QueryFn,
  table: string,
  args: { locale: string; limit?: number | null; nextToken?: string | null },
  now = new Date().toISOString()
) {
  const limit = args.limit && args.limit > 0 && args.limit <= 100 ? args.limit : 50
  const result = await query({
    TableName: table,
    IndexName: 'byLocale',
    KeyConditionExpression: '#locale = :locale AND #publishedAt <= :now',
    FilterExpression: '#status IN (:published, :scheduled)',
    ExpressionAttributeNames: {
      '#locale': 'locale',
      '#publishedAt': 'publishedAt',
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':locale': args.locale,
      ':now': now,
      ':published': 'PUBLISHED',
      ':scheduled': 'SCHEDULED',
    },
    ScanIndexForward: false,
    Limit: limit,
    ExclusiveStartKey: decodeToken(args.nextToken),
  })
  return {
    items: (result.Items ?? []).filter((item) => isLive(item, now)),
    nextToken: encodeToken(result.LastEvaluatedKey),
  }
}

export async function getPublishedPost(
  query: QueryFn,
  table: string,
  args: { locale: string; slug: string },
  now = new Date().toISOString()
) {
  const result = await query({
    TableName: table,
    IndexName: 'bySlug',
    KeyConditionExpression: '#slug = :slug AND #locale = :locale',
    ExpressionAttributeNames: { '#slug': 'slug', '#locale': 'locale' },
    ExpressionAttributeValues: { ':slug': args.slug, ':locale': args.locale },
    Limit: 10,
  })
  return (result.Items ?? []).find((item) => isLive(item, now)) ?? null
}

export async function listApprovedComments(
  query: QueryFn,
  table: string,
  args: { postId: string }
) {
  const items: Item[] = []
  let startKey: Record<string, unknown> | undefined
  do {
    const result = await query({
      TableName: table,
      IndexName: 'byPost',
      KeyConditionExpression: '#postId = :postId',
      FilterExpression: '#status = :approved',
      ExpressionAttributeNames: { '#postId': 'postId', '#status': 'status' },
      ExpressionAttributeValues: { ':postId': args.postId, ':approved': 'APPROVED' },
      ScanIndexForward: true,
      ExclusiveStartKey: startKey,
    })
    items.push(...(result.Items ?? []).filter((item) => item.status === 'APPROVED'))
    startKey = result.LastEvaluatedKey
  } while (startKey && items.length < 1000)
  return items
}

/**
 * Amplify Gen 2 invokes function handlers with `{ typeName, fieldName, arguments, identity, ... }`
 * (fieldName at the top level, not under `info` like a plain AppSync Lambda resolver).
 */
export interface PublicReaderEvent {
  fieldName?: string
  info?: { fieldName?: string }
  arguments?: Record<string, unknown>
}

export async function routePublicQuery(
  event: PublicReaderEvent,
  query: QueryFn,
  tables: { post: string; comment: string }
) {
  const args = event.arguments ?? {}
  const fieldName = event.fieldName ?? event.info?.fieldName
  switch (fieldName) {
    case 'listPublishedPosts':
      return listPublishedPosts(query, tables.post, {
        locale: String(args.locale),
        limit: typeof args.limit === 'number' ? args.limit : null,
        nextToken: typeof args.nextToken === 'string' ? args.nextToken : null,
      })
    case 'getPublishedPost':
      return getPublishedPost(query, tables.post, {
        locale: String(args.locale),
        slug: String(args.slug),
      })
    case 'listApprovedComments':
      return listApprovedComments(query, tables.comment, { postId: String(args.postId) })
    default:
      throw new Error(`Unknown field ${fieldName ?? '(none)'}`)
  }
}

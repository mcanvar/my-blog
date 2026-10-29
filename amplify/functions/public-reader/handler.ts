import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, type QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import type { AppSyncResolverEvent } from 'aws-lambda'
import { getPublishedPost, listApprovedComments, listPublishedPosts } from './queries'

const documents = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const query = (input: QueryCommandInput) => documents.send(new QueryCommand(input))

function table(name: 'POST_TABLE' | 'COMMENT_TABLE'): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

type Args = Record<string, unknown>

export const handler = async (event: AppSyncResolverEvent<Args>) => {
  const args = event.arguments
  switch (event.info.fieldName) {
    case 'listPublishedPosts':
      return listPublishedPosts(query, table('POST_TABLE'), {
        locale: String(args.locale),
        limit: typeof args.limit === 'number' ? args.limit : null,
        nextToken: typeof args.nextToken === 'string' ? args.nextToken : null,
      })
    case 'getPublishedPost':
      return getPublishedPost(query, table('POST_TABLE'), {
        locale: String(args.locale),
        slug: String(args.slug),
      })
    case 'listApprovedComments':
      return listApprovedComments(query, table('COMMENT_TABLE'), { postId: String(args.postId) })
    default:
      throw new Error(`Unknown field ${event.info.fieldName}`)
  }
}

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, type QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { routePublicQuery, type PublicReaderEvent } from './queries'

const documents = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const query = (input: QueryCommandInput) => documents.send(new QueryCommand(input))

function tables() {
  const post = process.env.POST_TABLE
  const comment = process.env.COMMENT_TABLE
  if (!post || !comment) throw new Error('POST_TABLE / COMMENT_TABLE are not configured')
  return { post, comment }
}

export const handler = async (event: PublicReaderEvent) => routePublicQuery(event, query, tables())

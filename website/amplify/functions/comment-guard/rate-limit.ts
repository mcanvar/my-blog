import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'

const dynamo = new DynamoDBClient({})

export const RATE_WINDOWS = [
  { name: '10m', seconds: 600, max: 3 },
  { name: '1d', seconds: 86_400, max: 10 },
] as const

/** Fixed-window counters keyed by the hashed IP; rows expire through DynamoDB TTL. */
export async function consumeRateLimit(key: string, now = Date.now()): Promise<boolean> {
  const table = process.env.RATE_LIMIT_TABLE
  if (!table) return true

  for (const window of RATE_WINDOWS) {
    const bucket = Math.floor(now / 1000 / window.seconds)
    const result = await dynamo.send(
      new UpdateItemCommand({
        TableName: table,
        Key: { pk: { S: `${key}#${window.name}#${bucket}` } },
        UpdateExpression: 'ADD hits :one SET expiresAt = if_not_exists(expiresAt, :exp)',
        ExpressionAttributeValues: {
          ':one': { N: '1' },
          ':exp': { N: String((bucket + 1) * window.seconds + 60) },
        },
        ReturnValues: 'UPDATED_NEW',
      })
    )
    if (Number(result.Attributes?.hits?.N ?? '0') > window.max) return false
  }
  return true
}

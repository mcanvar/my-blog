import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'

const dynamo = new DynamoDBClient({})

export interface RateWindow {
  name: string
  seconds: number
  max: number
}

/** Per visitor, keyed by the hashed IP. */
export const IP_WINDOWS: RateWindow[] = [
  { name: '10m', seconds: 600, max: 3 },
  { name: '1d', seconds: 86_400, max: 10 },
]

/** Site-wide ceiling: bounds cost and notification volume when many IPs are used at once. */
export const GLOBAL_WINDOWS: RateWindow[] = [{ name: '1h', seconds: 3_600, max: 60 }]

/** Fixed-window counters; rows expire through DynamoDB TTL. */
export async function consumeRateLimit(
  table: string,
  key: string,
  windows: RateWindow[],
  now = Date.now()
): Promise<boolean> {
  for (const window of windows) {
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

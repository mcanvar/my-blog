import { randomUUID } from 'node:crypto'
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import type { Schema } from '../../data/resource'
import { readConfig } from './config'
import { createCommentGuard, type GuardLog } from './guard'
import { consumeRateLimit, GLOBAL_WINDOWS, IP_WINDOWS } from './rate-limit'
import { dynamoStore } from './store'
import { verifyHuman } from './verify-human'

const sns = new SNSClient({})

const log: GuardLog = (entry) => {
  console.log(JSON.stringify({ source: 'comment-guard', ...entry }))
}

let guard: ReturnType<typeof createCommentGuard> | null = null

function build() {
  return createCommentGuard(
    readConfig(process.env),
    (config) => ({
      store: dynamoStore(config.tables),
      verify: (input) => verifyHuman(config.recaptcha, input),
      consumeIpLimit: (ipHash) => consumeRateLimit(config.tables.rateLimit, ipHash, IP_WINDOWS),
      consumeGlobalLimit: () => consumeRateLimit(config.tables.rateLimit, 'global', GLOBAL_WINDOWS),
      async notify(subject, message) {
        if (!config.topicArn) return
        try {
          await sns.send(
            new PublishCommand({ TopicArn: config.topicArn, Subject: subject, Message: message })
          )
        } catch (error) {
          log({ outcome: 'notify_failed', error: error instanceof Error ? error.name : 'unknown' })
        }
      },
      now: () => new Date(),
      newId: randomUUID,
    }),
    log
  )
}

export const handler: Schema['submitComment']['functionHandler'] = async (event) => {
  // Built on the first request: Amplify resolves the secrets into process.env at cold start.
  guard ??= build()
  return guard(event)
}

/**
 * Copies the old Amplify Gen 1 blog data (Paris, eu-west-3) into the Gen 2 tables (us-east-1).
 *
 * Uses your local AWS credentials (e.g. `aws sso login` / AWS_PROFILE). Nothing secret is read
 * from or written to the repo. Re-runnable: items are written by id (PutItem semantics).
 *
 *   npm run migrate -- \
 *     --src-post-table Post-xxxx-dev --src-comment-table Comment-xxxx-dev \
 *     --dst-post-table Post-yyyy-NONE --dst-comment-table Comment-yyyy-NONE \
 *     [--src-region eu-west-3] [--dst-region us-east-1] [--translations scripts/translations.json] [--dry-run]
 *
 * Find the destination table names in the DynamoDB console (us-east-1) after `npx ampx sandbox`
 * or the first branch deploy.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { BatchWriteCommand, DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import {
  transformComment,
  transformPost,
  type Gen1Comment,
  type Gen1Post,
  type MigrationWarning,
} from './lib/transform'

const { values: args } = parseArgs({
  options: {
    'src-region': { type: 'string', default: 'eu-west-3' },
    'dst-region': { type: 'string', default: 'us-east-1' },
    'src-post-table': { type: 'string' },
    'src-comment-table': { type: 'string' },
    'dst-post-table': { type: 'string' },
    'dst-comment-table': { type: 'string' },
    translations: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
})

function required(name: keyof typeof args): string {
  const value = args[name]
  if (typeof value !== 'string' || !value) {
    console.error(`Missing --${name}`)
    process.exit(1)
  }
  return value
}

async function scanAll<T>(client: DynamoDBDocumentClient, table: string): Promise<T[]> {
  const items: T[] = []
  let ExclusiveStartKey: Record<string, unknown> | undefined
  do {
    const page = await client.send(new ScanCommand({ TableName: table, ExclusiveStartKey }))
    items.push(...((page.Items ?? []) as T[]))
    ExclusiveStartKey = page.LastEvaluatedKey
  } while (ExclusiveStartKey)
  return items
}

async function writeAll(
  client: DynamoDBDocumentClient,
  table: string,
  items: Record<string, unknown>[]
) {
  for (let i = 0; i < items.length; i += 25) {
    let requests = items.slice(i, i + 25).map((Item) => ({ PutRequest: { Item } }))
    for (let attempt = 0; requests.length && attempt < 6; attempt++) {
      const result = await client.send(
        new BatchWriteCommand({ RequestItems: { [table]: requests } })
      )
      requests = (result.UnprocessedItems?.[table] ?? []) as typeof requests
      if (requests.length) await new Promise((r) => setTimeout(r, 200 * 2 ** attempt))
    }
    if (requests.length) throw new Error(`Could not write ${requests.length} items to ${table}`)
  }
}

async function main() {
  const dryRun = args['dry-run']
  const srcPostTable = required('src-post-table')
  const srcCommentTable = args['src-comment-table']
  const dstPostTable = dryRun ? (args['dst-post-table'] ?? '(dry-run)') : required('dst-post-table')
  const dstCommentTable = args['dst-comment-table']

  const translations: Record<string, string> =
    args.translations && existsSync(args.translations)
      ? JSON.parse(readFileSync(args.translations, 'utf8'))
      : {}

  const source = DynamoDBDocumentClient.from(new DynamoDBClient({ region: args['src-region'] }))
  const target = DynamoDBDocumentClient.from(new DynamoDBClient({ region: args['dst-region'] }), {
    marshallOptions: { removeUndefinedValues: true },
  })

  console.log(`Scanning ${srcPostTable} (${args['src-region']})…`)
  const oldPosts = await scanAll<Gen1Post>(source, srcPostTable)
  const oldComments = srcCommentTable ? await scanAll<Gen1Comment>(source, srcCommentTable) : []

  const warnings: MigrationWarning[] = []
  const posts = oldPosts.map((item) => transformPost(item, translations, warnings))
  const slugKeys = new Set<string>()
  for (const post of posts) {
    const key = `${post.locale}:${post.slug}`
    if (slugKeys.has(key)) warnings.push({ id: String(post.id), message: `duplicate slug ${key}` })
    slugKeys.add(key)
  }
  const postsById = new Map(posts.map((p) => [String(p.id), p]))
  const comments = oldComments
    .map((item) => transformComment(item, postsById, warnings))
    .filter((c): c is Record<string, unknown> => c !== null)

  const reportDir = join(process.cwd(), 'scripts', 'reports')
  mkdirSync(reportDir, { recursive: true })
  const reportPath = join(
    reportDir,
    `migration-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  )
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        dryRun,
        source: {
          region: args['src-region'],
          posts: oldPosts.length,
          comments: oldComments.length,
        },
        target: {
          region: args['dst-region'],
          postTable: dstPostTable,
          commentTable: dstCommentTable ?? null,
        },
        converted: { posts: posts.length, comments: comments.length },
        warnings,
        posts: posts.map((p) => ({
          id: p.id,
          locale: p.locale,
          slug: p.slug,
          title: p.title,
          words: p.wordCount,
        })),
      },
      null,
      2
    )
  )

  console.log(
    `Posts: ${posts.length} · Comments: ${comments.length} · Warnings: ${warnings.length}`
  )
  console.log(`Report: ${reportPath}`)

  if (dryRun) {
    console.log('Dry run: nothing written.')
    return
  }

  await writeAll(target, dstPostTable, posts)
  if (dstCommentTable && comments.length) await writeAll(target, dstCommentTable, comments)
  console.log('Done. Review migrated posts in /admin/posts (filter: Needs review).')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

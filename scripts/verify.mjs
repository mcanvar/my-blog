#!/usr/bin/env node
/**
 * Runs locally what the Amplify build runs, so problems surface before a paid build.
 *
 *   npm run verify          lock file (npm 10, like Amplify), lint, types, unit tests,
 *                           backend synth (CDK, offline), production build with fixtures
 *   npm run verify:cloud    the above, plus a production build against the deployed `main`
 *                           backend (needs AWS credentials) — catches IAM, Lambda and runtime issues
 */
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const APP_ID = 'd2t7x467vn3ah1'
const BRANCH = 'main'
const AMPLIFY_NPM = '10.9.9' // npm bundled with the Node 22 used by amplify.yml
const cloud = process.argv.includes('--cloud')

const steps = []
function step(name, command, env = {}) {
  steps.push({ name, command, env })
}

step(
  `lock file accepted by npm ${AMPLIFY_NPM}`,
  `npx -y npm@${AMPLIFY_NPM} ci --dry-run --ignore-scripts --no-audit --no-fund`
)
step('lint', 'npm run lint --silent')
step('typecheck', 'npm run typecheck --silent')
step('unit tests', 'npx vitest run')
step(
  'backend synth (CDK)',
  `npx --yes aws-cdk@2 synth --quiet --app "npx tsx amplify/backend.ts" --output ${join(tmpdir(), 'blog-cdk-verify')} ` +
    '--context amplify-backend-namespace=verify --context amplify-backend-name=verify --context amplify-backend-type=sandbox',
  { AWS_REGION: 'us-east-1', CDK_DEFAULT_REGION: 'us-east-1', CDK_DEFAULT_ACCOUNT: '123456789012' }
)
step('production build (fixtures)', 'npx next build', {
  BLOG_DATA_SOURCE: 'fixtures',
  NEXT_TELEMETRY_DISABLED: '1',
})

function run({ name, command, env }) {
  const started = Date.now()
  process.stdout.write(`▶ ${name} … `)
  try {
    execSync(command, {
      stdio: 'pipe',
      env: { ...process.env, ...env },
      maxBuffer: 64 * 1024 * 1024,
    })
    console.log(`ok (${((Date.now() - started) / 1000).toFixed(0)}s)`)
  } catch (error) {
    console.log('FAILED\n')
    console.log(String(error.stdout ?? '').slice(-6000))
    console.log(String(error.stderr ?? '').slice(-6000))
    throw new Error(`${name} failed`)
  }
}

function cloudBuild() {
  const outputs = 'amplify_outputs.json'
  const backup = join(mkdtempSync(join(tmpdir(), 'blog-outputs-')), outputs)
  if (existsSync(outputs)) copyFileSync(outputs, backup)
  try {
    run({
      name: `fetch outputs of the deployed ${BRANCH} backend`,
      command: `npx ampx generate outputs --app-id ${APP_ID} --branch ${BRANCH} --out-dir .`,
      env: { AWS_REGION: 'us-east-1' },
    })
    rmSync('.next', { recursive: true, force: true })
    run({
      name: 'production build (real backend)',
      command: 'npx next build',
      env: { NEXT_TELEMETRY_DISABLED: '1' },
    })
  } finally {
    if (existsSync(backup)) copyFileSync(backup, outputs)
    rmSync('.next', { recursive: true, force: true })
  }
}

try {
  for (const s of steps) run(s)
  if (cloud) cloudBuild()
  console.log(`\n✔ verify${cloud ? ':cloud' : ''} passed — safe to push`)
} catch (error) {
  console.error(`\n✖ ${error.message}. Fix it before pushing to main.`)
  process.exit(1)
}

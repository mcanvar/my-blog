# mcanvar.dev

Personal, bilingual (Turkish / English) blog of Mevlüt Canvar.

- **Next.js 16** (App Router, React 19, React Compiler) · **Tailwind CSS 4** · TypeScript
- **AWS Amplify Gen 2** in **us-east-1**: Cognito (admin only, MFA), AppSync + DynamoDB, S3 + CloudFront for media, Lambda for public reads and comment moderation
- Design: **“Patika” (trail)** — a horizontal, infinite homepage on every screen size, posts as stops, years as mile markers
- Built for **SEO and GEO**: JSON-LD everywhere, hreflang, sitemap, RSS/JSON Feed, `llms.txt`, a Markdown copy of every post, IndexNow

> The repository is public. **No secrets, keys or account identifiers belong in it.** See [Configuration & secrets](#configuration--secrets).

---

## Architecture

```
Browser ──► CloudFront (Amplify Hosting)
              ├─ static/ISR pages (home, posts, tags, archive, feeds, sitemap)
              └─ Next.js server ──► AppSync ──► public-reader λ ──► DynamoDB (Post, Comment)
                                      ▲    └─► model resolvers  ──► DynamoDB (admin)
Browser comment form ─ submitComment ─┘──► comment-guard λ ──► reCAPTCHA · rate limit · SNS email
/admin (Cognito, ADMINS group, TOTP MFA) ── Server Actions ──► AppSync (userPool)
Media: S3 (private) ──► CloudFront (origin access control)
```

**Who can read what**

| Data            | Visitors (guest IAM)                                                                                                 | Admin (ADMINS group)            |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Posts           | Only via `listPublishedPosts` / `getPublishedPost`: status `PUBLISHED` (or `SCHEDULED`) **and** `publishedAt <= now` | Everything                      |
| Comments        | Only via `listApprovedComments`: `APPROVED`                                                                          | Everything, moderation          |
| Write a comment | `submitComment` → comment-guard Lambda → stored as `PENDING`                                                         | Approve / reject / spam / reply |
| Site settings   | Read                                                                                                                 | Read / write                    |

Public pages never read cookies, so they stay statically generated and refresh on a timer
(posts 60 s, lists 120 s, feeds/sitemap 300 s). Amplify Hosting does not support on-demand ISR,
so **a published change is live within about a minute**.

## Project structure

```
amplify/                    Gen 2 backend (TypeScript)
  backend.ts                CDK overrides: no self sign-up, PITR/TTL, media CDN, rate-limit table, SNS
  auth/  data/  storage/    Cognito, schema + auth rules, S3
  functions/public-reader   guest read queries (published posts, approved comments)
  functions/comment-guard   validation, reCAPTCHA, rate limit, PENDING, notification
src/
  app/[locale]/             public site (TR at /, EN at /en)
  app/admin/                admin (own root layout, noindex, nonce CSP)
  app/api/                  trail pages, search index, .md export, OG images, draft mode
  app/sitemap.ts robots.ts manifest.ts llms.txt/ llms-full.txt/
  proxy.ts                  locale routing, .md rewrites, admin guard + CSP
  components/               site, trail, post, comments, admin, seo
  lib/                      data layer, content pipeline, SEO/GEO builders, i18n helpers
messages/                   UI strings (tr.json, en.json)
scripts/                    migration from the old Gen 1 tables
e2e/                        Playwright tests (fixtures)
```

## Local development

Requirements: Node 22+, npm.

```bash
npm install
npm run dev:fixtures      # in-memory sample content, no AWS needed → http://localhost:3000
```

With fixtures in `next dev`, `/admin` skips sign-in so you can try the editor. That bypass does not
exist in production builds.

### Against a real backend (your own sandbox in us-east-1)

```bash
# one-time: the secrets the comment Lambda needs (values are stored in SSM, not in the repo)
npx ampx sandbox secret set RECAPTCHA_SITE_KEY
npx ampx sandbox secret set RECAPTCHA_PROJECT_ID
npx ampx sandbox secret set RECAPTCHA_API_KEY
npx ampx sandbox secret set IP_HASH_SALT          # e.g. `openssl rand -hex 32`

AWS_REGION=us-east-1 npx ampx sandbox --profile <your-profile>   # writes amplify_outputs.json
npm run dev                                                       # in another terminal
```

`amplify_outputs.json` is generated per environment and gitignored. Before a backend exists,
`npm run dev/build/test` writes a placeholder automatically.

### Checks

```bash
npm run lint
npm run typecheck        # app + amplify backend
npm test                 # unit tests (Vitest)
npm run test:e2e         # Playwright against fixtures
BLOG_DATA_SOURCE=fixtures npm run build
```

## Configuration & secrets

Nothing below is committed. `.env.example` lists the names only.

| Name                                                                                               | Where to set it                          | Used by                                                           |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| `RECAPTCHA_SITE_KEY`                                                                               | Amplify **Secret**                       | comment-guard Lambda                                              |
| `RECAPTCHA_PROJECT_ID`                                                                             | Amplify **Secret**                       | comment-guard Lambda                                              |
| `RECAPTCHA_API_KEY`                                                                                | Amplify **Secret**                       | comment-guard Lambda                                              |
| `IP_HASH_SALT`                                                                                     | Amplify **Secret**                       | comment-guard Lambda (IPs are only stored as HMAC)                |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`                                                                   | Amplify Hosting **environment variable** | comment form (public by design)                                   |
| `NEXT_PUBLIC_SITE_URL`                                                                             | Amplify Hosting env var, **per branch**  | canonical URLs, sitemap, feeds. Production: `https://mcanvar.dev` |
| `ADMIN_NOTIFY_EMAIL`                                                                               | Amplify Hosting env var                  | subscribes this address to new-comment emails (SNS)               |
| `INDEXNOW_KEY`                                                                                     | Amplify Hosting env var                  | IndexNow pings + `/<key>.txt` (e.g. `openssl rand -hex 16`)       |
| `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_BING_VERIFICATION`, `NEXT_PUBLIC_YANDEX_VERIFICATION` | Amplify Hosting env vars (optional)      | search console verification                                       |

Guardrails: `.gitignore` covers `.env*`, `amplify_outputs*` and `.amplify/`; `.githooks/pre-commit`
runs `gitleaks` if installed (`brew install gitleaks`); CI runs a gitleaks scan on every push.
Also enable **secret scanning + push protection** in the GitHub repo settings.

Only the production host (`mcanvar.dev`) is indexable. Preview branches get `noindex`,
a `Disallow: /` robots.txt (when `NEXT_PUBLIC_SITE_URL` points at the preview) and an `X-Robots-Tag`.

## Deploy (Amplify Hosting, us-east-1)

1. **reCAPTCHA** — in Google Cloud, enable the reCAPTCHA Enterprise API and create a **score-based
   website key** for `mcanvar.dev`, `localhost` and `amplifyapp.com`. Create an API key restricted
   to that API. You now have: site key, project id, API key.
2. **Amplify app** — Amplify console in **us-east-1** → _Create new app_ → GitHub → this repo,
   branch `main` (or `v2` first as a preview). The repo's `amplify.yml` deploys the backend
   (`ampx pipeline-deploy`) and builds the site.
3. **Secrets** — Hosting → _Secrets_: add the four secrets from the table above.
4. **Environment variables** — Hosting → _Environment variables_: `NEXT_PUBLIC_SITE_URL`,
   `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `ADMIN_NOTIFY_EMAIL`, `INDEXNOW_KEY` (and verification tokens).
   Redeploy after changing them.
5. **Admin user** — after the first deploy, take the user pool id from the backend outputs
   (Amplify console → Deployed backend resources, or `amplify_outputs.json` → `auth.user_pool_id`):

   ```bash
   aws cognito-idp admin-create-user --region us-east-1 --user-pool-id <pool-id> \
     --username you@example.com \
     --user-attributes Name=email,Value=you@example.com Name=email_verified,Value=true
   aws cognito-idp admin-add-user-to-group --region us-east-1 --user-pool-id <pool-id> \
     --username you@example.com --group-name ADMINS
   ```

   Sign in at `/admin/login` with the emailed temporary password; you will set a new password and
   scan a TOTP QR code (MFA is required).

6. **Comment emails** — confirm the SNS subscription email AWS sends to `ADMIN_NOTIFY_EMAIL`.
7. **Domain (Route 53)** — register `mcanvar.dev` in Route 53 (or, if it is registered elsewhere,
   create a public hosted zone and point the registrar's NS records at it). Then in Amplify → Hosting →
   _Custom domains_ add `mcanvar.dev` (apex + `www`); Amplify creates the records and the certificate
   in the same account. `www` redirects to the apex. `.dev` is HTTPS-only (HSTS preloaded), which
   Amplify's certificate covers.
8. **Search engines** — submit `https://mcanvar.dev/sitemap.xml` in Google Search Console,
   Bing Webmaster Tools and Yandex Webmaster.

## Migrating the old data (Paris → Virginia)

The old Gen 1 app was in `eu-west-3`; its tables (`Post-<apiId>-dev`, `Comment-<apiId>-dev`) survived.

```bash
# 1. Safety first (old region)
aws dynamodb list-tables --region eu-west-3
aws dynamodb update-continuous-backups --region eu-west-3 --table-name Post-<apiId>-dev \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
aws dynamodb create-backup --region eu-west-3 --table-name Post-<apiId>-dev --backup-name pre-migration

# 2. Optional: link TR/EN versions of the same post
cp scripts/translations.example.json scripts/translations.json   # gitignored, edit it

# 3. Dry run → report in scripts/reports/ (gitignored)
npm run migrate -- --src-post-table Post-<apiId>-dev --src-comment-table Comment-<apiId>-dev --dry-run \
  --translations scripts/translations.json

# 4. Real run into the new tables (names from the DynamoDB console, us-east-1)
npm run migrate -- --src-post-table Post-<apiId>-dev --src-comment-table Comment-<apiId>-dev \
  --dst-post-table Post-<newApiId>-NONE --dst-comment-table Comment-<newApiId>-NONE \
  --translations scripts/translations.json
```

What the script does: keeps ids and `createdAt`/`updatedAt`, converts HTML to Markdown (keeps the
original in `legacyHtml`), publishes posts with `needsReview: true`, drops the old `owner` field,
re-queues old comments as `PENDING`, and reports unsafe slugs and external images. It is safe to re-run.
Then open `/admin/posts`, filter **Needs review**, check each post and publish.

After 30 days of stable production, delete the leftovers in `eu-west-3`: the old tables (keep a
backup/export), the `amplify-myblog-dev-*` deployment bucket, IAM roles and stack remnants.

## Writing

- `/admin/posts/new` — Tiptap editor that stores **Markdown**; `/` opens a block menu; drop or paste
  images (resized to WebP and uploaded to S3, alt text asked for).
- Live preview uses the site's renderer. The sidebar has a SERP preview, length meters, slug checks
  and a **SEO/GEO readiness score**; GEO fields: TL;DR, key takeaways, FAQ, sources.
- Drafts autosave. Published posts change only when you press **Update**. Every publish stores a
  revision you can restore. A future date + **Schedule** publishes automatically.
- `EN+` / `TR+` creates the linked translation (shared `translationKey` → hreflang + JSON-LD).
- `/admin/comments` — approve, reject, mark spam, reply (your reply is published immediately).

## SEO & GEO features

- Metadata API: canonical, hreflang (`tr`, `en`, `x-default`), Open Graph article tags, Twitter cards
- Generated social cards (`/api/og/...`) in the site's style
- JSON-LD: `WebSite`, `Person` (one stable `@id`), `Blog`, `BlogPosting` (with translations, citations,
  comments), `BreadcrumbList`, `FAQPage`, `CollectionPage`, `ProfilePage`
- `sitemap.xml` with language alternates and images · `robots.txt` (AI crawlers allowed, configurable)
- RSS 2.0 + JSON Feed per language · IndexNow on publish
- `llms.txt`, `llms-full.txt`, and `/<slug>.md` for every post (with a canonical `Link` header)
- Crawlable pagination (`/sayfa/2`, `/en/page/2`) behind the infinite horizontal homepage
- Self-hosted fonts (Bricolage Grotesque, Literata, JetBrains Mono — Turkish glyphs included),
  AVIF/WebP images, Server Components by default

## Credits

Icons drawn for this site. Fonts under the SIL Open Font License.

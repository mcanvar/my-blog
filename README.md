# my-blog

Source of [mcanvar.dev](https://mcanvar.dev), the personal blog of Mevlüt Canvar.

| Folder | What it is |
|---|---|
| [`website/`](website/README.md) | The blog: Next.js 16 + Tailwind 4 front end and its AWS Amplify Gen 2 backend (us-east-1). Setup, deploy, secrets and migration are documented there. |

At the root: `amplify.yml` (Amplify build, monorepo app root `website`), `.github/workflows/ci.yml` (CI, which also triggers deploys) and `.githooks/` (pre-commit secret scan).

> The repository is public. No secrets, keys or account identifiers belong in it.

## License

The code is under the [MIT License](LICENSE). The bundled font files in `website/src/assets/fonts/`
are under the SIL Open Font License 1.1 (licence texts next to them). The blog's posts and images
live in the site's database and media storage, not in this repository, and are not covered by
this licence.

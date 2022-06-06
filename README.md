# My Amplify Blog
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and developed for personal blog experience.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the pages by modifying `src/pages/.tsx`. The page auto-updates as you edit the file.

If you decide to build your own backend, [API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/foo](http://localhost:3000/api/foo). This endpoint can be edited in `src/pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

So to have idea what APIs you need to build you can check `src/graphql/overrides/*.ts` and `amplify/backend/api/myblog/schema.graphql`.
## Learn More

To learn more about Next.js and Amplify, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Learn Amplify](https://aws.amazon.com/tr/amplify/) - official guide.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on AWS Amplify

This is the source I mostly used while coding: [Host a Next.js SSR app](https://aws.amazon.com/tr/blogs/mobile/host-a-next-js-ssr-app-with-real-time-data-on-aws-amplify/)

Check out [Next.js focused docs](https://docs.amplify.aws/start/q/integration/next/) for more details.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Credits for used project packages
Icons powered by [Forge Icons](https://icons.theforgesmith.com).

## Why?
__"Why do you prefer implementing language support manually instead of using official i18n?"__
I read that the package not yet supoorted so if I find a way of course, I will implement directly.
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { GraphQLQuery } from '@aws-amplify/api'
import { withSSRContext } from 'aws-amplify'
import { listPosts } from '../graphql/queries'
import { ListPostsQuery, Post } from '../API'
import { ReactElement } from 'react'
import { useRouter } from 'next/router'

const PostPage: NextPage = (): ReactElement => {
  const router = useRouter()
  const { slug } = router.query

  return (
    <div className="flex flex-col h-screen justify-around gap-2 w-full">
      <h1 className="h-2/12 text-3xl font-bold mt-2 place-self-center">
        Selam 👋
      </h1>
      <div className="h-10/12 p-4">{slug}</div>
    </div>
  )
}

export default PostPage

export const getStaticPaths: GetStaticPaths = async () => {
  const SSR = withSSRContext()

  const posts: GraphQLQuery<any> = await SSR.API.graphql({
    query: listPosts,
  })

  if (posts.data as ListPostsQuery) {
    const paths = posts.data.listPosts.items.map((post: Post) => ({
      params: { slug: post.slug },
    }))

    return {
      paths,
      fallback: 'blocking',
    }
  }

  throw new Error('Posts fetching for getStaticPaths failed!')
}

export const getStaticProps: GetStaticProps = async ({ params: slug }) => {
  const SSR = withSSRContext()

  const post: GraphQLQuery<any> = await SSR.API.graphql({
    query: listPosts,
    filter: { slug: { eq: slug } },
  })

  if (post.data as ListPostsQuery) {
    return {
      props: {
        post: post.data.listPosts.items[0] as Post,
      },
      revalidate: 10,
    }
  }

  throw new Error('Post fetching for GetStaticProps failed! Slug:' + slug)
}

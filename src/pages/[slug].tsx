import { GetStaticPaths, GetStaticProps } from 'next'
import { GraphQLQuery } from '@aws-amplify/api'
import { graphqlOperation, withSSRContext } from 'aws-amplify'
import { listPosts } from '../graphql/queries'
import { ListPostsQuery, Post } from '../API'
import { ReactElement } from 'react'

interface PostPageProps {
  post: Post
}

const PostPage: any = ({ post }: PostPageProps): ReactElement => {
  return (
    <div className="flex flex-col h-screen justify-around gap-2 w-full">
      <h1 className="h-2/12 text-3xl font-bold mt-2 place-self-center">
        {post.title}
      </h1>
      <div className="h-10/12 p-4">
        <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
      </div>
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

export const getStaticProps: GetStaticProps = async (context) => {
  const SSR = withSSRContext()

  // eslint-disable-next-line no-unused-vars
  const post: GraphQLQuery<any> = await SSR.API.graphql(
    graphqlOperation(listPosts, {
      filter: { slug: { eq: context.params?.slug } },
      variables: { limit: 1 },
    })
  )

  if (post.data as ListPostsQuery) {
    return {
      props: {
        post: post.data.listPosts.items[0] as Post,
      },
      revalidate: 10,
    }
  }

  throw new Error(
    'Post fetching for GetStaticProps failed! Slug:' + context.params?.slug
  )
}

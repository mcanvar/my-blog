import { GetStaticPaths, GetStaticProps } from 'next'
import { graphqlOperation, withSSRContext } from 'aws-amplify'
import { GraphQLQuery } from '@aws-amplify/api'
import { ListPostsQuery, Post } from '../API'
import {
  listPostsForISR,
  listPostSlugsForISR,
} from '../graphql/overrides/queries'

export const getStaticPathsFunction: GetStaticPaths = async () => {
  const SSR = withSSRContext()

  const posts: GraphQLQuery<any> = await SSR.API.graphql({
    query: listPostSlugsForISR,
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

export const getStaticPropsFunction: GetStaticProps = async (context) => {
  const SSR = withSSRContext()

  // eslint-disable-next-line no-unused-vars
  const post: GraphQLQuery<any> = await SSR.API.graphql(
    graphqlOperation(listPostsForISR, {
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

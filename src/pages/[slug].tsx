import { GetStaticPaths, GetStaticProps } from 'next'
import { Post } from '../API'
import { ReactElement, useEffect } from 'react'
import Head from 'next/head'
import {
  getStaticPathsFunction,
  getStaticPropsFunction,
} from '../utils/PostPageStaticFunctions'

interface PostPageProps {
  post: Post
}

const PostPage: any = ({ post }: PostPageProps): ReactElement => {
  useEffect(() => {
    document.documentElement.lang = post.language
  })

  return (
    <>
      <Head>
        <title>{post.title}</title>
      </Head>
      <div className="flex flex-col justify-around gap-2 w-9/12 p-4">
        <h1 className="h-2/12 text-3xl font-bold mt-2 justify-self-start">
          {post.title}
        </h1>
        <div className="h-auto p-4">
          <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
        </div>
      </div>
    </>
  )
}

export default PostPage

export const getStaticPaths: GetStaticPaths = getStaticPathsFunction
export const getStaticProps: GetStaticProps = getStaticPropsFunction

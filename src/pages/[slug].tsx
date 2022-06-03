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
      <div className="post">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-card">
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
          {/* TODO: Buttons */}
          <div hidden className="post-controls"></div>
        </div>
      </div>
    </>
  )
}

export default PostPage

export const getStaticPaths: GetStaticPaths = getStaticPathsFunction
export const getStaticProps: GetStaticProps = getStaticPropsFunction

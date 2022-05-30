// import Head from "next/head"
import { NextPage } from 'next'
import Card from '../components/Card'
import { useEffect, useState } from 'react'
import { ListPostsQuery, Post } from '../API'
import { API } from 'aws-amplify'
import { listPosts } from '../graphql/queries'
import { GraphQLQuery } from '@aws-amplify/api'
import Head from "next/head";

const Home: NextPage = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loaded, setLoaded] = useState<boolean>(false)

  const fetchLastSixPosts = async (): Promise<Post[]> => {
    const lastSixtPosts: GraphQLQuery<any> = await API.graphql({
      query: listPosts,
      variables: { limit: 5 },
    })

    if (lastSixtPosts.data as ListPostsQuery) {
      setPosts(lastSixtPosts.data.listPosts?.items)
      setLoaded(true)

      return lastSixtPosts.data.listPosts?.items
    }

    throw new Error('Could not fetch the posts.')
  }

  useEffect(() => {
    fetchLastSixPosts()
  }, [])

  return (
<>

  <Head>
    <html lang="tr"></html>
  </Head>
  <div className="flex flex-col h-screen justify-around gap-2 w-full">
    <h1 className="h-2/12 text-3xl font-bold mt-2 place-self-center">
      Selam 👋
    </h1>
    <div className="h-10/12 grid grid-flow-row grid-cols-1 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2 gap-4 p-4">
      {posts && loaded
          ? posts.map((post, index) => (
              <Card
                  key={index}
                  title={post.title}
                  lang={post.language}
                  slug={post.slug}
                  imgSrc={
                    'https://images.pexels.com/photos/3775534/pexels-photo-3775534.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
                  }
                  date={'12 days ago'}
                  order={index + 1}
                  loaded
              >
                <p>
                  “ summary will be here summary will be here summary will be
                  here summary will be here summary will be here ”
                </p>
              </Card>
          ))
          : [1, 2, 3, 4, 5].map((index) => (
              <Card
                  key={index}
                  loaded={loaded}
                  date="&nbsp;"
                  title="&nbsp;"
                  lang="tr"
                  slug="&nbsp;"
                  imgSrc="&nbsp;"
                  order={index}
              ></Card>
          ))}
    </div>
  </div>
</>
  )
}

export default Home

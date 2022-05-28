// import Head from "next/head"
import { NextPage } from 'next'
import Card from '../components/Card'
import { useEffect, useState } from 'react'
import { ListPostsQuery, Post } from '../API'
import { API } from 'aws-amplify'
import { listPosts } from '../graphql/queries'
import { GraphQLQuery } from '@aws-amplify/api'

const Home: NextPage = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loaded, setLoaded] = useState<boolean>(false)
  const cardStates: {
    order: Number
    bgClass: string
    textClass: string
    colSpan: Number
    rowSpan: Number
  }[] = [
    {
      order: 1,
      colSpan: 2,
      rowSpan: 1,
      bgClass: 'bg-indigo-600',
      textClass: 'text-white',
    },
    {
      order: 2,
      colSpan: 1,
      rowSpan: 1,
      bgClass: 'bg-gray-900',
      textClass: 'text-white',
    },
    {
      order: 3,
      colSpan: 1,
      rowSpan: 1,
      bgClass: 'bg-white',
      textClass: 'text-black',
    },
    {
      order: 4,
      colSpan: 2,
      rowSpan: 1,
      bgClass: 'bg-purple-800',
      textClass: 'text-white',
    },
    {
      order: 2,
      colSpan: 1,
      rowSpan: 2,
      bgClass: 'bg-white',
      textClass: 'text-black',
    },
  ]

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
    <div className="flex flex-col h-screen justify-around gap-2 w-full">
      <h1 className="h-2/12 text-3xl font-bold mt-2 place-self-center">
        Selam 👋
      </h1>
      <div className="h-10/12 grid grid-flow-row grid-cols-1 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2 gap-4 p-4">
        {posts && loaded
          ? posts.map((post, index) => (
              <Card
                key={post.slug}
                title={post.title}
                imgSrc={
                  'https://images.pexels.com/photos/3775534/pexels-photo-3775534.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
                }
                date={'12 days ago'}
                order={cardStates[index].order}
                colSpan={cardStates[index].colSpan}
                rowSpan={cardStates[index].rowSpan}
                bgClass={cardStates[index].bgClass}
                textClass={cardStates[index].textClass}
                loaded
              >
                <p>
                  “ summary will be here summary will be here summary will be
                  here summary will be here summary will be here ”
                </p>
              </Card>
            ))
          : cardStates.map((state, index) => (
              <Card
                key={index}
                loaded={loaded}
                date="&nbsp;"
                title="&nbsp;"
                imgSrc="&nbsp;"
                order={cardStates[index].order}
                colSpan={cardStates[index].colSpan}
                rowSpan={cardStates[index].rowSpan}
                bgClass={cardStates[index].bgClass}
                textClass={cardStates[index].textClass}
              ></Card>
            ))}
      </div>
    </div>
  )
}

export default Home

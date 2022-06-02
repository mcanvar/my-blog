import Head from 'next/head'
import { NextPage } from 'next'
import Card from '../components/Card'
import { useEffect, useState } from 'react'
import {
  ModelSortDirection,
  Post,
  PostsByDateQuery,
  PostsByDateQueryVariables,
} from '../API'
import { API, graphqlOperation } from 'aws-amplify'
import { postsByDate } from '../graphql/overrides/queries'
import { GraphQLQuery } from '@aws-amplify/api'
import { useRouter } from 'next/router'

const Home: NextPage = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loaded, setLoaded] = useState<boolean>(false)
  const router = useRouter()
  const lang = router.route === '/en' ? 'en' : 'tr'

  useEffect(() => {
    document.documentElement.lang = lang

    const fetchLastSixPosts: GraphQLQuery<any> = async (): Promise<void> => {
      const postsByDateInput: PostsByDateQueryVariables = {
        language: lang,
        sortDirection: ModelSortDirection.DESC,
        limit: 5,
      }

      const lastSixPosts = (await API.graphql(
        graphqlOperation(postsByDate, postsByDateInput)
      )) as { data: PostsByDateQuery }
      console.log(lastSixPosts)

      if (lastSixPosts.data) {
        setPosts(lastSixPosts.data.postsByDate?.items as Post[])
        setLoaded(true)

        return
      }

      throw new Error('Could not fetch the posts.')
    }

    fetchLastSixPosts()
  }, [lang])

  return (
    <>
      <Head>
        <title>{lang === 'en' ? "Mevlut's Blog" : "Mevlüt'ün Bloğu"}</title>
      </Head>
      <div className="flex flex-col h-auto min-h-screen justify-around gap-2 w-full">
        <h1 className="h-2/12 text-3xl font-bold mt-2 place-self-center">
          Selam 👋
        </h1>
        <div className="h-10/12 grid grid-flow-row grid-cols-1 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2 gap-4 p-4">
          {posts && loaded
            ? posts.map((post, index) => (
                <Card key={index} post={post} order={index + 1}>
                  <p>“ {post.description} ”</p>
                </Card>
              ))
            : [1, 2, 3, 4, 5].map((value) => (
                <Card key={value} post={null} order={value}></Card>
              ))}
        </div>
      </div>
    </>
  )
}

export default Home

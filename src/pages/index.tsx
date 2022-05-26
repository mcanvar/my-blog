import Head from "next/head"
import { useAuth } from "../context/AuthContext"
import { NextPage } from "next"

const Home: NextPage = () => {
  const { user } = useAuth()
  return (
    <div className="">
      <h1 className="text-3xl font-bold">
        Hello {user ? (user as any).attributes.email : "world!"}!
      </h1>
    </div>
  )
}

export default Home

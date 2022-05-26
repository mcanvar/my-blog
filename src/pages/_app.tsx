import "../../styles/globals.css"
import type { AppProps } from "next/app"
import Amplify from "aws-amplify"
import AWSConfig from "../aws-exports"
import AuthContext from "../context/AuthContext"
import Layout from "../components/Layout"

Amplify.configure({ ...AWSConfig, ssr: true })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthContext>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthContext>
  )
}

export default MyApp

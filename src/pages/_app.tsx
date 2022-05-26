import "../../styles/globals.css"
import type { AppProps } from "next/app"

import Amplify from "aws-amplify"
import AWSConfig from "../aws-exports"
import AuthContext from "../context/AuthContext"
Amplify.configure({ ...AWSConfig, ssr: true })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthContext>
      <Component {...pageProps} />
    </AuthContext>
  )
}

export default MyApp

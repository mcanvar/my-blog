import Head from 'next/head'
import { ReactElement, FC } from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactElement
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>mcanvar&apos;s blog</title>
        <meta name="description" content="Blog of Mevlut Canvar" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <Navbar />
      </header>

      <main>{children}</main>

      <footer className=""></footer>
    </>
  )
}

export default Layout

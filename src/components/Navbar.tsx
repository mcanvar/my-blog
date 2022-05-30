import { FC } from 'react'
import Link from 'next/link'
import HomeIcon from './HomeIcon'
import { useRouter } from 'next/router'
import Image from 'next/image'

const Navbar: FC = () => {
  const router = useRouter()

  return (
    <nav className="bg-nature-dark w-1/12 text-nature-light z-20 fixed flex flex-col items-center h-screen top-0 left-0">
      <div className="rounded-full w-8 h-8 relative mt-4">
        <Image
          alt={'Mevlut'}
          className="rounded-full"
          layout="fill"
          src={
            'https://secure.gravatar.com/avatar/57c8ad1723d2b40f41babd8bc20e281b?s=192&r=g'
          }
        />
      </div>
      <div className="mb-2 mx-2 relative">
        <input
          type="text"
          disabled
          hidden
          className="bg-nature-darker text-sm rounded-full py-1 px-2 h-8 w-8 focus:w-full focus:shadow-outline focus:outline-none"
          placeholder=""
        />
        {/* TODO: MOVE TO THE RIGHT WHEN FOCUS */}
        <div className="absolute top-0 flex items-center h-full mx-2 focus:right-0">
          <span title="search icon" className="cursor-pointer"></span>
        </div>
      </div>
      <Link href={router.route === '/en' ? '/en' : '/'}>
        <a className="flex py-2 w-full justify-start px-2 hover:text-nature-lighter justify-center">
          {/* TODO: MAKE NAVBAR COLLAPSABLE */}
          <HomeIcon />
          <span className="ml-1 text-md leading-5 hidden">Homepage</span>
        </a>
      </Link>
      <div className="mt-auto mb-4 self-start">
        <a
          href={router.route.slice(0, 3) === '/en' ? '/' : '/en'}
          className="bg-nature-darker font-bold py-1 px-2 rounded-r-xl hover:bg-nature-light hover:text-nature-dark"
        >
          {router.route.slice(0, 3) === '/en' ? 'TR' : 'EN'}
        </a>
      </div>
    </nav>
  )
}
export default Navbar

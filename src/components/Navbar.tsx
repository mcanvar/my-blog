import { FC } from "react"
import Link from "next/link"

const Navbar: FC = () => (
  <nav className="bg-nature-dark text-nature-light z-20 fixed flex flex-col items-center h-screen top-0 left-0">
    <div className="mb-6 mt-2">
      <img
        className="rounded-full w-8 h-8"
        src="https://secure.gravatar.com/avatar/57c8ad1723d2b40f41babd8bc20e281b?s=192&r=g"
        alt="pp"
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
    <Link href="/">
      <a className="flex py-2 w-full justify-start px-4 hover:text-nature-lighter hover:justify-center">
        {/* TODO: MAKE NAVBAR COLLAPSABLE */}
        <span className="hidden">HomepageIcon</span>
        <span className="ml-1 text-lg leading-5">Homepage</span>
      </a>
    </Link>
    <div className="mt-auto mb-2 self-start">
      <button className="bg-nature-darker font-bold py-1 px-2 rounded-r hover:bg-nature-light hover:text-nature-dark">
        EN
      </button>
    </div>
  </nav>
)

export default Navbar

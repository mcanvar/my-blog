import { FC, ReactElement } from 'react'
import Image from 'next/image'
import { StaticImageData } from 'next/dist/client/image'
import Link from 'next/link'

declare type StaticImport = string | StaticImageData
interface CardProps {
  title: string
  slug: string
  date: string
  imgSrc: string | StaticImport
  children?: ReactElement | ReactElement[]
  order?: Number
  bgClass?: string
  textClass?: string
  colSpan?: Number
  rowSpan?: Number
  loaded?: boolean
}

const Card: FC<CardProps> = ({
  title,
  slug,
  date,
  imgSrc,
  order = 1,
  children,
  bgClass = 'bg-indigo-600',
  textClass = 'text-white',
  colSpan = 1,
  rowSpan = 1,
  loaded = false,
}) => (
  <Link key={slug} href={`/${encodeURIComponent(slug)}`}>
    <a
      className={`${bgClass} lg:order-${order} 2xl:order-${order} ${textClass} lg:row-span-${rowSpan} 2xl:row-span-${rowSpan} lg:col-span-${colSpan} 2xl:col-span-${colSpan} rounded-lg shadow-xl ${
        !loaded && 'animate-pulse'
      }`}
    >
      <div className="mx-9 my-8 2xl:mx-10">
        {loaded ? (
          <div className="w-8 md:w-9 relative lg:w-10 2xl:w-20 h-8 md:h-9 lg:h-10 2xl:h-20 rounded-full border-2 ml-1 lg:ml-3 2xl:ml-0 md:-mt-1 2xl:-mt-4">
            <Image
              alt={title}
              className="rounded-full"
              layout="fill"
              src={imgSrc}
            />
          </div>
        ) : (
          <div className="w-8 md:w-9 lg:w-10 2xl:w-20 h-8 md:h-9 lg:h-10 2xl:h-20 bg-gray-200 bg-opacity-50 rounded-full"></div>
        )}

        <h4 className="text-xs md:text-base 2xl:text-2xl pl-12 lg:pl-16 2xl:pl-20 -mt-8 md:-mt-10 lg:-mt-11 2xl:-mt-20 2xl:mx-8">
          {loaded ? (
            '5 min read'
          ) : (
            <div className="bg-gray-200 bg-opacity-50 rounded-full">&nbsp;</div>
          )}
        </h4>
        <h4
          className={`${textClass} text-opacity-50 text-xs md:text-base ${
            !loaded && 'pt-1'
          } 2xl:text-2xl pl-12 lg:pl-16 2xl:pl-20 2xl:my-2 2xl:mx-8`}
        >
          {loaded ? (
            date
          ) : (
            <div className="bg-gray-200 bg-opacity-50 rounded-full">{date}</div>
          )}
        </h4>
      </div>
      <div className="-mt-6">
        <h2 className="text-xl 2xl:text-4xl font-bold px-7 lg:px-9 2xl:pt-6 2xl:mx-2">
          {loaded ? (
            title
          ) : (
            <div className="bg-gray-200 bg-opacity-50 rounded-full">
              {title}
            </div>
          )}
        </h2>
        <br />
        <div
          className={`${textClass} text-opacity-50 font-medium md:text-sm 2xl:text-3xl px-7 lg:px-9 mb-3 2xl:pb-8 2xl:mx-2`}
        >
          {loaded ? (
            children
          ) : (
            <div className="">
              <p className="bg-gray-200 bg-opacity-50 rounded-full w-48">
                &nbsp;
              </p>
              <p className="bg-gray-200 bg-opacity-50 rounded-full w-48 mt-1">
                &nbsp;
              </p>
              <p className="bg-gray-200 bg-opacity-50 rounded-full w-48 mt-1">
                &nbsp;
              </p>
            </div>
          )}
        </div>
      </div>
    </a>
  </Link>
)

export default Card

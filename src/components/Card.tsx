import { FC, ReactElement } from 'react'
import Image from 'next/image'

interface CardProps {
  title: string
  date: string
  imgSrc: string
  children: ReactElement | ReactElement[]
  order?: Number
  bgClass?: string
  textClass?: string
  colSpan?: Number
  rowSpan?: Number
}

const Card: FC<CardProps> = ({
  title,
  date,
  imgSrc,
  order = 1,
  children,
  bgClass = 'bg-indigo-600',
  textClass = 'text-white',
  colSpan = 1,
  rowSpan = 1,
}) => (
  <div
    className={`${bgClass} lg:order-${order} ${textClass} lg:row-span-${rowSpan} 2xl:row-span-${rowSpan} lg:col-span-${colSpan} rounded-lg shadow-xl mb-5 lg:mb-0`}
  >
    <div className="mx-6 my-8 2xl:mx-10">
      <div className="w-8 md:w-9 relative lg:w-10 2xl:w-20 h-8 md:h-9 lg:h-10 2xl:h-20 rounded-full border-2 ml-1 lg:ml-3 2xl:ml-0 md:-mt-1 2xl:-mt-4">
        <Image
          alt={title}
          className="rounded-full"
          layout="fill"
          src={imgSrc}
        />
      </div>

      <h1 className="text-xs md:text-base 2xl:text-2xl pl-12 lg:pl-16 2xl:pl-20 -mt-8 md:-mt-10 lg:-mt-11 2xl:-mt-20 2xl:mx-8">
        5 min read
      </h1>
      <h2
        className={`${textClass} text-opacity-50 text-xs md:text-base 2xl:text-2xl pl-12 lg:pl-16 2xl:pl-20 2xl:my-2 2xl:mx-8`}
      >
        {date}
      </h2>
    </div>
    <div className="-mt-6 relative">
      <h2 className="text-xl 2xl:text-4xl font-bold px-7 lg:px-9 2xl:pt-6 2xl:mx-2">
        {title}
      </h2>
      <br />
      <div
        className={`${textClass} text-opacity-50 font-medium md:text-sm 2xl:text-3xl px-7 lg:px-9 mb-3 2xl:pb-8 2xl:mx-2`}
      >
        {children}
      </div>
    </div>
  </div>
)

export default Card

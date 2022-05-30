import { FC, ReactElement, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import InfoIcon from './InfoIcon'

interface CardProps {
  title: string
  slug: string
  date: string
  lang: string
  children?: ReactElement | ReactElement[]
  order?: Number
  loaded?: boolean
}

const Card: FC<CardProps> = ({
  title,
  slug,
  lang,
  date,
  order = 1,
  children,
  loaded = false,
}) => {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [cardTextHeight, setCardTextHeight] = useState(80)

  useEffect(() => {
    const calculateDescHeight: Function = (): string => {
      const cardCols: number = cardRef
        ? parseInt(
            window
              .getComputedStyle(cardRef.current as Element)
              .gridColumn.charAt(5)
          )
        : 1
      const cardRows: number = cardRef
        ? parseInt(
            window
              .getComputedStyle(cardRef.current as Element)
              .gridRow.charAt(5)
          )
        : 1

      if (cardRows === 1 && cardCols === 1) return '80px'
      else if (cardRows === 2 && cardCols === 1) return '340px'
      else if (cardRows === 1 && cardCols === 2) return '100px'
      else if (cardRows === 1 && cardCols === 3) return '200px'

      return '80px'
    }

    setCardTextHeight(calculateDescHeight())
  })

  return (
    <Link
      key={slug}
      href={`/${
        lang === 'tr'
          ? encodeURIComponent(slug)
          : 'en/' + encodeURIComponent(slug)
      }`}
    >
      <a
        ref={cardRef}
        className={`card-${order} ${!loaded && 'animate-pulse'}`}
        lang={lang}
      >
        <div className="mx-9 my-8 2xl:mx-10">
          {loaded ? (
            <div className="relative w-8 md:w-9 lg:w-10 2xl:w-20 h-8 md:h-9 lg:h-10 2xl:h-20">
              <InfoIcon />
            </div>
          ) : (
            <div className="w-8 md:w-9 lg:w-10 2xl:w-20 h-8 md:h-9 lg:h-10 2xl:h-20 bg-gray-200 bg-opacity-50 rounded-full"></div>
          )}

          <h4 className="text-xs 2xl:text-2xl pl-9 lg:pl-12 2xl:pl-16 -mt-7 md:-mt-8 lg:-mt-9 2xl:-mt-12 2xl:mx-8">
            {loaded ? (
              date
            ) : (
              <div className="bg-gray-200 bg-opacity-50 rounded-full">
                {date}
              </div>
            )}
          </h4>
          <h4
            className={`text-xs ${
              !loaded && 'pt-1'
            } 2xl:text-2xl pl-9 lg:pl-12 2xl:pl-16 2xl:my-2 2xl:mx-8`}
          >
            {loaded ? (
              '5 min read'
            ) : (
              <div className="bg-gray-200 bg-opacity-50 rounded-full">
                &nbsp;
              </div>
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
            className={`font-medium !sm:h-64 md:text-sm 2xl:text-3xl px-7 lg:px-9 mb-3 2xl:pb-8 2xl:mx-2 overflow-y-auto`}
            style={{ maxHeight: cardTextHeight }}
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
}
export default Card

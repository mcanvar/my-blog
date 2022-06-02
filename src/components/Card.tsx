import {
  FC,
  MutableRefObject,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import InfoIcon from './InfoIcon'
import { Post } from '../API'
import { isoStringToRelativeTime } from '../utils/DateFunctions'

interface CardProps {
  post: Post | null
  order?: Number
  children?: ReactElement | ReactElement[]
}

const Card: FC<CardProps> = ({ post = null, order = 1, children }) => {
  const cardRef = useRef<HTMLAnchorElement | HTMLDivElement>(null)
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
  }, [])

  return (
    <>
      {post ? (
        <Link
          key={post.slug}
          href={`/${
            post.language === 'tr'
              ? encodeURIComponent(post.slug)
              : 'en/' + encodeURIComponent(post.slug)
          }`}
        >
          <a
            ref={cardRef as MutableRefObject<HTMLAnchorElement>}
            className={`card-${order}`}
            lang={post.language}
          >
            <div className="mx-9 my-8 2xl:mx-10">
              <div className="relative w-8 md:w-9 lg:w-10 2xl:w-20 h-8 md:h-9 lg:h-10 2xl:h-20">
                <InfoIcon />
              </div>
              <h4 className="text-xs 2xl:text-2xl pl-9 lg:pl-12 2xl:pl-16 -mt-7 md:-mt-8 lg:-mt-9 2xl:-mt-12 2xl:mx-8">
                {isoStringToRelativeTime(post.createdAt)}
              </h4>
              <h4
                className={`text-xs 2xl:text-2xl pl-9 lg:pl-12 2xl:pl-16 2xl:my-2 2xl:mx-8`}
              >
                {'5 min read'}
              </h4>
            </div>
            <div className="-mt-6">
              <h2 className="text-xl 2xl:text-4xl font-bold px-7 lg:px-9 2xl:pt-6 2xl:mx-2">
                {[post.title]}
              </h2>
              <br />
              <div
                className={`font-medium !sm:h-64 md:text-sm 2xl:text-3xl px-7 lg:px-9 mb-3 2xl:pb-8 2xl:mx-2 overflow-y-auto`}
                style={{ maxHeight: cardTextHeight }}
              >
                {children}
              </div>
            </div>
          </a>
        </Link>
      ) : (
        <div
          ref={cardRef as MutableRefObject<HTMLDivElement>}
          className={`card-${order} animate-pulse'`}
        >
          <div className="mx-9 my-8 2xl:mx-10">
            <div className="w-8 md:w-9 lg:w-10 2xl:w-20 h-8 md:h-9 lg:h-10 2xl:h-20 bg-gray-200 bg-opacity-50 rounded-full"></div>

            <h4 className="text-xs 2xl:text-2xl pl-9 lg:pl-12 2xl:pl-16 -mt-7 md:-mt-8 lg:-mt-9 2xl:-mt-12 2xl:mx-8">
              <div className="bg-gray-200 bg-opacity-50 rounded-full">
                &nbsp;
              </div>
            </h4>
            <h4
              className={`text-xs pt-1 2xl:text-2xl pl-9 lg:pl-12 2xl:pl-16 2xl:my-2 2xl:mx-8`}
            >
              <div className="bg-gray-200 bg-opacity-50 rounded-full">
                &nbsp;
              </div>
            </h4>
          </div>
          <div className="-mt-6">
            <h2 className="text-xl 2xl:text-4xl font-bold px-7 lg:px-9 2xl:pt-6 2xl:mx-2">
              <div className="bg-gray-200 bg-opacity-50 rounded-full">
                &nbsp;
              </div>
            </h2>
            <br />
            <div
              className={`font-medium !sm:h-64 md:text-sm 2xl:text-3xl px-7 lg:px-9 mb-3 2xl:pb-8 2xl:mx-2 overflow-y-auto`}
              style={{ maxHeight: cardTextHeight }}
            >
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default Card

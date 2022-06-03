import {
  FC,
  LegacyRef,
  ReactElement,
  useCallback,
  useMemo,
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
  const [cardTextHeight, setCardTextHeight] = useState<string>('80px')
  const cardRef: LegacyRef<Element> | undefined = useCallback(
    (node: Element) => {
      if (node) {
        const cardCols: number = parseInt(
          window.getComputedStyle(node).gridColumn.charAt(5)
        )
        const cardRows: number = parseInt(
          window.getComputedStyle(node).gridRow.charAt(5)
        )

        if (cardRows === 1 && cardCols === 1) return setCardTextHeight('80px')
        else if (cardRows === 2 && cardCols === 1)
          return setCardTextHeight('340px')
        else if (cardRows === 1 && cardCols === 2)
          return setCardTextHeight('100px')
        else if (cardRows === 1 && cardCols === 3)
          return setCardTextHeight('200px')

        return setCardTextHeight('80px')
      }
    },
    []
  )

  const readTimeInMinutes = useMemo<string>((): string => {
    if (post === null) return ''

    const pattern = /<\s*p[^>]*>([^<]*)<\s*\/\s*p\s*>/g
    let result
    let total = 0

    try {
      while ((result = pattern.exec(post.content)) !== null) {
        total += result[1].split(' ').length
      }
    } catch (e) {
      total = 1
    }

    return post.language === 'en'
      ? Math.ceil(total / 200).toString() + ' min read'
      : Math.ceil(total / 200).toString() + ' dk'
  }, [post])
  const humanReadableDate = useMemo<string>(
    () => isoStringToRelativeTime(post?.createdAt),
    [post]
  )

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
          <a ref={cardRef} className={`card-${order}`} lang={post.language}>
            <div className="card-info">
              <div className="card-info-icon">
                <InfoIcon />
              </div>
              <div className="card-info-data">
                <h4>{humanReadableDate}</h4>
                <h4>{readTimeInMinutes}</h4>
              </div>
            </div>
            <div className="-mt-4">
              <h2 className="text-xl 2xl:text-4xl font-bold px-7 lg:px-9 2xl:pt-6 2xl:mx-2">
                {[post.title]}
              </h2>
              <br />
              <div
                className={`card-content`}
                style={{ maxHeight: cardTextHeight }}
              >
                {children}
              </div>
            </div>
          </a>
        </Link>
      ) : (
        <div ref={cardRef} className={`card-${order} animate-pulse`}>
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

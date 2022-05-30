import PostPageEn from '../[slug]'
import { GetStaticPaths, GetStaticProps } from 'next'
import {
  getStaticPathsFunction,
  getStaticPropsFunction,
} from '../../utils/PostPageStaticFunctions'

export default PostPageEn

export const getStaticPaths: GetStaticPaths = getStaticPathsFunction
export const getStaticProps: GetStaticProps = getStaticPropsFunction

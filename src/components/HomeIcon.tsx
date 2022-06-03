import { FC, ReactElement } from 'react'
import { useRouter } from 'next/router'
import Icon from './Icon'

const HomeIcon: FC = (): ReactElement => {
  const router = useRouter()

  return (
    <Icon filled={router.pathname === '/'}>
      <path d="M51.61 25.21L33.2 11.4a2 2 0 00-2.4 0L12.39 25.21a2 2 0 00-.8 1.6v26.64a2 2 0 002 2H25a2 2 0 002-2V45a2 2 0 012-2h7a2 2 0 012 2v8.45a2 2 0 002 2h10.41a2 2 0 002-2V26.81a2 2 0 00-.8-1.6z"></path>
    </Icon>
  )
}

export default HomeIcon

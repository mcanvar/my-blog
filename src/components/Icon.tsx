import { FC, ReactElement } from 'react'
interface IconProps {
  filled?: boolean
  children: ReactElement | ReactElement[]
}

const Icon: FC<IconProps> = ({ filled = false, children }): ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={'100%'}
    height={'100%'}
    preserveAspectRatio="xMinYMin slice"
    strokeWidth="2.5"
    stroke="currentColor"
    fill={filled ? 'currentColor' : 'none'}
    className="duration-300 transform transition-all"
  >
    {children}
  </svg>
)

export default Icon

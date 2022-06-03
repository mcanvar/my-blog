import { FC, ReactElement } from 'react'
import Icon from './Icon'

const InfoIcon: FC = (): ReactElement => (
  <Icon>
    <path
      strokeLinecap="round"
      d="M32.13 17v-.67M32.13 44.76V24.33h-4.27"
    ></path>
    <circle cx="32.06" cy="31.46" r="24.25" strokeLinecap="round"></circle>
    <path strokeLinecap="round" d="M24.02 45.22h16.21"></path>
  </Icon>
)

export default InfoIcon

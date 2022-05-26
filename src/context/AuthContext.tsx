import {
  createContext,
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react"
import { CognitoUser } from "@aws-amplify/auth"
import { Auth, Hub } from "aws-amplify"

interface AuthContextType {
  user: CognitoUser | null
  setUser: Dispatch<SetStateAction<CognitoUser | null>>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

interface Props {
  children: ReactElement
}

const AuthContextProvider: Function = ({ children }: Props): ReactElement => {
  const [user, setUser] = useState<CognitoUser | null>(null)

  const checkUser = async () => {
    try {
      const amplifyUser = await Auth.currentAuthenticatedUser()

      if (amplifyUser) setUser(amplifyUser)
    } catch (e) {
      setUser(null)
      console.error("No signed in user: ", e)
    }
  }

  useEffect(() => {
    checkUser()
    Hub.listen("auth", () => checkUser())
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
export const useAuth = (): AuthContextType => useContext(AuthContext)

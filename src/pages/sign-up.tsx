import type { NextPage } from 'next'
import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Auth } from 'aws-amplify'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { CognitoUser } from '@aws-amplify/auth'
import { useRouter } from 'next/router'

interface SignUpForm {
  email: string
  password: string
  code: string
}

const SignUp: NextPage = () => {
  const { user } = useAuth()
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignUpForm>()
  const [codeRequired, setCodeRequired] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    if (router && router.query) {
      router.push('/')
    }
  }, [router])

  const onSubmit: SubmitHandler<SignUpForm> = async (data) => {
    if (codeRequired) {
      confirmSignUp(data)

      return
    }

    await signUpWithCredentials(data)
    setCodeRequired(true)
  }

  const signUpWithCredentials: Function = async ({
    email: username,
    password,
  }: SignUpForm): Promise<CognitoUser> => {
    try {
      const { user: amplifyUser } = await Auth.signUp({
        username,
        password,
      })

      console.log('Signed up: ', amplifyUser)

      return amplifyUser
    } catch (e) {
      console.error('Sign up error: ', e)
      throw e
    }
  }

  const confirmSignUp: Function = async ({
    email: username,
    password,
    code,
  }: SignUpForm) => {
    try {
      await Auth.confirmSignUp(username, code)
      const amplifyUser = await Auth.signIn({
        username,
        password,
      })

      if (amplifyUser) router.push('/')
      else throw new Error('Sign in failed!')

      console.log('Signed in: ', amplifyUser)
    } catch (e) {
      console.error('Sign in error: ', e)
      throw e
    }
  }

  if (user) router.push('/')

  return (
    <>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Sign up new user" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen grid place-content-center">
        <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              {/*<img*/}
              {/*  className="mx-auto h-12 w-auto"*/}
              {/*  src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"*/}
              {/*  alt="Workflow"*/}
              {/*/>*/}
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Sign up a new account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  sign in
                </a>
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Your email"
                    {...register('email', {
                      required: {
                        value: true,
                        message: 'Please enter an email.',
                      },
                    })}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                      codeRequired ? '' : 'rounded-b-md'
                    }`}
                    placeholder="Password"
                    {...register('password', {
                      required: {
                        value: true,
                        message: 'Please enter a password.',
                      },
                      minLength: {
                        value: 8,
                        message: 'Please enter a stronger password.',
                      },
                    })}
                  />
                </div>
                {codeRequired && (
                  <div>
                    <label htmlFor="code" className="sr-only">
                      Code
                    </label>
                    <input
                      id="code"
                      type="code"
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Your code"
                      {...register('code', {
                        required: {
                          value: true,
                          message: 'Please enter the code.',
                        },
                        minLength: {
                          value: 6,
                          message: 'Code must be 6 digits.',
                        },
                        maxLength: {
                          value: 6,
                          message: 'Code must be 6 digits.',
                        },
                      })}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <ul>
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key} className="text-sm text-red-400 w-full">
                      {error.message}
                    </li>
                  ))}
                </ul>

                {/*  <div className="flex items-center">*/}
                {/*    <input*/}
                {/*      id="remember-me"*/}
                {/*      name="remember-me"*/}
                {/*      type="checkbox"*/}
                {/*      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"*/}
                {/*    />*/}
                {/*    <label*/}
                {/*      htmlFor="remember-me"*/}
                {/*      className="ml-2 block text-sm text-gray-900"*/}
                {/*    >*/}
                {/*      Remember me*/}
                {/*    </label>*/}
                {/*  </div>*/}

                {/*  <div className="text-sm">*/}
                {/*    <a*/}
                {/*      href="#"*/}
                {/*      className="font-medium text-indigo-600 hover:text-indigo-500"*/}
                {/*    >*/}
                {/*      Forgot your password?*/}
                {/*    </a>*/}
                {/*  </div>*/}
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    {/*<LockClosedIcon*/}
                    {/*  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"*/}
                    {/*  aria-hidden="true"*/}
                    {/*/>*/}
                  </span>
                  {codeRequired ? 'Sign In' : 'Sign up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className=""></footer>
    </>
  )
}

export default SignUp

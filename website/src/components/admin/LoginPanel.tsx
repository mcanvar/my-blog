'use client'

import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { fetchAuthSession, signOut } from 'aws-amplify/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import './amplify-theme.css'

function AfterSignIn({ target }: { target: string }) {
  const router = useRouter()
  const { authStatus } = useAuthenticator((context) => [context.authStatus])
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    if (authStatus !== 'authenticated') return
    let cancelled = false
    fetchAuthSession({ forceRefresh: true })
      .then((session) => {
        if (cancelled) return
        const groups = session.tokens?.idToken?.payload['cognito:groups']
        if (Array.isArray(groups) && groups.includes('ADMINS')) {
          router.replace(target)
          router.refresh()
        } else {
          setDenied(true)
        }
      })
      .catch(() => setDenied(true))
    return () => {
      cancelled = true
    }
  }, [authStatus, router, target])

  if (!denied) return <p className="p-6 text-sm text-fern">Signing you in…</p>
  return (
    <div className="p-6">
      <p className="font-semibold">This account is not an admin.</p>
      <button
        type="button"
        className="btn mt-4"
        onClick={() => signOut().then(() => setDenied(false))}
      >
        Sign out
      </button>
    </div>
  )
}

export function LoginPanel({ target }: { target: string }) {
  return (
    <div className="admin-auth overflow-hidden rounded-2xl bg-surface">
      <Authenticator
        hideSignUp
        loginMechanisms={['email']}
        formFields={{ setupTotp: { QR: { totpIssuer: 'mcanvar.dev' } } }}
      >
        {() => <AfterSignIn target={target} />}
      </Authenticator>
    </div>
  )
}

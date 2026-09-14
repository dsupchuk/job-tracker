import { Link } from 'react-router-dom'
import { login } from '@/api/auth'
import { CredentialsForm } from './CredentialsForm'
import { useAuthMutation } from './useAuthMutation'

export function LoginPage() {
  const { submit, pending, errorMessage } = useAuthMutation(login, 'Could not sign in')

  return (
    <CredentialsForm
      title="Sign in"
      submitLabel="Sign in"
      pending={pending}
      errorMessage={errorMessage}
      onSubmit={submit}
      footer={
        <>
          No account yet?{' '}
          <Link to="/register" className="text-brand underline underline-offset-4">
            Create one
          </Link>
          <br />
          <span className="text-xs">Demo account: demo@demo.com / demo</span>
        </>
      }
    />
  )
}

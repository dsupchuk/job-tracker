import { Link } from 'react-router-dom'
import { register } from '@/api/auth'
import { CredentialsForm } from './CredentialsForm'
import { useAuthMutation } from './useAuthMutation'

export function RegisterPage() {
  const { submit, pending, errorMessage } = useAuthMutation(
    register,
    'Could not create the account',
  )

  return (
    <CredentialsForm
      title="Create an account"
      intro="Keep every application in one place and see at a glance which ones have gone quiet."
      submitLabel="Create account"
      pending={pending}
      errorMessage={errorMessage}
      onSubmit={submit}
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="text-brand underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    />
  )
}

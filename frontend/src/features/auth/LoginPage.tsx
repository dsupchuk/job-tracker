import { Link } from 'react-router-dom'
import { login } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { CredentialsForm } from './CredentialsForm'
import { useAuthMutation } from './useAuthMutation'

const DEMO = { email: 'demo@demo.com', password: 'demo' }

export function LoginPage() {
  const { submit, pending, errorMessage } = useAuthMutation(login, 'Could not sign in')

  return (
    <CredentialsForm
      title="Sign in"
      intro="Keep every application in one place and see at a glance which ones have gone quiet."
      submitLabel="Sign in"
      pending={pending}
      errorMessage={errorMessage}
      onSubmit={submit}
      aside={
        <div className="border-border-subtle mt-5 border-t pt-5">
          {/* Credentials as an action, not as small print to retype by hand. */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => submit(DEMO)}
            disabled={pending}
          >
            Try the demo
          </Button>
          <p className="text-content-muted text-meta mt-2">
            Opens a filled-in account. Nothing you change there affects anyone else.
          </p>
        </div>
      }
      footer={
        <>
          No account yet?{' '}
          <Link to="/register" className="text-brand underline underline-offset-4">
            Create one
          </Link>
        </>
      }
    />
  )
}

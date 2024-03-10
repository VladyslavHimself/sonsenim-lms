import { createFileRoute } from '@tanstack/react-router';
import '../styles/Login.scss';
export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {

  return (
    <div className="login-page-wrapper">
      Login page
    </div>
  )
}

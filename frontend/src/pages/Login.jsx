import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import { useToast } from '../components/ui/toast/ToastProvider'
import { LoginForm, RegisterForm, useCurrentUser, useLogout } from '../features/auth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Login() {
  useDocumentTitle('Login')
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('login')

  const onSuccess = (account) => {
    notify(mode === 'login' ? `Welcome back, ${account.name}!` : `Welcome, ${account.name}! Your account is ready.`)
    navigate(location.state?.from ?? '/')
  }

  return (
    <>
      <PageBanner title="Login/Register" crumbs={[{ label: 'Login/Register', to: '/login' }]} />
      <section className="login_box_area section_gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="login_box_img">
                <img className="img-fluid" src="/img/login.jpg" alt="" />
                <div className="hover">
                  <h4>{mode === 'login' ? 'New to our website?' : 'Already have an account?'}</h4>
                  <p>
                    There are advances being made in science and technology everyday, and a good example of this is the
                  </p>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  >
                    {mode === 'login' ? 'Create an Account' : 'Log In Instead'}
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="login_form_inner">
                {user ? (
                  <>
                    <h3>Hello, {user.name}</h3>
                    <p>You are already logged in.</p>
                    <button type="button" className="primary-btn" onClick={() => logout.mutate()}>
                      Log Out
                    </button>
                  </>
                ) : mode === 'login' ? (
                  <LoginForm onSuccess={onSuccess} />
                ) : (
                  <RegisterForm onSuccess={onSuccess} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

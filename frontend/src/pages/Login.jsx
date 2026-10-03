import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FormAlert, TextField } from '../components/common/FormControls'
import PageBanner from '../components/layout/PageBanner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useForm } from '../hooks/useForm'
import { email, minLength, required } from '../utils/validation'

function LoginForm({ onDone }) {
  const { login } = useAuth()
  const form = useForm(
    { username: '', password: '', remember: false },
    { username: [required('Username')], password: [required('Password')] },
  )
  const onSubmit = form.submit(async (values) => onDone(await login(values)))

  return (
    <>
      <h3>Log in to enter</h3>
      <form className="row login_form" noValidate onSubmit={onSubmit}>
        <TextField wrapperClassName="col-md-12 form-group" type="text" placeholder="Username" autoComplete="username" error={form.errors.username} {...form.field('username')} />
        <TextField wrapperClassName="col-md-12 form-group" type="password" placeholder="Password" autoComplete="current-password" error={form.errors.password} {...form.field('password')} />
        <div className="col-md-12 form-group">
          <div className="creat_account">
            <input type="checkbox" id="keep-logged-in" {...form.checkbox('remember')} />{' '}
            <label htmlFor="keep-logged-in">Keep me logged in</label>
          </div>
        </div>
        <div className="col-md-12 form-group">
          <FormAlert error={form.errors.form} />
          <button type="submit" className="primary-btn" disabled={form.submitting}>
            {form.submitting ? 'Logging In…' : 'Log In'}
          </button>
          <a href="#forgot">Forgot Password?</a>
        </div>
      </form>
    </>
  )
}

function RegisterForm({ onDone }) {
  const { register } = useAuth()
  const form = useForm(
    { name: '', email: '', password: '' },
    { name: [required('Name')], email: [required('Email'), email()], password: [required('Password'), minLength('Password', 8)] },
  )
  const onSubmit = form.submit(async (values) => onDone(await register(values)))

  return (
    <>
      <h3>Create an account</h3>
      <form className="row login_form" noValidate onSubmit={onSubmit}>
        <TextField wrapperClassName="col-md-12 form-group" type="text" placeholder="Full name" autoComplete="name" error={form.errors.name} {...form.field('name')} />
        <TextField wrapperClassName="col-md-12 form-group" type="email" placeholder="Email address" autoComplete="email" error={form.errors.email} {...form.field('email')} />
        <TextField wrapperClassName="col-md-12 form-group" type="password" placeholder="Password" autoComplete="new-password" error={form.errors.password} {...form.field('password')} />
        <div className="col-md-12 form-group">
          <FormAlert error={form.errors.form} />
          <button type="submit" className="primary-btn" disabled={form.submitting}>
            {form.submitting ? 'Creating…' : 'Register'}
          </button>
        </div>
      </form>
    </>
  )
}

export default function Login() {
  useDocumentTitle('Login')
  const { user, logout } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('login')

  const onDone = (account) => {
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
                  <p>There are advances being made in science and technology everyday, and a good example of this is the</p>
                  <button type="button" className="primary-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
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
                    <button type="button" className="primary-btn" onClick={logout}>
                      Log Out
                    </button>
                  </>
                ) : mode === 'login' ? (
                  <LoginForm onDone={onDone} />
                ) : (
                  <RegisterForm onDone={onDone} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

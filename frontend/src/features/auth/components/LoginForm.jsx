import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormAlert, TextField } from '../../../components/ui/FormControls'
import { applyServerErrors } from '../../../lib/forms'
import { useLogin } from '../queries'
import { loginFormSchema } from '../schemas'

const FIELDS = ['email', 'password']

/** Login form of the Login/Register page. Calls `onSuccess(user)` once logged in. */
export default function LoginForm({ onSuccess }) {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = handleSubmit((values) =>
    login.mutateAsync(values).then(onSuccess, (error) => applyServerErrors(error, setError, FIELDS)),
  )

  return (
    <>
      <h3>Log in to enter</h3>
      <form className="row login_form" noValidate onSubmit={onSubmit}>
        <TextField
          wrapperClassName="col-md-12 form-group"
          type="text"
          placeholder="Username"
          autoComplete="username"
          error={errors.email}
          {...register('email')}
        />
        <TextField
          wrapperClassName="col-md-12 form-group"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          error={errors.password}
          {...register('password')}
        />
        <div className="col-md-12 form-group">
          <div className="creat_account">
            <input type="checkbox" id="keep-logged-in" {...register('remember')} />{' '}
            <label htmlFor="keep-logged-in">Keep me logged in</label>
          </div>
        </div>
        <div className="col-md-12 form-group">
          <FormAlert error={errors.root?.serverError} />
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Logging In…' : 'Log In'}
          </button>
          <a href="#forgot">Forgot Password?</a>
        </div>
      </form>
    </>
  )
}

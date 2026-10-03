import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormAlert, TextField } from '../../../components/ui/FormControls'
import { applyServerErrors } from '../../../lib/forms'
import { useRegister } from '../queries'
import { registerFormSchema } from '../schemas'

const FIELDS = ['name', 'email', 'password', 'passwordConfirmation']

/** Registration form. Calls `onSuccess(user)` once the account exists (the user is logged in). */
export default function RegisterForm({ onSuccess }) {
  const registerUser = useRegister()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: '', password: '', passwordConfirmation: '' },
  })

  const onSubmit = handleSubmit((values) =>
    registerUser.mutateAsync(values).then(onSuccess, (error) => applyServerErrors(error, setError, FIELDS)),
  )

  const field = (name, props) => (
    <TextField wrapperClassName="col-md-12 form-group" error={errors[name]} {...props} {...register(name)} />
  )

  return (
    <>
      <h3>Create an account</h3>
      <form className="row login_form" noValidate onSubmit={onSubmit}>
        {field('name', { type: 'text', placeholder: 'Full name', autoComplete: 'name' })}
        {field('email', { type: 'email', placeholder: 'Email address', autoComplete: 'email' })}
        {field('password', { type: 'password', placeholder: 'Password', autoComplete: 'new-password' })}
        {field('passwordConfirmation', {
          type: 'password',
          placeholder: 'Confirm password',
          autoComplete: 'new-password',
        })}
        <div className="col-md-12 form-group">
          <FormAlert error={errors.root?.serverError} />
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Register'}
          </button>
        </div>
      </form>
    </>
  )
}

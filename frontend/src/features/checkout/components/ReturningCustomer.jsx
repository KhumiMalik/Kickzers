import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { FormAlert, StarInput } from '../../../components/ui/FormControls'
import { useToast } from '../../../components/ui/toast/ToastProvider'
import { applyServerErrors } from '../../../lib/forms'
import { useLogin } from '../../auth'
import { returningCustomerSchema } from '../schemas'

/** "Returning Customer?" login box at the top of the checkout. */
export default function ReturningCustomer() {
  const [open, setOpen] = useState(true)
  const login = useLogin()
  const { notify } = useToast()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(returningCustomerSchema), defaultValues: { email: '', password: '' } })

  const onSubmit = handleSubmit((values) =>
    login.mutateAsync({ ...values, remember: false }).then(
      (user) => notify(`Welcome back, ${user.name}!`),
      (error) => applyServerErrors(error, setError, ['email', 'password']),
    ),
  )

  return (
    <div className="returning_customer">
      <div className="check_title">
        <h2>
          Returning Customer?{' '}
          <a href="#login" onClick={(e) => (e.preventDefault(), setOpen((o) => !o))}>
            Click here to login
          </a>
        </h2>
      </div>
      {open && (
        <>
          <p>
            If you have shopped with us before, please enter your details in the boxes below. If you are a new customer,
            please proceed to the Billing &amp; Shipping section.
          </p>
          <form className="row contact_form" noValidate onSubmit={onSubmit}>
            <StarInput className="col-md-6" label="Username or Email" error={errors.email} {...register('email')} />
            <StarInput
              className="col-md-6"
              type="password"
              label="Password"
              error={errors.password}
              {...register('password')}
            />
            <div className="col-md-12 form-group">
              <FormAlert error={errors.root?.serverError} />
              <button type="submit" className="primary-btn" disabled={isSubmitting}>
                login
              </button>
              <div className="creat_account">
                <input type="checkbox" id="remember-me" /> <label htmlFor="remember-me">Remember me</label>
              </div>
              <Link className="lost_pass" to="/login">
                Lost your password?
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

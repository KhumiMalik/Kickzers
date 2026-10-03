import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { applyServerErrors } from '../../lib/forms'
import { useSubscribe } from './queries'
import { newsletterFormSchema } from './schemas'

/**
 * Shared logic of both newsletter forms (footer and blog sidebar); each one
 * only provides its own markup.
 */
export function useNewsletterForm() {
  const [message, setMessage] = useState(null)
  const mutation = useSubscribe()
  const form = useForm({ resolver: zodResolver(newsletterFormSchema), defaultValues: { email: '' } })

  const onSubmit = form.handleSubmit(({ email }) =>
    mutation.mutateAsync(email).then(
      (response) => {
        setMessage(response.message)
        form.reset()
      },
      (error) => applyServerErrors(error, form.setError, ['email']),
    ),
  )

  const { errors, isSubmitting } = form.formState
  return { register: form.register, onSubmit, error: errors.email ?? errors.root?.serverError, message, isSubmitting }
}

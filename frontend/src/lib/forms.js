import { z } from 'zod'
import { ApiError } from './api-client'

/** Reusable Zod field builders whose messages match the API's wording. */
export const requiredText = (label) => z.string().trim().min(1, `${label} is required.`)

export const requiredEmail = (label = 'Email') =>
  z.string().trim().min(1, `${label} is required.`).pipe(z.email('Please enter a valid email address.'))

export const optionalText = () => z.string().trim()

/** Name/email/phone/message forms (reviews, product comments). */
export const submissionSchema = (messageLabel) =>
  z.object({
    name: requiredText('Name'),
    email: requiredEmail('Email'),
    phone: optionalText(),
    body: requiredText(messageLabel),
  })

/** Root error key used for messages that don't belong to a single field. */
export const ROOT_ERROR = 'root.serverError'

/**
 * Copies an API error onto a React Hook Form instance.
 * 422 errors for fields in `fields` are shown under those inputs; anything else
 * (other fields, business errors such as "cart", non-422 errors) becomes the
 * form-level message at `errors.root.serverError`.
 *
 * @param {unknown} error   what the mutation threw
 * @param {Function} setError react-hook-form's setError
 * @param {string[]} fields  field paths that exist in this form
 */
export function applyServerErrors(error, setError, fields = []) {
  if (!(error instanceof ApiError)) {
    setError(ROOT_ERROR, { type: 'server', message: 'Something went wrong. Please try again.' })
    return
  }

  const unmatched = []
  for (const [field, message] of Object.entries(error.errors)) {
    if (fields.includes(field)) setError(field, { type: 'server', message })
    else unmatched.push(message)
  }

  if (!error.isValidation) setError(ROOT_ERROR, { type: 'server', message: error.message })
  else if (unmatched.length) setError(ROOT_ERROR, { type: 'server', message: unmatched[0] })
}

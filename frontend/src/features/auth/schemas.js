import { z } from 'zod'
import { requiredEmail, requiredText } from '../../lib/forms'
import { isoDateTime } from '../../lib/schemas'

export const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  createdAt: isoDateTime,
})

/**
 * The field is sent as `email` (API contract §3). Until the backend exists the
 * template's "Username" label is kept; Phase 11 switches the UI to "Email Address".
 */
export const loginFormSchema = z.object({
  email: requiredText('Username'),
  password: requiredText('Password'),
  remember: z.boolean(),
})

export const registerFormSchema = z
  .object({
    name: requiredText('Name'),
    email: requiredEmail('Email'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'The password confirmation does not match.',
    path: ['passwordConfirmation'],
  })

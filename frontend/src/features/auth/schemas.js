import { z } from 'zod'
import { requiredEmail, requiredText } from '../../lib/forms'
import { isoDateTime } from '../../lib/schemas'

export const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  createdAt: isoDateTime,
})

/** Customers log in with their e-mail address (decision Q4; the template said "Username"). */
export const loginFormSchema = z.object({
  email: requiredEmail('Email address'),
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

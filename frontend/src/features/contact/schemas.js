import { z } from 'zod'
import { requiredEmail, requiredText } from '../../lib/forms'

export const contactFormSchema = z.object({
  name: requiredText('Name'),
  email: requiredEmail('Email'),
  subject: requiredText('Subject'),
  message: requiredText('Message'),
})

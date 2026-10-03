import { z } from 'zod'
import { requiredEmail } from '../../lib/forms'

export const newsletterFormSchema = z.object({ email: requiredEmail('Email') })

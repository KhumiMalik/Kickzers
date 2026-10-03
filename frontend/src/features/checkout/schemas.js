import { z } from 'zod'
import { optionalText, requiredEmail, requiredText } from '../../lib/forms'
import { imageUrl } from '../../lib/schemas'

export const paymentMethodSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
  image: imageUrl.nullable(),
})

const address = {
  firstName: requiredText('First name'),
  lastName: requiredText('Last name'),
  company: optionalText(),
  country: z.string().min(1, 'Country is required.'),
  state: optionalText(),
  city: requiredText('Town/City'),
  addressLine1: requiredText('Address'),
  addressLine2: optionalText(),
  postcode: optionalText(),
}

const shippingAddressSchema = z.object(address)

/**
 * Checkout form. Field names mirror the API's request body (camelCase here,
 * snake_case on the wire), so 422 errors map straight onto the inputs.
 */
export const checkoutFormSchema = z
  .object({
    billing: z.object({ ...address, phone: requiredText('Phone number'), email: requiredEmail('Email address') }),
    shipToDifferentAddress: z.boolean(),
    // Only validated when shipToDifferentAddress is ticked (see superRefine).
    shippingAddress: z.object(Object.fromEntries(Object.keys(address).map((key) => [key, z.string()]))),
    notes: optionalText(),
    paymentMethod: z.string().min(1, 'Please choose a payment method.'),
    createAccount: z.boolean(),
    password: z.string(),
    acceptTerms: z.boolean().refine((accepted) => accepted, 'Please accept the terms & conditions.'),
  })
  .superRefine((values, ctx) => {
    if (values.shipToDifferentAddress) {
      const result = shippingAddressSchema.safeParse(values.shippingAddress)
      for (const issue of result.error?.issues ?? []) {
        ctx.addIssue({ code: 'custom', message: issue.message, path: ['shippingAddress', ...issue.path] })
      }
    }
    if (values.createAccount && values.password.length < 8) {
      ctx.addIssue({ code: 'custom', message: 'Password must be at least 8 characters.', path: ['password'] })
    }
  })

export const emptyAddress = Object.fromEntries(Object.keys(address).map((key) => [key, '']))

/** Form values → POST /checkout body. */
export function toCheckoutPayload(values) {
  return {
    billing: values.billing,
    shipToDifferentAddress: values.shipToDifferentAddress,
    shippingAddress: values.shipToDifferentAddress ? values.shippingAddress : null,
    notes: values.notes || null,
    paymentMethod: values.paymentMethod,
    createAccount: values.createAccount,
    password: values.createAccount ? values.password : null,
    acceptTerms: values.acceptTerms,
  }
}

export const returningCustomerSchema = z.object({
  email: requiredText('Username or email'),
  password: requiredText('Password'),
})

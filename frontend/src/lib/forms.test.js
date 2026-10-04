import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './api-client'
import { applyServerErrors, ROOT_ERROR, requiredEmail } from './forms'

describe('applyServerErrors', () => {
  it('puts 422 messages under the matching fields', () => {
    const setError = vi.fn()
    const error = new ApiError({
      status: 422,
      message: 'The given data was invalid.',
      errors: { 'billing.email': 'Please enter a valid email address.', acceptTerms: 'Please accept the terms.' },
    })

    applyServerErrors(error, setError, ['billing.email', 'acceptTerms'])

    expect(setError).toHaveBeenCalledWith('billing.email', {
      type: 'server',
      message: 'Please enter a valid email address.',
    })
    expect(setError).toHaveBeenCalledWith('acceptTerms', { type: 'server', message: 'Please accept the terms.' })
    expect(setError).not.toHaveBeenCalledWith(ROOT_ERROR, expect.anything())
  })

  it('shows a 422 error for a field the form does not have (e.g. "cart") as the form message', () => {
    const setError = vi.fn()
    const error = new ApiError({ status: 422, message: 'Your cart is empty.', errors: { cart: 'Your cart is empty.' } })

    applyServerErrors(error, setError, ['billing.email'])

    expect(setError).toHaveBeenCalledOnce()
    expect(setError).toHaveBeenCalledWith(ROOT_ERROR, { type: 'server', message: 'Your cart is empty.' })
  })

  it('shows other API errors with their message', () => {
    const setError = vi.fn()

    applyServerErrors(
      new ApiError({ status: 429, message: 'Too many attempts. Please try again in 42 seconds.' }),
      setError,
    )

    expect(setError).toHaveBeenCalledWith(ROOT_ERROR, {
      type: 'server',
      message: 'Too many attempts. Please try again in 42 seconds.',
    })
  })

  it('shows a generic message for anything that is not an API error', () => {
    const setError = vi.fn()

    applyServerErrors(new TypeError('boom'), setError)

    expect(setError).toHaveBeenCalledWith(ROOT_ERROR, {
      type: 'server',
      message: 'Something went wrong. Please try again.',
    })
  })
})

describe('requiredEmail', () => {
  it('uses the same wording as the API', () => {
    const schema = requiredEmail('Email address')

    expect(schema.safeParse('').error.issues[0].message).toBe('Email address is required.')
    expect(schema.safeParse('nope').error.issues[0].message).toBe('Please enter a valid email address.')
    expect(schema.parse('  jane@example.com ')).toBe('jane@example.com')
  })
})

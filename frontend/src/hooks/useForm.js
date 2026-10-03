import { useState } from 'react'
import { validate } from '../utils/validation'

/**
 * Controlled-form helper with client-side rules and server (422) error mapping.
 * `field(name)` returns props for an input; `submit(handler)` returns an onSubmit.
 */
export function useForm(initialValues, schema = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const setValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] || prev.form ? { ...prev, [name]: undefined, form: undefined } : prev))
  }

  const field = (name) => ({
    name,
    value: values[name],
    onChange: (e) => setValue(name, e.target.value),
  })

  const checkbox = (name) => ({
    name,
    checked: Boolean(values[name]),
    onChange: (e) => setValue(name, e.target.checked),
  })

  const submit = (handler) => async (e) => {
    e?.preventDefault()
    const clientErrors = validate(values, schema)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) return

    setSubmitting(true)
    try {
      await handler(values)
    } catch (err) {
      const serverErrors = Object.fromEntries(Object.entries(err.errors ?? {}).map(([k, v]) => [k, v[0]]))
      setErrors(Object.keys(serverErrors).length ? serverErrors : { form: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
  }

  return { values, errors, submitting, field, checkbox, setValue, submit, reset }
}

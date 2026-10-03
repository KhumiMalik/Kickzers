// Tiny rule-based validator. Each rule returns an error message or nothing.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const required = (label) => (v) => (v === true || (typeof v === 'string' ? v.trim() : v) ? null : `${label} is required.`)
export const email = () => (v) => (!v || EMAIL_RE.test(v.trim()) ? null : 'Please enter a valid email address.')
export const minLength = (label, n) => (v) => (!v || v.length >= n ? null : `${label} must be at least ${n} characters.`)
export const accepted = (message) => (v) => (v ? null : message)

/** @returns {Record<string, string>} first error per field */
export function validate(values, schema) {
  const errors = {}
  for (const [field, rules] of Object.entries(schema)) {
    for (const rule of rules) {
      const message = rule(values[field], values)
      if (message) {
        errors[field] = message
        break
      }
    }
  }
  return errors
}

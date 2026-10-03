import { delay, validationError } from './mock'

/** POST /api/login */
export async function login({ username, password }) {
  await delay()
  // Demo rule until the Laravel auth endpoint exists: any username + a 6+ char password.
  if (password.length < 6) throw validationError({ password: ['These credentials do not match our records.'] })
  return { id: 1, name: username, email: username.includes('@') ? username : null }
}

/** POST /api/register */
export async function register({ name, email }) {
  await delay()
  return { id: Date.now(), name, email }
}

/** POST /api/newsletter */
export async function subscribeNewsletter(email) {
  await delay()
  return { email, message: 'Thank you for subscribing!' }
}

/** POST /api/contact */
export async function sendContactMessage(payload) {
  await delay(null, 500)
  return { ...payload, receivedAt: new Date().toISOString() }
}

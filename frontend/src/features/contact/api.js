import { apiClient } from '../../lib/api-client'
import { messageResponse } from '../../lib/schemas'

/** POST /contact */
export const sendContactMessage = async ({ name, email, subject, message }) =>
  messageResponse.parse(await apiClient.post('/contact', { name, email, subject, message }))

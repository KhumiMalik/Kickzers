import { apiClient } from '../../lib/api-client'
import { messageResponse } from '../../lib/schemas'

/** POST /newsletter */
export const subscribe = async (email) => messageResponse.parse(await apiClient.post('/newsletter', { email }))

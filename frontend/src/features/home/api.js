import { apiClient } from '../../lib/api-client'
import { dataOf } from '../../lib/schemas'
import { homeSchema } from './schemas'

/** GET /home */
export const getHome = async () => dataOf(homeSchema).parse(await apiClient.get('/home'))

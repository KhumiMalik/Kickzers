import { z } from 'zod'

/**
 * Environment variables, validated once at startup so a typo fails loudly
 * instead of producing confusing network errors later.
 * Only variables prefixed with VITE_ are exposed to the browser by Vite.
 */
const envSchema = z.object({
  VITE_API_URL: z.url().default('http://localhost:8000/api/v1'),
  // 'true' until the Laravel API is connected (Phase 11): requests are answered by src/mocks.
  VITE_USE_MOCKS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
})

const parsed = envSchema.parse(import.meta.env)

export const env = {
  /** Base URL of the versioned API, without a trailing slash. */
  apiUrl: parsed.VITE_API_URL.replace(/\/$/, ''),
  /** Origin of the API server, used for Sanctum's /sanctum/csrf-cookie endpoint. */
  apiOrigin: new URL(parsed.VITE_API_URL).origin,
  useMocks: parsed.VITE_USE_MOCKS,
}

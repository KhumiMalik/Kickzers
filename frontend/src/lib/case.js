/**
 * Key-case conversion at the API boundary. The API speaks snake_case
 * (Laravel's convention); React code uses camelCase. Only object keys are
 * converted — values (e.g. enum codes like "flat_rate_10") are left alone.
 */

/** "address_line_1" → "addressLine1" */
export const snakeToCamel = (key) => key.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase())

/** "addressLine1" → "address_line_1" */
export const camelToSnake = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([a-zA-Z])(\d)/g, '$1_$2')
    .toLowerCase()

const isPlainObject = (value) => value !== null && typeof value === 'object' && value.constructor === Object

function convertKeys(value, convert) {
  if (Array.isArray(value)) return value.map((item) => convertKeys(item, convert))
  if (!isPlainObject(value)) return value
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [convert(key), convertKeys(item, convert)]))
}

/** Deep-converts object keys from snake_case to camelCase. */
export const keysToCamel = (value) => convertKeys(value, snakeToCamel)

/** Deep-converts object keys from camelCase to snake_case. */
export const keysToSnake = (value) => convertKeys(value, camelToSnake)

/** Converts a dotted validation path: "billing.first_name" → "billing.firstName". */
export const pathToCamel = (path) => path.split('.').map(snakeToCamel).join('.')

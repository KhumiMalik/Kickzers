/**
 * Money helpers. The API sends integer amounts in minor units (cents); this is
 * the only module that converts between minor and major units.
 */

const formatters = new Map()

function formatterFor(currency) {
  if (!formatters.has(currency)) {
    formatters.set(currency, new Intl.NumberFormat('en-US', { style: 'currency', currency }))
  }
  return formatters.get(currency)
}

/**
 * @param {number} minor amount in minor units, e.g. 15000
 * @param {string} [currency] ISO 4217 code
 * @returns {string} e.g. "$150.00"
 */
export const formatMoney = (minor, currency = 'USD') => formatterFor(currency).format(minor / 100)

/** 55000 → "550.00" (no currency symbol; the template shows "USD 550.00"). */
export const formatDecimal = (minor) => (minor / 100).toFixed(2)

/** 150 → 15000 (used to send the shop's dollar price filter to the API). */
export const toMinorUnits = (major) => Math.round(major * 100)

/** 15000 → 150 (used for the price slider, which works in whole dollars). */
export const toMajorUnits = (minor) => minor / 100

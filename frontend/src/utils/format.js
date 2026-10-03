const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export const formatPrice = (amount) => currency.format(amount)

export const formatCompact = (n) => compact.format(n)

export const pad2 = (n) => String(n).padStart(2, '0')

// "12 Dec, 2018" — the format the template uses for blog dates
export function formatShortDate(iso) {
  const d = new Date(iso)
  return `${pad2(d.getDate())} ${d.toLocaleString('en-US', { month: 'short' })}, ${d.getFullYear()}`
}

// "December 4, 2018 at 3:12 pm"
export function formatDateTime(iso) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()
  return `${date} at ${time}`
}

export function timeAgo(iso) {
  const hours = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 36e5))
  if (hours < 24) return `${pad2(hours)} Hours ago`
  const days = Math.round(hours / 24)
  return days < 30 ? `${pad2(days)} Days ago` : formatShortDate(iso)
}

export const cx = (...classes) => classes.filter(Boolean).join(' ')

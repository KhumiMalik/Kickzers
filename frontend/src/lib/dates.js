import { pad2 } from './format'

/** "12 Dec, 2018" — the template's blog date format. */
export function formatShortDate(iso) {
  const date = new Date(iso)
  return `${pad2(date.getDate())} ${date.toLocaleString('en-US', { month: 'short' })}, ${date.getFullYear()}`
}

/** "December 4, 2018 at 3:12 pm" */
export function formatDateTime(iso) {
  const date = new Date(iso)
  const day = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()
  return `${day} at ${time}`
}

/** "02 Hours ago", "06 Days ago", or a short date for older items. */
export function timeAgo(iso, now = Date.now()) {
  const hours = Math.max(1, Math.round((now - new Date(iso).getTime()) / 36e5))
  if (hours < 24) return `${pad2(hours)} Hours ago`
  const days = Math.round(hours / 24)
  return days < 30 ? `${pad2(days)} Days ago` : formatShortDate(iso)
}

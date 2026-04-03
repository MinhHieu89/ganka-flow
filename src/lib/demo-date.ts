/**
 * Demo date utilities.
 * All mock data dates are relative to "today" so the demo works on any day.
 */

const now = new Date()

/** Today as yyyy-mm-dd */
export const TODAY = formatDate(now)

/** Get a date string offset from today (e.g. +1 = tomorrow, -1 = yesterday) */
export function offsetDate(days: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

/** Get an ISO timestamp for today at a given HH:mm, offset by minutesBefore from now */
export function todayTimestamp(minutesAgo: number): string {
  const d = new Date(now.getTime() - minutesAgo * 60 * 1000)
  return d.toISOString()
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

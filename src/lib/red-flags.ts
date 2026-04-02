const RED_FLAG_KEYWORDS = [
  "đau mắt",
  "mất thị lực",
  "đột ngột",
  "chấn thương",
]

export function hasRedFlag(reason?: string, chiefComplaint?: string): boolean {
  const text = `${reason ?? ""} ${chiefComplaint ?? ""}`.toLowerCase()
  return RED_FLAG_KEYWORDS.some((keyword) => text.includes(keyword))
}

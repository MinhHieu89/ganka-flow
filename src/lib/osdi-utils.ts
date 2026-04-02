export function getOsdiSeverity(score: number): {
  label: string
  key: "normal" | "moderate" | "severe"
  className: string
} {
  if (score <= 3)
    return {
      label: "Bình thường (0-3)",
      key: "normal",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    }
  if (score <= 8)
    return {
      label: "Trung bình (4-8)",
      key: "moderate",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    }
  return {
    label: "Nặng (≥9)",
    key: "severe",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }
}

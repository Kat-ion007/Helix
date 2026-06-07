export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function formatDateFull(dateStr: string | null | undefined): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) return `${interval}y ago`

  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) return `${interval}mo ago`

  interval = Math.floor(seconds / 86400)
  if (interval >= 1) return `${interval}d ago`

  interval = Math.floor(seconds / 3600)
  if (interval >= 1) return `${interval}h ago`

  interval = Math.floor(seconds / 60)
  if (interval >= 1) return `${interval}m ago`

  if (seconds < 10) return "just now"
  return `${seconds}s ago`
}

export function isSLABreached(slaDueStr: string | null): boolean {
  if (!slaDueStr) return false
  return new Date(slaDueStr).getTime() < Date.now()
}

export function isSLAWarning(slaDueStr: string | null): boolean {
  if (!slaDueStr) return false
  const diff = new Date(slaDueStr).getTime() - Date.now()
  const thirtyMinutes = 30 * 60 * 1000
  return diff > 0 && diff <= thirtyMinutes
}

export function formatSLADue(slaDueStr: string | null): string {
  if (!slaDueStr) return "No SLA"
  
  const diff = new Date(slaDueStr).getTime() - Date.now()
  const isOverdue = diff < 0
  const absDiff = Math.abs(diff)

  const minutes = Math.floor(absDiff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (isOverdue) {
    if (minutes < 1) return "Overdue just now"
    if (minutes < 60) return `${minutes}m overdue`
    if (hours < 24) return `${hours}h overdue`
    return `${days}d overdue`
  } else {
    if (minutes < 1) return "Due now"
    if (minutes < 60) return `in ${minutes}m`
    if (hours < 24) return `in ${hours}h`
    return `in ${days}d`
  }
}

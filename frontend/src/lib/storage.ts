/**
 * Namespaced localStorage access. Every read is guarded because private-mode
 * browsers throw on access rather than returning null.
 */
const PREFIX = 'jobtracker.'

export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key)
  } catch {
    return null
  }
}

export function writeStored(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(PREFIX + key)
    } else {
      localStorage.setItem(PREFIX + key, value)
    }
  } catch {
    // Storage unavailable — the session simply will not survive a reload.
  }
}

// In-memory challenge store (use Redis in production)
const challenges = new Map<string, { challenge: string; expiresAt: number }>()

export function storeChallenge(key: string, challenge: string) {
  challenges.set(key, {
    challenge,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  })
}

export function getChallenge(key: string): string | null {
  const entry = challenges.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    challenges.delete(key)
    return null
  }
  challenges.delete(key)
  return entry.challenge
}

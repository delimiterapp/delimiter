import { randomBytes } from 'crypto'

export function generateProjectKey(): string {
  return `dlm_${randomBytes(24).toString('base64url')}`
}

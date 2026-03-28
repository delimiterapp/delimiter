import { PipedreamClient } from '@pipedream/sdk'

let _client: PipedreamClient | null = null

export function getPipedreamClient() {
  if (!_client) {
    _client = new PipedreamClient({
      clientId: process.env.PIPEDREAM_CLIENT_ID,
      clientSecret: process.env.PIPEDREAM_CLIENT_SECRET,
      projectId: process.env.PIPEDREAM_PROJECT_ID,
      projectEnvironment: (process.env.PIPEDREAM_ENVIRONMENT as 'development' | 'production') || 'development',
    })
  }
  return _client
}

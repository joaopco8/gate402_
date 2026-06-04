import { PrivyClient } from '@privy-io/server-auth'

let _privy: PrivyClient | null = null

export function getPrivy(): PrivyClient {
  if (!_privy) {
    if (!process.env.PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
      throw new Error('Missing PRIVY_APP_ID or PRIVY_APP_SECRET')
    }
    _privy = new PrivyClient(process.env.PRIVY_APP_ID, process.env.PRIVY_APP_SECRET)
  }
  return _privy
}

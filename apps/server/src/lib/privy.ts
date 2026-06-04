import { PrivyClient } from '@privy-io/server-auth'

if (!process.env.PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  throw new Error('Missing PRIVY_APP_ID or PRIVY_APP_SECRET')
}

export const privy = new PrivyClient(
  process.env.PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET,
)

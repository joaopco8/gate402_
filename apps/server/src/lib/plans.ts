export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    maxProxyEndpoints: 3,
    maxAgentWallets: 1,
    maxCallsVisible: 5,
    analyticsDays: 7,
    csvExport: false,
    mrrProjection: false,
    latencyPercentiles: false,
    topPayingAgents: false,
    revenueBreakdown: false,
    whiteLabel: false,
  },
  starter: {
    name: 'Starter',
    price: 29,
    maxProxyEndpoints: 10,
    maxAgentWallets: 5,
    maxCallsVisible: 20,
    analyticsDays: 30,
    csvExport: false,
    mrrProjection: false,
    latencyPercentiles: false,
    topPayingAgents: false,
    revenueBreakdown: false,
    whiteLabel: false,
  },
  pro: {
    name: 'Pro',
    price: 99,
    maxProxyEndpoints: null,
    maxAgentWallets: 20,
    maxCallsVisible: 50,
    analyticsDays: 90,
    csvExport: true,
    mrrProjection: true,
    latencyPercentiles: true,
    topPayingAgents: true,
    revenueBreakdown: true,
    whiteLabel: false,
  },
  enterprise: {
    name: 'Enterprise',
    price: null,
    maxProxyEndpoints: null,
    maxAgentWallets: null,
    maxCallsVisible: null,
    analyticsDays: null,
    csvExport: true,
    mrrProjection: true,
    latencyPercentiles: true,
    topPayingAgents: true,
    revenueBreakdown: true,
    whiteLabel: true,
  },
} as const

export type PlanName = keyof typeof PLANS

export function getPlanLimits(plan: string) {
  return PLANS[plan as PlanName] ?? PLANS.free
}

import { getPlanLimits } from '../lib/plans'

describe('Plan limits', () => {
  it('free has correct limits', () => {
    const l = getPlanLimits('free')
    expect(l.maxProxyEndpoints).toBe(3)
    expect(l.maxAgentWallets).toBe(1)
    expect(l.maxCallsVisible).toBe(5)
    expect(l.analyticsDays).toBe(7)
    expect(l.csvExport).toBe(false)
    expect(l.mrrProjection).toBe(false)
  })

  it('starter has correct limits', () => {
    const l = getPlanLimits('starter')
    expect(l.maxProxyEndpoints).toBe(10)
    expect(l.maxAgentWallets).toBe(5)
    expect(l.maxCallsVisible).toBe(20)
    expect(l.analyticsDays).toBe(30)
    expect(l.csvExport).toBe(false)
  })

  it('pro has correct limits', () => {
    const l = getPlanLimits('pro')
    expect(l.maxProxyEndpoints).toBeNull()
    expect(l.maxAgentWallets).toBe(20)
    expect(l.maxCallsVisible).toBe(50)
    expect(l.analyticsDays).toBe(90)
    expect(l.csvExport).toBe(true)
    expect(l.mrrProjection).toBe(true)
    expect(l.latencyPercentiles).toBe(true)
  })

  it('enterprise has no limits', () => {
    const l = getPlanLimits('enterprise')
    expect(l.maxProxyEndpoints).toBeNull()
    expect(l.maxAgentWallets).toBeNull()
    expect(l.maxCallsVisible).toBeNull()
    expect(l.analyticsDays).toBeNull()
    expect(l.csvExport).toBe(true)
    expect(l.whiteLabel).toBe(true)
  })

  it('unknown plan defaults to free', () => {
    const l = getPlanLimits('invalid_plan')
    expect(l.maxProxyEndpoints).toBe(3)
    expect(l.maxAgentWallets).toBe(1)
  })
})

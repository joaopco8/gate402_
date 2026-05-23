import { gate402, gate402MCP } from '../index'

describe('gate402 middleware factory', () => {
  it('exports gate402 as function', () => {
    expect(typeof gate402).toBe('function')
  })

  it('gate402() returns Express middleware (arity 3)', () => {
    const mw = gate402({ apiKey: 'test-key', endpoints: { '/api/test': 0.001 } })
    expect(typeof mw).toBe('function')
    expect(mw.length).toBe(3)
  })

  it('gate402() works with apiKey and local endpoints', () => {
    const mw = gate402({ apiKey: 'test-key', walletAddress: 'some-wallet', endpoints: { '/api/test': 0.001 } })
    expect(typeof mw).toBe('function')
  })

  it('exports gate402MCP as function', () => {
    expect(typeof gate402MCP).toBe('function')
  })

  it('gate402MCP() returns middleware function', () => {
    const mw = gate402MCP({
      apiKey: 'test-key',
      walletAddress: 'test-wallet',
      defaultToolPrice: 0.001,
    })
    expect(typeof mw).toBe('function')
  })
})

export class Gate402AgentError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'Gate402AgentError'
  }
}

export class SpendingLimitError extends Gate402AgentError {
  constructor(message: string) {
    super(message, 'SPENDING_LIMIT_EXCEEDED')
  }
}

export class PaymentFailedError extends Gate402AgentError {
  constructor(message: string) {
    super(message, 'PAYMENT_FAILED')
  }
}

export class InsufficientBalanceError extends Gate402AgentError {
  constructor(available: number, required: number) {
    super(
      `Insufficient USDC balance. Available: ${available}, Required: ${required}`,
      'INSUFFICIENT_BALANCE'
    )
  }
}

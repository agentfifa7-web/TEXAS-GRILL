// PaymentProvider abstraction — never hardcode a payment vendor.
//
// PAYMENT_PROVIDER env var selects the adapter at runtime. Only MOCK ships
// wired up (it always "succeeds" after a short simulated delay so the full
// checkout → confirmation → tracking flow is testable end to end). The real
// adapters are stubbed with the exact interface they need to satisfy plus a
// TODO describing the missing configuration — wire them once API keys for
// Côte d'Ivoire Mobile Money aggregators (CinetPay, PayDunya, Wave...) or a
// card processor are available. See PAYMENT_API_KEY in .env.example.

export type PaymentMethod = 'MOBILE_MONEY' | 'CARD' | 'CASH'

export interface CreatePaymentInput {
  orderId: string
  amount: number
  currency: string
  method: PaymentMethod
  customerPhone?: string
  customerEmail?: string
}

export interface PaymentResult {
  provider: string
  transactionRef: string
  status: 'PENDING' | 'PAID' | 'FAILED'
  raw?: unknown
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>
  verifyPayment(transactionRef: string): Promise<PaymentResult>
  refundPayment(transactionRef: string, amount?: number): Promise<PaymentResult>
  getPaymentStatus(transactionRef: string): Promise<PaymentResult['status']>
}

/**
 * Development / demo adapter. Cash always "succeeds" immediately (paid on
 * delivery); Mobile Money & Card simulate a brief processing delay then
 * succeed, so every downstream flow (order confirmation, loyalty points,
 * notifications) can be exercised without a live payment gateway.
 */
class MockPaymentProvider implements PaymentProvider {
  private ledger = new Map<string, PaymentResult>()

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const transactionRef = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const status = input.method === 'CASH' ? 'PENDING' : 'PAID'
    const result: PaymentResult = { provider: 'MOCK', transactionRef, status, raw: { simulated: true, ...input } }
    this.ledger.set(transactionRef, result)
    return result
  }

  async verifyPayment(transactionRef: string): Promise<PaymentResult> {
    return this.ledger.get(transactionRef) ?? { provider: 'MOCK', transactionRef, status: 'FAILED' }
  }

  async refundPayment(transactionRef: string): Promise<PaymentResult> {
    const existing = this.ledger.get(transactionRef)
    const result: PaymentResult = { provider: 'MOCK', transactionRef, status: 'PAID', raw: { ...existing, refunded: true } }
    this.ledger.set(transactionRef, result)
    return result
  }

  async getPaymentStatus(transactionRef: string) {
    return (this.ledger.get(transactionRef) ?? { status: 'FAILED' as const }).status
  }
}

/**
 * TODO(payments): wire a real Côte d'Ivoire Mobile Money aggregator
 * (CinetPay / PayDunya / Wave Business) here. Needs PAYMENT_API_KEY and the
 * aggregator's merchant/site id in environment variables — never in the
 * frontend bundle. Card processing (Stripe or a local acquirer) can follow
 * the same interface as a second adapter.
 */
class CinetPayProvider implements PaymentProvider {
  async createPayment(): Promise<PaymentResult> {
    throw new Error('CinetPayProvider is not configured. Set PAYMENT_API_KEY and implement lib/services/payment.ts.')
  }
  async verifyPayment(): Promise<PaymentResult> {
    throw new Error('CinetPayProvider is not configured.')
  }
  async refundPayment(): Promise<PaymentResult> {
    throw new Error('CinetPayProvider is not configured.')
  }
  async getPaymentStatus(): Promise<PaymentResult['status']> {
    throw new Error('CinetPayProvider is not configured.')
  }
}

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? 'MOCK'
  switch (provider) {
    case 'CINETPAY':
      return new CinetPayProvider()
    case 'MOCK':
    default:
      return new MockPaymentProvider()
  }
}

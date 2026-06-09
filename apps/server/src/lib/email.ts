import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface PaymentEmailData {
  to: string
  endpoint: string
  amount: number
  txHash: string
  payerWallet?: string
  network: string
}

export async function sendPaymentAlert(data: PaymentEmailData) {
  const { to, endpoint, amount, txHash, payerWallet, network } = data

  const explorerUrl = network === 'mainnet'
    ? `https://explorer.solana.com/tx/${txHash}`
    : `https://explorer.solana.com/tx/${txHash}?cluster=devnet`

  const isDemoTx = txHash.startsWith('demo_')

  try {
    await resend.emails.send({
      from: 'Metera <payments@metera.xyz>',
      to,
      subject: `Payment received — $${amount.toFixed(4)} USDC`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Courier New',monospace;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <!-- Header -->
    <div style="margin-bottom:32px;">
      <span style="color:#00ff88;font-size:18px;font-weight:600;letter-spacing:-0.02em;">metera</span>
      <span style="color:#333;font-size:12px;margin-left:8px;">payment alert</span>
    </div>

    <!-- Main card -->
    <div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:8px;padding:32px;margin-bottom:24px;">
      <div style="color:#333;font-size:11px;letter-spacing:0.1em;margin-bottom:8px;">PAYMENT RECEIVED</div>
      <div style="color:#00ff88;font-size:40px;font-weight:300;margin-bottom:4px;">
        $${amount.toFixed(4)}
      </div>
      <div style="color:#666;font-size:13px;">USDC &middot; ${network}</div>
    </div>

    <!-- Details -->
    <div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:8px;padding:24px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #1a1a1a;">
          <td style="padding:10px 0;color:#333;font-size:11px;letter-spacing:0.06em;">ENDPOINT</td>
          <td style="padding:10px 0;color:#fff;font-size:13px;text-align:right;">${endpoint}</td>
        </tr>
        <tr style="border-bottom:1px solid #1a1a1a;">
          <td style="padding:10px 0;color:#333;font-size:11px;letter-spacing:0.06em;">AMOUNT</td>
          <td style="padding:10px 0;color:#00ff88;font-size:13px;text-align:right;">$${amount.toFixed(4)} USDC</td>
        </tr>
        ${payerWallet ? `
        <tr style="border-bottom:1px solid #1a1a1a;">
          <td style="padding:10px 0;color:#333;font-size:11px;letter-spacing:0.06em;">FROM</td>
          <td style="padding:10px 0;color:#666;font-size:11px;text-align:right;">${payerWallet.slice(0, 8)}...${payerWallet.slice(-6)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding:10px 0;color:#333;font-size:11px;letter-spacing:0.06em;">TX HASH</td>
          <td style="padding:10px 0;color:#666;font-size:11px;text-align:right;">${isDemoTx ? txHash : txHash.slice(0, 8) + '...' + txHash.slice(-6)}</td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://metera.xyz/dashboard"
         style="display:inline-block;background:#00ff88;color:#000;padding:12px 32px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.02em;">
        View Dashboard &rarr;
      </a>
      ${!isDemoTx ? `
      <div style="margin-top:12px;">
        <a href="${explorerUrl}"
           style="color:#333;font-size:11px;text-decoration:none;">
          View on Solana Explorer &nearr;
        </a>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;">
      <p style="color:#333;font-size:11px;margin:0;">
        metera.xyz &middot; Billing infrastructure for AI agents
      </p>
      <p style="color:#1a1a1a;font-size:10px;margin:8px 0 0;">
        You're receiving this because you have email alerts enabled.
      </p>
    </div>

  </div>
</body>
</html>
      `
    })

    console.log(`[email] Payment alert sent to ${to}`)
  } catch (error) {
    console.error('[email] Failed to send payment alert:', error)
    // Não lança erro — email falhou mas pagamento foi confirmado
  }
}

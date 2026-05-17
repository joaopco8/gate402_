import { Bot, Database, LayoutDashboard, Lock, ShieldCheck, Zap } from 'lucide-react'

export function Features() {
    const cards = [
        {
            icon: <Zap style={{ width: 16, height: 16, flexShrink: 0 }} />,
            title: 'Sub-second settlement',
            desc: 'Solana confirms payments in under 400ms. Your handler executes before the agent even notices.',
        },
        {
            icon: <Lock style={{ width: 16, height: 16, flexShrink: 0 }} />,
            title: 'Non-custodial by design',
            desc: 'Payments go directly to your Solana wallet. Gate402 never holds your funds. Not even for a second.',
        },
        {
            icon: <ShieldCheck style={{ width: 16, height: 16, flexShrink: 0 }} />,
            title: 'Replay protection',
            desc: 'Every transaction hash is checked against Redis and PostgreSQL. Duplicate payments are blocked automatically.',
        },
        {
            icon: <Database style={{ width: 16, height: 16, flexShrink: 0 }} />,
            title: 'Three lines of code',
            desc: 'npm install gate402. Import. Use. That\'s it. No config files, no infra, no DevOps.',
        },
        {
            icon: <LayoutDashboard style={{ width: 16, height: 16, flexShrink: 0 }} />,
            title: 'Real-time visibility',
            desc: 'See every payment the moment it lands. Endpoint, amount, agent wallet, timestamp — all in your dashboard.',
        },
        {
            icon: <Bot style={{ width: 16, height: 16, flexShrink: 0 }} />,
            title: 'Built for agents',
            desc: 'HTTP 402, x402 protocol, Solana, USDC. The full stack for machine-to-machine billing, ready today.',
        },
    ]

    return (
        <section style={{ paddingTop: '48px', paddingBottom: '48px', backgroundColor: '#111111' }}>
            <style>{`
                @media (min-width: 768px) {
                    .feat-outer { gap: 64px !important; }
                    .feat-header { gap: 48px !important; }
                    .feat-section { padding-top: 80px !important; padding-bottom: 80px !important; }
                }
                .feat-grid { grid-template-columns: repeat(3,1fr) !important; max-width: 896px !important; }
                @media (max-width: 639px) {
                    .feat-grid { grid-template-columns: 1fr !important; }
                }
                @media (min-width: 1024px) {
                    .feat-title { font-size: 3rem !important; }
                }
            `}</style>

            <div className="feat-outer" style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '1024px', display: 'flex', flexDirection: 'column', gap: '32px', paddingLeft: '24px', paddingRight: '24px' }}>

                <div className="feat-header" style={{ position: 'relative', zIndex: 10, marginLeft: 'auto', marginRight: 'auto', maxWidth: '576px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 500, lineHeight: 1.15 }}>
                        The infrastructure layer agents were missing.
                    </h2>
                    <p style={{ fontSize: 16, color: '#898989', lineHeight: 1.65 }}>Gate402 sits between your API and the world. Every request verified. Every payment settled. Every cent tracked.</p>
                </div>

                {/* Grid — outer border + each cell gets right+bottom border to simulate divide-x divide-y */}
                <div className="feat-grid" style={{
                    position: 'relative',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    maxWidth: '896px',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    borderLeft: '1px solid rgba(255,255,255,0.15)',
                }}>
                    {cards.map((card) => (
                        <div key={card.title} style={{
                            padding: '48px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: card.title === 'Faaast' ? '12px' : '8px',
                            borderRight: '1px solid rgba(255,255,255,0.15)',
                            borderBottom: '1px solid rgba(255,255,255,0.15)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {card.icon}
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 500 }}>{card.title}</h3>
                            </div>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{card.desc}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}

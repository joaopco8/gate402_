import Image from 'next/image'
import { Key, LayoutDashboard, Wallet, Zap } from 'lucide-react'

export function Features() {
    return (
        <section className="overflow-hidden py-16 md:py-32" style={{ background: '#111111' }}>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
                <div className="relative z-10 max-w-2xl">
                    <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 500, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}><span style={{ color: '#898989' }}>Built for developers who</span> <span style={{ color: '#fff' }}>ship fast.</span></h2>
                    <p style={{ fontSize: 16, color: '#898989', lineHeight: 1.65, marginTop: 12 }}>From npm install to first paid API call in under five minutes. No accounts to approve. No contracts to sign. No minimums.</p>
                </div>

                <div className="relative -mx-4 rounded-3xl p-3 md:-mx-12 lg:col-span-3">
                    <div style={{ perspective: '800px' }}>
                        <div style={{ transform: 'skewY(-2deg) skewX(-2deg) rotateX(6deg)' }}>
                            <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid #1a1a1a' }}>
                                {/* Bottom fade */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '30%',
                                    zIndex: 2,
                                    background: 'linear-gradient(to top, #111111 0%, transparent 100%)',
                                    pointerEvents: 'none',
                                }} />
                                <Image
                                    src="/preview-dash.png"
                                    alt="Metera real-time payment dashboard"
                                    width={1920}
                                    height={1080}
                                    loading="lazy"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" style={{ color: '#ffffff' }} />
                            <h3 className="text-sm font-medium" style={{ color: '#ffffff' }}>Instant setup</h3>
                        </div>
                        <p className="text-sm" style={{ color: '#6b7280' }}>Three lines of middleware. Your API charges agents on the first request.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Wallet className="size-4" style={{ color: '#ffffff' }} />
                            <h3 className="text-sm font-medium" style={{ color: '#ffffff' }}>Direct to your wallet</h3>
                        </div>
                        <p className="text-sm" style={{ color: '#6b7280' }}>USDC lands in your Solana wallet directly. No withdrawal delays. No platform holds.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <LayoutDashboard className="size-4" style={{ color: '#ffffff' }} />
                            <h3 className="text-sm font-medium" style={{ color: '#ffffff' }}>Real-time dashboard</h3>
                        </div>
                        <p className="text-sm" style={{ color: '#6b7280' }}>Every call logged. Revenue, latency, top agents. Watch payments arrive as they happen.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Key className="size-4" style={{ color: '#ffffff' }} />
                            <h3 className="text-sm font-medium" style={{ color: '#ffffff' }}>Zero friction onboarding</h3>
                        </div>
                        <p className="text-sm" style={{ color: '#6b7280' }}>Sign in with GitHub. Copy your key. Ship. No approval process. No business verification.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

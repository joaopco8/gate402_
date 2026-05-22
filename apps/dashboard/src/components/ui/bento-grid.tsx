"use client";

import {
    Box,
    Bot,
    Code2,
    Cpu,
    Sparkles,
    Terminal,
} from "lucide-react";
import { useState } from "react";

export interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
}

interface BentoGridProps {
    items?: BentoItem[];
}

const itemsSample: BentoItem[] = [
    {
        title: "Express SDK",
        meta: "v0.5.0",
        description: "Drop-in x402 middleware for any Express API. Three lines of code. Agents pay. You receive USDC.",
        icon: <Box style={{ width: 16, height: 16, color: '#00bc7d' }} />,
        status: "Live",
        tags: ["nodejs", "typescript", "x402"],
        hasPersistentHover: true,
    },
    {
        title: "MCP Middleware",
        meta: "v0.4.0",
        description: "Charge per tool call on any MCP server. Compatible with Claude, GPT-4, AutoGen, and any x402 agent.",
        icon: <Bot style={{ width: 16, height: 16, color: '#10b981' }} />,
        status: "Stable",
        tags: ["mcp", "agents", "anthropic"],
    },
    {
        title: "Next.js Plugin",
        meta: "v0.1.0-alpha",
        description: "Monetize API routes natively in Next.js App Router. No separate Express server. Edge-compatible.",
        icon: <Code2 style={{ width: 16, height: 16, color: '#a855f7' }} />,
        status: "Coming Soon",
        tags: ["nextjs", "vercel", "edge"],
    },
    {
        title: "Rust Gateway",
        meta: "Actix-Web",
        description: "High-performance reverse proxy with native Solana verification. 100k+ req/s. No Node.js. No overhead.",
        icon: <Cpu style={{ width: 16, height: 16, color: '#f97316' }} />,
        status: "Beta",
        tags: ["rust", "actix", "solana"],
    },
    {
        title: "Agent SDK",
        meta: "v0.1.3",
        description: "Autonomous payment for any AI agent. Detects 402, pays in USDC, retries — zero human interaction required.",
        icon: <Sparkles style={{ width: 16, height: 16, color: '#facc15' }} />,
        status: "Stable",
        tags: ["agents", "gate402-agent", "x402"],
    },
    {
        title: "CLI Generator",
        meta: "npx create-gate402-mcp",
        description: "Scaffold a complete MCP server with Gate402 pre-configured. Per-tool pricing, devnet ready, deploy in minutes.",
        icon: <Terminal style={{ width: 16, height: 16, color: '#38bdf8' }} />,
        status: "Stable",
        tags: ["cli", "mcp", "scaffold"],
    },
];

function BentoCard({ item }: { item: BentoItem }) {
    const [hovered, setHovered] = useState(false);
    const active = item.hasPersistentHover || hovered;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={item.colSpan === 2 ? 'bento-col2' : ''}
            style={{
                position: 'relative',
                padding: '16px',
                borderRadius: '6px',
                overflow: 'hidden',
                transition: 'all 0.3s',
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#111111',
                transform: active ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: active ? '0 2px 12px rgba(255,255,255,0.04)' : 'none',
                willChange: 'transform',
                gridColumn: item.colSpan === 2 ? 'span 2' : 'span 1',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* dot pattern overlay */}
            {active && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.025) 1px, transparent 1px)',
                    backgroundSize: '4px 4px',
                    pointerEvents: 'none',
                }} />
            )}

            {/* gradient border */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: -1,
                borderRadius: '6px',
                padding: '1px',
                background: active
                    ? 'linear-gradient(135deg, transparent, rgba(255,255,255,0.08), transparent)'
                    : 'transparent',
                transition: 'opacity 0.3s',
                pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* top row: icon + status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: active
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
                            : 'rgba(255,255,255,0.08)',
                        transition: 'all 0.3s',
                    }}>
                        {item.icon}
                    </div>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backdropFilter: 'blur(4px)',
                        background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.7)',
                        transition: 'background 0.3s',
                    }}>
                        {item.status || 'Active'}
                    </span>
                </div>

                {/* title + description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{
                        fontWeight: 500,
                        color: '#f1f1f1',
                        letterSpacing: '-0.01em',
                        fontSize: '15px',
                        lineHeight: 1.3,
                    }}>
                        {item.title}
                        <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
                            {item.meta}
                        </span>
                    </h3>
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.5,
                    }}>
                        {item.description}
                    </p>
                </div>

                {/* tags + cta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.tags?.map((tag, i) => (
                            <span key={i} style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255,255,255,0.45)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'rgba(255,255,255,0.07)',
                                backdropFilter: 'blur(4px)',
                                transition: 'background 0.2s',
                            }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.4)',
                        opacity: hovered ? 1 : 0,
                        transition: 'opacity 0.3s',
                    }}>
                        {item.cta || 'Explore →'}
                    </span>
                </div>
            </div>
        </div>
    );
}

function BentoGrid({ items = itemsSample }: BentoGridProps) {
    return (
        <>
            <style>{`
                .bento-grid { grid-template-columns: repeat(3, 1fr) !important; }
                @media (max-width: 767px) {
                    .bento-grid { grid-template-columns: 1fr !important; }
                    .bento-col2 { grid-column: span 1 !important; }
                }
                @media (min-width: 768px) and (max-width: 1023px) {
                    .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
            <div className="bento-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '16px',
                maxWidth: '1280px',
                marginLeft: 'auto',
                marginRight: 'auto',
            }}>
                {items.map((item, index) => (
                    <BentoCard key={index} item={item} />
                ))}
            </div>
        </>
    );
}

export { BentoGrid }

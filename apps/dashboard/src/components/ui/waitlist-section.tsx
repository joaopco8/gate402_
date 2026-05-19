"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 42, hours: 11, minutes: 37, seconds: 14 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        else if (days > 0) { days--; hours = 23; minutes = 59; seconds = 59; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setIsSubmitted(true);
  };

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#111111', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 32px)' }}>
      <style>{`
        .waitlist-inner {
          max-width: 1024px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 767px) {
          .waitlist-inner { grid-template-columns: 1fr; gap: 32px; }
        }
        @keyframes waitlist-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .waitlist-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255,255,255,0.045) 50%,
            transparent 60%
          );
          animation: waitlist-shimmer 3.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      <div className="waitlist-shimmer" />
      <div className="waitlist-inner">
        {/* Left */}
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00bc7d', marginBottom: 14, fontWeight: 500 }}>
            Early Access
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 500, lineHeight: 1.15, color: '#fff', marginBottom: 14 }}>
            Join the waitlist
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, maxWidth: 400 }}>
            Gate402 is rolling out access in waves. Get in early — be the first to monetize your API for AI agents.
          </p>
        </div>

        {/* Right */}
        <div>
          {!isSubmitted ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ display: 'flex' }}>
                  {[
                    { src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png', fallback: 'OS' },
                    { src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png', fallback: 'HL' },
                    { src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png', fallback: 'HR' },
                  ].map((av, i) => (
                    <Avatar key={av.fallback} className="ring-[#111] ring-2" style={{ width: 30, height: 30, marginLeft: i === 0 ? 0 : -8 }}>
                      <AvatarImage src={av.src} alt={av.fallback} />
                      <AvatarFallback className="text-xs">{av.fallback}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: '#6b7280' }}>243 devs already joined</span>
              </div>

              <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#fff',
                      padding: '0 14px',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      height: 44,
                      padding: '0 20px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#00bc7d',
                      color: '#000',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Get access
                  </button>
                </div>
              </form>

              <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #1a1a1a', paddingTop: 24 }}>
                {[
                  { label: 'days', val: timeLeft.days },
                  { label: 'hours', val: timeLeft.hours },
                  { label: 'min', val: timeLeft.minutes },
                  { label: 'sec', val: timeLeft.seconds },
                ].map((item, i) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', minWidth: 60 }}>
                      <div style={{ fontSize: 28, fontWeight: 300, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                        {String(item.val).padStart(2, '0')}
                      </div>
                      <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 5 }}>
                        {item.label}
                      </div>
                    </div>
                    {i < 3 && <span style={{ color: '#333', fontSize: 18, padding: '0 4px', marginBottom: 14 }}>:</span>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, flexShrink: 0, borderRadius: '50%',
                background: 'rgba(0,188,125,0.1)', border: '1px solid rgba(0,188,125,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" fill="none" stroke="#00bc7d" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 4 }}>You&apos;re on the list</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>We&apos;ll reach out when your access is ready.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

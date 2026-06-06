'use client'

export function AgentWalletsEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16, background: 'rgba(122,242,121,0.06)',
        border: '1px solid rgba(122,242,121,0.12)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: 24,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7AF279" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
          <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
          <path d="M12 7v4"/><path d="M8 15h.01M12 15h.01M16 15h.01"/>
        </svg>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 300, color: '#E8F4EE', marginBottom: 8, fontFamily: 'var(--font-label)' }}>
        No agent wallets yet
      </h3>
      <p style={{ fontSize: 13, color: '#4A5549', maxWidth: 280, marginBottom: 32, lineHeight: 1.6, fontFamily: 'var(--font-label)' }}>
        Create your first agent wallet to control the spending of your AI agents.
      </p>
      <button onClick={onAction} style={{
        padding: '12px 24px', background: '#7AF279', color: '#1B1E1B',
        fontSize: 13, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-label)',
      }}>
        Create agent wallet
      </button>
    </div>
  )
}

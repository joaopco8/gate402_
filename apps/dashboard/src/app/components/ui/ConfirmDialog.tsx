'use client'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  danger?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 360, margin: '0 16px',
        background: '#1B1E1B', border: '1px solid #2A2E2A', borderRadius: 12,
        padding: 24, boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(122,242,121,0.06)',
            border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'rgba(122,242,121,0.15)'}`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={danger ? '#f87171' : '#7AF279'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: '#fff', fontFamily: 'var(--font-display)' }}>{title}</h3>
        </div>
        <p style={{ fontSize: 13, color: '#7A8C79', lineHeight: 1.6, marginBottom: 24, fontFamily: 'var(--font-display)' }}>
          {description}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px 0', fontSize: 13, border: '1px solid #2A2E2A',
            color: '#7A8C79', background: 'transparent', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'var(--font-display)',
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} style={{
            flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: 'pointer',
            border: 'none', fontFamily: 'var(--font-display)',
            background: danger ? '#ef4444' : '#7AF279',
            color: danger ? '#fff' : '#1B1E1B',
            opacity: loading ? 0.5 : 1,
          }}>
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: 'var(--page-padding-top) var(--content-padding)',
      animation: 'fadeInUp 0.4s ease-out both',
    }}>
      {children}
    </div>
  )
}

export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      animation: 'fadeIn 0.2s ease-out both',
    }}>
      {children}
    </div>
  )
}

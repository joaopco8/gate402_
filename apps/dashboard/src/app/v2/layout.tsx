import type { Metadata } from 'next'

export const metadata: Metadata = {
  icons: {
    icon: '/logos/favicon-metera-white.png',
  },
}

export default function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        html, body { background: #1B1E1B !important; margin: 0; padding: 0; }
      `}</style>
      {children}
    </>
  )
}

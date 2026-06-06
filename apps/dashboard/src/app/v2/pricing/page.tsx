'use client'
import '../../../styles/v2/tokens.css'
import { MeteraPricingSection } from '../../../components/v2/metera-pricing-section'
import { V2Navbar } from '../../../components/v2/v2-navbar'

const LINE = '1px solid #2A2E2A'
const MAX_WIDTH = '1200px'

export default function V2PricingPage() {
  return (
    <div style={{
      background: '#1B1E1B',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      color: '#E8F4EE',
    }}>
      <V2Navbar activePage="pricing" />
      <div className="v2r-page-border" style={{
        maxWidth: MAX_WIDTH,
        margin: '0 auto',
        borderLeft: LINE,
        borderRight: LINE,
      }}>
        <MeteraPricingSection />
      </div>
    </div>
  )
}

'use client'

import { Pricing1 } from '@/components/ui/pricing-1'
import { Component as FlickeringFooter } from '@/components/ui/flickering-footer'
import { LandingNavbar } from '@/components/ui/landing-navbar'

export default function PricingPage() {
  return (
    <div style={{ background: '#111212', minHeight: '100vh', color: '#fff' }}>
      <LandingNavbar activePage="pricing" />
      <div style={{ paddingTop: 70 }}>
        <Pricing1 />
      </div>
      <FlickeringFooter />
    </div>
  )
}

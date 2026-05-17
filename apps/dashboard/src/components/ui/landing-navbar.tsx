"use client";

import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, type Variants } from 'framer-motion';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ── types ── */
interface DropdownItem {
  label: string;
  desc?: string;
  href: string;
  target?: string;
  badge?: string;
}
interface DropdownSection {
  title?: string;
  items: DropdownItem[];
  highlight?: boolean;
}

/* ── data ── */
const PRODUCT_SECTIONS: DropdownSection[] = [
  {
    items: [
      { label: 'Overview', desc: 'The x402 billing layer for AI agents', href: '/' },
    ],
  },
  {
    title: 'SDKs',
    items: [
      { label: 'Provider SDK',    desc: 'Monetize any API',                href: '/docs#installation' },
      { label: 'Agent SDK',       desc: 'Agents that pay automatically',    href: '/docs#installation-agent' },
      { label: 'MCP Integration', desc: 'Charge per tool call',             href: '/docs#add-to-existing-mcp' },
      { label: 'Rust Gateway',    desc: 'High-performance proxy',           href: '/docs#rust-gateway', badge: 'BETA' },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { label: 'Dashboard',  desc: 'Real-time payment visibility', href: '/dashboard' },
      { label: 'Analytics',  desc: 'Revenue, latency, top agents', href: '/dashboard' },
    ],
  },
];

const DEVELOPERS_SECTIONS: DropdownSection[] = [
  {
    items: [
      { label: 'Documentation', desc: 'Full SDK reference and guides', href: '/docs' },
    ],
  },
  {
    title: 'RESOURCES',
    items: [
      { label: 'Quick Start',    desc: '5 minutes to first paid call',   href: '/docs#quick-start' },
      { label: 'API Reference',  desc: 'All server endpoints',           href: '/docs#api-reference' },
      { label: 'GitHub',         desc: 'MIT licensed — open source',     href: 'https://github.com/joaopco8/gate402_', target: '_blank' },
      { label: 'Changelog',      desc: "What's new",                     href: '/changelog' },
    ],
  },
  {
    title: 'FEATURED',
    highlight: true,
    items: [
      { label: 'Rust Gateway Beta', desc: '100k+ req/s. Native Solana verification.', href: '/docs#rust-gateway', badge: 'NEW' },
    ],
  },
];

const COMPANY_SECTIONS: DropdownSection[] = [
  {
    items: [
      { label: 'About',     desc: 'Why we built this',      href: '/about' },
      { label: 'Blog',      desc: 'Updates and insights',   href: '/blog' },
      { label: 'Twitter/X', desc: '@gate402',               href: 'https://x.com/gate402', target: '_blank' },
      { label: 'GitHub',    desc: 'joaopco8/gate402_',      href: 'https://github.com/joaopco8/gate402_', target: '_blank' },
    ],
  },
];

/* ── sub-components ── */
const Badge = ({ text }: { text: string }) => (
  <span style={{
    fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
    color: '#00bc7d', background: 'rgba(0,188,125,0.12)',
    border: '1px solid rgba(0,188,125,0.25)',
    borderRadius: 3, padding: '1px 5px',
    verticalAlign: 'middle', marginLeft: 6,
  }}>
    {text}
  </span>
);

const DropdownItemRow = ({ item }: { item: DropdownItem }) => {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={item.href}
      target={item.target}
      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 1,
        padding: '8px 10px', borderRadius: 6, textDecoration: 'none',
        background: hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500, color: hov ? '#fff' : '#e5e7eb', transition: 'color 0.15s' }}>
        {item.label}{item.badge && <Badge text={item.badge} />}
      </span>
      {item.desc && (
        <span style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{item.desc}</span>
      )}
    </a>
  );
};

const Divider = () => (
  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
);

const DropdownPanel = ({ sections, grid }: { sections: DropdownSection[]; grid?: boolean }) => (
  <div style={{
    background: '#111111', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
    padding: 8, minWidth: grid ? 320 : 240,
  }}>
    {sections.map((section, si) => (
      <React.Fragment key={si}>
        {si > 0 && <Divider />}
        {section.title && (
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#4b5563', padding: '4px 10px 2px', textTransform: 'uppercase' }}>
            {section.title}
          </div>
        )}
        <div style={grid ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 } : { display: 'flex', flexDirection: 'column', gap: 1 }}>
          {section.items.map((item, ii) => (
            <DropdownItemRow key={ii} item={item} />
          ))}
        </div>
      </React.Fragment>
    ))}
  </div>
);

interface NavDropdownProps {
  label: string;
  sections: DropdownSection[];
  grid?: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const NavDropdown = ({ label, sections, grid, isOpen, onOpen, onClose }: NavDropdownProps) => (
  <div style={{ position: 'relative' }} onMouseEnter={onOpen} onMouseLeave={onClose}>
    <button style={{
      background: 'none', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 4,
      fontSize: '0.875rem', fontWeight: 500,
      color: isOpen ? '#fff' : '#d1d5db', padding: '4px 0',
      transition: 'color 0.2s',
    }}>
      {label}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        style={{ width: 12, height: 12, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.12 } }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ position: 'absolute', top: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}
        >
          <DropdownPanel sections={sections} grid={grid} />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const NavLink = ({ href, children }: { href: string; children: ReactNode }) => {
  const [hov, setHov] = useState(false);
  return (
    <a href={href} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', fontSize: '0.875rem', fontWeight: 500, color: hov ? '#fff' : '#d1d5db', textDecoration: 'none', padding: '4px 0', transition: 'color 0.2s' }}>
      {children}
      <span style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 1, background: '#00bc7d', transform: hov ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 0.25s ease' }} />
    </a>
  );
};

/* ── mobile menu ── */
interface MobileMenuProps { isOpen: boolean; onClose: () => void }
const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const variants: Variants = {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit:    { opacity: 0, y: -16, transition: { duration: 0.15 } },
  };
  const MobileSection = ({ label, items }: { label: string; items: DropdownItem[] }) => (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      {items.map((item, i) => (
        <a key={i} href={item.href} target={item.target} rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
          onClick={onClose}
          style={{ display: 'block', fontSize: 14, color: '#d1d5db', textDecoration: 'none', padding: '5px 0' }}>
          {item.label}{item.badge && <Badge text={item.badge} />}
        </a>
      ))}
    </div>
  );
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="mobile-menu" variants={variants} initial="hidden" animate="visible" exit="exit"
          style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(17,17,17,0.98)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px 24px', zIndex: 99 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MobileSection label="Product" items={[
              { label: 'Overview', href: '/' },
              { label: 'Provider SDK', href: '/docs#installation' },
              { label: 'Agent SDK', href: '/docs#installation-agent' },
              { label: 'MCP Integration', href: '/docs#add-to-existing-mcp' },
              { label: 'Rust Gateway', href: '/docs#rust-gateway', badge: 'BETA' },
            ]} />
            <MobileSection label="Developers" items={[
              { label: 'Documentation', href: '/docs' },
              { label: 'Quick Start', href: '/docs#quick-start' },
              { label: 'API Reference', href: '/docs#api-reference' },
              { label: 'GitHub', href: 'https://github.com/joaopco8/gate402_', target: '_blank' },
            ]} />
            <MobileSection label="Company" items={[
              { label: 'About', href: '/about' },
              { label: 'Blog', href: '/blog' },
              { label: 'Twitter/X', href: 'https://x.com/gate402', target: '_blank' },
            ]} />
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
              <a href="/pricing" onClick={onClose} style={{ display: 'block', fontSize: 14, color: '#d1d5db', textDecoration: 'none', padding: '5px 0' }}>Pricing</a>
              <a href="/docs" onClick={onClose} style={{ display: 'block', fontSize: 14, color: '#d1d5db', textDecoration: 'none', padding: '5px 0' }}>Docs</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="/auth/login" onClick={onClose} style={{ fontSize: 14, color: '#d1d5db', textDecoration: 'none', textAlign: 'center', padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6 }}>Sign in</a>
              <a href="/auth/login" onClick={onClose} style={{ fontSize: 14, fontWeight: 600, color: '#111111', background: '#00bc7d', textDecoration: 'none', textAlign: 'center', padding: '10px', borderRadius: 6 }}>Get started →</a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── main export ── */
export function LandingNavbar({ activePage }: { activePage?: string }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setIsScrolled(v > 10));

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const headerVariants: Variants = {
    top:      { backgroundColor: 'rgba(17,17,17,0.85)', borderBottomColor: 'rgba(55,65,81,0.4)', boxShadow: 'none' },
    scrolled: { backgroundColor: 'rgba(17,17,17,0.97)', borderBottomColor: 'rgba(75,85,99,0.6)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' },
  };

  return (
    <motion.header
      variants={headerVariants} initial="top" animate={isScrolled ? 'scrolled' : 'top'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid', paddingLeft: 24, paddingRight: 24 }}
    >
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1280, margin: '0 auto', height: 64 }}>

        {/* Logo */}
        <a href="/" style={{ flexShrink: 0, textDecoration: 'none' }}>
          <img src="/logo-gate.png" alt="Gate402" style={{ height: 24, width: 'auto', display: 'block' }} />
        </a>

        {/* Desktop center nav */}
        <div className="lnav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '0 24px' }}>
          <NavDropdown label="Product" sections={PRODUCT_SECTIONS}
            isOpen={openDropdown === 'product'} onOpen={() => setOpenDropdown('product')} onClose={() => setOpenDropdown(null)} />
          <NavDropdown label="Developers" sections={DEVELOPERS_SECTIONS}
            isOpen={openDropdown === 'developers'} onOpen={() => setOpenDropdown('developers')} onClose={() => setOpenDropdown(null)} />
          <NavDropdown label="Company" sections={COMPANY_SECTIONS} grid
            isOpen={openDropdown === 'company'} onOpen={() => setOpenDropdown('company')} onClose={() => setOpenDropdown(null)} />
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/docs">Docs</NavLink>
        </div>

        {/* Desktop right */}
        <div className="lnav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
          <NavLink href="/auth/login">Sign in</NavLink>
          <motion.a href="/auth/login"
            style={{ background: '#00bc7d', color: '#111111', padding: '6px 16px', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
            whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
            Get started →
          </motion.a>
        </div>

        {/* Mobile toggle */}
        <button className="lnav-mobile" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: 4 }}
          aria-label="Toggle menu">
          {mobileOpen
            ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          }
        </button>
      </nav>

      <style>{`
        .lnav-desktop { display: flex !important; }
        .lnav-mobile  { display: none  !important; }
        @media (max-width: 768px) {
          .lnav-desktop { display: none  !important; }
          .lnav-mobile  { display: block !important; }
        }
      `}</style>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </motion.header>
  );
}

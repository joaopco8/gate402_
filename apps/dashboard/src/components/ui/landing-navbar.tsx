"use client";

import React, { useState, type ReactNode, type SVGProps, type MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, type Variants } from 'framer-motion';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface NavLinkProps {
  href?: string;
  children: ReactNode;
  hasDropdown?: boolean;
  isDropdownOpen?: boolean;
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href = "#", children, hasDropdown = false, isDropdownOpen = false, onClick }) => (
  <motion.a
    href={href}
    onClick={onClick}
    style={{ position: 'relative', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer', transition: 'color 0.2s' }}
    whileHover={{ color: '#ffffff' }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
    {hasDropdown && <ChevronDownIcon isOpen={isDropdownOpen} />}
    {!hasDropdown && (
      <motion.div
        style={{ position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '1px', backgroundColor: '#0CF2A0', scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    )}
  </motion.a>
);

interface DropdownMenuProps {
  children: ReactNode;
  isOpen: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, isOpen }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', width: '224px', transformOrigin: 'top', zIndex: 40 }}
      >
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(55,65,81,0.5)', borderRadius: '6px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)', padding: '8px' }}>
          {children}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

interface DropdownItemProps {
  href?: string;
  children: ReactNode;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ href = "#", children }) => (
  <a href={href} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: '4px', fontSize: '0.875rem', color: '#d1d5db', textDecoration: 'none', transition: 'background 0.15s, color 0.15s' }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#d1d5db'; }}
  >
    {children}
  </a>
);

const ChevronDownIcon: React.FC<SVGProps<SVGSVGElement> & { isOpen?: boolean }> = ({ isOpen, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
    style={{ width: '12px', height: '12px', marginLeft: '4px', display: 'inline-block', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
    {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const MenuIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export function LandingNavbar({ activePage }: { activePage?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  const headerVariants: Variants = {
    top: {
      backgroundColor: "rgba(17, 17, 17, 0.8)",
      borderBottomColor: "rgba(55, 65, 81, 0.5)",
      boxShadow: 'none',
    },
    scrolled: {
      backgroundColor: "rgba(17, 17, 17, 0.95)",
      borderBottomColor: "rgba(75, 85, 99, 0.7)",
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }
  };

  const mobileMenuVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.15, ease: "easeIn" } }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="top"
      animate={isScrolled ? "scrolled" : "top"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        paddingLeft: '24px',
        paddingRight: '24px',
      }}
    >
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1280px', margin: '0 auto', height: '70px' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <a href="/"><img src="/logo-gate.png" alt="Gate402" style={{ height: 26, width: 'auto', display: 'block' }} /></a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: '32px', padding: '0 16px' }} className="lnav-desktop">
          <NavLink href="#">Product</NavLink>
          <NavLink href="#">Customers</NavLink>

          <div style={{ position: 'relative' }} onMouseEnter={() => setOpenDropdown('channels')} onMouseLeave={() => setOpenDropdown(null)}>
            <NavLink href="#" hasDropdown isDropdownOpen={openDropdown === 'channels'}>Channels</NavLink>
            <DropdownMenu isOpen={openDropdown === 'channels'}>
              <DropdownItem href="#">Slack</DropdownItem>
              <DropdownItem href="#">Microsoft Teams</DropdownItem>
              <DropdownItem href="#">Discord</DropdownItem>
              <DropdownItem href="#">Email</DropdownItem>
              <DropdownItem href="#">Web Chat</DropdownItem>
            </DropdownMenu>
          </div>

          <div style={{ position: 'relative' }} onMouseEnter={() => setOpenDropdown('resources')} onMouseLeave={() => setOpenDropdown(null)}>
            <NavLink href="#" hasDropdown isDropdownOpen={openDropdown === 'resources'}>Resources</NavLink>
            <DropdownMenu isOpen={openDropdown === 'resources'}>
              <DropdownItem href="#">Blog</DropdownItem>
              <DropdownItem href="#">Guides</DropdownItem>
              <DropdownItem href="#">Help Center</DropdownItem>
              <DropdownItem href="#">API Reference</DropdownItem>
            </DropdownMenu>
          </div>

          <NavLink href="/docs">Docs</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: '24px' }}>
          <span className="lnav-desktop">
            <NavLink href="/login">Sign in</NavLink>
          </span>
          <motion.a
            href="/login?intent=signup"
            style={{ backgroundColor: '#0CF2A0', color: '#111111', padding: '6px 16px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block', textDecoration: 'none' }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Sign up
          </motion.a>
          <motion.button
            style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', zIndex: 50, padding: 0 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="lnav-mobile-toggle"
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </motion.button>
        </div>
      </nav>

      <style>{`
        .lnav-desktop { display: flex; }
        .lnav-mobile-toggle { display: none; }
        @media (max-width: 768px) {
          .lnav-desktop { display: none !important; }
          .lnav-mobile-toggle { display: block !important; }
        }
      `}</style>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              backgroundColor: 'rgba(17,17,17,0.97)', backdropFilter: 'blur(12px)',
              padding: '16px 0', borderTop: '1px solid rgba(55,65,81,0.3)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '0 24px' }}>
              <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Product</NavLink>
              <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Customers</NavLink>
              <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Channels</NavLink>
              <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Resources</NavLink>
              <NavLink href="/docs" onClick={() => setIsMobileMenuOpen(false)}>Docs</NavLink>
              <NavLink href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</NavLink>
              <hr style={{ width: '100%', border: 'none', borderTop: '1px solid rgba(55,65,81,0.3)', margin: '4px 0' }} />
              <NavLink href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign in</NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

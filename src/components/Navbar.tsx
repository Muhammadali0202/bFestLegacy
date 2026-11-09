'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Trophy, 
  Compass, 
  PlusCircle, 
  ShieldCheck, 
  Award, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  Briefcase, 
  GraduationCap,
  Star
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If in dedicated full-screen stage mode, hide normal navbar to maximize auditorium projection space
  if (pathname === '/leaderboard/stage') {
    return null;
  }

  // Base navigation items
  const navItems = [
    { label: 'Startups', href: '/startups', icon: Compass },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  // Role portal shortcut
  let rolePortal = null;
  if (user) {
    if (user.role === 'student') {
      rolePortal = { label: 'Student Hub', href: '/student', icon: GraduationCap };
    } else if (user.role === 'investor') {
      rolePortal = { label: 'Investor Hub', href: '/investor', icon: Briefcase };
    } else if (user.role === 'student_affairs') {
      rolePortal = { label: 'Rate Startups', href: '/startups', icon: Star };
    } else if (user.role === 'registration_team') {
      rolePortal = { label: 'Register Startup', href: '/register', icon: PlusCircle };
    } else if (user.role === 'judge') {
      rolePortal = { label: 'Judge Portal', href: '/judge', icon: Award };
    } else if (user.role === 'admin') {
      rolePortal = { label: 'Admin Console', href: '/admin', icon: ShieldCheck };
    }
  }

  return (
    <header className="navbar">
      <div
        className="navbar-container"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Left: Logo + Core Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <Link href="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/bfest-logo.jpg"
              alt="Business Fest Logo"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                objectFit: 'contain',
                background: '#ffffff',
                padding: '2px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                flexShrink: 0,
              }}
            />
          </Link>

          <nav style={{ display: 'none' }} className="desktop-nav">
            <ul className="nav-links" style={{ gap: '0.35rem' }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap',
                        padding: '0.38rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: isActive ? '#ffffff' : '#cbd5e1',
                        background: isActive ? 'rgba(0, 71, 255, 0.25)' : 'transparent',
                        border: isActive ? '1px solid rgba(0, 71, 255, 0.45)' : '1px solid transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {Icon && <Icon size={14} />}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}

              {(!user || user.role === 'student' || user.role === 'admin') && (
                <li>
                  <Link
                    href="/register"
                    className={`nav-link ${pathname === '/register' ? 'active' : ''}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      whiteSpace: 'nowrap',
                      padding: '0.38rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: pathname === '/register' ? '#ffffff' : '#cbd5e1',
                      background: pathname === '/register' ? 'rgba(0, 71, 255, 0.25)' : 'transparent',
                      border: pathname === '/register' ? '1px solid rgba(0, 71, 255, 0.45)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <PlusCircle size={14} />
                    <span>Register Startup</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Center: Title */}
        <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 900, 
              fontSize: 'clamp(1.05rem, 2vw, 1.35rem)', 
              color: '#ffffff', 
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}>
              BUSINESS FEST <span style={{ color: '#ffd233' }}>2027</span>
            </span>
          </Link>
        </div>

        {/* Right: Role Portal + User Auth + IMS Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.55rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {rolePortal && (
            <Link
              href={rolePortal.href}
              className="hide-on-mobile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                padding: '0.35rem 0.7rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: pathname === rolePortal.href ? '#ffffff' : '#ffd233',
                background: pathname === rolePortal.href ? 'rgba(255, 210, 51, 0.2)' : 'rgba(255, 210, 51, 0.08)',
                border: '1px solid rgba(255, 210, 51, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              <rolePortal.icon size={14} />
              <span>{rolePortal.label}</span>
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}>
              <Link
                href={
                  user.role === 'student' ? '/student' :
                  user.role === 'investor' ? '/investor' :
                  user.role === 'student_affairs' ? '/startups' :
                  user.role === 'registration_team' ? '/register' :
                  user.role === 'judge' ? '/judge' : '/admin'
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  padding: '0.28rem 0.65rem',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: user.role === 'investor' ? '#10b981' : user.role === 'judge' ? '#ffd233' : user.role === 'admin' ? '#ef4444' : '#0047ff',
                  color: user.role === 'judge' ? '#0a0a0a' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}>
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontWeight: 700, lineHeight: 1.1 }}>{user.fullName.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'capitalize' }}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </Link>

              <button
                onClick={() => logout()}
                title="Log Out"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
              <Link
                href="/login"
                className="btn btn-primary btn-sm"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.8rem', 
                  padding: '0.35rem 0.8rem',
                  whiteSpace: 'nowrap' 
                }}
              >
                <LogIn size={13} />
                <span>Log In</span>
              </Link>
            </div>
          )}

          {/* IMSciences Logo on Right */}
          <div
            style={{
              background: '#ffffff',
              padding: '4px 8px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
              flexShrink: 0,
            }}
            title="Institute of Management Sciences (IMSciences) Peshawar"
          >
            <img
              src="/imsciences-logo.png"
              alt="IMSciences Peshawar"
              style={{
                height: '28px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            style={{
              padding: '0.35rem 0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bf-primary-dark)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '1.25rem 1.5rem',
          }}
        >
          {user && (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{user.fullName}</div>
                <div style={{ fontSize: '0.75rem', color: '#d4af37', textTransform: 'capitalize' }}>
                  {user.role.replace('_', ' ')} Account
                </div>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Log Out
              </button>
            </div>
          )}

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <Link
                href="/startups"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}
              >
                <Compass size={18} color="var(--bf-accent-gold)" /> Startups Directory
              </Link>
            </li>
            <li>
              <Link
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}
              >
                <Trophy size={18} color="var(--bf-accent-gold)" /> Live Leaderboard
              </Link>
            </li>

            {rolePortal && (
              <li>
                <Link
                  href={rolePortal.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', fontWeight: 700 }}
                >
                  <rolePortal.icon size={18} /> {rolePortal.label}
                </Link>
              </li>
            )}

            <li>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}
              >
                <PlusCircle size={18} color="var(--bf-accent-gold)" /> Register Startup
              </Link>
            </li>

            {!user && (
              <li style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Log In
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 1024px) {
          .desktop-nav {
            display: block !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
        @media (max-width: 600px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

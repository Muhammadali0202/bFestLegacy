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
  MonitorPlay, 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Briefcase, 
  GraduationCap, 
  User 
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
    } else if (user.role === 'judge') {
      rolePortal = { label: 'Judge Portal', href: '/judge', icon: Award };
    } else if (user.role === 'admin') {
      rolePortal = { label: 'Admin Console', href: '/admin', icon: ShieldCheck };
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link href="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          <div className="navbar-logo-badge">BF</div>
          <span style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 900, 
            fontSize: '1.15rem', 
            color: '#ffffff', 
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap'
          }}>
            BUSINESS FEST <span style={{ color: '#ffd233' }}>2027</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none' }} className="desktop-nav">
          <ul className="nav-links">
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
                      padding: '0.32rem 0.55rem',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: isActive ? '#ffffff' : '#cbd5e1',
                      background: isActive ? 'rgba(0, 71, 255, 0.2)' : 'transparent',
                      border: isActive ? '1px solid rgba(0, 71, 255, 0.4)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {Icon && <Icon size={14} />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Role Dedicated Portal Link */}
            {rolePortal && (
              <li>
                <Link
                  href={rolePortal.href}
                  className={`nav-link ${pathname === rolePortal.href ? 'active' : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                    padding: '0.32rem 0.55rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: pathname === rolePortal.href ? '#ffffff' : '#ffd233',
                    background: pathname === rolePortal.href ? 'rgba(255, 210, 51, 0.15)' : 'transparent',
                    border: pathname === rolePortal.href ? '1px solid rgba(255, 210, 51, 0.4)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <rolePortal.icon size={14} />
                  <span>{rolePortal.label}</span>
                </Link>
              </li>
            )}

            {/* Register Startup quick link for students / guests */}
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
                    padding: '0.32rem 0.55rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: pathname === '/register' ? '#ffffff' : '#cbd5e1',
                    background: pathname === '/register' ? 'rgba(0, 71, 255, 0.2)' : 'transparent',
                    border: pathname === '/register' ? '1px solid rgba(0, 71, 255, 0.4)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <PlusCircle size={14} />
                  <span>Register Startup</span>
                </Link>
              </li>
            )}

            {/* Investor quick link for guests or investors */}
            {(!user || user.role === 'investor') && !rolePortal && (
              <li>
                <Link
                  href="/investor"
                  className={`nav-link ${pathname === '/investor' ? 'active' : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                    padding: '0.32rem 0.55rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: pathname === '/investor' ? '#ffffff' : '#cbd5e1',
                    background: pathname === '/investor' ? 'rgba(0, 71, 255, 0.2)' : 'transparent',
                    border: pathname === '/investor' ? '1px solid rgba(0, 71, 255, 0.4)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Briefcase size={14} />
                  <span>Investor Hub</span>
                </Link>
              </li>
            )}

            {/* Judge quick link for guests */}
            {!user && (
              <li>
                <Link
                  href="/judge"
                  className={`nav-link ${pathname === '/judge' ? 'active' : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                    padding: '0.32rem 0.55rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: pathname === '/judge' ? '#ffffff' : '#cbd5e1',
                    background: pathname === '/judge' ? 'rgba(0, 71, 255, 0.2)' : 'transparent',
                    border: pathname === '/judge' ? '1px solid rgba(0, 71, 255, 0.4)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Award size={14} />
                  <span>Judge Portal</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Action Controls & User Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {/* Stage Shortcut */}
          <Link
            href="/leaderboard/stage"
            className="btn btn-outline-gold btn-sm"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              whiteSpace: 'nowrap',
              padding: '0.32rem 0.65rem',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
            title="Open Fullscreen Stage & Auditorium Mode"
          >
            <MonitorPlay size={14} />
            <span className="hide-on-mobile">Stage</span>
          </Link>

          {/* User Auth Buttons / Profile Badge */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}>
              <Link
                href={
                  user.role === 'student' ? '/student' :
                  user.role === 'investor' ? '/investor' :
                  user.role === 'judge' ? '/judge' : '/admin'
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '0.3rem 0.6rem',
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
                  {user.fullName.charAt(0)}
                </div>
                <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontWeight: 700, lineHeight: 1.1 }}>{user.fullName.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'capitalize' }}>
                    {user.role} {user.role === 'investor' && !user.isApproved ? '(Pending)' : ''}
                  </span>
                </div>
              </Link>

              <button
                onClick={() => logout()}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{ padding: '0.35rem 0.55rem', color: '#cbd5e1' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}>
              <Link
                href="/login"
                className="btn btn-secondary btn-sm"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.82rem', 
                  padding: '0.32rem 0.7rem',
                  whiteSpace: 'nowrap' 
                }}
              >
                <LogIn size={14} />
                <span>Log In</span>
              </Link>
              <Link
                href="/signup"
                className="btn btn-primary btn-sm"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.82rem', 
                  padding: '0.32rem 0.7rem',
                  whiteSpace: 'nowrap' 
                }}
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            style={{ padding: '0.35rem 0.45rem', display: 'flex' }}
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
                  {user.role} Account {user.role === 'investor' && !user.isApproved ? '(Pending Verification)' : ''}
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

            <li>
              <Link
                href="/investor"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}
              >
                <Briefcase size={18} color="var(--bf-accent-gold)" /> Investor Portal
              </Link>
            </li>

            <li>
              <Link
                href="/judge"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}
              >
                <Award size={18} color="var(--bf-accent-gold)" /> Judge Portal
              </Link>
            </li>

            <li>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}
              >
                <ShieldCheck size={18} color="var(--bf-accent-gold)" /> Admin Console
              </Link>
            </li>

            {!user && (
              <li style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Sign Up
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
        @media (min-width: 1024px) and (max-width: 1220px) {
          .desktop-nav :global(.nav-link) {
            padding: 0.28rem 0.45rem !important;
            font-size: 0.78rem !important;
            gap: 0.25rem !important;
          }
          .desktop-nav :global(.nav-links) {
            gap: 0.15rem !important;
          }
        }
        @media (max-width: 600px) {
          .hide-on-mobile {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

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
      <div className="container navbar-container">
        {/* Brand */}
        <Link href="/" className="navbar-brand">
          <div className="navbar-logo-badge">BF</div>
          <div className="navbar-brand-text">
            <span className="navbar-brand-title">BUSINESS FEST 2027</span>
            <span className="navbar-brand-sub">IMSciences Peshawar</span>
          </div>
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: isActive ? '#ffffff' : '#cbd5e1',
                      borderBottom: isActive ? '2px solid var(--bf-accent-gold)' : 'none',
                      borderRadius: isActive ? '4px 4px 0 0' : '6px',
                    }}
                  >
                    {Icon && <Icon size={16} />}
                    {item.label}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: pathname === rolePortal.href ? '#ffffff' : '#d4af37',
                    fontWeight: 700,
                    borderBottom: pathname === rolePortal.href ? '2px solid var(--bf-accent-gold)' : 'none',
                  }}
                >
                  <rolePortal.icon size={16} />
                  {rolePortal.label}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: pathname === '/register' ? '#ffffff' : '#cbd5e1',
                  }}
                >
                  <PlusCircle size={16} />
                  Register Startup
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: pathname === '/investor' ? '#ffffff' : '#cbd5e1',
                  }}
                >
                  <Briefcase size={16} />
                  Investor Hub
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: pathname === '/judge' ? '#ffffff' : '#cbd5e1',
                  }}
                >
                  <Award size={16} />
                  Judge Portal
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Action Controls & User Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Stage Shortcut */}
          <Link
            href="/leaderboard/stage"
            className="btn btn-outline-gold btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            title="Open Fullscreen Stage & Auditorium Mode"
          >
            <MonitorPlay size={15} />
            <span className="hide-on-mobile">Stage</span>
          </Link>

          {/* User Auth Buttons / Profile Badge */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link
                href={
                  user.role === 'student' ? '/student' :
                  user.role === 'investor' ? '/investor' :
                  user.role === 'judge' ? '/judge' : '/admin'
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: user.role === 'investor' ? '#10b981' : user.role === 'judge' ? '#d4af37' : user.role === 'admin' ? '#ef4444' : '#3b82f6',
                  color: '#ffffff',
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
                style={{ padding: '0.4rem 0.6rem', color: '#cbd5e1' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                href="/login"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
              >
                <LogIn size={15} />
                <span>Log In</span>
              </Link>
              <Link
                href="/signup"
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
              >
                <UserPlus size={15} />
                <span className="hide-on-mobile">Sign Up</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            style={{ padding: '0.4rem', display: 'flex' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
        @media (min-width: 900px) {
          .desktop-nav {
            display: block !important;
          }
          .mobile-menu-toggle {
            display: none !important;
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

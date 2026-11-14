'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Mail, MapPin, Star, Lock, MonitorPlay } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/leaderboard/stage') {
    return null;
  }

  return (
    <footer
      className="footer"
      style={{
        padding: '1.75rem 0 1rem',
        marginTop: '2.5rem',
      }}
    >
      <div className="container">
        <div
          className="footer-top"
          style={{
            gap: '1.5rem',
            marginBottom: '1.25rem',
          }}
        >
          {/* Col 1: About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.5rem' }}>
              <img
                src="/bfest-logo.jpg"
                alt="Business Fest Logo"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  objectFit: 'contain',
                  background: '#ffffff',
                  padding: '2px',
                }}
              />
              <h3 style={{ color: '#ffffff', fontSize: '1.05rem', fontFamily: 'var(--font-display)', margin: 0 }}>
                BUSINESS FEST 2027
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.65rem', lineHeight: 1.45, maxWidth: '420px' }}>
              Annual startup showcase & entrepreneurship summit at IMSciences Peshawar.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.78rem', color: '#cbd5e1' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} color="var(--bf-accent-gold)" />
                Hayatabad, Peshawar
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} color="var(--bf-accent-gold)" />
                businessfest@imsciences.edu.pk
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="footer-heading" style={{ fontSize: '0.92rem', marginBottom: '0.6rem' }}>Quick Links</h4>
            <ul className="footer-links" style={{ gap: '0.35rem' }}>
              <li><Link href="/startups" className="footer-link" style={{ fontSize: '0.82rem' }}>Startups</Link></li>
              <li><Link href="/leaderboard" className="footer-link" style={{ fontSize: '0.82rem' }}>Live Leaderboard</Link></li>
              <li><Link href="/register" className="footer-link" style={{ fontSize: '0.82rem' }}>Register</Link></li>
              <li><Link href="/login" className="footer-link" style={{ fontSize: '0.82rem' }}>Portal Sign In</Link></li>
            </ul>
          </div>

          {/* Col 3: Staff & Organizer Access (Jury Panel removed, Student Affairs renamed to Official's Panel) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '0.9rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem' }}>
              <Lock size={13} color="var(--bf-accent-gold)" />
              <h4 style={{ color: '#ffffff', fontSize: '0.88rem', margin: 0 }}>
                Officials & Organizer Access
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <Link
                href="/login?role=student_affairs"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.38rem 0.65rem',
                  borderRadius: '7px',
                  background: 'rgba(0, 71, 255, 0.15)',
                  border: '1px solid rgba(0, 71, 255, 0.35)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={13} color="#38bdf8" /> Official&apos;s Panel
                </span>
                <span style={{ fontSize: '0.72rem', color: '#93c5fd' }}>Sign In →</span>
              </Link>

              <Link
                href="/login?role=admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.38rem 0.65rem',
                  borderRadius: '7px',
                  background: 'rgba(239, 68, 68, 0.14)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={13} color="#f87171" /> Organizer / Admin Console
                </span>
                <span style={{ fontSize: '0.72rem', color: '#fca5a5' }}>Sign In →</span>
              </Link>

              <Link
                href="/leaderboard/stage"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.38rem 0.65rem',
                  borderRadius: '7px',
                  background: 'rgba(6, 182, 212, 0.14)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MonitorPlay size={13} color="#22d3ee" /> University TV Display
                </span>
                <span style={{ fontSize: '0.72rem', color: '#67e8f9' }}>TV Auth →</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{ flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.9rem', fontSize: '0.78rem' }}>
          <p>© 2027 Business Fest — IMSciences Peshawar.</p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/login?role=registration_team" style={{ color: '#94a3b8', fontWeight: 600 }}>
              Registration Team
            </Link>
            <span>•</span>
            <Link href="/login?role=student_affairs" style={{ color: '#94a3b8', fontWeight: 600 }}>
              Official&apos;s Panel
            </Link>
            <span>•</span>
            <Link href="/login?role=admin" style={{ color: 'var(--bf-accent-gold)', fontWeight: 700 }}>
              Organizer Sign-in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

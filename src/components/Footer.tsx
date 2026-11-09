'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, ShieldCheck, Mail, MapPin, Star, Lock } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide in stage mode
  if (pathname === '/leaderboard/stage') {
    return null;
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top" style={{ gridTemplateColumns: '1.8fr 1fr 1.4fr' }}>
          {/* Col 1: About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div className="navbar-logo-badge" style={{ width: '36px', height: '36px', fontSize: '0.95rem' }}>
                BF
              </div>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                BUSINESS FEST 2027
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6, maxWidth: '460px' }}>
              The annual business idea competition, startup showcase, and venture summit organized at the
              Institute of Management Sciences (IMSciences) Peshawar.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--bf-accent-gold)" />
                <span>Sector A-3, Phase V, Hayatabad, Peshawar, Pakistan</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--bf-accent-gold)" />
                <span>businessfest@imsciences.edu.pk</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/startups" className="footer-link">Startup Directory</Link></li>
              <li><Link href="/leaderboard" className="footer-link">Live Leaderboard</Link></li>
              <li><Link href="/register" className="footer-link">Startup Registration</Link></li>
              <li><Link href="/login" className="footer-link">Portal Sign In</Link></li>
            </ul>
          </div>

          {/* Col 3 (Bottom-Right Area): Staff, Jury & Organizer Restricted Access */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
              <Lock size={15} color="var(--bf-accent-gold)" />
              <h4 style={{ color: '#ffffff', fontSize: '0.98rem', margin: 0 }}>
                Staff, Jury & Organizer Access
              </h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.45 }}>
              Admin registration & sign-in for Student Affairs, Registration Team, Jury, and Organizers.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <Link
                href="/login?role=student_affairs"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 71, 255, 0.15)',
                  border: '1px solid rgba(0, 71, 255, 0.35)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Star size={14} color="#38bdf8" /> Student Affairs (Rate Access)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>Sign In →</span>
              </Link>

              <Link
                href="/login?role=judge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 210, 51, 0.1)',
                  border: '1px solid rgba(255, 210, 51, 0.3)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Award size={14} color="var(--bf-accent-gold)" /> Official Jury Panel
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--bf-accent-gold)' }}>Sign In →</span>
              </Link>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                <Link
                  href="/login?role=admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.5rem',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.14)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck size={13} color="#f87171" /> Admin Sign In
                </Link>

                <Link
                  href="/signup"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.5rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffd233',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  Admin Sign Up →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <p>© 2027 Business Fest — Institute of Management Sciences (IMSciences) Peshawar. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/login?role=registration_team" style={{ color: '#94a3b8', fontWeight: 600 }}>
              Registration Team
            </Link>
            <span>•</span>
            <Link href="/login?role=student_affairs" style={{ color: '#94a3b8', fontWeight: 600 }}>
              Student Affairs
            </Link>
            <span>•</span>
            <Link href="/login?role=judge" style={{ color: '#94a3b8', fontWeight: 600 }}>
              Jury Sign-in
            </Link>
            <span>•</span>
            <Link href="/login?role=admin" style={{ color: 'var(--bf-accent-gold)', fontWeight: 700 }}>
              Organizer Sign-in
            </Link>
            <span>•</span>
            <Link href="/signup" style={{ color: '#cbd5e1', fontWeight: 600 }}>
              Admin Registration
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

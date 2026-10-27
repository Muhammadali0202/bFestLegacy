'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, Compass, ShieldCheck, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide in stage mode
  if (pathname === '/leaderboard/stage') {
    return null;
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
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
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              The premier annual business idea competition, startup showcase, and venture summit organized at the
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
            <h4 className="footer-heading">Event Portals</h4>
            <ul className="footer-links">
              <li><Link href="/startups" className="footer-link">Startup Directory</Link></li>
              <li><Link href="/leaderboard" className="footer-link">Live Leaderboard</Link></li>
              <li><Link href="/leaderboard/stage" className="footer-link">Stage / Projector Mode</Link></li>
              <li><Link href="/judge" className="footer-link">Judges Scoring Portal</Link></li>
              <li><Link href="/register" className="footer-link">Startup Registration</Link></li>
            </ul>
          </div>

          {/* Col 3: Sectors */}
          <div>
            <h4 className="footer-heading">Industry Tracks</h4>
            <ul className="footer-links">
              <li><Link href="/startups?sector=FinTech%20%26%20Banking" className="footer-link">FinTech & Banking</Link></li>
              <li><Link href="/startups?sector=AgriTech%20%26%20Food" className="footer-link">AgriTech & Food</Link></li>
              <li><Link href="/startups?sector=HealthTech%20%26%20Med" className="footer-link">HealthTech & Med</Link></li>
              <li><Link href="/startups?sector=Green%20%26%20CleanTech" className="footer-link">Green & CleanTech</Link></li>
              <li><Link href="/startups?sector=AI%20%26%20Smart%20Systems" className="footer-link">AI & Smart Systems</Link></li>
            </ul>
          </div>

          {/* Col 4: Administration */}
          <div>
            <h4 className="footer-heading">Organizers</h4>
            <ul className="footer-links">
              <li><Link href="/admin" className="footer-link">Admin Dashboard</Link></li>
              <li><span style={{ fontSize: '0.85rem', color: '#64748b' }}>Scoring Policy: 70% Jury / 30% Public</span></li>
              <li><span style={{ fontSize: '0.85rem', color: '#64748b' }}>IMSciences Peshawar Incubation Center</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2027 Business Fest — Institute of Management Sciences (IMSciences) Peshawar. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--bf-accent-gold)', fontWeight: 600 }}>Business Fest 2027</span>
            <span>•</span>
            <Link href="/admin" style={{ color: '#94a3b8' }}>Organizer Sign-in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

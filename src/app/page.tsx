'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Compass,
  PlusCircle,
  ArrowRight,
  Clock,
  LogIn,
  ShieldCheck,
  Star,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Startup } from '@/types';
import { useAuth } from '@/context/AuthContext';

// Target date for Business Fest (19 December 2026)
const BFEST_TARGET_DATE = new Date('2026-12-19T09:00:00+05:00').getTime();

export default function HomePage() {
  const { user, logout } = useAuth();
  const [topStartups, setTopStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, BFEST_TARGET_DATE - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/startups?onlyPublished=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const sorted = [...data.startups].sort(
            (a: Startup, b: Startup) => b.compositeScore - a.compositeScore
          );
          setTopStartups(sorted.slice(0, 5));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div>
      {/* Compact Light/White Header: 1. Title -> 2. Description -> 3. Navigation Bar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '2px solid #e2e8f0',
          padding: '1.15rem 0 0.95rem',
        }}
      >
        <div className="container">
          {/* Top Brand Logos + Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '0.35rem',
            }}
          >
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              <img
                src="/bfest-logo.jpg"
                alt="Business Fest Logo"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  objectFit: 'contain',
                  border: '1px solid #e2e8f0',
                  padding: '2px',
                  background: '#ffffff',
                }}
              />
            </Link>

            <h1
              style={{
                fontSize: 'clamp(1.45rem, 3.5vw, 2.15rem)',
                fontWeight: 900,
                color: '#0a0a0a',
                letterSpacing: '-0.02em',
                textAlign: 'center',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              BUSINESS FEST <span style={{ color: '#0047ff' }}>2027</span>
            </h1>

            <img
              src="/imsciences-logo.png"
              alt="IMSciences Peshawar"
              style={{
                height: 'clamp(22px, 4vw, 30px)',
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
          </div>

          {/* 2. Description */}
          <p
            style={{
              textAlign: 'center',
              fontSize: 'clamp(0.85rem, 2vw, 0.96rem)',
              color: '#475569',
              margin: '0 auto 0.95rem',
              maxWidth: '640px',
            }}
          >
            IMSciences Peshawar Innovation Showcase, Venture Competition &amp; Startup Hub
          </p>

          {/* 3. Navigation Bar (Same clean pill design, placed after title & description) */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              paddingTop: '0.65rem',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <Link href="/startups" className="btn btn-gold btn-sm">
              <Compass size={15} />
              Startups
            </Link>
            <Link href="/leaderboard" className="btn btn-primary btn-sm">
              <Trophy size={15} color="#ffd233" />
              Leaderboard
            </Link>
            <Link href="/register" className="btn btn-secondary btn-sm">
              <PlusCircle size={15} />
              Register
            </Link>

            {user ? (
              <>
                <Link
                  href={
                    user.role === 'admin'
                      ? '/admin'
                      : user.role === 'registration_team'
                      ? '/register'
                      : user.role === 'tv_admin'
                      ? '/leaderboard/stage'
                      : '/startups'
                  }
                  className="btn btn-secondary btn-sm"
                  style={{ borderColor: '#ffd233', color: '#92400e', background: 'rgba(255, 210, 51, 0.14)' }}
                >
                  <ShieldCheck size={15} />
                  {user.fullName.split(' ')[0]} ({user.role === 'student_affairs' ? "Official" : user.role.replace('_', ' ')})
                </Link>
                <button onClick={() => logout()} className="btn btn-secondary btn-sm">
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} />
                Log In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Separate Compact Countdown Section Below Header */}
      <section style={{ padding: '1.25rem 0 0.5rem', background: 'var(--bf-bg-page)' }}>
        <div className="container">
          <div
            style={{
              maxWidth: '640px',
              margin: '0 auto',
              background: '#ffffff',
              border: '1.5px solid rgba(0, 71, 255, 0.2)',
              borderRadius: '14px',
              padding: '0.6rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.55rem 0.9rem',
              boxShadow: 'var(--bf-shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                color: '#0a0a0a',
                textTransform: 'uppercase',
              }}
            >
              <Clock size={15} color="#0047ff" />
              <span>BFEST HAPPENING IN :</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '0.95rem',
                color: '#0047ff',
              }}
            >
              <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                {timeLeft.days}d
              </span>
              <span>:</span>
              <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                {pad(timeLeft.hours)}h
              </span>
              <span>:</span>
              <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                {pad(timeLeft.minutes)}m
              </span>
              <span>:</span>
              <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                {pad(timeLeft.seconds)}s
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: 70% Top Ranked Startups | 30% About Us */}
      <section style={{ padding: '1.5rem 0 3.5rem', background: 'var(--bf-bg-page)' }}>
        <div className="container">
          <div className="home-split-grid">
            {/* Left 70%: Top Ranked Startups */}
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={19} color="#b8860b" />
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--bf-primary)', margin: 0 }}>
                    Top Ranked
                  </h2>
                </div>
                <Link
                  href="/leaderboard"
                  style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--bf-accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Full Leaderboard <ArrowRight size={14} />
                </Link>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid var(--bf-border)' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--bf-text-muted)', fontSize: '0.9rem' }}>
                    Loading top ranked startups...
                  </div>
                ) : topStartups.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--bf-text-muted)', fontSize: '0.9rem' }}>
                    No ranked startups yet.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr
                          style={{
                            background: '#f1f5f9',
                            borderBottom: '1px solid var(--bf-border)',
                            color: 'var(--bf-text-secondary)',
                            fontSize: '0.74rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <th style={{ padding: '0.65rem 1rem', width: '48px' }}>#</th>
                          <th style={{ padding: '0.65rem 0.75rem' }}>Title</th>
                          <th style={{ padding: '0.65rem 0.75rem' }}>Sector</th>
                          <th style={{ padding: '0.65rem 0.75rem' }}>Progress</th>
                          <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topStartups.map((startup, idx) => (
                          <tr
                            key={startup.id}
                            style={{
                              borderBottom: idx < topStartups.length - 1 ? '1px solid var(--bf-border)' : 'none',
                              background: idx === 0 ? 'rgba(255, 210, 51, 0.06)' : '#ffffff',
                            }}
                          >
                            <td style={{ padding: '0.7rem 1rem', fontWeight: 900 }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  background: idx === 0 ? 'var(--bf-accent-gold)' : idx === 1 ? '#e2e8f0' : '#f1f5f9',
                                  color: idx === 0 ? '#06172e' : '#334155',
                                }}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td style={{ padding: '0.7rem 0.75rem' }}>
                              <Link
                                href={`/startups/${startup.id}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.45rem',
                                  fontWeight: 700,
                                  color: 'var(--bf-primary)',
                                }}
                              >
                                <span style={{ fontSize: '1.2rem' }}>{startup.logo}</span>
                                <span>{startup.name}</span>
                              </Link>
                            </td>
                            <td style={{ padding: '0.7rem 0.75rem' }}>
                              <span className="badge badge-sector" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                                {startup.sector}
                              </span>
                            </td>
                            <td style={{ padding: '0.7rem 0.75rem', minWidth: '100px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${startup.progressPercentage || 0}%`,
                                      height: '100%',
                                      background: '#10b981',
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#047857' }}>
                                  {startup.progressPercentage || 0}%
                                </span>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: '0.7rem 1rem',
                                textAlign: 'right',
                                fontWeight: 800,
                                fontFamily: 'var(--font-display)',
                                color: idx === 0 ? '#b8860b' : 'var(--bf-primary)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {startup.compositeScore.toFixed(1)}{' '}
                              <span style={{ fontSize: '0.7rem', color: 'var(--bf-text-muted)', fontWeight: 600 }}>PTS</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right 30%: About Us */}
            <aside>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                <Sparkles size={18} color="#0047ff" />
                <h2 style={{ fontSize: '1.25rem', color: 'var(--bf-primary)', margin: 0 }}>
                  About Us
                </h2>
              </div>

              <div
                className="card"
                style={{
                  padding: '1.35rem',
                  border: '1.5px solid var(--bf-border)',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                  <img
                    src="/bfest-logo.jpg"
                    alt="Business Fest"
                    style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--bf-primary)', margin: 0 }}>
                      IMSciences Business Fest
                    </h3>
                    <span style={{ fontSize: '0.76rem', color: '#0047ff', fontWeight: 700 }}>
                      Flagship Entrepreneurship Event
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--bf-text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Business Fest at the <strong>Institute of Management Sciences (IMSciences) Peshawar</strong> brings together student innovators, vendors, and industry leaders to showcase commercial ideas, live stalls, and high-growth startups.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.82rem', color: '#334155', marginBottom: '1.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={15} color="#0047ff" />
                    <span><strong>Main Event:</strong> 19 December 2026</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="#0047ff" />
                    <span><strong>Venue:</strong> IMSciences, Hayatabad, Peshawar</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={15} color="#d4af37" />
                    <span><strong>Live Tracking:</strong> Real-time progress &amp; standings</span>
                  </div>
                </div>

                <Link href="/startups" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  Explore All Startups <ArrowRight size={14} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

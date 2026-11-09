'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Compass, 
  PlusCircle, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { Startup } from '@/types';

// Target date for Business Fest 2027
const BFEST_TARGET_DATE = new Date('2027-03-15T09:00:00+05:00').getTime();

export default function HomePage() {
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
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
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
          setTopStartups(sorted.slice(0, 3));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div>
      {/* Top Countdown & Compact Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, var(--bf-primary) 0%, var(--bf-primary-light) 100%)',
        color: '#ffffff',
        padding: '2.5rem 0 3rem',
      }}>
        <div className="container">
          {/* BFEST HAPPENING IN : Countdown Banner (Per Sketch Wireframe) */}
          <div style={{
            maxWidth: '920px',
            margin: '0 auto 2rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1.5px solid rgba(255, 210, 51, 0.45)',
            borderRadius: '16px',
            padding: '0.9rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              letterSpacing: '0.05em',
              color: '#ffd233',
              textTransform: 'uppercase',
            }}>
              <Clock size={18} color="#ffd233" />
              <span>BFEST HAPPENING IN :</span>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(1.05rem, 2.2vw, 1.35rem)',
              color: '#ffffff',
            }}>
              <span style={{ background: 'rgba(0, 71, 255, 0.35)', border: '1px solid rgba(0, 71, 255, 0.6)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                {timeLeft.days}d
              </span>
              <span style={{ color: '#ffd233' }}>:</span>
              <span style={{ background: 'rgba(0, 71, 255, 0.35)', border: '1px solid rgba(0, 71, 255, 0.6)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                {pad(timeLeft.hours)}h
              </span>
              <span style={{ color: '#ffd233' }}>:</span>
              <span style={{ background: 'rgba(0, 71, 255, 0.35)', border: '1px solid rgba(0, 71, 255, 0.6)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                {pad(timeLeft.minutes)}m
              </span>
              <span style={{ color: '#ffd233' }}>:</span>
              <span style={{ background: 'rgba(0, 71, 255, 0.35)', border: '1px solid rgba(0, 71, 255, 0.6)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                {pad(timeLeft.seconds)}s
              </span>
            </div>
          </div>

          {/* Compact Title & Quick Actions */}
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4.2vw, 3.2rem)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
              lineHeight: 1.15,
              textTransform: 'uppercase',
            }}>
              BUSINESS FEST <span style={{ color: '#0047ff' }}>2027</span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: '#cbd5e1',
              marginBottom: '1.75rem',
              lineHeight: 1.5,
            }}>
              IMSciences Peshawar Innovation Showcase, Venture Competition & Investor Platform
            </p>

            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/startups" className="btn btn-gold">
                <Compass size={18} />
                Explore Startups
              </Link>
              <Link href="/leaderboard" className="btn btn-primary">
                <Trophy size={18} color="#ffd233" />
                Live Leaderboard
              </Link>
              <Link href="/register" className="btn btn-secondary">
                <PlusCircle size={18} />
                Register Startup
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Top Ranked Section (Per Sketch Wireframe: 1, 2, 3 | Title | Sector | Points) */}
      <section style={{ padding: '2.75rem 0 4rem', background: 'var(--bf-bg-page)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Trophy size={20} color="#b8860b" />
              <h2 style={{ fontSize: '1.35rem', color: 'var(--bf-primary)', margin: 0 }}>
                Top Ranked
              </h2>
            </div>
            <Link href="/leaderboard" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Full Leaderboard <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid var(--bf-border)' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '1.75rem', color: 'var(--bf-text-muted)', fontSize: '0.9rem' }}>
                Loading top ranked startups...
              </div>
            ) : topStartups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.75rem', color: 'var(--bf-text-muted)', fontSize: '0.9rem' }}>
                No ranked startups yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                  <thead>
                    <tr style={{
                      background: '#f1f5f9',
                      borderBottom: '1px solid var(--bf-border)',
                      color: 'var(--bf-text-secondary)',
                      fontSize: '0.76rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      <th style={{ padding: '0.65rem 1.25rem', width: '64px' }}>#</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Title</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Sector</th>
                      <th style={{ padding: '0.65rem 1.25rem', textAlign: 'right' }}>Points</th>
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
                        <td style={{ padding: '0.75rem 1.25rem', fontWeight: 900 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            background: idx === 0 ? 'var(--bf-accent-gold)' : idx === 1 ? '#e2e8f0' : '#f1e2d3',
                            color: idx === 0 ? '#06172e' : idx === 1 ? '#334155' : '#8b4513',
                          }}>
                            {idx + 1}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <Link
                            href={`/startups/${startup.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.55rem',
                              fontWeight: 700,
                              color: 'var(--bf-primary)',
                            }}
                          >
                            <span style={{ fontSize: '1.25rem' }}>{startup.logo}</span>
                            <span>{startup.name}</span>
                          </Link>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className="badge badge-sector" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                            {startup.sector}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-display)', color: idx === 0 ? '#b8860b' : 'var(--bf-primary)' }}>
                          {startup.compositeScore.toFixed(1)} <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)', fontWeight: 600 }}>PTS</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

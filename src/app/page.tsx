'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Compass, 
  PlusCircle, 
  Sparkles, 
  Users, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  TrendingUp,
  Award,
  Zap,
  Building2,
  GraduationCap,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { Startup } from '@/types';

export default function HomePage() {
  const [topStartups, setTopStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/startups?onlyPublished=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Sort by compositeScore descending and take top 3
          const sorted = [...data.startups].sort((a: Startup, b: Startup) => b.compositeScore - a.compositeScore);
          setTopStartups(sorted.slice(0, 3));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const sectors = [
    { name: 'FinTech & Banking', icon: '💳', count: '12+ Ideas', desc: 'Micro-payments, digital ledgers & financial inclusion' },
    { name: 'AgriTech & Food', icon: '🌱', count: '15+ Ideas', desc: 'Precision farming, smart irrigation & supply chain' },
    { name: 'HealthTech & Med', icon: '🩺', count: '9+ Ideas', desc: 'AI diagnostics, rural telemedicine & maternal health' },
    { name: 'Green & CleanTech', icon: '☀️', count: '8+ Ideas', desc: 'Solar robotics, renewable energy & recycling' },
    { name: 'EdTech & Learning', icon: '📚', count: '10+ Ideas', desc: 'Gamified curriculum & offline education tech' },
    { name: 'AI & Smart Systems', icon: '🤖', count: '14+ Ideas', desc: 'Computer vision, robotics & edge compute' },
  ];

  return (
    <div>
      {/* Top Announcement Bar */}
      <div style={{ background: 'var(--bf-primary-dark)', color: '#cbd5e1', padding: '0.6rem 0', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="live-indicator"></span>
            <span style={{ fontWeight: 600, color: '#ffffff' }}>LIVE EVENT NOW:</span>
            <span>Pitch Rounds & Booth Evaluations in Progress at IMSciences Main Auditorium</span>
          </div>
          <Link href="/leaderboard" style={{ color: 'var(--bf-accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Live Leaderboard <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, var(--bf-primary) 0%, var(--bf-primary-light) 60%, var(--bf-bg-page) 100%)',
        color: '#ffffff',
        padding: '5rem 0 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle Decorative Pattern */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(11, 37, 69, 0) 70%)',
          pointerEvents: 'none',
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '9999px',
              padding: '0.4rem 1.1rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--bf-accent-gold)',
              marginBottom: '1.5rem',
              letterSpacing: '0.04em',
            }}>
              <Sparkles size={16} />
              INSTITUTE OF MANAGEMENT SCIENCES PESHAWAR
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
              lineHeight: 1.15,
            }}>
              BUSINESS FEST <span style={{ color: 'var(--bf-accent-gold)' }}>2027</span>
            </h1>

            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              color: '#e2e8f0',
              marginBottom: '2.5rem',
              fontWeight: 400,
              lineHeight: 1.6,
            }}>
              The centralized innovation showcase, venture competition, and investor platform uniting Peshawar’s boldest student founders, industry judges, and tech leaders.
            </p>

            {/* CTAs */}
            <div className="flex justify-center gap-4 flex-wrap" style={{ marginBottom: '3.5rem' }}>
              <Link href="/startups" className="btn btn-gold btn-lg">
                <Compass size={20} />
                Explore Startups
              </Link>
              <Link href="/leaderboard" className="btn btn-primary btn-lg" style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
                <Trophy size={20} color="var(--bf-accent-gold)" />
                Live Leaderboard
              </Link>
              <Link href="/register" className="btn btn-secondary btn-lg" style={{ background: '#ffffff', color: 'var(--bf-primary)', border: 'none' }}>
                <PlusCircle size={20} />
                Register Startup
              </Link>
            </div>

            {/* Event Metrics Strip */}
            <div style={{
              background: 'rgba(6, 23, 46, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--bf-radius-lg)',
              padding: '1.75rem 2rem',
              backdropFilter: 'blur(16px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-display)' }}>60+</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Startups Registered</div>
              </div>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--bf-accent-gold)', fontFamily: 'var(--font-display)' }}>7</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Industry Tracks</div>
              </div>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-display)' }}>20+</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ecosystem Judges</div>
              </div>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--bf-accent-emerald)', fontFamily: 'var(--font-display)' }}>PKR 1M+</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seed Grants & Prizes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top 3 Live Standings Preview */}
      <section style={{ padding: '4rem 0', background: 'var(--bf-bg-page)' }}>
        <div className="container">
          <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Current Leaders</div>
              <h2 style={{ fontSize: '2rem', color: 'var(--bf-primary)' }}>Top 3 Ranked Startups</h2>
              <p style={{ color: 'var(--bf-text-secondary)', fontSize: '0.95rem' }}>
                Real-time composite standings weighted 70% official jury score & 30% audience votes.
              </p>
            </div>
            <Link href="/leaderboard" className="btn btn-secondary">
              View All Standings <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--bf-text-muted)' }}>
              Loading live standings...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {topStartups.map((startup, idx) => {
                const medals = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place'];
                return (
                  <div key={startup.id} className="card card-hover" style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderColor: idx === 0 ? 'var(--bf-accent-gold)' : 'var(--bf-border)',
                  }}>
                    {idx === 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'var(--bf-accent-gold)',
                        color: '#06172e',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.3rem 1rem',
                        borderRadius: '0 0 0 12px',
                      }}>
                        LEADER
                      </div>
                    )}

                    <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '2rem' }}>{startup.logo}</span>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: idx === 0 ? '#b8860b' : 'var(--bf-primary)' }}>
                          {medals[idx]}
                        </span>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--bf-primary)' }}>{startup.name}</h3>
                      </div>
                    </div>

                    <div className="badge badge-sector" style={{ marginBottom: '0.75rem' }}>
                      {startup.sector}
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--bf-text-secondary)', marginBottom: '1.25rem', minHeight: '48px' }}>
                      {startup.tagline}
                    </p>

                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                      border: '1px solid var(--bf-border)',
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)', display: 'block' }}>Composite Score</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--bf-primary)' }}>
                          {startup.compositeScore.toFixed(1)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--bf-text-muted)' }}> / 100</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)', display: 'block' }}>Audience Rating</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{startup.publicRating.toFixed(1)}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)' }}>({startup.totalPublicVotes})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--bf-accent-blue)' }}>
                        {startup.boothNumber || 'Main Hall'}
                      </span>
                      <Link href={`/startups/${startup.id}`} className="btn btn-secondary btn-sm">
                        View Pitch <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Summit Portals by Role Section */}
      <section style={{ padding: '4.5rem 0', background: '#ffffff', borderTop: '1px solid var(--bf-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
            <div className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Summit Participation</div>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--bf-primary)' }}>Access by Your Role</h2>
            <p style={{ color: 'var(--bf-text-secondary)', fontSize: '1rem' }}>
              Whether you are pitching a venture, investing smart capital, or evaluating innovation on the official jury panel.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {/* Role 1: Student Team */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #3b82f6' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <GraduationCap size={24} color="#3b82f6" />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>Student Teams</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--bf-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Register your student startup team, submit pitch deck materials, and monitor your live rankings.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/register" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Register Startup
                </Link>
                <Link href="/student" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Student Hub
                </Link>
              </div>
            </div>

            {/* Role 2: Investor */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #10b981' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Briefcase size={24} color="#10b981" />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>Angel & VC Investors</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--bf-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Get approved by the fest organizer, pledge investment capital, and submit due-diligence ratings that propel ventures on the leaderboard.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/investor" className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', background: '#10b981', color: '#ffffff', fontWeight: 700 }}>
                  Investor Pitchroom
                </Link>
                <Link href="/signup" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Investor Sign Up
                </Link>
              </div>
            </div>

            {/* Role 3: Judge */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #d4af37' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Award size={24} color="#d4af37" />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>Official Jury Panel</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--bf-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Assess ventures across 4 evaluation rubrics: Innovation, Market, Execution, and Pitch Delivery.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/judge" className="btn btn-gold btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Open Jury Portal
                </Link>
                <Link href="/login" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Jury Sign In
                </Link>
              </div>
            </div>

            {/* Role 4: Admin */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #ef4444' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <ShieldCheck size={24} color="#ef4444" />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>Fest Organizers</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--bf-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Moderate incoming startups, authorize accredited investors, and control live stage voting phases.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/admin" className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', background: '#0b2545', color: '#ffffff', fontWeight: 700 }}>
                  Admin Console
                </Link>
                <Link href="/leaderboard/stage" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Stage Projector
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Sectors Grid */}
      <section style={{ padding: '4.5rem 0', background: 'var(--bf-bg-page)', borderTop: '1px solid var(--bf-border)', borderBottom: '1px solid var(--bf-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
            <div className="badge badge-sector" style={{ marginBottom: '0.5rem' }}>Tracks & Categories</div>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--bf-primary)' }}>Participating Industry Tracks</h2>
            <p style={{ color: 'var(--bf-text-secondary)', fontSize: '1rem' }}>
              Innovations pitched at Business Fest 2027 compete across targeted socioeconomic problem spaces.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {sectors.map((sector) => (
              <Link 
                key={sector.name} 
                href={`/startups?sector=${encodeURIComponent(sector.name)}`}
                className="card card-hover"
                style={{ display: 'block', transition: 'all 0.2s' }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.25rem' }}>{sector.icon}</span>
                  <span className="badge badge-gold">{sector.count}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>
                  {sector.name}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--bf-text-secondary)', lineHeight: 1.5 }}>
                  {sector.desc}
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--bf-accent-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Browse track startups <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Callout: Live Stage Mode & Auditoriums */}
      <section style={{ padding: '5rem 0', background: 'var(--bf-primary-dark)', color: '#ffffff' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(11, 37, 69, 0.9) 0%, rgba(6, 23, 46, 0.95) 100%)',
            border: '2px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 'var(--bf-radius-lg)',
            padding: '3rem',
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '3rem',
            alignItems: 'center',
          }}>
            <div>
              <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>Auditorium Projection Ready</div>
              <h2 style={{ fontSize: '2.4rem', color: '#ffffff', marginBottom: '1rem', lineHeight: 1.2 }}>
                Full-Screen Stage Display for Venue Projectors
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Project live standings dynamically on the main auditorium stage with high-contrast visuals, auto-recalculating scores, and winner podium presentations without manual reloads.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/leaderboard/stage" className="btn btn-gold btn-lg">
                  Launch Stage Mode <Zap size={18} />
                </Link>
                <Link href="/judge" className="btn btn-secondary btn-lg" style={{ background: 'transparent', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
                  Judge Rubrics Portal
                </Link>
              </div>
            </div>

            <div style={{
              background: '#040913',
              border: '1px solid #1a2f4d',
              borderRadius: 'var(--bf-radius-md)',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}>
              <div className="flex items-center justify-between" style={{ borderBottom: '1px solid #1a2f4d', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auditorium Feed Preview</span>
                <span className="live-indicator"></span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#0a1628', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid #ffd700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#ffd700' }}>#1</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>KhyberAgri Smart Harvest</span>
                  </div>
                  <span style={{ color: '#ffd700', fontWeight: 800 }}>93.6 PTS</span>
                </div>
                <div style={{ background: '#0a1628', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid #c0c0c0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#c0c0c0' }}>#2</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>Peshawar Pay (PashtoPay)</span>
                  </div>
                  <span style={{ color: '#c0c0c0', fontWeight: 800 }}>90.7 PTS</span>
                </div>
                <div style={{ background: '#0a1628', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid #cd7f32', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#cd7f32' }}>#3</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>TabeebAI Diagnostics</span>
                  </div>
                  <span style={{ color: '#cd7f32', fontWeight: 800 }}>90.2 PTS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Maximize2, Minimize2, Clock, Lock, MapPin, MonitorPlay, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const BFEST_TARGET_DATE = new Date('2026-12-19T09:00:00+05:00').getTime();

export default function StageLeaderboardPage() {
  const { user, login, loading: authLoading } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [countdown, setCountdown] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [eventTimeLeft, setEventTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Inline TV Admin Auth state
  const [tvEmail, setTvEmail] = useState('tv@imsciences.edu.pk');
  const [tvPassword, setTvPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const isAuthorizedTvAdmin = !!user && (user.role === 'tv_admin' || user.role === 'admin');

  const fetchLive = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setIsFrozen(data.isFrozen);
        setLastUpdated(new Date().toLocaleTimeString());
        setCountdown(5);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    document.body.classList.add('stage-mode');

    const updateEventClock = () => {
      const diff = Math.max(0, BFEST_TARGET_DATE - Date.now());
      setEventTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    updateEventClock();

    if (isAuthorizedTvAdmin) {
      fetchLive();
    }

    const interval = setInterval(() => {
      if (isAuthorizedTvAdmin) {
        fetchLive();
      }
    }, 5000);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 5));
      updateEventClock();
    }, 1000);

    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);

    return () => {
      document.body.classList.remove('stage-mode');
      clearInterval(interval);
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, [isAuthorizedTvAdmin]);

  const handleTvAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSigningIn(true);
    try {
      const res = await login(tvEmail.trim(), tvPassword);
      if (!res.success) {
        setAuthError(res.error || 'Invalid TV Administrator credentials.');
      }
    } catch (_) {
      setAuthError('Network error authenticating TV Administrator.');
    } finally {
      setSigningIn(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const top3 = items.slice(0, 3);
  const rest = items.slice(3, 10);

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050b16',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
      }}>
        Verifying University TV Display authorization...
      </div>
    );
  }

  // Protected TV Administrator Authentication Gate
  if (!isAuthorizedTvAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #0f294a 0%, #050b16 65%, #02050b 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          background: 'rgba(15, 29, 52, 0.92)',
          border: '1.5px solid rgba(6, 182, 212, 0.45)',
          borderRadius: '20px',
          padding: '2.25rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#22d3ee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <MonitorPlay size={28} />
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(255, 210, 51, 0.15)',
              color: '#ffd233',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              marginBottom: '0.65rem',
            }}>
              <ShieldCheck size={13} /> UNIVERSITY TV ADMINISTRATOR ONLY
            </div>
            <h1 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.4rem' }}>
              Campus TV Display Lock
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Only an authorized <strong>University TV Administrator</strong> or <strong>Fest Organizer</strong> can authenticate and project the live TV leaderboard screen.
            </p>
          </div>

          {user && !isAuthorizedTvAdmin && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.83rem',
              marginBottom: '1rem',
            }}>
              Signed in as <strong>{user.role.replace('_', ' ')}</strong>. Please sign in with a TV Administrator or Admin account below.
            </div>
          )}

          {authError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}>
              <AlertCircle size={16} /> {authError}
            </div>
          )}

          <form onSubmit={handleTvAuth}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>TV Administrator Email</label>
              <input
                type="email"
                className="form-input"
                value={tvEmail}
                onChange={(e) => setTvEmail(e.target.value)}
                required
                placeholder="tv@imsciences.edu.pk"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Password</label>
              <input
                type="password"
                className="form-input"
                value={tvPassword}
                onChange={(e) => setTvPassword(e.target.value)}
                required
                placeholder="Enter TV Admin password"
              />
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              <MonitorPlay size={16} />
              {signingIn ? 'Authenticating...' : 'Authenticate & Launch TV Screen'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link href="/leaderboard" style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
              ← Return to Public Leaderboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #0f294a 0%, #050b16 65%, #02050b 100%)',
      color: '#ffffff',
      padding: 'clamp(1rem, 2.5vw, 2rem) clamp(1rem, 3vw, 2.75rem)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '1.25rem',
    }}>
      {/* TV Broadcast Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '2px solid rgba(255, 210, 51, 0.35)',
        paddingBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src="/bfest-logo.jpg"
            alt="Business Fest Logo"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              objectFit: 'contain',
              background: '#ffffff',
              padding: '3px',
              boxShadow: '0 0 25px rgba(255, 210, 51, 0.35)',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.4rem)',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                color: '#ffffff',
                lineHeight: 1.05,
                margin: 0,
              }}>
                BUSINESS FEST <span style={{ color: '#ffd233' }}>2027</span>
              </h1>
              {isFrozen && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid #f59e0b',
                  color: '#fbbf24',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}>
                  <Lock size={12} /> STANDINGS FROZEN
                </span>
              )}
            </div>
            <span style={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.95rem)', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              IMSciences Peshawar — Live Campus TV Leaderboard
            </span>
          </div>
        </div>

        {/* Countdown + Live Sync + IMSciences Logo + Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 210, 51, 0.35)',
            borderRadius: '12px',
            padding: '0.45rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
          }}>
            <Clock size={16} color="#ffd233" />
            <span style={{ fontSize: '0.8rem', color: '#ffd233', fontWeight: 700, textTransform: 'uppercase' }}>
              19 Dec:
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem', color: '#ffffff' }}>
              {eventTimeLeft.days}d : {pad(eventTimeLeft.hours)}h : {pad(eventTimeLeft.minutes)}m : {pad(eventTimeLeft.seconds)}s
            </span>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '9999px',
            padding: '0.45rem 0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span className="live-indicator"></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em', color: '#34d399' }}>
              LIVE • {countdown}s
            </span>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '4px 10px',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
          }}>
            <img
              src="/imsciences-logo.png"
              alt="IMSciences Peshawar"
              style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen TV Mode' : 'Enter Fullscreen TV Mode'}
            className="btn btn-secondary btn-sm"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{isFullscreen ? 'Exit TV' : 'Fullscreen TV'}</span>
          </button>

          {!isFullscreen && (
            <Link href="/leaderboard" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}>
              <ArrowLeft size={15} /> Back
            </Link>
          )}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.75rem' }}>
        <div className="grid grid-cols-3 gap-6" style={{
          alignItems: 'end',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
        }}>
          {/* #2 Silver */}
          {top3[1] && (
            <div style={{
              background: 'linear-gradient(180deg, #10213b 0%, #091424 100%)',
              border: '2px solid #cbd5e1',
              borderRadius: '20px',
              padding: '1.75rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#e2e8f0',
                color: '#06172e',
                fontWeight: 900,
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.85rem',
              }}>
                2
              </div>
              <span style={{ fontSize: '2.6rem', display: 'block', marginBottom: '0.35rem' }}>{top3[1].logo}</span>
              <h2 style={{ fontSize: '1.45rem', color: '#ffffff', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
                {top3[1].name}
              </h2>
              <span style={{ color: '#94a3b8', fontSize: '0.88rem', display: 'block', marginBottom: '0.75rem' }}>
                {top3[1].sector} {top3[1].boothNumber ? `• ${top3[1].boothNumber}` : ''}
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#e2e8f0', fontFamily: 'var(--font-display)' }}>
                {top3[1].compositeScore.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>PTS</span>
              </div>
            </div>
          )}

          {/* #1 Gold - Elevated */}
          {top3[0] && (
            <div style={{
              background: 'linear-gradient(180deg, #18345c 0%, #0c1d36 100%)',
              border: '3px solid #ffd233',
              borderRadius: '24px',
              padding: '2.35rem 1.75rem',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(255, 210, 51, 0.3)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ffd233',
                color: '#06172e',
                fontWeight: 900,
                fontSize: '0.8rem',
                padding: '0.3rem 1.25rem',
                borderRadius: '9999px',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}>
                🏆 EVENT LEADER
              </div>

              <div style={{
                width: '66px',
                height: '66px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffe033 0%, #eab308 100%)',
                color: '#06172e',
                fontWeight: 900,
                fontSize: '1.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0.35rem auto 1rem',
                boxShadow: '0 0 30px rgba(255, 210, 51, 0.5)',
              }}>
                1
              </div>
              <span style={{ fontSize: '3.25rem', display: 'block', marginBottom: '0.35rem' }}>{top3[0].logo}</span>
              <h2 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.3rem', fontFamily: 'var(--font-display)' }}>
                {top3[0].name}
              </h2>
              <span style={{ color: '#ffd233', fontSize: '0.95rem', fontWeight: 700, display: 'block', marginBottom: '0.9rem' }}>
                {top3[0].sector} {top3[0].boothNumber ? `• ${top3[0].boothNumber}` : ''}
              </span>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ffd233', fontFamily: 'var(--font-display)' }}>
                {top3[0].compositeScore.toFixed(1)} <span style={{ fontSize: '1.15rem', color: '#94a3b8' }}>PTS</span>
              </div>
            </div>
          )}

          {/* #3 Bronze */}
          {top3[2] && (
            <div style={{
              background: 'linear-gradient(180deg, #10213b 0%, #091424 100%)',
              border: '2px solid #cd7f32',
              borderRadius: '20px',
              padding: '1.75rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#cd7f32',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.85rem',
              }}>
                3
              </div>
              <span style={{ fontSize: '2.6rem', display: 'block', marginBottom: '0.35rem' }}>{top3[2].logo}</span>
              <h2 style={{ fontSize: '1.45rem', color: '#ffffff', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
                {top3[2].name}
              </h2>
              <span style={{ color: '#94a3b8', fontSize: '0.88rem', display: 'block', marginBottom: '0.75rem' }}>
                {top3[2].sector} {top3[2].boothNumber ? `• ${top3[2].boothNumber}` : ''}
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#e2e8f0', fontFamily: 'var(--font-display)' }}>
                {top3[2].compositeScore.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>PTS</span>
              </div>
            </div>
          )}
        </div>

        {/* Ranks #4 - #10 Grid for Wide TV Visibility */}
        {rest.length > 0 && (
          <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0.75rem',
            }}>
              {rest.map((s, idx) => (
                <div
                  key={s.id}
                  style={{
                    background: 'rgba(15, 29, 52, 0.85)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '14px',
                    padding: '0.85rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <span style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#cbd5e1',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      #{idx + 4}
                    </span>
                    <span style={{ fontSize: '1.45rem', flexShrink: 0 }}>{s.logo}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{s.sector}</span>
                        {s.boothNumber && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', color: '#38bdf8' }}>
                            • <MapPin size={10} /> {s.boothNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: '#ffd233', flexShrink: 0 }}>
                    {s.compositeScore.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TV Footer Bar */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.82rem',
        color: '#94a3b8',
      }}>
        <span>
          Scoring Formula: <strong style={{ color: '#ffd233' }}>50% Jury Rubric</strong> •{' '}
          <strong style={{ color: '#34d399' }}>30% Investor Backing</strong> •{' '}
          <strong style={{ color: '#38bdf8' }}>20% Student Affairs</strong>
        </span>
        <span>Last Live Sync: {lastUpdated || 'Connecting...'}</span>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Maximize2, Minimize2, Clock, Lock, MonitorPlay, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StartupLogo from '@/components/StartupLogo';

const BFEST_TARGET_DATE = new Date('2026-12-19T09:00:00+05:00').getTime();

export default function StageLeaderboardPage() {
  const { user, login, loading: authLoading } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<{ name: string; logoUrl: string }[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [eventTimeLeft, setEventTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [restPage, setRestPage] = useState(0);
  const [top3Changed, setTop3Changed] = useState(false);
  const prevTop3IdsRef = useRef<string>('');

  // Inline TV Admin Auth state
  const [tvEmail, setTvEmail] = useState('');
  const [tvPassword, setTvPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const isAuthorizedTvAdmin = !!user && (user.role === 'tv_admin' || user.role === 'admin');

  const fetchLive = async () => {
    try {
      const [lbRes, cfgRes] = await Promise.all([
        fetch('/api/leaderboard?firstSemesterOnly=true'),
        fetch('/api/event-config'),
      ]);
      const data = await lbRes.json();
      const cfgData = await cfgRes.json();

      if (data.success) {
        const nextTop3Ids = (data.items || []).slice(0, 3).map((x: any) => x.id).join(',');
        if (prevTop3IdsRef.current && prevTop3IdsRef.current !== nextTop3Ids) {
          setTop3Changed(true);
          setTimeout(() => setTop3Changed(false), 2400);
        }
        prevTop3IdsRef.current = nextTop3Ids;
        setItems(data.items);
        setIsFrozen(data.isFrozen);
        setLastUpdated(new Date().toLocaleTimeString());
      }
      if (cfgData.success && Array.isArray(cfgData.config?.sponsors)) {
        setSponsors(cfgData.config.sponsors);
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
      updateEventClock();
    }, 1000);

    const rotateTimer = setInterval(() => {
      setRestPage((prev) => prev + 1);
    }, 5000);

    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);

    return () => {
      document.body.classList.remove('stage-mode');
      clearInterval(interval);
      clearInterval(timer);
      clearInterval(rotateTimer);
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
  const restPool = items.slice(3, 15); // Ranks #4 through #15
  const pageSize = 4;
  const totalRestPages = Math.max(1, Math.ceil(restPool.length / pageSize));
  const currentRestPage = restPage % totalRestPages;
  const visibleRest = restPool.slice(currentRestPage * pageSize, currentRestPage * pageSize + pageSize);

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
    <div
      className="stage-tv-root"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #0f294a 0%, #050b16 65%, #02050b 100%)',
        color: '#ffffff',
        padding: 'clamp(0.75rem, 1.8vh, 2.5rem) clamp(1rem, 2.5vw, 4rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 'clamp(0.75rem, 1.4vh, 2rem)',
      }}
    >
      {/* TV Broadcast Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1vw',
        borderBottom: '2px solid rgba(255, 210, 51, 0.35)',
        paddingBottom: 'clamp(0.6rem, 1.2vh, 1.4rem)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.65rem, 1vw, 1.5rem)' }}>
          <img
            src="/bfest-logo.jpg"
            alt="Business Fest Logo"
            style={{
              width: 'clamp(44px, 3.6vw, 84px)',
              height: 'clamp(44px, 3.6vw, 84px)',
              borderRadius: 'clamp(10px, 0.9vw, 20px)',
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
                fontSize: 'clamp(1.4rem, 2.5vw, 4rem)',
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
                  fontSize: 'clamp(0.7rem, 0.85vw, 1.15rem)',
                  fontWeight: 800,
                }}>
                  <Lock size={12} /> STANDINGS FROZEN
                </span>
              )}
            </div>
            <span style={{ fontSize: 'clamp(0.7rem, 1vw, 1.45rem)', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              IMSciences Peshawar — 1st Semester Legacy Board
            </span>
          </div>
        </div>

        {/* Countdown + IMSciences Logo + Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 0.8vw, 1.25rem)', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 210, 51, 0.35)',
            borderRadius: '12px',
            padding: 'clamp(0.35rem, 0.6vh, 0.75rem) clamp(0.65rem, 0.9vw, 1.35rem)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Clock size={16} color="#ffd233" />
            <span style={{ fontSize: 'clamp(0.72rem, 0.85vw, 1.2rem)', color: '#ffd233', fontWeight: 700, textTransform: 'uppercase' }}>
              19 Dec:
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(0.88rem, 1.1vw, 1.55rem)', color: '#ffffff' }}>
              {eventTimeLeft.days}d : {pad(eventTimeLeft.hours)}h : {pad(eventTimeLeft.minutes)}m : {pad(eventTimeLeft.seconds)}s
            </span>
          </div>

          <div style={{
            background: '#ffffff',
            padding: 'clamp(3px, 0.4vh, 8px) clamp(8px, 0.7vw, 14px)',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
          }}>
            <img
              src="/imsciences-logo.png"
              alt="IMSciences Peshawar"
              style={{ height: 'clamp(22px, 2.2vh, 44px)', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen TV Mode' : 'Enter Fullscreen TV Mode'}
            className="btn btn-secondary btn-sm"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 'clamp(0.75rem, 0.85vw, 1.1rem)' }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{isFullscreen ? 'Exit TV' : 'Fullscreen TV'}</span>
          </button>

          {!isFullscreen && (
            <Link href="/leaderboard" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 'clamp(0.75rem, 0.85vw, 1.1rem)' }}>
              <ArrowLeft size={15} /> Back
            </Link>
          )}
        </div>
      </div>

      {/* Animations for Stage Display */}
      <style>{`
        @keyframes top3RankPulse {
          0% { transform: scale(1); }
          35% { transform: scale(1.04) translateY(-6px); box-shadow: 0 0 60px rgba(255, 210, 51, 0.65); }
          100% { transform: scale(1); }
        }
        @keyframes stageSlideUp {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes sponsorMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .top3-rank-changed {
          animation: top3RankPulse 1.4s ease-out;
        }
        .stage-rest-animate {
          animation: stageSlideUp 0.55s ease-out;
        }
        @media (min-width: 900px) {
          .stage-tv-root {
            height: 100vh;
            max-height: 100vh;
            overflow: hidden;
          }
        }
        .sponsor-marquee-track {
          display: flex;
          align-items: center;
          gap: clamp(1.5rem, 2.5vw, 4rem);
          width: max-content;
          animation: sponsorMarquee 24s linear infinite;
        }
      `}</style>

      {/* Top 3 Podium & Ranks #4-#15 (Viewport-Scaled for Laptop to 4K TV) */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(0.75rem, 1.8vh, 2rem)' }}>
        {items.length === 0 ? (
          <div style={{
            maxWidth: 'min(92vw, 760px)',
            margin: '0 auto',
            textAlign: 'center',
            background: 'rgba(15, 29, 52, 0.75)',
            border: '1px solid rgba(255, 210, 51, 0.3)',
            borderRadius: '20px',
            padding: 'clamp(1.5rem, 4vh, 3.5rem)',
          }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 2vw, 2.5rem)', color: '#ffd233', marginBottom: '0.6rem', fontFamily: 'var(--font-display)' }}>
              Waiting for 1st Semester Startups
            </h2>
            <p style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1.5rem)', color: '#cbd5e1' }}>
              Student Affairs or the Registration Team can add 1st Semester startups from the Register page to display them here.
            </p>
          </div>
        ) : (
        <>
        <div
          className={`grid grid-cols-3 ${top3Changed ? 'top3-rank-changed' : ''}`}
          style={{
            alignItems: 'end',
            gap: 'clamp(0.75rem, 1.5vw, 2.25rem)',
            maxWidth: 'min(94vw, 1800px)',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {/* #2 Silver */}
          {top3[1] && (
            <div style={{
              background: 'linear-gradient(180deg, #10213b 0%, #091424 100%)',
              border: '2px solid #cbd5e1',
              borderRadius: 'clamp(14px, 1.4vw, 26px)',
              padding: 'clamp(0.85rem, 1.8vh, 2.25rem) clamp(0.75rem, 1.3vw, 2rem)',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.55)',
              transition: 'all 0.5s ease',
            }}>
              <div style={{
                width: 'clamp(34px, 3vw, 64px)',
                height: 'clamp(34px, 3vw, 64px)',
                borderRadius: '50%',
                background: '#e2e8f0',
                color: '#06172e',
                fontWeight: 900,
                fontSize: 'clamp(1rem, 1.3vw, 2rem)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto clamp(0.35rem, 0.8vh, 0.9rem)',
              }}>
                2
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2vh' }}>
                <StartupLogo logo={top3[1].logo} name={top3[1].name} size="clamp(40px, 3.6vw, 72px)" fontSize="clamp(1.6rem, 2.5vw, 3.8rem)" rounded="14px" />
              </div>
              <h2 style={{ fontSize: 'clamp(1rem, 1.45vw, 2.25rem)', color: '#ffffff', marginBottom: '0.2vh', fontFamily: 'var(--font-display)' }}>
                {top3[1].name}
              </h2>
              <span style={{ color: '#94a3b8', fontSize: 'clamp(0.72rem, 0.9vw, 1.3rem)', display: 'block', marginBottom: 'clamp(0.35rem, 0.8vh, 0.9rem)' }}>
                {top3[1].sector}
              </span>
              <div style={{ fontSize: 'clamp(1.5rem, 2.4vw, 3.6rem)', fontWeight: 900, color: '#e2e8f0', fontFamily: 'var(--font-display)' }}>
                {top3[1].compositeScore.toFixed(1)} <span style={{ fontSize: 'clamp(0.75rem, 0.95vw, 1.35rem)', color: '#64748b' }}>PTS</span>
              </div>
            </div>
          )}

          {/* #1 Gold - Elevated */}
          {top3[0] && (
            <div style={{
              background: 'linear-gradient(180deg, #18345c 0%, #0c1d36 100%)',
              border: '3px solid #ffd233',
              borderRadius: 'clamp(16px, 1.6vw, 30px)',
              padding: 'clamp(1.1rem, 2.4vh, 2.85rem) clamp(0.9rem, 1.5vw, 2.25rem)',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(255, 210, 51, 0.28)',
              position: 'relative',
              transition: 'all 0.5s ease',
            }}>
              <div style={{
                position: 'absolute',
                top: 'clamp(-16px, -1.2vh, -10px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ffd233',
                color: '#06172e',
                fontWeight: 900,
                fontSize: 'clamp(0.65rem, 0.8vw, 1.15rem)',
                padding: 'clamp(0.2rem, 0.35vh, 0.45rem) clamp(0.8rem, 1.2vw, 1.6rem)',
                borderRadius: '9999px',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}>
                🏆 EVENT LEADER
              </div>

              <div style={{
                width: 'clamp(42px, 3.8vw, 80px)',
                height: 'clamp(42px, 3.8vw, 80px)',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffe033 0%, #eab308 100%)',
                color: '#06172e',
                fontWeight: 900,
                fontSize: 'clamp(1.2rem, 1.7vw, 2.5rem)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0.3vh auto clamp(0.4rem, 1vh, 1.1rem)',
                boxShadow: '0 0 24px rgba(255, 210, 51, 0.45)',
              }}>
                1
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2vh' }}>
                <StartupLogo logo={top3[0].logo} name={top3[0].name} size="clamp(48px, 4.4vw, 88px)" fontSize="clamp(2rem, 3.1vw, 4.6rem)" rounded="16px" />
              </div>
              <h2 style={{ fontSize: 'clamp(1.2rem, 1.8vw, 2.75rem)', color: '#ffffff', marginBottom: '0.2vh', fontFamily: 'var(--font-display)' }}>
                {top3[0].name}
              </h2>
              <span style={{ color: '#ffd233', fontSize: 'clamp(0.78rem, 0.95vw, 1.4rem)', fontWeight: 700, display: 'block', marginBottom: 'clamp(0.45rem, 1vh, 1.1rem)' }}>
                {top3[0].sector}
              </span>
              <div style={{ fontSize: 'clamp(1.85rem, 3vw, 4.4rem)', fontWeight: 900, color: '#ffd233', fontFamily: 'var(--font-display)' }}>
                {top3[0].compositeScore.toFixed(1)} <span style={{ fontSize: 'clamp(0.85rem, 1.1vw, 1.55rem)', color: '#94a3b8' }}>PTS</span>
              </div>
            </div>
          )}

          {/* #3 Bronze */}
          {top3[2] && (
            <div style={{
              background: 'linear-gradient(180deg, #10213b 0%, #091424 100%)',
              border: '2px solid #cd7f32',
              borderRadius: 'clamp(14px, 1.4vw, 26px)',
              padding: 'clamp(0.85rem, 1.8vh, 2.25rem) clamp(0.75rem, 1.3vw, 2rem)',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.55)',
              transition: 'all 0.5s ease',
            }}>
              <div style={{
                width: 'clamp(34px, 3vw, 64px)',
                height: 'clamp(34px, 3vw, 64px)',
                borderRadius: '50%',
                background: '#cd7f32',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 'clamp(1rem, 1.3vw, 2rem)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto clamp(0.35rem, 0.8vh, 0.9rem)',
              }}>
                3
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2vh' }}>
                <StartupLogo logo={top3[2].logo} name={top3[2].name} size="clamp(40px, 3.6vw, 72px)" fontSize="clamp(1.6rem, 2.5vw, 3.8rem)" rounded="14px" />
              </div>
              <h2 style={{ fontSize: 'clamp(1rem, 1.45vw, 2.25rem)', color: '#ffffff', marginBottom: '0.2vh', fontFamily: 'var(--font-display)' }}>
                {top3[2].name}
              </h2>
              <span style={{ color: '#94a3b8', fontSize: 'clamp(0.72rem, 0.9vw, 1.3rem)', display: 'block', marginBottom: 'clamp(0.35rem, 0.8vh, 0.9rem)' }}>
                {top3[2].sector}
              </span>
              <div style={{ fontSize: 'clamp(1.5rem, 2.4vw, 3.6rem)', fontWeight: 900, color: '#e2e8f0', fontFamily: 'var(--font-display)' }}>
                {top3[2].compositeScore.toFixed(1)} <span style={{ fontSize: 'clamp(0.75rem, 0.95vw, 1.35rem)', color: '#64748b' }}>PTS</span>
              </div>
            </div>
          )}
        </div>

        {/* Ranks #4 - #15 Rotating Animated Grid */}
        {visibleRest.length > 0 && (
          <div style={{ maxWidth: 'min(94vw, 1800px)', width: '100%', margin: '0 auto' }}>
            <div
              key={currentRestPage}
              className="stage-rest-animate"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(220px, 20vw, 420px), 1fr))',
                gap: 'clamp(0.6rem, 1vw, 1.5rem)',
              }}
            >
              {visibleRest.map((s, idx) => {
                const rankNum = currentRestPage * pageSize + idx + 4;
                return (
                  <div
                    key={s.id}
                    style={{
                      background: 'rgba(15, 29, 52, 0.85)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: 'clamp(10px, 1vw, 18px)',
                      padding: 'clamp(0.65rem, 1.2vh, 1.5rem) clamp(0.9rem, 1.2vw, 1.75rem)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75vw',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 0.8vw, 1.25rem)', minWidth: 0 }}>
                      <span style={{
                        width: 'clamp(28px, 2.2vw, 48px)',
                        height: 'clamp(28px, 2.2vw, 48px)',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        fontWeight: 900,
                        fontSize: 'clamp(0.8rem, 1vw, 1.45rem)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        #{rankNum}
                      </span>
                      <StartupLogo logo={s.logo} name={s.name} size="clamp(28px, 2.2vw, 48px)" fontSize="clamp(1.2rem, 1.7vw, 2.4rem)" rounded="8px" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 'clamp(0.88rem, 1.1vw, 1.6rem)', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: 'clamp(0.7rem, 0.8vw, 1.15rem)', color: '#94a3b8' }}>
                          {s.sector}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.05rem, 1.4vw, 2.1rem)', color: '#ffd233', flexShrink: 0 }}>
                      {s.compositeScore.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {/* Dynamic Moving "Our Proud Sponsors" Marquee Footer */}
      <div style={{
        borderTop: '1px solid rgba(255, 210, 51, 0.25)',
        paddingTop: 'clamp(0.6rem, 1.1vh, 1.25rem)',
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(0.9rem, 1.5vw, 2rem)',
        overflow: 'hidden',
      }}>
        <div style={{
          flexShrink: 0,
          fontSize: 'clamp(0.75rem, 0.95vw, 1.35rem)',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#ffd233',
          paddingRight: 'clamp(0.75rem, 1.2vw, 1.75rem)',
          borderRight: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          Our Proud Sponsors
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {sponsors.length > 0 ? (
            <div className="sponsor-marquee-track">
              {[...sponsors, ...sponsors].map((sp, idx) => (
                <div
                  key={`${sp.name}-${idx}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: 'clamp(0.25rem, 0.5vh, 0.6rem) clamp(0.7rem, 1vw, 1.35rem)',
                    borderRadius: '10px',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={sp.logoUrl}
                    alt={sp.name}
                    style={{ height: 'clamp(22px, 2.6vh, 48px)', maxWidth: 'clamp(70px, 7vw, 140px)', objectFit: 'contain' }}
                  />
                  <span style={{ color: '#0b2545', fontWeight: 700, fontSize: 'clamp(0.78rem, 0.95vw, 1.35rem)', whiteSpace: 'nowrap' }}>
                    {sp.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 'clamp(0.78rem, 0.95vw, 1.35rem)', color: '#94a3b8' }}>
              Partnering with leading organizations to empower student entrepreneurship at IMSciences Peshawar.
            </div>
          )}
        </div>

        <span style={{ flexShrink: 0, fontSize: 'clamp(0.7rem, 0.8vw, 1.1rem)', color: '#64748b' }}>
          Synced {lastUpdated || '...'}
        </span>
      </div>
    </div>
  );
}

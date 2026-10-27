'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ArrowLeft, RefreshCw, Sparkles, Star } from 'lucide-react';
import { Startup } from '@/types';

export default function StageLeaderboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [countdown, setCountdown] = useState(5);

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
    // Add stage-mode class to body for dark theme
    document.body.classList.add('stage-mode');
    fetchLive();

    const interval = setInterval(() => {
      fetchLive();
    }, 5000);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 5));
    }, 1000);

    return () => {
      document.body.classList.remove('stage-mode');
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const top3 = items.slice(0, 3);
  const rest = items.slice(3, 8);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 10%, #0d213a 0%, #040913 60%, #02050b 100%)',
      color: '#ffffff',
      padding: '2rem 3rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      {/* Stage Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid rgba(212, 175, 55, 0.4)',
        paddingBottom: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ffd700 0%, #c59b27 100%)',
            color: '#06172e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.4rem',
            boxShadow: '0 0 25px rgba(212, 175, 55, 0.5)',
          }}>
            BF
          </div>
          <div>
            <h1 style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1.1,
            }}>
              BUSINESS FEST <span style={{ color: '#ffd700' }}>2027</span>
            </h1>
            <span style={{ fontSize: '0.95rem', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              IMSciences Peshawar — Main Stage Competition Feed
            </span>
          </div>
        </div>

        {/* Live Status & Return Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            background: 'rgba(11, 37, 69, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '9999px',
            padding: '0.5rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span className="live-indicator"></span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              AUTO-SYNC: {countdown}s
            </span>
          </div>

          <Link href="/leaderboard" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={16} /> Exit Stage
          </Link>
        </div>
      </div>

      {/* Podium Centerpiece */}
      <div style={{ margin: '2.5rem 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2.5rem',
          alignItems: 'end',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* #2 Silver */}
          {top3[1] && (
            <div style={{
              background: 'linear-gradient(180deg, #10213b 0%, #091424 100%)',
              border: '2px solid #a0a0a0',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#e2e8f0',
                color: '#06172e',
                fontWeight: 900,
                fontSize: '1.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 0 20px rgba(226, 232, 240, 0.3)',
              }}>
                2
              </div>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>{top3[1].logo}</span>
              <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
                {top3[1].name}
              </h2>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '1.25rem' }}>
                {top3[1].sector}
              </span>
              <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#e2e8f0', fontFamily: 'var(--font-display)' }}>
                {top3[1].compositeScore.toFixed(1)} <span style={{ fontSize: '1.1rem', color: '#64748b' }}>PTS</span>
              </div>
            </div>
          )}

          {/* #1 Gold - Elevated */}
          {top3[0] && (
            <div style={{
              background: 'linear-gradient(180deg, #162f52 0%, #0d1e35 100%)',
              border: '3px solid #ffd700',
              borderRadius: '24px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(255, 215, 0, 0.35)',
              transform: 'scale(1.06)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ffd700',
                color: '#06172e',
                fontWeight: 900,
                fontSize: '0.85rem',
                padding: '0.35rem 1.5rem',
                borderRadius: '9999px',
                letterSpacing: '0.08em',
              }}>
                EVENT LEADER
              </div>

              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffe033 0%, #d4af37 100%)',
                color: '#06172e',
                fontWeight: 900,
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0.5rem auto 1.5rem',
                boxShadow: '0 0 35px rgba(255, 215, 0, 0.6)',
              }}>
                1
              </div>
              <span style={{ fontSize: '3.8rem', display: 'block', marginBottom: '0.5rem' }}>{top3[0].logo}</span>
              <h2 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                {top3[0].name}
              </h2>
              <span style={{ color: '#ffd700', fontSize: '1rem', fontWeight: 600, display: 'block', marginBottom: '1.5rem' }}>
                {top3[0].sector}
              </span>
              <div style={{ fontSize: '3.2rem', fontWeight: 900, color: '#ffd700', fontFamily: 'var(--font-display)' }}>
                {top3[0].compositeScore.toFixed(1)} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>PTS</span>
              </div>
            </div>
          )}

          {/* #3 Bronze */}
          {top3[2] && (
            <div style={{
              background: 'linear-gradient(180deg, #10213b 0%, #091424 100%)',
              border: '2px solid #cd7f32',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#cd7f32',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 0 20px rgba(205, 127, 50, 0.3)',
              }}>
                3
              </div>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>{top3[2].logo}</span>
              <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
                {top3[2].name}
              </h2>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '1.25rem' }}>
                {top3[2].sector}
              </span>
              <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#e2e8f0', fontFamily: 'var(--font-display)' }}>
                {top3[2].compositeScore.toFixed(1)} <span style={{ fontSize: '1.1rem', color: '#64748b' }}>PTS</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stage Footer Ticker */}
      <div style={{
        background: '#071324',
        border: '1px solid #1a2f4d',
        borderRadius: '16px',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <span style={{ color: '#ffd700', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase' }}>
            Top Contenders:
          </span>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {rest.map((s, idx) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontWeight: 800 }}>#{idx + 4}</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{s.name}</span>
                <span style={{ color: '#ffd700', fontSize: '0.85rem' }}>({s.compositeScore.toFixed(1)})</span>
              </div>
            ))}
          </div>
        </div>

        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Updated: {lastUpdated || 'Connecting...'}
        </span>
      </div>
    </div>
  );
}

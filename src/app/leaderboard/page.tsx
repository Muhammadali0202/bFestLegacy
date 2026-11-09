'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  RotateCw, 
  MonitorPlay, 
  Star, 
  Award, 
  Lock, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { BusinessSector } from '@/types';

interface LeaderboardItem {
  rank: number;
  id: string;
  name: string;
  tagline: string;
  sector: BusinessSector;
  logo: string;
  boothNumber?: string;
  compositeScore: number;
  judgeScore: number;
  investorScore?: number;
  investorRating?: number;
  totalInvestedAmount?: number;
  publicRating: number;
  totalVotes: number;
}

export default function LeaderboardPage() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const sectors = [
    'All',
    'FinTech & Banking',
    'AgriTech & Food',
    'HealthTech & Med',
    'EdTech & Learning',
    'AI & Smart Systems',
    'Green & CleanTech',
    'E-Commerce & Logistics',
  ];

  const fetchLeaderboard = async () => {
    try {
      const url = selectedSector === 'All' 
        ? '/api/leaderboard' 
        : `/api/leaderboard?sector=${encodeURIComponent(selectedSector)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setIsFrozen(data.isFrozen);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLeaderboard();
      }, 8000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedSector, autoRefresh]);

  const top3 = items.slice(0, 3);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Header & Controls */}
      <div className="flex justify-between items-start flex-wrap gap-4" style={{ marginBottom: '2.5rem' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
            <span className="badge badge-gold">
              <Trophy size={14} /> Official Standings
            </span>
            {isFrozen && (
              <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Lock size={12} /> Standings Frozen by Organizers
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
            Live Event Leaderboard
          </h1>
          <p style={{ color: 'var(--bf-text-secondary)', fontSize: '0.92rem', maxWidth: '750px' }}>
            Composite rankings calculated dynamically from official jury rubrics (50%), accredited investor ratings & capital (30%), and Student Affairs ratings (20%).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 items-center flex-wrap">
          <button
            onClick={() => fetchLeaderboard()}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RotateCw size={14} /> Refresh
          </button>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--bf-text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-sync (8s)
          </label>
        </div>
      </div>

      {/* Sector Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '2.5rem',
      }}>
        {sectors.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSector(sec)}
            className={`btn btn-sm ${selectedSector === sec ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '9999px', whiteSpace: 'nowrap', fontSize: '0.82rem' }}
          >
            {sec}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '5rem 0', textAlign: 'center' }}>
          <RotateCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: 'var(--bf-accent-gold)' }} />
          <p style={{ color: 'var(--bf-text-muted)' }}>Calculating real-time composite scores...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Trophy size={48} color="var(--bf-text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>No Evaluated Startups in this Category</h3>
          <p style={{ color: 'var(--bf-text-secondary)' }}>Scores will populate as judges, investors, and audience submit ratings.</p>
        </div>
      ) : (
        <>
          {/* Compact Ranked Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid var(--bf-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--bf-primary)' }}>Official Competition Standings</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--bf-text-muted)' }}>Last synced: {lastRefreshed}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--bf-border)', color: 'var(--bf-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.7rem 1.25rem', width: '60px' }}>Rank</th>
                    <th style={{ padding: '0.7rem 1rem' }}>Title</th>
                    <th style={{ padding: '0.7rem 1rem' }}>Sector</th>
                    <th style={{ padding: '0.7rem 0.75rem', textAlign: 'center' }}>Jury (50%)</th>
                    <th style={{ padding: '0.7rem 0.75rem', textAlign: 'center' }}>Investor (30%)</th>
                    <th style={{ padding: '0.7rem 0.75rem', textAlign: 'center' }}>Student Affairs (20%)</th>
                    <th style={{ padding: '0.7rem 1.25rem', textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--bf-border)',
                        background: idx === 0 ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          background: idx === 0 ? 'var(--bf-accent-gold)' : idx < 3 ? '#e2e8f0' : '#f1f5f9',
                          color: idx === 0 ? '#06172e' : 'var(--bf-text-primary)',
                        }}>
                          {item.rank}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.75rem' }}>{item.logo}</span>
                          <div>
                            <Link href={`/startups/${item.id}`} style={{ fontWeight: 700, color: 'var(--bf-primary)', fontSize: '1rem', display: 'block' }}>
                              {item.name}
                            </Link>
                            <span style={{ fontSize: '0.78rem', color: 'var(--bf-text-muted)' }}>
                              {item.boothNumber || 'Main Exhibition Arena'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span className="badge badge-sector">{item.sector}</span>
                      </td>

                      {/* Jury Score (50%) */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--bf-primary)' }}>
                          {item.judgeScore > 0 ? item.judgeScore.toFixed(1) : '-'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)' }}> / 100</span>
                      </td>

                      {/* Investor Backing (30%) */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Briefcase size={13} color="#10b981" />
                            <span style={{ fontWeight: 700, color: '#047857' }}>
                              {item.investorRating && item.investorRating > 0 ? `${item.investorRating}★` : '—'}
                            </span>
                          </div>
                          {item.totalInvestedAmount && item.totalInvestedAmount > 0 ? (
                            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                              PKR {(item.totalInvestedAmount / 1000).toLocaleString()}k
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Audience (20%) */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                          <Star size={13} fill="#f59e0b" color="#f59e0b" />
                          <span style={{ fontWeight: 700 }}>{item.publicRating.toFixed(1)}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)' }}>({item.totalVotes})</span>
                        </div>
                      </td>

                      {/* Composite Total */}
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          color: idx === 0 ? '#b8860b' : 'var(--bf-primary)',
                          fontFamily: 'var(--font-display)',
                        }}>
                          {item.compositeScore.toFixed(1)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--bf-text-muted)' }}> PTS</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

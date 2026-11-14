'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Star, ArrowRight, ExternalLink, Users, Award, Sparkles, FileSpreadsheet } from 'lucide-react';
import { Startup, BusinessSector, EventConfig } from '@/types';
import { useAuth } from '@/context/AuthContext';

function StartupsDirectoryContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialSector = searchParams.get('sector') || 'All';

  const [startups, setStartups] = useState<Startup[]>([]);
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState(initialSector);
  const [sortBy, setSortBy] = useState<'rank' | 'rating' | 'name'>('rank');

  const sectors: (BusinessSector | 'All')[] = [
    'All',
    'FinTech & Banking',
    'AgriTech & Food',
    'HealthTech & Med',
    'EdTech & Learning',
    'AI & Smart Systems',
    'Green & CleanTech',
    'E-Commerce & Logistics',
  ];

  useEffect(() => {
    Promise.all([
      fetch('/api/startups?onlyPublished=true').then((res) => res.json()),
      fetch('/api/event-config').then((res) => res.json()),
    ])
      .then(([startupsData, configData]) => {
        if (startupsData.success) {
          setStartups(startupsData.startups);
        }
        if (configData.success) {
          setConfig(configData.config);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filter and sort startups
  const filteredStartups = startups.filter((startup) => {
    const matchesSector = selectedSector === 'All' || startup.sector === selectedSector;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      startup.name.toLowerCase().includes(q) ||
      startup.tagline.toLowerCase().includes(q) ||
      startup.description.toLowerCase().includes(q) ||
      startup.founders.some((f) => f.name.toLowerCase().includes(q));

    return matchesSector && matchesSearch;
  });

  filteredStartups.sort((a, b) => {
    if (sortBy === 'rank') return b.compositeScore - a.compositeScore;
    if (sortBy === 'rating') return b.publicRating - a.publicRating;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>
          Participating Startups
        </h1>
        <p style={{ color: 'var(--bf-text-secondary)', fontSize: '1.05rem', maxWidth: '650px' }}>
          Discover student-led ventures and innovative ideas showcasing at Business Fest 2027.
        </p>
      </div>

      {/* Shared Google Sheet Bar for Student Affairs, Registration Team, and Admin */}
      {user && (user.role === 'student_affairs' || user.role === 'registration_team' || user.role === 'admin') && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <strong style={{ color: '#065f46', fontSize: '0.92rem', display: 'block' }}>
              📊 Student Affairs & Registration Team — Shared Stall Sheet
            </strong>
            <span style={{ color: '#047857', fontSize: '0.82rem' }}>
              View the shared Google Form response sheet or sync new stalls directly into the directory.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {config?.googleSheetUrl && (
              <a
                href={config.googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ background: '#ffffff', color: '#065f46' }}
              >
                <FileSpreadsheet size={15} /> Open Shared Google Sheet <ExternalLink size={13} />
              </a>
            )}
            <Link href="/register" className="btn btn-primary btn-sm">
              Google Form & Sheet Sync Hub <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div style={{
        background: 'var(--bf-bg-surface)',
        border: '1px solid var(--bf-border)',
        borderRadius: 'var(--bf-radius-md)',
        padding: '1.25rem',
        marginBottom: '2rem',
        boxShadow: 'var(--bf-shadow-sm)',
      }}>
        <div className="flex gap-4 items-center justify-between flex-wrap" style={{ marginBottom: '1.25rem' }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: '#f8fafc',
            border: '1px solid var(--bf-border)',
            borderRadius: '9999px',
            padding: '0.6rem 1.25rem',
            flex: '1 1 320px',
          }}>
            <Search size={18} color="var(--bf-text-muted)" />
            <input
              type="text"
              placeholder="Search by company, idea, or founder name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--bf-text-primary)',
              }}
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--bf-text-secondary)' }}>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid var(--bf-border)',
                borderRadius: '8px',
                padding: '0.55rem 0.9rem',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--bf-text-primary)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="rank">Highest Composite Score</option>
              <option value="rating">Audience Rating (Stars)</option>
              <option value="name">Company Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Sector Filter Pills */}
        <div className="flex gap-2 flex-wrap items-center">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bf-primary)', marginRight: '0.4rem' }}>
            Tracks:
          </span>
          {sectors.map((sector) => {
            const isSelected = selectedSector === sector;
            return (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                style={{
                  background: isSelected ? 'var(--bf-primary)' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : 'var(--bf-text-secondary)',
                  border: isSelected ? '1px solid var(--bf-primary)' : '1px solid var(--bf-border)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {sector}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--bf-text-muted)' }}>
          Loading directory profiles...
        </div>
      ) : filteredStartups.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bf-bg-surface)',
          border: '1px solid var(--bf-border)',
          borderRadius: 'var(--bf-radius-md)',
        }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>No startups match your search</h3>
          <p style={{ color: 'var(--bf-text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Try adjusting your search terms or clearing the sector filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSector('All'); }}
            className="btn btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredStartups.map((startup) => (
            <div key={startup.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Card Top */}
                <div className="flex justify-between items-start" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '2.2rem' }}>{startup.logo}</span>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--bf-primary)', lineHeight: 1.2 }}>
                        {startup.name}
                      </h3>
                    </div>
                  </div>
                  {startup.rank && (
                    <span style={{
                      background: startup.rank <= 3 ? 'var(--bf-accent-gold)' : '#f1f5f9',
                      color: startup.rank <= 3 ? '#06172e' : 'var(--bf-text-secondary)',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                    }}>
                      #{startup.rank}
                    </span>
                  )}
                </div>

                <div className="badge badge-sector" style={{ marginBottom: '0.75rem' }}>
                  {startup.sector}
                </div>

                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--bf-text-secondary)',
                  marginBottom: '1rem',
                  lineHeight: 1.5,
                  minHeight: '44px',
                }}>
                  {startup.tagline}
                </p>

                {/* Founders */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  color: 'var(--bf-text-muted)',
                  marginBottom: '1.25rem',
                }}>
                  <Users size={14} />
                  <span>{startup.founders.map(f => f.name).join(', ')}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--bf-border)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--bf-text-muted)', display: 'block' }}>Score</span>
                    <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--bf-primary)' }}>
                      {startup.compositeScore.toFixed(1)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--bf-text-muted)', display: 'block' }}>Progress Rating</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{startup.publicRating.toFixed(1)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)' }}>({startup.totalPublicVotes})</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/startups/${startup.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StartupsDirectoryPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading directory...</div>}>
      <StartupsDirectoryContent />
    </Suspense>
  );
}

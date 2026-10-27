'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Rocket, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trophy, 
  Star, 
  Briefcase, 
  Users, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Startup } from '@/types';

export default function StudentPortalPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [myStartups, setMyStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch startups submitted by this user or matching email
    fetch(`/api/startups?status=all`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const userSubmissions = data.startups.filter(
            (s: Startup) => s.submittedBy === user.id || s.contactEmail.toLowerCase() === user.email.toLowerCase()
          );
          setMyStartups(userSubmissions);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading Student Portal...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0b2545 0%, #133a6f 100%)',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '2.5rem',
        marginBottom: '2.5rem',
        boxShadow: '0 12px 30px -5px rgba(11, 37, 69, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(212, 175, 55, 0.2)',
            color: '#d4af37',
            padding: '0.3rem 0.8rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}>
            <GraduationCap size={16} /> Student Founder Portal
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            Welcome, {user?.fullName}!
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.05rem', maxWidth: '650px', marginBottom: '1.5rem' }}>
            Team: <strong>{user?.teamName || 'Innovation Team'}</strong> • Institution: <strong>{user?.institution || 'IMSciences Peshawar'}</strong>
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/register"
              className="btn btn-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
            >
              <PlusCircle size={18} /> Register a New Startup
            </Link>
            <Link
              href="/leaderboard"
              className="btn btn-outline-white"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Trophy size={18} /> View Live Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#0b2545', marginBottom: '0.2rem' }}>
              Your Registered Ventures
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Track moderation status, judge rubric scores, and investor backing
            </p>
          </div>
        </div>

        {myStartups.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '2px dashed #cbd5e1',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <Rocket size={32} color="#0066cc" />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.5rem' }}>
              No Startup Registered Yet
            </h3>
            <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              Register your student team&apos;s venture to pitch in front of our distinguished jury and accredited angel investors at Business Fest 2027.
            </p>
            <Link
              href="/register"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            >
              <PlusCircle size={18} /> Register Startup Now <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {myStartups.map((startup) => (
              <div
                key={startup.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '2.5rem' }}>{startup.logo}</span>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', color: '#0b2545', fontWeight: 800 }}>
                          {startup.name}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#0066cc',
                          background: '#eff6ff',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                        }}>
                          {startup.sector}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {startup.status === 'approved' ? (
                        <span className="badge badge-live" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={12} /> Approved & Live
                        </span>
                      ) : startup.status === 'rejected' ? (
                        <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <AlertCircle size={12} /> Revision Needed
                        </span>
                      ) : (
                        <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} /> Pending Review
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {startup.tagline}
                  </p>

                  {/* Metrics Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '0.75rem 0.5rem',
                    marginBottom: '1.25rem',
                    textAlign: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>RANK</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d4af37' }}>
                        {startup.rank ? `#${startup.rank}` : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>JURY</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b2545' }}>
                        {startup.judgeScore > 0 ? startup.judgeScore : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>INVESTOR</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                        {startup.investorRating > 0 ? `${startup.investorRating}★` : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>COMPOSITE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0066cc' }}>
                        {startup.compositeScore > 0 ? startup.compositeScore : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Investor Backing Note */}
                  {startup.totalInvestedAmount > 0 && (
                    <div style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '10px',
                      padding: '0.6rem 0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      color: '#065f46',
                      fontWeight: 600,
                      marginBottom: '1rem',
                    }}>
                      <Briefcase size={16} color="#059669" />
                      Pledged Investment: PKR {startup.totalInvestedAmount.toLocaleString()}
                    </div>
                  )}

                  {/* Team Members */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Team Members ({startup.founders.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {startup.founders.map((f, i) => (
                        <span key={i} style={{
                          background: '#f1f5f9',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          color: '#334155',
                          fontWeight: 500,
                        }}>
                          {f.name} ({f.role})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <Link
                    href={`/startups/${startup.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <ExternalLink size={14} /> Public Page
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="btn btn-outline-primary btn-sm"
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <Trophy size={14} /> Leaderboard
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

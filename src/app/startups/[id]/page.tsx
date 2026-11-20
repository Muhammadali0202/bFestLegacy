'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Star, 
  Award, 
  Users, 
  Globe, 
  Mail, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Send,
  Briefcase,
  TrendingUp,
  X
} from 'lucide-react';
import { Startup, Investment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import StartupLogo from '@/components/StartupLogo';

const LEGACY_RUBRICS = [
  { id: '01', label: 'Marketing & Promotion' },
  { id: '02', label: 'Sponsorship Acquisition' },
  { id: '03', label: 'Strategic Partnerships' },
  { id: '04', label: 'Audience & Digital Growth' },
  { id: '05', label: 'Product Development' },
  { id: '06', label: 'Social Impact & Innovation' },
  { id: '07', label: 'Team Execution & Consistency' },
  { id: '08', label: 'Sales & Revenue Generation' },
  { id: '09', label: 'Customer Validation & Experience' },
  { id: '10', label: 'Financial & Operational Viability' },
];

export default function StartupProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();

  const [startup, setStartup] = useState<Startup | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Official progress & 10-Star Legacy Framework rating state
  const [selectedStars, setSelectedStars] = useState<string[]>([]);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [votingError, setVotingError] = useState('');
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  // Quick Investment Modal state for approved investors
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState(500000);
  const [dealType, setDealType] = useState('Seed Equity');
  const [investRating, setInvestRating] = useState(5);
  const [investReview, setInvestReview] = useState('');
  const [isSubmittingInvest, setIsSubmittingInvest] = useState(false);
  const [investMessage, setInvestMessage] = useState('');

  const loadStartupData = () => {
    if (!id) return;
    Promise.all([
      fetch(`/api/startups/${id}`).then(res => res.json()),
      fetch(`/api/investments?startupId=${id}`).then(res => res.json()),
    ])
      .then(([startupData, invData]) => {
        if (startupData.success) {
          setStartup(startupData.startup);
          setProgressPercentage(startupData.startup.progressPercentage ?? 0);
          setSelectedStars(Array.isArray(startupData.startup.rubricStars) ? startupData.startup.rubricStars : []);
        }
        if (invData.success) {
          setInvestments(invData.investments);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    const votedList = JSON.parse(localStorage.getItem('bf27_voted_startups') || '[]');
    if (votedList.includes(id)) {
      setVoteSubmitted(true);
    }
  };

  useEffect(() => {
    loadStartupData();
  }, [id]);

  const toggleRubricStar = (rubricId: string) => {
    setSelectedStars((prev) =>
      prev.includes(rubricId) ? prev.filter((item) => item !== rubricId) : [...prev, rubricId]
    );
  };

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isSubmittingVote) return;

    setIsSubmittingVote(true);
    setVotingError('');

    let voterToken = localStorage.getItem('bf27_voter_token');
    if (!voterToken) {
      voterToken = 'voter_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('bf27_voter_token', voterToken);
    }

    try {
      const res = await fetch('/api/evaluations/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId: id,
          voterToken: user?.id ? `sa_${user.id}` : voterToken,
          rating: selectedStars.length,
          rubricStars: selectedStars,
          progressPercentage,
          feedback,
          userRole: user?.role,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setVoteSubmitted(true);
        const votedList = JSON.parse(localStorage.getItem('bf27_voted_startups') || '[]');
        localStorage.setItem('bf27_voted_startups', JSON.stringify([...votedList, id]));
        loadStartupData();
      } else {
        setVotingError(data.error || 'Failed to submit vote.');
      }
    } catch (err) {
      setVotingError('Connection error. Please try again.');
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleInvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    setIsSubmittingInvest(true);

    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId: id,
          startupName: startup?.name,
          investorId: user.id,
          investorName: user.fullName,
          firmName: user.companyOrFirm,
          amount: investAmount,
          dealType,
          rating: investRating,
          review: investReview,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInvestMessage(`Investment of PKR ${investAmount.toLocaleString()} & ${investRating}★ rating submitted! Leaderboard updated.`);
        setIsInvestModalOpen(false);
        loadStartupData();
        setTimeout(() => setInvestMessage(''), 5000);
      } else {
        alert(data.error || 'Failed to submit investment.');
      }
    } catch (err) {
      alert('Network error while submitting investment.');
    } finally {
      setIsSubmittingInvest(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--bf-text-muted)' }}>Loading startup profile...</p>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--bf-primary)', marginBottom: '1rem' }}>Startup Not Found</h2>
        <p style={{ color: 'var(--bf-text-secondary)', marginBottom: '2rem' }}>The requested startup could not be located or may be pending approval.</p>
        <Link href="/startups" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Toast Alert */}
      {investMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#059669',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <Sparkles size={20} />
          <span>{investMessage}</span>
        </div>
      )}

      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/startups" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--bf-text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{
        padding: '2.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        position: 'relative',
      }}>
        <div className="flex justify-between items-start flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
          <div className="flex items-center gap-4">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--bf-radius-md)',
              background: '#f1f5f9',
              border: '2px solid var(--bf-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <StartupLogo logo={startup.logo} name={startup.name} size={76} fontSize="3rem" rounded="10px" />
            </div>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '2.2rem', color: 'var(--bf-primary)' }}>{startup.name}</h1>
                <span className="badge badge-approved">
                  <CheckCircle size={12} /> Verified Exhibitor
                </span>
              </div>
              <p style={{ fontSize: '1.15rem', color: 'var(--bf-text-secondary)', maxWidth: '750px', lineHeight: 1.4 }}>
                {startup.tagline}
              </p>
            </div>
          </div>

          {/* Quick Score Capsule */}
          <div style={{
            background: 'var(--bf-primary)',
            color: '#ffffff',
            borderRadius: 'var(--bf-radius-md)',
            padding: '1rem 1.5rem',
            textAlign: 'center',
            boxShadow: 'var(--bf-shadow-md)',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Composite Rank
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--bf-accent-gold)', fontFamily: 'var(--font-display)' }}>
              #{startup.rank || '-'}
            </div>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Score: {startup.compositeScore.toFixed(1)} / 100
            </span>
          </div>
        </div>

        {/* Metadata pills */}
        <div className="flex gap-4 items-center flex-wrap" style={{ borderTop: '1px solid var(--bf-border)', paddingTop: '1.25rem' }}>
          <div className="badge badge-sector" style={{ fontSize: '0.85rem' }}>
            {startup.sector}
          </div>
          {startup.programSemester && (
            <div className="badge badge-gold" style={{ fontSize: '0.85rem' }}>
              {startup.programSemester}
            </div>
          )}
          {startup.website && (
            <a href={startup.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--bf-accent-blue)', fontWeight: 600 }}>
              <Globe size={16} /> Official Website
            </a>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--bf-text-secondary)' }}>
            <Mail size={16} color="var(--bf-text-muted)" />
            <span>{startup.contactEmail}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details and Right-hand Scoring Sidebar */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column (2 cols): Details */}
        <div style={{ gridColumn: 'span 2' }}>
          {/* Summary */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--bf-primary)', marginBottom: '0.75rem' }}>
              Summary
            </h2>
            <p style={{ color: 'var(--bf-text-secondary)', lineHeight: 1.7, fontSize: '1rem' }}>
              {startup.description}
            </p>
          </div>

          {/* Problem & Solution Grid */}
          <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '1.75rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--bf-accent-rose)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--bf-primary)', marginBottom: '0.6rem' }}>
                The Problem Space
              </h3>
              <p style={{ color: 'var(--bf-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {startup.problem || 'Identified inefficiencies in regional market segments requiring localized technological interventions.'}
              </p>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--bf-accent-emerald)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--bf-primary)', marginBottom: '0.6rem' }}>
                Value Proposition & Solution
              </h3>
              <p style={{ color: 'var(--bf-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {startup.solution || 'Proprietary product offering sustainable unit economics and rapid scalability across KPK.'}
              </p>
            </div>
          </div>

          {/* Founders & Team */}
          <div className="card">
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <Users size={20} color="var(--bf-primary)" />
              <h3 style={{ fontSize: '1.3rem', color: 'var(--bf-primary)' }}>Student Founders & Team</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {startup.founders.map((founder, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  borderRadius: 'var(--bf-radius-sm)',
                  background: '#f8fafc',
                  border: '1px solid var(--bf-border)',
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--bf-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}>
                    {founder.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', color: 'var(--bf-primary)' }}>{founder.name}</h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--bf-text-muted)' }}>{founder.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Progress Rating & Judge Links */}
        <div>

          {/* Progress Rating Box (Rate Access Restricted to Bfest's Officials Only) */}
          <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--bf-border)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Star size={20} color="var(--bf-accent-gold)" fill="var(--bf-accent-gold)" />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--bf-primary)' }}>Progress Rating</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--bf-text-secondary)', marginBottom: '1.25rem' }}>
              Official progress percentage and rating recorded by Bfest&apos;s Officials.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--bf-border)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: user && (user.role === 'student_affairs' || user.role === 'admin') ? '1.25rem' : '0',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)', display: 'block' }}>Official Rating</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--bf-primary)' }}>
                    {startup.publicRating.toFixed(1)} / 10
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)', display: 'block' }}>Progress</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--bf-accent-blue)' }}>
                    {startup.progressPercentage ?? 0}%
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, startup.progressPercentage ?? 0))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #0047ff 0%, #3b82f6 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {user && (user.role === 'student_affairs' || user.role === 'admin') ? (
              voteSubmitted ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#047857',
                }}>
                  <CheckCircle size={28} style={{ margin: '0 auto 0.5rem' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Progress &amp; Rating Recorded!</h4>
                  <p style={{ fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                    Official evaluation submitted for {startup.name}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setVoteSubmitted(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Update Rating / Progress
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVoteSubmit}>
                  {votingError && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      padding: '0.6rem',
                      fontSize: '0.82rem',
                      color: '#b91c1c',
                      marginBottom: '1rem',
                    }}>
                      {votingError}
                    </div>
                  )}

                  <div style={{ marginBottom: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: 'var(--bf-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          The 10-Star Legacy Framework
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--bf-text-muted)' }}>
                          Award 1 star per fulfilled rubric
                        </span>
                      </div>
                      <span className="badge badge-gold" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                        {selectedStars.length} / 10 ★
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      background: '#0a0f1c',
                      borderRadius: '10px',
                      padding: '0.6rem',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                    }}>
                      {LEGACY_RUBRICS.map((rubric) => {
                        const isEarned = selectedStars.includes(rubric.id);
                        return (
                          <button
                            key={rubric.id}
                            type="button"
                            onClick={() => toggleRubricStar(rubric.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              width: '100%',
                              textAlign: 'left',
                              padding: '0.45rem 0.6rem',
                              borderRadius: '7px',
                              border: isEarned ? '1px solid rgba(255, 210, 51, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                              background: isEarned ? 'rgba(255, 210, 51, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                                {rubric.id}
                              </span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isEarned ? '#fef08a' : '#f8fafc', lineHeight: 1.25 }}>
                                {rubric.label}
                              </span>
                            </div>
                            <Star
                              size={18}
                              color="#f59e0b"
                              fill={isEarned ? '#f59e0b' : 'transparent'}
                              style={{ flexShrink: 0 }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bf-primary)' }}>
                        Progress Percentage:
                      </label>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--bf-accent-blue)' }}>
                        {progressPercentage}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={progressPercentage}
                      onChange={(e) => setProgressPercentage(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--bf-accent-blue)', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--bf-text-secondary)', marginBottom: '0.4rem' }}>
                      Official Remarks (Optional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Official remarks for the founding team..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      style={{
                        width: '100%',
                        border: '1px solid var(--bf-border)',
                        borderRadius: '8px',
                        padding: '0.6rem',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingVote}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <Send size={15} />
                    {isSubmittingVote ? 'Submitting...' : 'Submit Progress & Rating'}
                  </button>
                </form>
              )
            ) : null}
          </div>

          {/* Quick Link for Official Judges (only shown if logged in as judge/admin) */}
          {user && (user.role === 'judge' || user.role === 'admin') && (
            <div className="card" style={{
              background: 'var(--bf-primary-dark)',
              color: '#ffffff',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                <Award size={20} color="var(--bf-accent-gold)" />
                <h4 style={{ color: '#ffffff', fontSize: '1.1rem' }}>Official Jury Panel</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Evaluate this startup across Innovation, Market Viability, Team Execution, and Pitch Delivery (50% weight).
              </p>
              <Link
                href={`/judge?startupId=${startup.id}`}
                className="btn btn-gold btn-sm"
                style={{ width: '100%' }}
              >
                Open Rubrics Evaluation
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Investment Modal */}
      {isInvestModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(6, 23, 46, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1.5rem',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '540px',
            width: '100%',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', color: '#0b2545', fontWeight: 800 }}>
                  Invest in {startup.name}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
                  Accredited Investor Action
                </span>
              </div>
              <button
                onClick={() => setIsInvestModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleInvestSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Pledge Amount (PKR)</label>
                <input
                  type="number"
                  step="50000"
                  className="form-input"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Deal Instrument</label>
                <select
                  className="form-select"
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value)}
                >
                  <option value="Seed Equity">Seed Equity</option>
                  <option value="SAFE Note">SAFE Note</option>
                  <option value="Grant Pledge">Grant Pledge</option>
                  <option value="Convertible">Convertible Note</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Investor Rating (1-5 Stars)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setInvestRating(star)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      <Star
                        size={28}
                        fill={star <= investRating ? '#f59e0b' : 'none'}
                        color={star <= investRating ? '#f59e0b' : '#cbd5e1'}
                      />
                    </button>
                  ))}
                  <span style={{ fontWeight: 800, color: '#0b2545', marginLeft: '0.5rem' }}>
                    {investRating} Stars
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Due Diligence Review</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Feedback on traction, unit economics, and team..."
                  value={investReview}
                  onChange={(e) => setInvestReview(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingInvest}
                className="btn btn-primary btn-block"
                style={{ padding: '0.8rem', fontWeight: 700 }}
              >
                {isSubmittingInvest ? 'Recording...' : `Confirm PKR ${investAmount.toLocaleString()} Investment`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

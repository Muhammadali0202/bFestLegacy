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
  
  // Official progress & 10-Rubric x 10-Point (out of 100) state
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
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
          const loadedScores: Record<string, number> = {};
          const existingMap = startupData.startup.rubricScores || {};
          const existingStars: string[] = Array.isArray(startupData.startup.rubricStars)
            ? startupData.startup.rubricStars
            : [];
          for (const r of LEGACY_RUBRICS) {
            if (typeof existingMap[r.id] === 'number') {
              loadedScores[r.id] = existingMap[r.id];
            } else if (existingStars.includes(r.id)) {
              loadedScores[r.id] = 10;
            } else {
              loadedScores[r.id] = 0;
            }
          }
          setRubricScores(loadedScores);
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

  const totalRubricPoints = LEGACY_RUBRICS.reduce((sum, r) => sum + (rubricScores[r.id] || 0), 0);

  const handleSetRubricScore = (rubricId: string, starValue: number) => {
    setRubricScores((prev) => ({
      ...prev,
      [rubricId]: prev[rubricId] === starValue ? starValue - 1 : starValue,
    }));
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
          rating: totalRubricPoints,
          rubricScores,
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

      {/* Profile Header Card (Sketch Layout in Website UI/UX) */}
      <div className="card" style={{
        padding: '1.75rem 2rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1.5px solid var(--bf-border)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          {/* Left: Startup Name & Members */}
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.45rem' }}>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--bf-primary)', margin: 0 }}>
                {startup.name}
              </h1>
              <span className="badge badge-sector" style={{ fontSize: '0.78rem' }}>
                {startup.sector}
              </span>
              {startup.programSemester && (
                <span className="badge badge-gold" style={{ fontSize: '0.78rem' }}>
                  {startup.programSemester}
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.95rem', color: 'var(--bf-text-secondary)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--bf-primary)' }}>Members:</strong>{' '}
              {startup.founders.length > 0
                ? startup.founders.map((f) => f.name).join(', ')
                : startup.teamMembers || 'Student Team'}
            </div>
          </div>

          {/* Middle-Right: Current Points (out of 100) + Current Progress Bar */}
          <div style={{
            flex: '0 1 320px',
            minWidth: '240px',
            background: '#f8fafc',
            border: '1px solid var(--bf-border)',
            borderRadius: '12px',
            padding: '0.85rem 1.15rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--bf-text-secondary)' }}>
                Current Points:
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--bf-primary)', fontFamily: 'var(--font-display)' }}>
                {startup.compositeScore.toFixed(0)} / 100
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--bf-text-secondary)' }}>
                Current Progress:
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--bf-accent-blue)' }}>
                {startup.progressPercentage ?? 0}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
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

          {/* Far Right: Startup Logo */}
          <div style={{
            width: '82px',
            height: '82px',
            borderRadius: 'var(--bf-radius-md)',
            background: '#ffffff',
            border: '2px solid var(--bf-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: 'var(--bf-shadow-sm)',
          }}>
            <StartupLogo logo={startup.logo} name={startup.name} size={78} fontSize="2.8rem" rounded="10px" />
          </div>
        </div>
      </div>

      {/* Main Split: 70% Evaluation Rubrics (Left) | 30% Summary & Progress Controls (Right) */}
      <div className="home-split-grid">
        {/* Left (70%): Evaluation Rubrics (10 Rubrics x 10 Stars = 100 Points) */}
        <div className="card" style={{ padding: '1.5rem', border: '1.5px solid var(--bf-border)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--bf-border)',
          }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--bf-primary)', margin: 0 }}>
                Evaluation Rubrics
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--bf-text-muted)' }}>
                10 criteria × 10 points each — Total out of 100
              </span>
            </div>
            <span className="badge badge-gold" style={{ fontSize: '0.92rem', fontWeight: 900, padding: '0.4rem 0.9rem' }}>
              Total: {totalRubricPoints} / 100
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {LEGACY_RUBRICS.map((rubric) => {
              const score = rubricScores[rubric.id] || 0;
              const canEdit = !!(user && (user.role === 'student_affairs' || user.role === 'admin') && !voteSubmitted);
              return (
                <div
                  key={rubric.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid var(--bf-border)',
                  }}
                >
                  {/* Rubric Name */}
                  <div style={{ flex: '1 1 170px', minWidth: '150px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--bf-accent-blue)', marginRight: '0.4rem' }}>
                      {rubric.id}
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--bf-primary)' }}>
                      {rubric.label}
                    </span>
                  </div>

                  {/* 10 Stars Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.22rem', flexWrap: 'nowrap' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => {
                      const filled = score >= starVal;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          disabled={!canEdit}
                          onClick={() => canEdit && handleSetRubricScore(rubric.id, starVal)}
                          title={`${rubric.label}: ${starVal} / 10`}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.1rem',
                            cursor: canEdit ? 'pointer' : 'default',
                            display: 'inline-flex',
                            alignItems: 'center',
                            transform: filled ? 'scale(1.05)' : 'scale(1)',
                            transition: 'transform 0.1s',
                          }}
                        >
                          <Star
                            size={20}
                            color={filled ? '#eab308' : '#cbd5e1'}
                            fill={filled ? '#facc15' : '#e2e8f0'}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Score Pill: X / 10 */}
                  <div style={{
                    minWidth: '64px',
                    textAlign: 'center',
                    background: score > 0 ? 'var(--bf-primary)' : '#e2e8f0',
                    color: score > 0 ? '#ffd233' : '#475569',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    padding: '0.32rem 0.65rem',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-display)',
                  }}>
                    {score} / 10
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (30%): Summary, Team, & Progress Slider / Submit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary & Details Card */}
          <div className="card" style={{ border: '1.5px solid var(--bf-border)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--bf-primary)', marginBottom: '0.6rem' }}>
              Summary
            </h3>
            <p style={{ color: 'var(--bf-text-secondary)', lineHeight: 1.65, fontSize: '0.92rem', marginBottom: '1rem' }}>
              {startup.description || startup.tagline}
            </p>

            <div style={{ borderTop: '1px solid var(--bf-border)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem', color: 'var(--bf-text-secondary)' }}>
              <div>
                <strong style={{ color: 'var(--bf-primary)' }}>Contact:</strong> {startup.contactEmail}
              </div>
              {startup.website && (
                <a href={startup.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--bf-accent-blue)', fontWeight: 600 }}>
                  <Globe size={14} /> Official Website
                </a>
              )}
            </div>
          </div>

          {/* Official Progress & Submit Card (Visible to Bfest's Officials & Admin) */}
          {user && (user.role === 'student_affairs' || user.role === 'admin') && (
            <div className="card" style={{ border: '1.5px solid var(--bf-border)' }}>
              {voteSubmitted ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#047857',
                }}>
                  <CheckCircle size={28} style={{ margin: '0 auto 0.5rem' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Evaluation Recorded!</h4>
                  <p style={{ fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                    Score ({startup.compositeScore.toFixed(0)} / 100) &amp; Progress ({startup.progressPercentage ?? 0}%) saved.
                  </p>
                  <button
                    type="button"
                    onClick={() => setVoteSubmitted(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Update Evaluation
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

                  <div style={{ marginBottom: '1rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)' }}>
                        Progress Percentage
                      </label>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--bf-accent-blue)' }}>
                        {progressPercentage} / 100%
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

                  <div style={{ marginBottom: '1.1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--bf-text-secondary)', marginBottom: '0.4rem' }}>
                      Official Remarks (Optional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Official remarks for the team..."
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
                    {isSubmittingVote ? 'Submitting...' : `Submit Evaluation (${totalRubricPoints} / 100)`}
                  </button>
                </form>
              )}
            </div>
          )}

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

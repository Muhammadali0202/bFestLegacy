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

export default function StartupProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();

  const [startup, setStartup] = useState<Startup | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Public voting state
  const [selectedRating, setSelectedRating] = useState<number>(5);
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
          voterToken,
          rating: selectedRating,
          feedback,
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
              fontSize: '3rem',
            }}>
              {startup.logo}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--bf-text-secondary)', fontWeight: 600 }}>
            <MapPin size={16} color="var(--bf-accent-blue)" />
            <span>{startup.boothNumber || 'Main Exhibition Arena'}</span>
          </div>
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
          {/* Executive Summary */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--bf-primary)', marginBottom: '0.75rem' }}>
              Executive Summary
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
          <div className="card" style={{ marginBottom: '1.75rem' }}>
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

          {/* Investor Reviews / Backing Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="flex items-center gap-2">
                <Briefcase size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.3rem', color: 'var(--bf-primary)' }}>
                  Accredited Investor Backing ({investments.length})
                </h3>
              </div>
              {startup.totalInvestedAmount > 0 && (
                <span style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  fontWeight: 800,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                }}>
                  Total Pledged: PKR {startup.totalInvestedAmount.toLocaleString()}
                </span>
              )}
            </div>

            {investments.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                No investor pledges recorded yet. Accredited angel investors can pledge capital and rate this startup from the Investor Portal.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {investments.map((inv) => (
                  <div key={inv.id} style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div>
                        <strong style={{ color: '#0b2545', fontSize: '0.95rem' }}>{inv.investorName}</strong>
                        {inv.firmName && (
                          <span style={{ color: '#64748b', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                            ({inv.firmName})
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>
                          PKR {inv.amount.toLocaleString()} ({inv.dealType || 'Seed'})
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', color: '#f59e0b', fontWeight: 800 }}>
                          <Star size={14} fill="#f59e0b" />
                          <span>{inv.rating}</span>
                        </div>
                      </div>
                    </div>
                    {inv.review && (
                      <p style={{ color: '#475569', fontSize: '0.88rem', fontStyle: 'italic', margin: 0 }}>
                        &ldquo;{inv.review}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Actions, Voting, Investor & Judge Links */}
        <div>
          {/* Investor Quick Pledge Card */}
          <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid #10b981', background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Briefcase size={20} color="#059669" />
              <h3 style={{ fontSize: '1.2rem', color: '#065f46', fontWeight: 800 }}>Investor Action</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '1rem', lineHeight: 1.5 }}>
              Accredited investors can pledge capital and assign star ratings to directly boost this startup on the live leaderboard.
            </p>

            <div style={{
              background: '#ffffff',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Investor Rating</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                  {startup.investorRating > 0 ? `${startup.investorRating.toFixed(1)} ★` : 'No ratings'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Capital Pledged</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>
                  PKR {startup.totalInvestedAmount ? (startup.totalInvestedAmount / 1000).toLocaleString() + 'k' : '0'}
                </span>
              </div>
            </div>

            {user?.role === 'investor' && user.isApproved ? (
              <button
                onClick={() => setIsInvestModalOpen(true)}
                className="btn btn-sm"
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: '#ffffff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <Briefcase size={16} /> Invest & Rate Startup
              </button>
            ) : user?.role === 'investor' && !user.isApproved ? (
              <div style={{ fontSize: '0.8rem', color: '#d97706', textAlign: 'center', fontWeight: 600 }}>
                Your Investor Account is Pending Admin Approval.
              </div>
            ) : (
              <Link
                href="/investor"
                className="btn btn-outline-primary btn-sm"
                style={{ width: '100%', textAlign: 'center', display: 'block' }}
              >
                Go to Investor Portal
              </Link>
            )}
          </div>

          {/* Audience Voting Box */}
          <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--bf-border)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Star size={20} color="var(--bf-accent-gold)" fill="var(--bf-accent-gold)" />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--bf-primary)' }}>Audience Endorsement</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--bf-text-secondary)', marginBottom: '1.25rem' }}>
              Cast your vote to support this startup. Public ratings contribute 20% to the final ranking score.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--bf-border)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)', display: 'block' }}>Rating Average</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--bf-primary)' }}>
                  {startup.publicRating.toFixed(1)} / 5.0
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--bf-text-muted)', display: 'block' }}>Total Votes</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--bf-text-secondary)' }}>
                  {startup.totalPublicVotes}
                </span>
              </div>
            </div>

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
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Vote Recorded!</h4>
                <p style={{ fontSize: '0.82rem' }}>You have voted for {startup.name}. Thank you for supporting student entrepreneurship.</p>
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
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>
                    Select Your Rating:
                  </label>
                  <div className="flex gap-2 justify-center" style={{ padding: '0.5rem 0' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          transform: selectedRating >= star ? 'scale(1.15)' : 'scale(1)',
                          transition: 'transform 0.15s',
                        }}
                      >
                        <Star
                          size={28}
                          color="#f59e0b"
                          fill={selectedRating >= star ? '#f59e0b' : 'transparent'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--bf-text-secondary)', marginBottom: '0.4rem' }}>
                    Optional Feedback for Founders:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What impressed you? Any questions?"
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
                  {isSubmittingVote ? 'Submitting Vote...' : 'Submit Endorsement'}
                </button>
              </form>
            )}
          </div>

          {/* Quick Link for Official Judges */}
          <div className="card" style={{
            background: 'var(--bf-primary-dark)',
            color: '#ffffff',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Award size={20} color="var(--bf-accent-gold)" />
              <h4 style={{ color: '#ffffff', fontSize: '1.1rem' }}>Are You an Official Judge?</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Jury members score across Innovation, Market Viability, Team Execution, and Pitch Delivery (50% weight).
            </p>
            <Link
              href={`/judge?startupId=${startup.id}`}
              className="btn btn-gold btn-sm"
              style={{ width: '100%' }}
            >
              Open Rubrics Evaluation
            </Link>
          </div>
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

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trophy, 
  Star, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Send,
  ExternalLink,
  RotateCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Startup, Investment } from '@/types';

export default function InvestorPortalPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [startups, setStartups] = useState<Startup[]>([]);
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  // Investment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [amount, setAmount] = useState<number>(500000);
  const [dealType, setDealType] = useState('Seed Equity');
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  const loadData = async () => {
    try {
      const [startupsRes, invRes] = await Promise.all([
        fetch('/api/startups?onlyPublished=true'),
        fetch(`/api/investments${user?.id ? `?investorId=${user.id}` : ''}`),
      ]);

      const startupsData = await startupsRes.json();
      const invData = await invRes.json();

      if (startupsData.success) {
        setStartups(startupsData.startups);
      }
      if (invData.success) {
        setMyInvestments(invData.investments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user, authLoading, router]);

  const handleOpenInvestModal = (startup: Startup) => {
    setSelectedStartup(startup);
    setIsModalOpen(true);
    setErrorToast('');
  };

  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartup || !user) return;

    setSubmitting(true);
    setErrorToast('');

    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId: selectedStartup.id,
          startupName: selectedStartup.name,
          investorId: user.id,
          investorName: user.fullName,
          firmName: user.companyOrFirm,
          amount,
          dealType,
          rating,
          review,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessToast(`Investment of PKR ${amount.toLocaleString()} and ${rating}★ rating submitted for ${selectedStartup.name}! Ranking boosted on the leaderboard.`);
        setIsModalOpen(false);
        setReview('');
        loadData();
        setTimeout(() => setSuccessToast(''), 6000);
      } else {
        setErrorToast(data.error || 'Failed to submit investment.');
      }
    } catch (err) {
      setErrorToast('Network error while processing investment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading Investor Portal...</div>
      </div>
    );
  }

  const isApproved = user?.isApproved ?? false;
  const totalDeployed = myInvestments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Toast Notification */}
      {successToast && (
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
          maxWidth: '500px',
        }}>
          <Sparkles size={20} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0b2545 0%, #06172e 100%)',
        borderRadius: '24px',
        color: '#ffffff',
        padding: '2.5rem',
        marginBottom: '2.5rem',
        boxShadow: '0 12px 30px -5px rgba(11, 37, 69, 0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              padding: '0.3rem 0.8rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}>
              <Briefcase size={16} /> Accredited Investor Portal
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '0.4rem' }}>
              {user?.fullName}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              Firm: <strong>{user?.companyOrFirm || 'Independent Angel'}</strong> • Ticket Capacity: <strong>{user?.investmentCapacity || 'PKR 1M - 5M'}</strong>
            </p>
          </div>

          {/* Approval Status Badge */}
          <div style={{ textAlign: 'right' }}>
            {isApproved ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                borderRadius: '14px',
                padding: '0.75rem 1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#10b981',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}>
                <CheckCircle2 size={18} /> Approved by Fest Admin
              </div>
            ) : (
              <div>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #f59e0b',
                  borderRadius: '14px',
                  padding: '0.75rem 1.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#f59e0b',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                }}>
                  <Clock size={18} /> Pending Admin Approval
                </div>
                <div>
                  <button
                    onClick={refreshUser}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <RotateCw size={12} /> Check Approval Status
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Investment Summary Stats */}
        {isApproved && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Capital Pledged</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
                PKR {totalDeployed.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Startups Backed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                {myInvestments.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Leaderboard Impact</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d4af37' }}>
                Active (30% Weight)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notice if NOT Approved */}
      {!isApproved && (
        <div style={{
          background: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: '16px',
          padding: '1.75rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}>
          <Clock size={28} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#92400e', marginBottom: '0.4rem', fontWeight: 700 }}>
              Your Investor Account is Pending Admin Verification
            </h3>
            <p style={{ color: '#78350f', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              The Business Fest 2027 Organizing Committee approves investors to maintain accreditation standards before enabling capital pledges and due diligence ratings. You can explore startups below, but cannot invest or rate until authorized.
            </p>
            <div style={{ fontSize: '0.85rem', color: '#b45309' }}>
              <em>Tip: Fest administrators can approve your account instantly inside the Admin Console.</em>
            </div>
          </div>
        </div>
      )}

      {/* Startups to Invest In Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.7rem', color: '#0b2545', marginBottom: '0.2rem' }}>
              Explore Startups & Deploy Capital
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Invest capital and rate pitches. High investor ratings directly boost the startup on the live leaderboard!
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="btn btn-outline-gold btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Trophy size={16} /> View Live Standings
          </Link>
        </div>

        {/* Startups Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {startups.map((startup) => {
            const hasInvested = myInvestments.some((inv) => inv.startupId === startup.id);
            return (
              <div
                key={startup.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: hasInvested ? '2px solid #10b981' : '1px solid #e2e8f0',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                {hasInvested && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '20px',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                  }}>
                    ✓ Backed by You
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{startup.logo}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.25rem', color: '#0b2545', fontWeight: 800 }}>
                          {startup.name}
                        </h3>
                        {startup.rank && (
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#d4af37' }}>
                            Rank #{startup.rank}
                          </span>
                        )}
                      </div>
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

                  <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {startup.tagline}
                  </p>

                  {/* Performance Breakdown */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '0.75rem 0.5rem',
                    marginBottom: '1.25rem',
                    textAlign: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>JURY SCORE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b2545' }}>
                        {startup.judgeScore > 0 ? startup.judgeScore : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>INVESTOR RATING</div>
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

                  {/* Total Invested So Far */}
                  <div style={{
                    fontSize: '0.85rem',
                    color: startup.totalInvestedAmount > 0 ? '#059669' : '#64748b',
                    fontWeight: 600,
                    marginBottom: '1.25rem',
                  }}>
                    Total Capital Pledged: PKR {startup.totalInvestedAmount ? startup.totalInvestedAmount.toLocaleString() : '0'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <Link
                    href={`/startups/${startup.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                  >
                    <ExternalLink size={14} /> Profile
                  </Link>

                  <button
                    onClick={() => handleOpenInvestModal(startup)}
                    disabled={!isApproved}
                    className={`btn btn-sm ${isApproved ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      flex: 1.5,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      fontWeight: 700,
                    }}
                    title={!isApproved ? 'Awaiting Fest Admin Approval' : 'Invest and Rate this startup'}
                  >
                    <Briefcase size={15} /> {isApproved ? 'Invest & Rate' : 'Locked (Pending)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investment & Rating Modal */}
      {isModalOpen && selectedStartup && (
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
            maxWidth: '560px',
            width: '100%',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                }}>
                  <Sparkles size={14} /> Leaderboard Ranking Booster
                </div>
                <h2 style={{ fontSize: '1.6rem', color: '#0b2545', fontWeight: 800 }}>
                  Invest in {selectedStartup.name}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  {selectedStartup.tagline}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {errorToast && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}>
                <AlertCircle size={18} />
                <span>{errorToast}</span>
              </div>
            )}

            <form onSubmit={handleInvestmentSubmit}>
              {/* Amount Selection */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Investment Pledge Amount (PKR)
                </label>
                <input
                  type="number"
                  step="50000"
                  min="50000"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
                {/* Quick Chips */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {[250000, 500000, 1000000, 2000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      style={{
                        background: amount === val ? '#0066cc' : '#f1f5f9',
                        color: amount === val ? '#ffffff' : '#334155',
                        border: 'none',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      PKR {(val / 1000).toLocaleString()}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Deal Structure */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Deal Instrument
                </label>
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

              {/* Investor Rating (1 to 5 Stars) */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Investor Star Rating (1 to 5 Stars)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.2rem',
                      }}
                    >
                      <Star
                        size={32}
                        fill={star <= rating ? '#f59e0b' : 'none'}
                        color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                      />
                    </button>
                  ))}
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0b2545', marginLeft: '0.5rem' }}>
                    {rating} of 5 Stars
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Higher investor ratings increase the startup&apos;s score and help propel it to the top of the leaderboard!
                </div>
              </div>

              {/* Investor Remarks / Review */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Due Diligence Notes / Investor Feedback
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Share your rationale, market thoughts, and why you are backing this venture..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-block"
                style={{
                  padding: '0.9rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: '12px',
                }}
              >
                {submitting ? 'Recording Investment & Recalculating Ranks...' : `Confirm PKR ${amount.toLocaleString()} Investment & ${rating}★ Rating`}
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

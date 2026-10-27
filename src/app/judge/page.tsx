'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Award, CheckCircle, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Startup } from '@/types';
import { useAuth } from '@/context/AuthContext';

function JudgePortalContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('startupId') || '';
  const { user } = useAuth();

  const [startups, setStartups] = useState<Startup[]>([]);
  const [selectedStartupId, setSelectedStartupId] = useState(preselectedId);
  const [judgeName, setJudgeName] = useState('Prof. Dr. Irfanullah (IMSciences Jury)');
  const [judgePin, setJudgePin] = useState('2027');

  useEffect(() => {
    if (user && (user.role === 'judge' || user.role === 'admin')) {
      setJudgeName(user.fullName);
      if (user.judgePin) setJudgePin(user.judgePin);
    }
  }, [user]);

  // Rubric Scores (1-10)
  const [innovation, setInnovation] = useState<number>(8);
  const [market, setMarket] = useState<number>(8);
  const [execution, setExecution] = useState<number>(8);
  const [pitch, setPitch] = useState<number>(8);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/startups?onlyPublished=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStartups(data.startups);
          if (!selectedStartupId && data.startups.length > 0) {
            setSelectedStartupId(data.startups[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Calculate live composite (Sum of 4 scores * 2.5) -> 0 to 100
  const normalizedTotal = (innovation + market + execution + pitch) * 2.5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStartupId) {
      setError('Please select a startup to evaluate.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/evaluations/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId: selectedStartupId,
          judgeName,
          judgePin,
          innovationScore: innovation,
          marketScore: market,
          executionScore: execution,
          pitchScore: pitch,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit evaluation.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStartup = startups.find((s) => s.id === selectedStartupId);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem', maxWidth: '850px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
          <ShieldCheck size={14} /> Official Jury Evaluation Portal
        </div>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>
          Judge Rubrics & Scoring
        </h1>
        <p style={{ color: 'var(--bf-text-secondary)', fontSize: '1rem' }}>
          Evaluate startup pitches according to IMSciences Business Fest standard assessment criteria.
        </p>
      </div>

      {success ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', border: '2px solid var(--bf-accent-emerald)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--bf-accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--bf-primary)', marginBottom: '0.75rem' }}>
            Score Recorded & Locked!
          </h2>
          <p style={{ color: 'var(--bf-text-secondary)', fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            You scored <strong>{selectedStartup?.name}</strong> with a total of <strong>{normalizedTotal} / 100 PTS</strong>. The leaderboard has been updated in real-time.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/leaderboard" className="btn btn-gold">
              View Updated Leaderboard <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setNotes('');
              }}
              className="btn btn-secondary"
            >
              Evaluate Another Startup
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              color: '#b91c1c',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Judge Credentials Strip */}
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--bf-border)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                Judge Name / Affiliation *
              </label>
              <input
                type="text"
                required
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--bf-border)', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                Verification PIN
              </label>
              <input
                type="password"
                value={judgePin}
                onChange={(e) => setJudgePin(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--bf-border)', outline: 'none' }}
              />
            </div>
          </div>

          {/* Startup Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>
              Select Pitching Startup *
            </label>
            <select
              value={selectedStartupId}
              onChange={(e) => setSelectedStartupId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1.5px solid var(--bf-primary)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--bf-primary)',
                background: '#f8fafc',
                outline: 'none',
              }}
            >
              {startups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.logo} {s.name} ({s.sector}) — {s.boothNumber || 'Arena'}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Startup Preview Capsule */}
          {selectedStartup && (
            <div style={{
              background: '#f1f5f9',
              border: '1px solid var(--bf-border)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <span style={{ fontSize: '2.5rem' }}>{selectedStartup.logo}</span>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--bf-primary)' }}>{selectedStartup.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--bf-text-secondary)' }}>{selectedStartup.tagline}</p>
              </div>
            </div>
          )}

          {/* Rubric Criteria 1 to 4 */}
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 1. Innovation */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--bf-border)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--bf-primary)' }}>1. Innovation & Uniqueness</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--bf-text-secondary)' }}>Novelty of concept, defensibility, and tech depth</span>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--bf-primary)' }}>{innovation} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={innovation}
                onChange={(e) => setInnovation(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--bf-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* 2. Market Feasibility */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--bf-border)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--bf-primary)' }}>2. Market Feasibility & Business Model</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--bf-text-secondary)' }}>Addressable TAM, pricing logic, monetization and unit economics</span>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--bf-primary)' }}>{market} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={market}
                onChange={(e) => setMarket(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--bf-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* 3. Execution & Team */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--bf-border)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--bf-primary)' }}>3. Team Capability & Traction</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--bf-text-secondary)' }}>Functional skills, prototype validation, and execution velocity</span>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--bf-primary)' }}>{execution} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={execution}
                onChange={(e) => setExecution(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--bf-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* 4. Pitch Delivery */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--bf-border)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--bf-primary)' }}>4. Pitch Delivery & Q&A Defense</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--bf-text-secondary)' }}>Clarity of slides, confidence, and defense of jury questions</span>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--bf-primary)' }}>{pitch} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--bf-primary)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Real-time Normalized Score Banner */}
          <div style={{
            background: 'var(--bf-primary-dark)',
            color: '#ffffff',
            borderRadius: 'var(--bf-radius-md)',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            border: '2px solid var(--bf-accent-gold)',
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--bf-accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Total Normalized Jury Score
              </span>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Formula: (Innovation + Market + Execution + Pitch) × 2.5</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--bf-accent-gold)', fontFamily: 'var(--font-display)' }}>
                {normalizedTotal}
              </span>
              <span style={{ fontSize: '1rem', color: '#94a3b8' }}> / 100</span>
            </div>
          </div>

          {/* Qualitative Notes */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
              Confidential Jury Feedback & Recommendations (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Constructive feedback for the founders or notes for the organizing committee..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--bf-border)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-gold btn-lg"
            style={{ width: '100%' }}
          >
            {submitting ? 'Locking in Evaluation...' : 'Submit Official Evaluation'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function JudgePortalPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading Judge Portal...</div>}>
      <JudgePortalContent />
    </Suspense>
  );
}

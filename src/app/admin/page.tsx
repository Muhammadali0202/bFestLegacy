'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  Unlock, 
  Settings, 
  Users, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Sparkles,
  Trophy,
  Briefcase,
  Sliders,
  DollarSign,
  UserCheck,
  UserX
} from 'lucide-react';
import { Startup, EventConfig, User } from '@/types';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'startups' | 'investors' | 'settings'>('startups');
  const [startups, setStartups] = useState<Startup[]>([]);
  const [investors, setInvestors] = useState<User[]>([]);
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const loadData = async () => {
    try {
      const [startupsRes, configRes, investorsRes] = await Promise.all([
        fetch('/api/startups?status=all'),
        fetch('/api/event-config'),
        fetch('/api/admin/investors?status=all'),
      ]);

      const startupsData = await startupsRes.json();
      const configData = await configRes.json();
      const investorsData = await investorsRes.json();

      if (startupsData.success) {
        setStartups(startupsData.startups);
      }
      if (configData.success) {
        setConfig(configData.config);
      }
      if (investorsData.success) {
        setInvestors(investorsData.investors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected' | 'pending', isPublished: boolean) => {
    try {
      const res = await fetch(`/api/startups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Updated status for ${data.startup.name}`);
        setTimeout(() => setActionMessage(''), 4000);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInvestorApproval = async (investorId: string, isApproved: boolean) => {
    try {
      const res = await fetch('/api/admin/investors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investorId, isApproved }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setTimeout(() => setActionMessage(''), 4000);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfigToggle = async (key: keyof EventConfig, value: any) => {
    try {
      const res = await fetch('/api/event-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setActionMessage(`Event setting updated`);
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pendingStartupsCount = startups.filter((s) => s.status === 'pending').length;
  const approvedStartupsCount = startups.filter((s) => s.status === 'approved').length;
  const pendingInvestorsCount = investors.filter((i) => !i.isApproved).length;
  const approvedInvestorsCount = investors.filter((i) => i.isApproved).length;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> Organizer Console
          </div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>
            Admin Command Center
          </h1>
          <p style={{ color: 'var(--bf-text-secondary)', fontSize: '1rem' }}>
            Review student startups, authorize angel & VC investors, and manage live competition scoring.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/leaderboard/stage" className="btn btn-secondary btn-sm">
            Auditorium Stage
          </Link>
          <Link href="/startups" className="btn btn-primary btn-sm">
            View Live Portal
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#047857',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.95rem',
          fontWeight: 600,
        }}>
          <CheckCircle2 size={20} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--bf-accent-amber)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--bf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Startups
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#b45309' }}>
            {pendingStartupsCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--bf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Investors
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#047857' }}>
            {pendingInvestorsCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--bf-primary)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--bf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Live Startups
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--bf-primary)' }}>
            {approvedStartupsCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--bf-accent-gold)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--bf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Leaderboard Status
          </span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: config?.isLeaderboardFrozen ? '#b45309' : '#047857', marginTop: '0.6rem' }}>
            {config?.isLeaderboardFrozen ? 'FROZEN' : 'ACTIVE LIVE'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '2rem',
      }}>
        <button
          onClick={() => setActiveTab('startups')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'startups' ? '3px solid var(--bf-accent-gold)' : 'none',
            fontWeight: activeTab === 'startups' ? 800 : 600,
            color: activeTab === 'startups' ? 'var(--bf-primary)' : '#64748b',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Sparkles size={18} /> Startup Applications ({startups.length})
        </button>

        <button
          onClick={() => setActiveTab('investors')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'investors' ? '3px solid #10b981' : 'none',
            fontWeight: activeTab === 'investors' ? 800 : 600,
            color: activeTab === 'investors' ? '#047857' : '#64748b',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Briefcase size={18} /> Investors Approval & Management
          {pendingInvestorsCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
            }}>
              {pendingInvestorsCount} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'settings' ? '3px solid var(--bf-primary)' : 'none',
            fontWeight: activeTab === 'settings' ? 800 : 600,
            color: activeTab === 'settings' ? 'var(--bf-primary)' : '#64748b',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Settings size={18} /> Competition & Scoring Settings
        </button>
      </div>

      {/* TAB 1: STARTUPS REVIEW */}
      {activeTab === 'startups' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--bf-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--bf-primary)' }}>Student Startup Moderation Queue</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--bf-text-secondary)' }}>
                Verify startup details, founders, and booth allocations before approving to public leaderboard.
              </span>
            </div>
            <Link href="/register" className="btn btn-secondary btn-sm">
              + Add Startup Entry
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--bf-border)', color: 'var(--bf-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Venture Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Sector</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Founders</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Capital Pledged</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {startups.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--bf-border)' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.6rem' }}>{s.logo}</span>
                        <div>
                          <strong style={{ color: 'var(--bf-primary)', display: 'block' }}>{s.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--bf-text-muted)' }}>{s.contactEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <span className="badge badge-sector">{s.sector}</span>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--bf-text-secondary)' }}>
                        {s.founders.map(f => f.name).join(', ')}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <span className={`badge ${
                        s.status === 'approved' ? 'badge-approved' : s.status === 'pending' ? 'badge-pending' : 'badge-gold'
                      }`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <span style={{ fontWeight: 700, color: s.totalInvestedAmount > 0 ? '#059669' : '#64748b' }}>
                        PKR {s.totalInvestedAmount ? s.totalInvestedAmount.toLocaleString() : '0'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {s.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(s.id, 'approved', true)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#047857', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                            title="Approve and Publish to Directory"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                        )}

                        {s.isPublished && (
                          <button
                            onClick={() => handleStatusChange(s.id, s.status, false)}
                            className="btn btn-secondary btn-sm"
                            title="Unpublish from Public View"
                          >
                            <EyeOff size={14} />
                          </button>
                        )}

                        {s.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(s.id, 'rejected', false)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#b91c1c' }}
                            title="Reject submission"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVESTORS APPROVAL & MANAGEMENT */}
      {activeTab === 'investors' && (
        <div>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            padding: '0',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--bf-border)' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#0b2545', fontWeight: 800 }}>
                Investor Accreditation & Approval Queue
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Accredited investors must be approved by the organizer before they can invest in student startups and submit ratings that boost leaderboard rankings.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Investor Name & Email</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Syndicate / Firm</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Ticket Capacity</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Focus / Bio</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Authorization Action</th>
                  </tr>
                </thead>
                <tbody>
                  {investors.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div>
                          <strong style={{ color: '#0b2545', display: 'block' }}>{inv.fullName}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{inv.email}</span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>
                          {inv.companyOrFirm || 'Independent Angel'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                        }}>
                          {inv.investmentCapacity || 'PKR 1M - 5M'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1rem', maxWidth: '240px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inv.bio || 'General Seed Stage Venture'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        {inv.isApproved ? (
                          <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : (
                          <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> Pending Review
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        {!inv.isApproved ? (
                          <button
                            onClick={() => handleInvestorApproval(inv.id, true)}
                            className="btn btn-sm"
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontWeight: 700,
                            }}
                          >
                            <UserCheck size={14} /> Approve Investor
                          </button>
                        ) : (
                          <button
                            onClick={() => handleInvestorApproval(inv.id, false)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#b91c1c', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            <UserX size={14} /> Revoke / Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCORING & COMPETITION SETTINGS */}
      {activeTab === 'settings' && config && (
        <div className="card" style={{ padding: '2rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--bf-border)' }}>
            <Sliders size={22} color="var(--bf-primary)" />
            <h3 style={{ fontSize: '1.35rem', color: 'var(--bf-primary)' }}>Competition Scoring Weights & Controls</h3>
          </div>

          {/* Phase toggles */}
          <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--bf-border)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--bf-primary)' }}>Audience Voting</h4>
                <span className={`badge ${config.isVotingOpen ? 'badge-approved' : 'badge-pending'}`}>
                  {config.isVotingOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--bf-text-secondary)', marginBottom: '1rem' }}>
                Allow general attendees to vote on startup profiles.
              </p>
              <button
                onClick={() => handleConfigToggle('isVotingOpen', !config.isVotingOpen)}
                className={`btn btn-sm ${config.isVotingOpen ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%' }}
              >
                {config.isVotingOpen ? 'Close Audience Voting' : 'Open Audience Voting'}
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--bf-border)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--bf-primary)' }}>Official Jury Scoring</h4>
                <span className={`badge ${config.isJudgeScoringOpen ? 'badge-approved' : 'badge-pending'}`}>
                  {config.isJudgeScoringOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--bf-text-secondary)', marginBottom: '1rem' }}>
                Permit jury members to submit official rubric evaluations.
              </p>
              <button
                onClick={() => handleConfigToggle('isJudgeScoringOpen', !config.isJudgeScoringOpen)}
                className={`btn btn-sm ${config.isJudgeScoringOpen ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%' }}
              >
                {config.isJudgeScoringOpen ? 'Close Judge Scoring' : 'Open Judge Scoring'}
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--bf-border)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--bf-primary)' }}>Leaderboard Freeze</h4>
                <span className={`badge ${config.isLeaderboardFrozen ? 'badge-pending' : 'badge-approved'}`}>
                  {config.isLeaderboardFrozen ? 'FROZEN' : 'ACTIVE'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--bf-text-secondary)', marginBottom: '1rem' }}>
                Freeze live ranks ahead of stage award announcements.
              </p>
              <button
                onClick={() => handleConfigToggle('isLeaderboardFrozen', !config.isLeaderboardFrozen)}
                className={`btn btn-sm ${config.isLeaderboardFrozen ? 'btn-gold' : 'btn-secondary'}`}
                style={{ width: '100%' }}
              >
                {config.isLeaderboardFrozen ? <Unlock size={14} /> : <Lock size={14} />}
                {config.isLeaderboardFrozen ? 'Unfreeze Standings' : 'Freeze for Ceremony'}
              </button>
            </div>
          </div>

          {/* Scoring Weights Formula */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(11, 37, 69, 0.04) 0%, rgba(212, 175, 55, 0.08) 100%)',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            padding: '1.5rem',
          }}>
            <h4 style={{ fontSize: '1.1rem', color: '#0b2545', fontWeight: 800, marginBottom: '0.5rem' }}>
              ⚖️ Leaderboard Composite Score Formula
            </h4>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              The live rankings are mathematically synthesized using the following weights:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>JUDGE RUBRIC WEIGHT</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d4af37' }}>
                  {Math.round(config.judgeWeight * 100)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Innovation, Market, Execution, Pitch</div>
              </div>

              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>INVESTOR BACKING WEIGHT</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>
                  {Math.round((config.investorWeight || 0.30) * 100)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Investor Stars & Capital Pledged</div>
              </div>

              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>PUBLIC AUDIENCE WEIGHT</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0066cc' }}>
                  {Math.round(config.publicWeight * 100)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Attendee 1-5 Star Ratings</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

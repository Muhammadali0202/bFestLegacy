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
  UserX,
  UserPlus,
  Trash2,
  Award,
  ArrowRight
} from 'lucide-react';
import { Startup, EventConfig, User, UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'startups' | 'investors' | 'accounts' | 'settings'>('startups');
  const [startups, setStartups] = useState<Startup[]>([]);
  const [investors, setInvestors] = useState<User[]>([]);
  const [managedAccounts, setManagedAccounts] = useState<User[]>([]);
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [accountError, setAccountError] = useState('');
  const [dbHealth, setDbHealth] = useState<{ connected: boolean; mode: string } | null>(null);

  // New Account Form State (Student, Judge, Student Affairs, Registration Team, Investor, Admin)
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [newAccRole, setNewAccRole] = useState<UserRole>('student');
  const [newAccDesignation, setNewAccDesignation] = useState('');
  const [newAccPin, setNewAccPin] = useState('2027');
  const [creatingAcc, setCreatingAcc] = useState(false);

  const loadData = async () => {
    try {
      const [startupsRes, configRes, investorsRes, accountsRes, healthRes] = await Promise.all([
        fetch('/api/startups?status=all'),
        fetch('/api/event-config'),
        fetch('/api/admin/investors?status=all'),
        fetch('/api/admin/users'),
        fetch('/api/health'),
      ]);

      const startupsData = await startupsRes.json();
      const configData = await configRes.json();
      const investorsData = await investorsRes.json();
      const accountsData = await accountsRes.json();
      const healthData = await healthRes.json();

      if (startupsData.success) {
        setStartups(startupsData.startups);
      }
      if (configData.success) {
        setConfig(configData.config);
      }
      if (investorsData.success) {
        setInvestors(investorsData.investors);
      }
      if (accountsData.success) {
        setManagedAccounts(accountsData.users);
      }
      if (healthData.success) {
        setDbHealth({ connected: healthData.connected, mode: healthData.mode });
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

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError('');
    setCreatingAcc(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newAccName,
          email: newAccEmail,
          password: newAccPassword,
          role: newAccRole,
          teamName: newAccRole === 'student' ? newAccDesignation : undefined,
          judgeDesignation: newAccRole === 'judge' ? newAccDesignation : undefined,
          judgePin: newAccPin,
          companyOrFirm: newAccRole === 'investor' ? newAccDesignation : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setNewAccName('');
        setNewAccEmail('');
        setNewAccPassword('');
        setNewAccDesignation('');
        loadData();
        setTimeout(() => setActionMessage(''), 4000);
      } else {
        setAccountError(data.error || 'Failed to create account.');
      }
    } catch (err) {
      setAccountError('Network error while creating account.');
    } finally {
      setCreatingAcc(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Account removed.');
        loadData();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', maxWidth: '580px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fef2f2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>
            Organizer / Admin Access Only
          </h2>
          <p style={{ color: 'var(--bf-text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Please sign in with your Fest Organizer administrator credentials to manage startups, provision Student Affairs & Jury accounts, and configure competition settings.
          </p>
          <Link href="/login?mode=staff&role=admin" className="btn btn-primary">
            Organizer Sign In <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <div className="badge badge-gold">
              <ShieldCheck size={14} /> Organizer Console
            </div>
            {dbHealth && (
              <div className={`badge ${dbHealth.connected ? 'badge-emerald' : 'badge-amber'}`}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: dbHealth.connected ? '#10b981' : '#f59e0b',
                    display: 'inline-block',
                  }}
                />
                {dbHealth.connected ? 'Real-Time DB Connected' : 'In-Memory Mode (Set MONGODB_URI)'}
              </div>
            )}
          </div>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--bf-primary)', marginBottom: '0.35rem' }}>
            Admin Command Center
          </h1>
          <p style={{ color: 'var(--bf-text-secondary)', fontSize: '0.95rem' }}>
            Review student startups, provision accounts, authorize investors, and manage live competition scoring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
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
        alignItems: 'center',
        gap: '0.25rem',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '2rem',
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveTab('startups')}
          style={{
            padding: '0.8rem 1.15rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'startups' ? '3px solid var(--bf-accent-gold)' : '3px solid transparent',
            fontWeight: activeTab === 'startups' ? 800 : 600,
            color: activeTab === 'startups' ? 'var(--bf-primary)' : '#64748b',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Sparkles size={16} /> Startup Applications ({startups.length})
        </button>

        <button
          onClick={() => setActiveTab('investors')}
          style={{
            padding: '0.8rem 1.15rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'investors' ? '3px solid #10b981' : '3px solid transparent',
            fontWeight: activeTab === 'investors' ? 800 : 600,
            color: activeTab === 'investors' ? '#047857' : '#64748b',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Briefcase size={16} /> Investors Approval
          {pendingInvestorsCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}>
              {pendingInvestorsCount} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          style={{
            padding: '0.8rem 1.15rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'accounts' ? '3px solid #0047ff' : '3px solid transparent',
            fontWeight: activeTab === 'accounts' ? 800 : 600,
            color: activeTab === 'accounts' ? '#0047ff' : '#64748b',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Users size={16} /> Manage Accounts ({managedAccounts.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '0.8rem 1.15rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'settings' ? '3px solid var(--bf-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'settings' ? 800 : 600,
            color: activeTab === 'settings' ? 'var(--bf-primary)' : '#64748b',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Settings size={16} /> Scoring & Settings
        </button>
      </div>

      {/* TAB 1: STARTUPS REVIEW */}
      {activeTab === 'startups' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--bf-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--bf-primary)', marginBottom: '0.15rem' }}>Student Startup Moderation Queue</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--bf-text-secondary)' }}>
                Verify startup details, founders, and booth allocations before approving to public leaderboard.
              </span>
            </div>
            <Link href="/register" className="btn btn-secondary btn-sm">
              + Add Startup Entry
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--bf-border)', color: 'var(--bf-text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1.25rem', whiteSpace: 'nowrap' }}>Venture Name</th>
                  <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Sector</th>
                  <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Founders</th>
                  <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Capital Pledged</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {startups.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--bf-border)' }}>
                    <td style={{ padding: '0.9rem 1.25rem', minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{s.logo}</span>
                        <div>
                          <strong style={{ color: 'var(--bf-primary)', display: 'block', lineHeight: 1.25 }}>{s.name}</strong>
                          <span style={{ fontSize: '0.76rem', color: 'var(--bf-text-muted)' }}>{s.contactEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
                      <span className="badge badge-sector">{s.sector}</span>
                    </td>

                    <td style={{ padding: '0.9rem 1rem', minWidth: '180px' }}>
                      <span style={{ fontSize: '0.84rem', color: 'var(--bf-text-secondary)' }}>
                        {s.founders.map(f => f.name).join(', ')}
                      </span>
                    </td>

                    <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
                      <span className={`badge ${
                        s.status === 'approved' ? 'badge-approved' : s.status === 'pending' ? 'badge-pending' : 'badge-gold'
                      }`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 700, color: s.totalInvestedAmount > 0 ? '#059669' : '#64748b' }}>
                        PKR {s.totalInvestedAmount ? s.totalInvestedAmount.toLocaleString() : '0'}
                      </span>
                    </td>

                    <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {s.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(s.id, 'approved', true)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#047857', borderColor: 'rgba(16, 185, 129, 0.4)', padding: '0.32rem 0.7rem', fontSize: '0.78rem' }}
                            title="Approve and Publish to Directory"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                        )}

                        {s.isPublished && (
                          <button
                            onClick={() => handleStatusChange(s.id, s.status, false)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.32rem 0.65rem', fontSize: '0.78rem', color: '#475569' }}
                            title="Unpublish from Public View"
                          >
                            <EyeOff size={13} /> Hide
                          </button>
                        )}

                        {s.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(s.id, 'rejected', false)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#b91c1c', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.32rem 0.65rem', fontSize: '0.78rem' }}
                            title="Reject submission"
                          >
                            <XCircle size={13} /> Reject
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

      {/* TAB 2.5: MANAGE ACCOUNTS (STUDENT AFFAIRS, JUDGES, ADMIN & INVESTORS) */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Create Account Form */}
          <div className="card">
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--bf-border)' }}>
              <UserPlus size={20} color="#0047ff" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--bf-primary)' }}>Provision New Account</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--bf-text-secondary)', marginBottom: '1.25rem' }}>
              Create accounts for Student Teams, Judges, Student Affairs, the Registration Team, or Investors.
            </p>

            {accountError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '1rem',
              }}>
                {accountError}
              </div>
            )}

            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label className="form-label">Account Role *</label>
                <select
                  className="form-select"
                  value={newAccRole}
                  onChange={(e) => setNewAccRole(e.target.value as UserRole)}
                >
                  <option value="student">Student Team (Pitch & Startup Portal)</option>
                  <option value="judge">Official Jury / Judge (Rubrics Access)</option>
                  <option value="student_affairs">Student Affairs (Startup Rating Access)</option>
                  <option value="registration_team">Registration Team (Startup Intake Access)</option>
                  <option value="investor">Pre-Approved Investor</option>
                  <option value="admin">Fest Organizer / Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name / Team Lead *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hamza Khattak / Dr. Ali / Registration Desk"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. user@imsciences.edu.pk"
                  value={newAccEmail}
                  onChange={(e) => setNewAccEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Password *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={newAccPassword}
                  onChange={(e) => setNewAccPassword(e.target.value)}
                  required
                />
              </div>

              {(newAccRole === 'student' || newAccRole === 'judge' || newAccRole === 'investor') && (
                <div className="form-group">
                  <label className="form-label">
                    {newAccRole === 'student'
                      ? 'Team / Venture Name'
                      : newAccRole === 'judge'
                      ? 'Department / Designation'
                      : 'Firm / Syndicate'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={
                      newAccRole === 'student'
                        ? 'e.g. Khyber Innovators'
                        : newAccRole === 'judge'
                        ? 'e.g. Faculty of Management'
                        : 'e.g. Angel Network'
                    }
                    value={newAccDesignation}
                    onChange={(e) => setNewAccDesignation(e.target.value)}
                  />
                </div>
              )}

              {newAccRole === 'judge' && (
                <div className="form-group">
                  <label className="form-label">Jury PIN</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newAccPin}
                    onChange={(e) => setNewAccPin(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={creatingAcc}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <UserPlus size={16} />
                {creatingAcc ? 'Creating Account...' : 'Create & Grant Access'}
              </button>
            </form>
          </div>

          {/* Provisioned Accounts List */}
          <div className="card" style={{ gridColumn: 'span 2', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--bf-border)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--bf-primary)' }}>
                All Provisioned Accounts ({managedAccounts.length})
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--bf-text-secondary)' }}>
                Accounts created by Admin for Student Teams, Judges, Student Affairs, Registration Team, and Investors.
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--bf-border)', color: 'var(--bf-text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Name & Email</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Team / Affiliation</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managedAccounts.map((acc) => (
                    <tr key={acc.id} style={{ borderBottom: '1px solid var(--bf-border)' }}>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <strong style={{ color: 'var(--bf-primary)', display: 'block' }}>{acc.fullName}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--bf-text-muted)' }}>{acc.email}</span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span className="badge" style={{
                          background:
                            acc.role === 'student' ? '#eff6ff' :
                            acc.role === 'student_affairs' ? '#e0f2fe' :
                            acc.role === 'registration_team' ? '#f3e8ff' :
                            acc.role === 'judge' ? '#fef9c3' :
                            acc.role === 'admin' ? '#fef2f2' : '#ecfdf5',
                          color:
                            acc.role === 'student' ? '#1d4ed8' :
                            acc.role === 'student_affairs' ? '#0369a1' :
                            acc.role === 'registration_team' ? '#6d28d9' :
                            acc.role === 'judge' ? '#854d0e' :
                            acc.role === 'admin' ? '#dc2626' : '#047857',
                        }}>
                          {acc.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--bf-text-secondary)', fontSize: '0.82rem' }}>
                        {acc.teamName || acc.judgeDesignation || acc.companyOrFirm || acc.institution || 'IMSciences Peshawar'}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                        {acc.email !== user.email && (
                          <button
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#b91c1c', padding: '0.3rem 0.6rem' }}
                            title="Revoke and Delete Account"
                          >
                            <Trash2 size={14} />
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
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Student Affairs 1-5 Star Ratings</div>
              </div>
            </div>
          </div>

          {/* Google Forms Direct Registration Webhook */}
          <div style={{
            marginTop: '2rem',
            background: '#f8fafc',
            border: '1px solid var(--bf-border)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--bf-primary)', fontWeight: 800 }}>
                  📋 Google Forms Direct Registration Webhook
                </h4>
                <p style={{ color: 'var(--bf-text-secondary)', fontSize: '0.85rem' }}>
                  Connect your student registration Google Form so responses automatically appear in the Startup Applications moderation queue.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  const res = await fetch('/api/webhooks/google-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: `Google Form Venture #${Math.floor(100 + Math.random() * 900)}`,
                      tagline: 'Submitted directly via Google Form Webhook',
                      sector: 'AI & Smart Systems',
                      contactEmail: 'student.form@imsciences.edu.pk',
                      description: 'Automated student startup registration received from Google Form.',
                      founders: [{ name: 'Student Team Lead', role: 'Founder' }],
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setActionMessage('Test Google Form submission received! Check Startup Applications tab.');
                    loadData();
                  }
                }}
              >
                Send Test Form Submission
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--bf-text-secondary)', marginBottom: '0.5rem' }}>
              <strong>Webhook Endpoint URL:</strong>{' '}
              <code style={{ background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#0f172a' }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/google-form` : '/api/webhooks/google-form'}
              </code>
            </div>

            <details style={{ marginTop: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: 'var(--bf-accent)' }}>
                View Google Apps Script (Copy & Paste into Google Form / Linked Sheet → Extensions → Apps Script)
              </summary>
              <pre style={{
                marginTop: '0.75rem',
                background: '#0f172a',
                color: '#f8fafc',
                padding: '1rem',
                borderRadius: '10px',
                fontSize: '0.78rem',
                overflowX: 'auto',
                lineHeight: 1.5,
              }}>{`function onFormSubmit(e) {
  var url = "${typeof window !== 'undefined' ? window.location.origin : 'https://YOUR-VERCEL-URL.vercel.app'}/api/webhooks/google-form";
  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "x-webhook-secret": "bfest_google_form_2027" },
    payload: JSON.stringify({ namedValues: e.namedValues })
  };
  UrlFetchApp.fetch(url, options);
}`}</pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}

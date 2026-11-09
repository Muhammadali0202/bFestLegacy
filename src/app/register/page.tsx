'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  FileSpreadsheet,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BusinessSector, EventConfig } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function RegisterStartupPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    problem: '',
    solution: '',
    sector: 'FinTech & Banking' as BusinessSector,
    logo: '🚀',
    website: '',
    contactEmail: user?.email || '',
    founder1Name: user?.fullName || '',
    founder1Role: 'Founder & CEO',
    boothNumber: 'Pending Allocation',
  });
  const [manualLoading, setManualLoading] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);
  const [manualError, setManualError] = useState('');

  useEffect(() => {
    fetch('/api/event-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
          setGoogleFormUrl(data.config.googleFormUrl || '');
          setGoogleSheetUrl(data.config.googleSheetUrl || '');
        }
      })
      .catch(() => {});
  }, []);

  const isStaff =
    user &&
    (user.role === 'admin' ||
      user.role === 'registration_team' ||
      user.role === 'student_affairs');

  const handleSaveLinks = async () => {
    setSavingLinks(true);
    setSyncError('');
    setSyncMessage('');
    try {
      const res = await fetch('/api/event-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleFormUrl: googleFormUrl.trim(),
          googleSheetUrl: googleSheetUrl.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setSyncMessage('Google Form & Shared Google Sheet links saved for all teams!');
      } else {
        setSyncError(data.error || 'Failed to save links.');
      }
    } catch (_) {
      setSyncError('Network error saving links.');
    } finally {
      setSavingLinks(false);
    }
  };

  const handleSyncSheet = async () => {
    if (!googleSheetUrl.trim()) {
      setSyncError('Please paste the shared Google Sheet URL first.');
      return;
    }
    setSyncing(true);
    setSyncError('');
    setSyncMessage('');
    try {
      const res = await fetch('/api/webhooks/google-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetUrl: googleSheetUrl.trim(),
          googleFormUrl: googleFormUrl.trim(),
          autoApprove: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(data.message);
      } else {
        setSyncError(data.error || 'Failed to sync stalls from Google Sheet.');
      }
    } catch (_) {
      setSyncError('Network error syncing Google Sheet.');
    } finally {
      setSyncing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    if (!formData.name || !formData.tagline || !formData.contactEmail) {
      setManualError('Please fill in stall name, tagline, and contact email.');
      return;
    }
    setManualLoading(true);
    try {
      const res = await fetch('/api/startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          tagline: formData.tagline,
          description: formData.description || formData.tagline,
          problem: formData.problem,
          solution: formData.solution,
          sector: formData.sector,
          logo: formData.logo,
          website: formData.website,
          contactEmail: formData.contactEmail,
          boothNumber: formData.boothNumber,
          founders: [{ name: formData.founder1Name || 'Student Founder', role: formData.founder1Role }],
          submittedBy: user?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setManualSuccess(true);
      } else {
        setManualError(data.error || 'Failed to register stall.');
      }
    } catch (_) {
      setManualError('Network error submitting stall.');
    } finally {
      setManualLoading(false);
    }
  };

  const sectors: BusinessSector[] = [
    'FinTech & Banking',
    'AgriTech & Food',
    'HealthTech & Med',
    'EdTech & Learning',
    'AI & Smart Systems',
    'Green & CleanTech',
    'E-Commerce & Logistics',
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
        <div className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
          <ClipboardList size={14} /> Official Stall Registration
        </div>
        <h1 style={{ fontSize: '2.3rem', color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>
          Business Fest 2027 Stall Registration
        </h1>
        <p style={{ color: 'var(--bf-text-secondary)', fontSize: '0.98rem', maxWidth: '640px', margin: '0 auto' }}>
          All student stalls register through our official <strong>Google Form</strong>. Responses are stored in a shared{' '}
          <strong>Google Sheet</strong> accessible to the Registration Team, Student Affairs, and Admin, and synced directly into the website.
        </p>
      </div>

      {/* Card 1: Official Google Form for Student Stall Registration */}
      <div
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '1.75rem',
          border: '2px solid rgba(0, 71, 255, 0.2)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ flex: '1 1 320px' }}>
            <span className="badge badge-sector" style={{ marginBottom: '0.5rem' }}>
              Step 1 • Student Stall Form
            </span>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--bf-primary)', marginBottom: '0.35rem' }}>
              Register Your Stall via Google Form
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--bf-text-secondary)', lineHeight: 1.55 }}>
              Fill out the official Business Fest Google Form with your Startup/Stall Name, Sector, Team Lead, and Idea summary.
            </p>
          </div>

          <div>
            {config?.googleFormUrl ? (
              <a
                href={config.googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Open Stall Registration Google Form <ExternalLink size={16} />
              </a>
            ) : (
              <span className="badge badge-pending" style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}>
                {isStaff
                  ? 'Paste your Google Form link below to activate this button'
                  : 'Google Form link will be published by the Registration Team shortly'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Shared Google Sheet Hub (For Registration Team, Student Affairs, and Admin) */}
      {isStaff ? (
        <div
          className="card"
          style={{
            padding: '2rem',
            marginBottom: '1.75rem',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            background: '#f0fdf4',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span className="badge badge-approved" style={{ marginBottom: '0.4rem' }}>
                <FileSpreadsheet size={13} /> Registration Team • Student Affairs • Admin Shared Hub
              </span>
              <h3 style={{ fontSize: '1.3rem', color: '#064e3b' }}>
                Shared Google Sheet & 1-Click Website Sync
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#047857' }}>
                The same Google Sheet from the Google Form is shared between Registration Team and Student Affairs. Click{' '}
                <strong>Sync & Publish Stalls to Website</strong> to automatically import all stalls into the live website database without manual entry.
              </p>
            </div>

            {googleSheetUrl && (
              <a
                href={googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ background: '#ffffff', color: '#065f46', borderColor: '#a7f3d0' }}
              >
                <FileSpreadsheet size={15} /> Open Shared Google Sheet <ExternalLink size={14} />
              </a>
            )}
          </div>

          {syncMessage && (
            <div style={{
              background: '#dcfce7',
              border: '1px solid #86efac',
              color: '#166534',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              marginBottom: '1rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <CheckCircle size={17} /> {syncMessage}
            </div>
          )}

          {syncError && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              marginBottom: '1rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <AlertCircle size={17} /> {syncError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#064e3b' }}>
                Official Student Google Form Link
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://docs.google.com/forms/d/e/.../viewform"
                value={googleFormUrl}
                onChange={(e) => setGoogleFormUrl(e.target.value)}
                style={{ background: '#ffffff', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#064e3b' }}>
                Shared Responses Google Sheet Link (&ldquo;Anyone with link can view&rdquo;)
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                style={{ background: '#ffffff', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSyncSheet}
              disabled={syncing}
              className="btn btn-primary btn-sm"
            >
              <RefreshCw size={15} />
              {syncing ? 'Syncing Stalls from Google Sheet...' : 'Sync & Publish Stalls from Google Sheet'}
            </button>

            <button
              type="button"
              onClick={handleSaveLinks}
              disabled={savingLinks}
              className="btn btn-secondary btn-sm"
              style={{ background: '#ffffff' }}
            >
              {savingLinks ? 'Saving...' : 'Save Shared Form & Sheet Links'}
            </button>

            <Link href="/startups" className="btn btn-secondary btn-sm" style={{ background: '#ffffff' }}>
              View Live Stalls Directory <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '1.75rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--bf-text-secondary)', marginBottom: '0.75rem' }}>
            Are you part of the <strong>Registration Team</strong>, <strong>Student Affairs</strong>, or <strong>Fest Admin</strong>? Sign in to access the shared Google Sheet and 1-click website stall sync.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/login?role=registration_team" className="btn btn-secondary btn-sm">
              Registration Team Sign In
            </Link>
            <Link href="/login?role=student_affairs" className="btn btn-secondary btn-sm">
              Student Affairs Sign In
            </Link>
            <Link href="/login?role=admin" className="btn btn-secondary btn-sm">
              Admin Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Optional Collapsible Manual Entry for Staff */}
      {isStaff && (
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <button
            type="button"
            onClick={() => setShowManualForm(!showManualForm)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--bf-primary)',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={17} /> Need to add a single stall manually without Google Form?
            </span>
            {showManualForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showManualForm && (
            <form onSubmit={handleManualSubmit} style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--bf-border)' }}>
              {manualSuccess && (
                <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 600 }}>
                  ✓ Stall added to database!
                </div>
              )}
              {manualError && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 600 }}>
                  ⚠️ {manualError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Stall / Startup Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. KhyberAgri Smart Harvest"
                  />
                </div>
                <div>
                  <label className="form-label">Sector *</label>
                  <select
                    className="form-select"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value as BusinessSector })}
                  >
                    {sectors.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Short Tagline / Idea *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="One-line summary of the stall"
                  />
                </div>
                <div>
                  <label className="form-label">Contact Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="student@imsciences.edu.pk"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Team Lead / Founder Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.founder1Name}
                    onChange={(e) => setFormData({ ...formData, founder1Name: e.target.value })}
                    placeholder="Student Name"
                  />
                </div>
                <div>
                  <label className="form-label">Stall / Booth Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.boothNumber}
                    onChange={(e) => setFormData({ ...formData, boothNumber: e.target.value })}
                    placeholder="e.g. Stall A-12"
                  />
                </div>
              </div>
              <button type="submit" disabled={manualLoading} className="btn btn-primary btn-sm">
                {manualLoading ? 'Saving...' : 'Add Single Stall'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

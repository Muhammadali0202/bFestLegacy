'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Sparkles, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Info
} from 'lucide-react';
import { BusinessSector } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function RegisterStartupPage() {
  const { user } = useAuth();
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
    founder2Name: '',
    founder2Role: 'Technical Lead',
    consentGranted: false,
  });

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactEmail: prev.contactEmail || user.email,
        founder1Name: prev.founder1Name || user.fullName,
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const sectors: BusinessSector[] = [
    'FinTech & Banking',
    'AgriTech & Food',
    'HealthTech & Med',
    'EdTech & Learning',
    'AI & Smart Systems',
    'Green & CleanTech',
    'E-Commerce & Logistics',
  ];

  const emojis = ['🚀', '🌱', '💳', '🩺', '📚', '☀️', '🚚', '🤖', '💡', '🔬'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.tagline || !formData.contactEmail) {
      setError('Please fill in company name, tagline, and contact email.');
      return;
    }

    if (!formData.consentGranted) {
      setError('You must consent to publishing approved details on the public directory.');
      return;
    }

    setLoading(true);

    const founders = [];
    if (formData.founder1Name) {
      founders.push({ name: formData.founder1Name, role: formData.founder1Role });
    }
    if (formData.founder2Name) {
      founders.push({ name: formData.founder2Name, role: formData.founder2Role });
    }
    if (founders.length === 0) {
      founders.push({ name: 'Founding Team', role: 'Team Lead' });
    }

    try {
      const res = await fetch('/api/startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          tagline: formData.tagline,
          description: formData.description,
          problem: formData.problem,
          solution: formData.solution,
          sector: formData.sector,
          logo: formData.logo,
          website: formData.website,
          contactEmail: formData.contactEmail,
          founders,
          submittedBy: user?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit registration.');
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem', maxWidth: '850px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
          Intake Portal
        </div>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--bf-primary)', marginBottom: '0.5rem' }}>
          Register Your Startup for Business Fest 2027
        </h1>
        <p style={{ color: 'var(--bf-text-secondary)', fontSize: '1rem' }}>
          Submit your business concept for jury review, booth allocation, and public audience voting at IMSciences Peshawar.
        </p>
      </div>

      {success ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '3.5rem 2rem',
          border: '2px solid var(--bf-accent-emerald)',
        }}>
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
            Application Submitted Successfully!
          </h2>
          <p style={{ color: 'var(--bf-text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Thank you for registering <strong>{formData.name}</strong>. Your entry has entered the administrative review queue.
            Once approved by the IMSciences organizing committee, your profile will be published to the live directory.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/student" className="btn btn-primary">
              Go to Student Dashboard
            </Link>
            <Link href="/startups" className="btn btn-secondary">
              View Public Directory
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({
                  name: '',
                  tagline: '',
                  description: '',
                  problem: '',
                  solution: '',
                  sector: 'FinTech & Banking',
                  logo: '🚀',
                  website: '',
                  contactEmail: '',
                  founder1Name: '',
                  founder1Role: 'Founder & CEO',
                  founder2Name: '',
                  founder2Role: 'Technical Lead',
                  consentGranted: false,
                });
              }}
              className="btn btn-secondary"
            >
              Register Another Venture
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

          {/* Section 1: Business Identity */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--bf-primary)', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--bf-border)' }}>
              1. Business Identity
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                Startup / Venture Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. KhyberAgri Smart Harvest"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--bf-border)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                Tagline / Elevator Hook (1 sentence) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IoT-enabled precision irrigation for smallholder orchards in KP"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--bf-border)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                  Industry Track / Sector *
                </label>
                <select
                  value={formData.sector}
                  onChange={(e: any) => setFormData({ ...formData, sector: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bf-border)',
                    fontSize: '0.95rem',
                    background: '#ffffff',
                    outline: 'none',
                  }}
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                  Brand Icon / Emoji
                </label>
                <select
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bf-border)',
                    fontSize: '1rem',
                    background: '#ffffff',
                    outline: 'none',
                  }}
                >
                  {emojis.map((em) => (
                    <option key={em} value={em}>{em} Select Icon</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pitch & Details */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--bf-primary)', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--bf-border)' }}>
              2. Problem & Value Proposition
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                Executive Description
              </label>
              <textarea
                rows={3}
                placeholder="Give a brief description of what your business does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--bf-border)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                  The Problem Being Solved
                </label>
                <textarea
                  rows={3}
                  placeholder="What is the critical pain point or market inefficiency?"
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bf-border)',
                    fontSize: '0.92rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                  Your Innovative Solution
                </label>
                <textarea
                  rows={3}
                  placeholder="How does your product/service resolve it?"
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bf-border)',
                    fontSize: '0.92rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Team & Contact */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--bf-primary)', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--bf-border)' }}>
              3. Team & Contact Info
            </h3>

            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                  Founder / Lead Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hamza Khattak"
                  value={formData.founder1Name}
                  onChange={(e) => setFormData({ ...formData, founder1Name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bf-border)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                  Official Contact Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="founders@startup.pk"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bf-border)', outline: 'none' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                  Co-Founder / Technical Lead Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ayesha Shinwari"
                  value={formData.founder2Name}
                  onChange={(e) => setFormData({ ...formData, founder2Name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bf-border)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--bf-primary)', marginBottom: '0.4rem' }}>
                  Website or Demo Video URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bf-border)', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Publication Consent */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--bf-border)',
            borderRadius: 'var(--bf-radius-sm)',
            padding: '1.25rem',
            marginBottom: '2rem',
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.consentGranted}
                onChange={(e) => setFormData({ ...formData, consentGranted: e.target.checked })}
                style={{ marginTop: '0.25rem', width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.88rem', color: 'var(--bf-text-primary)', lineHeight: 1.5 }}>
                <strong>Consent to Public Display:</strong> I represent this venture and consent to the publication of the submitted business description, founder names, and booth details on the Business Fest 2027 public directory upon organizer approval.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            {loading ? 'Submitting Registration...' : 'Submit Venture for Review'}
          </button>
        </form>
      )}
    </div>
  );
}

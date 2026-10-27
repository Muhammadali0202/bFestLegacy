'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Building, 
  DollarSign, 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Role specific fields
  const [teamName, setTeamName] = useState('');
  const [institution, setInstitution] = useState('IMSciences Peshawar');
  const [companyOrFirm, setCompanyOrFirm] = useState('');
  const [investmentCapacity, setInvestmentCapacity] = useState('PKR 1M - 5M');
  const [bio, setBio] = useState('');
  const [judgePin, setJudgePin] = useState('2027');
  const [judgeDesignation, setJudgeDesignation] = useState('');
  const [adminKey, setAdminKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const roles = [
    {
      id: 'student' as UserRole,
      title: 'Student Team',
      badge: 'Startups & Pitch',
      icon: GraduationCap,
      color: '#3b82f6',
      description: 'Register your team & innovative startup to pitch to investors & judges',
    },
    {
      id: 'investor' as UserRole,
      title: 'Investor',
      badge: 'Admin Verified',
      icon: Briefcase,
      color: '#10b981',
      description: 'Pledge investment capital & submit investor ratings to boost rankings',
    },
    {
      id: 'judge' as UserRole,
      title: 'Official Judge',
      badge: 'Jury Panel',
      icon: Award,
      color: '#d4af37',
      description: 'Score ventures on 4 innovation rubrics to determine official ranking',
    },
    {
      id: 'admin' as UserRole,
      title: 'Organizer / Admin',
      badge: 'Security Key Required',
      icon: ShieldCheck,
      color: '#ef4444',
      description: 'Authorize investors, review student ventures, and oversee leaderboard',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName || !email || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        fullName,
        email,
        password,
        role,
        institution,
      };

      if (role === 'student') {
        payload.teamName = teamName || `${fullName}'s Team`;
      } else if (role === 'investor') {
        payload.companyOrFirm = companyOrFirm || 'Independent Angel Investor';
        payload.investmentCapacity = investmentCapacity;
        payload.bio = bio;
      } else if (role === 'judge') {
        payload.judgePin = judgePin;
        payload.judgeDesignation = judgeDesignation || 'IMSciences Jury Member';
      } else if (role === 'admin') {
        payload.adminKey = adminKey;
      }

      const res = await register(payload);

      if (res.success && res.user) {
        if (role === 'investor') {
          setSuccessMsg('Investor registration received! Your account is created and queued for Fest Admin approval. Redirecting...');
          setTimeout(() => router.push('/investor'), 2000);
        } else if (role === 'student') {
          setSuccessMsg('Student Team account created! Redirecting to Startup Registration portal...');
          setTimeout(() => router.push('/student'), 1500);
        } else if (role === 'judge') {
          setSuccessMsg('Judge credentials registered! Redirecting to Jury Evaluation Portal...');
          setTimeout(() => router.push('/judge'), 1500);
        } else {
          setSuccessMsg('Admin account verified! Redirecting to Organizer Console...');
          setTimeout(() => router.push('/admin'), 1500);
        }
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem 5rem',
      background: 'radial-gradient(circle at 50% 0%, rgba(11, 37, 69, 0.08) 0%, transparent 60%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px -15px rgba(11, 37, 69, 0.1)',
        padding: '2.5rem',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(212, 175, 55, 0.12)',
            color: '#a6841c',
            padding: '0.35rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}>
            <Sparkles size={14} /> Join Business Fest 2027
          </div>
          <h1 style={{ fontSize: '2rem', color: '#0b2545', marginBottom: '0.35rem' }}>
            Create Your Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Step 1: Choose your role in the Business Fest Summit
          </p>
        </div>

        {/* Role Cards Selection Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}>
          {roles.map((r) => {
            const isSelected = role === r.id;
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                onClick={() => { setRole(r.id); setError(''); }}
                style={{
                  border: isSelected ? `2px solid ${r.color}` : '1.5px solid #e2e8f0',
                  background: isSelected ? 'rgba(0, 102, 204, 0.03)' : '#ffffff',
                  borderRadius: '16px',
                  padding: '1rem 0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: isSelected ? '0 8px 20px -6px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: isSelected ? `${r.color}20` : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                }}>
                  <Icon size={22} color={r.color} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                  {r.title}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: r.id === 'investor' ? '#059669' : '#64748b',
                  fontWeight: 600,
                  background: r.id === 'investor' ? '#ecfdf5' : '#f8fafc',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '6px',
                }}>
                  {r.badge}
                </div>
              </div>
            );
          })}
        </div>

        {/* Investor notice if investor chosen */}
        {role === 'investor' && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}>
            <Clock size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
              <strong>Admin Approval Required:</strong> As an investor, you will be registered in <em>Pending</em> status. Once verified by the Fest Admin, you can pledge investment capital, submit investor ratings, and propel startups up the leaderboard.
            </div>
          </div>
        )}

        {/* Form Messages */}
        {error && (
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
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#059669',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit}>
          {/* Common Credentials */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <User size={15} color="#0066cc" /> Full Name
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  className="form-input has-icon-left"
                  placeholder="e.g. Ayesha Khan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={15} color="#0066cc" /> Email Address
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="form-input has-icon-left"
                  placeholder="e.g. name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                <Lock size={15} color="#0066cc" /> Password
              </label>
            </div>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input has-icon-left has-action-right"
                placeholder="Create a password (minimum 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-action-right"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Student Fields */}
          {role === 'student' && (
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 8px rgba(11, 37, 69, 0.03)',
            }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                color: '#0b2545', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <GraduationCap size={18} color="#0066cc" /> Team & Academic Affiliation
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Team / Venture Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <GraduationCap size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-input has-icon-left"
                      placeholder="e.g. Khyber Innovators"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Institution / University</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <Building size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-input has-icon-left"
                      placeholder="e.g. IMSciences Peshawar"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Investor Fields */}
          {role === 'investor' && (
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.05)',
            }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                color: '#065f46', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <Briefcase size={18} color="#10b981" /> Investor Profile (For Fest Admin Due Diligence)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Firm, Syndicate, or Angel Title</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <Briefcase size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-input has-icon-left"
                      placeholder="e.g. Khyber Angel Syndicate"
                      value={companyOrFirm}
                      onChange={(e) => setCompanyOrFirm(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Investment Ticket Capacity</label>
                  <select
                    className="form-select"
                    value={investmentCapacity}
                    onChange={(e) => setInvestmentCapacity(e.target.value)}
                  >
                    <option value="PKR 250k - 500k">PKR 250,000 - 500,000</option>
                    <option value="PKR 500k - 1M">PKR 500,000 - 1,000,000</option>
                    <option value="PKR 1M - 5M">PKR 1,000,000 - 5,000,000</option>
                    <option value="PKR 5M+">PKR 5,000,000+</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Investment Focus / Bio
                  <span className="form-label-optional">Optional</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <Sparkles size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-input has-icon-left"
                    placeholder="e.g. Agritech, FinTech, & AI seed-stage ventures"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Judge Fields */}
          {role === 'judge' && (
            <div style={{
              background: '#fefce8',
              border: '1.5px solid #fef08a',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.05)',
            }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                color: '#854d0e', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <Award size={18} color="#d4af37" /> Jury Credentials & Verification
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Jury PIN / Code</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <Key size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-input has-icon-left"
                      placeholder="Default event PIN: 2027"
                      value={judgePin}
                      onChange={(e) => setJudgePin(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Designation / Department</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <Award size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-input has-icon-left"
                      placeholder="e.g. Assistant Professor, IMSciences"
                      value={judgeDesignation}
                      onChange={(e) => setJudgeDesignation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Fields */}
          {role === 'admin' && (
            <div style={{
              background: '#fff1f2',
              border: '1.5px solid #fecdd3',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.05)',
            }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                color: '#9f1239', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <ShieldCheck size={18} color="#ef4444" /> Admin Authorization Passkey
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Organizer Passcode</label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <Key size={18} />
                  </span>
                  <input
                    type="password"
                    className="form-input has-icon-left"
                    placeholder="Enter Fest Admin Key (Default: BFEST2027_ADMIN or admin123)"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
            style={{
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '12px',
            }}
          >
            {loading ? 'Creating Account...' : `Register as ${roles.find(r => r.id === role)?.title}`}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Existing user login link */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#64748b',
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#0066cc', fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName || !email || !password || !adminKey) {
      setError('Please fill in your name, email, password, and Admin Authorization Passkey.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        fullName,
        email,
        password,
        role: 'admin',
        institution: 'IMSciences Peshawar',
        adminKey,
      });

      if (res.success && res.user) {
        setSuccessMsg('Admin account created! Redirecting to the Admin Console where you can create Student, Judge, Student Affairs, and Registration Team accounts...');
        setTimeout(() => router.push('/admin'), 1500);
      } else {
        setError(res.error || 'Admin registration failed.');
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
        maxWidth: '580px',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px -15px rgba(11, 37, 69, 0.1)',
        padding: '2.5rem',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#fef2f2',
            border: '1px solid #fecdd3',
            color: '#dc2626',
            padding: '0.35rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}>
            <ShieldCheck size={15} /> Organizer / Admin Registration Only
          </div>
          <h1 style={{ fontSize: '1.95rem', color: '#0b2545', marginBottom: '0.4rem' }}>
            Register Fest Admin Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Only Fest Administrators register here. Once signed in, the Admin provisions accounts for <strong>Student Teams</strong>, <strong>Judges</strong>, <strong>Student Affairs</strong>, and the <strong>Registration Team</strong>.
          </p>
        </div>

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

        {/* Admin Registration Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <User size={15} color="#0066cc" /> Admin Full Name
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  className="form-input has-icon-left"
                  placeholder="e.g. Fest Organizer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={15} color="#0066cc" /> Official Email
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="form-input has-icon-left"
                  placeholder="e.g. admin@imsciences.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              <Lock size={15} color="#0066cc" /> Password
            </label>
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

          {/* Admin Authorization Passkey */}
          <div style={{
            background: '#fff1f2',
            border: '1.5px solid #fecdd3',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ 
              fontWeight: 700, 
              fontSize: '0.92rem', 
              color: '#9f1239', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <ShieldCheck size={18} color="#ef4444" /> Organizer Authorization Passkey
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Admin Passcode *</label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Key size={18} />
                </span>
                <input
                  type="password"
                  className="form-input has-icon-left"
                  placeholder="Enter Admin Key (Default: BFEST2027_ADMIN or admin123)"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

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
              width: '100%',
            }}
          >
            {loading ? 'Creating Admin Account...' : 'Register as Organizer / Admin'}
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

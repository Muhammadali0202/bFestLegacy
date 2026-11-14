'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  GraduationCap, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  Star,
  ClipboardList,
  MonitorPlay
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const urlRole = searchParams.get('role') as UserRole | null;

  const [selectedRole, setSelectedRole] = useState<UserRole>(urlRole || 'student_affairs');

  useEffect(() => {
    if (urlRole) {
      setSelectedRole(urlRole);
    }
  }, [urlRole]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Role metadata
  const rolesConfig: Record<UserRole, { label: string; icon: any; color: string; desc: string; redirect: string; defaultEmail: string; defaultPass: string }> = {
    student: {
      label: 'Student Team',
      icon: GraduationCap,
      color: '#3b82f6',
      desc: 'Register startup team, submit pitch deck, & track standing',
      redirect: '/student',
      defaultEmail: 'student@imsciences.edu.pk',
      defaultPass: 'student123',
    },
    judge: {
      label: 'Jury / Judge',
      icon: Award,
      color: '#d4af37',
      desc: 'Evaluate ventures on 4 rubrics & assign official jury scores',
      redirect: '/judge',
      defaultEmail: 'jury.irfan@imsciences.edu.pk',
      defaultPass: 'judge123',
    },
    student_affairs: {
      label: "Bfest's Officials",
      icon: Star,
      color: '#0047ff',
      desc: "Authorized Bfest's Officials portal to rate startups and update progress",
      redirect: '/startups',
      defaultEmail: 'studentaffairs@imsciences.edu.pk',
      defaultPass: 'affairs123',
    },
    registration_team: {
      label: 'Registration Team',
      icon: ClipboardList,
      color: '#8b5cf6',
      desc: 'Official intake desk to register student startups and manage entries',
      redirect: '/register',
      defaultEmail: 'registration@imsciences.edu.pk',
      defaultPass: 'reg123',
    },
    investor: {
      label: 'Investor',
      icon: Briefcase,
      color: '#10b981',
      desc: 'Pledge capital, rate startups, & boost leaderboard rankings',
      redirect: '/investor',
      defaultEmail: 'investor@venturekp.com',
      defaultPass: 'investor123',
    },
    tv_admin: {
      label: 'TV Display Admin',
      icon: MonitorPlay,
      color: '#06b6d4',
      desc: 'University AV & Campus TV screen administrator for live stage broadcast',
      redirect: '/leaderboard/stage',
      defaultEmail: 'tv@imsciences.edu.pk',
      defaultPass: 'tv2027',
    },
    admin: {
      label: 'Organizer / Admin',
      icon: ShieldCheck,
      color: '#ef4444',
      desc: 'Create Student, Judge, Student Affairs & Registration Team accounts and manage event',
      redirect: '/admin',
      defaultEmail: 'admin@imsciences.edu.pk',
      defaultPass: 'admin123',
    },
  };

  const allRoles: UserRole[] = [
    'student_affairs',
    'registration_team',
    'tv_admin',
    'admin',
  ];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
  };

  const fillQuickDemo = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(rolesConfig[role].defaultEmail);
    setPassword(rolesConfig[role].defaultPass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password, selectedRole);
      if (res.success && res.user) {
        setSuccessMsg(`Welcome, ${res.user.fullName}! Redirecting to ${rolesConfig[res.user.role].label}...`);
        setTimeout(() => {
          router.push(rolesConfig[res.user!.role].redirect);
        }, 900);
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
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
      padding: '2rem 1.5rem 4rem',
      background: 'radial-gradient(circle at 50% 0%, rgba(11, 37, 69, 0.08) 0%, transparent 60%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
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
            background: 'rgba(212, 175, 55, 0.12)',
            color: '#a6841c',
            padding: '0.35rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}>
            <Sparkles size={14} /> Unified Portal Sign In
          </div>
          <h1 style={{ fontSize: '1.9rem', color: '#0b2545', marginBottom: '0.35rem' }}>
            Sign In to Business Fest
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Sign in with the account credentials created for your role by the Fest Admin
          </p>
        </div>

        {/* Role Selector Grid (3x2 on desktop, 2x3 on small mobile) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
          gap: '0.45rem',
          background: '#f1f5f9',
          padding: '0.4rem',
          borderRadius: '16px',
          marginBottom: '1.5rem',
        }}>
          {allRoles.map((role) => {
            const isSelected = selectedRole === role;
            const Icon = rolesConfig[role].icon;
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.6rem 0.35rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? '#0b2545' : '#64748b',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.78rem',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={18} color={isSelected ? rolesConfig[role].color : '#94a3b8'} />
                <span>{rolesConfig[role].label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Role Info Banner */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          {React.createElement(rolesConfig[selectedRole].icon, { 
            size: 20, 
            color: rolesConfig[selectedRole].color 
          })}
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{rolesConfig[selectedRole].label}: </span>
            <span style={{ color: '#475569' }}>{rolesConfig[selectedRole].desc}</span>
          </div>
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

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
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
                placeholder={`e.g. ${rolesConfig[selectedRole].defaultEmail}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
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
                placeholder="Enter your account password"
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
              marginTop: '1.25rem',
              width: '100%',
            }}
          >
            {loading ? 'Authenticating...' : `Log In as ${rolesConfig[selectedRole].label}`}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* One-Click Quick Test Accounts */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px dashed #e2e8f0',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            color: '#64748b',
            marginBottom: '0.6rem' 
          }}>
            <Zap size={14} color="#f59e0b" /> Quick Demo Credentials:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '0.4rem' }}>
            {allRoles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => fillQuickDemo(r)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.73rem', justifyContent: 'center', padding: '0.4rem 0.45rem' }}
              >
                {rolesConfig[r].label}
              </button>
            ))}
          </div>
        </div>

        {/* Managed Access Note */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: '#64748b',
        }}>
          All official and staff accounts are provisioned directly by the Business Fest Administrator.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}

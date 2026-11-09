'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <Lock size={28} />
        </div>

        <div className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
          <ShieldCheck size={13} /> Managed Access Only
        </div>

        <h1 style={{ fontSize: '1.65rem', color: 'var(--bf-primary)', marginBottom: '0.6rem' }}>
          Sign-Up is Disabled
        </h1>

        <p style={{ color: 'var(--bf-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Public account registration is disabled. The Fest Administrator logs in directly and provisions accounts for{' '}
          <strong>Student Teams, Judges, Student Affairs, Registration Team, and Investors</strong> from the Admin Console.
        </p>

        <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
          Proceed to Portal Sign In <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

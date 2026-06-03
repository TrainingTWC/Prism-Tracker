import React, { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { AlertCircle } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

// Prism triangle logo — same as all sibling apps
const PrismLogo: React.FC<{ size?: number }> = ({ size = 68 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,54 35,85 65,85" fill="url(#ptg3)" />
    <polygon points="50,8 8,85 35,85 50,54" fill="url(#ptg1)" />
    <polygon points="50,8 50,54 65,85 92,85" fill="url(#ptg2)" />
    <defs>
      <linearGradient id="ptg1" x1="8" y1="85" x2="50" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#84CC16" />
      </linearGradient>
      <linearGradient id="ptg2" x1="92" y1="85" x2="50" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
      <linearGradient id="ptg3" x1="35" y1="85" x2="65" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#60A5FA" />
      </linearGradient>
    </defs>
  </svg>
);

export const AuthGate: React.FC = () => {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result: any = await signIn('password', {
        email,
        password,
        flow: mode === 'signup' ? 'signUp' : 'signIn',
      });
      if (result && !result.signingIn && result.redirect) {
        window.location.href = result.redirect.toString();
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: '#09090B',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo + branding */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-block', marginBottom: 18 }}>
          <PrismLogo size={68} />
        </div>
        <p style={{
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace',
          margin: '0 0 10px', fontWeight: 600,
        }}>ROLLOUT OS</p>
        <h1 style={{
          fontSize: 38, fontWeight: 900, letterSpacing: '0.04em',
          margin: 0, lineHeight: 1,
        }}>
          <span style={{ color: '#F4F4F5' }}>PRISM</span>{' '}
          <span style={{ color: '#3B82F6' }}>TRACKER</span>
        </h1>
      </div>

      {/* Auth card */}
      <div style={{
        width: '100%', maxWidth: 400, position: 'relative', zIndex: 1,
        background: '#111116', border: '1px solid #1C1C21',
        borderRadius: 18, padding: 32,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#F4F4F5', margin: '0 0 6px' }}>
          {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
        </h2>
        <p style={{ fontSize: 12, color: '#52525C', margin: '0 0 24px', lineHeight: 1.5 }}>
          {mode === 'signin'
            ? 'Enter your email and password to access Prism Tracker.'
            : 'Create your operator account to get started.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block', fontSize: 10, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#71717A',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: 8,
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@thirdwavecoffee.in"
              required
              autoComplete="email"
              style={{
                width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                background: '#0D0D12', border: '1px solid #27272F',
                borderRadius: 9, color: '#F4F4F5',
                fontSize: 14, fontFamily: 'JetBrains Mono, monospace',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#3B82F6')}
              onBlur={e => (e.target.style.borderColor = '#27272F')}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: 10, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#71717A',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: 8,
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              style={{
                width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                background: '#0D0D12', border: '1px solid #27272F',
                borderRadius: 9, color: '#F4F4F5',
                fontSize: 14, fontFamily: 'JetBrains Mono, monospace',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#3B82F6')}
              onBlur={e => (e.target.style.borderColor = '#27272F')}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 12px', borderRadius: 9,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.20)',
              color: '#FCA5A5', fontSize: 12,
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4, padding: '13px 0', width: '100%',
              background: loading ? '#1D4ED8' : 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
              border: 'none', borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '0.02em',
              boxShadow: loading ? 'none' : '0 0 24px rgba(59,130,246,0.30)',
              transition: 'box-shadow 0.2s, transform 0.15s',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!loading) { (e.currentTarget.style.boxShadow = '0 0 36px rgba(59,130,246,0.50)'); (e.currentTarget.style.transform = 'translateY(-1px)'); } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.30)'; e.currentTarget.style.transform = 'none'; }}
          >
            {loading ? 'Signing in…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            style={{
              background: 'transparent', border: 'none', color: '#52525C',
              fontSize: 11, cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 0',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#A1A1AE')}
            onMouseLeave={e => (e.currentTarget.style.color = '#52525C')}
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: 28, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: '#27272F', fontFamily: 'JetBrains Mono, monospace',
        position: 'relative', zIndex: 1,
      }}>
        PRISM INTELLIGENCE · OPERATIONAL PLATFORM
      </p>
    </div>
  );
};

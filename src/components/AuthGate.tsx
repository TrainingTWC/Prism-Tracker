import React, { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      <div className="ambient-signal" style={{ top: '15%', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="ambient-signal" style={{ bottom: '-10%', right: '-10%', width: 400, height: 400 }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            className="prism-icon-tile"
            style={{ margin: '0 auto 18px', background: 'linear-gradient(135deg,#1D4ED8,#3B82F6,#60A5FA)', color: 'white', border: 'none', boxShadow: '0 0 32px rgba(59,130,246,0.4)' }}
          >
            <span style={{ fontSize: 22, fontWeight: 800 }}>P</span>
          </div>
          <p className="text-overline" style={{ margin: '0 0 6px' }}>Rollout tracking · Prism OS</p>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--obsidian-50)',
            }}
          >
            Prism <span className="text-gradient-signal">Tracker</span>
          </h1>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
            {mode === 'signin' ? 'Sign in to coordinate the estate.' : 'Create your operator account.'}
          </p>
        </div>

        <div className="widget" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="text-overline" style={{ display: 'block', marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="prism-input"
                  style={{ paddingLeft: 38 }}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@thirdwavecoffee.in"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-overline" style={{ display: 'block', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="prism-input"
                  style={{ paddingLeft: 38 }}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: 12,
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.20)',
                  color: '#FCA5A5',
                  fontSize: 12,
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8, padding: 14 }}>
              {loading ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              {!loading && <ArrowRight size={14} />}
            </button>

            <button
              type="button"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                fontSize: 11,
                cursor: 'pointer',
                marginTop: 4,
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </form>
        </div>

        <p
          className="text-overline-muted"
          style={{ textAlign: 'center', marginTop: 24, fontSize: 9 }}
        >
          Powered by Third Wave Coffee · Prism OS
        </p>
      </div>
    </div>
  );
};

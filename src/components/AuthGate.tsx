import React, { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { LogIn, UserPlus } from 'lucide-react';

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
      const result = await signIn('password', {
        email,
        password,
        flow: mode === 'signup' ? 'signUp' : 'signIn',
      });
      
      if (!result.signingIn && result.redirect) {
        window.location.href = result.redirect.toString();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-150 shadow-xl overflow-hidden">
        <div className="p-8 text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Prism Tracker</h1>
            <p className="text-slate-500 text-sm">
              {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
            >
              {mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
                setPassword('');
              }}
              className="text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wider"
              disabled={loading}
            >
              {mode === 'signin' ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          {/* Info */}
          <p className="text-[10px] text-slate-400 mt-4">
            Secure Convex authentication. No third-party login.
          </p>
        </div>
      </div>
    </div>
  );
};

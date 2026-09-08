'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('amal@officeworld.app');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSupabaseConfigured()) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
    }

    // Direct transition to Onboarding / Office
    localStorage.setItem('officeworld_auth', JSON.stringify({ email, isLoggedIn: true }));
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              Office<span className="text-blue-400">World</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight pt-2">Welcome back</h2>
          <p className="text-xs text-slate-400">Enter your credentials to access your 2D virtual office</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Office</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 font-semibold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

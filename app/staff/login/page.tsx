'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Activity, ShieldAlert, CheckCircle, Lock, Mail, Users } from 'lucide-react';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if staff user is already logged in
  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (session) {
          router.replace('/staff/dashboard');
        }
      } catch (err) {
        console.error('Error checking active session:', err);
      } finally {
        setCheckingSession(false);
      }
    }
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error: authError } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data?.user) {
        setSuccess(true);
        // Delay slightly for visual feedback
        setTimeout(() => {
          router.push('/staff/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to fill credentials for easy testing/demo
  const fillCredentials = (role: string) => {
    if (role === 'admin') {
      setEmail('admin@citycare.com');
      setPassword('Admin123!');
    } else if (role === 'nurse') {
      setEmail('nurse.triage@citycare.com');
      setPassword('Nurse123!');
    } else if (role === 'doctor') {
      setEmail('dr.ahmed@citycare.com');
      setPassword('Doctor123!');
    }
  };

  if (checkingSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 min-h-screen">
        <div className="text-center">
          <Activity className="h-10 w-10 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Checking security session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden px-4">
      {/* Background light effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-teal-900/10 blur-[120px]" />

      <div className="w-full max-w-md z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4 animate-bounce">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl font-sans">
            City Care Hospital
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Clinical HIS & Patient Triage System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle top highlights */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            Staff Portal Sign In
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-2.5">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>Authentication successful! Accessing clinical dashboard...</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@citycare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Access Portal</span>
              )}
            </button>
          </form>

          {/* Quick Login / Sandbox helpers */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Demo Quick-Fill Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="bg-slate-950 border border-slate-800/60 hover:bg-blue-900/10 hover:border-blue-500/30 text-slate-300 font-medium py-2 px-2.5 rounded-lg text-[11px] transition text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('nurse')}
                className="bg-slate-950 border border-slate-800/60 hover:bg-teal-900/10 hover:border-teal-500/30 text-slate-300 font-medium py-2 px-2.5 rounded-lg text-[11px] transition text-center"
              >
                Triage Nurse
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('doctor')}
                className="bg-slate-950 border border-slate-800/60 hover:bg-indigo-900/10 hover:border-indigo-500/30 text-slate-300 font-medium py-2 px-2.5 rounded-lg text-[11px] transition text-center"
              >
                Doctor (Ali)
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 text-center">
              Make sure these users exist in your Supabase Auth project or are seeded in Phase 3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

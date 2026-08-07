'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setServerError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      login(data.token, data.user);
      router.push(redirectTarget);
    } catch (err: any) {
      setServerError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-100"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-pink-100 text-pink-600 mb-3 shadow-2xs">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="font-serif-header text-2xl sm:text-3xl font-bold text-pink-950">
          Welcome Back to Your Nook
        </h1>
        <p className="text-xs text-pink-700/70 mt-1">
          Sign in to manage your personal book collection ✨
        </p>
      </div>

      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{serverError}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs sm:text-sm">
        {/* Email Field */}
        <div>
          <label htmlFor="email-input" className="block font-medium text-pink-950 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
            <input
              id="email-input"
              type="email"
              autoComplete="email"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              placeholder="reader@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-pink-50/30 text-pink-950 focus:outline-none focus:ring-2 transition-all ${
                emailError
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-pink-200 focus:ring-pink-400'
              }`}
            />
          </div>
          {emailError && (
            <p id="email-error" className="mt-1 text-[11px] font-semibold text-rose-600">
              {emailError}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password-input" className="block font-medium text-pink-950 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
            <input
              id="password-input"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-pink-50/30 text-pink-950 focus:outline-none focus:ring-2 transition-all ${
                passwordError
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-pink-200 focus:ring-pink-400'
              }`}
            />
          </div>
          {passwordError && (
            <p id="password-error" className="mt-1 text-[11px] font-semibold text-rose-600">
              {passwordError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 touch-target"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Footer link */}
      <div className="mt-6 text-center text-xs text-pink-700/70">
        Don&apos;t have a reading sanctuary yet?{' '}
        <Link
          href="/register"
          className="font-bold text-pink-600 hover:underline focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-md px-1"
        >
          Sign Up Now
        </Link>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/80 via-white to-rose-50/50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        <Suspense fallback={<div className="p-8 text-center text-pink-600">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}

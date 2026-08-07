'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const router = useRouter();
  const { register } = useAuth();

  const validate = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setServerError('');

    if (!name.trim()) {
      setNameError('Please enter your name');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter a password');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      register(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/80 via-white to-rose-50/50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-100"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-pink-100 text-pink-600 mb-3 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="font-serif-header text-2xl sm:text-3xl font-bold text-pink-950">
              Create Your Sanctuary
            </h1>
            <p className="text-xs text-pink-700/70 mt-1">
              Join to log books, capture quotes, and track reading habits ✨
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
            {/* Name Field */}
            <div>
              <label htmlFor="name-input" className="block font-medium text-pink-950 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <input
                  id="name-input"
                  type="text"
                  autoComplete="name"
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? 'name-error' : undefined}
                  placeholder="e.g. Shreya"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-pink-50/30 text-pink-950 focus:outline-none focus:ring-2 transition-all ${
                    nameError
                      ? 'border-rose-400 focus:ring-rose-400'
                      : 'border-pink-200 focus:ring-pink-400'
                  }`}
                />
              </div>
              {nameError && (
                <p id="name-error" className="mt-1 text-[11px] font-semibold text-rose-600">
                  {nameError}
                </p>
              )}
            </div>

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
                Password (min 6 chars)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <input
                  id="password-input"
                  type="password"
                  autoComplete="new-password"
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Create Sanctuary ✨ <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center text-xs text-pink-700/70">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-pink-600 hover:underline focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-md px-1"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Bookmark, CheckCircle2, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/80 via-white to-rose-50/50 text-pink-950">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Glow backdrop shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/25 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 space-y-6 max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-800 border border-pink-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" /> A Deceptively Simple Personal Book Manager
          </span>

          <h1 className="font-serif-header text-4xl sm:text-6xl font-bold text-pink-950 leading-tight">
            Your Personal Reading <span className="text-pink-600 italic">Sanctuary</span>
          </h1>

          <p className="text-base sm:text-lg text-pink-800/80 leading-relaxed font-normal max-w-2xl mx-auto">
            Log your favorite books, track your reading progress, capture quotes that touch your soul, and rediscover your love for stories in a space made just for you.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-base shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                Go to My Reading Nook <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-base shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
                >
                  Create Your Nook ✨ <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-pink-200 text-pink-900 font-bold text-base hover:bg-pink-50 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Feature Overview Cards (Purely Informational - No Clickable Hover Affordances) */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full relative z-10">
          <div className="bg-white/80 backdrop-blur-md border border-pink-100/80 p-6 rounded-3xl shadow-2xs select-none">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 w-fit mb-4">
              <Bookmark className="w-6 h-6" />
            </div>
            <h2 className="font-serif-header text-lg font-bold text-pink-950 mb-2">
              Curate Your Collection
            </h2>
            <p className="text-xs text-pink-800/80 leading-relaxed">
              Organize books by reading status: <em>Want to Read</em>, <em>Devouring Now</em>, or <em>Finished & Loved</em> with custom tag chips.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-pink-100/80 p-6 rounded-3xl shadow-2xs select-none">
            <div className="p-3 rounded-2xl bg-pink-100 text-pink-700 w-fit mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="font-serif-header text-lg font-bold text-pink-950 mb-2">
              Generative Cover Magic
            </h2>
            <p className="text-xs text-pink-800/80 leading-relaxed">
              No cover photo? No problem! Every book gets an auto-generated pastel gradient canvas cover with elegant typography.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-pink-100/80 p-6 rounded-3xl shadow-2xs select-none">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-serif-header text-lg font-bold text-pink-950 mb-2">
              Reading Progress & Joy
            </h2>
            <p className="text-xs text-pink-800/80 leading-relaxed">
              Track page numbers in real time and celebrate every completed book with a celebratory confetti burst!
            </p>
          </div>
        </div>

        {/* Quote Footer */}
        <div className="mt-16 py-8 border-t border-pink-100 w-full max-w-xl text-center">
          <p className="font-serif-header text-sm sm:text-base italic text-pink-900/80">
            &ldquo;Simple can be harder than complex. But it&apos;s worth it because once you get there, you can move mountains.&rdquo;
          </p>
        </div>
      </main>
    </div>
  );
}

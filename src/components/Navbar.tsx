'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, LogOut, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onExportJournal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onExportJournal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-pink-100 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif-header text-lg sm:text-xl font-bold text-pink-950 leading-tight group-hover:text-pink-600 transition-colors flex items-center gap-1.5">
              My Reading Nook <Sparkles className="w-4 h-4 text-pink-500" />
            </h1>
            <p className="text-[10px] font-medium text-pink-700/70">
              A Personal Literary Sanctuary
            </p>
          </div>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Export Journal Button */}
              {onExportJournal ? (
                <button
                  onClick={onExportJournal}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-200 text-xs font-semibold text-pink-900 bg-pink-50/50 hover:bg-pink-100 transition-colors"
                  title="Export Reading Journal"
                >
                  <Download className="w-3.5 h-3.5 text-pink-500" /> Export Journal
                </button>
              ) : null}

              {/* User Profile Avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-pink-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-amber-300 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'R'}
                </div>
                <span className="hidden md:block text-xs font-semibold text-pink-950">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-pink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-pink-900 hover:bg-pink-50 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all"
              >
                Sign Up ✨
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

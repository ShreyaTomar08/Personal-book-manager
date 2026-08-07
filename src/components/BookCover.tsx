'use client';

import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface BookCoverProps {
  title: string;
  author: string;
  coverUrl?: string;
  tags?: string[];
  className?: string;
}

// Aesthetic, curated pastel editorial gradient presets
const PRESET_PALETTES = [
  {
    gradient: 'from-pink-100 via-rose-100 to-amber-100',
    text: 'text-pink-950',
    accent: 'border-pink-200/80',
    chip: 'bg-white/80 text-pink-900',
  },
  {
    gradient: 'from-purple-100 via-pink-100 to-indigo-100',
    text: 'text-purple-950',
    accent: 'border-purple-200/80',
    chip: 'bg-white/80 text-purple-900',
  },
  {
    gradient: 'from-rose-100 via-orange-100 to-amber-100',
    text: 'text-rose-950',
    accent: 'border-rose-200/80',
    chip: 'bg-white/80 text-rose-900',
  },
  {
    gradient: 'from-emerald-100 via-teal-100 to-cyan-100',
    text: 'text-teal-950',
    accent: 'border-teal-200/80',
    chip: 'bg-white/80 text-teal-900',
  },
  {
    gradient: 'from-amber-100 via-rose-100 to-purple-100',
    text: 'text-amber-950',
    accent: 'border-amber-200/80',
    chip: 'bg-white/80 text-amber-900',
  },
  {
    gradient: 'from-fuchsia-100 via-pink-100 to-rose-100',
    text: 'text-fuchsia-950',
    accent: 'border-fuchsia-200/80',
    chip: 'bg-white/80 text-fuchsia-900',
  },
];

export const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  coverUrl,
  tags = [],
  className = 'w-full h-64',
}) => {
  // Deterministic color palette derived from title string hash
  const getPaletteIndex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % PRESET_PALETTES.length;
  };

  if (coverUrl && coverUrl.trim().startsWith('http')) {
    return (
      <div className={`relative overflow-hidden rounded-xl shadow-xs group bg-pink-100 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={`Book cover for ${title}`}
          width={300}
          height={400}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-950/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  const palette = PRESET_PALETTES[getPaletteIndex(title || 'book')];
  const primaryTag = tags[0] ? `#${tags[0]}` : null;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${palette.accent} p-4 flex flex-col justify-between shadow-xs bg-gradient-to-br ${palette.gradient} ${palette.text} ${className} transition-all duration-300 group select-none`}
    >
      {/* Decorative Book Spine Texture */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/5 border-r border-black/10 z-10" />

      {/* Decorative Background Blur Orbs */}
      <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/40 blur-xl pointer-events-none" />
      <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-white/50 blur-lg pointer-events-none" />

      {/* Top Header */}
      <div className="flex justify-between items-center relative z-20 pl-2">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${palette.chip} px-2.5 py-0.5 rounded-full shadow-2xs backdrop-blur-xs`}>
          <Sparkles className="w-2.5 h-2.5 text-pink-500" />
          {primaryTag || 'Nook Edition'}
        </span>
        <BookOpen className="w-4 h-4 opacity-40" />
      </div>

      {/* Title & Author Center Stage */}
      <div className="my-auto py-2 relative z-20 text-center px-3 pl-4">
        <h3 className="font-serif-header text-base sm:text-lg font-bold leading-tight line-clamp-3 mb-1 group-hover:scale-102 transition-transform">
          {title || 'Untitled Story'}
        </h3>
        <p className="text-xs font-semibold opacity-85 line-clamp-1 italic">
          by {author || 'Unknown Author'}
        </p>
      </div>

      {/* Book Footer Spine Line */}
      <div className="pt-2 border-t border-current/15 flex justify-between items-center text-[10px] font-semibold opacity-70 relative z-20 pl-2">
        <span className="uppercase tracking-widest text-[9px]">Literary Nook</span>
        <span>✦ ✦ ✦</span>
      </div>
    </div>
  );
};

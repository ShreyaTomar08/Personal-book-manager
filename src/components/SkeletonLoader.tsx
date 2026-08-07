'use client';

import React from 'react';

export const SkeletonStats: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white border border-pink-100 p-4 rounded-2xl shadow-2xs space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 skeleton-shimmer rounded-md" />
            <div className="w-8 h-8 skeleton-shimmer rounded-xl" />
          </div>
          <div className="h-8 w-12 skeleton-shimmer rounded-lg" />
          <div className="h-2.5 w-20 skeleton-shimmer rounded-md" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonBookCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-pink-100 p-4 shadow-sm space-y-4 flex flex-col justify-between">
      {/* Cover Skeleton */}
      <div className="w-full h-56 skeleton-shimmer rounded-xl" />
      {/* Title & Author Skeleton */}
      <div className="space-y-2">
        <div className="h-5 w-3/4 skeleton-shimmer rounded-md" />
        <div className="h-3 w-1/2 skeleton-shimmer rounded-md" />
      </div>
      {/* Badge & Progress */}
      <div className="flex justify-between items-center">
        <div className="h-6 w-24 skeleton-shimmer rounded-full" />
        <div className="h-4 w-16 skeleton-shimmer rounded-md" />
      </div>
      {/* Footer */}
      <div className="pt-3 border-t border-pink-100 flex justify-between items-center">
        <div className="h-7 w-24 skeleton-shimmer rounded-lg" />
        <div className="h-7 w-12 skeleton-shimmer rounded-lg" />
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBookCard key={i} />
      ))}
    </div>
  );
};

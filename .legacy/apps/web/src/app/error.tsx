'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Root Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-3xl bg-red-50 text-red-600 border border-red-200 max-w-md space-y-3">
        <h2 className="text-lg font-black text-red-900">Something went wrong</h2>
        <p className="text-xs text-red-700 font-medium">
          {error?.message || 'An unexpected error occurred while loading this page.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow hover:bg-red-700 transition"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

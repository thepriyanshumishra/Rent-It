'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl max-w-md text-center space-y-4">
          <h2 className="text-xl font-black text-slate-900">Application Error</h2>
          <p className="text-xs text-slate-500 font-medium">
            {error?.message || 'A critical error occurred in the application.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow hover:bg-purple-700 transition"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}

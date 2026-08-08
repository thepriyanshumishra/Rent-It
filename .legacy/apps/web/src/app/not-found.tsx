import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="h-16 w-16 rounded-3xl bg-purple-50 text-brand-600 flex items-center justify-center text-2xl font-black border border-purple-100">
        404
      </div>
      <h1 className="text-xl font-black text-slate-900">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm font-medium">
        The page or equipment route you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold shadow-md hover:bg-brand-700 transition"
      >
        Return to Catalog
      </Link>
    </div>
  );
}

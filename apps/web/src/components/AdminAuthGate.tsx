'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, RefreshCw } from 'lucide-react';

/**
 * AdminAuthGate - Wraps any admin page and enforces:
 * 1. User must be logged in (rentit_token exists)
 * 2. User must have ADMIN or STAFF role
 * Redirects to /login?redirect=<current-path> if either check fails.
 */
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');

  useEffect(() => {
    const token = localStorage.getItem('rentit_token');
    const userRaw = localStorage.getItem('rentit_user');

    if (!token) {
      router.replace('/login?redirect=/admin');
      return;
    }

    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          setStatus('authorized');
          return;
        }
      } catch {
        // malformed user object
      }
    }

    // Token exists but role is not admin → redirect to home with message
    setStatus('unauthorized');
    setTimeout(() => {
      router.replace('/');
    }, 2000);
  }, [router]);

  if (status === 'checking') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-brand-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Verifying access credentials...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-3xl border border-red-200 p-10 text-center space-y-3 max-w-sm shadow-sm">
          <ShieldCheck className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-500">
            This area is restricted to RentIt operations staff only. Redirecting you to the homepage...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

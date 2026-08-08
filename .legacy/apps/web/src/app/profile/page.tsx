'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronLeft,
  Lock,
  Package,
  LogOut,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string>('NOT_VERIFIED');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rentit_token');
    if (!token) {
      router.push('/login?redirect=/profile');
      return;
    }

    const storedUser = localStorage.getItem('rentit_user');
    let userObj: any = { name: 'Priyanshu Sharma', email: 'customer@rentit.com', role: 'CUSTOMER', kycStatus: 'NOT_VERIFIED' };
    if (storedUser) {
      try {
        userObj = JSON.parse(storedUser);
      } catch {
        // fallback
      }
    }

    const status = localStorage.getItem('rentit_kyc_status') || userObj.kycStatus || 'NOT_VERIFIED';
    setCurrentUser(userObj);
    setKycStatus(status);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('rentit_token');
    localStorage.removeItem('rentit_refresh_token');
    localStorage.removeItem('rentit_user');
    window.dispatchEvent(new Event('storage'));
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
          
          {/* User Info Header */}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="h-16 w-16 rounded-2xl bg-brand-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-600/25">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{currentUser?.name}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {currentUser?.email}
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                {currentUser?.role || 'Customer Account'}
              </span>
            </div>
          </div>

          {/* Verification & KYC Status Box */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Identity Verification Status
            </h2>

            {kycStatus === 'APPROVED' ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-emerald-900">🟢 Account Verified (Aadhaar & DigiLocker Linked)</h3>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    Your identity has been fully verified. You can place equipment rental orders with instant deposit refund authorization.
                  </p>
                </div>
              </div>
            ) : kycStatus === 'PENDING' ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
                <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-900">🟡 Pending Operations Review</h3>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Your KYC document and live selfie have been submitted and are currently under review by our operations team.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">🔴 Identity Not Verified</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Complete a 1-minute Aadhaar KYC to unlock equipment rentals.
                    </p>
                  </div>
                </div>

                <Link
                  href="/kyc?redirect=/profile"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  Start KYC Verification <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Quick Account Links */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Account Management
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/my-rentals"
                className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
              >
                <Package className="h-5 w-5 text-brand-600" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">My Rental Orders</h3>
                  <p className="text-[11px] text-slate-500">Track active rentals & held deposits</p>
                </div>
              </Link>

              {currentUser?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-purple-50 border border-purple-200 hover:border-purple-300 transition"
                >
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="text-xs font-bold text-purple-900">Admin Operations Dashboard</h3>
                    <p className="text-[11px] text-purple-700">Manage orders, returns & KYC approvals</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

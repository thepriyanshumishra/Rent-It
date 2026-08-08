'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminAuthGate } from '../../../components/AdminAuthGate';
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Users,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Camera,
} from 'lucide-react';

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Rental Orders', href: '/admin/rentals', icon: ClipboardList },
  { label: 'KYC Approvals', href: '/admin/kyc', icon: UserCheck },
  { label: 'Inventory', href: '/admin', icon: Boxes },
  { label: 'Customers', href: '/admin', icon: Users },
];

function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] sticky top-16">
      <div className="p-4 border-b border-slate-100">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Panel</span>
        <p className="text-xs font-semibold text-slate-700 mt-0.5">Operations Management</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Hackathon Build</p>
          <p className="text-[11px] text-amber-600 mt-0.5">v1.0.0 · Odoo Integration</p>
        </div>
      </div>
    </aside>
  );
}

// Initial Mock Verification Queue
const MOCK_KYC_QUEUE = [
  {
    id: 'kyc_101',
    customerName: 'Priyanshu Sharma',
    email: 'customer@rentit.com',
    phone: '+91 98765 43210',
    aadhaarNumber: 'XXXX-XXXX-1098',
    method: 'DigiLocker Verified',
    submittedAt: '10 Mins Ago',
    aiScore: 68,
    status: 'PENDING_REVIEW', // PENDING_REVIEW, APPROVED, REJECTED
    flagReason: '68% Face Match (Lighting/Ageing Difference)',
    aadhaarPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    liveSelfie: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rentalOrder: 'RENT-2025-0841 (Canon EOS R6 Mark II)',
  },
  {
    id: 'kyc_102',
    customerName: 'Sneha Krishnan',
    email: 'sneha@designco.com',
    phone: '+91 98123 45678',
    aadhaarNumber: 'XXXX-XXXX-5421',
    method: 'Manual Document Upload',
    submittedAt: '25 Mins Ago',
    aiScore: 88,
    status: 'APPROVED',
    flagReason: '88% High Match - Auto Approved',
    aadhaarPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    liveSelfie: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    rentalOrder: 'RENT-2025-0839 (DeWALT Drill Kit)',
  },
  {
    id: 'kyc_103',
    customerName: 'Rahul Verma',
    email: 'rahul.verma@gmail.com',
    phone: '+91 97111 22334',
    aadhaarNumber: 'XXXX-XXXX-9901',
    method: 'Manual Document Upload',
    submittedAt: '1 Hour Ago',
    aiScore: 42,
    status: 'REJECTED',
    flagReason: '42% Match - Identity Photo Mismatch',
    aadhaarPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    liveSelfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rentalOrder: 'RENT-2025-0832 (JBL PA Speaker)',
  },
];

export default function AdminKycPage() {
  const [queue, setQueue] = useState(MOCK_KYC_QUEUE);
  const [filter, setFilter] = useState<'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING_REVIEW');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Blurry photo / Low Resolution');

  const handleApprove = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'APPROVED' } : item))
    );
  };

  const handleReject = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'REJECTED' } : item))
    );
    setRejectingId(null);
  };

  const filteredQueue = filter === 'ALL' ? queue : queue.filter((item) => item.status === filter);

  return (
    <AdminAuthGate>
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 block mb-1">
              Operations Management
            </span>
            <h1 className="text-2xl font-black text-slate-900">KYC Verification Operations</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review side-by-side identity verification cards and approve or reject flagged rentals.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200">
          {[
            { id: 'PENDING_REVIEW', label: 'Pending Review 🟡', count: queue.filter((q) => q.status === 'PENDING_REVIEW').length },
            { id: 'APPROVED', label: 'Approved 🟢', count: queue.filter((q) => q.status === 'APPROVED').length },
            { id: 'REJECTED', label: 'Rejected 🔴', count: queue.filter((q) => q.status === 'REJECTED').length },
            { id: 'ALL', label: 'All Records', count: queue.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                filter === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Queue Items List */}
        <div className="space-y-6">
          {filteredQueue.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold text-slate-600">No KYC records in this queue</p>
            </div>
          ) : (
            filteredQueue.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{item.customerName}</h3>
                      <span className="text-xs text-slate-500 font-mono">({item.aadhaarNumber})</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Order: <strong className="text-brand-700 font-mono">{item.rentalOrder}</strong> • Submitted {item.submittedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      AI Score: {item.aiScore}%
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Face Comparison Frame */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left: Govt ID Photo */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Government ID Photo</span>
                      <span className="text-[10px] text-slate-400">{item.method}</span>
                    </div>
                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-white border border-slate-200">
                      <img src={item.aadhaarPhoto} alt="ID Photo" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Right: Live Selfie Capture */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Live Customer Selfie</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Webcam Live Capture</span>
                    </div>
                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-white border border-slate-200">
                      <img src={item.liveSelfie} alt="Live Selfie" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* AI Warning / Flag Note */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center gap-2 text-xs text-amber-900 font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span><strong>System Flag Note:</strong> {item.flagReason}</span>
                </div>

                {/* Action Buttons */}
                {item.status === 'PENDING_REVIEW' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setRejectingId(item.id)}
                      className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition"
                    >
                      Reject Verification
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Unlock Rental Order
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">Reject KYC Verification</h3>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select Rejection Reason</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none"
              >
                <option>Blurry photo / Low Resolution</option>
                <option>Facial Mismatch</option>
                <option>Expired Government ID</option>
                <option>Suspicious Document Alteration</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminAuthGate>
  );
}

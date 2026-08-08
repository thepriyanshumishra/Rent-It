import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, FileText, ExternalLink, ChevronRight, Eye, Layers
} from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';

const PRESET_REJECTION_PILLS = [
  "Purchase Bill Mismatch / Invalid GST Invoice",
  "Physical Wear & Tear Exceeds HQ Standard",
  "Equipment Photos Blurry or Missing Accessories",
  "Serial Number Anti-Counterfeit Check Failed",
  "Daily Rate / Security Deposit Out of Market Range",
  "Item Not Received at HQ for Physical Testing"
];

export default function ListingRequestsPage() {
  const queryClient = useQueryClient();
  const [selectedReq, setSelectedReq] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');



  // Stock Quantity Controls for Partial Approvals
  const [approvedQuantity, setApprovedQuantity] = useState(1);
  const [rejectedQuantity, setRejectedQuantity] = useState(0);

  // Sync state whenever a request is opened in the inspection modal
  useEffect(() => {
    if (!selectedReq) return;
    const totalQty = Number(selectedReq.quantity) || 1;
    const isAlreadyProcessed = selectedReq.status === 'APPROVED' || selectedReq.status === 'PARTIALLY_APPROVED' || selectedReq.status === 'REJECTED';
    
    // Default to 0 Approved for new pending requests so admin explicitly approves or clicks "Approve All"
    const initialApproved = isAlreadyProcessed ? (selectedReq.approved_quantity ?? 0) : 0;
    const initialRejected = totalQty - initialApproved;

    setApprovedQuantity(initialApproved);
    setRejectedQuantity(initialRejected);
    setRejectionReason(selectedReq.rejection_reason || '');
    setActivePhotoIdx(0);
  }, [selectedReq]);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-listing-requests'],
    queryFn: async () => {
      const { data } = await api.get('/listing-requests/');
      return data.results || data || [];
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approvedQty, rejectedQty, reason }) => {
      return api.post(`/listing-requests/${id}/approve/`, {
        approved_quantity: approvedQty,
        rejected_quantity: rejectedQty,
        rejection_reason: reason
      });
    },
    onSuccess: () => {
      toast.success('Listing quality check processed and updated on storefront!');
      queryClient.invalidateQueries(['admin-listing-requests']);
      queryClient.invalidateQueries(['admin-inventory-products']);
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['products']);
      setSelectedReq(null);
    },
    onError: () => {
      toast.error('Failed to process listing approval.');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      return api.post(`/listing-requests/${id}/reject/`, { rejection_reason: reason });
    },
    onSuccess: () => {
      toast.success('Listing request rejected with feedback.');
      queryClient.invalidateQueries(['admin-listing-requests']);
      setShowRejectModal(false);
      setSelectedReq(null);
    },
    onError: () => {
      toast.error('Failed to reject listing request.');
    }
  });

  const handleOpenDetail = (req) => {
    setSelectedReq(req);
    setActivePhotoIdx(0);
    const totalQty = req.quantity || 1;
    const isAlreadyProcessed = req.status === 'APPROVED' || req.status === 'PARTIALLY_APPROVED' || req.status === 'REJECTED';
    const initialApproved = isAlreadyProcessed ? (req.approved_quantity ?? totalQty) : totalQty;
    const initialRejected = isAlreadyProcessed ? (req.rejected_quantity ?? 0) : 0;

    setApprovedQuantity(initialApproved);
    setRejectedQuantity(initialRejected);
    setRejectionReason(req.rejection_reason || '');
  };

  const handlePillClick = (pillText) => {
    setRejectionReason((prev) => {
      if (!prev) return pillText;
      if (prev.includes(pillText)) return prev;
      return `${prev}\n• ${pillText}`;
    });
  };

  const handleApprovedQtyChange = (val, maxTotal) => {
    const appQty = Math.max(0, Math.min(val, maxTotal));
    setApprovedQuantity(appQty);
    setRejectedQuantity(maxTotal - appQty);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="card p-6 border border-[var(--border)] bg-[var(--bg-elevated)] flex flex-wrap justify-between items-center gap-4 rounded-2xl shadow-xs">
        <div>
          <span className="badge badge-info mb-1.5 font-bold uppercase tracking-wider text-[10px]">
            HQ Quality Control Portal
          </span>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Renter Listing Verification & Inspection</h2>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
            Review submitted listing requests and approve items for live storefront listing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)]">
            Pending Reviews: <span className="text-[var(--accent)] font-black text-sm ml-1">{requests?.filter(r => r.status !== 'APPROVED' && r.status !== 'PARTIALLY_APPROVED')?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Requests Table Card */}
      <div className="card border border-[var(--border)] p-6 rounded-2xl shadow-xs">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-[var(--text-muted)] font-medium">Loading listing requests...</div>
        ) : requests?.length === 0 ? (
          <div className="text-center py-16 text-sm text-[var(--text-muted)] font-medium">No listing requests pending review.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="pb-3.5 font-extrabold">Equipment Details</th>
                  <th className="pb-3.5 font-extrabold">Submitted Stock</th>
                  <th className="pb-3.5 font-extrabold">Daily Rate</th>
                  <th className="pb-3.5 font-extrabold">Tax Invoice</th>
                  <th className="pb-3.5 font-extrabold">HQ Status</th>
                  <th className="pb-3.5 font-extrabold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {requests?.map((req) => (
                  <tr 
                    key={req.id} 
                    onClick={() => handleOpenDetail(req)}
                    className="hover:bg-[var(--bg-subtle)]/70 transition-all cursor-pointer group"
                  >
                    <td className="py-4 font-extrabold text-[var(--text)]">
                      <div className="flex items-center gap-3.5">
                        {req.image_url ? (
                          <img src={req.image_url} alt={req.product_name} className="w-12 h-12 rounded-xl object-cover border border-[var(--border)] shrink-0 group-hover:border-[var(--accent)] transition-all shadow-xs" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0 shadow-xs">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="group-hover:text-[var(--accent)] transition-colors flex items-center gap-1.5 font-bold">
                            {req.product_name} <Eye size={14} className="opacity-0 group-hover:opacity-100 text-[var(--accent)] transition-opacity" />
                          </div>
                          <span className="text-[11px] text-[var(--text-muted)] font-medium block mt-0.5">{req.category_name || 'General'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-[var(--text)]">
                      <div className="flex items-center gap-1.5">
                        <Layers size={14} className="text-[var(--text-muted)]" /> {req.quantity || 1} Unit(s)
                      </div>
                      {req.approved_quantity > 0 && req.status !== 'PENDING_VERIFICATION' && (
                        <span className="text-[10px] text-[var(--success)] font-bold block">
                          {req.approved_quantity} Approved {req.rejected_quantity > 0 && `/ ${req.rejected_quantity} Rejected`}
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-bold text-[var(--text)]">
                      ₹{Number(req.daily_price).toLocaleString()}
                      <span className="block text-[10px] text-[var(--accent)] font-bold mt-0.5">
                        60%: ₹{(Number(req.daily_price) * 0.6).toFixed(0)}
                      </span>
                    </td>
                    <td className="py-4" onClick={(e) => e.stopPropagation()}>
                      {req.purchase_bill_url ? (
                        <a 
                          href={req.purchase_bill_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline bg-[var(--accent-subtle)] px-2.5 py-1 rounded-lg"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Invoice <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--danger)] font-bold">No Invoice</span>
                      )}
                    </td>
                    <td className="py-4">
                      {req.status === 'APPROVED' && (
                        <div className="space-y-0.5">
                          <span className="badge badge-success font-bold">Approved & Live ({req.approved_quantity || 1})</span>
                        </div>
                      )}
                      {req.status === 'PARTIALLY_APPROVED' && (
                        <div className="space-y-0.5">
                          <span className="badge badge-info font-bold">Partially Approved ({req.approved_quantity} Approved / {req.rejected_quantity} Rejected)</span>
                        </div>
                      )}
                      {req.status === 'PENDING_VERIFICATION' && <span className="badge badge-warning font-bold">Pending HQ Check</span>}
                      {req.status === 'INSPECTION_SCHEDULED' && <span className="badge badge-info font-bold">HQ Testing</span>}
                      {req.status === 'REJECTED' && <span className="badge badge-danger font-bold">Rejected</span>}
                    </td>
                    <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenDetail(req)}
                        className="btn-outline py-1.5 px-3 text-xs font-bold rounded-lg flex items-center gap-1 ml-auto border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-all"
                      >
                        Inspect Gear <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MINIMAL ENTERPRISE EQUIPMENT INSPECTION MODAL */}
      {selectedReq && !showRejectModal && (
        <Modal 
          isOpen={!!selectedReq} 
          onClose={() => setSelectedReq(null)} 
          title=""
          size="5xl"
        >
          <div className="space-y-5 -mt-2">
            
            {/* Modal Header */}
            <div className="flex flex-wrap justify-between items-start border-b border-[var(--border)] pb-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-info text-[10px] font-bold uppercase tracking-wider">
                    {selectedReq.category_name || 'General Equipment'}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    Submitted {new Date(selectedReq.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">{selectedReq.product_name}</h3>
                
                {/* Renter Profile Line */}
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <span className="font-bold text-[var(--text)]">Renter: {selectedReq.renter_username}</span>
                  <span className="text-[var(--text-muted)]">({selectedReq.renter_email})</span>
                  <span className="text-[var(--accent)] font-bold">• 60% Revenue Share Partner</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {selectedReq.status === 'APPROVED' && <span className="badge badge-success text-xs py-1 px-3 font-bold">Approved & Live</span>}
                {selectedReq.status === 'PARTIALLY_APPROVED' && <span className="badge badge-info text-xs py-1 px-3 font-bold">Partially Approved</span>}
                {selectedReq.status === 'PENDING_VERIFICATION' && <span className="badge badge-warning text-xs py-1 px-3 font-bold">Pending HQ Check</span>}
                {selectedReq.status === 'REJECTED' && <span className="badge badge-danger text-xs py-1 px-3 font-bold">Rejected</span>}
              </div>
            </div>

            {/* 2-Column Grid Layout */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Photo Gallery & Invoice Proof (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Photo Viewer */}
                <div className="card p-3.5 border border-[var(--border)] bg-[var(--bg-subtle)]/50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Uploaded Photos ({selectedReq.images_data?.length || (selectedReq.image_url ? 1 : 0)})
                    </span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">
                      {activePhotoIdx === 0 ? 'Primary Cover' : `Photo ${activePhotoIdx + 1}`}
                    </span>
                  </div>

                  {selectedReq.images_data && selectedReq.images_data.length > 0 ? (
                    <div className="space-y-2.5">
                      <div className="w-full h-64 rounded-xl overflow-hidden border border-[var(--border)] bg-black/90 relative">
                        <img 
                          src={selectedReq.images_data[activePhotoIdx] || selectedReq.image_url} 
                          alt={selectedReq.product_name} 
                          className="w-full h-full object-contain"
                        />
                        {activePhotoIdx === 0 && (
                          <span className="absolute top-2.5 left-2.5 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                            Cover Image
                          </span>
                        )}
                      </div>

                      {/* Thumbnail List */}
                      {selectedReq.images_data.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {selectedReq.images_data.map((url, i) => (
                            <button
                              key={i}
                              onClick={() => setActivePhotoIdx(i)}
                              className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                                activePhotoIdx === i 
                                  ? 'border-[var(--accent)] scale-105' 
                                  : 'border-[var(--border)] opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={url} alt={`Thumb ${i+1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : selectedReq.image_url ? (
                    <div className="w-full h-64 rounded-xl overflow-hidden border border-[var(--border)] bg-black/90">
                      <img src={selectedReq.image_url} alt={selectedReq.product_name} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-[var(--bg-elevated)] rounded-xl text-xs text-[var(--text-muted)] font-medium">
                      No photos uploaded.
                    </div>
                  )}
                </div>

                {/* Tax Invoice Proof Document Card */}
                <div className="card p-3.5 border border-[var(--border)] bg-[var(--bg-elevated)] rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Tax Invoice Proof
                    </span>
                    <span className="text-[10px] text-[var(--success)] font-bold uppercase">
                      Verified Bill
                    </span>
                  </div>

                  {selectedReq.purchase_bill_url ? (
                    <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] space-y-2">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-[var(--accent)] shrink-0" />
                        <div>
                          <span className="font-bold text-xs text-[var(--text)] block">Purchase Bill Attached</span>
                          <span className="text-[10px] text-[var(--text-muted)]">Native Server Stored File</span>
                        </div>
                      </div>
                      <a
                        href={selectedReq.purchase_bill_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline py-2 px-3 text-xs font-bold w-full justify-center flex items-center gap-1.5 rounded-lg"
                      >
                        <ExternalLink size={14} /> Open Invoice Document
                      </a>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold text-center">
                      Mandatory Purchase Invoice Missing
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Financials, Stock Quantities, Condition & Actions (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Financial Overview Grid Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="card p-3.5 border border-[var(--border)] bg-[var(--bg-subtle)] rounded-xl">
                    <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">Daily Rate</span>
                    <p className="text-lg font-black text-[var(--text)] mt-0.5">₹{Number(selectedReq.daily_price).toLocaleString()}</p>
                  </div>

                  <div className="card p-3.5 border border-[var(--accent)]/30 bg-[var(--accent-subtle)]/40 rounded-xl">
                    <span className="text-[10px] font-extrabold text-[var(--accent)] uppercase tracking-wider block">60% Renter Payout</span>
                    <p className="text-lg font-black text-[var(--accent)] mt-0.5">₹{(Number(selectedReq.daily_price) * 0.6).toFixed(0)}/day</p>
                  </div>

                  <div className="card p-3.5 border border-[var(--border)] bg-[var(--bg-subtle)] rounded-xl">
                    <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block">Security Deposit</span>
                    <p className="text-lg font-black text-[var(--text)] mt-0.5">₹{Number(selectedReq.security_deposit).toLocaleString()}</p>
                  </div>
                </div>

                {/* MULTI-UNIT STOCK APPROVAL QUANTITY CONTROL BOARD */}
                <div className="card p-3.5 border border-[var(--border)] bg-[var(--bg-elevated)] rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={15} className="text-[var(--text-muted)]" /> Submitted Stock Quantity
                    </span>
                    <span className="text-xs font-extrabold text-[var(--text)]">
                      Total: {selectedReq.quantity || 1} Unit(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-0.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Approved Units
                        </label>
                        <button
                          type="button"
                          onClick={() => handleApprovedQtyChange(selectedReq.quantity || 1, selectedReq.quantity || 1)}
                          className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 transition-colors uppercase tracking-wider"
                        >
                          Approve All
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={selectedReq.quantity || 1}
                          value={approvedQuantity}
                          onChange={(e) => handleApprovedQtyChange(Number(e.target.value), selectedReq.quantity || 1)}
                          className="input-field py-1 text-sm font-black text-emerald-600 dark:text-emerald-400 w-20"
                        />
                        <span className="text-xs font-medium text-[var(--text-muted)]">/ {selectedReq.quantity || 1} Units</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                          Rejected Units
                        </label>
                        <button
                          type="button"
                          onClick={() => handleApprovedQtyChange(0, selectedReq.quantity || 1)}
                          className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-500/30 transition-colors uppercase tracking-wider"
                        >
                          Reject All
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          readOnly
                          value={rejectedQuantity}
                          className="input-field py-1 text-sm font-black text-red-600 dark:text-red-400 w-20 bg-transparent cursor-not-allowed"
                        />
                        <span className="text-xs font-medium text-[var(--text-muted)]">Withheld</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Description */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Equipment Description
                  </span>
                  <div className="card p-3 border border-[var(--border)] bg-[var(--bg-subtle)]/60 text-xs text-[var(--text)] leading-relaxed rounded-xl max-h-28 overflow-y-auto font-medium">
                    {selectedReq.description || selectedReq.short_description || 'No description provided.'}
                  </div>
                </div>

                {/* Notes (What's included in the box) */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                    <span>Notes</span>
                    <span className="text-[var(--text-muted)] font-normal capitalize">(what's included in the box)</span>
                  </span>
                  <div className="card p-3 border border-[var(--border)] bg-[var(--bg-subtle)]/60 text-xs text-[var(--text)] leading-relaxed rounded-xl max-h-28 overflow-y-auto font-medium">
                    {selectedReq.included_items || selectedReq.condition_notes || 'No included accessories specified.'}
                  </div>
                </div>

                <div className="card p-4 border border-[var(--border)] bg-[var(--bg-elevated)] rounded-2xl space-y-3.5 shadow-xs">

                  {/* PARTIAL REJECTION FEEDBACK REASON (Only shown when rejectedQuantity > 0) */}
                  {rejectedQuantity > 0 && (
                    <div className="pt-2 space-y-2 border-t border-[var(--border)]">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          Reason for Withholding {rejectedQuantity} Unit(s)
                        </label>
                      </div>

                      {/* Quick Select Presets Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_REJECTION_PILLS.map((pill, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePillClick(pill)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--bg-subtle)] hover:bg-[var(--accent-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border)] transition-all text-left"
                          >
                            {pill}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Specify reason for rejecting some units (e.g. 2 units failed serial check)..."
                        className="input-field py-2 text-xs font-medium resize-none"
                      />
                    </div>
                  )}

                  {/* Minimal Premium Action Buttons */}
                  <div className="flex items-center justify-between pt-2 gap-3 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      className="btn-outline py-2.5 px-4 text-xs font-extrabold text-[var(--danger)] hover:bg-red-500/10 shrink-0 rounded-xl border-red-500/20"
                    >
                      Reject Full Request
                    </button>

                    <Button
                      onClick={() => approveMutation.mutate({
                        id: selectedReq.id,
                        approvedQty: approvedQuantity,
                        rejectedQty: rejectedQuantity,
                        reason: rejectionReason
                      })}
                      disabled={approveMutation.isLoading || approvedQuantity === 0}
                      className="btn-primary py-2.5 px-5 text-xs font-extrabold flex-1 justify-center rounded-xl"
                    >
                      {approveMutation.isLoading ? 'Processing...' : (
                        approvedQuantity === selectedReq.quantity 
                          ? `Approve & Publish ${approvedQuantity} Unit(s)` 
                          : `Process Partial Approval (${approvedQuantity} Approved / ${rejectedQuantity} Rejected)`
                      )}
                    </Button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </Modal>
      )}

      {/* FULL REJECTION MODAL WITH PRESET PILLS (Triggered ONLY on Reject click) */}
      {showRejectModal && selectedReq && (
        <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Equipment Listing Request">
          <div className="space-y-4 pt-2">
            <p className="text-xs text-[var(--text-muted)] font-medium">
              Specify the reason for rejecting <strong>{selectedReq.product_name}</strong>. This feedback will be sent directly to renter <strong>{selectedReq.renter_username}</strong>.
            </p>

            {/* Quick Select Presets Pills */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Quick Select Rejection Reasons:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_REJECTION_PILLS.map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePillClick(pill)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--accent-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border)] transition-all text-left"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Detailed Rejection Feedback Message *
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Click quick select pills above or write custom inspection feedback reason..."
                className="input-field resize-none text-xs font-medium"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button 
                onClick={() => rejectMutation.mutate({ id: selectedReq.id, reason: rejectionReason })}
                disabled={rejectMutation.isLoading || !rejectionReason.trim()}
                className="bg-[var(--danger)] text-white hover:opacity-90 font-bold"
              >
                Confirm & Send Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

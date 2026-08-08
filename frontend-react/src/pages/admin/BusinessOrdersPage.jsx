import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Phone, Mail, Calendar, CheckCircle2, Clock, XCircle, Search, Filter } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const BusinessOrdersPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-business-orders'],
    queryFn: async () => {
      const res = await api.get('/quotations/business-orders/');
      return res.data.results || res.data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return api.patch(`/quotations/business-orders/${id}/`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-business-orders']);
    },
  });

  const handleStatusChange = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">PENDING REVIEW</Badge>;
      case 'CONTACTED':
        return <Badge variant="info">CONTACTED</Badge>;
      case 'CONVERTED':
        return <Badge variant="success">CONVERTED TO RENTAL</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <h2 className="text-2xl font-black text-[var(--text)] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[var(--accent)]" /> B2B Business Orders
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Manage bulk equipment inquiries, company quotations, and corporate leads
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by company, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="CONTACTED">Contacted</option>
          <option value="CONVERTED">Converted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--text)] mb-1">No Business Orders Found</h3>
          <p className="text-sm text-[var(--text-muted)]">
            Submissions from the /businesses bulk order form will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="card p-6 border border-[var(--border)] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[var(--border)] pb-3">
                <div>
                  <h3 className="text-lg font-black text-[var(--text)]">{order.company_name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Submitted on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Contact Person</span>
                  <p className="font-semibold text-[var(--text)]">{order.contact_name}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1">
                    <Mail className="w-3.5 h-3.5" /> {order.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-0.5">
                    <Phone className="w-3.5 h-3.5" /> {order.phone}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Required Equipment</span>
                  <p className="text-xs text-[var(--text)] font-mono bg-[var(--bg-subtle)] p-2.5 rounded-xl mt-1 border border-[var(--border)]">
                    {order.equipment_needed}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Logistics & Terms</span>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Duration: <strong className="text-[var(--text)]">{order.duration || 'N/A'}</strong></p>
                  {order.start_date && <p className="text-xs text-[var(--text-secondary)]">Start Date: <strong className="text-[var(--text)]">{order.start_date}</strong></p>}
                  {order.estimated_budget && <p className="text-xs text-[var(--text-secondary)]">Est. Budget: <strong className="text-[var(--accent)]">{order.estimated_budget}</strong></p>}
                </div>
              </div>

              {order.notes && (
                <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] p-2.5 rounded-xl">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}

              {/* Status Action Toolbar */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <span className="text-xs font-bold text-[var(--text-muted)] mr-2">Update Status:</span>
                <button
                  onClick={() => handleStatusChange(order.id, 'CONTACTED')}
                  disabled={order.status === 'CONTACTED'}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 disabled:opacity-50"
                >
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleStatusChange(order.id, 'CONVERTED')}
                  disabled={order.status === 'CONVERTED'}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  Mark Converted
                </button>
                <button
                  onClick={() => handleStatusChange(order.id, 'REJECTED')}
                  disabled={order.status === 'REJECTED'}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-50"
                >
                  Reject Inquiry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessOrdersPage;

import React, { useState } from 'react';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import PriceDisplay from '../ui/PriceDisplay';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

export default function DepositTable({ deposits = [], loading = false, onSettle }) {
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [lateFee, setLateFee] = useState(0);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'held': return 'warning';
      case 'released': return 'success';
      case 'forfeited': return 'danger';
      case 'partially_released': return 'info';
      default: return 'default';
    }
  };

  const handleSettleClick = (deposit) => {
    setSelectedDeposit(deposit);
    setLateFee(0);
    setSettleModalOpen(true);
  };

  const handleConfirmSettle = () => {
    if (onSettle && selectedDeposit) {
      onSettle(selectedDeposit.id, {
        late_fee: lateFee,
        refund_amount: Math.max(0, selectedDeposit.amount - lateFee)
      });
    }
    setSettleModalOpen(false);
  };

  const columns = [
    {
      header: 'Deposit ID',
      accessor: 'id',
      cell: (row) => <span className="font-mono text-xs">{row.id.substring(0,8)}</span>
    },
    {
      header: 'Order #',
      accessor: 'order_id',
      cell: (row) => <span className="font-medium">{row.orderNumber}</span>
    },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row) => <span className="text-sm">{row.customerName}</span>
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (row) => <PriceDisplay amount={row.amount} className="font-medium" />
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        row.status === 'held' ? (
          <Button variant="outline" size="sm" onClick={() => handleSettleClick(row)}>
            Settle
          </Button>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">Settled</span>
        )
      )
    }
  ];

  const refundAmount = selectedDeposit ? Math.max(0, selectedDeposit.amount - lateFee) : 0;

  return (
    <>
      <DataTable
        columns={columns}
        data={deposits}
        loading={loading}
        emptyMessage="No deposits found."
      />

      <Modal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        title="Settle Deposit"
      >
        {selectedDeposit && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-subtle)] p-4 rounded-lg flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Original Deposit:</span>
              <PriceDisplay amount={selectedDeposit.amount} className="font-bold text-lg" />
            </div>

            <Input 
              label="Late Fee / Deductions (₹)" 
              type="number" 
              min="0" 
              max={selectedDeposit.amount}
              value={lateFee}
              onChange={(e) => setLateFee(Number(e.target.value))}
            />

            <div className="bg-[var(--accent-subtle)] p-4 rounded-lg flex justify-between items-center border border-[var(--accent)]/20">
              <span className="text-[var(--accent)] font-medium">Refund Amount:</span>
              <PriceDisplay amount={refundAmount} className="font-bold text-xl text-[var(--accent)]" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
              <Button variant="outline" onClick={() => setSettleModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmSettle}>Confirm Settlement</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

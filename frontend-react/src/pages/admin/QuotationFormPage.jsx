import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import QuotationForm from '../../components/admin/QuotationForm';

export default function QuotationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id && id !== 'new';

  const handleSave = async (data) => {
    console.log('Saved quote', data);
    navigate('/admin/quotations');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link to="/admin/quotations" className="p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">{isEditing ? `Quotation #${id}` : 'New Quotation'}</h2>
          <p className="text-sm text-[var(--text-muted)]">Create a custom quote for a customer.</p>
        </div>
      </div>

      <QuotationForm onSave={handleSave} onCancel={() => navigate('/admin/quotations')} />
    </div>
  );
}

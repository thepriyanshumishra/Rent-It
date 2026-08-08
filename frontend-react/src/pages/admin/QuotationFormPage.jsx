import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import QuotationForm from '../../components/admin/QuotationForm';
import { toast } from '../../components/ui/Toast';
import { api } from '../../api';
import Spinner from '../../components/ui/Spinner';

export default function QuotationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id && id !== 'new';

  const [existingQuotation, setExistingQuotation] = useState(null);
  const [loadingQuotation, setLoadingQuotation] = useState(isEditing);

  // Fetch existing quotation when editing
  useEffect(() => {
    if (!isEditing) return;
    setLoadingQuotation(true);
    api.get(`/quotations/quotations/${id}/`)
      .then((res) => setExistingQuotation(res.data))
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to load quotation.', type: 'error' });
        navigate('/admin/quotations');
      })
      .finally(() => setLoadingQuotation(false));
  }, [id, isEditing, navigate]);

  const handleSave = async (data) => {
    try {
      if (isEditing) {
        await api.patch(`/quotations/quotations/${id}/`, data);
      } else {
        await api.post('/quotations/quotations/', data);
      }
      toast({
        title: 'Success',
        description: `Quotation ${isEditing ? 'updated' : 'created'} successfully.`,
        type: 'success',
      });
      navigate('/admin/quotations');
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        Object.values(err?.response?.data || {})?.[0]?.[0] ||
        'Failed to save quotation.';
      toast({ title: 'Error', description: detail, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/quotations"
          className="p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">
            {isEditing ? `Quotation #${id}` : 'New Quotation'}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {isEditing ? 'Update this quotation.' : 'Create a custom quote for a customer.'}
          </p>
        </div>
      </div>

      {loadingQuotation ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <QuotationForm
          quotation={existingQuotation}
          onSave={handleSave}
          onCancel={() => navigate('/admin/quotations')}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ProductForm from '../../components/admin/ProductForm';
import { toast } from '../../components/ui/Toast';
import { api } from '../../api';
import Spinner from '../../components/ui/Spinner';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;

  // Determine context — vendor portal vs admin portal
  const isVendorContext = location.pathname.startsWith('/vendor');
  const backPath = isVendorContext ? '/vendor/listings' : '/admin/products';

  const [existingProduct, setExistingProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(isEditing);

  // Fetch existing product data when editing
  useEffect(() => {
    if (!isEditing) return;
    setLoadingProduct(true);
    api.get(`/products/${id}/`)
      .then((res) => setExistingProduct(res.data))
      .catch(() => {
        toast.error('Failed to load product.');
        navigate(backPath);
      })
      .finally(() => setLoadingProduct(false));
  }, [id, isEditing, navigate, backPath]);

  const handleSave = async (data) => {
    try {
      if (isEditing) {
        await api.patch(`/products/${id}/`, data);
      } else {
        await api.post('/products/', data);
      }
      toast.success(`Product successfully ${isEditing ? 'updated' : 'created'}.`);
      navigate(backPath);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        Object.values(err?.response?.data || {})?.[0]?.[0] ||
        'Failed to save product.';
      toast.error(detail);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link
          to={backPath}
          className="p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {isEditing ? 'Update the product details below.' : 'Fill in the details below to publish your product.'}
          </p>
        </div>
      </div>

      {loadingProduct ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <ProductForm
          product={existingProduct}
          onSave={handleSave}
          onCancel={() => navigate(backPath)}
        />
      )}
    </div>
  );
}


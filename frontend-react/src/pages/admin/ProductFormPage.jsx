import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ProductForm from '../../components/admin/ProductForm';
import { toast } from '../../components/ui/Toast';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Ideally fetch product data if isEditing...

  const handleSave = async (data) => {
    try {
      // Simulate API call
      console.log('Saving product:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: `Product successfully ${isEditing ? 'updated' : 'created'}.`,
        type: 'success'
      });
      navigate('/admin/products');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save product.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link to="/admin/products" className="p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">{isEditing ? 'Edit Product' : 'Create New Product'}</h2>
          <p className="text-sm text-[var(--text-muted)]">Fill in the details below to publish your product.</p>
        </div>
      </div>

      <ProductForm 
        product={null} // Pass fetched product here if editing
        onSave={handleSave}
        onCancel={() => navigate('/admin/products')}
      />
    </div>
  );
}

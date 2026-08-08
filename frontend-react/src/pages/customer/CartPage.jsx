import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import CartItem from '../../components/customer/CartItem';
import CartSummary from '../../components/customer/CartSummary';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import useCart from '../../hooks/useCart';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeItem, updateItem, loading } = useCart();

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-text mb-8">Your Rental Cart</h1>
        
        {isEmpty ? (
          <div className="py-12">
            <EmptyState 
              icon={<ShoppingCart className="w-16 h-16 text-accent/50" />}
              title="Your rental cart is empty"
              description="Looks like you haven't selected any gear to rent yet."
              action={<Button size="lg" className="font-bold rounded-xl" onClick={() => navigate('/explore')}>Explore Available Gear</Button>}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-bg-elevated border border-border rounded-3xl p-6 shadow-sm">
                {cart.items.map(item => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    onRemove={removeItem} 
                    onUpdateQuantity={(id, newQty) => updateItem(id, { quantity: newQty })}
                  />
                ))}
              </div>
              <button 
                onClick={() => navigate('/explore')}
                className="text-sm text-accent hover:underline font-bold self-start transition-colors"
              >
                ← Continue Browsing Rentals
              </button>
            </div>
            
            <div className="lg:col-span-5">
              <CartSummary 
                cart={cart} 
                loading={loading} 
                onCheckout={() => navigate('/checkout')} 
              />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default CartPage;

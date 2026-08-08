import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  hideClose = false,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (typeof window === 'undefined') return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-[95vw] m-4',
  };

  const selectedSizeClass = sizeClasses[size] || (size.startsWith('max-w-') ? size : 'max-w-md');

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className={`card relative w-full ${selectedSizeClass} p-6 shadow-2xl flex flex-col max-h-[90vh] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
              {title && <h2 className="text-xl font-black text-[var(--text)] tracking-tight">{title}</h2>}
              {!hideClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors ml-auto border border-transparent hover:border-[var(--border)]"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1 -mx-2 px-2">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;

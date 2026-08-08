import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Drawer = ({
  isOpen,
  onClose,
  title,
  side = 'right',
  children,
  width = 'max-w-md',
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

  const slideDirection = side === 'right' ? { x: '100%' } : { x: '-100%' };
  const positionClasses = side === 'right' ? 'right-0' : 'left-0';

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-overlay/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={slideDirection}
            animate={{ x: 0 }}
            exit={slideDirection}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`fixed top-0 bottom-0 ${positionClasses} w-full ${width} bg-bg-elevated border-${side === 'right' ? 'l' : 'r'} border-border shadow-2xl flex flex-col`}
          >
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              {title && <h2 className="text-lg font-semibold text-text">{title}</h2>}
              <button
                onClick={onClose}
                className="p-2 rounded-md text-text-muted hover:text-text hover:bg-bg-subtle transition-colors ml-auto"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
};

export default Drawer;

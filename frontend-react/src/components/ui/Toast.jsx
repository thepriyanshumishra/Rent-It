import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

let toastCount = 0;
const listeners = new Set();

export const toast = {
  success: (message, options) => emit({ type: 'success', message, ...options }),
  error: (message, options) => emit({ type: 'error', message, ...options }),
  info: (message, options) => emit({ type: 'info', message, ...options }),
  warning: (message, options) => emit({ type: 'warning', message, ...options }),
};

const emit = (toastProps) => {
  const id = ++toastCount;
  listeners.forEach((listener) => listener({ id, ...toastProps }));
  return id;
};

export const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleAdd = (toastObj) => {
      setToasts((prev) => [...prev, toastObj]);
      if (toastObj.duration !== Infinity) {
        setTimeout(() => {
          remove(toastObj.id);
        }, toastObj.duration || 4000);
      }
    };
    listeners.add(handleAdd);
    return () => listeners.delete(handleAdd);
  }, []);

  const remove = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => remove(t.id)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

const ToastItem = ({ toast: t, onRemove }) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success" />,
    error: <XCircle className="h-5 w-5 text-danger" />,
    info: <Info className="h-5 w-5 text-info" />,
    warning: <AlertCircle className="h-5 w-5 text-warning" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      layout
      className="bg-bg-elevated border border-border shadow-lg rounded-lg p-4 pr-8 flex items-start gap-3 pointer-events-auto relative"
    >
      <div className="shrink-0 mt-0.5">{icons[t.type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text">{t.message}</p>
      </div>
      <button
        onClick={onRemove}
        className="absolute top-4 right-2 p-1 text-text-muted hover:text-text rounded"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

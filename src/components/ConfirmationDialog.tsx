import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'success' | 'warning';
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const getThemeClasses = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          iconBg: 'bg-red-50 border-red-100',
          btnConfirm: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 focus:ring-red-500'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
          iconBg: 'bg-emerald-50 border-emerald-100',
          btnConfirm: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-250 focus:ring-emerald-500'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          iconBg: 'bg-amber-50 border-amber-100',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200 focus:ring-amber-500'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-primary-wave" />,
          iconBg: 'bg-blue-50 border-blue-100',
          btnConfirm: 'bg-gradient-to-r from-primary-sunset to-orange-500 hover:opacity-95 text-white shadow-primary-sunset/20 focus:ring-primary-sunset'
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white rounded-2xl border border-slate-150 shadow-2xl p-6 max-w-md w-full relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top light glow border based on type */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
            type === 'danger' ? 'bg-red-500' :
            type === 'success' ? 'bg-emerald-500' :
            type === 'warning' ? 'bg-amber-500' : 'bg-primary-sunset'
          }`} />

          <div className="flex items-start space-x-4 mt-2">
            <div className={`w-10 h-10 flex-shrink-0 rounded-xl border flex items-center justify-center ${theme.iconBg}`}>
              {theme.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 leading-snug">{title}</h3>
              <p className="text-xs text-gray-500 font-semibold mt-2 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex justify-end items-center space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-gray-305 transition-all focus:outline-none"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md focus:outline-none ${theme.btnConfirm}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

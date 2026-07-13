import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export interface CancelPreorderTarget {
  id: string;
  items: string;
  when: string;
  /** Fee charged for cancelling this pre-order. 0 means cancellation is free. */
  fee: number;
}

interface Props {
  isOpen: boolean;
  order: CancelPreorderTarget | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelPreorderModal({ isOpen, order, onClose, onConfirm }: Props) {
  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <AlertTriangle size={17} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-lg text-primary leading-none">Cancel Pre-Order?</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{order.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600">
                You're about to cancel <span className="font-semibold text-gray-800">{order.items}</span>, scheduled for{' '}
                <span className="font-semibold text-gray-800">{order.when}</span>.
              </p>

              <div className={`rounded-xl p-4 border ${order.fee > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Cancellation Fee</p>
                <p className={`font-display text-2xl leading-none mt-1 ${order.fee > 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {order.fee > 0 ? `$${order.fee.toFixed(2)}` : 'Free'}
                </p>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {order.fee > 0
                    ? 'This amount will be charged for cancelling a confirmed pre-order.'
                    : 'No fee applies — this order has not been confirmed yet.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-white border border-gray-200 text-gray-700 text-sm font-bold px-4 py-2.5 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
              >
                Keep Order
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-red-500 text-white text-sm font-bold px-4 py-2.5 rounded-full hover:bg-red-600 active:scale-95 transition-transform"
                data-testid="button-confirm-cancel-preorder"
              >
                Yes, Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

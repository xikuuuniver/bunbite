import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, User, AtSign, Mail, Phone, Receipt } from 'lucide-react';
import type { AuthUser } from '@/context/AuthContext';
import type { UnpaidOrder } from '@/context/OrdersContext';
import type { PaymentSelection } from './PaymentMethodModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: () => void;
  user: AuthUser;
  orders: UnpaidOrder[];
  payment: PaymentSelection | null;
}

export default function OrderConfirmationModal({ isOpen, onClose, onBack, onConfirm, user, orders, payment }: Props) {
  const total = orders.reduce((s, o) => s + o.total, 0);
  const fullName = user.firstName || user.lastName
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : user.username;

  const paymentSummary = payment
    ? payment.card
      ? `${payment.methodLabel} •••• ${payment.card.number.slice(-4)}`
      : payment.methodLabel
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  aria-label="Back to payment method"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 className="font-display text-xl text-primary leading-none">Confirm Your Order</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Review the details before paying</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
              {/* Customer info */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Customer Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <User size={15} className="text-secondary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400">Full Name</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <AtSign size={15} className="text-secondary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400">Username</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <Mail size={15} className="text-secondary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400">Email Address</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{user.email ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <Phone size={15} className="text-secondary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400">Phone Number</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{user.phone ?? '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order list */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Order List</p>
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{order.items}</p>
                        <p className="text-[11px] text-gray-400">{order.id}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-700 shrink-0">${order.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              {payment && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/5 border border-secondary/20">
                  <Receipt size={15} className="text-secondary shrink-0" />
                  <p className="text-xs text-gray-700">Paying with <span className="font-bold">{paymentSummary}</span></p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400">Total Order Price</p>
                <p className="font-display text-2xl text-primary leading-none">${total.toFixed(2)}</p>
              </div>
              <button
                onClick={onConfirm}
                className="bg-secondary text-secondary-foreground text-sm font-bold px-7 py-3 rounded-full shadow-sm hover:brightness-105 active:scale-95 transition-transform"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, CreditCard, Banknote, Wallet } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = 'card' | 'cash' | 'paypal';

interface Payment {
  id: string;
  method: PaymentMethod;
  maskedCard?: string;
  amount: number;
  date: string;
  status: string;
}

const PAYMENTS: Payment[] = [
  { id: 'PAY-2841', method: 'card',   maskedCard: '**** **** **** 4821', amount: 32.50, date: 'Jul 10, 2026', status: 'Successful' },
  { id: 'PAY-2840', method: 'card',   maskedCard: '**** **** **** 4821', amount: 17.00, date: 'Jul 10, 2026', status: 'Successful' },
  { id: 'PAY-2791', method: 'cash',                                        amount: 12.00, date: 'Jul 9, 2026',  status: 'Successful' },
  { id: 'PAY-2655', method: 'card',   maskedCard: '**** **** **** 9034', amount: 26.00, date: 'Jul 8, 2026',  status: 'Successful' },
  { id: 'PAY-2412', method: 'paypal',                                      amount: 21.00, date: 'Jul 5, 2026',  status: 'Successful' },
  { id: 'PAY-2380', method: 'cash',                                        amount: 13.50, date: 'Jul 3, 2026',  status: 'Successful' },
  { id: 'PAY-2201', method: 'card',   maskedCard: '**** **** **** 4821', amount: 17.50, date: 'Jun 28, 2026', status: 'Successful' },
];

const METHOD_META: Record<PaymentMethod, { label: string; Icon: React.ElementType; color: string }> = {
  card:   { label: 'Credit Card', Icon: CreditCard, color: 'text-blue-500 bg-blue-50'   },
  cash:   { label: 'Cash',        Icon: Banknote,   color: 'text-green-500 bg-green-50' },
  paypal: { label: 'PayPal',      Icon: Wallet,     color: 'text-indigo-500 bg-indigo-50' },
};

export default function PaymentHistoryModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center">
                  <Receipt size={18} className="text-secondary" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-primary leading-none">Payment History</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{PAYMENTS.length} transactions</p>
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
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <div className="space-y-3">
                {PAYMENTS.map((payment) => {
                  const meta = METHOD_META[payment.method];
                  const Icon = meta.Icon;
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Method icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                        <Icon size={18} />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-semibold text-gray-900 text-sm">{payment.id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            {payment.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">{meta.label}</p>
                        {payment.maskedCard && (
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5 tracking-wider">
                            {payment.maskedCard}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-0.5">{payment.date}</p>
                      </div>

                      {/* Amount */}
                      <div className="shrink-0 text-right">
                        <p className="font-display text-lg text-primary">${payment.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">All transactions are encrypted</p>
              <p className="text-sm font-bold text-primary">
                Total paid: ${PAYMENTS.reduce((s, p) => s + p.amount, 0).toFixed(2)}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

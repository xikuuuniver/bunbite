import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, Wallet, Building2, Plus, Star, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type MethodType = 'visa' | 'mastercard' | 'visa-debit' | 'paypal' | 'bank';

interface PaymentMethodEntry {
  id: string;
  type: MethodType;
  label: string;
  detail: string;
  expiry?: string;
  isDefault: boolean;
}

const INITIAL_METHODS: PaymentMethodEntry[] = [
  { id: 'pm-1', type: 'visa',        label: 'Visa',          detail: '**** **** **** 4821', expiry: '08/28', isDefault: true  },
  { id: 'pm-2', type: 'mastercard',  label: 'Mastercard',    detail: '**** **** **** 9034', expiry: '03/27', isDefault: false },
  { id: 'pm-3', type: 'visa-debit',  label: 'Visa Debit',    detail: '**** **** **** 2211', expiry: '11/26', isDefault: false },
  { id: 'pm-4', type: 'paypal',      label: 'PayPal',        detail: 'user@bunbite.com',                    isDefault: false },
  { id: 'pm-5', type: 'bank',        label: 'Bank Account',  detail: 'IBAN ·· 7743',                        isDefault: false },
];

const TYPE_META: Record<MethodType, { Icon: React.ElementType; color: string; bg: string }> = {
  visa:       { Icon: CreditCard, color: 'text-blue-600',   bg: 'bg-blue-50'   },
  mastercard: { Icon: CreditCard, color: 'text-red-500',    bg: 'bg-red-50'    },
  'visa-debit':{ Icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  paypal:     { Icon: Wallet,     color: 'text-blue-500',   bg: 'bg-blue-50'   },
  bank:       { Icon: Building2,  color: 'text-green-600',  bg: 'bg-green-50'  },
};

export default function PaymentMethodsModal({ isOpen, onClose }: Props) {
  const [methods, setMethods] = useState<PaymentMethodEntry[]>(INITIAL_METHODS);
  const [removed, setRemoved]   = useState<string | null>(null);

  const setDefault = (id: string) =>
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));

  const remove = (id: string) => {
    setRemoved(id);
    setTimeout(() => {
      setMethods((prev) => prev.filter((m) => m.id !== id));
      setRemoved(null);
    }, 300);
  };

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
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center">
                  <CreditCard size={18} className="text-secondary" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-primary leading-none">Payment Methods</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{methods.length} saved method{methods.length !== 1 ? 's' : ''}</p>
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
                <AnimatePresence initial={false}>
                  {methods.map((method) => {
                    const meta = TYPE_META[method.type];
                    const Icon = meta.Icon;
                    return (
                      <motion.div
                        key={method.id}
                        initial={{ opacity: 1, height: 'auto' }}
                        animate={{ opacity: removed === method.id ? 0 : 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors
                          ${method.isDefault
                            ? 'border-secondary/40 bg-secondary/5'
                            : 'border-gray-100 hover:border-primary/20 hover:bg-gray-50/60'}`}
                      >
                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                          <Icon size={20} className={meta.color} />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-semibold text-gray-900 text-sm">{method.label}</span>
                            {method.isDefault && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-gray-500 tracking-wider">{method.detail}</p>
                          {method.expiry && (
                            <p className="text-[11px] text-gray-400 mt-0.5">Expires {method.expiry}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!method.isDefault && (
                            <button
                              onClick={() => setDefault(method.id)}
                              title="Set as default"
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/10 text-gray-300 hover:text-secondary transition-colors"
                            >
                              <Star size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => remove(method.id)}
                            title="Remove"
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">Tap <Star size={11} className="inline mb-0.5" /> to set a default method</p>
              <button className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-secondary/80 transition-colors">
                <Plus size={14} />
                Add new method
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Wallet, Smartphone, ShoppingCart, MoreHorizontal, Lock } from 'lucide-react';

export interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
}

export interface PaymentSelection {
  methodId: string;
  methodLabel: string;
  card?: CardDetails;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (selection: PaymentSelection) => void;
  totalAmount: number;
  orderCount: number;
}

type MethodId = 'visa' | 'mastercard' | 'univerpay' | 'googlepay' | 'applepay' | 'amazonpay' | 'other';

const METHODS: { id: MethodId; label: string; badge: JSX.Element }[] = [
  { id: 'visa',       label: 'Visa',        badge: <span className="text-white text-xs font-black italic tracking-wide">VISA</span> },
  { id: 'mastercard', label: 'Mastercard',  badge: (
      <span className="flex items-center">
        <span className="w-4 h-4 rounded-full bg-red-500/90 -mr-1.5" />
        <span className="w-4 h-4 rounded-full bg-orange-400/90" />
      </span>
    ) },
  { id: 'univerpay',  label: 'Univer Pay',  badge: <Wallet size={16} className="text-white" /> },
  { id: 'googlepay',  label: 'Google Pay',  badge: <Smartphone size={16} className="text-white" /> },
  { id: 'applepay',   label: 'Apple Pay',   badge: <Smartphone size={16} className="text-white" /> },
  { id: 'amazonpay',  label: 'Amazon Pay',  badge: <ShoppingCart size={16} className="text-white" /> },
  { id: 'other',      label: 'Other',       badge: <MoreHorizontal size={16} className="text-white" /> },
];

const METHOD_BG: Record<MethodId, string> = {
  visa:       'bg-gradient-to-br from-blue-600 to-blue-800',
  mastercard: 'bg-gradient-to-br from-gray-800 to-gray-950',
  univerpay:  'bg-gradient-to-br from-secondary to-orange-600',
  googlepay:  'bg-gradient-to-br from-slate-600 to-slate-800',
  applepay:   'bg-gradient-to-br from-gray-700 to-black',
  amazonpay:  'bg-gradient-to-br from-yellow-500 to-orange-600',
  other:      'bg-gradient-to-br from-gray-400 to-gray-600',
};

const CARD_METHODS: MethodId[] = ['visa', 'mastercard'];

function formatCardNumber(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function PaymentMethodModal({ isOpen, onClose, onContinue, totalAmount, orderCount }: Props) {
  const [selected, setSelected] = useState<MethodId | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvv, setCvv]               = useState('');
  const [errors, setErrors]         = useState<{ number?: string; expiry?: string; cvv?: string }>({});

  const reset = () => {
    setSelected(null); setCardNumber(''); setExpiry(''); setCvv(''); setErrors({});
  };

  const handleClose = () => { reset(); onClose(); };

  const validateCard = () => {
    const digits = cardNumber.replace(/\D/g, '');
    const errs: typeof errors = {};
    if (digits.length !== 16) errs.number = 'Enter a valid 16-digit card number.';
    const [mm, yy] = expiry.split('/');
    if (!mm || !yy || yy.length !== 2 || +mm < 1 || +mm > 12) errs.expiry = 'Enter a valid MM/YY date.';
    if (!/^\d{3,4}$/.test(cvv)) errs.cvv = 'Enter a valid CVV.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!selected) return;
    const methodMeta = METHODS.find((m) => m.id === selected)!;
    if (CARD_METHODS.includes(selected)) {
      if (!validateCard()) return;
      onContinue({
        methodId: selected,
        methodLabel: methodMeta.label,
        card: { number: cardNumber.replace(/\D/g, ''), expiry, cvv },
      });
    } else {
      onContinue({ methodId: selected, methodLabel: methodMeta.label });
    }
    reset();
  };

  const showCardFields = selected && CARD_METHODS.includes(selected);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center">
                  <Lock size={16} className="text-secondary" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-primary leading-none">Choose Payment Method</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {orderCount} order{orderCount !== 1 ? 's' : ''} · ${totalAmount.toFixed(2)} total
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelected(m.id); setErrors({}); }}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left
                      ${selected === m.id
                        ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20'
                        : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${METHOD_BG[m.id]}`}>
                      {m.badge}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Card fields */}
              <AnimatePresence>
                {showCardFields && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Card Number</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setErrors((er) => ({ ...er, number: undefined })); }}
                          className={`w-full px-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition font-mono tracking-wider
                            ${errors.number ? 'bg-red-50 border border-red-300 focus:ring-red-300/50' : 'bg-gray-100 border border-transparent focus:ring-orange-400/50 focus:bg-white'}`}
                        />
                        {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Expiration Date</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setErrors((er) => ({ ...er, expiry: undefined })); }}
                            className={`w-full px-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition font-mono
                              ${errors.expiry ? 'bg-red-50 border border-red-300 focus:ring-red-300/50' : 'bg-gray-100 border border-transparent focus:ring-orange-400/50 focus:bg-white'}`}
                          />
                          {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">CVV</label>
                          <input
                            type="password"
                            inputMode="numeric"
                            placeholder="•••"
                            maxLength={4}
                            value={cvv}
                            onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); setErrors((er) => ({ ...er, cvv: undefined })); }}
                            className={`w-full px-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition font-mono
                              ${errors.cvv ? 'bg-red-50 border border-red-300 focus:ring-red-300/50' : 'bg-gray-100 border border-transparent focus:ring-orange-400/50 focus:bg-white'}`}
                          />
                          {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400 flex items-center gap-1.5"><Lock size={12} /> Secured & encrypted</p>
              <button
                onClick={handleContinue}
                disabled={!selected}
                className="bg-secondary text-secondary-foreground text-sm font-bold px-6 py-2.5 rounded-full shadow-sm hover:brightness-105 active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onComplete: () => void;
}

const MESSAGES = [
  'Preparing your payment...',
  'Verifying payment details...',
  'Encrypting transaction...',
  'Contacting payment provider...',
  'Processing your payment...',
  'Confirming your order...',
  'Generating payment receipt...',
  'Finalizing transaction...',
  'Almost done...',
];

const FINAL_MESSAGE = 'Payment Successful!';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PaymentProcessingModal({ isOpen, onComplete }: Props) {
  const [sequence, setSequence]   = useState<string[]>([]);
  const [step, setStep]           = useState(0);
  const [done, setDone]           = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isOpen) return;
    const seq = shuffle(MESSAGES);
    setSequence(seq);
    setStep(0);
    setDone(false);

    let i = 0;
    const runStep = () => {
      const delay = 400 + Math.random() * 700; // 400–1100ms — random cadence
      timeoutRef.current = setTimeout(() => {
        i++;
        if (i < seq.length) {
          setStep(i);
          runStep();
        } else {
          setDone(true);
          timeoutRef.current = setTimeout(() => onCompleteRef.current(), 1400);
        }
      }, delay);
    };
    runStep();

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [isOpen]);

  const progress = sequence.length ? ((step + 1) / (sequence.length + 1)) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-primary/95 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative w-full max-w-sm rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-2xl px-8 py-10 flex flex-col items-center text-center overflow-hidden"
          >
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

            {/* Icon */}
            <div className="relative z-10 mb-6">
              <AnimatePresence mode="wait">
                {!done ? (
                  <motion.div
                    key="spinner"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="relative w-20 h-20 flex items-center justify-center"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-white/10"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-secondary"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <ShieldCheck size={28} className="text-secondary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 14 }}
                    >
                      <CheckCircle2 size={38} className="text-white" strokeWidth={2.4} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Message */}
            <div className="relative z-10 h-6 flex items-center justify-center w-full mb-5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={done ? FINAL_MESSAGE : sequence[step]}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className={`text-sm font-semibold ${done ? 'text-green-400' : 'text-white/90'}`}
                >
                  {done ? FINAL_MESSAGE : sequence[step]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="relative z-10 w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-secondary'}`}
                animate={{ width: `${done ? 100 : progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            <p className="relative z-10 text-[11px] text-white/40 mt-4">Do not close this window</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardList } from 'lucide-react';
import { useOrders } from '@/context/OrdersContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Orders that are already settled/in-flight — not affected by the live Unpaid Orders list. */
const HISTORY_ORDERS = [
  { id: '#BB-4821', items: '2x Cheesy Boom, 1x Fries',      total: 32.50, status: 'Processing', statusColor: 'bg-amber-100 text-amber-700',  date: 'Jul 10, 2026' },
  { id: '#BB-4790', items: '1x Smoky Burst, 1x Coke',        total: 17.00, status: 'Delivered',  statusColor: 'bg-blue-100 text-blue-700',    date: 'Jul 10, 2026' },
  { id: '#BB-4712', items: '1x Midnight Bite',               total: 12.00, status: 'Completed',  statusColor: 'bg-green-100 text-green-700',  date: 'Jul 9, 2026'  },
  { id: '#BB-4412', items: '1x Truffle Dream, 2x Classic Fries', total: 21.00, status: 'Completed', statusColor: 'bg-green-100 text-green-700', date: 'Jul 5, 2026' },
  { id: '#BB-4380', items: '3x Classic Fries',               total: 13.50, status: 'Completed',  statusColor: 'bg-green-100 text-green-700',  date: 'Jul 3, 2026'  },
  { id: '#BB-4210', items: '1x Spicy Bird, 1x Lemonade',     total: 17.50, status: 'Completed',  statusColor: 'bg-green-100 text-green-700',  date: 'Jun 28, 2026' },
];

export default function OrderHistoryModal({ isOpen, onClose }: Props) {
  const { unpaidOrders, removeUnpaidOrder } = useOrders();

  /** Unpaid orders are sourced live from context so removing one here also updates the Unpaid Orders popup and its counters. */
  const unpaidAsHistory = unpaidOrders.map((o) => ({
    id: o.id,
    items: o.items,
    total: o.total,
    status: 'Unpaid',
    statusColor: 'bg-red-100 text-red-600',
    date: o.time,
  }));
  const ORDERS = [...unpaidAsHistory, ...HISTORY_ORDERS];

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
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ClipboardList size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-primary leading-none">Order History</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{ORDERS.length} orders total</p>
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
                {ORDERS.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{order.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{order.items}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{order.date}</p>
                    </div>
                    <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
                      <p className="font-display text-lg text-primary">${order.total.toFixed(2)}</p>
                      {order.status === 'Unpaid' && (
                        <button
                          onClick={() => removeUnpaidOrder(order.id)}
                          className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove order ${order.id}`}
                          data-testid={`button-remove-history-${order.id}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">Showing all orders</p>
              <p className="text-sm font-bold text-primary">
                Total spent: ${ORDERS.filter(o => o.status !== 'Unpaid').reduce((s, o) => s + o.total, 0).toFixed(2)}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

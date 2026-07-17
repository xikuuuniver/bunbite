import { useEffect, useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { useLocation } from 'wouter';
import {
  X, Bug, Lightbulb, GitCommit, Loader2, CheckCircle,
  AlertTriangle, Camera, ChevronDown, ChevronUp,
  Plus, Minus, Clock, User, Tag, Layers,
} from 'lucide-react';

// ─── Changelog data ──────────────────────────────────────────────────────────

const CHANGELOG = [
  {
    version: '1.28.0',
    date: 'July 17, 2026',
    developer: 'BunBite Dev Team',
    commitId: 'a3f7d92',
    commitTitle: 'Beta launch — full storefront, dashboard & ordering system',
    description:
      'Initial public beta release of Bunbite One. Includes the full customer-facing storefront, staff dashboard, reservation flow, ordering system, and payment history.',
    newFeatures: [
      'Full restaurant storefront with hero, menu browsing, and bestsellers',
      'Table reservation system with date/time picker',
      'Staff dashboard with analytics, orders, reservations, and promotions',
      'Order history and payment tracking per user',
      'Login / signup modal with session persistence',
    ],
    improvements: [
      'Lazy-loaded images across all menu sections for faster initial paint',
      'Smooth page transitions using Framer Motion',
      'Mobile-responsive layout across all screen sizes',
    ],
    bugsFixed: [
      'Cart total rounding error when multiple promo codes applied',
      'Reservation modal not closing after successful booking',
      'Dashboard sidebar active state not syncing with route',
    ],
    stats: { filesChanged: 94, linesAdded: 8210, linesRemoved: 0, lastUpdated: 'July 17, 2026 at 11:45 AM' },
  },
  {
    version: '1.27.1',
    date: 'July 10, 2026',
    developer: 'BunBite Dev Team',
    commitId: 'b8c14e3',
    commitTitle: 'Hotfix — payment processing edge cases & menu display bugs',
    description:
      'Patch release addressing critical bugs found during internal QA. Focused on payment flow stability and menu rendering correctness.',
    newFeatures: [],
    improvements: [
      'Payment processing modal now shows a clearer loading state',
      'Error messages are now more descriptive throughout the checkout flow',
    ],
    bugsFixed: [
      'Payment confirmation occasionally showed wrong order total',
      'Menu items with long names overflowed card boundaries on mobile',
      'Order history modal crashed when no previous orders existed',
      'Dark overlay not dismissed after closing item detail modal',
    ],
    stats: { filesChanged: 12, linesAdded: 187, linesRemoved: 94, lastUpdated: 'July 10, 2026 at 3:22 PM' },
  },
  {
    version: '1.27.0',
    date: 'July 3, 2026',
    developer: 'BunBite Dev Team',
    commitId: 'e2a09f6',
    commitTitle: 'Dashboard v2 — analytics charts, staff management & promotions',
    description:
      'Major dashboard update introducing interactive analytics charts, a full staff management section, and a promotions builder for creating discount campaigns.',
    newFeatures: [
      'Interactive revenue & order analytics charts (Recharts)',
      'Staff management table with role assignment',
      'Promotions builder with discount type, value, and date range',
      'Inventory tracking panel with stock level indicators',
    ],
    improvements: [
      'Dashboard sidebar redesigned with collapsible section groups',
      'Topbar now shows live unread notification count',
      'Widget picker performance improved — renders 60 % faster',
    ],
    bugsFixed: [
      'Sidebar scroll position reset on every navigation',
      'Notification badge count not clearing after viewing',
    ],
    stats: { filesChanged: 38, linesAdded: 2940, linesRemoved: 310, lastUpdated: 'July 3, 2026 at 9:10 AM' },
  },
];

// ─── Bug type options ─────────────────────────────────────────────────────────

const BUG_TYPES = [
  { value: 'ui', label: '🎨  UI / Design' },
  { value: 'functionality', label: '⚙️  Functionality' },
  { value: 'performance', label: '⚡  Performance' },
  { value: 'security', label: '🔒  Security' },
  { value: 'accessibility', label: '♿  Accessibility' },
  { value: 'crash', label: '💥  Crash' },
  { value: 'other', label: '📋  Other' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function parseBrowser(ua: string) {
  if (/Edg\//.test(ua)) return 'Edge ' + (ua.match(/Edg\/([\d.]+)/)?.[1] ?? '');
  if (/OPR\//.test(ua)) return 'Opera ' + (ua.match(/OPR\/([\d.]+)/)?.[1] ?? '');
  if (/Chrome\//.test(ua)) return 'Chrome ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '');
  if (/Firefox\//.test(ua)) return 'Firefox ' + (ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '');
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari ' + (ua.match(/Version\/([\d.]+)/)?.[1] ?? '');
  return 'Unknown';
}

// ─── Shared modal shell ───────────────────────────────────────────────────────

function ModalShell({
  open, onClose, children, maxWidth = 'max-w-lg',
}: {
  open: boolean; onClose: () => void; children: React.ReactNode; maxWidth?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
    } else {
      setAnim(false);
      const t = setTimeout(() => setVisible(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-260"
        style={{ opacity: anim ? 1 : 0 }}
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} max-h-[90dvh] flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-260`}
        style={{
          background: 'linear-gradient(160deg,#111827 0%,#0b0f1a 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          opacity: anim ? 1 : 0,
          transform: anim ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.97)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Screenshot helpers ───────────────────────────────────────────────────────

async function captureScreen(): Promise<string | null> {
  try {
    const canvas = await html2canvas(document.body, {
      useCORS: true, allowTaint: true, logging: false,
      scale: Math.min(window.devicePixelRatio, 2),
    });
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch { return null; }
}

function ScreenshotPreview({ src }: { src: string | null }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
        <Camera className="w-3.5 h-3.5" /> Screenshot
      </label>
      {src ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10">
          <img src={src} alt="capture" className="w-full object-cover max-h-40" />
          <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            Auto-captured
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-white/15 bg-white/4 text-gray-600 text-xs gap-2">
          <Camera className="w-4 h-4 opacity-40" /> Unavailable
        </div>
      )}
    </div>
  );
}

// ─── Bug Report Modal ─────────────────────────────────────────────────────────

function BugReportModal({ open, onClose, screenshot }: { open: boolean; onClose: () => void; screenshot: string | null }) {
  const [bugType, setBugType] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [location] = useLocation();

  function reset() { setBugType(''); setDesc(''); setDone(false); setErr(''); }
  function handleClose() { reset(); onClose(); }

  async function submit() {
    if (!bugType) { setErr('Please select a bug type.'); return; }
    if (!desc.trim()) { setErr('Please describe the bug.'); return; }
    setErr(''); setSubmitting(true);
    const report = {
      id: generateId(), type: 'bug-report', bugType, description: desc.trim(),
      screenshot,
      debug: {
        route: location, url: window.location.href,
        browser: parseBrowser(navigator.userAgent),
        screen: `${screen.width}×${screen.height}`,
        viewport: `${window.innerWidth}×${window.innerHeight}`,
        timestamp: new Date().toISOString(),
        appVersion: '1.28.0',
      },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `bug-${report.id}.json` });
    a.click(); URL.revokeObjectURL(a.href);
    await new Promise(r => setTimeout(r, 500));
    setSubmitting(false); setDone(true);
  }

  return (
    <ModalShell open={open} onClose={handleClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20">
            <Bug className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Report a Bug</p>
            <p className="text-gray-500 text-xs">Ctrl + Shift + Alt</p>
          </div>
        </div>
        <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-white hover:bg-white/8 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 p-5">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <p className="text-white font-semibold">Report Submitted</p>
            <p className="text-gray-400 text-sm">JSON report downloaded. Thank you!</p>
            <button onClick={handleClose} className="mt-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition-colors">Close</button>
          </div>
        ) : (
          <div className="space-y-4">
            <ScreenshotPreview src={screenshot} />
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Bug Type <span className="text-red-400">*</span>
              </label>
              <select value={bugType} onChange={e => { setBugType(e.target.value); setErr(''); }}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white appearance-none outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="" disabled style={{ background: '#111827' }}>Select type…</option>
                {BUG_TYPES.map(t => <option key={t.value} value={t.value} style={{ background: '#111827' }}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea value={desc} onChange={e => { setDesc(e.target.value); setErr(''); }} rows={4}
                placeholder="What happened? How can we reproduce it?"
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 resize-none outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            {err && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {err}
              </div>
            )}
          </div>
        )}
      </div>

      {!done && (
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/8 flex-shrink-0">
          <button onClick={handleClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-colors">Cancel</button>
          <button onClick={submit} disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 transition-all"
            style={{ background: 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)' }}>
            {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</> : 'Submit Report'}
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ─── Improvement Suggestion Modal ────────────────────────────────────────────

function ImprovementModal({ open, onClose, screenshot }: { open: boolean; onClose: () => void; screenshot: string | null }) {
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [location] = useLocation();

  function reset() { setDesc(''); setDone(false); setErr(''); }
  function handleClose() { reset(); onClose(); }

  async function submit() {
    if (!desc.trim()) { setErr('Please describe your suggestion.'); return; }
    setErr(''); setSubmitting(true);
    const report = {
      id: generateId(), type: 'improvement', description: desc.trim(),
      screenshot,
      debug: { route: location, url: window.location.href, browser: parseBrowser(navigator.userAgent), timestamp: new Date().toISOString() },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `improvement-${report.id}.json` });
    a.click(); URL.revokeObjectURL(a.href);
    await new Promise(r => setTimeout(r, 500));
    setSubmitting(false); setDone(true);
  }

  return (
    <ModalShell open={open} onClose={handleClose}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20">
            <Lightbulb className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Suggest an Improvement</p>
            <p className="text-gray-500 text-xs">Ctrl + R</p>
          </div>
        </div>
        <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-white hover:bg-white/8 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 p-5">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <p className="text-white font-semibold">Suggestion Submitted</p>
            <p className="text-gray-400 text-sm">JSON report downloaded. Thank you!</p>
            <button onClick={handleClose} className="mt-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition-colors">Close</button>
          </div>
        ) : (
          <div className="space-y-4">
            <ScreenshotPreview src={screenshot} />
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Your Suggestion <span className="text-blue-400">*</span>
              </label>
              <textarea value={desc} onChange={e => { setDesc(e.target.value); setErr(''); }} rows={5}
                placeholder="Describe the UI, UX, or feature improvement you'd like to see…"
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 resize-none outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            {err && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {err}
              </div>
            )}
          </div>
        )}
      </div>

      {!done && (
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/8 flex-shrink-0">
          <button onClick={handleClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-colors">Cancel</button>
          <button onClick={submit} disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 transition-all"
            style={{ background: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)' }}>
            {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</> : 'Submit Suggestion'}
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ─── Changelog Modal ──────────────────────────────────────────────────────────

function ChangelogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(CHANGELOG[0].version);

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/20">
            <GitCommit className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Latest Changes</p>
            <p className="text-gray-500 text-xs">Release History · Ctrl + N</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-white hover:bg-white/8 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5 space-y-3">
        {CHANGELOG.map((entry, i) => {
          const isOpen = expanded === entry.version;
          return (
            <div key={entry.version}
              className="rounded-xl overflow-hidden transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>

              {/* Entry header — always visible */}
              <button
                onClick={() => setExpanded(isOpen ? null : entry.version)}
                className="w-full flex items-start gap-4 px-4 py-4 text-left hover:bg-white/4 transition-colors"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-0.5 flex-shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-purple-400' : 'bg-gray-600'}`} />
                  {i < CHANGELOG.length - 1 && <div className="w-px flex-1 bg-white/8 mt-1.5 min-h-[16px]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
                      v{entry.version}
                    </span>
                    {i === 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm font-semibold truncate">{entry.commitTitle}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{entry.date}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{entry.developer}</span>
                    {entry.commitId && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{entry.commitId}</span>}
                  </div>
                </div>

                <div className="flex-shrink-0 text-gray-600 mt-1">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded body */}
              {isOpen && (
                <div className="px-4 pb-5 space-y-4 border-t border-white/6">
                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed pt-4">{entry.description}</p>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { icon: <Layers className="w-3.5 h-3.5" />, label: 'Files changed', value: entry.stats.filesChanged, color: 'text-purple-400' },
                      { icon: <Plus className="w-3.5 h-3.5" />, label: 'Lines added', value: `+${entry.stats.linesAdded}`, color: 'text-green-400' },
                      { icon: <Minus className="w-3.5 h-3.5" />, label: 'Lines removed', value: `-${entry.stats.linesRemoved}`, color: 'text-red-400' },
                      { icon: <Clock className="w-3.5 h-3.5" />, label: 'Last updated', value: entry.stats.lastUpdated, color: 'text-gray-400' },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg px-3 py-2.5 flex flex-col gap-1"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <span className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${s.color}`}>
                          {s.icon}{s.label}
                        </span>
                        <span className="text-white text-sm font-bold">{s.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sections */}
                  {[
                    { title: '✨ New Features', items: entry.newFeatures, dot: 'bg-yellow-400' },
                    { title: '⚡ Improvements', items: entry.improvements, dot: 'bg-blue-400' },
                    { title: '🐛 Bugs Fixed', items: entry.bugsFixed, dot: 'bg-green-400' },
                  ].filter(s => s.items.length > 0).map(s => (
                    <div key={s.title}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{s.title}</p>
                      <ul className="space-y-1.5">
                        {s.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-400 leading-relaxed">
                            <span className={`mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

// ─── Floating badge ───────────────────────────────────────────────────────────

const SHORTCUTS = [
  { keys: ['Ctrl', 'Shift', 'Alt'], label: 'Report a Bug' },
  { keys: ['Ctrl', 'R'], label: 'Suggest an Improvement' },
  { keys: ['Ctrl', 'N'], label: 'View Latest Changes' },
];

function FloatingBadge({ onBug, onImprovement, onChangelog }: {
  onBug: () => void; onImprovement: () => void; onChangelog: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[9997] flex flex-col items-end gap-2">
      {/* Shortcuts panel */}
      {open && (
        <div
          className="rounded-xl p-4 w-72 shadow-2xl"
          style={{
            background: 'linear-gradient(160deg,#111827 0%,#0b0f1a 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Developer Shortcuts</p>
          <div className="space-y-2">
            {SHORTCUTS.map(s => (
              <div key={s.label} className="flex items-center justify-between gap-2">
                <span className="text-gray-400 text-xs">{s.label}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {s.keys.map((k, i) => (
                    <span key={k}>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/8 text-gray-400 font-mono text-[10px] border border-white/10">{k}</kbd>
                      {i < s.keys.length - 1 && <span className="text-gray-700 text-[10px] mx-0.5">+</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/8 flex gap-2">
            {[
              { icon: <Bug className="w-3.5 h-3.5" />, label: 'Bug', action: () => { setOpen(false); onBug(); }, color: 'hover:bg-red-500/20 hover:text-red-400' },
              { icon: <Lightbulb className="w-3.5 h-3.5" />, label: 'Improve', action: () => { setOpen(false); onImprovement(); }, color: 'hover:bg-blue-500/20 hover:text-blue-400' },
              { icon: <GitCommit className="w-3.5 h-3.5" />, label: 'Changelog', action: () => { setOpen(false); onChangelog(); }, color: 'hover:bg-purple-500/20 hover:text-purple-400' },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-gray-500 text-[10px] transition-all ${btn.color}`}
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {btn.icon}{btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pill button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium text-gray-300 shadow-xl transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        Beta v1.28 · Dev Tools
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>
    </div>
  );
}

// ─── Capture spinner ──────────────────────────────────────────────────────────

function CaptureSpinner() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-2 bg-gray-900/90 text-white text-sm px-4 py-2.5 rounded-full shadow-xl backdrop-blur-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Capturing screenshot…
      </div>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

type ActiveModal = 'bug' | 'improvement' | 'changelog' | null;

export default function DevToolkit() {
  const [active, setActive] = useState<ActiveModal>(null);
  const [capturing, setCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  // Capture then open a modal that needs a screenshot
  const captureAndOpen = useCallback(async (modal: 'bug' | 'improvement') => {
    if (capturing || active) return;
    setCapturing(true);
    const img = await captureScreen();
    setScreenshot(img);
    setCapturing(false);
    setActive(modal);
  }, [capturing, active]);

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Ctrl + Shift + Alt (modifier-only combo — fires on the last key pressed)
      if (e.ctrlKey && e.shiftKey && e.altKey) {
        e.preventDefault();
        captureAndOpen('bug');
        return;
      }
      // Ctrl + R — prevent browser refresh
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 'r') {
        e.preventDefault();
        captureAndOpen('improvement');
        return;
      }
      // Ctrl + N — prevent new-tab/window
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 'n') {
        e.preventDefault();
        if (!active) setActive('changelog');
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [captureAndOpen, active]);

  return (
    <>
      {capturing && <CaptureSpinner />}

      <FloatingBadge
        onBug={() => captureAndOpen('bug')}
        onImprovement={() => captureAndOpen('improvement')}
        onChangelog={() => setActive('changelog')}
      />

      <BugReportModal
        open={active === 'bug'}
        onClose={() => setActive(null)}
        screenshot={screenshot}
      />
      <ImprovementModal
        open={active === 'improvement'}
        onClose={() => setActive(null)}
        screenshot={screenshot}
      />
      <ChangelogModal
        open={active === 'changelog'}
        onClose={() => setActive(null)}
      />
    </>
  );
}

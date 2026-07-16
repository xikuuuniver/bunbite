import { useEffect, useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { useLocation } from 'wouter';
import { X, Bug, Camera, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DebugInfo {
  route: string;
  url: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  screenResolution: string;
  viewportSize: string;
  timestamp: string;
  appVersion: string;
  consoleErrors: string[];
}

interface BugReport {
  id: string;
  bugType: string;
  description: string;
  screenshot: string | null;
  debug: DebugInfo;
}

// ─── Bug type options ────────────────────────────────────────────────────────

const BUG_TYPES = [
  { value: 'ui', label: '🎨  UI / Design' },
  { value: 'functionality', label: '⚙️  Functionality' },
  { value: 'performance', label: '⚡  Performance' },
  { value: 'security', label: '🔒  Security' },
  { value: 'accessibility', label: '♿  Accessibility' },
  { value: 'crash', label: '💥  Crash' },
  { value: 'other', label: '📋  Other' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return 'Edge ' + (ua.match(/Edg\/([\d.]+)/)?.[1] ?? '');
  if (/OPR\//.test(ua)) return 'Opera ' + (ua.match(/OPR\/([\d.]+)/)?.[1] ?? '');
  if (/Chrome\//.test(ua)) return 'Chrome ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '');
  if (/Firefox\//.test(ua)) return 'Firefox ' + (ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '');
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari ' + (ua.match(/Version\/([\d.]+)/)?.[1] ?? '');
  return 'Unknown Browser';
}

function parseOS(ua: string): string {
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11';
  if (/Windows NT/.test(ua)) return 'Windows';
  if (/Mac OS X/.test(ua)) return 'macOS ' + (ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? '');
  if (/Android/.test(ua)) return 'Android ' + (ua.match(/Android ([\d.]+)/)?.[1] ?? '');
  if (/iPhone OS/.test(ua)) return 'iOS ' + (ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? '');
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown OS';
}

function parseDevice(ua: string): string {
  if (/Mobi|Android|iPhone|iPad/.test(ua)) {
    if (/iPad/.test(ua)) return 'Tablet';
    return 'Mobile';
  }
  return 'Desktop';
}

function generateId(): string {
  return 'BR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function formatTimestamp(): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(new Date());
}

// ─── Console error interceptor ───────────────────────────────────────────────

const _capturedErrors: string[] = [];

(function patchConsole() {
  const originalError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
    _capturedErrors.push(`[${new Date().toISOString()}] ${msg}`);
    if (_capturedErrors.length > 50) _capturedErrors.shift(); // ring buffer
    originalError(...args);
  };

  window.addEventListener('error', (e) => {
    _capturedErrors.push(`[${new Date().toISOString()}] UNCAUGHT: ${e.message} @ ${e.filename}:${e.lineno}`);
    if (_capturedErrors.length > 50) _capturedErrors.shift();
  });

  window.addEventListener('unhandledrejection', (e) => {
    _capturedErrors.push(`[${new Date().toISOString()}] UNHANDLED REJECTION: ${e.reason}`);
    if (_capturedErrors.length > 50) _capturedErrors.shift();
  });
})();

// ─── Component ───────────────────────────────────────────────────────────────

export default function BugReporter() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [bugType, setBugType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const pressedKeys = useRef<Set<string>>(new Set());
  const descRef = useRef<HTMLTextAreaElement>(null);

  // ── Screenshot capture ──────────────────────────────────────────────────

  const captureAndOpen = useCallback(async () => {
    if (isOpen || isCapturing) return;
    setIsCapturing(true);

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: Math.min(window.devicePixelRatio, 2),
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      setScreenshot(canvas.toDataURL('image/jpeg', 0.85));
    } catch {
      setScreenshot(null);
    } finally {
      setIsCapturing(false);
      setIsOpen(true);
    }
  }, [isOpen, isCapturing]);

  // ── Keyboard shortcut: F4 + F ───────────────────────────────────────────

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      pressedKeys.current.add(e.key);
      if (pressedKeys.current.has('F4') && pressedKeys.current.has('f')) {
        e.preventDefault();
        captureAndOpen();
      }
    };
    const up = (e: KeyboardEvent) => pressedKeys.current.delete(e.key);

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [captureAndOpen]);

  // ── Esc to close ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // ── Focus description on open ───────────────────────────────────────────

  useEffect(() => {
    if (isOpen && !submitted) {
      setTimeout(() => descRef.current?.focus(), 80);
    }
  }, [isOpen, submitted]);

  // ── Collect debug info ──────────────────────────────────────────────────

  function buildDebugInfo(): DebugInfo {
    const ua = navigator.userAgent;
    return {
      route: location || '/',
      url: window.location.href,
      userAgent: ua,
      browser: parseBrowser(ua),
      os: parseOS(ua),
      device: parseDevice(ua),
      screenResolution: `${screen.width}×${screen.height} @ ${screen.colorDepth}bit`,
      viewportSize: `${window.innerWidth}×${window.innerHeight}`,
      timestamp: formatTimestamp(),
      appVersion: '1.0.0',
      consoleErrors: [..._capturedErrors],
    };
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!bugType) { setSubmitError('Please select a bug type.'); return; }
    if (!description.trim()) { setSubmitError('Please describe the bug.'); return; }
    setSubmitError(null);
    setIsSubmitting(true);

    const report: BugReport = {
      id: generateId(),
      bugType,
      description: description.trim(),
      screenshot,
      debug: buildDebugInfo(),
    };

    try {
      // Download report as JSON file
      const blob = new Blob(
        [JSON.stringify({ ...report, screenshot: report.screenshot ? '[base64 image — see screenshotDataUrl field]' : null, screenshotDataUrl: report.screenshot }, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bug-report-${report.id}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Small delay to feel intentional
      await new Promise(r => setTimeout(r, 600));
      setSubmitted(true);
    } catch {
      setSubmitError('Failed to generate report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Close / reset ───────────────────────────────────────────────────────

  function handleClose() {
    setIsOpen(false);
    setTimeout(() => {
      setScreenshot(null);
      setBugType('');
      setDescription('');
      setSubmitted(false);
      setSubmitError(null);
    }, 300);
  }

  // ─── Capture spinner (before modal opens) ────────────────────────────────

  if (isCapturing) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 bg-gray-900/90 text-white text-sm px-4 py-2.5 rounded-full shadow-xl backdrop-blur-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Capturing screenshot…
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  // ─── Modal ────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Bug Reporter"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg max-h-[90dvh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10"
        style={{ background: 'linear-gradient(145deg, #1a1f2e 0%, #0f1420 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20">
              <Bug className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm leading-tight">Report a Bug</h2>
              <p className="text-gray-500 text-xs">Your report helps us fix issues faster</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {submitted ? (
            // ── Success state ──
            <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 border border-green-500/20">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-base">Report Submitted</p>
                <p className="text-gray-400 text-sm mt-1">
                  The JSON report was downloaded to your device.
                  <br />Thank you for helping improve the app!
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Screenshot Preview */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  <Camera className="w-3.5 h-3.5" />
                  Screenshot
                </label>
                {screenshot ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/20">
                    <img
                      src={screenshot}
                      alt="Page screenshot"
                      className="w-full object-cover max-h-44"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Auto-captured
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-28 rounded-xl border border-dashed border-white/15 bg-white/4 text-gray-500 text-xs gap-2">
                    <Camera className="w-4 h-4 opacity-50" />
                    Screenshot unavailable
                  </div>
                )}
              </div>

              {/* Bug Type */}
              <div>
                <label htmlFor="bug-type" className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Bug Type <span className="text-red-400">*</span>
                </label>
                <select
                  id="bug-type"
                  value={bugType}
                  onChange={e => { setBugType(e.target.value); setSubmitError(null); }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option value="" disabled style={{ background: '#1a1f2e' }}>Select bug type…</option>
                  {BUG_TYPES.map(t => (
                    <option key={t.value} value={t.value} style={{ background: '#1a1f2e' }}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="bug-desc" className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="bug-desc"
                  ref={descRef}
                  value={description}
                  onChange={e => { setDescription(e.target.value); setSubmitError(null); }}
                  rows={4}
                  placeholder="Describe what happened and how to reproduce it…"
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 resize-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Debug Info (collapsed summary) */}
              <details className="group">
                <summary className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500 hover:text-gray-300 transition-colors select-none list-none">
                  <span className="inline-block transition-transform group-open:rotate-90">▶</span>
                  Debug info automatically included
                </summary>
                <div
                  className="mt-2 rounded-lg p-3 text-[11px] font-mono text-gray-400 space-y-0.5 overflow-x-auto"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {(() => {
                    const d = buildDebugInfo();
                    return (
                      <>
                        <p><span className="text-gray-600">Route:</span> {d.route}</p>
                        <p><span className="text-gray-600">Browser:</span> {d.browser}</p>
                        <p><span className="text-gray-600">OS:</span> {d.os}</p>
                        <p><span className="text-gray-600">Device:</span> {d.device}</p>
                        <p><span className="text-gray-600">Screen:</span> {d.screenResolution}</p>
                        <p><span className="text-gray-600">Viewport:</span> {d.viewportSize}</p>
                        <p><span className="text-gray-600">App version:</span> {d.appVersion}</p>
                        <p><span className="text-gray-600">Time:</span> {d.timestamp}</p>
                        <p><span className="text-gray-600">Console errors:</span> {d.consoleErrors.length > 0 ? `${d.consoleErrors.length} captured` : 'none'}</p>
                      </>
                    );
                  })()}
                </div>
              </details>

              {/* Error */}
              {submitError && (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/10 flex-shrink-0">
            <p className="text-[11px] text-gray-600">Press <kbd className="px-1.5 py-0.5 rounded bg-white/8 text-gray-400 font-mono text-[10px]">Esc</kbd> to close</p>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Shortcut hint strip */}
        <div className="flex-shrink-0 text-center py-2 border-t border-white/5">
          <span className="text-[10px] text-gray-700">
            Trigger anytime with{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/6 text-gray-600 font-mono text-[10px]">F4</kbd>
            {' '}+{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/6 text-gray-600 font-mono text-[10px]">F</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}

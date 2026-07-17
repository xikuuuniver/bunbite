import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import loginCharacters from '@/assets/login-characters.png';
import bunbiteLogo from '@/assets/bunbite-logo.png';
import type { AuthUser } from '@/context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
  onLogin: (user: AuthUser) => void;
}

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

/* Demo credentials — placeholder only, no real auth backend yet */
const HARDCODED_USERNAME = 'demo';
const HARDCODED_PASSWORD  = 'demo1234';

export default function LoginModal({ isOpen, onClose, onSignupClick, onLogin }: LoginModalProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [touched,      setTouched]      = useState<{ username?: boolean; password?: boolean }>({});
  const [isLoading,    setIsLoading]    = useState(false);

  const validateUsername = (v: string) => (!v.trim() ? 'Username is required.' : undefined);
  const validatePassword = (v: string) => (!v ? 'Password is required.' : undefined);

  const handleBlur = (field: 'username' | 'password') => {
    setTouched((t) => ({ ...t, [field]: true }));
    if (field === 'username') setErrors((e) => ({ ...e, username: validateUsername(username) }));
    else                       setErrors((e) => ({ ...e, password: validatePassword(password) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameErr = validateUsername(username);
    const passErr     = validatePassword(password);
    setTouched({ username: true, password: true });

    if (usernameErr || passErr) {
      setErrors({ username: usernameErr, password: passErr });
      return;
    }

    setErrors({});
    setIsLoading(true);

    timerRef.current = setTimeout(() => {
      setIsLoading(false);

      if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
        onLogin({ username: HARDCODED_USERNAME, avatar: null });
        handleClose();
      } else {
        setErrors({ general: 'Incorrect username or password. Please try again.' });
      }
    }, 900);
  };

  /* Cancel any in-flight timer on close or unmount */
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleClose = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    onClose();
    setUsername('');
    setPassword('');
    setErrors({});
    setTouched({});
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="login-title"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', stiffness: 310, damping: 28 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex"
              style={{ minHeight: '560px' }}
            >
              {/* ── LEFT PANEL ── */}
              <div
                className="relative hidden sm:flex flex-col justify-between w-[44%] shrink-0 rounded-2xl m-5 p-9 overflow-hidden"
                style={{ background: 'linear-gradient(150deg, #FB923C 0%, #F97316 50%, #FCD0A1 100%)' }}
              >
                {/* Noise texture */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-[0.07] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '180px',
                  }}
                />

                {/* Text */}
                <div className="relative z-10">
                  <h2 className="text-white font-bold text-3xl leading-snug mb-1">
                    Order delicious<br />burgers with<br />
                    <span className="underline underline-offset-[6px] decoration-white/60">your BunBite.</span>
                  </h2>
                  <p className="text-white/80 text-sm mt-5 leading-relaxed max-w-[240px]">
                    Manage your orders, cart, and payments all in one place with your BunBite account.
                  </p>
                </div>

                {/* Characters */}
                <div className="relative z-10 flex justify-center mt-6">
                  <img
                    src={loginCharacters}
                    alt="BunBite characters"
                    className="w-full max-w-[290px] object-contain drop-shadow-lg"
                    style={{ marginBottom: '-1.25rem' }}
                  />
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="flex-1 flex flex-col justify-center px-10 py-12 sm:px-12">
                {/* Close */}
                <button
                  onClick={handleClose}
                  aria-label="Close login"
                  className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-3 mb-7">
                  <img src={bunbiteLogo} alt="BunBite logo" className="w-11 h-11 object-contain drop-shadow-sm" />
                  <span className="font-bold text-gray-800 text-lg tracking-wide">BunBite</span>
                </div>

                {/* Heading */}
                <h1 id="login-title" className="text-4xl font-bold text-gray-900 mb-1.5">Welcome Back</h1>
                <p className="text-sm text-gray-400 mb-4">Please login to your account</p>

                {/* Demo credentials hint */}
                <button
                  type="button"
                  onClick={() => { setUsername(HARDCODED_USERNAME); setPassword(HARDCODED_PASSWORD); setErrors({}); }}
                  className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-left hover:bg-orange-100 transition-colors w-full group"
                >
                  <span className="text-orange-500 text-lg">👤</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-orange-700">Demo account</p>
                    <p className="text-xs text-orange-500">
                      <span className="font-mono">demo</span> / <span className="font-mono">demo1234</span>
                      <span className="ml-2 text-orange-400 group-hover:text-orange-600 transition-colors">— tap to fill in</span>
                    </p>
                  </div>
                </button>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-1" noValidate>
                  {/* Username */}
                  <div className="flex flex-col gap-1 mb-2">
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (touched.username)
                          setErrors((err) => ({ ...err, username: validateUsername(e.target.value) }));
                      }}
                      onBlur={() => handleBlur('username')}
                      aria-label="Username"
                      aria-describedby={errors.username ? 'username-error' : undefined}
                      aria-invalid={!!errors.username}
                      className={`w-full px-5 py-4 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                        errors.username
                          ? 'bg-red-50 border border-red-300 focus:ring-red-300/50'
                          : 'bg-gray-100 border border-transparent focus:ring-orange-400/50 focus:bg-white'
                      }`}
                    />
                    <AnimatePresence>
                      {errors.username && (
                        <motion.p
                          id="username-error"
                          role="alert"
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                          className="text-xs text-red-500 pl-1"
                        >
                          {errors.username}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1 mb-1">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (touched.password)
                            setErrors((err) => ({ ...err, password: validatePassword(e.target.value) }));
                        }}
                        onBlur={() => handleBlur('password')}
                        aria-label="Password"
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        aria-invalid={!!errors.password}
                        className={`w-full px-5 py-4 pr-12 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                          errors.password
                            ? 'bg-red-50 border border-red-300 focus:ring-red-300/50'
                            : 'bg-gray-100 border border-transparent focus:ring-orange-400/50 focus:bg-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          id="password-error"
                          role="alert"
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                          className="text-xs text-red-500 pl-1"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Forgot password */}
                  <div className="text-right mb-3">
                    <button type="button" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  {/* General error */}
                  <AnimatePresence>
                    {errors.general && (
                      <motion.p
                        role="alert"
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                        className="text-xs text-red-500 pl-1 -mt-1 mb-2"
                      >
                        {errors.general}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm tracking-wide transition-colors disabled:opacity-70 flex items-center justify-center"
                  >
                    {isLoading
                      ? <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : 'Login'}
                  </motion.button>
                </form>

                {/* Sign up */}
                <div className="flex flex-col items-center gap-2.5 mt-9">
                  <p className="text-xs text-gray-400">Don't have an account?</p>
                  <button
                    type="button"
                    onClick={() => { handleClose(); onSignupClick(); }}
                    className="w-2/3 py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs tracking-wide transition-colors"
                  >
                    Create One
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

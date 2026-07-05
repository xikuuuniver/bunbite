import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import loginCharacters from '@/assets/login-characters.png';
import bunbiteLogo from '@/assets/bunbite-logo.png';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Please enter a valid email address.';
}

function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required.';
  if (value.length < 6) return 'Password must be at least 6 characters.';
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((t) => ({ ...t, [field]: true }));
    if (field === 'email') {
      setErrors((e) => ({ ...e, email: validateEmail(email) }));
    } else {
      setErrors((e) => ({ ...e, password: validatePassword(password) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setTouched({ email: true, password: true });

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setErrors({});
    setIsLoading(true);

    // Simulate auth — always fails for demo (no real backend yet)
    setTimeout(() => {
      setIsLoading(false);
      setErrors({ general: 'Incorrect email or password. Please try again.' });
    }, 1200);
  };

  const handleClose = () => {
    onClose();
    setEmail('');
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
                style={{
                  background: 'linear-gradient(150deg, #FB923C 0%, #F97316 50%, #FCD0A1 100%)',
                }}
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
                    <span className="underline underline-offset-[6px] decoration-white/60">
                      your BunBite.
                    </span>
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
                  <img
                    src={bunbiteLogo}
                    alt="BunBite logo"
                    className="w-11 h-11 object-contain drop-shadow-sm"
                  />
                  <span className="font-bold text-gray-800 text-lg tracking-wide">BunBite</span>
                </div>

                {/* Heading */}
                <h1 id="login-title" className="text-4xl font-bold text-gray-900 mb-1.5">
                  Welcome Back
                </h1>
                <p className="text-sm text-gray-400 mb-8">Please login to your account</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-1" noValidate>
                  {/* Email */}
                  <div className="flex flex-col gap-1 mb-2">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (touched.email)
                          setErrors((err) => ({ ...err, email: validateEmail(e.target.value) }));
                      }}
                      onBlur={() => handleBlur('email')}
                      aria-label="Email address"
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      aria-invalid={!!errors.email}
                      className={`w-full px-5 py-4 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition
                        ${errors.email
                          ? 'bg-red-50 border border-red-300 focus:ring-red-300/50'
                          : 'bg-gray-100 border border-transparent focus:ring-orange-400/50 focus:bg-white'
                        }`}
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          id="email-error"
                          role="alert"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="text-xs text-red-500 pl-1"
                        >
                          {errors.email}
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
                        className={`w-full px-5 py-4 pr-12 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition
                          ${errors.password
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
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="text-xs text-red-500 pl-1"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Forgot password */}
                  <div className="text-right mb-3">
                    <button
                      type="button"
                      className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* General error (wrong credentials) */}
                  <AnimatePresence>
                    {errors.general && (
                      <motion.p
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-red-500 pl-1 -mt-1 mb-2"
                      >
                        {errors.general}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Login button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm tracking-wide transition-colors disabled:opacity-70 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Login'
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 whitespace-nowrap">Or Login with</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Social buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>

                {/* Sign up */}
                <p className="text-center text-xs text-gray-400 mt-5">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="text-orange-500 font-semibold hover:underline"
                  >
                    Signup
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

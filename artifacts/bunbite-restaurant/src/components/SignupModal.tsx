import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Camera, User, ChevronLeft } from 'lucide-react';
import loginCharacters from '@/assets/login-characters.png';
import bunbiteLogo from '@/assets/bunbite-logo.png';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

/* ── Country data grouped by continent ── */
const CONTINENTS: Record<string, string[]> = {
  Asia: [
    'Afghanistan','Bangladesh','Cambodia','China','India','Indonesia','Iran','Iraq',
    'Japan','Jordan','Kazakhstan','Kuwait','Kyrgyzstan','Laos','Lebanon','Malaysia',
    'Mongolia','Myanmar','Nepal','North Korea','Oman','Pakistan','Philippines','Qatar',
    'Saudi Arabia','Singapore','South Korea','Sri Lanka','Syria','Taiwan','Tajikistan',
    'Thailand','Turkmenistan','United Arab Emirates','Uzbekistan','Vietnam','Yemen',
  ],
  Europe: [
    'Albania','Austria','Belarus','Belgium','Bosnia and Herzegovina','Bulgaria','Croatia',
    'Cyprus','Czech Republic','Denmark','Estonia','Finland','France','Germany','Greece',
    'Hungary','Iceland','Ireland','Italy','Latvia','Lithuania','Luxembourg','Malta',
    'Moldova','Montenegro','Netherlands','North Macedonia','Norway','Poland','Portugal',
    'Romania','Russia','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland',
    'Ukraine','United Kingdom',
  ],
  Africa: [
    'Algeria','Angola','Benin','Botswana','Burkina Faso','Burundi','Cameroon','Cape Verde',
    'Central African Republic','Chad','Comoros','Congo','DR Congo','Djibouti','Egypt',
    'Eritrea','Eswatini','Ethiopia','Gabon','Gambia','Ghana','Guinea','Guinea-Bissau',
    'Ivory Coast','Kenya','Lesotho','Liberia','Libya','Madagascar','Malawi','Mali',
    'Mauritania','Mauritius','Morocco','Mozambique','Namibia','Niger','Nigeria','Rwanda',
    'Senegal','Sierra Leone','Somalia','South Africa','South Sudan','Sudan','Tanzania',
    'Togo','Tunisia','Uganda','Zambia','Zimbabwe',
  ],
  'North America': [
    'Antigua and Barbuda','Bahamas','Barbados','Belize','Canada','Costa Rica','Cuba',
    'Dominica','Dominican Republic','El Salvador','Grenada','Guatemala','Haiti','Honduras',
    'Jamaica','Mexico','Nicaragua','Panama','Saint Kitts and Nevis','Saint Lucia',
    'Saint Vincent and the Grenadines','Trinidad and Tobago','United States',
  ],
  'South America': [
    'Argentina','Bolivia','Brazil','Chile','Colombia','Ecuador','Guyana','Paraguay',
    'Peru','Suriname','Uruguay','Venezuela',
  ],
  Oceania: [
    'Australia','Fiji','Kiribati','Marshall Islands','Micronesia','Nauru','New Zealand',
    'Palau','Papua New Guinea','Samoa','Solomon Islands','Tonga','Tuvalu','Vanuatu',
  ],
  Antarctica: ['Antarctica'],
};

/* ── Password strength ── */
function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw))    score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak',   color: 'bg-red-400',    bars: 1 };
  if (score <= 3) return { label: 'Fair',   color: 'bg-orange-400', bars: 2 };
  if (score <= 4) return { label: 'Good',   color: 'bg-yellow-400', bars: 3 };
  return              { label: 'Strong', color: 'bg-green-500',  bars: 4 };
}

/* ── Reusable field wrapper ── */
function Field({
  title, description, error, children,
}: {
  title: string; description: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed mb-1">{description}</p>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
            className="text-xs text-red-500 pl-1"
          >{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full px-4 py-3.5 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
    err
      ? 'bg-red-50 border border-red-300 focus:ring-red-300/50'
      : 'bg-gray-100 border border-transparent focus:ring-orange-400/50 focus:bg-white'
  }`;

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const STEPS = [
  { label: 'Personal Info',        short: 'Personal'   },
  { label: 'Contact & Location',   short: 'Contact'    },
  { label: 'Account Details',      short: 'Account'    },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ?  60 : -60, opacity: 0 }),
  center:               ({ x: 0,            opacity: 1 }),
  exit:  (dir: number) => ({ x: dir > 0 ? -60 :  60, opacity: 0 }),
};

/* ── Main component ── */
export default function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  /* step state */
  const [step,    setStep]    = useState(0);
  const [direction, setDir]   = useState(1); // +1 = forward, -1 = back

  /* field state */
  const [avatar,    setAvatar]    = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [gender,    setGender]    = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [country,   setCountry]   = useState('');
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [showPw,    setShowPw]    = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const strength = password ? getPasswordStrength(password) : null;

  /* Avatar upload */
  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* Per-step validation */
  const validateStep = (s: number): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!firstName.trim()) errs.firstName = 'First name is required.';
      if (!lastName.trim())  errs.lastName  = 'Last name is required.';
      if (!gender)           errs.gender    = 'Please select a gender.';
    }
    if (s === 1) {
      if (!email.trim()) errs.email = 'Email address is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address.';
      if (!phone.trim()) errs.phone = 'Phone number is required.';
      else if (!/^\+?[\d\s\-().]{7,}$/.test(phone)) errs.phone = 'Please enter a valid phone number.';
      if (!country) errs.country = 'Please select your country.';
    }
    if (s === 2) {
      if (!username.trim()) errs.username = 'Username is required.';
      else if (!/^[a-zA-Z0-9_]{3,}$/.test(username)) errs.username = 'Min 3 characters — letters, numbers, _ only.';
      if (!password)            errs.password = 'Password is required.';
      else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
      else if ((strength?.bars ?? 0) < 2) errs.password = 'Password is too weak — add uppercase letters, numbers, or symbols.';
    }
    return errs;
  };

  const goNext = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setDir(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setErrors({});
    setDir(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep(2);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); handleClose(); }, 1500);
  };

  const handleClose = () => {
    onClose();
    setStep(0); setDir(1);
    setAvatar(null); setFirstName(''); setLastName(''); setGender('');
    setEmail(''); setPhone(''); setCountry('');
    setUsername(''); setPassword(''); setShowPw(false);
    setErrors({}); setIsLoading(false);
  };

  /* ── Step content ── */
  const stepContent = [
    /* ── Step 0: Personal Info ── */
    <div key="step0" className="flex flex-col gap-6">
      {/* Avatar */}
      <Field title="Profile Picture" description="Upload a photo so other members can recognise you. JPG, PNG, or WebP — max 5 MB.">
        <div className="flex items-center gap-5">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-orange-400 flex items-center justify-center overflow-hidden cursor-pointer transition-colors shrink-0"
          >
            {avatar
              ? <img src={avatar} alt="Avatar preview" className="w-full h-full object-cover" />
              : <User size={28} className="text-gray-300" />}
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 font-medium transition-colors">
              <Camera size={15} />{avatar ? 'Change Photo' : 'Upload Photo'}
            </button>
            {avatar && (
              <button type="button"
                onClick={() => { setAvatar(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="text-xs text-red-400 hover:text-red-500 text-left transition-colors">
                Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} />
        </div>
      </Field>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <Field title="First Name" description="Your legal first name." error={errors.firstName}>
          <input type="text" placeholder="e.g. Jane" value={firstName}
            onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors((p) => ({ ...p, firstName: '' })); }}
            className={inputCls(errors.firstName)} />
        </Field>
        <Field title="Last Name" description="Your family name or surname." error={errors.lastName}>
          <input type="text" placeholder="e.g. Doe" value={lastName}
            onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors((p) => ({ ...p, lastName: '' })); }}
            className={inputCls(errors.lastName)} />
        </Field>
      </div>

      {/* Gender */}
      <Field title="Gender" description="Helps us personalise your experience and address you correctly." error={errors.gender}>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button key={g} type="button"
              onClick={() => { setGender(g); if (errors.gender) setErrors((p) => ({ ...p, gender: '' })); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                gender === g
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-gray-100 text-gray-600 border-transparent hover:border-orange-300'
              }`}>
              {g}
            </button>
          ))}
        </div>
      </Field>
    </div>,

    /* ── Step 1: Contact & Location ── */
    <div key="step1" className="flex flex-col gap-6">
      <Field title="Email Address" description="We'll send order confirmations and account updates to this address." error={errors.email}>
        <input type="email" placeholder="you@example.com" value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
          className={inputCls(errors.email)} />
      </Field>

      <Field title="Phone Number" description="Used for delivery updates and two-factor authentication. Include your country code (e.g. +1)." error={errors.phone}>
        <input type="tel" placeholder="+1 555 000 0000" value={phone}
          onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: '' })); }}
          className={inputCls(errors.phone)} />
      </Field>

      <Field title="Country" description="Your country of residence — grouped by continent for easy browsing." error={errors.country}>
        <select value={country}
          onChange={(e) => { setCountry(e.target.value); if (errors.country) setErrors((p) => ({ ...p, country: '' })); }}
          className={`${inputCls(errors.country)} appearance-none cursor-pointer`}>
          <option value="" disabled>Select your country…</option>
          {Object.entries(CONTINENTS).map(([continent, countries]) => (
            <optgroup key={continent} label={`── ${continent} ──`}>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          ))}
        </select>
      </Field>
    </div>,

    /* ── Step 2: Account Details ── */
    <div key="step2" className="flex flex-col gap-6">
      <Field title="Username" description="A unique handle for your BunBite profile. Min 3 characters — letters, numbers, and underscores only." error={errors.username}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none">@</span>
          <input type="text" placeholder="your_username" value={username}
            onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors((p) => ({ ...p, username: '' })); }}
            className={`${inputCls(errors.username)} pl-8`} />
        </div>
      </Field>

      <Field title="Password" description="At least 8 characters. Mix uppercase letters, numbers, and symbols for a stronger password." error={errors.password}>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} placeholder="Create a strong password" value={password}
            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
            className={`${inputCls(errors.password)} pr-12`} />
          <button type="button" onClick={() => setShowPw(!showPw)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {password && strength && (
          <div className="mt-2 flex flex-col gap-1.5">
            <div className="flex gap-1">
              {[1,2,3,4].map((bar) => (
                <div key={bar}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${bar <= strength.bars ? strength.color : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${
              strength.bars === 1 ? 'text-red-400' : strength.bars === 2 ? 'text-orange-400' :
              strength.bars === 3 ? 'text-yellow-500' : 'text-green-500'}`}>
              {strength.label}
            </p>
          </div>
        )}
      </Field>
    </div>,
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="signup-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={handleClose} aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog" aria-modal="true" aria-labelledby="signup-title"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', stiffness: 310, damping: 28 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex"
              style={{ maxHeight: '92vh' }}
            >
              {/* ── LEFT PANEL ── */}
              <div
                className="relative hidden sm:flex flex-col justify-between w-[40%] shrink-0 rounded-2xl m-5 p-9 overflow-hidden"
                style={{ background: 'linear-gradient(150deg,#FB923C 0%,#F97316 50%,#FCD0A1 100%)' }}
              >
                <div className="absolute inset-0 rounded-2xl opacity-[0.07] pointer-events-none"
                  style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:'180px' }}
                />

                <div className="relative z-10">
                  <h2 className="text-white font-bold text-3xl leading-snug mb-1">
                    Join the<br />BunBite<br />
                    <span className="underline underline-offset-[6px] decoration-white/60">family today.</span>
                  </h2>
                  <p className="text-white/80 text-sm mt-5 leading-relaxed max-w-[230px]">
                    Create your free account and enjoy exclusive deals, saved orders, and seamless checkout every time.
                  </p>

                  {/* Step indicators */}
                  <div className="mt-8 flex flex-col gap-3">
                    {STEPS.map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-300 ${
                          i < step  ? 'bg-white text-orange-500' :
                          i === step ? 'bg-white text-orange-500 ring-2 ring-white/50 ring-offset-2 ring-offset-orange-500' :
                                       'bg-white/30 text-white'}`}>
                          {i < step ? (
                            <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : i + 1}
                        </div>
                        <span className={`text-sm font-medium transition-colors duration-300 ${i <= step ? 'text-white' : 'text-white/50'}`}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 flex justify-center mt-6">
                  <img src={loginCharacters} alt="BunBite characters"
                    className="w-full max-w-[260px] object-contain drop-shadow-lg" style={{ marginBottom:'-1.25rem' }} />
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

                {/* Fixed header */}
                <div className="px-10 pt-10 pb-5 shrink-0">
                  <button onClick={handleClose} aria-label="Close signup"
                    className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors">
                    <X size={16} />
                  </button>

                  <div className="flex items-center gap-3 mb-5">
                    <img src={bunbiteLogo} alt="BunBite logo" className="w-10 h-10 object-contain" />
                    <span className="font-bold text-gray-800 text-lg tracking-wide">BunBite</span>
                  </div>

                  {/* Step counter + title */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
                      Step {step + 1} of {STEPS.length}
                    </span>
                  </div>
                  <h1 id="signup-title" className="text-2xl font-bold text-gray-900 mb-0.5">
                    {STEPS[step].label}
                  </h1>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-orange-500 rounded-full"
                      animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  </div>
                </div>

                {/* Animated step body */}
                <div className="overflow-y-auto flex-1 px-10 relative">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="pt-2 pb-8"
                    >
                      <form
                        onSubmit={step < STEPS.length - 1
                          ? (e) => { e.preventDefault(); goNext(); }
                          : handleSubmit}
                        noValidate
                      >
                        {stepContent[step]}

                        {/* Navigation buttons */}
                        <div className="flex gap-3 mt-8">
                          {step > 0 && (
                            <button
                              type="button"
                              onClick={goBack}
                              className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                              <ChevronLeft size={16} />
                              Back
                            </button>
                          )}
                          <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm tracking-wide transition-colors disabled:opacity-70 flex items-center justify-center"
                          >
                            {isLoading ? (
                              <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : step < STEPS.length - 1 ? (
                              'Continue'
                            ) : (
                              'Create Account'
                            )}
                          </motion.button>
                        </div>

                        {/* Back to login — only on first step */}
                        {step === 0 && (
                          <div className="flex flex-col items-center gap-2.5 mt-6">
                            <p className="text-xs text-gray-400">Already have an account?</p>
                            <button
                              type="button"
                              onClick={() => { handleClose(); onLoginClick(); }}
                              className="w-2/3 py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs tracking-wide transition-colors"
                            >
                              Login
                            </button>
                          </div>
                        )}
                      </form>
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

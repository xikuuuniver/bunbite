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

/* ── Countries by continent ── */
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
function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8)        s++;
  if (pw.length >= 12)       s++;
  if (/[A-Z]/.test(pw))     s++;
  if (/[a-z]/.test(pw))     s++;
  if (/\d/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { label: 'Weak',   color: 'bg-red-400',    text: 'text-red-400',    bars: 1 };
  if (s <= 3) return { label: 'Fair',   color: 'bg-orange-400', text: 'text-orange-400', bars: 2 };
  if (s <= 4) return { label: 'Good',   color: 'bg-yellow-400', text: 'text-yellow-500', bars: 3 };
  return              { label: 'Strong', color: 'bg-green-500',  text: 'text-green-500',  bars: 4 };
}

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

/* ── Step definitions ── */
const STEPS = [
  { key: 'country',  title: 'Where are you from?',          desc: 'Select your country of residence. Countries are grouped by continent for easy browsing.' },
  { key: 'firstName',title: "What's your first name?",      desc: 'Enter your legal first name as it appears on official documents.' },
  { key: 'lastName', title: "What's your last name?",       desc: 'Enter your family name or surname.' },
  { key: 'gender',   title: 'How do you identify?',         desc: 'This helps us personalise your experience and address you correctly.' },
  { key: 'password', title: 'Create a strong password',     desc: 'Use at least 8 characters. Mix uppercase letters, numbers, and symbols for better security.' },
  { key: 'avatar',   title: 'Add a profile picture',        desc: 'Upload a photo so other BunBite members can recognise you. JPG, PNG, or WebP — max 5 MB. You can skip this.' },
  { key: 'username', title: 'Pick a unique username',        desc: 'Your handle on BunBite. Min 3 characters — letters, numbers, and underscores only. No spaces.' },
  { key: 'email',    title: "What's your email address?",   desc: "We'll send order confirmations and account updates to this address." },
  { key: 'phone',    title: "What's your phone number?",    desc: 'Used for delivery updates and two-factor authentication. Include your country code, e.g. +1.' },
];

const TOTAL = STEPS.length;

const slide = {
  enter: (d: number) => ({ x: d > 0 ? 56 : -56, opacity: 0 }),
  center:              { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? -56 : 56, opacity: 0 }),
};

const inputCls = (err?: string) =>
  `w-full px-5 py-4 rounded-2xl text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
    err
      ? 'bg-red-50 border border-red-300 focus:ring-red-300/50'
      : 'bg-gray-100 border border-transparent focus:ring-orange-400/50 focus:bg-white'
  }`;

/* ── Component ── */
export default function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep]   = useState(0);
  const [dir,  setDir]    = useState(1);

  /* field values */
  const [country,   setCountry]   = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [gender,    setGender]    = useState('');
  const [password,  setPassword]  = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [avatar,    setAvatar]    = useState<string | null>(null);
  const [username,  setUsername]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');

  const [error,     setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = password ? getStrength(password) : null;

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* per-step validation */
  const validate = (): string => {
    switch (STEPS[step].key) {
      case 'country':   return !country   ? 'Please select your country.'                                              : '';
      case 'firstName': return !firstName.trim() ? 'First name is required.'                                          : '';
      case 'lastName':  return !lastName.trim()  ? 'Last name is required.'                                           : '';
      case 'gender':    return !gender    ? 'Please select a gender.'                                                  : '';
      case 'password':
        if (!password)            return 'Password is required.';
        if (password.length < 8)  return 'Password must be at least 8 characters.';
        if ((strength?.bars ?? 0) < 2) return 'Password too weak — add uppercase letters, numbers, or symbols.';
        return '';
      case 'avatar':    return ''; // optional
      case 'username':
        if (!username.trim())               return 'Username is required.';
        if (!/^[a-zA-Z0-9_]{3,}$/.test(username)) return 'Min 3 characters — letters, numbers, _ only.';
        return '';
      case 'email':
        if (!email.trim())                              return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
        return '';
      case 'phone':
        if (!phone.trim())                        return 'Phone number is required.';
        if (!/^\+?[\d\s\-().]{7,}$/.test(phone)) return 'Please enter a valid phone number.';
        return '';
      default: return '';
    }
  };

  const advance = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    if (step < TOTAL - 1) { setDir(1); setStep(s => s + 1); }
    else submit();
  };

  const back = () => {
    setError('');
    setDir(-1);
    setStep(s => s - 1);
  };

  const submit = () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); handleClose(); }, 1500);
  };

  const handleClose = () => {
    onClose();
    setStep(0); setDir(1);
    setCountry(''); setFirstName(''); setLastName(''); setGender('');
    setPassword(''); setShowPw(false); setAvatar(null);
    setUsername(''); setEmail(''); setPhone('');
    setError(''); setIsLoading(false);
  };

  /* ── Per-step input UI ── */
  const renderField = () => {
    const key = STEPS[step].key;

    if (key === 'country') return (
      <select value={country} onChange={e => { setCountry(e.target.value); setError(''); }}
        className={`${inputCls(error)} appearance-none cursor-pointer`}>
        <option value="" disabled>Select your country…</option>
        {Object.entries(CONTINENTS).map(([continent, list]) => (
          <optgroup key={continent} label={`── ${continent} ──`}>
            {list.map(c => <option key={c} value={c}>{c}</option>)}
          </optgroup>
        ))}
      </select>
    );

    if (key === 'firstName') return (
      <input type="text" placeholder="e.g. Jane" value={firstName} autoFocus
        onChange={e => { setFirstName(e.target.value); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && advance()}
        className={inputCls(error)} />
    );

    if (key === 'lastName') return (
      <input type="text" placeholder="e.g. Doe" value={lastName} autoFocus
        onChange={e => { setLastName(e.target.value); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && advance()}
        className={inputCls(error)} />
    );

    if (key === 'gender') return (
      <div className="flex flex-wrap gap-3">
        {GENDERS.map(g => (
          <button key={g} type="button"
            onClick={() => { setGender(g); setError(''); }}
            className={`px-5 py-3 rounded-2xl text-sm font-semibold border transition-colors ${
              gender === g
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-gray-100 text-gray-600 border-transparent hover:border-orange-300'
            }`}>
            {g}
          </button>
        ))}
      </div>
    );

    if (key === 'password') return (
      <div className="flex flex-col gap-3">
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} placeholder="Create a strong password"
            value={password} autoFocus
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && advance()}
            className={`${inputCls(error)} pr-13`} />
          <button type="button" onClick={() => setShowPw(p => !p)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {password && strength && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5">
              {[1,2,3,4].map(b => (
                <div key={b}
                  className={`h-2 flex-1 rounded-full transition-colors duration-300 ${b <= strength.bars ? strength.color : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <p className={`text-sm font-semibold ${strength.text}`}>{strength.label} password</p>
          </div>
        )}
      </div>
    );

    if (key === 'avatar') return (
      <div className="flex flex-col items-center gap-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-orange-400 flex items-center justify-center overflow-hidden cursor-pointer transition-colors"
        >
          {avatar
            ? <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
            : <User size={40} className="text-gray-300" />}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 font-semibold transition-colors">
            <Camera size={16} />{avatar ? 'Change Photo' : 'Upload Photo'}
          </button>
          {avatar && (
            <button type="button"
              onClick={() => { setAvatar(null); if (fileRef.current) fileRef.current.value = ''; }}
              className="px-5 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-sm text-red-500 font-semibold transition-colors">
              Remove
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} />
      </div>
    );

    if (key === 'username') return (
      <div className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-base font-semibold select-none">@</span>
        <input type="text" placeholder="your_username" value={username} autoFocus
          onChange={e => { setUsername(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && advance()}
          className={`${inputCls(error)} pl-9`} />
      </div>
    );

    if (key === 'email') return (
      <input type="email" placeholder="you@example.com" value={email} autoFocus
        onChange={e => { setEmail(e.target.value); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && advance()}
        className={inputCls(error)} />
    );

    if (key === 'phone') return (
      <input type="tel" placeholder="+1 555 000 0000" value={phone} autoFocus
        onChange={e => { setPhone(e.target.value); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && advance()}
        className={inputCls(error)} />
    );

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="su-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
            onClick={handleClose} aria-hidden="true"
          />

          {/* Modal shell — stays mounted, only content slides */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog" aria-modal="true" aria-labelledby="su-title"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', stiffness: 310, damping: 28 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex"
              style={{ minHeight: '540px' }}
            >

              {/* ── LEFT PANEL ── */}
              <div
                className="relative hidden sm:flex flex-col justify-between w-[38%] shrink-0 rounded-2xl m-5 p-9 overflow-hidden"
                style={{ background: 'linear-gradient(150deg,#FB923C 0%,#F97316 55%,#FCD0A1 100%)' }}
              >
                {/* Noise */}
                <div className="absolute inset-0 rounded-2xl opacity-[0.07] pointer-events-none"
                  style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:'180px' }}
                />

                <div className="relative z-10">
                  <h2 className="text-white font-bold text-2xl leading-snug mb-5">
                    Join the BunBite<br />
                    <span className="underline underline-offset-[6px] decoration-white/60">family today.</span>
                  </h2>

                  {/* Step list */}
                  <div className="flex flex-col gap-2.5">
                    {STEPS.map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {/* circle */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          i < step  ? 'bg-white'
                          : i === step ? 'bg-white ring-2 ring-white/50 ring-offset-2 ring-offset-orange-500'
                          : 'bg-white/25'
                        }`}>
                          {i < step ? (
                            <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                              <path d="M2 6l3 3 5-5" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <span className={`text-[10px] font-bold ${i === step ? 'text-orange-500' : 'text-white/60'}`}>{i + 1}</span>
                          )}
                        </div>
                        {/* label */}
                        <span className={`text-xs font-medium transition-colors duration-300 leading-tight ${
                          i === step ? 'text-white font-bold' : i < step ? 'text-white/70' : 'text-white/40'
                        }`}>
                          {s.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 flex justify-center">
                  <img src={loginCharacters} alt="" className="w-full max-w-[240px] object-contain drop-shadow-lg" style={{ marginBottom:'-1.25rem' }} />
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top bar: logo + close + progress */}
                <div className="px-10 pt-8 pb-4 shrink-0">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <img src={bunbiteLogo} alt="BunBite" className="w-9 h-9 object-contain" />
                      <span className="font-bold text-gray-800 tracking-wide">BunBite</span>
                    </div>
                    <button onClick={handleClose} aria-label="Close"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors">
                      <X size={15} />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-orange-500 rounded-full"
                      animate={{ width: `${((step + 1) / TOTAL) * 100}%` }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400">Step {step + 1} of {TOTAL}</span>
                    <span className="text-xs text-orange-500 font-medium">{Math.round(((step + 1) / TOTAL) * 100)}%</span>
                  </div>
                </div>

                {/* Animated content area */}
                <div className="flex-1 overflow-hidden relative px-10">
                  <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                      key={step}
                      custom={dir}
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="flex flex-col gap-6 pt-2 pb-8 h-full"
                    >
                      {/* Field heading */}
                      <div>
                        <h1 id="su-title" className="text-2xl font-bold text-gray-900 mb-2 leading-snug">
                          {STEPS[step].title}
                        </h1>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-md">
                          {STEPS[step].desc}
                        </p>
                      </div>

                      {/* Input */}
                      <div className="flex-1">
                        {renderField()}

                        {/* Error */}
                        <AnimatePresence>
                          {error && (
                            <motion.p role="alert"
                              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                              className="text-xs text-red-500 mt-2 pl-1">
                              {error}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Navigation */}
                      <div className="flex flex-col gap-3 mt-auto">
                        <div className="flex gap-3">
                          {step > 0 && (
                            <button type="button" onClick={back}
                              className="flex items-center gap-1 px-5 py-3.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                              <ChevronLeft size={16} />Back
                            </button>
                          )}
                          <motion.button
                            type="button" onClick={advance} disabled={isLoading} whileTap={{ scale: 0.98 }}
                            className="flex-1 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm tracking-wide transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                            {isLoading
                              ? <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              : step === TOTAL - 1 ? 'Create Account ✓' : 'Continue →'}
                          </motion.button>
                        </div>

                        {/* Skip for avatar */}
                        {STEPS[step].key === 'avatar' && (
                          <button type="button" onClick={() => { setDir(1); setStep(s => s + 1); }}
                            className="text-xs text-gray-400 hover:text-gray-600 text-center transition-colors">
                            Skip for now
                          </button>
                        )}

                        {/* Back to login — only on step 0 */}
                        {step === 0 && (
                          <div className="flex flex-col items-center gap-2.5 mt-1">
                            <p className="text-xs text-gray-400">Already have an account?</p>
                            <button type="button"
                              onClick={() => { handleClose(); onLoginClick(); }}
                              className="w-2/3 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white font-semibold text-xs tracking-wide transition-colors">
                              Login
                            </button>
                          </div>
                        )}
                      </div>
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

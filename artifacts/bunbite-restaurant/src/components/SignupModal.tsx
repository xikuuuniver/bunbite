import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Camera, User } from 'lucide-react';
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
    'Afghanistan', 'Bangladesh', 'Cambodia', 'China', 'India', 'Indonesia',
    'Iran', 'Iraq', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Lebanon', 'Malaysia', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea',
    'Oman', 'Pakistan', 'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore',
    'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand',
    'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen',
  ],
  Europe: [
    'Albania', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina',
    'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia',
    'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland',
    'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova',
    'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland',
    'Portugal', 'Romania', 'Russia', 'Serbia', 'Slovakia', 'Slovenia',
    'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom',
  ],
  Africa: [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
    'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros',
    'Congo', 'DR Congo', 'Djibouti', 'Egypt', 'Eritrea', 'Eswatini',
    'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau',
    'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
    'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique',
    'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Senegal', 'Sierra Leone',
    'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo',
    'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
  ],
  'North America': [
    'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica',
    'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada',
    'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua',
    'Panama', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Trinidad and Tobago', 'United States',
  ],
  'South America': [
    'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador',
    'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela',
  ],
  Oceania: [
    'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia',
    'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa',
    'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu',
  ],
  Antarctica: ['Antarctica'],
};

/* ── Password strength ── */
function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-400', bars: 1 };
  if (score <= 3) return { label: 'Fair', color: 'bg-orange-400', bars: 2 };
  if (score <= 4) return { label: 'Good', color: 'bg-yellow-400', bars: 3 };
  return { label: 'Strong', color: 'bg-green-500', bars: 4 };
}

/* ── Field wrapper ── */
function Field({
  title, description, error, children,
}: {
  title: string;
  description: string;
  error?: string;
  children: React.ReactNode;
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
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-red-500 pl-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass = (hasError?: string) =>
  `w-full px-4 py-3.5 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
    hasError
      ? 'bg-red-50 border border-red-300 focus:ring-red-300/50'
      : 'bg-gray-100 border border-transparent focus:ring-orange-400/50 focus:bg-white'
  }`;

/* ── Main component ── */
export default function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const strength = password ? getPasswordStrength(password) : null;

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim()) errs.lastName = 'Last name is required.';
    if (!username.trim()) errs.username = 'Username is required.';
    else if (!/^[a-zA-Z0-9_]{3,}$/.test(username))
      errs.username = 'Username must be at least 3 characters (letters, numbers, _).';
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Please enter a valid email address.';
    if (!phone.trim()) errs.phone = 'Phone number is required.';
    else if (!/^\+?[\d\s\-().]{7,}$/.test(phone))
      errs.phone = 'Please enter a valid phone number.';
    if (!gender) errs.gender = 'Please select a gender.';
    if (!country) errs.country = 'Please select your country.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    else if (getPasswordStrength(password).bars < 2)
      errs.password = 'Password is too weak. Add uppercase letters, numbers, or symbols.';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    // Simulate account creation — close modal on success
    setTimeout(() => {
      setIsLoading(false);
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    setAvatar(null); setFirstName(''); setLastName(''); setUsername('');
    setEmail(''); setPhone(''); setGender(''); setCountry('');
    setPassword(''); setErrors({}); setIsLoading(false);
  };

  const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="signup-backdrop"
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
              aria-labelledby="signup-title"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', stiffness: 310, damping: 28 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex"
              style={{ maxHeight: '92vh' }}
            >
              {/* ── LEFT PANEL ── */}
              <div
                className="relative hidden sm:flex flex-col justify-between w-[40%] shrink-0 rounded-2xl m-5 p-9 overflow-hidden"
                style={{
                  background: 'linear-gradient(150deg, #FB923C 0%, #F97316 50%, #FCD0A1 100%)',
                }}
              >
                {/* Noise */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-[0.07] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '180px',
                  }}
                />
                <div className="relative z-10">
                  <h2 className="text-white font-bold text-3xl leading-snug mb-1">
                    Join the<br />BunBite<br />
                    <span className="underline underline-offset-[6px] decoration-white/60">
                      family today.
                    </span>
                  </h2>
                  <p className="text-white/80 text-sm mt-5 leading-relaxed max-w-[230px]">
                    Create your free account and enjoy exclusive deals, saved orders, and seamless checkout every time.
                  </p>
                </div>
                <div className="relative z-10 flex justify-center mt-6">
                  <img
                    src={loginCharacters}
                    alt="BunBite characters"
                    className="w-full max-w-[270px] object-contain drop-shadow-lg"
                    style={{ marginBottom: '-1.25rem' }}
                  />
                </div>
              </div>

              {/* ── RIGHT PANEL (scrollable) ── */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Fixed header */}
                <div className="px-10 pt-10 pb-4 shrink-0">
                  <button
                    onClick={handleClose}
                    aria-label="Close signup"
                    className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-center gap-3 mb-5">
                    <img src={bunbiteLogo} alt="BunBite logo" className="w-10 h-10 object-contain" />
                    <span className="font-bold text-gray-800 text-lg tracking-wide">BunBite</span>
                  </div>
                  <h1 id="signup-title" className="text-3xl font-bold text-gray-900 mb-1">
                    Create an Account
                  </h1>
                  <p className="text-sm text-gray-400">Fill in the details below to get started.</p>
                </div>

                {/* Scrollable form body */}
                <div className="overflow-y-auto flex-1 px-10 pb-10">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-2" noValidate>

                    {/* Profile Picture */}
                    <Field
                      title="Profile Picture"
                      description="Upload a photo so other BunBite members can recognise you. Accepted formats: JPG, PNG, WebP (max 5 MB)."
                    >
                      <div className="flex items-center gap-5">
                        <div
                          onClick={() => fileRef.current?.click()}
                          className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-orange-400 flex items-center justify-center overflow-hidden cursor-pointer transition-colors shrink-0"
                        >
                          {avatar ? (
                            <img src={avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                          ) : (
                            <User size={28} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 font-medium transition-colors"
                          >
                            <Camera size={15} />
                            {avatar ? 'Change Photo' : 'Upload Photo'}
                          </button>
                          {avatar && (
                            <button
                              type="button"
                              onClick={() => { setAvatar(null); if (fileRef.current) fileRef.current.value = ''; }}
                              className="text-xs text-red-400 hover:text-red-500 text-left transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleAvatar}
                        />
                      </div>
                    </Field>

                    {/* First & Last name side by side */}
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        title="First Name"
                        description="Your legal first name as it appears on official documents."
                        error={errors.firstName}
                      >
                        <input
                          type="text"
                          placeholder="e.g. Jane"
                          value={firstName}
                          onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors((p) => ({ ...p, firstName: '' })); }}
                          className={inputClass(errors.firstName)}
                        />
                      </Field>
                      <Field
                        title="Last Name"
                        description="Your family name or surname."
                        error={errors.lastName}
                      >
                        <input
                          type="text"
                          placeholder="e.g. Doe"
                          value={lastName}
                          onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors((p) => ({ ...p, lastName: '' })); }}
                          className={inputClass(errors.lastName)}
                        />
                      </Field>
                    </div>

                    {/* Username */}
                    <Field
                      title="Username"
                      description="A unique handle that identifies your BunBite profile. Only letters, numbers, and underscores — minimum 3 characters."
                      error={errors.username}
                    >
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none">@</span>
                        <input
                          type="text"
                          placeholder="your_username"
                          value={username}
                          onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors((p) => ({ ...p, username: '' })); }}
                          className={`${inputClass(errors.username)} pl-8`}
                        />
                      </div>
                    </Field>

                    {/* Email */}
                    <Field
                      title="Email Address"
                      description="We'll send your order confirmations, receipts, and important account updates to this address."
                      error={errors.email}
                    >
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
                        className={inputClass(errors.email)}
                      />
                    </Field>

                    {/* Phone */}
                    <Field
                      title="Phone Number"
                      description="Used for delivery updates and two-factor authentication. Include your country code (e.g. +1 for the US)."
                      error={errors.phone}
                    >
                      <input
                        type="tel"
                        placeholder="+1 555 000 0000"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: '' })); }}
                        className={inputClass(errors.phone)}
                      />
                    </Field>

                    {/* Gender */}
                    <Field
                      title="Gender"
                      description="Helps us personalise your experience and address you correctly in communications."
                      error={errors.gender}
                    >
                      <div className="flex flex-wrap gap-2">
                        {GENDERS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => { setGender(g); if (errors.gender) setErrors((p) => ({ ...p, gender: '' })); }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                              gender === g
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-gray-100 text-gray-600 border-transparent hover:border-orange-300'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </Field>

                    {/* Country */}
                    <Field
                      title="Country"
                      description="Your country of residence. Countries are grouped by continent for easy browsing."
                      error={errors.country}
                    >
                      <select
                        value={country}
                        onChange={(e) => { setCountry(e.target.value); if (errors.country) setErrors((p) => ({ ...p, country: '' })); }}
                        className={`${inputClass(errors.country)} appearance-none cursor-pointer`}
                      >
                        <option value="" disabled>Select your country…</option>
                        {Object.entries(CONTINENTS).map(([continent, countries]) => (
                          <optgroup key={continent} label={`── ${continent} ──`}>
                            {countries.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </Field>

                    {/* Password */}
                    <Field
                      title="Password"
                      description="Create a strong password with at least 8 characters. Mix uppercase letters, numbers, and symbols for better security."
                      error={errors.password}
                    >
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
                          className={`${inputClass(errors.password)} pr-12`}
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
                      {/* Strength meter */}
                      {password && strength && (
                        <div className="mt-2 flex flex-col gap-1.5">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                  bar <= strength.bars ? strength.color : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs font-medium ${
                            strength.bars === 1 ? 'text-red-400' :
                            strength.bars === 2 ? 'text-orange-400' :
                            strength.bars === 3 ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            {strength.label}
                          </p>
                        </div>
                      )}
                    </Field>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm tracking-wide transition-colors disabled:opacity-70 flex items-center justify-center mt-2"
                    >
                      {isLoading ? (
                        <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Create Account'
                      )}
                    </motion.button>

                    {/* Back to login */}
                    <div className="flex flex-col items-center gap-2.5 pb-2">
                      <p className="text-xs text-gray-400">Already have an account?</p>
                      <button
                        type="button"
                        onClick={() => { handleClose(); onLoginClick(); }}
                        className="w-2/3 py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs tracking-wide transition-colors"
                      >
                        Login
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

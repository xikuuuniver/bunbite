import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Camera, User, ChevronLeft, Check } from 'lucide-react';
import loginCharacters from '@/assets/login-characters.png';
import bunbiteLogo from '@/assets/bunbite-logo.png';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

/* ─────────────────────────────────────────
   Countries + dial codes grouped by continent
───────────────────────────────────────── */
const CONTINENTS_DIAL: Record<string, { name: string; dial: string }[]> = {
  Asia: [
    { name:'Afghanistan',          dial:'+93'  },{ name:'Bangladesh',           dial:'+880' },
    { name:'Cambodia',             dial:'+855' },{ name:'China',                dial:'+86'  },
    { name:'India',                dial:'+91'  },{ name:'Indonesia',            dial:'+62'  },
    { name:'Iran',                 dial:'+98'  },{ name:'Iraq',                 dial:'+964' },
    { name:'Japan',                dial:'+81'  },{ name:'Jordan',               dial:'+962' },
    { name:'Kazakhstan',           dial:'+7'   },{ name:'Kuwait',               dial:'+965' },
    { name:'Kyrgyzstan',           dial:'+996' },{ name:'Laos',                 dial:'+856' },
    { name:'Lebanon',              dial:'+961' },{ name:'Malaysia',             dial:'+60'  },
    { name:'Mongolia',             dial:'+976' },{ name:'Myanmar',              dial:'+95'  },
    { name:'Nepal',                dial:'+977' },{ name:'North Korea',          dial:'+850' },
    { name:'Oman',                 dial:'+968' },{ name:'Pakistan',             dial:'+92'  },
    { name:'Philippines',          dial:'+63'  },{ name:'Qatar',                dial:'+974' },
    { name:'Saudi Arabia',         dial:'+966' },{ name:'Singapore',            dial:'+65'  },
    { name:'South Korea',          dial:'+82'  },{ name:'Sri Lanka',            dial:'+94'  },
    { name:'Syria',                dial:'+963' },{ name:'Taiwan',               dial:'+886' },
    { name:'Tajikistan',           dial:'+992' },{ name:'Thailand',             dial:'+66'  },
    { name:'Turkmenistan',         dial:'+993' },{ name:'United Arab Emirates', dial:'+971' },
    { name:'Uzbekistan',           dial:'+998' },{ name:'Vietnam',              dial:'+84'  },
    { name:'Yemen',                dial:'+967' },
  ],
  Europe: [
    { name:'Albania',              dial:'+355' },{ name:'Austria',              dial:'+43'  },
    { name:'Belarus',              dial:'+375' },{ name:'Belgium',              dial:'+32'  },
    { name:'Bosnia and Herzegovina',dial:'+387'},{ name:'Bulgaria',             dial:'+359' },
    { name:'Croatia',              dial:'+385' },{ name:'Cyprus',               dial:'+357' },
    { name:'Czech Republic',       dial:'+420' },{ name:'Denmark',              dial:'+45'  },
    { name:'Estonia',              dial:'+372' },{ name:'Finland',              dial:'+358' },
    { name:'France',               dial:'+33'  },{ name:'Germany',              dial:'+49'  },
    { name:'Greece',               dial:'+30'  },{ name:'Hungary',              dial:'+36'  },
    { name:'Iceland',              dial:'+354' },{ name:'Ireland',              dial:'+353' },
    { name:'Italy',                dial:'+39'  },{ name:'Latvia',               dial:'+371' },
    { name:'Lithuania',            dial:'+370' },{ name:'Luxembourg',           dial:'+352' },
    { name:'Malta',                dial:'+356' },{ name:'Moldova',              dial:'+373' },
    { name:'Montenegro',           dial:'+382' },{ name:'Netherlands',          dial:'+31'  },
    { name:'North Macedonia',      dial:'+389' },{ name:'Norway',               dial:'+47'  },
    { name:'Poland',               dial:'+48'  },{ name:'Portugal',             dial:'+351' },
    { name:'Romania',              dial:'+40'  },{ name:'Russia',               dial:'+7'   },
    { name:'Serbia',               dial:'+381' },{ name:'Slovakia',             dial:'+421' },
    { name:'Slovenia',             dial:'+386' },{ name:'Spain',                dial:'+34'  },
    { name:'Sweden',               dial:'+46'  },{ name:'Switzerland',          dial:'+41'  },
    { name:'Ukraine',              dial:'+380' },{ name:'United Kingdom',       dial:'+44'  },
  ],
  Africa: [
    { name:'Algeria',              dial:'+213' },{ name:'Angola',               dial:'+244' },
    { name:'Benin',                dial:'+229' },{ name:'Botswana',             dial:'+267' },
    { name:'Burkina Faso',         dial:'+226' },{ name:'Burundi',              dial:'+257' },
    { name:'Cameroon',             dial:'+237' },{ name:'Cape Verde',           dial:'+238' },
    { name:'Central African Republic',dial:'+236'},{ name:'Chad',               dial:'+235' },
    { name:'Comoros',              dial:'+269' },{ name:'Congo',                dial:'+242' },
    { name:'DR Congo',             dial:'+243' },{ name:'Djibouti',             dial:'+253' },
    { name:'Egypt',                dial:'+20'  },{ name:'Eritrea',              dial:'+291' },
    { name:'Eswatini',             dial:'+268' },{ name:'Ethiopia',             dial:'+251' },
    { name:'Gabon',                dial:'+241' },{ name:'Gambia',               dial:'+220' },
    { name:'Ghana',                dial:'+233' },{ name:'Guinea',               dial:'+224' },
    { name:'Guinea-Bissau',        dial:'+245' },{ name:'Ivory Coast',          dial:'+225' },
    { name:'Kenya',                dial:'+254' },{ name:'Lesotho',              dial:'+266' },
    { name:'Liberia',              dial:'+231' },{ name:'Libya',                dial:'+218' },
    { name:'Madagascar',           dial:'+261' },{ name:'Malawi',               dial:'+265' },
    { name:'Mali',                 dial:'+223' },{ name:'Mauritania',           dial:'+222' },
    { name:'Mauritius',            dial:'+230' },{ name:'Morocco',              dial:'+212' },
    { name:'Mozambique',           dial:'+258' },{ name:'Namibia',              dial:'+264' },
    { name:'Niger',                dial:'+227' },{ name:'Nigeria',              dial:'+234' },
    { name:'Rwanda',               dial:'+250' },{ name:'Senegal',              dial:'+221' },
    { name:'Sierra Leone',         dial:'+232' },{ name:'Somalia',              dial:'+252' },
    { name:'South Africa',         dial:'+27'  },{ name:'South Sudan',          dial:'+211' },
    { name:'Sudan',                dial:'+249' },{ name:'Tanzania',             dial:'+255' },
    { name:'Togo',                 dial:'+228' },{ name:'Tunisia',              dial:'+216' },
    { name:'Uganda',               dial:'+256' },{ name:'Zambia',               dial:'+260' },
    { name:'Zimbabwe',             dial:'+263' },
  ],
  'North America': [
    { name:'Antigua and Barbuda',  dial:'+1268'},{ name:'Bahamas',              dial:'+1242'},
    { name:'Barbados',             dial:'+1246'},{ name:'Belize',               dial:'+501' },
    { name:'Canada',               dial:'+1'   },{ name:'Costa Rica',           dial:'+506' },
    { name:'Cuba',                 dial:'+53'  },{ name:'Dominica',             dial:'+1767'},
    { name:'Dominican Republic',   dial:'+1809'},{ name:'El Salvador',          dial:'+503' },
    { name:'Grenada',              dial:'+1473'},{ name:'Guatemala',            dial:'+502' },
    { name:'Haiti',                dial:'+509' },{ name:'Honduras',             dial:'+504' },
    { name:'Jamaica',              dial:'+1876'},{ name:'Mexico',               dial:'+52'  },
    { name:'Nicaragua',            dial:'+505' },{ name:'Panama',               dial:'+507' },
    { name:'Saint Kitts and Nevis',dial:'+1869'},{ name:'Saint Lucia',          dial:'+1758'},
    { name:'Saint Vincent and the Grenadines',dial:'+1784'},
    { name:'Trinidad and Tobago',  dial:'+1868'},{ name:'United States',        dial:'+1'   },
  ],
  'South America': [
    { name:'Argentina',            dial:'+54'  },{ name:'Bolivia',              dial:'+591' },
    { name:'Brazil',               dial:'+55'  },{ name:'Chile',                dial:'+56'  },
    { name:'Colombia',             dial:'+57'  },{ name:'Ecuador',              dial:'+593' },
    { name:'Guyana',               dial:'+592' },{ name:'Paraguay',             dial:'+595' },
    { name:'Peru',                 dial:'+51'  },{ name:'Suriname',             dial:'+597' },
    { name:'Uruguay',              dial:'+598' },{ name:'Venezuela',            dial:'+58'  },
  ],
  Oceania: [
    { name:'Australia',            dial:'+61'  },{ name:'Fiji',                 dial:'+679' },
    { name:'Kiribati',             dial:'+686' },{ name:'Marshall Islands',     dial:'+692' },
    { name:'Micronesia',           dial:'+691' },{ name:'Nauru',                dial:'+674' },
    { name:'New Zealand',          dial:'+64'  },{ name:'Palau',                dial:'+680' },
    { name:'Papua New Guinea',     dial:'+675' },{ name:'Samoa',                dial:'+685' },
    { name:'Solomon Islands',      dial:'+677' },{ name:'Tonga',                dial:'+676' },
    { name:'Tuvalu',               dial:'+688' },{ name:'Vanuatu',              dial:'+678' },
  ],
  Antarctica: [
    { name:'Antarctica',           dial:'+672' },
  ],
};

/* flat country→dial lookup */
const COUNTRY_TO_DIAL: Record<string, string> = {};
Object.values(CONTINENTS_DIAL).flat().forEach(({ name, dial }) => { COUNTRY_TO_DIAL[name] = dial; });

/* flat list for the phone-code selector */
const ALL_DIAL = Object.entries(CONTINENTS_DIAL).map(([continent, list]) => ({ continent, list }));

/* ─────────────────────────────────────────
   Password strength + requirements
───────────────────────────────────────── */
const PW_RULES = [
  { id: 'len',     label: 'At least 8 characters',          test: (p: string) => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter (A–Z)',      test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter (a–z)',      test: (p: string) => /[a-z]/.test(p) },
  { id: 'number',  label: 'One number (0–9)',                test: (p: string) => /\d/.test(p) },
  { id: 'special', label: 'One special character (!@#$…)',   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(pw: string) {
  const passed = PW_RULES.filter(r => r.test(pw)).length;
  if (passed <= 1) return { label:'Weak',   color:'bg-red-400',    text:'text-red-400',    bars: 1 };
  if (passed <= 3) return { label:'Fair',   color:'bg-orange-400', text:'text-orange-400', bars: 2 };
  if (passed === 4) return { label:'Good',  color:'bg-yellow-400', text:'text-yellow-500', bars: 3 };
  return               { label:'Strong', color:'bg-green-500',  text:'text-green-500',  bars: 4 };
}

/* ─────────────────────────────────────────
   Allowed email domains
───────────────────────────────────────── */
const ALLOWED_DOMAINS = ['gmail.com', 'outlook.com', 'proton.me', 'hotmail.com', 'protonmail.com'];
const emailRx = new RegExp(`^[a-zA-Z0-9._%+\\-]+@(${ALLOWED_DOMAINS.map(d => d.replace('.', '\\.')).join('|')})$`, 'i');

/* ─────────────────────────────────────────
   Step definitions (10 total)
───────────────────────────────────────── */
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - 13 - i); // max 13 y/o
const DAYS  = Array.from({ length: 31  }, (_, i) => i + 1);

const STEPS = [
  { key:'country',   title:'Where are you from?',         desc:'Select your country of residence. Countries are grouped by continent for easy browsing.' },
  { key:'name',      title:"What's your name?",           desc:'Enter your legal first and last name as they appear on official documents.' },
  { key:'birthday',  title:'When is your birthday?',      desc:'Your date of birth helps us verify your age and personalise special offers for you.' },
  { key:'gender',    title:'How do you identify?',        desc:'This helps us personalise your experience and address you correctly in all communications.' },
  { key:'password',  title:'Create a strong password',    desc:'Your password keeps your account safe. Make sure it meets all the requirements listed below.' },
  { key:'avatar',    title:'Add a profile picture',       desc:'Upload a photo so other BunBite members can recognise you. JPG, PNG, or WebP — max 5 MB. You can skip this.' },
  { key:'username',  title:'Pick a unique username',      desc:'Your public handle on BunBite. Min 3 characters — letters, numbers, and underscores only. No spaces.' },
  { key:'email',     title:"What's your email address?",  desc:`We'll send order confirmations and account updates here. Accepted providers: ${ALLOWED_DOMAINS.join(', ')}.` },
  { key:'phone',     title:"What's your phone number?",   desc:'Select your country code, then enter your phone number (digits only). Used for delivery updates and 2FA.' },
  { key:'terms',     title:'Terms & Conditions',          desc:'Please read and agree to our Terms & Conditions and Privacy Policy to complete your registration.' },
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

const selectCls = (err?: string) => `${inputCls(err)} appearance-none cursor-pointer`;

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep]   = useState(0);
  const [dir,  setDir]    = useState(1);

  /* field values */
  const [country,     setCountry]     = useState('');
  const [firstName,   setFirstName]   = useState('');
  const [lastName,    setLastName]    = useState('');
  const [birthMonth,  setBirthMonth]  = useState('');
  const [birthDay,    setBirthDay]    = useState('');
  const [birthYear,   setBirthYear]   = useState('');
  const [gender,      setGender]      = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [avatar,      setAvatar]      = useState<string | null>(null);
  const [username,    setUsername]    = useState('');
  const [email,       setEmail]       = useState('');
  const [phoneCode,   setPhoneCode]   = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [error,         setError]         = useState('');
  const [isLoading,     setIsLoading]     = useState(false);
  const [termsSubStep,  setTermsSubStep]  = useState<0 | 1>(0); // 0 = T&C, 1 = Privacy Policy

  /* Pre-fill phone code when country changes */
  useEffect(() => {
    if (country && COUNTRY_TO_DIAL[country]) setPhoneCode(COUNTRY_TO_DIAL[country]);
  }, [country]);

  const strength = password ? getStrength(password) : null;

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* Per-step validation */
  const validate = (): string => {
    switch (STEPS[step].key) {
      case 'country':   return !country ? 'Please select your country.' : '';
      case 'name':
        if (!firstName.trim()) return 'Please enter your first name.';
        if (!lastName.trim())  return 'Please enter your last name.';
        return '';
      case 'birthday': {
        if (!birthMonth || !birthDay || !birthYear) return 'Please complete your date of birth.';
        const dob = new Date(+birthYear, MONTHS.indexOf(birthMonth), +birthDay);
        const minDate = new Date(); minDate.setFullYear(minDate.getFullYear() - 13);
        if (dob > minDate) return 'You must be at least 13 years old to create an account.';
        return '';
      }
      case 'gender':   return !gender ? 'Please select a gender.' : '';
      case 'password': {
        if (!password) return 'Password is required.';
        if (password.length < 8) return 'Password must be at least 8 characters.';
        const failedRules = PW_RULES.filter(r => !r.test(password));
        if (failedRules.length > 0) return `Missing: ${failedRules.map(r => r.label.toLowerCase()).join(', ')}.`;
        return '';
      }
      case 'avatar':   return '';
      case 'username':
        if (!username.trim()) return 'Username is required.';
        if (!/^[a-zA-Z0-9_]{3,}$/.test(username)) return 'Min 3 characters — letters, numbers, _ only.';
        return '';
      case 'email':
        if (!email.trim()) return 'Email address is required.';
        if (!emailRx.test(email)) return `Please use one of: ${ALLOWED_DOMAINS.join(', ')}.`;
        return '';
      case 'phone':
        if (!phoneNumber.trim()) return 'Phone number is required.';
        if (!/^\d{4,15}$/.test(phoneNumber)) return 'Enter 4–15 digits, no spaces or dashes.';
        return '';
      case 'terms': return '';
      default: return '';
    }
  };

  const advance = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    // Terms step: advance sub-step first, then submit on I Agree
    if (STEPS[step].key === 'terms') {
      if (termsSubStep === 0) { setTermsSubStep(1); return; }
      else { submit(); return; }
    }
    if (step < TOTAL - 1) { setDir(1); setStep(s => s + 1); }
    else submit();
  };

  const back = () => {
    setError('');
    // Reset terms sub-step so T&C is always shown first on re-entry
    if (STEPS[step].key === 'terms') setTermsSubStep(0);
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
    setCountry(''); setFirstName(''); setLastName('');
    setBirthMonth(''); setBirthDay(''); setBirthYear('');
    setGender(''); setPassword(''); setShowPw(false); setAvatar(null);
    setUsername(''); setEmail(''); setPhoneCode('+1'); setPhoneNumber('');
    setError(''); setIsLoading(false); setTermsSubStep(0);
  };

  /* ── Per-step input ── */
  const renderField = () => {
    const key = STEPS[step].key;

    /* Country */
    if (key === 'country') return (
      <select value={country} onChange={e => { setCountry(e.target.value); setError(''); }}
        className={selectCls(error)}>
        <option value="" disabled>Select your country…</option>
        {ALL_DIAL.map(({ continent, list }) => (
          <optgroup key={continent} label={`── ${continent} ──`}>
            {list.map(({ name }) => <option key={name} value={name}>{name}</option>)}
          </optgroup>
        ))}
      </select>
    );

    /* First + Last name */
    if (key === 'name') return (
      <div className="flex gap-3">
        <input type="text" placeholder="First name" value={firstName} autoFocus
          onChange={e => { setFirstName(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && advance()}
          className={`${inputCls(error)} flex-1`} />
        <input type="text" placeholder="Last name" value={lastName}
          onChange={e => { setLastName(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && advance()}
          className={`${inputCls(error)} flex-1`} />
      </div>
    );

    /* Birthday */
    if (key === 'birthday') return (
      <div className="flex gap-3">
        {/* Month */}
        <select value={birthMonth} onChange={e => { setBirthMonth(e.target.value); setError(''); }}
          className={`${selectCls(error)} flex-[2]`}>
          <option value="" disabled>Month</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {/* Day */}
        <select value={birthDay} onChange={e => { setBirthDay(e.target.value); setError(''); }}
          className={`${selectCls(error)} flex-1`}>
          <option value="" disabled>Day</option>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {/* Year */}
        <select value={birthYear} onChange={e => { setBirthYear(e.target.value); setError(''); }}
          className={`${selectCls(error)} flex-[1.5]`}>
          <option value="" disabled>Year</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    );

    /* Gender */
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

    /* Password + requirements */
    if (key === 'password') return (
      <div className="flex flex-col gap-4">
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} placeholder="Create a strong password"
            value={password} autoFocus
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && advance()}
            className={`${inputCls(error)} pr-13`} />
          <button type="button" onClick={() => setShowPw(p => !p)}
            aria-label={showPw ? 'Hide' : 'Show'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Strength bar */}
        {password && strength && (
          <div className="flex gap-1.5">
            {[1,2,3,4].map(b => (
              <div key={b} className={`h-2 flex-1 rounded-full transition-colors duration-300 ${b <= strength.bars ? strength.color : 'bg-gray-200'}`} />
            ))}
          </div>
        )}

        {/* Requirements checklist */}
        <div className="flex flex-col gap-2 bg-gray-50 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Password requirements</p>
          {PW_RULES.map(rule => {
            const passed = password ? rule.test(password) : false;
            return (
              <div key={rule.id} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${passed ? 'bg-green-500' : 'bg-gray-200'}`}>
                  {passed && <Check size={11} color="white" strokeWidth={3} />}
                </div>
                <span className={`text-sm transition-colors duration-200 ${passed ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                  {rule.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );

    /* Avatar */
    if (key === 'avatar') return (
      <div className="flex flex-col items-center gap-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-orange-400 flex items-center justify-center overflow-hidden cursor-pointer transition-colors">
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

    /* Username */
    if (key === 'username') return (
      <div className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-base font-semibold select-none">@</span>
        <input type="text" placeholder="your_username" value={username} autoFocus
          onChange={e => { setUsername(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && advance()}
          className={`${inputCls(error)} pl-9`} />
      </div>
    );

    /* Email */
    if (key === 'email') return (
      <div className="flex flex-col gap-3">
        <input type="email" placeholder="you@gmail.com" value={email} autoFocus
          onChange={e => { setEmail(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && advance()}
          className={inputCls(error)} />
        {/* Clickable domain chips */}
        <div className="flex flex-wrap gap-1.5">
          {ALLOWED_DOMAINS.map(d => {
            const active = email.toLowerCase().endsWith('@' + d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  const prefix = email.includes('@') ? email.split('@')[0] : email;
                  if (!prefix.trim()) return; // nothing typed yet — ignore tap
                  setEmail(`${prefix}@${d}`);
                  setError('');
                }}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-green-100 text-green-600 ring-1 ring-green-300'
                    : 'bg-gray-100 text-gray-400 hover:bg-orange-50 hover:text-orange-500'
                }`}>
                @{d}
              </button>
            );
          })}
        </div>
      </div>
    );

    /* Phone */
    if (key === 'phone') return (
      <div className="flex gap-2">
        {/* Country code dropdown */}
        <select value={phoneCode} onChange={e => { setPhoneCode(e.target.value); setError(''); }}
          className="shrink-0 w-36 px-3 py-4 rounded-2xl text-sm text-gray-700 bg-gray-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:bg-white appearance-none cursor-pointer transition">
          {ALL_DIAL.map(({ continent, list }) => (
            <optgroup key={continent} label={`── ${continent} ──`}>
              {list.map(({ name, dial }) => (
                <option key={name} value={dial}>{dial} {name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {/* Number input — digits only */}
        <input
          type="text" inputMode="numeric" placeholder="000 000 0000"
          value={phoneNumber} autoFocus
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '');
            setPhoneNumber(digits);
            setError('');
          }}
          onKeyDown={e => e.key === 'Enter' && advance()}
          className={`${inputCls(error)} flex-1`}
        />
      </div>
    );

    /* Terms & Conditions / Privacy Policy */
    if (key === 'terms') return (
      <div className="flex flex-col gap-3">
        <div className="h-56 overflow-y-auto bg-gray-50 rounded-2xl p-5 text-sm text-gray-500 leading-relaxed border border-gray-100">
          {termsSubStep === 0 ? (
            <>
              <p className="font-semibold text-gray-700 mb-3">1. Acceptance of Terms</p>
              <p className="mb-3">By creating a BunBite account you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our service. We reserve the right to update these terms at any time; continued use of the service constitutes your acceptance of any changes.</p>
              <p className="font-semibold text-gray-700 mb-3">2. Use of the Service</p>
              <p className="mb-3">BunBite grants you a limited, non-exclusive, non-transferable licence to access and use the platform solely for personal, non-commercial purposes. You may not reproduce, redistribute, sell, or exploit any portion of the service without prior written consent.</p>
              <p className="font-semibold text-gray-700 mb-3">3. User Accounts</p>
              <p className="mb-3">You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account. BunBite will not be liable for any losses arising from unauthorised access due to your failure to protect your credentials.</p>
              <p className="font-semibold text-gray-700 mb-3">4. Orders & Payments</p>
              <p className="mb-3">All orders placed through BunBite are subject to availability and confirmation. Prices are inclusive of applicable taxes unless stated otherwise. We reserve the right to refuse or cancel any order at our discretion.</p>
              <p className="font-semibold text-gray-700 mb-3">5. Intellectual Property</p>
              <p className="mb-3">All content on this platform — including logos, images, text, and software — is the exclusive property of BunBite or its licensors and is protected by applicable intellectual property laws.</p>
              <p className="font-semibold text-gray-700 mb-3">6. Limitation of Liability</p>
              <p>BunBite shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you in the six months preceding the claim.</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-700 mb-3">1. Information We Collect</p>
              <p className="mb-3">We collect information you provide directly (name, email, phone number, date of birth) and information generated by your use of the service (order history, preferences, device data). We may also receive information from third-party partners to improve our service.</p>
              <p className="font-semibold text-gray-700 mb-3">2. How We Use Your Information</p>
              <p className="mb-3">Your data is used to process orders, personalise your experience, send promotional offers (with your consent), improve our platform, and comply with legal obligations. We will never sell your personal data to third parties.</p>
              <p className="font-semibold text-gray-700 mb-3">3. Data Sharing</p>
              <p className="mb-3">We may share your information with trusted service providers (delivery partners, payment processors) who are contractually obligated to keep it confidential. We may also disclose data when required by law or to protect our rights.</p>
              <p className="font-semibold text-gray-700 mb-3">4. Cookies</p>
              <p className="mb-3">We use cookies and similar tracking technologies to enhance your browsing experience, analyse usage patterns, and serve relevant advertisements. You can control cookie settings through your browser preferences.</p>
              <p className="font-semibold text-gray-700 mb-3">5. Data Retention</p>
              <p className="mb-3">We retain your personal data for as long as your account is active or as required by law. You may request deletion of your data at any time by contacting our support team.</p>
              <p className="font-semibold text-gray-700 mb-3">6. Your Rights</p>
              <p>You have the right to access, correct, or delete your personal data. You may also object to processing or request data portability. To exercise these rights, please contact privacy@bunbite.com.</p>
            </>
          )}
        </div>
      </div>
    );

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="su-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
            onClick={handleClose} aria-hidden="true"
          />

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog" aria-modal="true" aria-labelledby="su-title"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', stiffness: 310, damping: 28 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex"
              style={{ minHeight: '560px', maxHeight: '94vh' }}
            >

              {/* ── LEFT PANEL ── */}
              <div
                className="relative hidden sm:flex flex-col justify-between w-[37%] shrink-0 rounded-2xl m-5 p-8 overflow-hidden"
                style={{ background:'linear-gradient(150deg,#FB923C 0%,#F97316 55%,#FCD0A1 100%)' }}
              >
                <div className="absolute inset-0 rounded-2xl opacity-[0.07] pointer-events-none"
                  style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:'180px' }}
                />

                <div className="relative z-10">
                  <h2 className="text-white font-bold text-xl leading-snug mb-5">
                    Join the BunBite<br />
                    <span className="underline underline-offset-[6px] decoration-white/60">family today.</span>
                  </h2>

                  {/* Step list */}
                  <div className="flex flex-col gap-2">
                    {STEPS.map((s, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          i < step    ? 'bg-white'
                          : i === step ? 'bg-white ring-2 ring-white/50 ring-offset-2 ring-offset-orange-500'
                          : 'bg-white/25'
                        }`}>
                          {i < step
                            ? <svg viewBox="0 0 12 12" fill="none" width="9" height="9"><path d="M2 6l3 3 5-5" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            : <span className={`text-[9px] font-bold leading-none ${i === step ? 'text-orange-500' : 'text-white/60'}`}>{i+1}</span>}
                        </div>
                        <span className={`text-xs leading-tight transition-colors duration-300 ${
                          i === step ? 'text-white font-bold' : i < step ? 'text-white/60' : 'text-white/35'
                        }`}>
                          {s.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 flex justify-center">
                  <img src={loginCharacters} alt="" className="w-full max-w-[220px] object-contain drop-shadow-lg" style={{ marginBottom:'-1.25rem' }} />
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
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

                  {/* Progress */}
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-orange-500 rounded-full"
                      animate={{ width:`${((step + 1) / TOTAL) * 100}%` }}
                      transition={{ duration: 0.35, ease:'easeInOut' }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400">Step {step + 1} of {TOTAL}</span>
                    <span className="text-xs text-orange-500 font-medium">{Math.round(((step + 1) / TOTAL) * 100)}%</span>
                  </div>
                </div>

                {/* Animated step */}
                <div className="flex-1 overflow-y-auto px-10 pb-2">
                  <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                      key={step}
                      custom={dir}
                      variants={slide}
                      initial="enter" animate="center" exit="exit"
                      transition={{ duration: 0.22, ease:'easeInOut' }}
                      className="flex flex-col gap-5 pt-2 pb-8"
                    >
                      {/* Heading */}
                      <div>
                        <h1 id="su-title" className="text-2xl font-bold text-gray-900 mb-2 leading-snug">
                          {STEPS[step].key === 'terms'
                            ? (termsSubStep === 0 ? 'Terms & Conditions' : 'Privacy Policy')
                            : STEPS[step].title}
                        </h1>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-md">
                          {STEPS[step].key === 'terms'
                            ? (termsSubStep === 0
                                ? 'Please read our Terms & Conditions carefully before continuing.'
                                : 'Please review our Privacy Policy to understand how we handle your data.')
                            : STEPS[step].desc}
                        </p>
                      </div>

                      {/* Input */}
                      <div>
                        {renderField()}
                        <AnimatePresence>
                          {error && (
                            <motion.p role="alert"
                              initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
                              exit={{ opacity:0, y:-4 }} transition={{ duration:0.15 }}
                              className="text-xs text-red-500 mt-2 pl-1">
                              {error}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Navigation */}
                      <div className="flex flex-col gap-3 mt-10">
                        <div className="flex gap-3">
                          {step > 0 && (
                            <button type="button" onClick={back}
                              className="flex items-center gap-1 px-5 py-3.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                              <ChevronLeft size={16} />Back
                            </button>
                          )}
                          <motion.button
                            type="button" onClick={advance} disabled={isLoading} whileTap={{ scale:0.98 }}
                            className="flex-1 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm tracking-wide transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                            {isLoading
                              ? <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              : STEPS[step].key === 'terms' && termsSubStep === 1 ? 'I Agree ✓' : 'Continue →'}
                          </motion.button>
                        </div>

                        {STEPS[step].key === 'avatar' && (
                          <button type="button"
                            onClick={() => { setDir(1); setStep(s => s + 1); }}
                            className="text-xs text-gray-400 hover:text-gray-600 text-center transition-colors">
                            Skip for now
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Fixed bottom — "Already have an account?" only on step 0 */}
                <AnimatePresence>
                  {step === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 px-10 pt-3 pb-7 flex flex-col items-center gap-2.5 border-t border-gray-100"
                    >
                      <p className="text-xs text-gray-400">Already have an account?</p>
                      <button
                        type="button"
                        onClick={() => { handleClose(); onLoginClick(); }}
                        className="w-2/3 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white font-semibold text-xs tracking-wide transition-colors"
                      >
                        Login
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

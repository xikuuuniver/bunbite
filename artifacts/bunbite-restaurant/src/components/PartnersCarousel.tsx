/**
 * PartnersCarousel
 * ─────────────────
 * Continuously scrolling logo strip (left → right, infinite loop).
 * • CSS keyframe scroll — GPU-accelerated, no JS per frame
 * • Pauses on hover (animation-play-state: paused on the track)
 * • Logos: grayscale by default → full colour + scale on hover
 * • Click opens partner website in a new tab
 *
 * To add/remove partners: edit the PARTNERS array below.
 */

import { useRef } from 'react';

/* ─── partner data ──────────────────────────────────────────────── */
interface Partner {
  id: string;
  name: string;
  url: string;
  /** Render prop — receives className for sizing */
  Logo: (props: { className?: string }) => JSX.Element;
}

/* Inline SVG wordmarks / icons for each brand */
const PARTNERS: Partner[] = [
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    url: 'https://www.coca-cola.com',
    Logo: ({ className }) => (
      <svg className={className} viewBox="0 0 140 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Coca-Cola">
        <path d="M22.4 8C12.6 8 5 15.6 5 24s7.6 16 17.4 16c6 0 11.3-2.9 14.5-7.4H31c-2 2.6-5.1 4.3-8.6 4.3C15.7 36.9 10 31 10 24s5.7-12.9 12.4-12.9c3.5 0 6.6 1.5 8.7 3.9h5.9C34 10.6 28.5 8 22.4 8z" fill="#E61C24"/>
        <path d="M52.4 15.5c-4.9 0-8.6 3.7-8.6 8.5s3.7 8.5 8.6 8.5 8.6-3.7 8.6-8.5-3.7-8.5-8.6-8.5zm0 13.5c-2.7 0-4.6-2.2-4.6-5s1.9-5 4.6-5 4.6 2.2 4.6 5-1.9 5-4.6 5z" fill="#E61C24"/>
        <path d="M75 15.5c-4.9 0-8.6 3.7-8.6 8.5s3.7 8.5 8.6 8.5 8.6-3.7 8.6-8.5S79.9 15.5 75 15.5zm0 13.5c-2.7 0-4.6-2.2-4.6-5s1.9-5 4.6-5 4.6 2.2 4.6 5-1.9 5-4.6 5z" fill="#E61C24"/>
        <path d="M88.5 16h4v16h-4V16zm2-6.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="#E61C24"/>
        <text x="100" y="31" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill="#E61C24">Cola</text>
      </svg>
    ),
  },
  {
    id: 'uber-eats',
    name: 'Uber Eats',
    url: 'https://www.ubereats.com',
    Logo: ({ className }) => (
      <svg className={className} viewBox="0 0 130 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Uber Eats">
        <rect x="4" y="14" width="20" height="20" rx="10" fill="#06C167"/>
        <path d="M10 24a4 4 0 108 0 4 4 0 00-8 0z" fill="white"/>
        <text x="30" y="31" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="17" fill="#06C167">Uber</text>
        <text x="78" y="31" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="17" fill="#1a1a1a">Eats</text>
      </svg>
    ),
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    url: 'https://www.mastercard.com',
    Logo: ({ className }) => (
      <svg className={className} viewBox="0 0 100 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
        <circle cx="36" cy="24" r="16" fill="#EB001B"/>
        <circle cx="64" cy="24" r="16" fill="#F79E1B"/>
        <path d="M50 13.2a16 16 0 010 21.6A16 16 0 0150 13.2z" fill="#FF5F00"/>
      </svg>
    ),
  },
  {
    id: 'spotify',
    name: 'Spotify',
    url: 'https://www.spotify.com',
    Logo: ({ className }) => (
      <svg className={className} viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Spotify">
        <circle cx="24" cy="24" r="18" fill="#1DB954"/>
        <path d="M15 19.5c5.5-1.8 13-1.8 18.5.5" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
        <path d="M16 24.5c4.5-1.4 10.5-1.4 15 .4" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M17 29c3.5-1 8-1 11.5.3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <text x="48" y="31" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="16" fill="#1DB954">Spotify</text>
      </svg>
    ),
  },
  {
    id: 'visa',
    name: 'Visa',
    url: 'https://www.visa.com',
    Logo: ({ className }) => (
      <svg className={className} viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
        <text x="8" y="34" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" fontStyle="italic" fill="#1A1F71">VISA</text>
      </svg>
    ),
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    url: 'https://www.doordash.com',
    Logo: ({ className }) => (
      <svg className={className} viewBox="0 0 140 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="DoorDash">
        <rect x="4" y="10" width="28" height="28" rx="14" fill="#FF3008"/>
        <path d="M12 28l4-10 4 10M13.5 25h5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="38" y="31" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="15" fill="#FF3008">DoorDash</text>
      </svg>
    ),
  },
  {
    id: 'heineken',
    name: 'Heineken',
    url: 'https://www.heineken.com',
    Logo: ({ className }) => (
      <svg className={className} viewBox="0 0 140 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Heineken">
        <rect x="4" y="8" width="32" height="32" rx="4" fill="#00833D"/>
        <text x="6" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="14" fill="white">HNK</text>
        <text x="42" y="31" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="16" fill="#00833D">Heineken</text>
      </svg>
    ),
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    url: 'https://maps.google.com',
    Logo: ({ className }) => (
      <svg className={className} viewBox="0 0 140 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Google Maps">
        <path d="M24 8C17.4 8 12 13.4 12 20c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12zm0 16a4 4 0 110-8 4 4 0 010 8z" fill="#EA4335"/>
        <path d="M24 8C17.4 8 12 13.4 12 20c0 3.6 1.5 6.8 4 9l8-17z" fill="#1A73E8"/>
        <text x="44" y="26" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="#4285F4">Google</text>
        <text x="44" y="38" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="#34A853">Maps</text>
      </svg>
    ),
  },
  {
    id: 'stripe',
    name: 'Stripe',
    url: 'https://www.stripe.com',
    Logo: ({ className }) => (
      <svg className={className} viewBox="0 0 100 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Stripe">
        <text x="8" y="33" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="26" fill="#635BFF">stripe</text>
      </svg>
    ),
  },
  {
    id: 'tripadvisor',
    name: 'Tripadvisor',
    url: 'https://www.tripadvisor.com',
    Logo: ({ className }) => (
      <svg className={className} viewBox="0 0 150 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Tripadvisor">
        <circle cx="18" cy="24" r="12" fill="#34E0A1"/>
        <circle cx="18" cy="24" r="5" fill="white"/>
        <circle cx="18" cy="24" r="2.5" fill="#000"/>
        <circle cx="42" cy="24" r="12" fill="#34E0A1"/>
        <circle cx="42" cy="24" r="5" fill="white"/>
        <circle cx="42" cy="24" r="2.5" fill="#000"/>
        <text x="58" y="30" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="#34E0A1">Tripadvisor</text>
      </svg>
    ),
  },
];

/* ─── inject global keyframe once ──────────────────────────────── */
const STYLE_ID = 'partners-scroll-style';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes partners-scroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .partners-track {
      animation: partners-scroll 32s linear infinite;
      will-change: transform;
    }
    .partners-strip:hover .partners-track {
      animation-play-state: paused;
    }
  `;
  document.head.appendChild(style);
}

/* ─── logo pill ─────────────────────────────────────────────────── */
function LogoPill({ partner }: { partner: Partner }) {
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${partner.name}`}
      title={partner.name}
      className="flex-shrink-0 flex items-center justify-center
                 px-6 py-3 mx-3 rounded-2xl bg-white
                 border border-primary/8 shadow-sm
                 grayscale opacity-60
                 hover:grayscale-0 hover:opacity-100 hover:scale-110
                 hover:shadow-md hover:border-primary/15
                 transition-all duration-300 ease-out cursor-pointer"
      style={{ minWidth: 120 }}
    >
      <partner.Logo className="h-8 w-auto" />
    </a>
  );
}

/* ─── main component ────────────────────────────────────────────── */
export default function PartnersCarousel() {
  const stripRef = useRef<HTMLDivElement>(null);

  // Duplicate set for seamless infinite loop
  const doubled = [...PARTNERS, ...PARTNERS];

  return (
    <section className="py-16 bg-background/50 border-b border-primary/6">
      <div className="container mx-auto px-4 mb-10 text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        bg-primary/6 border border-primary/12 mb-4">
          <span className="text-primary text-xs font-bold tracking-widest uppercase">
            Partners &amp; Sponsors
          </span>
        </div>

        <h2 className="font-display text-3xl md:text-4xl text-primary mb-3">
          TRUSTED PARTNERS &amp; SPONSORS
        </h2>
        <p className="text-foreground/50 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          We're proud to collaborate with trusted partners and sponsors who help us
          deliver the best experience to our customers.
        </p>
      </div>

      {/* ── Scroll strip ── */}
      <div
        ref={stripRef}
        className="partners-strip relative overflow-hidden select-none"
        /* Fade edges */
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div className="partners-track flex items-center py-3">
          {doubled.map((p, i) => (
            <LogoPill key={`${p.id}-${i}`} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

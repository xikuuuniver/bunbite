import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openSignup = () => { setIsLoginOpen(false); setIsSignupOpen(true); };
  const openLogin  = () => { setIsSignupOpen(false); setIsLoginOpen(true); };

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary/20 shadow-lg"
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <button
            className="text-white font-display text-3xl tracking-wider cursor-pointer bg-transparent border-0 p-0"
            onClick={() => scrollTo('home')}
            aria-label="BunBite — scroll to top"
            data-testid="link-logo"
          >
            BUNBITE
          </button>

          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Menu', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase() === 'home' ? 'home' : item.toLowerCase())}
                className="text-white hover:text-secondary font-medium transition-colors"
                data-testid={`link-${item.toLowerCase()}`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Login button — desktop */}
          <button
            onClick={() => setIsLoginOpen(true)}
            className="hidden md:flex items-center justify-center bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-2.5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95"
            data-testid="button-nav-login"
          >
            Login
          </button>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            data-testid="button-mobile-menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-primary pt-24 px-4 flex flex-col items-center gap-8 md:hidden"
          >
            {['Home', 'Menu', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase() === 'home' ? 'home' : item.toLowerCase())}
                className="text-white font-display text-3xl hover:text-secondary transition-colors"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }}
              className="bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-bold text-xl mt-4 w-full max-w-xs shadow-lg"
            >
              Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSignupClick={openSignup} />
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} onLoginClick={openLogin} />
    </>
  );
}

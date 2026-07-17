import { MapPin, Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-primary text-white pt-20 pb-8 relative border-t-8 border-secondary">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
          <span className="font-display text-5xl tracking-widest text-background">BUNBITE</span>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-24 mb-16 max-w-5xl mx-auto">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-display text-2xl mb-6 text-secondary">Location</h4>
            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-secondary shrink-0 mt-1" />
              <p className="text-background/80 leading-relaxed">
                123 Burger Lane,<br />
                Flavor City, BC 12345<br />
                United States
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <h4 className="font-display text-2xl mb-6 text-secondary">About Us</h4>
            <p className="text-background/80 leading-relaxed">
              We're a fun, bold burger joint that's all about flavor, freshness, and a good time. Every bite is a celebration of taste.
            </p>
            <div className="flex gap-4 mt-6">
              <button onClick={() => scrollTo('menu')} className="text-sm font-bold uppercase tracking-wider hover:text-secondary transition-colors">Menu</button>
              <button onClick={() => scrollTo('about')} className="text-sm font-bold uppercase tracking-wider hover:text-secondary transition-colors">Story</button>
              <button onClick={() => scrollTo('reserve')} className="text-sm font-bold uppercase tracking-wider hover:text-secondary transition-colors">Reserve</button>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <h4 className="font-display text-2xl mb-6 text-secondary">Contact Us</h4>
            <div className="flex flex-col gap-4 items-center md:items-end">
              <a href="mailto:hello@bunbite.com" className="flex items-center gap-3 text-background/80 hover:text-white transition-colors">
                <span>hello@bunbite.com</span>
                <Mail className="w-5 h-5 text-secondary" />
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 text-background/80 hover:text-white transition-colors">
                <span>(123) 456-7890</span>
                <Phone className="w-5 h-5 text-secondary" />
              </a>
              <div className="flex gap-4 mt-2">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">© 2025 BunBite. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-background/50">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '../components/PageHeader';
import { useToast } from '@/hooks/use-toast';

const themes = [
  { id: 'forest',  name: 'Forest & Gold', desc: 'The current BunBite signature palette.', colors: ['#2C4A1E', '#C8A415', '#F5EDD8'] },
  { id: 'midnight',name: 'Midnight Charcoal', desc: 'Bold dark theme for evening dining brands.', colors: ['#141414', '#E3B23C', '#2A2A2A'] },
  { id: 'citrus',  name: 'Citrus Pop', desc: 'Bright, playful palette for fast-casual spots.', colors: ['#FF6B35', '#FFC93C', '#FFF6E9'] },
  { id: 'coastal', name: 'Coastal Breeze', desc: 'Cool tones for seafood & café concepts.', colors: ['#0E4F66', '#7FD6C2', '#F0FAF9'] },
];

export default function Themes() {
  const [active, setActive] = useState('forest');
  const { toast } = useToast();

  return (
    <div>
      <PageHeader
        title="Themes"
        description="Choose the visual identity customers see across your ordering site and receipts."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {themes.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${active === t.id ? 'border-primary' : 'border-card-border'}`}
              onClick={() => setActive(t.id)}
              data-testid={`card-theme-${t.id}`}
            >
              <div className="h-24 flex">
                {t.colors.map((c, idx) => (
                  <div key={idx} className="flex-1" style={{ background: c }} />
                ))}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  {active === t.id && (
                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check size={12} className="text-primary-foreground" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={() => toast({ title: 'Theme applied', description: `${themes.find((t) => t.id === active)?.name} is now live on your site.` })}
          data-testid="button-apply-theme"
        >
          Apply Theme
        </Button>
      </div>
    </div>
  );
}

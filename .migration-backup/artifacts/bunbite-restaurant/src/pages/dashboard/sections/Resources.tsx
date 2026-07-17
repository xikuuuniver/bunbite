import { motion } from 'framer-motion';
import { FileText, Download, Sheet as SheetIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '../components/PageHeader';
import { resourceLinks } from '../data';
import { useToast } from '@/hooks/use-toast';

export default function Resources() {
  const { toast } = useToast();

  return (
    <div>
      <PageHeader title="Resources" description="Reference guides, checklists, and shared documents for your team." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {resourceLinks.map((r, i) => (
          <motion.div key={r.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="rounded-2xl border-card-border">
              <CardContent className="p-5 flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {r.type === 'XLSX' ? <SheetIcon size={20} /> : <FileText size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.type} · {r.size} · Updated {r.updated}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => toast({ title: 'Download started', description: `${r.title} is downloading…` })}
                    data-testid={`button-download-${r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  >
                    <Download size={14} className="mr-1.5" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

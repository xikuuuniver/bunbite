import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquareReply, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { reviews as initial } from '../data';
import { useToast } from '@/hooks/use-toast';

export default function ReviewsFeedback() {
  const [reviews, setReviews] = useState(initial);
  const [openReply, setOpenReply] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const { toast } = useToast();

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const unreplied = reviews.filter((r) => !r.replied).length;

  const submitReply = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, replied: true } : r)));
    setOpenReply(null);
    setDraft('');
    toast({ title: 'Reply sent', description: 'Your response is now visible to the customer.' });
  };

  return (
    <div>
      <PageHeader title="Reviews & Feedback" description="Read what customers are saying and respond directly." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard index={0} label="Average Rating" value={`${avgRating} / 5`} icon={Star} />
        <StatCard index={1} label="Total Reviews" value={String(reviews.length)} icon={MessageSquareReply} accent="secondary" />
        <StatCard index={2} label="Awaiting Reply" value={String(unreplied)} icon={Send} />
      </div>

      <div className="space-y-4">
        {reviews.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="rounded-2xl border-card-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full ${r.avatarColor} text-white font-bold flex items-center justify-center shrink-0`}>
                    {r.customer.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground">{r.customer}</p>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1 my-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} size={13} className={idx < r.rating ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'} />
                      ))}
                      <Badge variant="outline" className="ml-2">{r.item}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>

                    {r.replied ? (
                      <Badge variant="outline" className="mt-3 bg-emerald-50 text-emerald-700 border-emerald-200">Replied</Badge>
                    ) : openReply === r.id ? (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="Write a thoughtful reply…"
                          className="text-sm"
                          data-testid={`textarea-reply-${r.id}`}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => submitReply(r.id)} data-testid={`button-send-reply-${r.id}`}>Send Reply</Button>
                          <Button size="sm" variant="ghost" onClick={() => setOpenReply(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="mt-3" onClick={() => setOpenReply(r.id)} data-testid={`button-reply-${r.id}`}>
                        <MessageSquareReply size={14} className="mr-1.5" /> Reply
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, UserCog, UserCheck, UserX, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { staff } from '../data';
import { useToast } from '@/hooks/use-toast';

const statusColor: Record<string, string> = {
  'On Shift': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Off Shift': 'bg-muted text-muted-foreground border-border',
  'On Leave': 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function StaffManagement() {
  const { toast } = useToast();
  const onShift = staff.filter((s) => s.status === 'On Shift').length;

  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="View shifts, roles, and availability across your team."
        actions={
          <Button data-testid="button-add-staff" onClick={() => toast({ title: 'Invite sent', description: 'A new staff invite link was generated.' })}>
            <Plus size={16} className="mr-1.5" /> Add Staff
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard index={0} label="Team Size" value={String(staff.length)} icon={UserCog} />
        <StatCard index={1} label="On Shift Now" value={String(onShift)} icon={UserCheck} accent="secondary" />
        <StatCard index={2} label="On Leave" value={String(staff.filter((s) => s.status === 'On Leave').length)} icon={UserX} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {staff.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="rounded-2xl border-card-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-full ${s.avatarColor} text-white font-bold flex items-center justify-center shrink-0`}>
                    {s.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.role}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Shift: {s.shift}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={statusColor[s.status]}>{s.status}</Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`button-call-${s.id}`}>
                    <Phone size={14} />
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

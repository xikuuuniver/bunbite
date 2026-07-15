import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Boxes, PackageCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { inventoryItems as initial } from '../data';
import { useToast } from '@/hooks/use-toast';

export default function Inventory() {
  const [items, setItems] = useState(initial);
  const { toast } = useToast();

  const lowStock = items.filter((i) => i.stock < i.par * 0.5).length;

  const reorder = (name: string, id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, stock: i.par, updated: 'Just now' } : i)));
    toast({ title: 'Reorder placed', description: `Restocking ${name} to par level.` });
  };

  return (
    <div>
      <PageHeader title="Inventory" description="Monitor stock levels across ingredients and supplies." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard index={0} label="Tracked Items" value={String(items.length)} icon={Boxes} />
        <StatCard index={1} label="Low Stock Alerts" value={String(lowStock)} icon={AlertTriangle} accent="secondary" />
        <StatCard index={2} label="Fully Stocked" value={String(items.filter((i) => i.stock >= i.par).length)} icon={PackageCheck} />
      </div>

      <Card className="rounded-2xl border-card-border">
        <CardContent className="p-4 md:p-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => {
                const ratio = i.stock / i.par;
                const level = ratio < 0.3 ? 'Critical' : ratio < 0.7 ? 'Low' : 'Good';
                const levelColor =
                  level === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                  level === 'Low' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200';
                return (
                  <TableRow key={i.id} data-testid={`row-inventory-${i.id}`}>
                    <TableCell className="font-semibold">{i.name}</TableCell>
                    <TableCell className="text-muted-foreground">{i.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{i.stock} {i.unit}</span>
                        <Badge variant="outline" className={levelColor}>{level}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{i.supplier}</TableCell>
                    <TableCell className="text-muted-foreground">{i.updated}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" disabled={i.stock >= i.par} onClick={() => reorder(i.name, i.id)} data-testid={`button-reorder-${i.id}`}>
                        Reorder
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, Plus, MoreVertical, Pencil, Trash2, Copy, Eye, EyeOff,
  GripVertical, Tag, LayoutGrid, List, CheckCircle2, XCircle,
} from 'lucide-react';
import { useCategories } from '@/context/CategoryContext';
import { useMenu } from '@/context/MenuContext';
import { useToast } from '@/hooks/use-toast';
import { type Category } from '../data';
import CategoryFormModal from './CategoryFormModal';
import { cn } from '@/lib/utils';

// ── Category avatar (image or gradient fallback) ─────────────────────────────

const CAT_GRADIENTS = [
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-rose-400 to-pink-500',
  'from-sky-400 to-blue-500',
  'from-lime-400 to-green-500',
  'from-fuchsia-400 to-violet-500',
];

function catGradient(id: string) {
  const n = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return CAT_GRADIENTS[n % CAT_GRADIENTS.length];
}

function CategoryAvatar({ cat, size = 'md' }: { cat: Category; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-20 w-full' : 'h-14 w-14';
  const icon = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl';
  if (cat.image) {
    return (
      <div className={cn('rounded-xl overflow-hidden shrink-0 bg-muted', size === 'lg' ? 'rounded-none rounded-t-xl' : '', dim)}>
        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={cn(`bg-gradient-to-br ${catGradient(cat.id)} flex items-center justify-center shrink-0`, size === 'lg' ? 'rounded-none rounded-t-xl' : 'rounded-xl', dim)}>
      <span className={icon}>{cat.icon || '📁'}</span>
    </div>
  );
}

// ── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="flex-1 min-w-[120px] bg-card border border-card-border rounded-xl px-4 py-3">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Status + visibility badges ───────────────────────────────────────────────

function StatusBadge({ status }: { status: 'Active' | 'Inactive' }) {
  return status === 'Active'
    ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 text-[11px] font-medium">Active</Badge>
    : <Badge className="bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 text-[11px] font-medium">Inactive</Badge>;
}

function VisibilityBadge({ visible }: { visible: boolean }) {
  return visible
    ? <Badge variant="outline" className="text-[11px] font-medium text-sky-600 border-sky-200 bg-sky-50 dark:bg-sky-950/30">Visible</Badge>
    : <Badge variant="outline" className="text-[11px] font-medium text-slate-400 border-slate-200 bg-slate-50 dark:bg-slate-800">Hidden</Badge>;
}

// ── Card view ────────────────────────────────────────────────────────────────

function CategoryCard({
  cat, itemCount, onEdit, onDelete, onDuplicate, onToggleStatus, onToggleVisibility,
}: {
  cat: Category;
  itemCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleStatus: () => void;
  onToggleVisibility: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className={cn(
        'rounded-2xl border-card-border overflow-hidden transition-shadow hover:shadow-md',
        cat.status === 'Inactive' && 'opacity-60',
      )}>
        {/* Image / gradient banner */}
        <CategoryAvatar cat={cat} size="lg" />

        <CardContent className="p-4 space-y-3">
          {/* Name + icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {cat.icon && <span className="text-lg shrink-0">{cat.icon}</span>}
              <p className="font-semibold text-sm text-foreground truncate">{cat.name}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 -mr-1">
                  <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={onEdit}><Pencil size={13} className="mr-2" />Edit</DropdownMenuItem>
                <DropdownMenuItem onSelect={onDuplicate}><Copy size={13} className="mr-2" />Duplicate</DropdownMenuItem>
                <DropdownMenuItem onSelect={onToggleVisibility}>
                  {cat.visible ? <EyeOff size={13} className="mr-2" /> : <Eye size={13} className="mr-2" />}
                  {cat.visible ? 'Hide' : 'Show'}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onToggleStatus}>
                  {cat.status === 'Active' ? <XCircle size={13} className="mr-2" /> : <CheckCircle2 size={13} className="mr-2" />}
                  {cat.status === 'Active' ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 size={13} className="mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {cat.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={cat.status} />
            <VisibilityBadge visible={cat.visible} />
            <Badge variant="outline" className="text-[11px]">{itemCount} {itemCount === 1 ? 'item' : 'items'}</Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground">Updated {cat.updatedAt}</p>
            <div className="flex items-center gap-1">
              <Switch
                checked={cat.status === 'Active'}
                onCheckedChange={onToggleStatus}
                className="scale-75 origin-right"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Row (list + drag) ────────────────────────────────────────────────────────

function CategoryRow({
  cat, itemCount, onEdit, onDelete, onDuplicate, onToggleStatus, onToggleVisibility, draggable,
}: {
  cat: Category;
  itemCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleStatus: () => void;
  onToggleVisibility: () => void;
  draggable: boolean;
}) {
  const controls = useDragControls();

  const inner = (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl border border-card-border bg-card hover:bg-muted/30 transition-colors',
      cat.status === 'Inactive' && 'opacity-60',
    )}>
      {/* Drag handle */}
      {draggable ? (
        <GripVertical
          size={16}
          className="text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
          onPointerDown={(e) => controls.start(e)}
        />
      ) : (
        <div className="w-4 shrink-0" />
      )}

      {/* Avatar */}
      <CategoryAvatar cat={cat} size="sm" />

      {/* Name + desc */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {cat.icon && <span>{cat.icon}</span>}
          <p className="font-semibold text-sm text-foreground truncate">{cat.name}</p>
        </div>
        {cat.description && (
          <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
        )}
      </div>

      {/* Items */}
      <span className="text-xs text-muted-foreground shrink-0 w-16 text-center hidden sm:block">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </span>

      {/* Status */}
      <div className="shrink-0 hidden md:block"><StatusBadge status={cat.status} /></div>

      {/* Visibility */}
      <div className="shrink-0 hidden md:block"><VisibilityBadge visible={cat.visible} /></div>

      {/* Updated */}
      <span className="text-xs text-muted-foreground shrink-0 hidden lg:block w-28">{cat.updatedAt}</span>

      {/* Toggle */}
      <Switch
        checked={cat.status === 'Active'}
        onCheckedChange={onToggleStatus}
        className="shrink-0"
      />

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={onEdit}><Pencil size={13} className="mr-2" />Edit</DropdownMenuItem>
          <DropdownMenuItem onSelect={onDuplicate}><Copy size={13} className="mr-2" />Duplicate</DropdownMenuItem>
          <DropdownMenuItem onSelect={onToggleVisibility}>
            {cat.visible ? <EyeOff size={13} className="mr-2" /> : <Eye size={13} className="mr-2" />}
            {cat.visible ? 'Hide from customers' : 'Show to customers'}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onToggleStatus}>
            {cat.status === 'Active' ? <XCircle size={13} className="mr-2" /> : <CheckCircle2 size={13} className="mr-2" />}
            {cat.status === 'Active' ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 size={13} className="mr-2" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (!draggable) return <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{inner}</motion.div>;

  return (
    <Reorder.Item value={cat} dragListener={false} dragControls={controls} className="list-none">
      {inner}
    </Reorder.Item>
  );
}

// ── Delete confirmation dialog ───────────────────────────────────────────────

function DeleteDialog({
  open, cat, itemCount, otherCategories, onConfirm, onCancel,
}: {
  open: boolean;
  cat: Category | null;
  itemCount: number;
  otherCategories: Category[];
  onConfirm: (action: 'move' | 'delete', targetId?: string) => void;
  onCancel: () => void;
}) {
  const [action, setAction] = useState<'move' | 'delete'>('move');
  const [targetId, setTargetId] = useState('');

  if (!cat) return null;

  const canMove = otherCategories.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 size={18} /> Delete "{cat.name}"
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone.{' '}
            {itemCount > 0
              ? `This category contains ${itemCount} menu ${itemCount === 1 ? 'item' : 'items'}. Choose what to do with them.`
              : 'This category has no menu items.'}
          </DialogDescription>
        </DialogHeader>

        {itemCount > 0 && (
          <div className="space-y-3 py-2">
            <label className={cn(
              'flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors',
              action === 'move' ? 'border-primary bg-primary/5' : 'hover:bg-muted/40',
            )}>
              <input type="radio" className="mt-0.5" checked={action === 'move'} onChange={() => setAction('move')} disabled={!canMove} />
              <div>
                <p className="text-sm font-medium">Move items to another category</p>
                <p className="text-xs text-muted-foreground">All {itemCount} items will be reassigned.</p>
              </div>
            </label>
            {action === 'move' && canMove && (
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger className="ml-7">
                  <SelectValue placeholder="Choose destination category…" />
                </SelectTrigger>
                <SelectContent>
                  {otherCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <label className={cn(
              'flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors',
              action === 'delete' ? 'border-destructive bg-destructive/5' : 'hover:bg-muted/40',
            )}>
              <input type="radio" className="mt-0.5" checked={action === 'delete'} onChange={() => setAction('delete')} />
              <div>
                <p className="text-sm font-medium text-destructive">Delete all items in this category</p>
                <p className="text-xs text-muted-foreground">{itemCount} {itemCount === 1 ? 'item' : 'items'} will be permanently removed.</p>
              </div>
            </label>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={itemCount > 0 && action === 'move' && !targetId}
            onClick={() => onConfirm(itemCount > 0 ? action : 'delete', action === 'move' ? targetId : undefined)}
          >
            Delete Category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CategoryManagement() {
  const { categories, updateCategory, removeCategory, duplicateCategory, reorderCategories } = useCategories();
  const { menuItems, updateMenuItem, removeMenuItem } = useMenu();
  const { toast } = useToast();

  const [query, setQuery]         = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [visFilter, setVisFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [view, setView]           = useState<'grid' | 'list'>('grid');
  const [formOpen, setFormOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Item counts per category
  const itemCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of menuItems) {
      map.set(item.category, (map.get(item.category) ?? 0) + 1);
    }
    return map;
  }, [menuItems]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter);
    if (visFilter === 'visible') list = list.filter((c) => c.visible);
    if (visFilter === 'hidden')  list = list.filter((c) => !c.visible);
    return list;
  }, [categories, query, statusFilter, visFilter]);

  const isFiltering = query.trim() !== '' || statusFilter !== 'all' || visFilter !== 'all';

  // Stats
  const total    = categories.length;
  const active   = categories.filter((c) => c.status === 'Active').length;
  const hidden   = categories.filter((c) => !c.visible).length;
  const inactive = categories.filter((c) => c.status === 'Inactive').length;

  const openAdd  = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (cat: Category) => { setEditTarget(cat); setFormOpen(true); };

  const handleToggleStatus = (cat: Category) => {
    updateCategory(cat.id, { status: cat.status === 'Active' ? 'Inactive' : 'Active' });
    toast({ title: cat.status === 'Active' ? 'Category deactivated' : 'Category activated', description: `"${cat.name}" is now ${cat.status === 'Active' ? 'inactive' : 'active'}.` });
  };

  const handleToggleVisibility = (cat: Category) => {
    updateCategory(cat.id, { visible: !cat.visible });
    toast({ title: cat.visible ? 'Category hidden' : 'Category visible', description: `"${cat.name}" is now ${cat.visible ? 'hidden from' : 'visible to'} customers.` });
  };

  const handleDuplicate = (cat: Category) => {
    duplicateCategory(cat.id);
    toast({ title: 'Category duplicated', description: `"${cat.name} (Copy)" has been created.` });
  };

  const handleDeleteConfirm = (action: 'move' | 'delete', targetId?: string) => {
    if (!deleteTarget) return;
    const count = itemCounts.get(deleteTarget.name) ?? 0;

    if (action === 'move' && targetId) {
      const target = categories.find((c) => c.id === targetId);
      if (target) {
        menuItems
          .filter((i) => i.category === deleteTarget.name)
          .forEach((i) => updateMenuItem(i.id, { category: target.name }));
        toast({ title: 'Items moved', description: `${count} item${count !== 1 ? 's' : ''} moved to "${target.name}".` });
      }
    } else if (action === 'delete') {
      menuItems
        .filter((i) => i.category === deleteTarget.name)
        .forEach((i) => removeMenuItem(i.id));
    }

    removeCategory(deleteTarget.id);
    toast({ title: 'Category deleted', description: `"${deleteTarget.name}" has been removed.`, variant: 'destructive' });
    setDeleteTarget(null);
  };

  const sharedProps = (cat: Category) => ({
    cat,
    itemCount: itemCounts.get(cat.name) ?? 0,
    onEdit: () => openEdit(cat),
    onDelete: () => setDeleteTarget(cat),
    onDuplicate: () => handleDuplicate(cat),
    onToggleStatus: () => handleToggleStatus(cat),
    onToggleVisibility: () => handleToggleVisibility(cat),
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Categories</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Organise and control what customers see on the menu.</p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus size={14} className="mr-1.5" />New Category
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        <StatTile label="Total" value={total} />
        <StatTile label="Active" value={active} />
        <StatTile label="Hidden" value={hidden} sub="from customers" />
        <StatTile label="Inactive" value={inactive} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories…"
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="h-8 text-sm w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Visibility filter */}
        <Select value={visFilter} onValueChange={(v) => setVisFilter(v as typeof visFilter)}>
          <SelectTrigger className="h-8 text-sm w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All visibility</SelectItem>
            <SelectItem value="visible">Visible</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border overflow-hidden">
          <button
            onClick={() => setView('grid')}
            className={cn('px-2.5 py-1.5 transition-colors', view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
            aria-label="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('px-2.5 py-1.5 transition-colors', view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
            aria-label="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Drag hint */}
      {view === 'list' && !isFiltering && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <GripVertical size={12} />
          Drag rows to reorder categories. Order is reflected on the customer menu.
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-14 text-muted-foreground">
          <Tag size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No categories found</p>
          {isFiltering ? (
            <p className="text-xs mt-1">Try adjusting your filters.</p>
          ) : (
            <Button size="sm" variant="outline" className="mt-4" onClick={openAdd}>
              <Plus size={13} className="mr-1.5" />Add your first category
            </Button>
          )}
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <CategoryCard key={cat.id} {...sharedProps(cat)} />
          ))}
        </div>
      )}

      {/* List view — supports drag-and-drop when no filter is active */}
      {view === 'list' && filtered.length > 0 && (
        <>
          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            <div className="w-4 shrink-0" />
            <div className="w-10 shrink-0" />
            <div className="flex-1">Name</div>
            <div className="w-16 text-center hidden sm:block">Items</div>
            <div className="hidden md:block w-16">Status</div>
            <div className="hidden md:block w-16">Visibility</div>
            <div className="hidden lg:block w-28">Updated</div>
            <div className="w-10">On/Off</div>
            <div className="w-8" />
          </div>

          {isFiltering ? (
            <div className="space-y-2">
              {filtered.map((cat) => (
                <CategoryRow key={cat.id} {...sharedProps(cat)} draggable={false} />
              ))}
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={filtered}
              onReorder={reorderCategories}
              className="space-y-2"
            >
              {filtered.map((cat) => (
                <CategoryRow key={cat.id} {...sharedProps(cat)} draggable={true} />
              ))}
            </Reorder.Group>
          )}
        </>
      )}

      {/* Category form modal */}
      <CategoryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        editTarget={editTarget}
      />

      {/* Delete confirmation */}
      <DeleteDialog
        open={!!deleteTarget}
        cat={deleteTarget}
        itemCount={deleteTarget ? (itemCounts.get(deleteTarget.name) ?? 0) : 0}
        otherCategories={categories.filter((c) => c.id !== deleteTarget?.id)}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

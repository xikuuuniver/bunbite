import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { inventoryItems, type InventoryItem, type IngredientLine } from '../data';
import { useMenu } from '@/context/MenuContext';
import { useCategories } from '@/context/CategoryContext';
import {
  ImagePlus,
  X,
  Search,
  Clock,
  ChefHat,
  Leaf,
  Star,
  BookOpen,
  Hash,
  Package,
  Flame,
  AlertTriangle,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type RecipeStatus = 'Available' | "86'd";

const ALLERGENS = [
  'Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts',
  'Soy', 'Shellfish', 'Fish', 'Wheat', 'Sesame',
];

const SECTION_LABEL = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2';

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, hint, children, required }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {hint && <p className="text-xs text-muted-foreground -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Section divider ───────────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className={SECTION_LABEL}>
      <Icon size={13} />
      {label}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function NewRecipeModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { addMenuItem } = useMenu();
  const { categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Basic info ────────────────────────────────────────────────────────────
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<RecipeStatus>('Available');
  const [featured, setFeatured] = useState(false);

  // ── Timing & serving ──────────────────────────────────────────────────────
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servingSize, setServingSize] = useState('');

  // ── Ingredients ───────────────────────────────────────────────────────────
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredients, setIngredients] = useState<IngredientLine[]>([]);

  // ── Nutrition ─────────────────────────────────────────────────────────────
  const [calories, setCalories] = useState('');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [nutritionNotes, setNutritionNotes] = useState('');

  // ── Preparation ───────────────────────────────────────────────────────────
  const [instructions, setInstructions] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState('');

  // ── Image handling ────────────────────────────────────────────────────────
  const handleImageFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageFile(file);
  }, []);

  // ── Ingredient helpers ────────────────────────────────────────────────────
  const filteredInventory: InventoryItem[] = inventoryItems.filter((inv) =>
    inv.name.toLowerCase().includes(ingredientSearch.toLowerCase()) ||
    inv.category.toLowerCase().includes(ingredientSearch.toLowerCase()),
  );

  const isSelected = (id: string) => ingredients.some((i) => i.inventoryId === id);

  const toggleIngredient = (inv: InventoryItem) => {
    if (isSelected(inv.id)) {
      setIngredients((prev) => prev.filter((i) => i.inventoryId !== inv.id));
    } else {
      setIngredients((prev) => [
        ...prev,
        { inventoryId: inv.id, name: inv.name, unit: inv.unit, qty: '1' },
      ]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setIngredients((prev) =>
      prev.map((i) => {
        if (i.inventoryId !== id) return i;
        const next = Math.max(0.1, parseFloat(i.qty || '0') + delta);
        return { ...i, qty: parseFloat(next.toFixed(2)).toString() };
      }),
    );
  };

  const setQty = (id: string, value: string) => {
    setIngredients((prev) =>
      prev.map((i) => (i.inventoryId === id ? { ...i, qty: value } : i)),
    );
  };

  const toggleAllergen = (a: string) => {
    setAllergens((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    setImagePreview(null);
    setName('');
    setDescription('');
    setCategory('');
    setPrice('');
    setStatus('Available');
    setFeatured(false);
    setPrepTime('');
    setCookTime('');
    setServingSize('');
    setIngredientSearch('');
    setIngredients([]);
    setCalories('');
    setAllergens([]);
    setNutritionNotes('');
    setInstructions('');
    setTags('');
    setPriority('');
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!name.trim()) {
      toast({ title: 'Recipe name is required', variant: 'destructive' });
      return;
    }
    if (!category) {
      toast({ title: 'Please select a category', variant: 'destructive' });
      return;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({ title: 'Please enter a valid price', variant: 'destructive' });
      return;
    }

    addMenuItem({
      name: name.trim(),
      category,
      price: parseFloat(price),
      image: imagePreview ?? '',
      status,
      desc: description.trim() || undefined,
      prepTime: prepTime ? parseInt(prepTime, 10) : undefined,
      cookTime: cookTime ? parseInt(cookTime, 10) : undefined,
      servingSize: servingSize.trim() || undefined,
      calories: calories ? parseInt(calories, 10) : undefined,
      allergens: allergens.length > 0 ? allergens : undefined,
      nutritionNotes: nutritionNotes.trim() || undefined,
      instructions: instructions.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      priority: priority ? parseInt(priority, 10) : undefined,
      featured,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
    });

    toast({
      title: 'Recipe saved!',
      description: `"${name.trim()}" has been added to the ${category} menu and is now live.`,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <ChefHat size={18} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">New Recipe</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Add a new dish to the menu. Fields marked <span className="text-destructive font-medium">*</span> are required.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-5 space-y-7">

            {/* ── 1. Basics ─────────────────────────────────────────────── */}
            <section>
              <SectionHeading icon={BookOpen} label="Recipe Basics" />
              <div className="space-y-4">

                {/* Image upload */}
                <Field label="Recipe Image">
                  <div
                    onDrop={handleImageDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => !imagePreview && fileInputRef.current?.click()}
                    className={cn(
                      'relative w-full rounded-xl border-2 border-dashed transition-colors',
                      imagePreview
                        ? 'border-transparent cursor-default'
                        : 'border-border hover:border-primary/50 cursor-pointer bg-muted/30 hover:bg-muted/50',
                    )}
                  >
                    {imagePreview ? (
                      <div className="relative h-44 rounded-xl overflow-hidden">
                        <img src={imagePreview} alt="Recipe preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-9">
                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                          <ImagePlus size={18} className="text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">Drop an image or click to upload</p>
                          <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP · max 5 MB</p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageFile(f);
                      }}
                    />
                  </div>
                </Field>

                {/* Name */}
                <Field label="Recipe Name" required>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Smoky BBQ Double Stack"
                    maxLength={80}
                  />
                </Field>

                {/* Description */}
                <Field label="Description">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the dish — ingredients, cooking style, flavour profile…"
                    className="resize-none min-h-[76px]"
                    maxLength={400}
                  />
                  <p className="text-xs text-muted-foreground text-right -mt-1">{description.length}/400</p>
                </Field>

                {/* Category + Price */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Recipe Category" required>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((c) => c.status === 'Active')
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((c) => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Price (USD)" required>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="pl-6"
                      />
                    </div>
                  </Field>
                </div>

                {/* Status + Featured */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Recipe Status">
                    <Select value={status} onValueChange={(v) => setStatus(v as RecipeStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="86'd">86'd (Unavailable)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Featured Item">
                    <div className="flex items-center gap-3 h-9 px-3 rounded-md border border-input bg-transparent">
                      <Switch
                        id="featured-toggle"
                        checked={featured}
                        onCheckedChange={setFeatured}
                      />
                      <Label htmlFor="featured-toggle" className="text-sm cursor-pointer select-none text-muted-foreground">
                        {featured ? 'Yes — pinned to top' : 'No'}
                      </Label>
                    </div>
                  </Field>
                </div>
              </div>
            </section>

            {/* ── Divider ───────────────────────────────────────────────── */}
            <div className="border-t" />

            {/* ── 2. Timing & Serving ───────────────────────────────────── */}
            <section>
              <SectionHeading icon={Clock} label="Timing & Serving" />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Prep Time" hint="minutes">
                  <Input
                    type="number"
                    min="0"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="15"
                  />
                </Field>
                <Field label="Cook Time" hint="minutes">
                  <Input
                    type="number"
                    min="0"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    placeholder="20"
                  />
                </Field>
                <Field label="Serving Size">
                  <Input
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    placeholder="e.g. 1 burger"
                  />
                </Field>
              </div>
            </section>

            {/* ── Divider ───────────────────────────────────────────────── */}
            <div className="border-t" />

            {/* ── 3. Ingredients ────────────────────────────────────────── */}
            <section>
              <SectionHeading icon={Package} label="Ingredients — from Inventory" />

              {/* Selected pills */}
              {ingredients.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {ingredients.map((ing) => (
                    <span
                      key={ing.inventoryId}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1"
                    >
                      <CheckCircle2 size={11} />
                      {ing.name}
                      <span className="opacity-70">· {ing.qty} {ing.unit}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  placeholder="Search inventory…"
                  className="pl-8 h-8 text-sm"
                />
              </div>

              {/* Inventory list */}
              <div className="rounded-xl border overflow-hidden divide-y">
                {filteredInventory.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-5">No inventory items found.</p>
                )}
                {filteredInventory.map((inv) => {
                  const selected = isSelected(inv.id);
                  const line = ingredients.find((i) => i.inventoryId === inv.id);
                  const stockLow = inv.stock < inv.par * 0.5;
                  return (
                    <div
                      key={inv.id}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-colors',
                        selected ? 'bg-primary/5' : 'hover:bg-muted/40',
                      )}
                    >
                      <Checkbox
                        id={`ing-${inv.id}`}
                        checked={selected}
                        onCheckedChange={() => toggleIngredient(inv)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`ing-${inv.id}`}
                            className="text-sm font-medium cursor-pointer leading-none"
                          >
                            {inv.name}
                          </label>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {inv.category}
                          </Badge>
                          {stockLow && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                            >
                              Low stock
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {inv.stock} {inv.unit} in stock · {inv.supplier}
                        </p>
                      </div>

                      {/* Quantity stepper — only when selected */}
                      {selected && line && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQty(inv.id, -0.5)}
                            className="h-6 w-6 rounded-md border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <input
                            type="number"
                            min="0.1"
                            step="0.5"
                            value={line.qty}
                            onChange={(e) => setQty(inv.id, e.target.value)}
                            className="w-14 h-6 text-center text-xs border rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <button
                            type="button"
                            onClick={() => updateQty(inv.id, 0.5)}
                            className="h-6 w-6 rounded-md border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                          <span className="text-xs text-muted-foreground w-7">{inv.unit}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {ingredients.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  No ingredients selected yet. Check items above to add them.
                </p>
              )}
            </section>

            {/* ── Divider ───────────────────────────────────────────────── */}
            <div className="border-t" />

            {/* ── 4. Health & Nutrition ─────────────────────────────────── */}
            <section>
              <SectionHeading icon={Leaf} label="Health & Nutrition" />
              <div className="space-y-4">

                {/* Calories */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Calories (kcal)">
                    <div className="relative">
                      <Flame size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        placeholder="620"
                        className="pl-8"
                      />
                    </div>
                  </Field>
                </div>

                {/* Allergens */}
                <Field label="Allergens" hint="Check all that apply">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {ALLERGENS.map((a) => (
                      <label
                        key={a}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer text-sm transition-colors select-none',
                          allergens.includes(a)
                            ? 'border-destructive/40 bg-destructive/5 text-foreground'
                            : 'hover:bg-muted/40',
                        )}
                      >
                        <Checkbox
                          checked={allergens.includes(a)}
                          onCheckedChange={() => toggleAllergen(a)}
                        />
                        <AlertTriangle
                          size={12}
                          className={allergens.includes(a) ? 'text-destructive' : 'text-muted-foreground'}
                        />
                        {a}
                      </label>
                    ))}
                  </div>
                </Field>

                {/* Nutrition notes */}
                <Field label="Additional Nutrition Info" hint="e.g. macros, dietary flags, health claims">
                  <Textarea
                    value={nutritionNotes}
                    onChange={(e) => setNutritionNotes(e.target.value)}
                    placeholder="Protein: 38g · Fat: 22g · Carbs: 45g · Sodium: 820mg"
                    className="resize-none min-h-[64px]"
                  />
                </Field>
              </div>
            </section>

            {/* ── Divider ───────────────────────────────────────────────── */}
            <div className="border-t" />

            {/* ── 5. Preparation & Publishing ───────────────────────────── */}
            <section>
              <SectionHeading icon={Star} label="Preparation & Publishing" />
              <div className="space-y-4">

                {/* Instructions */}
                <Field label="Preparation Instructions">
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Step 1: Season the patty…&#10;Step 2: Grill for 4 minutes each side…"
                    className="resize-none min-h-[100px]"
                  />
                </Field>

                {/* Tags + Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Recipe Tags" hint="Comma-separated">
                    <div className="relative">
                      <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="spicy, house-special, grill"
                        className="pl-7"
                      />
                    </div>
                  </Field>

                  <Field label="Display Priority" hint="Lower = shown first">
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      placeholder="1"
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* bottom padding */}
            <div className="h-2" />
          </div>
        </ScrollArea>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-muted-foreground hidden sm:block">
            {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} selected
            {allergens.length > 0 && ` · ${allergens.length} allergen${allergens.length !== 1 ? 's' : ''} flagged`}
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <ChefHat size={15} className="mr-1.5" />
              Save Recipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

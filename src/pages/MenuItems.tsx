import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, GripVertical, UtensilsCrossed,
  Filter, Image as ImageIcon, Check, X, ToggleLeft, ToggleRight, Loader2, Search, Layers
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DashboardLayout from '@/components/DashboardLayout';
import { useMenuSectionsStore, useMenuItemsStore, MenuItem as MenuItemType, useRestaurantStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface SortableItemProps {
  item: MenuItemType;
  sectionName: string;
  onEdit: (item: MenuItemType) => void;
  onDelete: (item: MenuItemType) => void;
  onToggle: (id: string) => void;
}

const SortableMenuItem = ({ item, sectionName, onEdit, onDelete, onToggle }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "bg-card rounded-2xl p-4 border border-border flex items-center gap-5 transition-all",
        isDragging ? 'shadow-2xl ring-2 ring-primary/20 bg-muted scale-[1.02] z-50' : 'hover:border-primary/30'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="relative group/img overflow-hidden rounded-xl bg-muted w-20 h-20 shrink-0 border border-border">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-foreground text-lg truncate">{item.name}</h3>
          <span className={cn(
            "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border",
            item.is_available
              ? "bg-success/10 text-success border-success/30"
              : "bg-muted text-muted-foreground border-border"
          )}>
            {item.is_available ? 'In Stock' : 'Sold Out'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{item.description || 'No description'}</p>
        <div className="flex items-center gap-3">
          <span className="text-primary font-bold">₹{item.price}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-semibold uppercase">{sectionName}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggle(item.id)}
          className={cn(
            "h-10 w-10 rounded-full transition-colors",
            item.is_available ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted"
          )}
        >
          {item.is_available ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item)}
          className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const MenuItems = () => {
  const { user, isLoading: authLoading } = useAuthStore();
  const { restaurant, fetchRestaurant } = useRestaurantStore();
  const { sections, fetchSections } = useMenuSectionsStore();
  const { items, fetchItems, addItem, updateItem, deleteItem, toggleAvailability, reorderItems, isLoading } = useMenuItemsStore();
  const { toast } = useToast();

  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItemType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    section_id: '',
    image_url: '',
    is_available: true,
  });

  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      if (!restaurant) await fetchRestaurant();
      await fetchSections();
      fetchItems();
    };
    init();
  }, [user, authLoading, restaurant, fetchRestaurant, fetchSections, fetchItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredItems = useMemo(() => {
    let filtered = selectedSection === 'all'
      ? items
      : items.filter((item) => item.section_id === selectedSection);

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => a.position - b.position);
  }, [items, selectedSection, searchQuery]);

  const getSectionName = (sectionId: string) => {
    return sections.find((s) => s.id === sectionId)?.name || 'Uncategorized';
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const currentSectionId = selectedSection === 'all' ? (items.find(i => i.id === active.id)?.section_id || '') : selectedSection;

      const sectionItems = items.filter(i => i.section_id === currentSectionId);
      const oldIndex = sectionItems.findIndex((i) => i.id === active.id);
      const newIndex = sectionItems.findIndex((i) => i.id === over.id);

      const reordered = arrayMove(sectionItems, oldIndex, newIndex);

      await reorderItems(currentSectionId, reordered);

      toast({
        title: 'Reordered!',
        description: 'Menu order updated.',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      section_id: selectedSection !== 'all' ? selectedSection : (sections[0]?.id || ''),
      image_url: '',
      is_available: true,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, image_url: url }));
      toast({
        title: 'Uploaded!',
        description: 'Image synced with Cloudinary.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Could not upload image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddItem = async () => {
    if (!formData.name.trim() || !formData.section_id || !formData.price) {
      toast({
        title: 'Missing information',
        description: 'Please fill in the name, category, and price.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const { success, error } = await addItem({
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      section_id: formData.section_id,
      image_url: formData.image_url,
      is_available: formData.is_available,
    });
    setIsSaving(false);

    if (success) {
      resetForm();
      setIsAddDialogOpen(false);
      toast({
        title: 'Added!',
        description: `"${formData.name}" is now on your menu.`,
      });
    } else {
      toast({
        title: 'Failed to add',
        description: error || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !formData.name.trim() || !formData.section_id || !formData.price) return;

    setIsSaving(true);
    const { success, error } = await updateItem(editingItem.id, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      section_id: formData.section_id,
      image_url: formData.image_url,
      is_available: formData.is_available,
    });
    setIsSaving(false);

    if (success) {
      resetForm();
      setEditingItem(null);
      toast({
        title: 'Updated!',
        description: 'Menu item details saved.',
      });
    } else {
      toast({
        title: 'Failed to update',
        description: error || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleToggle = async (id: string) => {
    await toggleAvailability(id);
    const item = items.find(i => i.id === id);
    toast({
      title: item?.is_available ? 'Dish Sold Out' : 'Dish Back in Stock!',
      description: `"${item?.name}" status updated.`,
    });
  };

  const handleDeleteItem = async () => {
    if (deletingItem) {
      await deleteItem(deletingItem.id);
      setDeletingItem(null);
      toast({
        title: 'Deleted!',
        description: 'Item removed from database.',
      });
    }
  };

  const openEditDialog = (item: MenuItemType) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      section_id: item.section_id,
      image_url: item.image_url || '',
      is_available: item.is_available,
    });
    setEditingItem(item);
  };



  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
            <p className="text-muted-foreground mt-1 text-lg">Manage your dishes, pricing, and daily specials.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                className="pl-10 bg-card border-border h-11 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 h-11 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="border-0 bg-transparent h-8 w-full sm:w-[130px] focus:ring-0">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl">
                  <SelectItem value="all">All Category</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
              disabled={sections.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 rounded-xl shadow-lg shadow-primary/25 w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Dish
            </Button>
          </div>
        </div>

        {/* Categories Warning */}
        {sections.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-warning/10 border border-warning/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-bold text-warning">Categories Required</h4>
              <p className="text-warning/80 text-sm">You must create at least one category (like Starters or Drinks) before adding dishes.</p>
            </div>
            <Button variant="outline" className="border-warning/30 hover:bg-warning/10" onClick={() => window.location.href = '/sections'}>
              Set Up Categories
            </Button>
          </motion.div>
        )}

        {/* Items List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Fetching your secret recipes...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-20 border border-border border-dashed text-center"
          >
            <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <UtensilsCrossed className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">{searchQuery ? "No matching dishes" : "Your Menu is Blank"}</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search or category filter."
                : sections.length === 0
                  ? "Go to categories first to set up your menu structure."
                  : "Start adding some delicious dishes to wow your customers!"}
            </p>
            {!searchQuery && sections.length > 0 && (
              <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="rounded-xl px-10 h-14 font-bold shadow-xl shadow-primary/20">
                <Plus className="w-5 h-5 mr-2" />
                Add First Dish
              </Button>
            )}
          </motion.div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      sectionName={getSectionName(item.section_id)}
                      onEdit={openEditDialog}
                      onDelete={setDeletingItem}
                      onToggle={handleToggle}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Dialogs */}
        <Dialog open={isAddDialogOpen || !!editingItem} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingItem(null);
          }
        }}>
          <DialogContent className="bg-card border-border sm:max-w-[450px] rounded-2xl shadow-2xl p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingItem ? 'Update Dish' : 'Add New Dish'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Dish Name</Label>
                <Input
                  placeholder="e.g., Paneer Butter Masala"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-secondary border-border h-12 rounded-xl focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Description</Label>
                <Textarea
                  placeholder="What makes this dish special?"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="bg-secondary border-border rounded-xl focus:ring-primary/20 min-h-[80px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    className="bg-secondary border-border h-12 rounded-xl focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Category</Label>
                  <Select
                    value={formData.section_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, section_id: value }))}
                  >
                    <SelectTrigger className="bg-secondary border-border h-12 rounded-xl">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-xl">
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id} className="rounded-lg m-1">
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Dish Image</Label>
                <div className="flex items-center gap-4 p-3 bg-secondary border border-border rounded-2xl">
                  <div className="relative overflow-hidden rounded-xl bg-background w-20 h-20 border-2 border-dashed border-border flex items-center justify-center">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="border-primary/20 text-primary hover:bg-primary/10 rounded-lg font-bold"
                    >
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary border border-border rounded-2xl">
                <div>
                  <Label className="font-bold block">Availability</Label>
                  <span className="text-xs text-muted-foreground">In stock today?</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormData((prev) => ({ ...prev, is_available: !prev.is_available }))}
                  className={cn(
                    "h-12 w-12 rounded-full",
                    formData.is_available ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {formData.is_available ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </Button>
              </div>
            </div>
            <DialogFooter className="gap-3 mt-4">
              <Button variant="ghost" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingItem(null);
              }} className="h-12 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={editingItem ? handleEditItem : handleAddItem}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-xl shadow-lg shadow-primary/25 font-bold min-w-[140px]"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    {editingItem ? 'Save Changes' : 'Publish Dish'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
          <AlertDialogContent className="bg-card border-border rounded-2xl shadow-2xl">
            <AlertDialogHeader className="space-y-4">
              <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-10 h-10 text-destructive" />
              </div>
              <AlertDialogTitle className="text-3xl font-bold text-center">Delete Dish?</AlertDialogTitle>
              <AlertDialogDescription className="text-lg text-center font-medium">
                Are you sure you want to remove <span className="font-bold text-foreground">"{deletingItem?.name}"</span>?
                This will also delete its history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-4 mt-8 flex sm:flex-row flex-col">
              <AlertDialogCancel className="bg-secondary border-border h-14 rounded-xl flex-1 hover:bg-muted font-bold text-foreground">
                Keep on Menu
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteItem}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-14 rounded-xl flex-1 font-bold shadow-lg shadow-destructive/20"
              >
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default MenuItems;

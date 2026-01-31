import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, GripVertical, Layers, X, Check, Loader2 } from 'lucide-react';
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
import { useMenuSectionsStore, MenuSection, useRestaurantStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface SortableItemProps {
  section: MenuSection;
  onEdit: (section: MenuSection) => void;
  onDelete: (section: MenuSection) => void;
}

const SortableItem = ({ section, onEdit, onDelete }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

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
        "bg-card rounded-xl p-4 border border-border flex items-center gap-4 transition-all",
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

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground text-lg">{section.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{section.description || 'No description'}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(section)}
          className="hover:bg-primary/10 hover:text-primary h-10 w-10 rounded-full"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(section)}
          className="hover:bg-destructive/10 hover:text-destructive h-10 w-10 rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const MenuSections = () => {
  const { user, isLoading: authLoading } = useAuthStore();
  const { restaurant, fetchRestaurant } = useRestaurantStore();
  const { sections, fetchSections, addSection, updateSection, deleteSection, reorderSections, isLoading } = useMenuSectionsStore();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [deletingSection, setDeletingSection] = useState<MenuSection | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      if (!restaurant) await fetchRestaurant();
      fetchSections();
    };
    init();
  }, [user, authLoading, restaurant, fetchRestaurant, fetchSections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);

      await reorderSections(newSections);
      toast({
        title: 'Reordered!',
        description: 'New category order saved.',
      });
    }
  };

  const handleAddSection = async () => {
    if (formData.name.trim()) {
      const { success, error } = await addSection(formData.name.trim(), formData.description.trim());
      if (success) {
        setFormData({ name: '', description: '' });
        setIsAddDialogOpen(false);
        toast({
          title: 'Section created!',
          description: `"${formData.name}" is now live.`,
        });
      } else {
        toast({
          title: 'Failed to create',
          description: error || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditSection = async () => {
    if (editingSection && formData.name.trim()) {
      const { success, error } = await updateSection(editingSection.id, formData.name.trim(), formData.description.trim());
      if (success) {
        setFormData({ name: '', description: '' });
        setEditingSection(null);
        toast({
          title: 'Updated!',
          description: 'Changes have been saved to database.',
        });
      } else {
        toast({
          title: 'Failed to update',
          description: error || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteSection = async () => {
    if (deletingSection) {
      await deleteSection(deletingSection.id);
      setDeletingSection(null);
      toast({
        title: 'Deleted!',
        description: 'Category removed successfully.',
      });
    }
  };

  const openEditDialog = (section: MenuSection) => {
    setFormData({ name: section.name, description: section.description || '' });
    setEditingSection(section);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu Categories</h1>
            <p className="text-muted-foreground mt-1">Organize your menu items into structured sections.</p>
          </div>
          <Button
            onClick={() => {
              setFormData({ name: '', description: '' });
              setIsAddDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 h-12 px-6 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Section
          </Button>
        </div>

        {/* Sections List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Syncing your categories...</p>
          </div>
        ) : sections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-16 border border-dashed border-border text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Layers className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Your Menu is Empty</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Start by creating categories like "Appetizers", "Main Course", or "Desserts" to group your dishes.
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-xl px-8 shadow-xl shadow-primary/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Section
            </Button>
          </motion.div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {sections.map((section) => (
                    <SortableItem
                      key={section.id}
                      section={section}
                      onEdit={openEditDialog}
                      onDelete={setDeletingSection}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen || !!editingSection} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingSection(null);
          }
        }}>
          <DialogContent className="bg-card border-border sm:max-w-[425px] rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Category Name</label>
                <Input
                  placeholder="e.g., Starters, Main Course, Drinks"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-secondary border-border h-12 rounded-xl focus:ring-primary/20"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Description (Optional)</label>
                <Textarea
                  placeholder="Describe what's in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-secondary border-border rounded-xl focus:ring-primary/20 min-h-[100px] resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingSection(null);
              }} className="h-12 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={editingSection ? handleEditSection : handleAddSection}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-xl shadow-lg shadow-primary/20"
              >
                <Check className="w-5 h-5 mr-2" />
                {editingSection ? 'Save Changes' : 'Create Section'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingSection} onOpenChange={() => setDeletingSection(null)}>
          <AlertDialogContent className="bg-card border-border rounded-2xl shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold">Delete Category?</AlertDialogTitle>
              <AlertDialogDescription className="text-lg">
                This will permanently delete <span className="font-bold text-foreground">"{deletingSection?.name}"</span> and all items inside it. This action cannot be reversed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-4">
              <AlertDialogCancel className="bg-secondary border-border h-12 rounded-xl hover:bg-muted">
                Keep Section
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSection}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-12 rounded-xl px-8 shadow-lg shadow-destructive/20"
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

export default MenuSections;

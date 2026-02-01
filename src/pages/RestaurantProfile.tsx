import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    Clock,
    Image as ImageIcon,
    X,
    Plus,
    Save,
    Loader2,
    Info,
    Calendar,
    ChevronRight,
    ChevronDown,
    Circle
} from 'lucide-react';
import { useRestaurantStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const RestaurantProfile = () => {
    const { restaurant, updateProfile, fetchRestaurant } = useRestaurantStore();
    const { toast } = useToast();

    const [description, setDescription] = useState('');
    const [businessHours, setBusinessHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '23:00', closed: false },
        sunday: { open: '09:00', close: '23:00', closed: false },
    });
    const [images, setImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (restaurant) {
            setDescription(restaurant.description || '');
            setImages(restaurant.images || []);
            if (restaurant.business_hours) {
                setBusinessHours(restaurant.business_hours);
            }
        } else {
            fetchRestaurant();
        }
    }, [restaurant, fetchRestaurant]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (images.length >= 5) {
            toast({
                title: 'Limit reached',
                description: 'You can only add up to 5 images.',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setImages([...images, url]);
            toast({ title: 'Uploaded!', description: 'Image added to your profile.' });
        } catch (error: any) {
            toast({ title: 'Upload failed', description: error.message || 'Could not upload image.', variant: 'destructive' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddImageUrl = () => {
        if (!newImageUrl) return;
        if (images.length >= 5) {
            toast({ title: 'Limit reached', description: 'You can only add up to 5 images.', variant: 'destructive' });
            return;
        }
        setImages([...images, newImageUrl]);
        setNewImageUrl('');
    };

    const handleDayChange = (day: string, field: 'open' | 'close' | 'closed', value: any) => {
        setBusinessHours(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const copyToAll = (day: string) => {
        const source = businessHours[day];
        const newHours: any = {};
        DAYS_OF_WEEK.forEach(d => {
            newHours[d] = { ...source };
        });
        setBusinessHours(newHours);
        toast({ title: 'Copied!', description: `Applied ${day}'s hours to all days.` });
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { success, error } = await updateProfile({
            description,
            images,
            business_hours: businessHours,
        });
        setIsSaving(false);

        if (success) {
            toast({ title: 'Profile updated', description: 'Your profile has been saved successfully.' });
        } else {
            toast({ title: 'Update failed', description: error || 'Failed to update profile.', variant: 'destructive' });
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Store className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-foreground">Restaurant Profile</h1>
                        </div>
                        <p className="text-lg text-muted-foreground ml-1">Customize how customers see your restaurant online.</p>
                    </div>
                    <Button
                        size="lg"
                        className="rounded-2xl h-14 px-10 font-black text-lg shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95 group"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-12 space-y-10">
                        {/* Business Hours Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-border bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Business Hours</h2>
                                        <p className="text-muted-foreground text-sm">Set your weekly opening and closing schedule.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 gap-4">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <div
                                            key={day}
                                            className={cn(
                                                "flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl border transition-all duration-300",
                                                businessHours[day].closed
                                                    ? "bg-muted/50 border-transparent opacity-60"
                                                    : "bg-secondary/30 border-border hover:border-primary/30 shadow-sm"
                                            )}
                                        >
                                            <div className="flex items-center gap-4 min-w-[140px]">
                                                <div className={cn(
                                                    "w-3 h-3 rounded-full",
                                                    businessHours[day].closed ? "bg-muted-foreground" : "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]"
                                                )} />
                                                <span className="text-lg font-black uppercase tracking-widest">{day}</span>
                                            </div>

                                            <div className="flex flex-1 items-center justify-center md:justify-start gap-8">
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={!businessHours[day].closed}
                                                        onCheckedChange={(checked) => handleDayChange(day, 'closed', !checked)}
                                                    />
                                                    <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                                                        {businessHours[day].closed ? 'Closed' : 'Open'}
                                                    </span>
                                                </div>

                                                {!businessHours[day].closed && (
                                                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Open</Label>
                                                            <Input
                                                                type="time"
                                                                value={businessHours[day].open}
                                                                onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                                                                className="h-11 bg-card border-border rounded-xl font-bold w-32"
                                                            />
                                                        </div>
                                                        <div className="pt-6 font-bold text-muted-foreground text-xl">→</div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Close</Label>
                                                            <Input
                                                                type="time"
                                                                value={businessHours[day].close}
                                                                onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                                                                className="h-11 bg-card border-border rounded-xl font-bold w-32"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {!businessHours[day].closed && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToAll(day)}
                                                    className="text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground rounded-xl"
                                                >
                                                    Copy to All Days
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.section>

                        {/* Description Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <motion.section
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden flex flex-col"
                            >
                                <div className="p-8 border-b border-border bg-muted/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Info className="w-6 h-6 text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-bold">About Us</h2>
                                    </div>
                                </div>
                                <div className="p-8 flex-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Restaurant Bio</Label>
                                    <Textarea
                                        placeholder="Tell your story... What makes your cuisine unique?"
                                        className="min-h-[300px] h-full bg-secondary/30 border-border rounded-3xl p-6 text-lg leading-relaxed focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </motion.section>

                            {/* Images Section */}
                            <motion.section
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden flex flex-col"
                            >
                                <div className="p-8 border-b border-border bg-muted/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Gallery</h2>
                                    </div>
                                </div>
                                <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {images.map((url, index) => (
                                            <motion.div
                                                key={index}
                                                layoutId={`img-${index}`}
                                                className="relative aspect-square group rounded-[1.5rem] overflow-hidden border-2 border-border hover:border-primary transition-all shadow-lg"
                                            >
                                                <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <button
                                                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                                                        className="w-12 h-12 bg-destructive text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl border-4 border-white/20"
                                                    >
                                                        <X className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {images.length < 5 && (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className={cn(
                                                    "aspect-square rounded-[1.5rem] border-4 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden group shadow-inner",
                                                    isUploading && "pointer-events-none"
                                                )}
                                            >
                                                {isUploading ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                                        <span className="text-[10px] font-black uppercase tracking-tighter">Saving to Cloud...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="p-4 bg-muted rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            <Plus className="w-8 h-8" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest mt-4">Add Photo</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Or Add via URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Paste image link here..."
                                                className="bg-secondary/30 border-border h-12 rounded-xl"
                                                value={newImageUrl}
                                                onChange={(e) => setNewImageUrl(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
                                            />
                                            <Button onClick={handleAddImageUrl} variant="secondary" className="h-12 px-6 rounded-xl font-bold bg-muted hover:bg-muted/80">
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RestaurantProfile;

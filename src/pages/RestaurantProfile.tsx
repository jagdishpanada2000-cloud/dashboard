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
            toast({ title: 'Uploaded!', description: 'Image added.' });
        } catch (error: any) {
            toast({ title: 'Upload failed', description: error.message || 'Could not upload.', variant: 'destructive' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddImageUrl = () => {
        if (!newImageUrl) return;
        if (images.length >= 5) {
            toast({ title: 'Limit reached', description: 'Up to 5 images only.', variant: 'destructive' });
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
        toast({ title: 'Copied!', description: `Applied to all days.` });
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
            toast({ title: 'Saved', description: 'Profile updated.' });
        } else {
            toast({ title: 'Error', description: error || 'Failed to save.', variant: 'destructive' });
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-5 sm:space-y-8 pb-10 px-3 sm:px-6">
                {/* Compact Header */}
                <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Store className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Profile</h1>
                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-widest opacity-60">Store Settings</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        className="rounded-xl h-10 sm:h-12 px-5 sm:px-8 font-black text-sm shadow-lg shadow-primary/20 bg-primary hover:bg-primary/95 transition-all active:scale-95 transition-all"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Save</>}
                    </Button>
                </div>

                {/* Business Hours - Small & Clean */}
                <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden"
                >
                    <div className="px-5 py-3 sm:px-8 sm:py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider">Business Hours</h2>
                        </div>
                    </div>

                    <div className="p-2 sm:p-4">
                        <div className="bg-secondary/10 rounded-xl sm:rounded-2xl border border-border/20 divide-y divide-border/5">
                            {DAYS_OF_WEEK.map((day) => (
                                <div key={day} className={cn(
                                    "flex items-center gap-2 sm:gap-4 p-2.5 sm:p-4 transition-colors",
                                    businessHours[day].closed ? "opacity-40 grayscale-[0.5]" : "bg-transparent"
                                )}>
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-[70px] sm:min-w-[120px]">
                                        <Switch
                                            checked={!businessHours[day].closed}
                                            onCheckedChange={(checked) => handleDayChange(day, 'closed', !checked)}
                                            className="scale-[0.65] sm:scale-75"
                                        />
                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-tighter truncate">
                                            {day.substring(0, 3)}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex items-center justify-end sm:justify-start gap-1.5 sm:gap-3">
                                        {!businessHours[day].closed ? (
                                            <div className="flex items-center gap-1 sm:gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                                <Input
                                                    type="time"
                                                    value={businessHours[day].open}
                                                    onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                                                    className="h-7 sm:h-9 bg-card border-border rounded-lg font-bold w-[65px] sm:w-24 px-1.5 text-[9px] sm:text-xs"
                                                />
                                                <span className="text-[8px] sm:text-[10px] font-black opacity-30">TO</span>
                                                <Input
                                                    type="time"
                                                    value={businessHours[day].close}
                                                    onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                                                    className="h-7 sm:h-9 bg-card border-border rounded-lg font-bold w-[65px] sm:w-24 px-1.5 text-[9px] sm:text-xs"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ml-2">Shop Closed</span>
                                        )}
                                    </div>

                                    {!businessHours[day].closed && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyToAll(day)}
                                            className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg hover:bg-primary/10 text-primary transition-all active:scale-90"
                                        >
                                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Info & Gallery - Two Columns or Stack */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                    {/* About Section */}
                    <motion.section
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col"
                    >
                        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider">About Us</h2>
                        </div>
                        <div className="p-4 sm:p-6 flex-1">
                            <Textarea
                                placeholder="Our story..."
                                className="min-h-[120px] sm:min-h-[180px] h-full bg-secondary/5 border-border rounded-xl sm:rounded-2xl p-4 text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-primary/10 transition-all resize-none font-medium"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </motion.section>

                    {/* Gallery Section */}
                    <motion.section
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col"
                    >
                        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider">Gallery</h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {images.map((url, index) => (
                                    <div key={index} className="relative aspect-square group rounded-[0.75rem] sm:rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                ))}

                                {images.length < 5 && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "aspect-square rounded-[0.75rem] sm:rounded-xl border-dashed border-2 border-border/50 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/30 hover:border-primary/30 transition-all cursor-pointer group",
                                            isUploading && "pointer-events-none"
                                        )}
                                    >
                                        {isUploading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        ) : (
                                            <Plus className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-primary transition-colors" />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 border-t border-border/10 flex gap-2">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                <Input
                                    placeholder="Link..."
                                    className="bg-secondary/5 border-border h-8 rounded-lg text-[10px] font-medium"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
                                />
                                <Button onClick={handleAddImageUrl} variant="secondary" className="h-8 px-3 rounded-lg font-black text-[10px] bg-muted">Add</Button>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RestaurantProfile;

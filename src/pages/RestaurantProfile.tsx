import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Clock, Image as ImageIcon, X, Plus, Save, Loader2, Info } from 'lucide-react';
import { useRestaurantStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

const RestaurantProfile = () => {
    const { restaurant, updateProfile, isLoading, fetchRestaurant } = useRestaurantStore();
    const { toast } = useToast();

    const [description, setDescription] = useState('');
    const [openingTime, setOpeningTime] = useState('');
    const [closingTime, setClosingTime] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (restaurant) {
            setDescription(restaurant.description || '');
            setOpeningTime(restaurant.opening_time || '');
            setClosingTime(restaurant.closing_time || '');
            setImages(restaurant.images || []);
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
            toast({
                title: 'Uploaded!',
                description: 'Image added to your profile.',
            });
        } catch (error: any) {
            toast({
                title: 'Upload failed',
                description: error.message || 'Could not upload image.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddImageUrl = () => {
        if (!newImageUrl) return;
        if (images.length >= 5) {
            toast({
                title: 'Limit reached',
                description: 'You can only add up to 5 images.',
                variant: 'destructive',
            });
            return;
        }
        setImages([...images, newImageUrl]);
        setNewImageUrl('');
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { success, error } = await updateProfile({
            description,
            opening_time: openingTime || null,
            closing_time: closingTime || null,
            images,
        });
        setIsSaving(false);

        if (success) {
            toast({
                title: 'Profile updated',
                description: 'Your restaurant profile has been saved successfully.',
            });
        } else {
            toast({
                title: 'Update failed',
                description: error || 'Failed to update profile.',
                variant: 'destructive',
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Restaurant Profile</h1>
                    <p className="text-muted-foreground mt-2">Manage your restaurant's public identity</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-2xl p-6 border border-border space-y-6 shadow-sm"
                        >
                            <div className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-4 w-full">
                                <Info className="w-5 h-5 text-primary" />
                                <h2>General Information</h2>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Restaurant Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Tell customers about your restaurant, your story, your cuisine..."
                                    className="min-h-[150px] bg-secondary border-border"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Detailed descriptions help customers discover you.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="opening_time">Opening Time</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="opening_time"
                                            type="time"
                                            className="pl-10 bg-secondary border-border"
                                            value={openingTime}
                                            onChange={(e) => setOpeningTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="closing_time">Closing Time</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="closing_time"
                                            type="time"
                                            className="pl-10 bg-secondary border-border"
                                            value={closingTime}
                                            onChange={(e) => setClosingTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card rounded-2xl p-6 border border-border space-y-6 shadow-sm"
                        >
                            <div className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-4 w-full">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                <h2>Restaurant Images</h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {images.map((url, index) => (
                                    <div key={index} className="relative aspect-square group">
                                        <img
                                            src={url}
                                            alt={`Restaurant ${index + 1}`}
                                            className="w-full h-full object-cover rounded-xl border border-border"
                                        />
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {images.length < 5 && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden",
                                            isUploading && "pointer-events-none opacity-50"
                                        )}
                                    >
                                        {isUploading ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <Plus className="w-8 h-8 mb-1" />
                                                <span className="text-[10px] font-medium text-center px-1">Upload Photo</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <Input
                                    placeholder="Or paste image URL here..."
                                    className="bg-secondary border-border text-sm"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
                                />
                                <Button onClick={handleAddImageUrl} variant="secondary" className="shrink-0">
                                    Add URL
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <ImageIcon className="w-3 h-3" />
                                Tip: Use high-quality images of your dishes or restaurant interior. (Max 5)
                            </p>
                        </motion.div>
                    </div>

                    {/* Save Sidebar */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-4"
                        >
                            <h3 className="font-bold flex items-center gap-2 uppercase tracking-wider text-xs text-primary">
                                <Store className="w-4 h-4" />
                                Quick Preview
                            </h3>
                            <p className="text-sm text-muted-foreground italic">
                                "{description ? (description.length > 100 ? description.substring(0, 100) + '...' : description) : 'No description provided yet.'}"
                            </p>
                            <div className="space-y-2 text-sm pt-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Images Added:</span>
                                    <span className="font-bold">{images.length} / 5</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Hours:</span>
                                    <span className="font-bold">
                                        {openingTime && closingTime ? `${openingTime} - ${closingTime}` : 'Not set'}
                                    </span>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 mt-4 bg-primary hover:bg-primary/95 shadow-lg shadow-primary/20 text-primary-foreground font-bold rounded-xl"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Profile
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RestaurantProfile;

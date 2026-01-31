import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Store, Phone, MapPin, Navigation, Key, RefreshCw, Save, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore, useRestaurantStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const Settings = () => {
  const { restaurant, fetchRestaurant, setRestaurant, resetSecretKey, isLoading: restaurantLoading } = useRestaurantStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    if (!restaurant) {
      fetchRestaurant();
    } else {
      setFormData({
        name: restaurant.name || '',
        phone: restaurant.phone || '',
        address: restaurant.address || '',
        latitude: restaurant.latitude?.toString() || '',
        longitude: restaurant.longitude?.toString() || '',
      });
    }
  }, [restaurant, fetchRestaurant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setRestaurant({
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });
      toast({
        title: 'Settings saved!',
        description: 'Restaurant details have been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.message || 'Could not save settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetKey = async () => {
    await resetSecretKey();
    setShowResetDialog(false);
    toast({
      title: 'Secret key reset!',
      description: 'A new unique key has been generated.',
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
            <p className="text-muted-foreground">Manage your restaurant credentials and identity.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-8 border border-border shadow-sm space-y-8"
            >
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <Store className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Restaurant Profile</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Restaurant Name</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="My Awesome Diner"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-11 h-12 bg-secondary/50 border-border rounded-xl focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-11 h-12 bg-secondary/50 border-border rounded-xl focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Physical Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="123 Street Name, City, Country"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-secondary/50 border-border rounded-xl focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Latitude</Label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    <Input
                      id="latitude"
                      name="latitude"
                      type="text"
                      placeholder="e.g. 28.6139"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="pl-11 h-12 bg-secondary/50 border-border rounded-xl focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Longitude</Label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 rotate-90" />
                    <Input
                      id="longitude"
                      name="longitude"
                      type="text"
                      placeholder="e.g. 77.2090"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="pl-11 h-12 bg-secondary/50 border-border rounded-xl focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95"
              >
                {isSaving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    Save Profile Changes
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6"
            >
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <ShieldCheck className="w-5 h-5 text-warning" />
                <h2 className="text-lg font-bold">API Security</h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Your <span className="font-bold text-foreground">Unique Store Key</span> is used to identify your restaurant in external digital menu apps.
              </p>

              <div className="bg-secondary/80 rounded-xl p-4 border border-border group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  <Key className="w-12 h-12" />
                </div>
                <code className="text-xs text-foreground font-mono break-all block">
                  {restaurant?.unique_key || 'No key active'}
                </code>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowResetDialog(true)}
                className="w-full h-12 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 rounded-xl font-bold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Key
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">User Account</h2>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Logged in as</p>
                <p className="font-medium text-foreground truncate">{user?.email}</p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider border border-success/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Verified Partner
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Reset Key Confirmation */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent className="bg-card border-border rounded-2xl shadow-2xl p-8">
            <AlertDialogHeader className="space-y-4">
              <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              <AlertDialogTitle className="text-3xl font-bold text-center">Reset Store Key?</AlertDialogTitle>
              <AlertDialogDescription className="text-lg text-center font-medium">
                This will generate a new unique key. <span className="text-destructive font-bold underline">Your existing menu links will stop working</span> until you update them with the new key.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-4 mt-8 flex sm:flex-row flex-col">
              <AlertDialogCancel className="bg-secondary border-border h-14 rounded-xl flex-1 hover:bg-muted font-bold text-foreground">
                Keep Old Key
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetKey}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-14 rounded-xl flex-1 font-bold shadow-lg shadow-destructive/20"
              >
                I Understand, Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

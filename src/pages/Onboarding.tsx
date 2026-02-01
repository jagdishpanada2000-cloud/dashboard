import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, User, Phone, MapPin, Navigation, ChefHat, ArrowRight, Check } from 'lucide-react';
import { useAuthStore, useRestaurantStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const { isOnboarded } = useAuthStore();
  const { createRestaurant } = useRestaurantStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isOnboarded) {
      navigate('/dashboard', { replace: true });
    }
  }, [isOnboarded, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createRestaurant({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });

      toast({
        title: 'Setup complete! 🎉',
        description: 'Your restaurant is ready to go.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Setup failed',
        description: error.message || 'Could not complete setup.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { icon: Store, label: 'Restaurant Info', done: true },
    { icon: MapPin, label: 'Location', done: false },
    { icon: Check, label: 'Complete', done: false },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4"
          >
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">Complete Your Setup</h1>
          <p className="text-muted-foreground mt-1">Just a few more details to get started</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-8 mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-muted-foreground">{step.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Restaurant Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Restaurant name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-secondary border-border input-focus"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName" className="text-foreground">Owner Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    placeholder="Owner name"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-secondary border-border input-focus"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-11 h-12 bg-secondary border-border input-focus"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-foreground">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Full address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-11 h-12 bg-secondary border-border input-focus"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-foreground">
                  Latitude <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="latitude"
                    name="latitude"
                    type="text"
                    placeholder="e.g. 28.6139"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-secondary border-border input-focus"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-foreground">
                  Longitude <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground rotate-90" />
                  <Input
                    id="longitude"
                    name="longitude"
                    type="text"
                    placeholder="e.g. 77.2090"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-secondary border-border input-focus"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-primary-glow mt-6"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;

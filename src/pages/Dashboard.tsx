import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, UtensilsCrossed, CheckCircle, Key, Copy, Check, Store, ArrowRight, Activity } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import SkeletonCard from '@/components/SkeletonCard';
import { useRestaurantStore, useMenuSectionsStore, useMenuItemsStore } from '@/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { restaurant, fetchRestaurant, isLoading: restaurantLoading } = useRestaurantStore();
  const { sections, fetchSections, isLoading: sectionsLoading } = useMenuSectionsStore();
  const { items, fetchItems, isLoading: itemsLoading } = useMenuItemsStore();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const isLoading = restaurantLoading || sectionsLoading || itemsLoading;

  useEffect(() => {
    fetchRestaurant();
    fetchSections();
    fetchItems();
  }, [fetchRestaurant, fetchSections, fetchItems]);

  const availableItems = items.filter((item) => item.is_available).length;

  const handleCopyKey = () => {
    if (restaurant?.unique_key) {
      navigator.clipboard.writeText(restaurant.unique_key);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Store key copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Manage your restaurant and menu from one place.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-card border border-border p-2 rounded-xl shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div className="pr-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Restaurant</p>
              <h2 className="font-semibold text-sm truncate max-w-[200px]">
                {restaurant?.name || 'Loading...'}
              </h2>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                title="Menu Sections"
                value={sections.length}
                icon={Layers}
                delay={0}
              />
              <StatCard
                title="Total Dishes"
                value={items.length}
                icon={UtensilsCrossed}
                delay={0.1}
              />
              <StatCard
                title="Live on Menu"
                value={availableItems}
                icon={CheckCircle}
                delay={0.2}
              />
              <StatCard
                title="Unavailable"
                value={items.length - availableItems}
                icon={Activity}
                delay={0.3}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/30">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Quick Management
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/sections" className="group p-5 bg-background border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-primary transition-colors">Sections</h4>
                      <p className="text-sm text-muted-foreground">Organize categories</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-primary">
                    Manage Sections <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link to="/items" className="group p-5 bg-background border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-primary transition-colors">Menu Items</h4>
                      <p className="text-sm text-muted-foreground">Update dishes & prices</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-primary">
                    Manage Items <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Items / Status */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 text-center py-12 bg-gradient-to-br from-primary/5 to-transparent">
              <CheckCircle className="w-12 h-12 text-primary/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Menu is looking great!</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                All your changes are synced in real-time to your digital menu.
                Keep your items updated for the best customer experience.
              </p>
              <Button onClick={() => window.open(`${window.location.origin}/menu/${restaurant?.unique_key}`, '_blank')} variant="outline" className="mt-6 border-primary/20 hover:bg-primary/10">
                View Live Menu
              </Button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Key className="w-20 h-20 -mr-6 -mt-6 rotate-12" />
              </div>

              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-warning" />
                Store ID
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use this unique ID to link your menu with external tools.
              </p>

              <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3 border border-border shadow-inner">
                <code className="flex-1 text-xs text-foreground font-mono truncate">
                  {restaurant?.unique_key || 'Loading...'}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyKey}
                  className="shrink-0 h-8 w-8 hover:bg-background shadow-sm"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 italic font-medium">
                * This key identifies your store uniquely.
              </p>
            </motion.div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                System Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Database Sync</span>
                  <span className="flex items-center gap-1.5 text-success font-medium">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cloud Storage</span>
                  <span className="text-success font-medium">Linked</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-border pt-4 mt-2">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

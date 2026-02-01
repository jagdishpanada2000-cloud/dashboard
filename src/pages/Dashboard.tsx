import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  UtensilsCrossed,
  CheckCircle,
  Key,
  Copy,
  Check,
  Store,
  ArrowRight,
  Activity,
} from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import SkeletonCard from "@/components/SkeletonCard";
import MenuPreview from "@/components/MenuPreview";

import {
  useRestaurantStore,
  useMenuSectionsStore,
  useMenuItemsStore,
} from "@/store";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const { toast } = useToast();

  const {
    restaurant,
    fetchRestaurant,
    isLoading: restaurantLoading,
  } = useRestaurantStore();

  const {
    sections,
    fetchSections,
    isLoading: sectionsLoading,
    hasFetched: sectionsFetched,
  } = useMenuSectionsStore();

  const {
    items,
    fetchItems,
    isLoading: itemsLoading,
    hasFetched: itemsFetched,
  } = useMenuItemsStore();

  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /* ---------------------------
     DATA LOADING (CORRECT ORDER)
  ---------------------------- */

  // 1️⃣ Always load restaurant first
  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  // 2️⃣ Load sections & items ONLY when restaurant exists
  useEffect(() => {
    if (!restaurant?.id) return;

    fetchSections();
    fetchItems();
  }, [restaurant?.id, fetchSections, fetchItems]);

  /* ---------------------------
     DERIVED STATE
  ---------------------------- */

  // Show loading ONLY if:
  // 1. Restaurant is still loading, OR
  // 2. Restaurant exists but sections/items haven't been fetched yet
  const isLoading =
    restaurantLoading ||
    (restaurant && (!sectionsFetched || !itemsFetched)) ||
    (restaurant && (sectionsLoading || itemsLoading));

  const availableItems = items.filter(
    (item) => item.is_available
  ).length;

  /* ---------------------------
     HANDLERS
  ---------------------------- */

  const handleCopyKey = () => {
    if (!restaurant?.unique_key) return;

    navigator.clipboard.writeText(restaurant.unique_key);
    setCopied(true);

    toast({
      title: "Copied!",
      description: "Store key copied to clipboard.",
    });

    setTimeout(() => setCopied(false), 2000);
  };

  /* ---------------------------
     UI
  ---------------------------- */

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Manage your restaurant and menu from one place.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-card border p-2 rounded-xl shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div className="pr-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Restaurant
              </p>
              <h2 className="font-semibold text-sm truncate max-w-[200px]">
                {restaurant?.name ?? "Loading..."}
              </h2>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            <>
              <StatCard
                title="Menu Sections"
                value={sections.length}
                icon={Layers}
              />
              <StatCard
                title="Total Dishes"
                value={items.length}
                icon={UtensilsCrossed}
              />
              <div
                className="cursor-pointer"
                onClick={() => setIsPreviewOpen(true)}
              >
                <StatCard
                  title="Live on Menu"
                  value={availableItems}
                  icon={CheckCircle}
                />
              </div>
              <StatCard
                title="Unavailable"
                value={items.length - availableItems}
                icon={Activity}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-muted/30">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Quick Management
                </h3>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/sections" className="group p-5 border rounded-xl hover:shadow-md">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Sections</h4>
                      <p className="text-sm text-muted-foreground">
                        Organize categories
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-primary flex items-center">
                    Manage Sections
                    <ArrowRight className="ml-1 w-3 h-3" />
                  </div>
                </Link>

                <Link to="/items" className="group p-5 border rounded-xl hover:shadow-md">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Menu Items</h4>
                      <p className="text-sm text-muted-foreground">
                        Update dishes & prices
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-primary flex items-center">
                    Manage Items
                    <ArrowRight className="ml-1 w-3 h-3" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-card rounded-2xl border p-6 text-center py-12">
              <CheckCircle className="w-12 h-12 text-primary/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Menu is live</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                All updates sync instantly to your public menu.
              </p>

              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-6 h-12 px-8">
                    View Live Menu
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
                  <MenuPreview
                    restaurantName={restaurant?.name ?? "Your Restaurant"}
                    sections={sections}
                    items={items}
                    onClose={() => setIsPreviewOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-2xl p-6 border shadow-sm"
            >
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-warning" />
                Store ID
              </h3>

              <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3 border">
                <code className="flex-1 text-xs font-mono truncate">
                  {restaurant?.unique_key ?? "Loading..."}
                </code>
                <Button variant="ghost" size="icon" onClick={handleCopyKey}>
                  {copied ? <Check className="text-success" /> : <Copy />}
                </Button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  UtensilsCrossed,
  Settings,
  LogOut,
  ChefHat,
  Menu,
  X,
  ShoppingBag,
  Store
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore, useRestaurantStore } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: Store, label: 'Restaurant Profile' },
  { to: '/sections', icon: Layers, label: 'Menu Sections' },
  { to: '/items', icon: UtensilsCrossed, label: 'Menu Items' },
  { to: '/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: SidebarProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuthStore();
  const { restaurant } = useRestaurantStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar Overlay (Mobile only) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 288 : 80,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed inset-y-0 left-0 z-[60] overflow-hidden",
          "bg-sidebar border-r border-sidebar-border shadow-xl flex flex-col transition-transform lg:translate-x-0 duration-300",
          !sidebarOpen && "max-lg:-translate-x-full",
          "max-lg:w-72 max-lg:z-[70]"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn("p-6 border-b border-sidebar-border h-24 flex items-center shrink-0", !sidebarOpen && "lg:justify-center lg:px-0")}>
          <div className={cn("flex items-center gap-3 transition-all duration-300", !sidebarOpen && "lg:opacity-0 lg:w-0 lg:-translate-x-10 lg:overflow-hidden")}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-foreground text-sm truncate">
                {restaurant?.name || 'Restaurant'}
              </h2>
            </div>
          </div>

          {!sidebarOpen && (
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 absolute transition-all duration-300 hidden lg:flex">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn("rounded-xl ml-auto transition-all", !sidebarOpen && "lg:hidden")}
          >
            {sidebarOpen && <X className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2 overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-xl transition-all duration-300 group relative",
                  sidebarOpen ? "px-4 py-3 gap-3" : "lg:p-3 lg:justify-center p-4 gap-3",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/95 hover:text-primary-foreground"
                )
              }
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110")} />
              <span
                className={cn(
                  "font-medium whitespace-nowrap transition-all duration-300",
                  !sidebarOpen && "lg:opacity-0 lg:w-0 lg:ml-[-10px] overflow-hidden"
                )}
              >
                {item.label}
              </span>

              {!sidebarOpen && (
                <div className="absolute left-full ml-6 px-3 py-2 bg-popover text-popover-foreground text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none translate-x-[-10px] group-hover:translate-x-0 transition-all shadow-xl z-50 whitespace-nowrap border border-border hidden lg:block">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={cn("p-4 border-t border-sidebar-border bg-sidebar-accent/30", !sidebarOpen && "lg:flex lg:justify-center")}>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center rounded-xl text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group",
              sidebarOpen ? "px-4 py-3 gap-3 w-full" : "lg:p-3 p-4 w-full gap-3"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className={cn("font-medium transition-all", !sidebarOpen && "lg:hidden")}>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Toggle Button for Collapsed Mode (Only visible when closed on desktop) */}
      {!sidebarOpen && (
        <div className="hidden lg:flex fixed top-6 left-20 z-[70] ml-[-12px]">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-10 w-10 rounded-xl bg-card border-border shadow-lg hover:bg-secondary animate-in fade-in zoom-in duration-300"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Main content */}
      <main className={cn(
        "flex-1 overflow-auto min-w-0 bg-background/50 transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-[288px]" : "lg:ml-20",
        "max-lg:ml-0 max-lg:pt-16"
      )}>
        <div className="p-6 lg:p-10 pt-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bar - Static */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm truncate max-w-[120px]">{restaurant?.name || 'AutoChef'}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="hover:bg-accent"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardLayout;

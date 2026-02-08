import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, ChefHat, CheckCircle, Truck, XCircle, PackageCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useOrdersStore, useRestaurantStore, Order, OrderStatus } from '@/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusConfig: Record<OrderStatus, {
  label: string;
  icon: typeof Clock;
  color: string;
  bg: string;
  border: string;
  btnLabel: string | null;
  next: OrderStatus | null;
}> = {
  pending: {
    label: 'New Order',
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    btnLabel: 'Accept Order',
    next: 'confirmed',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    btnLabel: 'Start Preparing',
    next: 'preparing',
  },
  preparing: {
    label: 'Preparing',
    icon: ChefHat,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    btnLabel: 'Ready for Pickup',
    next: 'ready',
  },
  ready: {
    label: 'Ready',
    icon: PackageCheck,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    btnLabel: 'Out for Delivery',
    next: 'out_for_delivery',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    icon: Truck,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    btnLabel: 'Mark Delivered',
    next: 'delivered',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    border: 'border-border',
    btnLabel: null,
    next: null,
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    btnLabel: null,
    next: null,
  },
};

interface OrderCardProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  isUpdating: boolean;
}

const OrderCard = ({ order, onStatusChange, isUpdating }: OrderCardProps) => {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  const customerName = order.customer_profile?.full_name || 'Customer';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col h-full hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-bold text-lg text-foreground truncate max-w-[150px]">{customerName}</h3>
            <span className={cn(
              "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border flex items-center gap-1.5",
              config.bg, config.color, config.border
            )}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>ID: #{order.id.slice(0, 6).toUpperCase()}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(order.created_at)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-primary">₹{order.total_price}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-6 bg-secondary/30 rounded-xl p-4 border border-border/50">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest border-b border-border pb-2 mb-2">Order Items</p>
        {order.order_items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded text-[10px] font-bold">{item.quantity}</span>
              {item.menu_item?.name || 'Unknown Item'}
            </span>
            <span className="text-muted-foreground font-mono text-xs">₹{item.price * item.quantity}</span>
          </div>
        ))}
        {order.delivery_address && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Delivery:</span> {order.delivery_address}
            </p>
          </div>
        )}
        {order.delivery_instructions && (
          <p className="text-xs text-muted-foreground italic">
            Note: {order.delivery_instructions}
          </p>
        )}
      </div>

      <div className="pt-2 space-y-2">
        {config.btnLabel && (
          <Button
            size="lg"
            onClick={() => config.next && onStatusChange(order.id, config.next)}
            disabled={isUpdating}
            className={cn(
              "w-full h-12 font-bold rounded-xl transition-all shadow-lg active:scale-95",
              order.status === 'pending' && "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20",
              order.status === 'confirmed' && "bg-blue-500 hover:bg-blue-500/90 text-white shadow-blue-500/20",
              order.status === 'preparing' && "bg-success hover:bg-success/90 text-success-foreground shadow-success/20",
              order.status === 'ready' && "bg-orange-500 hover:bg-orange-500/90 text-white shadow-orange-500/20",
              order.status === 'out_for_delivery' && "bg-muted text-foreground hover:bg-muted/80 shadow-none border border-border"
            )}
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {config.btnLabel}
          </Button>
        )}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(order.id, 'cancelled')}
            disabled={isUpdating}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
          >
            <XCircle className="w-3 h-3 mr-1" /> Cancel Order
          </Button>
        )}
        {order.status === 'delivered' && (
          <div className="w-full h-12 rounded-xl bg-secondary/50 flex items-center justify-center gap-2 text-muted-foreground font-bold text-sm">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
        )}
        {order.status === 'cancelled' && (
          <div className="w-full h-12 rounded-xl bg-destructive/5 flex items-center justify-center gap-2 text-destructive font-bold text-sm">
            <XCircle className="w-4 h-4" />
            Cancelled
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Orders = () => {
  const { orders, fetchOrders, updateOrderStatus, subscribeToOrders, isLoading } = useOrdersStore();
  const { restaurant } = useRestaurantStore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  // Fetch orders when restaurant is available
  useEffect(() => {
    if (restaurant?.id) {
      fetchOrders();
    }
  }, [restaurant?.id, fetchOrders]);

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!restaurant?.id) return;
    const unsubscribe = subscribeToOrders();
    return () => {
      unsubscribe?.();
    };
  }, [restaurant?.id, subscribeToOrders]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setUpdatingId(id);
    const result = await updateOrderStatus(id, status);
    setUpdatingId(null);

    if (result.success) {
      toast({
        title: 'Order Updated',
        description: `Moved to ${statusConfig[status].label}`,
      });
    } else {
      toast({
        title: 'Update Failed',
        description: result.error || 'Could not update order status.',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    toast({ title: 'Refreshed', description: 'Orders list updated.' });
  };

  const activeStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Live Orders</h1>
              <p className="text-muted-foreground mt-1">Manage incoming and active food orders.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-border text-muted-foreground hover:text-primary hover:bg-primary/5 h-11 px-4 rounded-xl"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={filter === 'all' ? 'default' : 'secondary'}
            onClick={() => setFilter('all')}
            className="rounded-full px-6 font-bold"
          >
            All Orders
            <span className="ml-1 opacity-60 font-mono">{orders.length}</span>
          </Button>
          {activeStatuses.map((s) => (
            <Button
              key={s}
              variant={filter === s ? 'default' : 'secondary'}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full px-6 font-bold flex items-center gap-2",
                filter === s && statusConfig[s].color
              )}
            >
              {statusConfig[s].label}
              <span className="ml-1 opacity-60 font-mono">{orders.filter(o => o.status === s).length}</span>
            </Button>
          ))}
        </div>

        {/* Orders Grid */}
        {isLoading && orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-3xl p-24 border border-dashed border-border text-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-3">Loading Orders...</h3>
            <p className="text-muted-foreground">Fetching orders from the database.</p>
          </motion.div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl p-24 border border-dashed border-border text-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No Orders Yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              {filter === 'all'
                ? 'No orders have been placed yet. Orders from customers will appear here in real-time.'
                : `No orders with "${statusConfig[filter as OrderStatus].label}" status.`}
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="rounded-xl px-10 h-14 font-bold"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Orders
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  isUpdating={updatingId === order.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;

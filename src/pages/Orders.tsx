import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, ChefHat, CheckCircle, Truck, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useOrdersStore, Order } from '@/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: {
    label: 'New Order',
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    btnLabel: 'Accept & Prepare',
    next: 'preparing' as const,
  },
  preparing: {
    label: 'Preparing',
    icon: ChefHat,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    btnLabel: 'Ready for Pickup',
    next: 'ready' as const,
  },
  ready: {
    label: 'Ready',
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    btnLabel: 'Delivered',
    next: 'delivered' as const,
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
};

interface OrderCardProps {
  order: Order;
  onStatusChange: (id: string, status: Order['status']) => void;
}

const OrderCard = ({ order, onStatusChange }: OrderCardProps) => {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

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
            <h3 className="font-bold text-lg text-foreground truncate max-w-[150px]">{order.customerName}</h3>
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
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(order.createdAt)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-primary">₹{order.total}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-6 bg-secondary/30 rounded-xl p-4 border border-border/50">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest border-b border-border pb-2 mb-2">Order Items</p>
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded text-[10px] font-bold">{item.quantity}</span>
              {item.name}
            </span>
            <span className="text-muted-foreground font-mono text-xs">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="pt-2">
        {config.btnLabel && (
          <Button
            size="lg"
            onClick={() => config.next && onStatusChange(order.id, config.next)}
            className={cn(
              "w-full h-12 font-bold rounded-xl transition-all shadow-lg active:scale-95",
              order.status === 'pending' && "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20",
              order.status === 'preparing' && "bg-success hover:bg-success/90 text-success-foreground shadow-success/20",
              order.status === 'ready' && "bg-muted text-foreground hover:bg-muted/80 shadow-none border border-border"
            )}
          >
            {config.btnLabel}
          </Button>
        )}
        {order.status === 'delivered' && (
          <div className="w-full h-12 rounded-xl bg-secondary/50 flex items-center justify-center gap-2 text-muted-foreground font-bold text-sm">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Orders = () => {
  const { orders, addDemoOrder, updateOrderStatus, clearOrders } = useOrdersStore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    if (orders.length === 0) {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => addDemoOrder(), i * 500);
      }
    }
  }, []);

  const handleAddOrder = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    addDemoOrder();
    setIsGenerating(false);
    toast({
      title: 'New Order Received! 🍜',
      description: 'Check the incoming queue.',
    });
  };

  const handleStatusChange = (id: string, status: Order['status']) => {
    updateOrderStatus(id, status);
    toast({
      title: 'Order Updated',
      description: `Moved to ${statusConfig[status].label}`,
    });
  };

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
              onClick={clearOrders}
              className="border-border text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-11 px-4 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={handleAddOrder}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 rounded-xl shadow-lg shadow-primary/25 font-bold"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              Demo Order
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
          </Button>
          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((s) => (
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
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl p-24 border border-dashed border-border text-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Kitchen is Quiet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              No orders found in the "{filter === 'all' ? 'active' : filter}" queue. Use "Demo Order" to see the flow.
            </p>
            <Button
              onClick={handleAddOrder}
              className="bg-primary hover:bg-primary/90 rounded-xl px-10 h-14 font-bold"
            >
              Simulate First Order
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
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

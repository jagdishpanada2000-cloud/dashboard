import { supabase } from './supabase';
import type { OrderStatus, Order, OrderItem } from '@/store';

export interface CreateOrderRequest {
  user_id: string;
  restaurant_id: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
    price: number;
    special_instructions?: string;
  }>;
  delivery_address?: string;
  delivery_instructions?: string;
}

export interface OrderStatistics {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

export class OrderService {
  
  /**
   * Create a new order with order items
   */
  static async createOrder(orderData: CreateOrderRequest): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      // Calculate total price
      const totalPrice = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Start a transaction-like operation
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          restaurant_id: orderData.restaurant_id,
          total_price: totalPrice,
          delivery_address: orderData.delivery_address,
          delivery_instructions: orderData.delivery_instructions,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        special_instructions: item.special_instructions,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback: delete the order if items failed
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      // Fetch the complete order with items
      const completeOrder = await this.getOrderById(order.id);
      
      return { success: true, order: completeOrder };
    } catch (error) {
      console.error('Error creating order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      };
    }
  }

  /**
   * Get order by ID with full details
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            order_id,
            menu_item_id,
            quantity,
            price,
            special_instructions,
            created_at,
            menu_item:menu_items ( name, image_url )
          ),
          customer_profile:profiles!orders_user_id_fkey ( full_name, phone )
        `)
        .eq('id', orderId)
        .single();

      if (error || !data) return null;

      return {
        ...data,
        order_items: data.order_items || [],
        customer_profile: data.customer_profile || { full_name: null, phone: null },
      } as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string, 
    status: OrderStatus,
    estimatedDeliveryTime?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { status };
      
      if (estimatedDeliveryTime) {
        updateData.estimated_delivery_time = estimatedDeliveryTime;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update order status' 
      };
    }
  }

  /**
   * Get orders for a restaurant with pagination
   */
  static async getRestaurantOrders(
    restaurantId: string,
    options?: {
      status?: OrderStatus;
      limit?: number;
      offset?: number;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{ orders: Order[]; count: number; error?: string }> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            order_id,
            menu_item_id,
            quantity,
            price,
            special_instructions,
            created_at,
            menu_item:menu_items ( name, image_url )
          )
        `, { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.dateFrom) {
        query = query.gte('created_at', options.dateFrom);
      }

      if (options?.dateTo) {
        query = query.lte('created_at', options.dateTo);
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Fetch customer profiles for all orders
      const userIds = [...new Set((data || []).map(o => o.user_id))];
      let profilesMap: Record<string, { full_name: string | null; phone: string | null }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .in('id', userIds);

        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map(p => [p.id, { full_name: p.full_name, phone: p.phone }]));
        }
      }

      const ordersWithProfiles = (data || []).map(order => ({
        ...order,
        order_items: order.order_items || [],
        customer_profile: profilesMap[order.user_id] || { full_name: null, phone: null },
      })) as Order[];

      return { 
        orders: ordersWithProfiles, 
        count: count || 0 
      };
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      return { 
        orders: [], 
        count: 0, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders' 
      };
    }
  }

  /**
   * Get order statistics for a restaurant
   */
  static async getRestaurantOrderStatistics(
    restaurantId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<OrderStatistics> {
    try {
      let query = supabase
        .from('orders')
        .select('status, total_price, created_at')
        .eq('restaurant_id', restaurantId);

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const orders = data || [];
      
      const statistics: OrderStatistics = {
        total_orders: orders.length,
        pending_orders: orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length,
        completed_orders: orders.filter(o => o.status === 'delivered').length,
        total_revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total_price, 0),
        avg_order_value: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total_price, 0) / orders.length : 0,
      };

      return statistics;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      return {
        total_orders: 0,
        pending_orders: 0,
        completed_orders: 0,
        total_revenue: 0,
        avg_order_value: 0,
      };
    }
  }

  /**
   * Subscribe to real-time order updates for a restaurant
   */
  static subscribeToRestaurantOrders(
    restaurantId: string,
    onOrderUpdate: (order: Order) => void,
    onOrderInsert: (order: Order) => void,
    onOrderDelete: (orderId: string) => void
  ) {
    const channel = supabase
      .channel(`restaurant-orders-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          const order = await this.getOrderById(payload.new.id);
          if (order) {
            onOrderInsert(order);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          const order = await this.getOrderById(payload.new.id);
          if (order) {
            onOrderUpdate(order);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          onOrderDelete(payload.old.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Bulk update order statuses
   */
  static async bulkUpdateOrderStatus(
    orderIds: string[],
    status: OrderStatus
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .in('id', orderIds);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Error bulk updating order statuses:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update order statuses' 
      };
    }
  }

  /**
   * Search orders by customer name, phone, or order ID
   */
  static async searchOrders(
    restaurantId: string,
    searchQuery: string
  ): Promise<{ orders: Order[]; error?: string }> {
    try {
      // First search by order ID
      if (searchQuery.length >= 6) {
        const orderByIdResult = await this.getRestaurantOrders(restaurantId);
        const exactMatch = orderByIdResult.orders.find(order => 
          order.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (exactMatch) {
          return { orders: [exactMatch] };
        }
      }

      // Search by customer name/phone
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      if (!profiles || profiles.length === 0) {
        return { orders: [] };
      }

      const userIds = profiles.map(p => p.id);
      const ordersResult = await this.getRestaurantOrders(restaurantId);
      const filteredOrders = ordersResult.orders.filter(order => 
        userIds.includes(order.user_id)
      );

      return { orders: filteredOrders };
    } catch (error) {
      console.error('Error searching orders:', error);
      return { 
        orders: [], 
        error: error instanceof Error ? error.message : 'Failed to search orders' 
      };
    }
  }
}

// Utility functions
export const formatOrderStatus = (status: OrderStatus): string => {
  const statusMap = {
    pending: 'New Order',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colorMap = {
    pending: 'text-yellow-600 bg-yellow-100',
    confirmed: 'text-blue-600 bg-blue-100',
    preparing: 'text-orange-600 bg-orange-100',
    ready: 'text-green-600 bg-green-100',
    out_for_delivery: 'text-purple-600 bg-purple-100',
    delivered: 'text-gray-600 bg-gray-100',
    cancelled: 'text-red-600 bg-red-100',
  };
  return colorMap[status] || 'text-gray-600 bg-gray-100';
};

export const calculateEstimatedDeliveryTime = (prepTime: number = 20): string => {
  const now = new Date();
  const estimated = new Date(now.getTime() + prepTime * 60000);
  return estimated.toISOString();
};

export const isOrderEditable = (status: OrderStatus): boolean => {
  return !['delivered', 'cancelled'].includes(status);
};

export const canCancelOrder = (status: OrderStatus): boolean => {
  return ['pending', 'confirmed'].includes(status);
};
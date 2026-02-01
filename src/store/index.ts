import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Types matched to database schema
export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  unique_key: string;
  description: string | null;
  images: string[];
  business_hours: Record<string, { open: string; close: string; closed: boolean }> | null;
  created_at: string;
  updated_at: string;
}

export interface MenuSection {
  id: string;
  restaurant_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  section_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
}

// Auth Store
interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
  setSession: (session: Session | null) => void;
  setOnboarded: (value: boolean) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isAuthenticated: false,
  isOnboarded: false,
  isLoading: true,
  login: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }

    if (data.session) {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', data.session.user.id)
        .maybeSingle();

      set({
        session: data.session,
        user: data.session.user,
        isAuthenticated: true,
        isOnboarded: !!restaurant,
        isLoading: false
      });
    } else {
      set({ isLoading: false });
    }

    return { success: true };
  },
  signup: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }

    if (data.session) {
      set({
        session: data.session,
        user: data.session.user,
        isAuthenticated: true,
        isOnboarded: false,
        isLoading: false
      });
    } else {
      set({ isLoading: false });
    }

    return { success: true };
  },
  googleLogin: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      }
    });
    set({ isLoading: false });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session
    });
  },
  setOnboarded: (value) => set({ isOnboarded: value }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isAuthenticated: false, isOnboarded: false });
  },
  initialize: async () => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Check if restaurant profile exists
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', session.user.id)
        .maybeSingle();

      set({
        session,
        user: session.user,
        isAuthenticated: true,
        isOnboarded: !!restaurant,
        isLoading: false
      });
    } else {
      set({ isLoading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        set({
          session,
          user: session.user,
          isAuthenticated: true,
          isOnboarded: !!restaurant
        });
      } else {
        set({ session: null, user: null, isAuthenticated: false, isOnboarded: false });
      }
    });
  }
}));

// Restaurant Store
interface RestaurantState {
  restaurant: Restaurant | null;
  isLoading: boolean;
  fetchRestaurant: () => Promise<void>;
  setRestaurant: (data: Partial<Restaurant>) => Promise<void>;
  createRestaurant: (data: Omit<Restaurant, 'id' | 'owner_id' | 'unique_key' | 'created_at' | 'updated_at' | 'description' | 'images' | 'business_hours'>) => Promise<void>;
  updateProfile: (data: { description?: string; images?: string[]; business_hours?: Restaurant['business_hours'] }) => Promise<{ success: boolean; error?: string }>;
  resetSecretKey: () => Promise<void>;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurant: null,
  isLoading: false,
  fetchRestaurant: async () => {
    const user = useAuthStore.getState().user;
    if (!user || get().isLoading) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({ restaurant: data });
        useAuthStore.getState().setOnboarded(true);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  setRestaurant: async (data) => {
    const current = get().restaurant;
    if (!current) return;

    const { data: updated, error } = await supabase
      .from('restaurants')
      .update(data)
      .eq('id', current.id)
      .select()
      .single();

    if (!error && updated) {
      set({ restaurant: updated });
    }
  },
  createRestaurant: async (data) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true });
    const { data: created, error } = await supabase
      .from('restaurants')
      .insert({
        ...data,
        owner_id: user.id
      })
      .select()
      .single();

    if (!error && created) {
      set({ restaurant: created, isLoading: false });
      useAuthStore.getState().setOnboarded(true);
    } else {
      set({ isLoading: false });
      console.error('Error creating restaurant:', error);
      throw error;
    }
  },
  updateProfile: async (data) => {
    const current = get().restaurant;
    if (!current) return { success: false, error: 'No restaurant loaded' };

    const { data: updated, error } = await supabase
      .from('restaurants')
      .update(data)
      .eq('id', current.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    if (updated) {
      set({ restaurant: updated });
      return { success: true };
    }
    return { success: false, error: 'Failed to update profile' };
  },
  resetSecretKey: async () => {
    const current = get().restaurant;
    if (!current) return;

    const newKey = `sk_${Math.random().toString(36).substring(2, 11)}`;
    const { data: updated, error } = await supabase
      .from('restaurants')
      .update({ unique_key: newKey })
      .eq('id', current.id)
      .select()
      .single();

    if (!error && updated) {
      set({ restaurant: updated });
    }
  }
}));

// Menu Sections Store
interface MenuSectionsState {
  sections: MenuSection[];
  isLoading: boolean;
  fetchSections: () => Promise<void>;
  addSection: (name: string, description?: string) => Promise<{ success: boolean; error?: string }>;
  updateSection: (id: string, name: string, description?: string) => Promise<{ success: boolean; error?: string }>;
  deleteSection: (id: string) => Promise<{ success: boolean; error?: string }>;
  reorderSections: (sections: MenuSection[]) => Promise<{ success: boolean; error?: string }>;
}

export const useMenuSectionsStore = create<MenuSectionsState>((set, get) => ({
  sections: [],
  isLoading: false,
  fetchSections: async () => {
    const restaurant = useRestaurantStore.getState().restaurant;
    if (!restaurant || get().isLoading) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('menu_sections')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('position', { ascending: true });

      if (error) throw error;
      set({ sections: data || [] });
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addSection: async (name, description) => {
    const restaurant = useRestaurantStore.getState().restaurant;
    const user = useAuthStore.getState().user;
    if (!restaurant || !user) return;

    const { data, error } = await supabase
      .from('menu_sections')
      .insert({
        name,
        description,
        restaurant_id: restaurant.id,
        owner_id: user.id,
        position: get().sections.length
      })
      .select()
      .single();

    if (!error && data) {
      set({ sections: [...get().sections, data] });
      return { success: true };
    }
    return { success: false, error: error?.message };
  },
  updateSection: async (id, name, description) => {
    const { data, error } = await supabase
      .from('menu_sections')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      set({
        sections: get().sections.map((s) => (s.id === id ? data : s))
      });
      return { success: true };
    }
    return { success: false, error: error?.message };
  },
  deleteSection: async (id) => {
    const { error } = await supabase.from('menu_sections').delete().eq('id', id);
    if (!error) {
      set({ sections: get().sections.filter((s) => s.id !== id) });
      return { success: true };
    }
    return { success: false, error: error.message };
  },
  reorderSections: async (sections) => {
    set({ sections });
    const updates = sections.map((s, index) => ({
      id: s.id,
      position: index
    }));

    const { error } = await supabase.from('menu_sections').upsert(updates);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }
}));

// Menu Items Store
interface MenuItemsState {
  items: MenuItem[];
  isLoading: boolean;
  fetchItems: (sectionId?: string) => Promise<void>;
  addItem: (item: Omit<MenuItem, 'id' | 'owner_id' | 'position' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateItem: (id: string, item: Partial<MenuItem>) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleAvailability: (id: string) => Promise<{ success: boolean; error?: string }>;
  reorderItems: (sectionId: string, items: MenuItem[]) => Promise<{ success: boolean; error?: string }>;
}

export const useMenuItemsStore = create<MenuItemsState>((set, get) => ({
  items: [],
  isLoading: false,
  fetchItems: async (sectionId) => {
    const restaurant = useRestaurantStore.getState().restaurant;
    if (!restaurant || get().isLoading) return;

    set({ isLoading: true });
    try {
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('owner_id', restaurant.owner_id);

      if (sectionId && sectionId !== 'all') {
        query = query.eq('section_id', sectionId);
      }

      const { data, error } = await query.order('position', { ascending: true });

      if (error) throw error;
      set({ items: data || [] });
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addItem: async (item) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const sectionItems = get().items.filter((i) => i.section_id === item.section_id);
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        ...item,
        owner_id: user.id,
        position: sectionItems.length
      })
      .select()
      .single();

    if (!error && data) {
      set({ items: [...get().items, data] });
      return { success: true };
    }
    return { success: false, error: error?.message };
  },
  updateItem: async (id, data) => {
    const { data: updated, error } = await supabase
      .from('menu_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (!error && updated) {
      set({
        items: get().items.map((i) => (i.id === id ? updated : i))
      });
      return { success: true };
    }
    return { success: false, error: error?.message };
  },
  deleteItem: async (id) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      set({ items: get().items.filter((i) => i.id !== id) });
      return { success: true };
    }
    return { success: false, error: error.message };
  },
  toggleAvailability: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return { success: false, error: 'Item not found' };

    const { data, error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      set({
        items: get().items.map((i) => (i.id === id ? data : i))
      });
      return { success: true };
    }
    return { success: false, error: error?.message };
  },
  reorderItems: async (sectionId, items) => {
    const otherItems = get().items.filter(i => i.section_id !== sectionId);
    set({ items: [...otherItems, ...items] });

    const updates = items.map((i, index) => ({
      id: i.id,
      position: index
    }));

    const { error } = await supabase.from('menu_items').upsert(updates);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
}));

// Orders Store (Keeping demo orders for now as they are not in schema)
interface OrdersState {
  orders: Order[];
  addDemoOrder: () => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  clearOrders: () => void;
}

const demoCustomers = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh'];
const demoItems = [
  { name: 'Butter Chicken', price: 320 },
  { name: 'Paneer Tikka', price: 280 },
  { name: 'Biryani', price: 250 },
  { name: 'Naan Basket', price: 80 },
  { name: 'Dal Makhani', price: 220 },
  { name: 'Gulab Jamun', price: 120 },
];

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  addDemoOrder: () => {
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const orderItems = [];
    for (let i = 0; i < itemCount; i++) {
      const item = demoItems[Math.floor(Math.random() * demoItems.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      orderItems.push({ ...item, quantity });
    }
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 11),
      customerName: demoCustomers[Math.floor(Math.random() * demoCustomers.length)],
      items: orderItems,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set({ orders: [newOrder, ...get().orders].slice(0, 20) });
  },
  updateOrderStatus: (id, status) => {
    set({
      orders: get().orders.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    });
  },
  clearOrders: () => set({ orders: [] }),
}));

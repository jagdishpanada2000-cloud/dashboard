export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customer_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          latitude: number | null
          longitude: number | null
          postal_code: string | null
          state: string | null
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          latitude?: number | null
          longitude?: number | null
          postal_code?: string | null
          state?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          latitude?: number | null
          longitude?: number | null
          postal_code?: string | null
          state?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      favorite_menu_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_menu_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_menu_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      favorite_restaurants: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_restaurants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          owner_id: string
          position: number
          price: number
          section_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          owner_id: string
          position?: number
          price?: number
          section_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          owner_id?: string
          position?: number
          price?: number
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_section_id_fkey"
            columns: ["section_id"]
            referencedRelation: "menu_sections"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_sections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          position: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          position?: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          position?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_sections_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string
          order_id: string
          price: number
          quantity: number
          special_instructions: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id: string
          order_id: string
          price: number
          quantity?: number
          special_instructions?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string
          order_id?: string
          price?: number
          quantity?: number
          special_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          delivery_address: string | null
          delivery_instructions: string | null
          estimated_delivery_time: string | null
          id: string
          restaurant_id: string
          status: string
          total_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivery_address?: string | null
          delivery_instructions?: string | null
          estimated_delivery_time?: string | null
          id?: string
          restaurant_id: string
          status?: string
          total_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivery_address?: string | null
          delivery_instructions?: string | null
          estimated_delivery_time?: string | null
          id?: string
          restaurant_id?: string
          status?: string
          total_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: string
          order_id: string
          status: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: string
          order_id: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: string
          order_id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          banner_url: string | null
          business_hours: Json | null
          closing_time: string | null
          created_at: string
          cuisine_type: string[] | null
          delivery_time: string | null
          description: string | null
          id: string
          images: string[] | null
          is_open: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string
          phone: string | null
          rating: number | null
          unique_key: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          business_hours?: Json | null
          closing_time?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_open?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id: string
          phone?: string | null
          rating?: number | null
          unique_key?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          business_hours?: Json | null
          closing_time?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_open?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          rating?: number | null
          unique_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
create table public.user_roles (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  role text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_roles_pkey primary key (id),
  
  constraint user_roles_user_id_key unique (user_id),
  constraint user_roles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint user_roles_role_check check ((role = any (array['user'::text, 'owner'::text])))
) TABLESPACE pg_default;

create index IF not exists idx_user_roles_user_id on public.user_roles using btree (user_id) TABLESPACE pg_default;

create table public.restaurants (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null,
  name text not null,
  phone text null,
  address text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  unique_key text not null default encode(extensions.gen_random_bytes (16), 'hex'::text),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  description text null,
  images text[] null default '{}'::text[],
  closing_time time without time zone null,
  business_hours jsonb null default '{"friday": {"open": "09:00", "close": "22:00", "closed": false}, "monday": {"open": "09:00", "close": "22:00", "closed": false}, "sunday": {"open": "09:00", "close": "23:00", "closed": false}, "tuesday": {"open": "09:00", "close": "22:00", "closed": false}, "saturday": {"open": "09:00", "close": "23:00", "closed": false}, "thursday": {"open": "09:00", "close": "22:00", "closed": false}, "wednesday": {"open": "09:00", "close": "22:00", "closed": false}}'::jsonb,
  cuisine_type text[] null default '{}'::text[],
  banner_url text null,
  rating numeric(2, 1) null default 4.5,
  delivery_time text null default '20-30 min'::text,
  is_open boolean null default true,
  constraint restaurants_pkey primary key (id),
  constraint restaurants_owner_id_key unique (owner_id)
) TABLESPACE pg_default;

create index IF not exists idx_restaurants_owner on public.restaurants using btree (owner_id) TABLESPACE pg_default;

create trigger update_restaurants_updated_at BEFORE
update on restaurants for EACH row
execute FUNCTION update_updated_at_column ();

create table public.profiles (
  id uuid not null,
  full_name text null,
  phone text null,
  avatar_url text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  role text null default 'user'::text,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check ((role = any (array['user'::text, 'owner'::text])))
) TABLESPACE pg_default;

create index IF not exists idx_profiles_role on public.profiles using btree (role) TABLESPACE pg_default;

create table public.payments (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  method text not null,
  status text not null default 'pending'::text,
  amount numeric(10, 2) not null,
  transaction_id text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint payments_pkey primary key (id),
  constraint payments_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint payments_method_check check (
    (
      method = any (
        array[
          'card'::text,
          'upi'::text,
          'cod'::text,
          'wallet'::text
        ]
      )
    )
  ),
  constraint payments_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'completed'::text,
          'failed'::text,
          'refunded'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_payments_order_id on public.payments using btree (order_id) TABLESPACE pg_default;

create trigger update_payments_updated_at BEFORE
update on payments for EACH row
execute FUNCTION update_updated_at_column ();

create table public.orders (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  restaurant_id uuid not null,
  status text not null default 'pending'::text,
  total_price numeric(10, 2) not null,
  delivery_address text null,
  delivery_instructions text null,
  estimated_delivery_time timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_restaurant_id_fkey foreign KEY (restaurant_id) references restaurants (id) on delete CASCADE,
  constraint orders_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint orders_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'confirmed'::text,
          'preparing'::text,
          'ready'::text,
          'out_for_delivery'::text,
          'delivered'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_orders_user_id on public.orders using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_orders_restaurant_id on public.orders using btree (restaurant_id) TABLESPACE pg_default;

create index IF not exists idx_orders_status on public.orders using btree (status) TABLESPACE pg_default;

create trigger update_orders_updated_at BEFORE
update on orders for EACH row
execute FUNCTION update_updated_at_column ();

create table public.order_items (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  menu_item_id uuid not null,
  quantity integer not null default 1,
  price numeric(10, 2) not null,
  special_instructions text null,
  created_at timestamp with time zone null default now(),
  constraint order_items_pkey primary key (id),
  constraint order_items_menu_item_id_fkey foreign KEY (menu_item_id) references menu_items (id) on delete CASCADE,
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_order_items_order_id on public.order_items using btree (order_id) TABLESPACE pg_default;

create table public.menu_sections (
  id uuid not null default gen_random_uuid (),
  restaurant_id uuid not null,
  owner_id uuid not null,
  name text not null,
  description text null,
  position integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint menu_sections_pkey primary key (id),
  constraint menu_sections_restaurant_id_fkey foreign KEY (restaurant_id) references restaurants (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_menu_sections_restaurant on public.menu_sections using btree (restaurant_id) TABLESPACE pg_default;

create index IF not exists idx_menu_sections_owner on public.menu_sections using btree (owner_id) TABLESPACE pg_default;

create trigger update_menu_sections_updated_at BEFORE
update on menu_sections for EACH row
execute FUNCTION update_updated_at_column ();

create table public.menu_items (
  id uuid not null default gen_random_uuid (),
  section_id uuid not null,
  owner_id uuid not null,
  name text not null,
  description text null,
  price numeric(10, 2) not null default 0,
  image_url text null,
  is_available boolean not null default true,
  position integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint menu_items_pkey primary key (id),
  constraint menu_items_section_id_fkey foreign KEY (section_id) references menu_sections (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_menu_items_section on public.menu_items using btree (section_id) TABLESPACE pg_default;

create index IF not exists idx_menu_items_owner on public.menu_items using btree (owner_id) TABLESPACE pg_default;

create trigger update_menu_items_updated_at BEFORE
update on menu_items for EACH row
execute FUNCTION update_updated_at_column ();

create table public.favorite_restaurants (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  restaurant_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint favorite_restaurants_pkey primary key (id),
  constraint favorite_restaurants_user_id_restaurant_id_key unique (user_id, restaurant_id),
  constraint favorite_restaurants_restaurant_id_fkey foreign KEY (restaurant_id) references restaurants (id) on delete CASCADE,
  constraint favorite_restaurants_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_favorite_restaurants_user_id on public.favorite_restaurants using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_favorite_restaurants_restaurant_id on public.favorite_restaurants using btree (restaurant_id) TABLESPACE pg_default;

create table public.favorite_menu_items (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  menu_item_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint favorite_menu_items_pkey primary key (id),
  constraint favorite_menu_items_user_id_menu_item_id_key unique (user_id, menu_item_id),
  constraint favorite_menu_items_menu_item_id_fkey foreign KEY (menu_item_id) references menu_items (id) on delete CASCADE,
  constraint favorite_menu_items_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_favorite_menu_items_user_id on public.favorite_menu_items using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_favorite_menu_items_menu_item_id on public.favorite_menu_items using btree (menu_item_id) TABLESPACE pg_default;

create table public.customer_addresses (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  label text not null default 'Home'::text,
  address_line1 text not null,
  address_line2 text null,
  city text not null,
  state text null,
  postal_code text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  is_default boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint customer_addresses_pkey primary key (id),
  constraint customer_addresses_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_customer_addresses_user_id on public.customer_addresses using btree (user_id) TABLESPACE pg_default;
-- =====================================================
-- SAMPLE DATA FOR TESTING ORDERS FUNCTIONALITY
-- Run this in Supabase SQL Editor after setting up RLS
-- =====================================================

-- Create sample user profiles (you'll need to create auth.users first via Supabase Auth)
-- These IDs should match actual auth.users from your authentication

-- Sample customer profile (replace with actual user ID from auth.users)
-- You can get this ID after signing up a test user through your app
INSERT INTO public.profiles (id, full_name, phone, role) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'John Doe', '+91-9876543210', 'user');

-- Add more sample customers
INSERT INTO public.profiles (id, full_name, phone, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Jane Smith', '+91-9876543211', 'user'),
('550e8400-e29b-41d4-a716-446655440002', 'Mike Johnson', '+91-9876543212', 'user');

-- Create sample restaurant (replace owner_id with actual auth user ID for restaurant owner)
INSERT INTO public.restaurants (id, owner_id, name, phone, address, description) VALUES 
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Tasty Bites Restaurant', '+91-9876543213', '123 Food Street, Mumbai', 'Delicious Indian cuisine');

-- Create menu sections
INSERT INTO public.menu_sections (id, restaurant_id, owner_id, name, description, position) VALUES 
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Main Courses', 'Our delicious main dishes', 1),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Appetizers', 'Start your meal right', 2);

-- Create menu items
INSERT INTO public.menu_items (id, section_id, owner_id, name, description, price, is_available, position) VALUES 
('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Butter Chicken', 'Creamy chicken in tomato sauce', 350.00, true, 1),
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Paneer Makhani', 'Rich cottage cheese curry', 280.00, true, 2),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Samosa', 'Crispy fried pastry', 80.00, true, 1),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Spring Rolls', 'Fresh vegetable rolls', 120.00, true, 2);

-- Create sample orders with different statuses
INSERT INTO public.orders (id, user_id, restaurant_id, status, total_price, delivery_address, delivery_instructions, estimated_delivery_time, created_at) VALUES 
('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'pending', 430.00, '456 Home Street, Mumbai', 'Ring the bell twice', now() + interval '25 minutes', now() - interval '2 minutes'),
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'confirmed', 280.00, '789 Office Complex, Mumbai', 'Leave at reception', now() + interval '30 minutes', now() - interval '5 minutes'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 'preparing', 200.00, '321 Park Avenue, Mumbai', NULL, now() + interval '20 minutes', now() - interval '10 minutes'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'ready', 350.00, '654 Garden Street, Mumbai', 'Call on arrival', now() + interval '5 minutes', now() - interval '15 minutes'),
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'out_for_delivery', 560.00, '987 Tower Block, Mumbai', 'Flat 203', now() + interval '10 minutes', now() - interval '20 minutes');

-- Create order items for the orders
INSERT INTO public.order_items (order_id, menu_item_id, quantity, price, special_instructions) VALUES 
-- Order 1 (pending): Butter Chicken + Samosa
('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', 1, 350.00, 'Medium spicy'),
('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 1, 80.00, 'Extra chutney'),

-- Order 2 (confirmed): Paneer Makhani
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 1, 280.00, 'Less salt'),

-- Order 3 (preparing): Samosa + Spring Rolls
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 1, 80.00, NULL),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', 1, 120.00, 'No onions'),

-- Order 4 (ready): Butter Chicken
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440000', 1, 350.00, 'Extra gravy'),

-- Order 5 (out_for_delivery): Butter Chicken + Paneer Makhani + Spring Rolls
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440000', 1, 350.00, NULL),
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 1, 280.00, NULL),
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440003', 1, 120.00, 'Packed separately');

-- Note: You'll need to:
-- 1. First create actual auth.users through your app's signup flow
-- 2. Replace the sample UUIDs above with real auth.user IDs
-- 3. Make sure the restaurant owner_id matches a real auth.user ID who will be logged in
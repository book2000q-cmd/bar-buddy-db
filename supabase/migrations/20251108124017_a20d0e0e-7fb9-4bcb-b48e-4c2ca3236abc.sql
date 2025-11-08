-- Add cost_price column to products table for tracking product costs
ALTER TABLE public.products
ADD COLUMN cost_price numeric DEFAULT 0;

COMMENT ON COLUMN public.products.cost_price IS 'Cost price of the product for expense tracking';
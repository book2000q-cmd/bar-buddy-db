-- Create transactions table to track sales
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_amount NUMERIC NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions (public access for now)
CREATE POLICY "Anyone can view transactions" 
ON public.transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date DESC);
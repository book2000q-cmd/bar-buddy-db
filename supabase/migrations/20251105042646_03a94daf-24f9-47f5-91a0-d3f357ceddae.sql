-- Create expenses table for tracking expenses
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT,
  expense_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Authenticated users with admin or staff role can view expenses"
ON public.expenses
FOR SELECT
USING ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role)));

CREATE POLICY "Authenticated users with admin or staff role can insert expenses"
ON public.expenses
FOR INSERT
WITH CHECK ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role)));

CREATE POLICY "Authenticated users with admin or staff role can update expenses"
ON public.expenses
FOR UPDATE
USING ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role)));

CREATE POLICY "Authenticated users with admin role can delete expenses"
ON public.expenses
FOR DELETE
USING ((auth.uid() IS NOT NULL) AND has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Enable realtime for expenses table
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
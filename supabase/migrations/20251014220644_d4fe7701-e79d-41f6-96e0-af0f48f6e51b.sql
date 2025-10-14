-- Fix 1: Add explicit deny policy for anonymous users on purchases table
CREATE POLICY "Deny anonymous access to purchases"
ON public.purchases
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Fix 3: Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  function_name text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, function_name)
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _identifier text,
  _function_name text,
  _max_requests integer,
  _window_minutes integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_window_start timestamp with time zone;
BEGIN
  -- Get or create rate limit record
  SELECT request_count, window_start
  INTO v_count, v_window_start
  FROM public.rate_limits
  WHERE identifier = _identifier
    AND function_name = _function_name;
  
  -- If no record exists or window expired, create/reset
  IF NOT FOUND OR v_window_start < (now() - (_window_minutes || ' minutes')::interval) THEN
    INSERT INTO public.rate_limits (identifier, function_name, request_count, window_start)
    VALUES (_identifier, _function_name, 1, now())
    ON CONFLICT (identifier, function_name) 
    DO UPDATE SET 
      request_count = 1,
      window_start = now();
    RETURN true;
  END IF;
  
  -- Check if limit exceeded
  IF v_count >= _max_requests THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  UPDATE public.rate_limits
  SET request_count = request_count + 1
  WHERE identifier = _identifier
    AND function_name = _function_name;
  
  RETURN true;
END;
$$;
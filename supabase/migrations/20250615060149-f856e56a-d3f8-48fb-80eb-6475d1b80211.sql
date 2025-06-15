
-- Create RLS policy to allow unauthenticated users to create password recovery requests
CREATE POLICY "Allow unauthenticated users to create password recovery requests"
ON public.password_recovery_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Also allow authenticated users to create password recovery requests (optional)
CREATE POLICY "Allow authenticated users to create password recovery requests"
ON public.password_recovery_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ==============================================================================
-- KGH Dental: Contact Inquiries Table & Security RLS Policies
-- Execute in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id text PRIMARY KEY DEFAULT ('inq-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread', -- 'unread', 'read', 'replied', 'archived'
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & authenticated visitors to insert new contact inquiries
DROP POLICY IF EXISTS "Allow public to insert contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public to insert contact inquiries"
  ON public.contact_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure public users CANNOT read all inquiries (only service_role / admin API can read)
DROP POLICY IF EXISTS "Deny public select on contact inquiries" ON public.contact_inquiries;

-- Grant service_role full management permissions
GRANT ALL ON public.contact_inquiries TO service_role;

-- Grant INSERT only to anon and authenticated
GRANT INSERT ON public.contact_inquiries TO anon, authenticated;

-- Index for speedy admin sorting and status filtering
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON public.contact_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries (status);

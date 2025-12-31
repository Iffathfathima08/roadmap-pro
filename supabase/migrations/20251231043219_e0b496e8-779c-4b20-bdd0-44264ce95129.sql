-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create predefined_roadmaps table for templates
CREATE TABLE public.predefined_roadmaps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    mermaid_code TEXT NOT NULL,
    steps JSONB NOT NULL DEFAULT '[]',
    difficulty TEXT DEFAULT 'beginner',
    estimated_duration TEXT,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on predefined_roadmaps
ALTER TABLE public.predefined_roadmaps ENABLE ROW LEVEL SECURITY;

-- Everyone can read active predefined roadmaps
CREATE POLICY "Anyone can view active predefined roadmaps"
ON public.predefined_roadmaps
FOR SELECT
TO authenticated
USING (is_active = true);

-- Only admins can manage predefined roadmaps
CREATE POLICY "Admins can manage predefined roadmaps"
ON public.predefined_roadmaps
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add steps column to user roadmaps for checklist tracking
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]';
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.predefined_roadmaps(id);

-- Trigger to create default user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Update trigger for predefined_roadmaps
CREATE TRIGGER update_predefined_roadmaps_updated_at
  BEFORE UPDATE ON public.predefined_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
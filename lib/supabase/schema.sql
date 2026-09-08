-- OfficeWorld Database Schema & Initial Seeds
-- Run this in your Supabase SQL Editor if connecting to real Supabase!

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'character1',
  department TEXT DEFAULT 'Engineering',
  job_title TEXT DEFAULT 'Software Developer',
  status TEXT DEFAULT 'Working',
  desk_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Offices table
CREATE TABLE IF NOT EXISTS public.offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Desks table
CREATE TABLE IF NOT EXISTS public.desks (
  id TEXT PRIMARY KEY,
  office_id UUID REFERENCES public.offices(id) ON DELETE CASCADE,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  label TEXT NOT NULL,
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Office Members table
CREATE TABLE IF NOT EXISTS public.office_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID REFERENCES public.offices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  desk_id TEXT REFERENCES public.desks(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'member',
  UNIQUE(office_id, user_id)
);

-- Messages table (Direct / Proximity chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  office_id UUID REFERENCES public.offices(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Office Snaps table
CREATE TABLE IF NOT EXISTS public.snaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Snap Reactions table
CREATE TABLE IF NOT EXISTS public.snap_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snap_id UUID NOT NULL REFERENCES public.snaps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(snap_id, user_id, reaction)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snap_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow read access to offices" ON public.offices FOR SELECT USING (true);
CREATE POLICY "Allow read access to desks" ON public.desks FOR SELECT USING (true);

CREATE POLICY "Allow members to read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow users to send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Allow public read access to snaps" ON public.snaps FOR SELECT USING (true);
CREATE POLICY "Allow users to create snaps" ON public.snaps FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow public read access to snap reactions" ON public.snap_reactions FOR SELECT USING (true);
CREATE POLICY "Allow users to create reactions" ON public.snap_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

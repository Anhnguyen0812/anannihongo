-- ============================================
-- SQL Script: Add INSERT Policies for Import
-- ============================================
-- Run this in Supabase SQL Editor to allow data import

-- 1. Add policy to allow INSERT into courses table
CREATE POLICY "Allow insert courses for service role" 
ON public.courses 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 2. Add policy to allow INSERT into lessons table
CREATE POLICY "Allow insert lessons for service role" 
ON public.lessons 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- ============================================
-- After import is complete, you can remove these policies if needed:
-- DROP POLICY "Allow insert courses for service role" ON public.courses;
-- DROP POLICY "Allow insert lessons for service role" ON public.lessons;
-- ============================================

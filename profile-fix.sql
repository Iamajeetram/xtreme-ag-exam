-- Xtreme Exam Auth/Profile Fix
-- Purpose:
-- 1) Allow a newly authenticated Google user to create/update their profile safely.
-- 2) Never allow a normal browser user to choose is_admin=true.
-- 3) Automatically grant admin to the verified auth email ajeetram3@gmail.com.
-- Run this once in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.complete_exam_profile(
  _display_name TEXT,
  _mobile TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _email TEXT := lower(coalesce(auth.jwt() ->> 'email', ''));
  _admin BOOLEAN := (_email = 'ajeetram3@gmail.com');
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _display_name IS NULL OR length(trim(_display_name)) < 2 THEN
    RAISE EXCEPTION 'Please enter a valid full name';
  END IF;

  IF _mobile IS NULL OR _mobile !~ '^[0-9]{10}$' THEN
    RAISE EXCEPTION 'Please enter a valid 10-digit mobile number';
  END IF;

  INSERT INTO public.profiles (
    id, display_name, mobile, is_admin, created_at, updated_at
  )
  VALUES (
    _uid, trim(_display_name), _mobile, _admin, now(), now()
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    mobile = EXCLUDED.mobile,
    updated_at = now();

  -- Never downgrade an existing admin accidentally.
  IF _admin THEN
    UPDATE public.profiles
    SET is_admin = true, updated_at = now()
    WHERE id = _uid;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_exam_profile(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_exam_profile(TEXT, TEXT) TO authenticated;

XTREME EXAM AUTH + ADMIN FIX

Files:
1. auth.html
2. complete-profile.html
3. admin.html

Upload these files to the root of the exam.xtremeagapps.in GitHub Pages repository.

IMPORTANT:
- The Google OAuth redirect used by auth.html is:
  https://exam.xtremeagapps.in/auth.html
- Supabase Authentication -> URL Configuration -> Redirect URLs must contain that exact URL.
- Google Cloud -> Xtreme AG Apps Web -> Authorized JavaScript origins must contain:
  https://exam.xtremeagapps.in
- Google Cloud -> Authorized redirect URIs must KEEP the Supabase callback:
  https://vbfjafblxnrfminbdlbb.supabase.co/auth/v1/callback

ADMIN:
- Google account: ajeetram3@gmail.com
- Admin access requires BOTH the exact email and profiles.is_admin = true.
- The existing admin profile should therefore open admin.html automatically after Google sign-in.
- Do not set is_admin=true from the browser for ordinary users.

FLOW:
Google -> Supabase -> auth.html
new user -> complete-profile.html -> test-portal.html
existing user -> test-portal.html
admin (ajeetram3@gmail.com + is_admin=true) -> admin.html

Xtreme Exam Google Auth Phase 1
- auth.html: Google sign-in.
- complete-profile.html: first-time name + mobile setup.
- Uses existing xtreme-ag-apps Supabase project and profiles table.
- Does not modify tests, payments, Live Chat owner tables, passwords or OTP.
- Cross-subdomain automatic session sharing is a separate SSO bridge step because browser storage is origin-scoped.

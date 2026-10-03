Xtreme Exam Portal Phase 2
===========================
Included:
- Light theme Exam homepage
- Two entry portals: Test Series and Notes / Study Material
- Test Series requires account before entry
- Mobile + password direct login, no OTP UI
- Three initial tiles: Raj GK, RAS Prelims, RPSC 2nd Grade
- WhatsApp password-help button
- Admin console using Supabase Auth + profiles
- Admin user list: name, mobile, created time
- Passwords are NOT stored/displayed in plaintext

IMPORTANT AUTH SETUP
The mobile/password flow uses a synthetic Supabase Auth email based on the mobile number:
10-digit-mobile@login.xtremeagapps.in
Disable Supabase Auth "Confirm email" if you want immediate no-OTP account access.

ADMIN
Create/keep the admin Supabase Auth user with the requested email, then ensure its profiles row has is_admin=true.
Do not store the admin password in HTML/JavaScript.

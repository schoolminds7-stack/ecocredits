# EcoCredits

Waste-to-credits React app built with TanStack Router, Zustand, Tailwind v4, Vite, and Supabase Auth.

## Quick start
```bash
npm install
npm run dev
```

## Supabase setup
1. Configure **Phone** authentication and connect an SMS provider in Supabase Auth.
2. Set Vercel environment variables:
   - `VITE_SUPABASE_URL`: project URL
   - `VITE_SUPABASE_ANON_KEY`: anon/publishable key
3. Redeploy after setting the variables.
4. The database schema and transactional RPCs are in `supabase/migrations/`.

Only the anon/publishable key belongs in the frontend. Never expose a service-role or secret key in Vite.

## First administrator
New signups are household users by default. After creating your own account, use the Supabase SQL Editor to find your profile:
```sql
select id, phone, role from public.profiles;
```
Then promote only your own UUID once:
```sql
update public.profiles set role = 'ADMIN' where id = 'YOUR_AUTH_USER_UUID';
```
Do not share the UUID publicly. After promotion, sign out and sign in again.

## Implemented
- Supabase phone/password registration, sign-in, session restore, and sign-out
- Protected routes and profile-based roles
- Database-backed profile, wallet, category, product, submission, ledger, and redemption reads
- Transactional server-side submission, verification/crediting, redemption, cancellation, role/rate/product updates
- RLS and restricted direct table writes
- Local browser persistence excludes private account, wallet, ledger, submission, and redemption records

## Notes
Phone login requires Supabase SMS configuration and phone verification settings. Wallet balances and redemption tokens are controlled by Supabase RPCs. Admin role assignment is performed through the database, not user-editable metadata.

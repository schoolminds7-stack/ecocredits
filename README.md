# EcoCredits

Waste-to-credits React app built with TanStack Router, Zustand, Tailwind v4, Vite, and Supabase Auth.

## Quick start
```bash
npm install
npm run dev
```

## Supabase setup
1. Configure phone authentication in Supabase Authentication settings and connect an SMS provider.
2. Ensure the `profiles` table and signup trigger are enabled (the project already contains these).
3. In Vercel Project Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL`: your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: your Supabase anon/publishable key
4. Redeploy after setting the variables.

Only use the anon/publishable key in the frontend. Never put a Supabase service-role key in Vite environment variables.

## Features
- Supabase phone/password sign-in and registration
- Supabase session restoration and sign-out
- Protected app routes and database profile role display
- Household waste submission and marketplace UI
- Collection/admin operations UI
- Local Zustand state for app features not yet migrated to Supabase tables

## Note
Authentication and profile role lookup use Supabase. Wallet, submissions, ledger, and redemption actions are still local browser state and must be migrated to server-backed Supabase operations before production use.

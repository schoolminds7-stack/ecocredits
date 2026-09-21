# EcoCredits upgrades (production-oriented)

## Removed
- All demo accounts (Ananya household, Karthik agent) and the quick-fill demo buttons on the login screen
- Seed submissions, ledger entries, and pre-funded wallets
- `DEMO_ACCOUNTS` export

## Bootstrap account
- Only admin remains: mobile **9948499744**, password **kannamma*12**
- Storage key bumped to `ecocredits-v2` so old demo localStorage is ignored
- If admin is missing after a partial restore, it is re-injected on hydrate

## Admin powers (9948499744 and any promoted admin)
- **People & roles**: search users; set role to Household / Collection agent / Admin
  - Cannot demote yourself
  - Cannot demote the last remaining admin
- **Credit rates**: edit credits/kg; enable/disable materials
- **Marketplace**: edit product price, stock, and active listing
- **Verify**: confirm weight + grade and credit wallet
- **Reject**: reject a pending submission without crediting

## Collection agents
- Can verify and reject submissions (same as before, plus reject)
- Cannot change roles, rates, or products

## Households
- Self-register (10-digit mobile, password ≥ 6 characters)
- Submit waste (address required for home pickup)
- Redeem essentials; lock credits; complete with OTP or **cancel & unlock**
- Profile: update display name and password

## Other improvements
- Stronger validation on register and submissions
- Redemption hold window extended to 30 minutes
- Profile route + bottom/side navigation
- Cleaner empty states on operations desk
- Marketplace default stock increased for live use

## How to use
1. Sign in as admin (9948499744).
2. Have households register from the public sign-up form.
3. On **Operations → People & roles**, promote selected users to Collection agent or Admin.
4. Agents verify drop-offs; credits appear in household wallets.
5. Households redeem marketplace items and complete or cancel tokens.

Data still lives in the browser (Zustand + localStorage) until a server/database is wired. The product surface is no longer a multi-user demo seed.

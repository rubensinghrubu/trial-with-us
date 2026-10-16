# Trail With Us — Supabase setup

This project is currently a static HTML/CSS/JavaScript site. The added login and dashboards use Supabase Auth + Postgres directly from the browser. You must configure your own Supabase project before these pages can work.

## 1. Create the Supabase project

1. Visit https://supabase.com/dashboard and create a project.
2. Choose a strong database password and save it somewhere private.
3. Wait for the project to finish provisioning.
4. Open **Project Settings → API** (or **Connect**) and copy the **Project URL** and the **publishable/anon key**. Do not copy a `service_role` or secret key into this website.

## 2. Configure the front end

1. Open `supabase-config.js`.
2. Replace `https://YOUR-PROJECT.supabase.co` with your Project URL.
3. Replace `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY` with the publishable/anon key.
4. Save and commit the file. The publishable/anon key is intended for browser use; security must come from RLS policies, not from hiding this key.

## 3. Create the database tables and policies

1. In Supabase, open **SQL Editor → New query**.
2. Copy all contents of `supabase-setup.sql` into the editor.
3. Run it and confirm there are no errors. This creates profiles, places, packages, discounts, bookings, guide applications, reviews and reports, with Row Level Security (RLS).
4. Run `supabase-upgrade.sql` in **SQL Editor** as well. This adds the shared gallery manager table and photo bucket, profile-avatar bucket and safe profile-update function, coupon-code validation, trip-request submission, checkout price breakdown columns, and package image URLs. The gallery manager, profile picture uploads, profile edits and discount-code checkout require this upgrade.
5. The upgrade migration seeds the curated destination catalogue across all eight Northeast states, starter trip itineraries, and shared stay/ride/gear inventory. Accommodation rows are private draft templates only; add and verify real properties before publishing them. It adds public-safe RPCs for published destination keys and admin-approved guide listings. Stays, ride rates and gear are then read from shared Supabase records and can be managed in the admin workspace. New guide applications should include the expected day rate; existing approved applicants with no rate set won't show a bookable price until their rate is updated.
6. In **Authentication → URL Configuration**, set the Site URL to your deployed Vercel URL (for example `https://your-project.vercel.app`). Add both the Vercel URL and local development URL to Redirect URLs if you use them.
7. In **Authentication → Providers → Email**, decide whether email confirmation should be required. If enabled, configure SMTP for reliable production delivery; Supabase's default email service is limited.

## 4. Create the first admin safely

1. Sign up through `login.html` using the email you want to use as the admin.
2. Confirm the email if confirmations are enabled, then sign in once so the profile row is created.
3. In Supabase **SQL Editor**, run the following, replacing the email exactly:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('YOUR_ADMIN_EMAIL@example.com');
```

4. Sign out and sign in again. The normal website will open, and the profile menu will show **Admin workspace** for that account.
5. Never allow a public signup form to choose a role. New accounts always start as `user`; admin promotes approved guides after checking their application.

## 5. Deploy to Vercel

Push the new files and assets to your GitHub repository and import/redeploy it in Vercel. This is a plain static site: no build command is needed. Test login, email confirmation, password reset and dashboard routing on the deployed URL.

## What is included in this starter

- One email/password login page with account creation and password reset, plus safe editing of the name, phone number and profile picture.
- Role-based routing for `admin`, `guide` and `user` profiles.
- Admin dashboard: create/edit/delete packages and places, manage published stay/ride/gear inventory, create/disable/delete discount codes; review guide applications; view trip requests; and open the shared gallery manager.
- Traveller dashboard: view the signed-in traveller's trip requests and submit a guide application.
- Guide dashboard: view guide approval/application status and assigned trips.
- Shared gallery management: change built-in captions/locations/photos, hide or republish memories, and add or delete custom public entries.
- SQL tables and RLS policies for bookings, profiles, guide applications, packages, places, discounts, reviews and reports.

## Important gaps before real customers use it

- Checkout now validates coupon codes through Supabase and creates a pending trip request with a subtotal/discount/total breakdown. The checkout RPC now recomputes item totals from published database catalogue rows, rejects stale prices and requires a preferred start date. It still does not charge money or confirm guide/room/ride availability; an operator must verify availability and arrange payment separately.
- Starter package itineraries are seeded only when the packages table is empty, so deleting an item in Admin will not make it reappear. These are indicative trip plans until you add/confirm real providers, dates and inclusions.
- Stay, ride and gear catalogues are now sourced from Supabase after the upgrade migration. Ride distances and travel times remain labelled estimates, not live routing. The trip request RPC validates each selected package, approved guide, accommodation, ride rate and gear item against published database records, recalculates the line totals server-side, and rejects stale cart totals. Route distances are estimates, and actual provider/room/vehicle/gear availability still needs an operator confirmation.
- Guide application notes are not a secure document upload system. Identity/permit documents are not implemented as a secure upload workflow. Use a separate private Supabase Storage bucket with strict policies for those files, and avoid storing sensitive ID numbers in plain text. Profile pictures use a separate public bucket and users can only write to their own folder.
- Admins can create/edit/delete package and place records, create/disable/delete discount codes, review guide applications, and manage shared gallery entries. Online card/UPI payment, transactional email/SMS delivery, real calendar/stock availability, full refunds, audit logs and dispute management still need provider credentials and production server-side integration. In-app notifications are supported, but they are not email or SMS.
- A production site should add rate limiting/abuse protection, email templates, terms/privacy/cancellation policies, support contacts, and tested backup/recovery.

## Role and security model

- New accounts are always `user`.
- Only an admin can change profile roles or review applications under the supplied policies.
- The browser anon/publishable key is not a secret. RLS is mandatory.
- Never put a Supabase service-role/secret key in `supabase-config.js`, GitHub, or any client-side file.

### If signup displays “Failed to fetch”

That error means the browser could not complete a network request; it is usually not a password-matching issue. On `login.html`, click **Troubleshoot connection**. Then verify:

- `supabase-config.js` contains the exact HTTPS **Project URL** and **publishable/anon key** from the same Supabase project. Do not paste a database password or service-role/secret key here.
- The Supabase project is active and not paused, and your network/browser extension/VPN is not blocking `*.supabase.co`. Try the deployed HTTPS site or a different network.
- The email provider is enabled in **Authentication → Providers → Email**.
- The deployed site origin is listed in **Authentication → URL Configuration → Redirect URLs**.
- Run `supabase-setup.sql` successfully so the `on_auth_user_created` trigger can create the initial `profiles` row. A failed trigger usually returns a database error rather than “Failed to fetch.”

If the connection check succeeds but signup still fails, open browser Developer Tools → Network, retry once, and inspect the request to `/auth/v1/signup` and its response. Do not share a secret/service-role key in screenshots.

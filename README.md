# Trail With Us — full visual renovation

This ZIP contains a full visual renovation of the static HTML/CSS/JavaScript website. The design now uses an editorial outdoor-travel direction: immersive landscape imagery, ink-blue surfaces, warm coral accents, serif display typography, softer cards, clearer hierarchy and responsive layouts that are intentionally different on desktop and mobile.

## What's included

- Responsive design: wide desktop header and editorial hero; mobile uses a compact top bar, horizontally scrollable destination cards, two-column trip filters and a bottom quick-nav.
- Language-first local guide matching: keeps the existing destination/language filters and makes guide approval status visible.
- Offbeat hill homestay discovery: improves the stay page descriptions while preserving the existing shared listings and trip-request flow.
- Local transport discovery: preserves the shared-seat/taxi/SUV estimate flow and clarifies that fares require provider confirmation.
- GPS and safety monitor: browser geolocation tracking, route polyline, saved personal risk-zone circles, proximity warnings, current-weather risk checks via Open-Meteo, browser notifications (optional), emergency contacts and SOS message preparation.
- Trekker community: new `community.html` page with public Q&A/tip/buddy posts, filters, search and replies, using Supabase Row Level Security.

## Setup

1. Extract the ZIP and serve the folder from a local web server or static host. For example, use VS Code Live Server or `python -m http.server 8000` from this folder. The GPS browser API normally requires HTTPS or localhost.
2. Open `supabase-config.js` and make sure the Supabase project URL and public publishable/anon key belong to your project. Never put a service-role/secret key in browser code.
3. In Supabase SQL Editor, run `supabase-setup.sql` if setting up a fresh database, then run the updated `supabase-upgrade.sql`. The upgrade script now also creates the community tables and policies. The community-specific SQL is also available separately in `supabase-community.sql` if you prefer applying that migration by itself; do not run it before the base `profiles` table and `current_user_role()` function exist.
4. In Supabase Authentication settings, configure the allowed redirect URLs for your deployed website and the sign-in method you use.
5. Sign in to create community posts and replies. Reading published community posts is public; publishing and replying require an account.

## Safety limitations

- GPS access requires the traveller to grant browser permission and the page to remain open. The GPS trail and personal risk zones are managed in the browser; personal risk zones are saved in that browser's local storage. When a weather check runs, the current coordinates are sent to Open-Meteo to retrieve nearby current conditions.
- Weather checks use Open-Meteo current-condition data as an advisory signal. These are not official government trail, road or severe-weather alerts, and coverage/update timing can vary. Always check local authorities and a knowledgeable local guide.
- SOS prepares a message and offers the Indian emergency number 112; it does **not** automatically send messages, notify a travel desk or dispatch help.
- User-created risk zones are not a shared or verified hazard database. Add only zones you have good reason to mark.

## Media assets

All fixed image defaults now point to the project's local `assets/` files instead of hardcoded stock-photo URLs. The source ZIP provided for this renovation did **not** contain the actual `assets/` directory or hero video, so this ZIP restores the paths but cannot recreate files that were not uploaded. Keep your existing `assets/` directory beside these HTML/JS/CSS files when you copy the update into your project.

The restored root-level file conventions include `hikers.jpg`, `hero-video.mp4`, `dzukou-valley.jpg`, `valley.jpg`, `bridge.jpg`, `boats.jpg`, `falls.jpg`, `road.jpg`, `homestay.jpg`, `travel-packages.jpg`, `travelling-gear.jpg`, `safety.jpg`, and `slideshow1.jpg` through `slideshow4.jpg`. Destination cards use per-place files at `assets/states/<state-slug>/<place-slug>.jpg`. Published/admin-provided image URLs remain supported, including local `assets/...` paths.

## Main files changed

- `style.css` — full editorial design system for desktop, tablet and mobile.
- `app.js` — responsive navigation shell, local asset paths, banner imagery and destination image handling.
- `index.html` — reworked hero/search layout, service grid and state discovery sections.
- `safety.html` — GPS weather/risk-zone monitor and CDN Leaflet reference.
- `community.html`, `community.js` — trekker discussion board.
- `supabase-upgrade.sql`, `supabase-community.sql` — community tables, RLS policies and indexes.


### Destination image assets
The destination explorer uses the per-place image paths rather than replacing them with generic remote photos. Store images at `assets/states/<state-slug>/<place-slug>.jpg`. Examples: `assets/states/nagaland/dzukou-valley.jpg`, `assets/states/meghalaya/root-bridge.jpg`, and `assets/states/assam/majuli-island.jpg`. Published Supabase image URLs remain supported. Destination-state badges are also fixed so they stay compact instead of stretching into tall pills.

## Latest responsive UI polish
- The homepage eight-state cards now use a consistent photo panel and separate dark content panel, with aligned action rows and responsive sizing.
- The mobile/tablet navigation drawer is anchored under the header, viewport-constrained, scrollable, and no longer competes with the header's flex layout.
- Desktop navigation keeps its layout-positioned active underline; mobile navigation uses a staggered drawer reveal and reduced-motion fallback.


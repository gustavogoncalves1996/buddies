
# Buddies App

## Overview

Buddies is an offline-first social app for discovering and hosting cozy snack events.

Core product goals:

- Find nearby snack gatherings on a map.
- Create and manage hosted events.
- Allow users to apply to events and hosts to accept/reject applicants.
- Work well on unstable networks through cache-first behaviors.
- Send web push notifications for host-side application activity.
- Support localization and locale-aware formatting (language, currency, timezone).

This project is built with React, Vite, TypeScript file structure, Supabase backend, and PWA capabilities.

## Tech Stack

- Frontend framework: React 19
- Bundler/dev server: Vite 8
- Routing: React Router
- State management: Zustand
- Server state/cache: TanStack React Query + persisted cache
- Styling: Tailwind CSS v4
- Forms/validation: react-hook-form, zod, @hookform/resolvers
- Maps: Leaflet + react-leaflet
- Backend: Supabase (Auth, Postgres, Storage, Edge Functions)
- i18n: i18next + react-i18next
- PWA/offline: vite-plugin-pwa + Workbox injectManifest + custom Service Worker
- Mobile shell support: Capacitor (android/ios folders present)

## Repository Structure

Main app root:

- [app](.)

Important directories and files:

- [src/App.tsx](src/App.tsx): app routes and global wrappers
- [src/main.tsx](src/main.tsx): app bootstrap, PWA registration, query persistence provider
- [src/store/useStore.ts](src/store/useStore.ts): global state and domain mutations
- [src/utils/supabase.ts](src/utils/supabase.ts): Supabase client initialization
- [src/i18n.ts](src/i18n.ts): translation dictionaries and i18n setup
- [src/contexts/LocaleContext.tsx](src/contexts/LocaleContext.tsx): locale detection, Intl helpers, language switching
- [src/lib/queryClient.ts](src/lib/queryClient.ts): query client defaults and persistence config
- [src/lib/push.ts](src/lib/push.ts): browser push subscribe/unsubscribe helpers
- [src/sw.ts](src/sw.ts): custom service worker (precache, caching strategies, push handling)
- [src/components](src/components): reusable UI and app shell components
- [src/pages](src/pages): route-level pages
- [public](public): static assets and icons
- [vite.config.js](vite.config.js): Vite + Tailwind + PWA config
- [PWA_AND_PUSH.md](PWA_AND_PUSH.md): implementation notes for push/offline

Backend/schema references in workspace root:

- [supabase/schema.sql](../supabase/schema.sql): full DB schema + RLS + seed
- [supabase/functions/notify-host-on-application/index.ts](../supabase/functions/notify-host-on-application/index.ts): push dispatcher function

## Product Flows

### Authentication

- Users sign in/up with Supabase Auth.
- A profile row is expected in public.profiles.
- Protected routes are guarded in [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx).

### Discovery

- Home map and card carousel in [src/pages/Home.tsx](src/pages/Home.tsx).
- Uses geolocation (when allowed) and distance calculations to rank/filter nearby events.

### Hosting

- Event creation in [src/pages/CreateEvent.tsx](src/pages/CreateEvent.tsx).
- Event image uploads are stored in Supabase Storage bucket event-images.

### Applications

- Users apply from [src/pages/EventDetail.tsx](src/pages/EventDetail.tsx).
- Hosts manage applicants in [src/pages/MyHostedSnacks.tsx](src/pages/MyHostedSnacks.tsx).
- Applicant status updates synchronize event current_snackers values.

### Profile and history

- User profile at [src/pages/Profile.tsx](src/pages/Profile.tsx).
- Confirmed events route at [src/pages/ConfirmedEvents.tsx](src/pages/ConfirmedEvents.tsx).

## State and Data Model

Primary client-side state is in Zustand store [src/store/useStore.ts](src/store/useStore.ts).

Store responsibilities:

- Hold auth session and app UI state.
- Fetch and normalize Supabase rows into UI-friendly camelCase shapes.
- Expose derived selectors (current user, host, event, nearby events).
- Perform mutations (create event, apply, update applicant status).
- Manage toast notifications.

Main table mappings:

- events -> UI event model
- profiles -> UI user model
- applicants -> applicant model
- past_events -> profile history model

## Supabase Setup

### Required environment variables

Create .env.local in [app](.) with at least:

- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_VAPID_PUBLIC_KEY (for browser push subscription)

### Database

Apply schema and policies from [supabase/schema.sql](../supabase/schema.sql).

Highlights:

- RLS is enabled on all core tables.
- Policies enforce ownership-based writes.
- Trigger auto-creates profile on auth.users insert.

### Storage

Expected public bucket:

- event-images

Used by upload helper in [src/store/useStore.ts](src/store/useStore.ts).

## PWA, Offline, and Push

### Service Worker behaviors

Implemented in [src/sw.ts](src/sw.ts):

- Precache build assets.
- Navigation fallback for SPA deep links.
- CacheFirst for images.
- NetworkFirst for Supabase host requests.
- StaleWhileRevalidate for Nominatim geocoding.
- Push and notification click handlers.

### Query persistence

[src/lib/queryClient.ts](src/lib/queryClient.ts) configures:

- staleTime 5 minutes
- gcTime 7 days
- offlineFirst networkMode
- localStorage persister key buddies-query-cache-v1

### Push notification flow

- Browser subscription via [src/lib/push.ts](src/lib/push.ts).
- Subscription saved to profiles.push_subscription.
- Edge Function [supabase/functions/notify-host-on-application/index.ts](../supabase/functions/notify-host-on-application/index.ts) sends push on applicants INSERT webhook.

Detailed operational notes are in [PWA_AND_PUSH.md](PWA_AND_PUSH.md).

## Localization and Locale Behavior

- Translation resources are centralized in [src/i18n.ts](src/i18n.ts).
- Locale detection and formatting are handled by [src/contexts/LocaleContext.tsx](src/contexts/LocaleContext.tsx).
- Locale preference is persisted in localStorage under buddies.locale.v1.
- Formatting utilities exposed to components:
  - formatCurrency
  - formatNumber
  - formatDate

## Scripts

From [app](.) directory:

- npm run dev: start Vite dev server
- npm run build: production build
- npm run preview: preview built app
- npm run lint: lint project

## Local Development Workflow

1. Install dependencies.

	npm install

2. Configure .env.local variables.

3. Run app.

	npm run dev

4. Build validation.

	npm run build

5. For realistic PWA tests (service worker), use preview mode.

	npm run build
	npm run preview

## Coding Conventions and Guidelines

- Keep route-level logic in pages and shared logic in store/hooks/components.
- Use i18n keys for all user-facing strings.
- Keep Supabase field normalization centralized in store mapper functions.
- Avoid introducing direct table shape dependencies in UI components.
- Prefer optimistic updates followed by authoritative refresh for mutations.
- Keep service worker logic in [src/sw.ts](src/sw.ts), not in page components.

## Known Technical Debt

- Zustand store currently uses broad any typing in [src/store/useStore.ts](src/store/useStore.ts).
- Some legacy backup/reference files may exist and should not be imported.
- Bundle size warning appears in build due to large chunks.

## Crucial Operational Points

- Do not commit .env.local or secrets.
- Supabase RLS policies are critical; verify policy changes in staging first.
- Push delivery requires both browser subscription and valid VAPID secrets on backend.
- Service worker updates may require hard reload during debugging.
- If offline behavior appears stale, clear Cache Storage and localStorage query cache.

## Suggested Improvements (Technical)

### Type safety hardening

- Define explicit StoreState interfaces for Zustand store.
- Add strict TypeScript settings incrementally in [tsconfig.json](tsconfig.json).
- Type route params and domain models end-to-end.

### State architecture

- Split monolithic store into slices (auth, events, ui, notifications).
- Move async server logic to dedicated data layer hooks where suitable.

### API robustness

- Add error normalization utility for consistent UI errors.
- Add retry/backoff strategy for key mutations.
- Introduce telemetry around failed network flows.

### Performance

- Add route-level code splitting for heavy pages (map, create, manage).
- Optimize map marker rendering for large event sets.
- Review image sizes and lazy loading strategy.

### Testing

- Add unit tests for mappers and store actions.
- Add integration tests for auth + create/apply/manage flows.
- Add e2e smoke tests for offline and push scenarios.

### Security and compliance

- Review all table policies periodically.
- Validate user input server-side where function/webhooks are used.
- Add audit logging for applicant status transitions.

## Suggested Product Features

### Discovery and matching

- Personalized recommendations by preferences and attendance history.
- Time-window and distance sliders for discovery filtering.
- Saved searches and alert subscriptions.

### Event quality

- Event capacity waitlist and auto-promotion.
- Host-defined questions in application forms.
- Event cancellation/reschedule flows with attendee notifications.

### Social layer

- Follow hosts and favorite events.
- In-app chat between host and accepted attendees.
- Post-event feedback and ratings per event.

### Reliability and UX

- Conflict resolution UI for offline edits.
- Better skeleton/loading states for all pages.
- Multi-language settings page with manual language override.

### Admin/ops

- Host moderation queue.
- Fraud/spam detection for abusive applications.
- Lightweight admin dashboard for event and user health metrics.

## Reference Links

- Vite: https://vite.dev
- React Router: https://reactrouter.com
- Zustand: https://zustand.docs.pmnd.rs
- TanStack Query: https://tanstack.com/query/latest
- Supabase: https://supabase.com/docs
- i18next: https://www.i18next.com
- Workbox: https://developer.chrome.com/docs/workbox
- vite-plugin-pwa: https://vite-pwa-org.netlify.app
- Leaflet: https://leafletjs.com

## Quick Troubleshooting

### Build works but app behaves stale

- Clear browser caches and localStorage keys:
  - buddies-query-cache-v1
  - buddies.locale.v1

### Push not received

- Check notification permission in browser settings.
- Confirm VITE_VAPID_PUBLIC_KEY exists.
- Confirm Edge Function is deployed and webhook is active.
- Confirm profile has push_subscription populated.

### No data after login

- Check Supabase URL/key values.
- Verify schema and RLS policies from [supabase/schema.sql](../supabase/schema.sql).
- Check browser console for auth/session errors.

## Maintainer Notes

When adding new screens:

- Add route in [src/App.tsx](src/App.tsx) with proper protection level.
- Add translation keys in [src/i18n.ts](src/i18n.ts).
- Reuse store selectors/actions where possible.
- Run lint and build before merging.

Recommended pre-merge checklist:

- npm run lint
- npm run build
- Basic manual smoke test of login, discovery, create, apply, manage, profile


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

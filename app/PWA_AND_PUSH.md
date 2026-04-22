# PWA, Push & Offline — Architecture Notes

End-to-end recipe for the Web Push + offline-first stack that ships with this app.
Everything below is wired in already; the only steps left to you are infra-side
(Supabase migration, Edge Function deploy, VAPID keys, PNG icons).

---

## 1. File map

```
app/
├─ vite.config.js                 ← VitePWA injectManifest config
├─ src/
│  ├─ sw.js                       ← Service Worker (precache + push)
│  ├─ main.jsx                    ← QueryClientProvider + registerSW()
│  ├─ lib/
│  │  ├─ queryClient.js           ← QueryClient + localStorage persister
│  │  └─ push.js                  ← subscribeUserToPush helper
│  ├─ hooks/
│  │  └─ useConfirmedEvents.js    ← React Query example (offline-first)
│  ├─ components/
│  │  ├─ OfflineBanner.jsx        ← Matcha "you're offline" banner
│  │  └─ PushPrompt.jsx           ← Cozy permission card
│  └─ pages/
│     └─ ConfirmedEvents.jsx      ← Demo page using the hook (route /confirmed)
└─ public/icons/                  ← icon-192.png, icon-512.png, icon-maskable.png
                                    (generate from your logo, e.g. https://realfavicongenerator.net)

supabase/
└─ functions/notify-host-on-application/
   └─ index.ts                    ← Deno Edge Function for push
```

---

## 2. Database — `profiles.push_subscription`

Run this once in the Supabase SQL editor:

```sql
alter table public.profiles
  add column if not exists push_subscription jsonb;

-- Only the owner can read/write their own subscription
create policy "self can read push_subscription"
  on public.profiles for select
  using (auth_id = auth.uid());

create policy "self can update push_subscription"
  on public.profiles for update
  using (auth_id = auth.uid())
  with check (auth_id = auth.uid());
```

### Security — why this column is safe to store

A Web Push `PushSubscription` is **not a credential**. It contains:

- an HTTPS `endpoint` URL on the user's browser-vendor push service (FCM, Mozilla, Apple),
- two public encryption keys (`p256dh`, `auth`).

To actually send a push you also need the server-side **VAPID private key**, which
lives only as an Edge Function secret. So even if a row leaked, an attacker still
couldn't push to the user. We still gate the column behind RLS so a logged-in user
can only see/modify their own row, and we set the column type to `jsonb` so the
whole subscription is stored atomically and we can swap providers without a schema
change. The Edge Function reads it with the **service-role key**, bypassing RLS,
so the client never needs broad read access to other users' subscriptions.

---

## 3. VAPID keys

Generate once:

```bash
npx web-push generate-vapid-keys
```

Then expose them:

```bash
# Frontend (.env.local) — public key only
echo 'VITE_VAPID_PUBLIC_KEY=BPxxxxx...' >> app/.env.local

# Backend (Supabase Edge Function secrets)
supabase secrets set \
  VAPID_PUBLIC_KEY=BPxxxxx... \
  VAPID_PRIVATE_KEY=YYYYY... \
  VAPID_SUBJECT=mailto:hello@buddies.app
```

---

## 4. Edge Function + Database Webhook

```bash
# Deploy the function
supabase functions deploy notify-host-on-application --no-verify-jwt
```

> `--no-verify-jwt` is required because Database Webhooks call functions with
> a service-role auth header, not an end-user JWT.

Then in the Supabase dashboard:

1. **Database → Webhooks → Create a new hook**
2. Table: `applicants`, Events: `INSERT`
3. Type: `Supabase Edge Functions`, function: `notify-host-on-application`
4. Save.

From now on, every new row in `applicants` triggers the function, which:

1. Looks up the event → host profile
2. Reads the host's `push_subscription`
3. Sends a Web Push via `web-push` (auto-cleans expired subs on `404` / `410`)

---

## 5. Offline-first cache flow

```
                 ┌─────────────────────────┐
   user opens →  │  PersistQueryClient     │
                 │  rehydrates from        │
                 │  localStorage SYNC      │  ← cached data shown instantly
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │  React Query refetches  │  ← if online, fresh data swaps in
                 │  in the background      │
                 └─────────────────────────┘

         ┌── Service Worker (sw.js) ──┐
         │ • precache: build assets   │
         │ • CacheFirst: images       │
         │ • NetworkFirst: Supabase   │
         │ • SWR: Nominatim           │
         └────────────────────────────┘
```

Concrete demo: open `/confirmed` (the `ConfirmedEvents` page) while online.
Close the browser, kill Wi-Fi, reopen. The list and event details still render
because:

- the React-Query cache lives in `localStorage` under `buddies-query-cache-v1`,
- the JS/CSS shell is precached by Workbox,
- event cover images are served from the `images-v1` Cache Storage bucket.

---

## 6. Generating icons (manual)

Drop `icon-192.png`, `icon-512.png`, `icon-maskable.png` into `app/public/icons/`.
Quickest path: upload your logo to <https://realfavicongenerator.net> or run:

```bash
npx pwa-asset-generator ./logo.png ./app/public/icons \
  --background "#fdf7e8" --padding "10%" --icon-only --type png
```

---

## 7. Local dev gotchas

- Push & SW only work over **HTTPS** (or `localhost`). Use `npm run preview` for
  realistic testing — `npm run dev` doesn't ship the SW (`devOptions.enabled: false`).
- After changing `sw.js`, do a hard reload + check **DevTools → Application → Service Workers**
  → **Update on reload**.
- To test offline: DevTools → Network tab → throttling → **Offline**.

---

## 8. Sanity-check checklist

- [ ] `profiles.push_subscription` column + RLS policies created
- [ ] VAPID keys generated; `VITE_VAPID_PUBLIC_KEY` in `.env.local`
- [ ] `supabase secrets set ...` for the three VAPID vars
- [ ] Edge Function deployed
- [ ] Database webhook on `applicants INSERT` → function
- [ ] PWA icons present in `public/icons/`
- [ ] `npm run build && npm run preview` → install prompt appears, push prompt
      shows after login, banner appears when going offline.

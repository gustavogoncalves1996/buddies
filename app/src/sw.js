/* eslint-env serviceworker */
/* global clients */
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

/* ──────────────────────────────────────────────────────────────────
 * 1. PRECACHE static build assets (JS/CSS/HTML/icons)
 * ────────────────────────────────────────────────────────────────── */
precacheAndRoute(self.__WB_MANIFEST || [])

/* SPA fallback so deep links work offline */
registerRoute(new NavigationRoute(
  async ({ event }) => {
    try {
      return await new NetworkFirst({ cacheName: 'pages' }).handle({ event, request: event.request })
    } catch {
      const cache = await caches.open('workbox-precache-v2')
      return (await cache.match('/index.html')) || Response.error()
    }
  },
))

/* Images — long-lived cache (event covers, avatars, OSM tiles) */
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
)

/* Supabase REST/Storage — network-first with offline fallback */
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-v1',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  }),
)

/* Nominatim geocoding — stale-while-revalidate */
registerRoute(
  ({ url }) => url.hostname === 'nominatim.openstreetmap.org',
  new StaleWhileRevalidate({ cacheName: 'geocoding-v1' }),
)

/* ──────────────────────────────────────────────────────────────────
 * 2. PUSH notifications
 * ────────────────────────────────────────────────────────────────── */
self.addEventListener('push', (event) => {
  let payload = { title: 'New activity in Buddies 🍪', body: '', url: '/' }
  try {
    if (event.data) payload = { ...payload, ...event.data.json() }
  } catch {
    payload.body = event.data?.text() || payload.body
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url },
      vibrate: [80, 40, 80],
      tag: payload.tag || 'buddies-default',
      renotify: !!payload.tag,
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url || '/'
  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true })
    const existing = all.find((c) => c.url.includes(self.registration.scope))
    if (existing) {
      existing.focus()
      existing.navigate(target).catch(() => {})
      return
    }
    await clients.openWindow(target)
  })())
})

/* ──────────────────────────────────────────────────────────────────
 * 3. Allow page to trigger immediate activation
 * ────────────────────────────────────────────────────────────────── */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

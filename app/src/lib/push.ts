import { supabase } from "../utils/supabase";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/** Convert the URL-safe base64 VAPID key into the Uint8Array the Push API needs. */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Ask the browser for permission, subscribe via the active SW, and
 * persist the subscription on the user's profile row.
 */
export async function subscribeUserToPush(profileId) {
  if (!isPushSupported()) throw new Error("Push isn't supported on this device.");
  if (!VAPID_PUBLIC_KEY) throw new Error("VITE_VAPID_PUBLIC_KEY is not configured.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission denied.");

  const registration = await navigator.serviceWorker.ready;
  let sub = await registration.pushManager.getSubscription();
  if (!sub) {
    sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  // Persist on the profile (one row per user). The column is JSONB.
  const { error } = await supabase
    .from("profiles")
    .update({ push_subscription: sub.toJSON() })
    .eq("id", profileId);
  if (error) throw error;

  return sub;
}

export async function unsubscribeFromPush(profileId) {
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  if (sub) await sub.unsubscribe();
  await supabase
    .from("profiles")
    .update({ push_subscription: null })
    .eq("id", profileId);
}

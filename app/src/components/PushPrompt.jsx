import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import useStore from "../store/useStore";
import { isPushSupported, subscribeUserToPush } from "../lib/push";

const DISMISS_KEY = "buddies.pushPrompt.dismissedAt";
const DISMISS_FOR_MS = 1000 * 60 * 60 * 24 * 7; // a week

/**
 * Cozy invitation card that asks the host to enable push notifications
 * so they get pinged the moment a new application lands.
 *
 * Only shown when:
 *   - browser supports push,
 *   - permission is still "default",
 *   - user hasn't dismissed it within the past week.
 */
export default function PushPrompt() {
  const me = useStore((s) => s.getCurrentUser());
  const pushToast = useStore((s) => s.pushToast);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!me || !isPushSupported()) return;
    if (Notification.permission !== "default") return;
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissedAt < DISMISS_FOR_MS) return;
    setVisible(true);
  }, [me]);

  if (!visible) return null;

  const handleEnable = async () => {
    setBusy(true);
    try {
      await subscribeUserToPush(me.id);
      pushToast("You're on the guest list — we'll ping you 🔔", "success");
      setVisible(false);
    } catch (err) {
      pushToast(err.message || "Couldn't enable notifications.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,420px)]">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-cozy p-4 flex items-start gap-3 animate-toast-in">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <Bell size={18} className="text-on-primary-container" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-on-surface">
            Get pinged for new snackers
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Allow notifications and we'll knock on your door the second
            someone applies to one of your gatherings.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleEnable}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition disabled:opacity-60"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center gap-1.5 text-on-surface-variant text-xs font-semibold px-3 py-2 rounded-full hover:bg-surface-container-high transition"
            >
              <BellOff size={14} /> Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

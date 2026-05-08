import { useEffect, useState } from "react";
import { CloudOff, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Tiny Matcha-and-Biscuit banner that slides in when the browser
 * goes offline and gracefully fades out when we're back online.
 */
export default function OfflineBanner() {
  const { t } = useTranslation();
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 2500);
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online && !showRestored) return null;

  const offline = !online;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-9999 px-4 py-2.5 rounded-full shadow-cozy
        flex items-center gap-2.5 text-sm font-semibold backdrop-blur-md
        animate-toast-in
        ${offline
          ? "bg-surface-container-highest/95 text-on-surface border border-outline-variant"
          : "bg-primary-container/95 text-on-primary-container border border-primary/30"}`}
    >
      {offline ? (
        <>
          <CloudOff size={16} className="text-primary" />
          <span>{t("offlineBanner.offline")}</span>
        </>
      ) : (
        <>
          <Wifi size={16} className="text-primary" />
          <span>{t("offlineBanner.online")}</span>
        </>
      )}
    </div>
  );
}

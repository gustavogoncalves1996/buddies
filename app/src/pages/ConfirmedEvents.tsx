import { CalendarDays, MapPin, CloudOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useConfirmedEvents } from "../hooks/useConfirmedEvents";

/**
 * Demo page showing offline-first behaviour: persisted React Query cache
 * makes this list appear instantly even with no network.
 */
export default function ConfirmedEvents() {
  const { t } = useTranslation();
  const { data: events = [], isLoading, isFetching, isError } = useConfirmedEvents();
  const offline = typeof navigator !== "undefined" && !navigator.onLine;

  return (
    <div className="min-h-screen bg-surface px-4 md:px-8 py-6 pb-24 md:pb-12">
      <header className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-on-surface tracking-tight">
            {t("confirmed.title")}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t("confirmed.subtitle")}
          </p>
        </div>
        {(offline || isFetching) && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-full">
            <CloudOff size={12} /> {offline ? t("confirmed.fromCache") : t("confirmed.refreshing")}
          </span>
        )}
      </header>

      <main className="max-w-3xl mx-auto space-y-3">
        {isLoading && events.length === 0 && (
          <p className="text-on-surface-variant text-sm">{t("confirmed.loadingPlans")}</p>
        )}
        {isError && events.length === 0 && (
          <p className="text-error text-sm">
            {t("confirmed.fetchFail")}
          </p>
        )}
        {events.map((e) => (
          <article
            key={e.id}
            className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex gap-4 hover:shadow-cozy transition-shadow"
          >
            <img
              src={e.image}
              alt=""
              loading="lazy"
              className="w-20 h-20 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-on-surface truncate">{e.title}</h2>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                <MapPin size={12} /> {e.location}
              </p>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                <CalendarDays size={12} /> {e.date} · {e.time}
              </p>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}

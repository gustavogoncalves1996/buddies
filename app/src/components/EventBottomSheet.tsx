import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EventBottomSheet({ event, host, onClose }) {
  const { t } = useTranslation();
  if (!event) return null;

  const spotsLeft = Math.max(0, (event.maxSnackers || 0) - (event.currentSnackers || 0));

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-on-surface/20" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden animate-[slide-up_0.25s_ease-out]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface-container-high/80 flex items-center justify-center"
        >
          <X size={16} className="text-on-surface" />
        </button>

        {/* Image */}
        <div className="h-36 w-full overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3">
            <span className="bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
              {event.tag}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-headline text-lg font-bold text-on-surface leading-tight">{event.title}</h3>

          <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-primary" />
              {event.date && new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {event.time && ` · ${event.time}`}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              <span className="truncate max-w-48">{event.location}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-primary" />
              {t("home.spotsLeft", { count: spotsLeft })}
            </span>
          </div>

          {host && (
            <div className="flex items-center gap-2 pt-1">
              <img src={host.avatar} alt={host.name} className="w-7 h-7 rounded-full object-cover border-2 border-surface-container-lowest" />
              <span className="text-sm font-semibold text-on-surface">{host.name}</span>
            </div>
          )}

          <Link
            to={`/event/${event.id}`}
            onClick={onClose}
            className="block w-full text-center py-3 bg-primary text-on-primary font-bold rounded-full hover:scale-[1.01] active:scale-95 transition-all"
          >
            {t("eventDetail.applyToJoin")}
          </Link>
        </div>
      </div>
    </>
  );
}

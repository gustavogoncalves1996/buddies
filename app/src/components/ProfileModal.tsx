import { X, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProfileModal({ user, onClose }) {
  const { t } = useTranslation();
  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden animate-[slide-up_0.2s_ease-out]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface-container-high/80 flex items-center justify-center"
        >
          <X size={16} className="text-on-surface" />
        </button>

        {/* Hero */}
        <div className="bg-linear-to-br from-primary to-primary-container p-8 pt-10 flex flex-col items-center">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-on-primary/20 shadow-xl"
          />
          <h2 className="mt-4 text-2xl font-headline font-extrabold text-on-primary">{user.name}</h2>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
            ))}
            <span className="ml-1 text-sm font-bold text-on-primary/90">{user.rating}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-outline-variant/30 py-5 px-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-on-surface">{user.eventsHosted || 0}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">{t("profile.hostedShort")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-on-surface">{user.eventsAttended || 0}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">{t("profile.attendedShort")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-on-surface">{user.rating || "—"}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">{t("profile.rating")}</p>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="px-6 pb-6">
            <p className="text-on-surface-variant text-sm leading-relaxed italic">{user.bio}</p>
          </div>
        )}

        {/* Hobbies */}
        {user.hobbies?.length > 0 && (
          <div className="px-6 pb-6 flex flex-wrap gap-2">
            {user.hobbies.map((h) => (
              <span key={h} className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">
                {h}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

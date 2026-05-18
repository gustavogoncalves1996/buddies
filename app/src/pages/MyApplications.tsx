import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";
import ConfirmDialog from "../components/ConfirmDialog";

const STATUS_ICON = { pending: Clock, accepted: CheckCircle2, rejected: XCircle };
const STATUS_STYLE = {
  pending: "bg-secondary-container text-on-secondary-container",
  accepted: "bg-primary text-on-primary",
  rejected: "bg-error-container text-on-error-container",
};

export default function MyApplications() {
  const { t } = useTranslation();
  const events = useStore((s) => s.events);
  const users = useStore((s) => s.users);
  const applicants = useStore((s) => s.applicants);
  const session = useStore((s) => s.session);
  const dataReady = useStore((s) => s.dataReady);
  const cancelApplication = useStore((s) => s.cancelApplication);
  const pushToast = useStore((s) => s.pushToast);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);

  const currentUser = useMemo(
    () => (session ? users.find((u) => u.authId === session.user.id) : null),
    [users, session]
  );

  const myApps = useMemo(() => {
    if (!currentUser) return [];
    return applicants
      .filter((a) => a.userId === currentUser.id)
      .map((a) => ({ ...a, event: events.find((e) => e.id === a.eventId) }))
      .sort((a, b) => {
        const order = { pending: 0, accepted: 1, rejected: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      });
  }, [applicants, currentUser, events]);

  if (!dataReady) return null;

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        <p className="text-xs uppercase tracking-widest font-bold text-primary mb-1">{t("applied.kicker")}</p>
        <h1 className="text-2xl md:text-4xl font-headline font-extrabold text-on-surface mb-8">{t("applied.title")}</h1>

        {myApps.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🍃</p>
            <p className="text-on-surface-variant font-medium">{t("applied.empty")}</p>
            <Link to="/" className="inline-block mt-4 bg-primary text-on-primary px-6 py-3 rounded-full font-bold">
              {t("applied.discover")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myApps.map((app) => {
              const Icon = STATUS_ICON[app.status] || Clock;
              const ev = app.event;
              return (
                <div key={app.id} className="flex items-center gap-4 bg-surface-container-lowest rounded-2xl p-4 shadow-float hover:shadow-cozy transition-shadow group">
                  <Link
                    to={ev ? `/event/${ev.id}` : "#"}
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    {ev?.image && (
                      <img src={ev.image} alt={ev.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline font-bold text-on-surface truncate">{ev?.title || t("applied.unknownEvent")}</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {ev?.date && new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {ev?.time && ` · ${ev.time}`}
                      </p>
                      {app.message && (
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-1 italic">"{app.message}"</p>
                      )}
                    </div>
                  </Link>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${STATUS_STYLE[app.status] || ""}`}>
                    <Icon size={14} />
                    {t(`common.${app.status === "rejected" ? "declined" : app.status}`)}
                  </span>
                  {app.status === "pending" && (
                    <button
                      onClick={() => setCancelTarget(app)}
                      className="text-xs text-error font-medium hover:underline shrink-0"
                    >
                      {t("common.close")}
                    </button>
                  )}
                  <Link to={ev ? `/event/${ev.id}` : "#"}>
                    <ChevronRight size={16} className="text-on-surface-variant/40 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title={t("applied.cancelConfirmTitle")}
        description={t("applied.cancelConfirmBody")}
        confirmLabel={t("common.close")}
        cancelLabel={t("common.back")}
        tone="danger"
        busy={cancelBusy}
        onCancel={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (!cancelTarget) return;
          setCancelBusy(true);
          try {
            await cancelApplication(cancelTarget.id);
            pushToast(t("applied.cancelled"), "success");
            setCancelTarget(null);
          } catch {
            pushToast(t("applied.cancelFail"), "error");
          } finally {
            setCancelBusy(false);
          }
        }}
      />
    </div>
  );
}

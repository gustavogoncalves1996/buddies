import { useState, useMemo, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { CalendarDays, MapPin, Users, ChevronDown, ChevronUp, Check, X, ChevronLeft, ChevronRight, Pencil, Ban } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import useStore from "../store/useStore";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmDialog from "../components/ConfirmDialog";
import { ManageSkeleton } from "../components/PageSkeletons";
import { getErrorMessage } from "../utils/errors";

const CANNABIS_SVG =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="#37602c" xmlns="http://www.w3.org/2000/svg"><path d="M12 22c-.3-1.6-.6-3.1-.9-4.6-1.4.6-2.9.9-4.5.9 1-1.3 1.7-2.7 2.1-4.3-1.6.2-3.2 0-4.7-.6 1.4-1 2.5-2.2 3.3-3.6-1.5-.4-2.9-1.1-4.1-2.1 1.6-.2 3.2-.7 4.5-1.6C6.3 5 5.3 3.5 4.7 1.9c1.5.6 2.9 1.5 4.1 2.7.6-1.5 1.5-2.9 2.7-4 .3 1.6.3 3.3 0 4.9 1.2-1.2 2.6-2.1 4.1-2.7-.6 1.6-1.6 3.1-2.9 4.2 1.3.9 2.9 1.4 4.5 1.6-1.2 1-2.6 1.7-4.1 2.1.8 1.4 1.9 2.6 3.3 3.6-1.5.6-3.1.8-4.7.6.4 1.6 1.1 3 2.1 4.3-1.6 0-3.1-.3-4.5-.9-.3 1.5-.6 3-.9 4.6Z"/></svg>';

function makeEventMarker(title, active) {
  const safe = String(title || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const ringColor = active
    ? "radial-gradient(circle, rgba(79,121,66,0.85) 0%, rgba(79,121,66,0.3) 55%, transparent 75%)"
    : "radial-gradient(circle, rgba(79,121,66,0.55) 0%, rgba(79,121,66,0.18) 55%, transparent 75%)";
  const border = active ? "3px solid #37602c" : "2px solid rgba(79,121,66,0.25)";
  const scale = active ? 1.1 : 1;
  return L.divIcon({
    className: "cozy-event-pin",
    html:
      '<div style="display:flex;flex-direction:column;align-items:center;pointer-events:auto;transform:scale(' + scale + ');transform-origin:center bottom;">' +
        '<div style="position:relative;width:64px;height:64px;display:flex;align-items:center;justify-content:center;">' +
          '<div style="position:absolute;inset:0;border-radius:50%;background:' + ringColor + ';"></div>' +
          '<div style="position:relative;width:40px;height:40px;border-radius:50%;background:#ffffff;border:' + border + ';box-shadow:0 6px 18px rgba(55,96,44,0.25);display:flex;align-items:center;justify-content:center;">' +
            CANNABIS_SVG +
          '</div>' +
        '</div>' +
        '<div style="margin-top:-6px;background:#ffffff;padding:3px 10px;border-radius:9999px;box-shadow:0 4px 12px rgba(0,0,0,0.12);font-family:Plus Jakarta Sans, sans-serif;font-size:11px;font-weight:700;color:#1c1c17;white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;">' + safe + '</div>' +
      '</div>',
    iconSize: [160, 88],
    iconAnchor: [80, 80],
  });
}

/** Re-center the map once the user's geolocation arrives */
function RecenterOnUser() {
  const map = useMap();
  const userLocation = useStore((s) => s.userLocation);
  useEffect(() => {
    if (userLocation) map.setView([userLocation.lat, userLocation.lng], 12);
  }, [userLocation, map]);
  return null;
}

export default function MyHostedSnacks() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("upcoming");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const allEvents = useStore((s) => s.events);
  const session = useStore((s) => s.session);
  const users = useStore((s) => s.users);
  const pastEvents = useStore((s) => s.pastEvents);
  const applicants = useStore((s) => s.applicants);
  const updateApplicantStatus = useStore((s) => s.updateApplicantStatus);
  const cancelEvent = useStore((s) => s.cancelEvent);
  const pushToast = useStore((s) => s.pushToast);
  const dataReady = useStore((s) => s.dataReady);

  const updateStatus = useCallback(
    async (applicantId, status) => {
      const applicant = applicants.find((a) => a.id === applicantId);
      if (status === "rejected") {
        setConfirmAction({ type: "reject", applicantId, applicantName: applicant?.name || t("manage.fallbackSnacker") });
        return;
      }
      try {
        await updateApplicantStatus(applicantId, status);
        pushToast(
          status === "accepted"
            ? t("manage.updateAccepted", {
                name: applicant?.name || t("manage.fallbackSnacker"),
              })
            : t("manage.updateRejected", {
                name: applicant?.name || t("manage.fallbackSnacker"),
              }),
          status === "accepted" ? "success" : "info"
        );
      } catch (err) {
        pushToast(
          t("manage.updateFail", {
            error: getErrorMessage(err, t("common.unknownError")),
          }),
          "error"
        );
      }
    },
    [applicants, updateApplicantStatus, pushToast, t]
  );

  const handleCancelEvent = useCallback(
    (eventId) => {
      const event = allEvents.find((item) => item.id === eventId);
      setConfirmAction({ type: "cancel", eventId, eventTitle: event?.title || t("manage.eventFallback") });
    },
    [allEvents, t]
  );

  const runConfirmedAction = useCallback(async () => {
    if (!confirmAction) return;
    setConfirmBusy(true);
    try {
      if (confirmAction.type === "reject") {
        const applicant = applicants.find((a) => a.id === confirmAction.applicantId);
        await updateApplicantStatus(confirmAction.applicantId, "rejected");
        pushToast(
          t("manage.updateRejected", { name: applicant?.name || t("manage.fallbackSnacker") }),
          "info"
        );
      }
      if (confirmAction.type === "cancel") {
        await cancelEvent(confirmAction.eventId);
        pushToast(t("manage.cancelledToast"), "info");
      }
      setConfirmAction(null);
    } catch (err) {
      pushToast(
        confirmAction.type === "cancel"
          ? t("manage.cancelFail", { error: getErrorMessage(err, t("common.unknownError")) })
          : t("manage.updateFail", { error: getErrorMessage(err, t("common.unknownError")) }),
        "error"
      );
    } finally {
      setConfirmBusy(false);
    }
  }, [applicants, cancelEvent, confirmAction, pushToast, t, updateApplicantStatus]);

  const currentUser = useMemo(
    () => (session ? users.find((u) => u.authId === session.user.id) : null),
    [users, session]
  );

  const myEvents = useMemo(
    () => allEvents.filter((e) => e.hostId === currentUser?.id),
    [allEvents, currentUser]
  );
  const getApplicants = useMemo(
    () => (eventId) => applicants.filter((a) => a.eventId === eventId),
    [applicants]
  );

  const events = tab === "upcoming" ? myEvents : pastEvents;
  const mappableEvents = [...myEvents, ...pastEvents].filter((e) => e.lat != null);
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const userLocation = useStore((s) => s.userLocation);
  const locationStatus = useStore((s) => s.locationStatus);

  const carouselRef = useRef(null);
  const mobileCarouselRef = useRef(null);

  const handleMarkerClick = useCallback((eventId) => {
    setSelectedEventId((prev) => (prev === eventId ? null : eventId));
  }, []);

  const scrollCarousel = useCallback((direction) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("div")?.offsetWidth || 380;
    el.scrollBy({ left: direction * (cardWidth + 20), behavior: "smooth" });
  }, []);
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : mappableEvents.length
      ? [
          mappableEvents.reduce((a, e) => a + e.lat, 0) / mappableEvents.length,
          mappableEvents.reduce((a, e) => a + e.lng, 0) / mappableEvents.length,
        ]
      : [41.1579, -8.6291];

  /* Hold the cozy loader until we know the user's location (or it fails) */
  if (!dataReady) {
    return <ManageSkeleton />;
  }

  if (!userLocation && locationStatus === "pending") {
    return <LoadingScreen message={t("manage.loadingMessage")} />;
  }

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-0">
      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === "cancel" ? t("manage.cancelConfirmTitle") : t("manage.rejectConfirmTitle")}
        description={
          confirmAction?.type === "cancel"
            ? t("manage.cancelConfirmBody", { title: confirmAction?.eventTitle })
            : t("manage.rejectConfirmBody", { name: confirmAction?.applicantName })
        }
        confirmLabel={confirmAction?.type === "cancel" ? t("manage.cancelEvent") : t("manage.rejectApplicant")}
        cancelLabel={t("common.close")}
        tone="danger"
        busy={confirmBusy}
        onConfirm={runConfirmedAction}
        onCancel={() => (confirmBusy ? null : setConfirmAction(null))}
      />
      {/* ======= DESKTOP ======= */}
      <div className="hidden md:block relative w-full h-[calc(100vh-73px)] overflow-hidden">
        {/* Full-screen map background */}
        <div className="absolute inset-0 z-0">
          <MapContainer center={center} zoom={12} className="h-full w-full" zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <RecenterOnUser />
            {mappableEvents.map((e) => (
              <Marker
                key={e.id}
                position={[e.lat, e.lng]}
                icon={makeEventMarker(e.title, selectedEventId === e.id)}
                eventHandlers={{ click: () => handleMarkerClick(e.id) }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Title overlay */}
        <div className="relative z-10 pt-12 pb-6 px-12">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-on-surface leading-tight">
            {t("manage.title").split(" ").slice(0, 2).join(" ")}<br />{t("manage.title").split(" ").slice(2).join(" ")}
          </h1>
        </div>

        {/* Pill tabs */}
        <div className="relative z-10 flex gap-3 px-12 mb-6">
          <button
            onClick={() => { setTab("upcoming"); setSelectedEventId(null); }}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === "upcoming"
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container-lowest/80 backdrop-blur text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {t("manage.upcomingEvents")}
          </button>
          <button
            onClick={() => { setTab("past"); setSelectedEventId(null); }}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === "past"
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container-lowest/80 backdrop-blur text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {t("manage.pastEvents")}
          </button>
        </div>

        {/* Bottom carousel — all events for the current tab */}
        <section className="absolute bottom-0 left-0 right-0 z-10 pb-8 pt-16 px-12 bg-linear-to-t from-surface via-surface/85 to-transparent pointer-events-none">
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <div className="flex justify-between items-end mb-4 px-1">
              <div>
                <h2 className="text-xl font-headline font-bold text-primary tracking-tight">
                  {tab === "upcoming" ? t("manage.upcomingEvents") : t("manage.pastEvents")}
                </h2>
                <p className="text-on-surface-variant text-sm font-body italic">
                  {events.length} {events.length === 1 ? t("manage.eventLabel") : t("manage.eventsLabel")}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => scrollCarousel(-1)}
                  className="p-3 rounded-full bg-surface-container-high text-on-surface hover:bg-secondary-container transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollCarousel(1)}
                  className="p-3 rounded-full bg-surface-container-high text-on-surface hover:bg-secondary-container transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
            >
              {events.length === 0 && (
                <div className="w-full text-center py-8 bg-surface-container-lowest/80 backdrop-blur rounded-2xl">
                  <p className="text-on-surface-variant text-sm font-body">
                    {tab === "upcoming" ? t("manage.noUpcoming") : t("manage.noPast")}
                  </p>
                </div>
              )}
              {events.map((ev) => {
                const apps = getApplicants(ev.id);
                const pending = apps.filter((a) => a.status === "pending").length;
                const isActive = selectedEventId === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => handleMarkerClick(ev.id)}
                    className={`relative flex-none w-96 snap-start bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-cozy cursor-pointer transition-all hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] ${
                      isActive ? "ring-2 ring-primary scale-[1.02]" : ""
                    }`}
                  >
                    <div className="flex h-40">
                      <div className="w-2/5 h-full shrink-0">
                        <img
                          src={ev.image}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-3/5 p-4 flex flex-col justify-between min-w-0">
                        <div>
                          <span className="bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2 inline-block">
                            {ev.status === "cancelled" ? t("manage.cancelled") : ev.tag}
                          </span>
                          <h3 className="text-base font-extrabold text-on-surface leading-tight line-clamp-2">
                            {ev.title}
                          </h3>
                        </div>
                        <div className="space-y-1 text-[11px] text-on-surface-variant">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays size={12} className="text-primary" />
                            {new Date(ev.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            &bull; {ev.time}
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin size={12} className="text-primary shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users size={12} className="text-primary" />
                            {ev.currentSnackers}/{ev.maxSnackers}
                            {pending > 0 && (
                              <span className="ml-auto text-primary font-bold">
                                {pending} {t("manage.pending")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {tab === "upcoming" && (
                      <div className="border-t border-outline-variant px-4 py-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => navigate(`/create/${ev.id}`)}
                          className="flex items-center gap-1.5 rounded-full bg-primary-fixed text-on-surface px-3 py-1.5 text-[11px] font-bold hover:bg-secondary-container transition-colors"
                        >
                          <Pencil size={12} />
                          {t("manage.editEvent")}
                        </button>
                        {ev.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => handleCancelEvent(ev.id)}
                            className="flex items-center gap-1.5 rounded-full bg-error/10 text-error px-3 py-1.5 text-[11px] font-bold hover:bg-error hover:text-on-error transition-colors"
                          >
                            <Ban size={12} />
                            {t("manage.cancelEvent")}
                          </button>
                        )}
                      </div>
                    )}

                    {isActive && apps.length > 0 && (
                      <div className="border-t border-outline-variant px-4 py-3">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                          {apps.map((a) => (
                            <div
                              key={a.id}
                              className="shrink-0 flex items-center gap-2 bg-surface-container-high rounded-full px-2.5 py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img
                                src={a.avatar}
                                alt={a.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="text-[11px] font-bold text-on-surface whitespace-nowrap">
                                {a.name}
                              </span>
                              {a.status === "pending" && (
                                <div className="flex gap-1 ml-1">
                                  <button
                                    onClick={() => updateStatus(a.id, "accepted")}
                                    className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center"
                                  >
                                    <Check size={10} />
                                  </button>
                                  <button
                                    onClick={() => updateStatus(a.id, "rejected")}
                                    className="w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              )}
                              {a.status === "accepted" && (
                                <span className="text-[9px] font-bold text-primary">
                                  {t("common.accepted")}
                                </span>
                              )}
                              {a.status === "rejected" && (
                                <span className="text-[9px] font-bold text-error">
                                  {t("common.declined")}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ======= MOBILE ======= */}
      <div className="md:hidden flex flex-col h-[calc(100vh-64px)]">
        {/* Map section — takes remaining space */}
        <div className="flex-1 w-full relative">
          <MapContainer center={center} zoom={11} className="h-full w-full" zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <RecenterOnUser />
            {mappableEvents.map((e) => (
              <Marker
                key={e.id}
                position={[e.lat, e.lng]}
                icon={makeEventMarker(e.title, selectedEventId === e.id)}
                eventHandlers={{ click: () => handleMarkerClick(e.id) }}
              />
            ))}
          </MapContainer>

          {/* Title + tabs overlay */}
          <div className="absolute top-0 left-0 right-0 z-1000 px-5 pt-4">
            <h1 className="text-2xl font-extrabold text-on-surface mb-3">{t("manage.title")}</h1>
            <div className="flex gap-3">
              <button
                onClick={() => { setTab("upcoming"); setSelectedEventId(null); }}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                  tab === "upcoming"
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container-lowest/80 backdrop-blur text-on-surface-variant"
                }`}
              >
                {t("manage.upcoming")}
              </button>
              <button
                onClick={() => { setTab("past"); setSelectedEventId(null); }}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                  tab === "past"
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container-lowest/80 backdrop-blur text-on-surface-variant"
                }`}
              >
                {t("manage.past")}
              </button>
            </div>
          </div>

          {/* Bottom carousel — all events for the current tab */}
          <div
            ref={mobileCarouselRef}
            className="absolute bottom-0 left-0 right-0 z-1000 px-4 pb-4 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {events.length === 0 && (
              <div className="w-full text-center py-6 bg-surface-container-lowest/95 backdrop-blur rounded-2xl">
                <p className="text-on-surface-variant text-xs font-body">
                  {tab === "upcoming" ? t("manage.noUpcoming") : t("manage.noPast")}
                </p>
              </div>
            )}
            {events.map((ev) => {
              const apps = getApplicants(ev.id);
              const pending = apps.filter((a) => a.status === "pending").length;
              const isActive = selectedEventId === ev.id;
              const isExpanded = expandedId === ev.id;
              return (
                <div
                  key={ev.id}
                  onClick={() => handleMarkerClick(ev.id)}
                  className={`shrink-0 w-[85%] snap-center bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-cozy overflow-hidden relative cursor-pointer transition-all ${
                    isActive ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="flex h-28">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-24 h-full object-cover shrink-0"
                    />
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div className="min-w-0">
                        <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {ev.status === "cancelled" ? t("manage.cancelled") : ev.tag}
                        </span>
                        <h3 className="text-sm font-extrabold text-on-surface mt-1 leading-tight line-clamp-1">
                          {ev.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} className="text-primary" />
                          {new Date(ev.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} className="text-primary" />
                          {ev.currentSnackers}/{ev.maxSnackers}
                        </span>
                        {pending > 0 && (
                          <span className="ml-auto text-primary font-bold">{pending}!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {tab === "upcoming" && (
                    <div className="border-t border-outline-variant px-3 py-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => navigate(`/create/${ev.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary-fixed text-on-surface px-3 py-2 text-[11px] font-bold"
                      >
                        <Pencil size={12} />
                        {t("manage.editEvent")}
                      </button>
                      {ev.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => handleCancelEvent(ev.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-error/10 text-error px-3 py-2 text-[11px] font-bold"
                        >
                          <Ban size={12} />
                          {t("manage.cancelEvent")}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expandable applicants */}
                  {isActive && apps.length > 0 && (
                    <div className="border-t border-outline-variant" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-on-surface-variant"
                      >
                        <span>
                          {t("manage.pendingApplicants", { count: pending })}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto">
                          {apps.map((a) => (
                            <div
                              key={a.id}
                              className="flex items-center gap-3 bg-surface-container-high rounded-xl p-2.5"
                            >
                              <img
                                src={a.avatar}
                                alt={a.name}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-on-surface truncate">{a.name}</p>
                                <p className="text-[10px] text-on-surface-variant truncate">{a.message}</p>
                              </div>
                              {a.status === "pending" && (
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    onClick={() => updateStatus(a.id, "accepted")}
                                    className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button
                                    onClick={() => updateStatus(a.id, "rejected")}
                                    className="w-7 h-7 rounded-full bg-error text-on-error flex items-center justify-center"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              )}
                              {a.status !== "pending" && (
                                <span
                                  className={`text-[10px] font-bold shrink-0 ${
                                    a.status === "accepted" ? "text-primary" : "text-error"
                                  }`}
                                >
                                  {a.status === "accepted" ? t("common.accepted") : t("common.declined")}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

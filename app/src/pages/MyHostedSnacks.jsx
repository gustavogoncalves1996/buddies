import { useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { CalendarDays, MapPin, Users, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { useEffect } from "react";
import L from "leaflet";
import useStore from "../store/useStore";
import LoadingScreen from "../components/LoadingScreen";

const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;background:#37602c;border:3px solid #c0f0ad;border-radius:50%;box-shadow:0 2px 8px rgba(55,96,44,.35)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const activeMarkerIcon = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;background:#37602c;border:4px solid #c0f0ad;border-radius:50%;box-shadow:0 4px 16px rgba(55,96,44,.5)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

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
  const [tab, setTab] = useState("upcoming");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const allEvents = useStore((s) => s.events);
  const session = useStore((s) => s.session);
  const users = useStore((s) => s.users);
  const pastEvents = useStore((s) => s.pastEvents);
  const applicants = useStore((s) => s.applicants);
  const updateApplicantStatus = useStore((s) => s.updateApplicantStatus);
  const pushToast = useStore((s) => s.pushToast);

  const updateStatus = useCallback(
    async (applicantId, status) => {
      const applicant = applicants.find((a) => a.id === applicantId);
      try {
        await updateApplicantStatus(applicantId, status);
        pushToast(
          status === "accepted"
            ? `${applicant?.name || "Snacker"} is in! 🎉`
            : `${applicant?.name || "Snacker"}'s application was declined.`,
          status === "accepted" ? "success" : "info"
        );
      } catch (err) {
        pushToast(
          "Couldn't update application: " + (err.message || "unknown error"),
          "error"
        );
      }
    },
    [applicants, updateApplicantStatus, pushToast]
  );

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

  const handleMarkerClick = useCallback((eventId) => {
    setSelectedEventId((prev) => (prev === eventId ? null : eventId));
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
  if (!userLocation && locationStatus === "pending") {
    return <LoadingScreen message="Loading cozy times for you..." />;
  }

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-0">
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
                icon={selectedEventId === e.id ? activeMarkerIcon : markerIcon}
                eventHandlers={{ click: () => handleMarkerClick(e.id) }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Title overlay */}
        <div className="relative z-10 pt-12 pb-6 px-12">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-on-surface leading-tight">
            My Hosted<br />Snacks
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
            Upcoming Events
          </button>
          <button
            onClick={() => { setTab("past"); setSelectedEventId(null); }}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === "past"
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container-lowest/80 backdrop-blur text-on-surface hover:bg-surface-container-high"
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Selected event card — only visible when a marker is clicked */}
        {selectedEvent && (() => {
          const apps = getApplicants(selectedEvent.id);
          return (
            <div className="absolute bottom-0 left-0 right-0 z-10 px-12 pb-10">
              <div className="max-w-xl">
                <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col">
                  <div className="flex h-56">
                    <div className="w-2/5 h-full">
                      <img
                        src={selectedEvent.image}
                        alt={selectedEvent.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-3/5 p-6 flex flex-col justify-between">
                      <div>
                        <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">
                          {selectedEvent.tag}
                        </span>
                        <h3 className="text-lg font-extrabold text-on-surface leading-tight mb-3">
                          {selectedEvent.title}
                        </h3>
                      </div>
                      <div className="space-y-1.5 text-xs text-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-primary" />
                          {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          &bull; {selectedEvent.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-primary" />
                          {selectedEvent.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-primary" />
                          {selectedEvent.currentSnackers}/{selectedEvent.maxSnackers} spots &bull;{" "}
                          <span className="text-primary font-bold">{apps.filter((a) => a.status === "pending").length} pending</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Applicants row */}
                  {apps.length > 0 && (
                    <div className="border-t border-outline-variant px-6 py-4">
                      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                        {apps.map((a) => (
                          <div key={a.id} className="shrink-0 flex items-center gap-2 bg-surface-container-high rounded-full px-3 py-1.5">
                            <img src={a.avatar} alt={a.name} className="w-7 h-7 rounded-full object-cover" />
                            <span className="text-xs font-bold text-on-surface whitespace-nowrap">{a.name}</span>
                            {a.status === "pending" && (
                              <div className="flex gap-1 ml-1">
                                <button
                                  onClick={() => updateStatus(a.id, "accepted")}
                                  className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() => updateStatus(a.id, "rejected")}
                                  className="w-6 h-6 rounded-full bg-error text-on-error flex items-center justify-center"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                            {a.status === "accepted" && (
                              <span className="text-[10px] font-bold text-primary">Accepted</span>
                            )}
                            {a.status === "rejected" && (
                              <span className="text-[10px] font-bold text-error">Declined</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedEventId(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-high/80 backdrop-blur flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
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
                icon={selectedEventId === e.id ? activeMarkerIcon : markerIcon}
                eventHandlers={{ click: () => handleMarkerClick(e.id) }}
              />
            ))}
          </MapContainer>

          {/* Title + tabs overlay */}
          <div className="absolute top-0 left-0 right-0 z-1000 px-5 pt-4">
            <h1 className="text-2xl font-extrabold text-on-surface mb-3">My Hosted Snacks</h1>
            <div className="flex gap-3">
              <button
                onClick={() => { setTab("upcoming"); setSelectedEventId(null); }}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                  tab === "upcoming"
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container-lowest/80 backdrop-blur text-on-surface-variant"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => { setTab("past"); setSelectedEventId(null); }}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                  tab === "past"
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container-lowest/80 backdrop-blur text-on-surface-variant"
                }`}
              >
                Past
              </button>
            </div>
          </div>

          {/* Selected event card overlay at bottom */}
          {selectedEvent && (() => {
            const apps = getApplicants(selectedEvent.id);
            const isExpanded = expandedId === selectedEvent.id;
            return (
              <div className="absolute bottom-0 left-0 right-0 z-1000 px-4 pb-4">
                <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-cozy overflow-hidden relative">
                  <div className="flex h-32">
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-28 h-full object-cover"
                    />
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {selectedEvent.tag}
                        </span>
                        <h3 className="text-sm font-extrabold text-on-surface mt-1 leading-tight">
                          {selectedEvent.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} className="text-primary" />
                          {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-primary" />
                          {selectedEvent.currentSnackers}/{selectedEvent.maxSnackers}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable applicants */}
                  {apps.length > 0 && (
                    <div className="border-t border-outline-variant">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : selectedEvent.id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-on-surface-variant"
                      >
                        <span>
                          {apps.filter((a) => a.status === "pending").length} pending applicants
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          {apps.map((a) => (
                            <div
                              key={a.id}
                              className="flex items-center gap-3 bg-surface-container-high rounded-xl p-3"
                            >
                              <img
                                src={a.avatar}
                                alt={a.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-on-surface truncate">{a.name}</p>
                                <p className="text-xs text-on-surface-variant truncate">{a.message}</p>
                              </div>
                              {a.status === "pending" && (
                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={() => updateStatus(a.id, "accepted")}
                                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => updateStatus(a.id, "rejected")}
                                    className="w-8 h-8 rounded-full bg-error text-on-error flex items-center justify-center"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              )}
                              {a.status !== "pending" && (
                                <span
                                  className={`text-[10px] font-bold shrink-0 ${
                                    a.status === "accepted" ? "text-primary" : "text-error"
                                  }`}
                                >
                                  {a.status === "accepted" ? "Accepted" : "Declined"}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedEventId(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-container-high/80 backdrop-blur flex items-center justify-center text-on-surface-variant"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { CalendarDays, MapPin, Users, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import L from "leaflet";
import useStore from "../store/useStore";

const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;background:#37602c;border:3px solid #c0f0ad;border-radius:50%;box-shadow:0 2px 8px rgba(55,96,44,.35)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function MyHostedSnacks() {
  const [tab, setTab] = useState("upcoming");
  const [expandedId, setExpandedId] = useState(null);

  const allEvents = useStore((s) => s.events);
  const currentUserId = useStore((s) => s.currentUserId);
  const pastEvents = useStore((s) => s.pastEvents);
  const applicants = useStore((s) => s.applicants);
  const updateStatus = useStore((s) => s.updateApplicantStatus);

  const myEvents = useMemo(
    () => allEvents.filter((e) => e.hostId === currentUserId),
    [allEvents, currentUserId]
  );
  const getApplicants = useMemo(
    () => (eventId) => applicants.filter((a) => a.eventId === eventId),
    [applicants]
  );

  const events = tab === "upcoming" ? myEvents : pastEvents;
  const mappableEvents = [...myEvents, ...pastEvents].filter((e) => e.lat != null);
  const center = mappableEvents.length
    ? [
        mappableEvents.reduce((a, e) => a + e.lat, 0) / mappableEvents.length,
        mappableEvents.reduce((a, e) => a + e.lng, 0) / mappableEvents.length,
      ]
    : [40.73, -73.93];

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-0">
      {/* ======= DESKTOP ======= */}
      <div className="hidden md:block relative w-full h-[calc(100vh-73px)] overflow-hidden">
        {/* Full-screen map background */}
        <div className="absolute inset-0 z-0">
          <MapContainer center={center} zoom={12} className="h-full w-full" zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            {mappableEvents.map((e) => (
              <Marker key={e.id} position={[e.lat, e.lng]} icon={markerIcon} />
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
            onClick={() => setTab("upcoming")}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === "upcoming"
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container-lowest/80 backdrop-blur text-on-surface hover:bg-surface-container-high"
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setTab("past")}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === "past"
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container-lowest/80 backdrop-blur text-on-surface hover:bg-surface-container-high"
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Bottom carousel */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-12 pb-10">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {events.map((event) => {
              const apps = getApplicants(event.id);
              return (
                <div
                  key={event.id}
                  className="snap-start shrink-0 min-w-105 bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col"
                >
                  <div className="flex h-56">
                    <div className="w-2/5 h-full">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-3/5 p-6 flex flex-col justify-between">
                      <div>
                        <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">
                          {event.tag}
                        </span>
                        <h3 className="text-lg font-extrabold text-on-surface leading-tight mb-3">
                          {event.title}
                        </h3>
                      </div>
                      <div className="space-y-1.5 text-xs text-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-primary" />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          &bull; {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-primary" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-primary" />
                          {event.currentSnackers}/{event.maxSnackers} spots &bull;{" "}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======= MOBILE ======= */}
      <div className="md:hidden">
        {/* Map section */}
        <div className="h-44 w-full relative">
          <MapContainer center={center} zoom={11} className="h-full w-full" zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            {mappableEvents.map((e) => (
              <Marker key={e.id} position={[e.lat, e.lng]} icon={markerIcon} />
            ))}
          </MapContainer>
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-surface z-1000" />
        </div>

        <div className="px-5 -mt-8 relative z-10">
          <h1 className="text-2xl font-extrabold text-on-surface mb-4">My Hosted Snacks</h1>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setTab("upcoming")}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                tab === "upcoming"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-highest text-on-surface-variant"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTab("past")}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                tab === "past"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-highest text-on-surface-variant"
              }`}
            >
              Past
            </button>
          </div>

          {/* Event cards */}
          <div className="space-y-4">
            {events.map((event) => {
              const apps = getApplicants(event.id);
              const isExpanded = expandedId === event.id;
              return (
                <div
                  key={event.id}
                  className="bg-surface-container-lowest rounded-2xl shadow-cozy overflow-hidden"
                >
                  <div className="flex h-32">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-28 h-full object-cover"
                    />
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {event.tag}
                        </span>
                        <h3 className="text-sm font-extrabold text-on-surface mt-1 leading-tight">
                          {event.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} className="text-primary" />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-primary" />
                          {event.currentSnackers}/{event.maxSnackers}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable applicants */}
                  {apps.length > 0 && (
                    <div className="border-t border-outline-variant">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : event.id)}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

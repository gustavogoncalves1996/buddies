import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, Locate, ChevronLeft, ChevronRight, Car, Footprints } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";
import LoadingScreen from "../components/LoadingScreen";
import LocaleExampleCard from "../components/LocaleExampleCard";
import { HomeSkeleton } from "../components/PageSkeletons";
import "leaflet/dist/leaflet.css";

/* ── Travel helpers ── */
const AVG_DRIVE_KMH = 40;
const AVG_WALK_KMH = 5;
function formatMinutes(min) {
  if (min < 1) return "<1 min";
  if (min < 60) return Math.round(min) + " min";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}
function directionsUrl(from, toLat, toLng, mode) {
  const origin = from ? `${from.lat},${from.lng}` : "";
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${toLat},${toLng}&travelmode=${mode}`;
}

/* ── Haversine (duplicated for local filtering via useMemo) ── */
function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DEFAULT_CENTER = [41.1579, -8.6291]; // Porto fallback
const DISTANCE_OPTIONS = [5, 10, 25, 50];

/* Cannabis-leaf SVG used inside the map markers */
const CANNABIS_SVG =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="#37602c" xmlns="http://www.w3.org/2000/svg"><path d="M12 22c-.3-1.6-.6-3.1-.9-4.6-1.4.6-2.9.9-4.5.9 1-1.3 1.7-2.7 2.1-4.3-1.6.2-3.2 0-4.7-.6 1.4-1 2.5-2.2 3.3-3.6-1.5-.4-2.9-1.1-4.1-2.1 1.6-.2 3.2-.7 4.5-1.6C6.3 5 5.3 3.5 4.7 1.9c1.5.6 2.9 1.5 4.1 2.7.6-1.5 1.5-2.9 2.7-4 .3 1.6.3 3.3 0 4.9 1.2-1.2 2.6-2.1 4.1-2.7-.6 1.6-1.6 3.1-2.9 4.2 1.3.9 2.9 1.4 4.5 1.6-1.2 1-2.6 1.7-4.1 2.1.8 1.4 1.9 2.6 3.3 3.6-1.5.6-3.1.8-4.7.6.4 1.6 1.1 3 2.1 4.3-1.6 0-3.1-.3-4.5-.9-.3 1.5-.6 3-.9 4.6Z"/></svg>';

function createEventMarker(title) {
  const safe = String(title || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return L.divIcon({
    className: "cozy-event-pin",
    html:
      '<div style="display:flex;flex-direction:column;align-items:center;pointer-events:auto;">' +
        '<div style="position:relative;width:64px;height:64px;display:flex;align-items:center;justify-content:center;">' +
          '<div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle, rgba(79,121,66,0.55) 0%, rgba(79,121,66,0.18) 55%, transparent 75%);"></div>' +
          '<div style="position:relative;width:40px;height:40px;border-radius:50%;background:#ffffff;border:2px solid rgba(79,121,66,0.25);box-shadow:0 6px 18px rgba(55,96,44,0.25);display:flex;align-items:center;justify-content:center;">' +
            CANNABIS_SVG +
          '</div>' +
        '</div>' +
        '<div style="margin-top:-6px;background:#ffffff;padding:3px 10px;border-radius:9999px;box-shadow:0 4px 12px rgba(0,0,0,0.12);font-family:Plus Jakarta Sans, sans-serif;font-size:11px;font-weight:700;color:#1c1c17;white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;">' + safe + '</div>' +
      '</div>',
    iconSize: [160, 88],
    iconAnchor: [80, 80],
    popupAnchor: [0, -82],
  });
}

const userIcon = L.divIcon({
  className: "user-center-pin",
  html: '<div style="position:relative;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;width:56px;height:56px;border-radius:50%;background:rgba(79,121,66,0.15);animation:pulse 2s infinite;"></div><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#37602c,#4f7942);border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 16px rgba(55,96,44,0.3);color:#fff;">&#128100;</div></div>',
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

/** Automatically re-center map once user location is obtained */
function RecenterMap() {
  const map = useMap();
  const userLocation = useStore((s) => s.userLocation);
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14);
    }
  }, [userLocation, map]);
  return null;
}

function LocateButton() {
  const { t } = useTranslation();
  const map = useMap();
  const userLocation = useStore((s) => s.userLocation);
  const requestLocation = useStore((s) => s.requestLocation);
  return (
    <button
      onClick={async () => {
        let loc = userLocation;
        if (!loc) {
          loc = await requestLocation();
        }
        const target = loc ? [loc.lat, loc.lng] : DEFAULT_CENTER;
        map.flyTo(target, 15, { duration: 1.2 });
      }}
      className="absolute top-4 right-4 z-1000 w-11 h-11 bg-surface-container-lowest rounded-full shadow-cozy flex items-center justify-center hover:bg-surface-container-low transition-colors"
      title={t("home.myLocation")}
    >
      <Locate size={18} className="text-primary" />
    </button>
  );
}

function MapCreateOnDoubleClick() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pushToast = useStore((s) => s.pushToast);

  useMapEvents({
    dblclick: async (event) => {
      const lat = Number(event.latlng.lat.toFixed(6));
      const lng = Number(event.latlng.lng.toFixed(6));
      let label = t("createEvent.mapPinnedLocation");
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          { headers: { Accept: "application/json" } }
        );
        if (response.ok) {
          const data = await response.json();
          label = data.display_name || label;
        }
      } catch {
        label = `${label} (${lat}, ${lng})`;
      }
      pushToast(t("home.mapCreateHint"), "success");
      navigate(`/create?lat=${lat}&lng=${lng}&label=${encodeURIComponent(label)}`);
    },
  });

  return null;
}

function matchesDateFilter(event, filter) {
  if (!event.date) return true;
  const eventDate = new Date(`${event.date}T${event.time || "23:59"}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);

  if (filter === "today") {
    end.setDate(today.getDate() + 1);
    return eventDate >= today && eventDate < end;
  }
  if (filter === "weekend") {
    const day = eventDate.getDay();
    return eventDate >= today && (day === 0 || day === 6);
  }
  if (filter === "week") {
    end.setDate(today.getDate() + 7);
    return eventDate >= today && eventDate <= end;
  }
  return eventDate >= today;
}

export default function Home() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [distanceKm, setDistanceKm] = useState(10);
  const [dateFilter, setDateFilter] = useState("all");
  const events = useStore((s) => s.events);
  const users = useStore((s) => s.users);
  const searchQuery = useStore((s) => s.searchQuery);
  const userLocation = useStore((s) => s.userLocation);
  const locationStatus = useStore((s) => s.locationStatus);
  const requestLocation = useStore((s) => s.requestLocation);
  const pushToast = useStore((s) => s.pushToast);
  const dataReady = useStore((s) => s.dataReady);
  const carouselRef = useRef(null);

  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : DEFAULT_CENTER;

  /* On mount, ensure we ask for location and surface any failure */
  useEffect(() => {
    if (!userLocation && locationStatus === "pending") {
      requestLocation();
    }
    if (locationStatus === "denied") {
      pushToast(
        t("home.locationDenied"),
        "info",
        5000
      );
    } else if (locationStatus === "unavailable") {
      pushToast(t("home.geolocationUnsupported"), "info");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationStatus, t]);

  const effectiveSearch = (search || searchQuery || "").trim().toLowerCase();

  /* Filter events: future only, searchable, date-scoped and within selected radius. */
  const nearbyEvents = useMemo(() => {
    return events.filter((event) => {
      if (event.status === "cancelled") return false;
      if (!matchesDateFilter(event, dateFilter)) return false;

      if (effectiveSearch) {
        const haystack = [event.title, event.location, event.tag, event.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(effectiveSearch)) return false;
      }

      if (!userLocation) return true;
      if (event.lat == null || event.lng == null) return false;
      return haversineKm(userLocation.lat, userLocation.lng, event.lat, event.lng) <= distanceKm;
    });
  }, [dateFilter, distanceKm, effectiveSearch, events, userLocation]);

  const emptyMessage = effectiveSearch
    ? t("home.emptySearch")
    : t("home.emptyNearby", { radius: distanceKm });

  const scrollCarousel = useCallback((direction) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.offsetWidth || 400;
    el.scrollBy({ left: direction * (cardWidth + 24), behavior: "smooth" });
  }, []);

  /* Hold the cozy loader until we know the user's location (or it fails) */
  if (!dataReady) {
    return <HomeSkeleton />;
  }

  if (!userLocation && locationStatus === "pending") {
    return <LoadingScreen message={t("home.loadingMessage")} />;
  }

  return (
    <div className="relative h-[calc(100vh-64px)] md:h-[calc(100vh-73px)] w-full overflow-hidden">
      <MapContainer
        center={center}
        zoom={14}
        className="absolute inset-0 z-0 h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <Marker position={center} icon={userIcon} />
        {nearbyEvents.map((ev) => (
          <Marker
            key={ev.id}
            position={[ev.lat, ev.lng]}
            icon={createEventMarker(ev.title)}
          >
            <Popup className="cozy-popup">
              <div className="font-headline font-bold text-sm text-on-surface">{ev.title}</div>
              <p className="text-xs text-on-surface-variant mt-1">{ev.walkTime}</p>
            </Popup>
          </Marker>
        ))}
        <LocateButton />
        <RecenterMap />
        <MapCreateOnDoubleClick />
      </MapContainer>

      {/* Mobile search */}
      <div className="md:hidden absolute top-4 left-4 right-16 z-1000">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("nav.searchPlaceholder")}
            className="w-full bg-surface-container-lowest/90 backdrop-blur-xl border-none rounded-full py-3 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/60 shadow-cozy focus:outline-none focus:ring-2 focus:ring-primary-fixed"
          />
        </div>
      </div>

      <div className="absolute top-20 left-4 right-4 md:top-5 md:left-5 md:right-auto z-1000 flex flex-wrap items-center gap-2 max-w-[calc(100vw-2rem)] md:max-w-3xl">
        <select
          value={distanceKm}
          onChange={(e) => setDistanceKm(Number(e.target.value))}
          className="h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-xl px-4 text-xs font-bold text-on-surface shadow-cozy focus:outline-none focus:ring-2 focus:ring-primary-fixed"
          aria-label={t("home.distanceFilter")}
        >
          {DISTANCE_OPTIONS.map((distance) => (
            <option key={distance} value={distance}>{t("home.distanceKm", { distance })}</option>
          ))}
        </select>
        {[
          ["all", t("home.dateAll")],
          ["today", t("home.dateToday")],
          ["weekend", t("home.dateWeekend")],
          ["week", t("home.dateWeek")],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setDateFilter(value)}
            className={`h-10 rounded-full px-4 text-xs font-bold shadow-cozy transition-colors ${
              dateFilter === value
                ? "bg-primary text-on-primary"
                : "bg-surface-container-lowest/90 text-on-surface hover:bg-secondary-container"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bottom carousel */}
      <section className="absolute bottom-0 left-0 right-0 z-30 pb-20 md:pb-12 pt-20 px-4 md:px-12 bg-linear-to-t from-surface via-surface/90 to-transparent">
        <div className="max-w-7xl mx-auto">
          {/* <LocaleExampleCard /> */}

          <div className="flex justify-between items-end mb-4 md:mb-6 px-1 md:px-4">
            <div>
              <h2 className="text-lg md:text-3xl font-headline font-bold text-primary tracking-tight">
                {t("home.discoverTitle")}
              </h2>
              <p className="hidden md:block text-on-surface-variant font-body mt-1 italic">
                {t("home.discoverSubtitle", { radius: distanceKm })}
              </p>
            </div>
            <div className="hidden md:flex gap-3">
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
            className="flex gap-4 md:gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          >
            {nearbyEvents.length === 0 && (
              <div className="w-full text-center py-8">
                <p className="text-on-surface-variant text-sm font-body">
                  {emptyMessage}
                </p>
              </div>
            )}
            {nearbyEvents.map((ev) => {
              const host = users.find((u) => u.id === ev.hostId);
              const distanceKm =
                userLocation && ev.lat != null
                  ? haversineKm(userLocation.lat, userLocation.lng, ev.lat, ev.lng)
                  : null;
              const driveMin =
                distanceKm != null ? (distanceKm / AVG_DRIVE_KMH) * 60 : null;
              const walkMin =
                distanceKm != null ? (distanceKm / AVG_WALK_KMH) * 60 : null;
              const spotsLeft = Math.max(0, (ev.maxSnackers || 0) - (ev.currentSnackers || 0));
              const isFull = spotsLeft <= 0;
              return (
                <Link
                  key={ev.id}
                  to={"/event/" + ev.id}
                  className="flex-none w-80 md:w-110 snap-center bg-surface-container-lowest/95 md:bg-surface-container-lowest backdrop-blur-md md:backdrop-blur-none rounded-2xl md:rounded-lg overflow-hidden shadow-cozy group"
                >
                  <div className="flex h-40 md:h-56">
                    <div className="relative w-2/5 md:w-1/2 shrink-0 overflow-hidden bg-surface-container-high">
                      <img
                        src={ev.image}
                        alt={ev.title}
                        loading="lazy"
                        className="w-full h-full object-cover block"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {isFull && (
                          <span className="rounded-full bg-error text-on-error px-2.5 py-1 text-[10px] font-bold shadow-cozy">
                            {t("home.fullBadge")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-3/5 md:w-1/2 p-3 md:p-4 flex flex-col justify-between gap-2 min-w-0 overflow-hidden">
                      <div className="min-w-0">
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-primary">
                          {ev.tag}
                        </span>
                        <h3 className="font-headline text-sm md:text-lg font-bold text-on-surface leading-tight mt-0.5 line-clamp-1">
                          {ev.title}
                        </h3>
                        <p className="hidden md:block text-xs text-on-surface-variant mt-1 line-clamp-2 break-words">
                          {ev.description}
                        </p>
                        <p className="text-[10px] md:text-xs font-bold text-primary mt-2">
                          {t("home.spotsLeft", { count: spotsLeft })}
                        </p>
                      </div>

                      {/* Distance + directions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {host && (
                          <img
                            src={host.avatar}
                            alt={host.name}
                            className="w-6 h-6 rounded-full border-2 border-surface-container-lowest object-cover shrink-0"
                          />
                        )}
                        {distanceKm != null ? (
                          <div className="flex items-center gap-1.5 ml-auto">
                            <a
                              href={directionsUrl(userLocation, ev.lat, ev.lng, "driving")}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={t("home.driveThere")}
                              className="flex items-center gap-1 bg-secondary-container text-on-secondary-container rounded-full px-2.5 py-1 text-[10px] md:text-xs font-bold hover:scale-105 transition-transform"
                            >
                              <Car size={12} />
                              {formatMinutes(driveMin)}
                            </a>
                            <a
                              href={directionsUrl(userLocation, ev.lat, ev.lng, "walking")}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={t("home.walkThere")}
                              className="flex items-center gap-1 bg-primary-fixed text-on-surface rounded-full px-2.5 py-1 text-[10px] md:text-xs font-bold hover:scale-105 transition-transform"
                            >
                              <Footprints size={12} />
                              {formatMinutes(walkMin)}
                            </a>
                            <span className="text-[10px] md:text-xs font-semibold text-on-surface-variant">
                              {distanceKm.toFixed(1)} km
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] md:text-xs font-semibold text-on-surface-variant ml-auto">
                            {t("common.enableLocation")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

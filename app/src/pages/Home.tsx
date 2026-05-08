import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, Locate, ChevronLeft, ChevronRight, Car, Footprints } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";
import LoadingScreen from "../components/LoadingScreen";
import LocaleExampleCard from "../components/LocaleExampleCard";
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

const RADIUS_KM = 10;
const DEFAULT_CENTER = [41.1579, -8.6291]; // Porto fallback

function createPinIcon(emoji) {
  return L.divIcon({
    className: "custom-pin",
    html: '<div style="background:#f2ddbd;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(0,0,0,0.12);border:3px solid #fff;">' + emoji + '</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -42],
  });
}

const userIcon = L.divIcon({
  className: "user-center-pin",
  html: '<div style="position:relative;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;width:56px;height:56px;border-radius:50%;background:rgba(79,121,66,0.15);animation:pulse 2s infinite;"></div><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#37602c,#4f7942);border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 16px rgba(55,96,44,0.3);color:#fff;">&#128100;</div></div>',
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

const pinEmojis = ["🍪", "🍵", "☕", "🥐"];

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

export default function Home() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const events = useStore((s) => s.events);
  const users = useStore((s) => s.users);
  const userLocation = useStore((s) => s.userLocation);
  const locationStatus = useStore((s) => s.locationStatus);
  const requestLocation = useStore((s) => s.requestLocation);
  const pushToast = useStore((s) => s.pushToast);
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

  /* Filter events: future only, within 10 km of user (show all if location unknown) */
  const nearbyEvents = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const futureOnly = events.filter((e) => {
      if (!e.date) return true;
      // Combine date + time so events later today still show
      const when = new Date(`${e.date}T${e.time || "23:59"}`);
      return when.getTime() >= todayStart.getTime();
    });
    if (!userLocation) return futureOnly;
    return futureOnly.filter(
      (e) =>
        e.lat != null &&
        haversineKm(userLocation.lat, userLocation.lng, e.lat, e.lng) <= RADIUS_KM
    );
  }, [events, userLocation]);

  const scrollCarousel = useCallback((direction) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.offsetWidth || 400;
    el.scrollBy({ left: direction * (cardWidth + 24), behavior: "smooth" });
  }, []);

  /* Hold the cozy loader until we know the user's location (or it fails) */
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
        {nearbyEvents.map((ev, i) => (
          <Marker
            key={ev.id}
            position={[ev.lat, ev.lng]}
            icon={createPinIcon(pinEmojis[i % pinEmojis.length])}
          >
            <Popup className="cozy-popup">
              <div className="font-headline font-bold text-sm text-on-surface">{ev.title}</div>
              <p className="text-xs text-on-surface-variant mt-1">{ev.walkTime}</p>
            </Popup>
          </Marker>
        ))}
        <LocateButton />
        <RecenterMap />
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

      {/* Bottom carousel */}
      <section className="absolute bottom-0 left-0 right-0 z-30 pb-20 md:pb-12 pt-20 px-4 md:px-12 bg-linear-to-t from-surface via-surface/90 to-transparent">
        <div className="max-w-7xl mx-auto">
          <LocaleExampleCard />

          <div className="flex justify-between items-end mb-4 md:mb-6 px-1 md:px-4">
            <div>
              <h2 className="text-lg md:text-3xl font-headline font-bold text-primary tracking-tight">
                {t("home.discoverTitle")}
              </h2>
              <p className="hidden md:block text-on-surface-variant font-body mt-1 italic">
                {t("home.discoverSubtitle", { radius: RADIUS_KM })}
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
                  {t("home.emptyNearby", { radius: RADIUS_KM })}
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
              return (
                <Link
                  key={ev.id}
                  to={"/event/" + ev.id}
                  className="flex-none w-80 md:w-110 snap-center bg-surface-container-lowest/95 md:bg-surface-container-lowest backdrop-blur-md md:backdrop-blur-none rounded-2xl md:rounded-lg overflow-hidden shadow-cozy group"
                >
                  <div className="flex h-36 md:h-52">
                    <div className="w-2/5 md:w-1/2 shrink-0 overflow-hidden bg-surface-container-high">
                      <img
                        src={ev.image}
                        alt={ev.title}
                        loading="lazy"
                        className="w-full h-full object-cover block"
                      />
                    </div>
                    <div className="w-3/5 md:w-1/2 p-3 md:p-5 flex flex-col justify-between gap-2 min-w-0">
                      <div>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-primary">
                          {ev.tag}
                        </span>
                        <h3 className="font-headline text-sm md:text-lg font-bold text-on-surface leading-tight mt-0.5">
                          {ev.title}
                        </h3>
                        <p className="hidden md:block text-xs text-on-surface-variant mt-1 line-clamp-2">
                          {ev.description}
                        </p>
                      </div>

                      {/* Distance + directions */}
                      <div className="flex items-center gap-2">
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

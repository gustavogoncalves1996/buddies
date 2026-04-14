import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, Locate, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import useStore from "../store/useStore";
import "leaflet/dist/leaflet.css";

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

function LocateButton() {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView([48.8566, 2.3422], 14)}
      className="absolute top-4 right-4 z-1000 w-11 h-11 bg-surface-container-lowest rounded-full shadow-cozy flex items-center justify-center hover:bg-surface-container-low transition-colors"
    >
      <Locate size={18} className="text-primary" />
    </button>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const events = useStore((s) => s.events);
  const users = useStore((s) => s.users);
  const center = [48.8566, 2.3422];

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
        {events.map((ev, i) => (
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
      </MapContainer>

      {/* Mobile search */}
      <div className="md:hidden absolute top-4 left-4 right-16 z-1000">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cozy snack events..."
            className="w-full bg-surface-container-lowest/90 backdrop-blur-xl border-none rounded-full py-3 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/60 shadow-cozy focus:outline-none focus:ring-2 focus:ring-primary-fixed"
          />
        </div>
      </div>

      {/* Desktop floating controls */}
      <div className="hidden md:flex absolute top-8 right-8 z-20 flex-col gap-4">
        <button className="w-14 h-14 bg-surface-container-lowest rounded-full shadow-xl flex items-center justify-center hover:bg-surface-container-low transition-colors group">
          <Locate size={20} className="text-primary group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Bottom carousel */}
      <section className="absolute bottom-0 left-0 right-0 z-30 pb-20 md:pb-12 pt-20 px-4 md:px-12 bg-linear-to-t from-surface via-surface/90 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-4 md:mb-6 px-1 md:px-4">
            <div>
              <h2 className="text-lg md:text-3xl font-headline font-bold text-primary tracking-tight">
                Discover Nearby Experiences
              </h2>
              <p className="hidden md:block text-on-surface-variant font-body mt-1 italic">
                Curated artisan snack pop-ups within 2km
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <button className="p-3 rounded-full bg-surface-container-high text-on-surface hover:bg-secondary-container transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button className="p-3 rounded-full bg-surface-container-high text-on-surface hover:bg-secondary-container transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {events.map((ev) => {
              const host = users.find((u) => u.id === ev.hostId);
              return (
                <Link
                  key={ev.id}
                  to={"/event/" + ev.id}
                  className="flex-none w-[80%] md:w-auto md:min-w-100 snap-center bg-surface-container-lowest/95 md:bg-surface-container-lowest backdrop-blur-md md:backdrop-blur-none rounded-2xl md:rounded-lg overflow-hidden shadow-cozy group"
                >
                  <div className="flex h-32 md:h-48">
                    <div className="w-2/5 md:w-1/2">
                      <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="w-3/5 md:w-1/2 p-4 md:p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-primary">
                          {ev.tag}
                        </span>
                        <h3 className="font-headline text-sm md:text-xl font-bold text-on-surface leading-tight mt-0.5">
                          {ev.title}
                        </h3>
                        <p className="hidden md:block text-sm text-on-surface-variant mt-2 line-clamp-2">
                          {ev.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {host && (
                          <img
                            src={host.avatar}
                            alt={host.name}
                            className="w-6 h-6 md:hidden rounded-full border-2 border-surface-container-lowest object-cover"
                          />
                        )}
                        <span className="text-[11px] md:text-xs font-semibold text-on-surface-variant">
                          {ev.walkTime}
                        </span>
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

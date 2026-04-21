import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import useStore from "../store/useStore";

/**
 * Address autocomplete powered by Nominatim (OpenStreetMap).
 * No API key required. Suggestions are biased around the user's current
 * geolocation (if granted) but results are worldwide.
 *
 * Props:
 *  - value: current input text
 *  - onChange(text)
 *  - onSelect({ label, lat, lng })
 *  - placeholder
 *  - className (outer wrapper)
 *  - inputClassName
 *  - countryCodes (optional, e.g. "pt" — restricts search to a country)
 *  - minChars (default 2)
 */
export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search for a place...",
  className = "",
  inputClassName = "",
  countryCodes = "",
  minChars = 2,
}) {
  const userLocation = useStore((s) => s.userLocation);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Debounced search */
  useEffect(() => {
    if (!value || value.length < minChars) {
      setResults([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      try {
        const params = new URLSearchParams({
          format: "json",
          addressdetails: "1",
          limit: "8",
          q: value,
        });
        if (countryCodes) params.set("countrycodes", countryCodes);

        // Bias suggestions around the user's current location (~50km box)
        if (userLocation) {
          const d = 0.5; // ~55km
          const left = userLocation.lng - d;
          const right = userLocation.lng + d;
          const top = userLocation.lat + d;
          const bottom = userLocation.lat - d;
          params.set("viewbox", `${left},${top},${right},${bottom}`);
          params.set("bounded", "0"); // prefer-but-don't-restrict
        }

        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
        const res = await fetch(url, {
          signal: abortRef.current.signal,
          headers: { "Accept-Language": "pt-PT,pt,en" },
        });
        const data = await res.json();
        setResults(
          (data || []).map((r) => ({
            id: r.place_id,
            label: r.display_name,
            short:
              r.name ||
              r.display_name.split(",").slice(0, 2).join(", "),
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            type: r.type,
          }))
        );
        setOpen(true);
        setHighlight(-1);
      } catch (err) {
        if (err.name !== "AbortError") console.error("geocode", err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [value, countryCodes, minChars, userLocation]);

  const handlePick = (item) => {
    onChange(item.label);
    onSelect(item);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      handlePick(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.length >= minChars && results.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
      />
      <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-2 bg-surface-container-lowest rounded-2xl shadow-cozy overflow-hidden z-50 border border-outline-variant/30 max-h-72 overflow-y-auto">
          {results.map((r, i) => (
            <li
              key={r.id}
              onClick={() => handlePick(r)}
              onMouseEnter={() => setHighlight(i)}
              className={`px-4 py-3 cursor-pointer flex items-start gap-3 text-sm transition-colors ${
                highlight === i
                  ? "bg-primary-fixed/40"
                  : "hover:bg-surface-container-low"
              }`}
            >
              <MapPin size={14} className="text-primary mt-1 shrink-0" />
              <div className="min-w-0">
                <p className="text-on-surface font-bold leading-tight truncate">
                  {r.short}
                </p>
                <p className="text-[11px] text-on-surface-variant leading-snug line-clamp-1">
                  {r.label}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && value.length >= minChars && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-surface-container-lowest rounded-2xl shadow-cozy z-50 border border-outline-variant/30 px-4 py-3 text-xs text-on-surface-variant italic">
          Sem resultados para &quot;{value}&quot;
        </div>
      )}
    </div>
  );
}

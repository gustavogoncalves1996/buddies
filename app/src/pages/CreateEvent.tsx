import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  CalendarDays,
  Users,
  Leaf,
  Sparkles,
  ChevronLeft,
  Image as ImageIcon,
  Sun,
  Moon,
  Plus,
  Minus,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";
import AddressAutocomplete from "../components/AddressAutocomplete";
import ImageUpload from "../components/ImageUpload";
import { getErrorMessage } from "../utils/errors";
import sessionJointImg from "../assets/session-joint.png";

const DEFAULT_EVENT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCaZN-4WWPz68IO5galEggKHp4npqYWWQaCQuWND3wFUT5fh94ZDX7z3TkginTNzwxxOeXMuavXHhrAWM5VsQu6RJvMIdFr3WHY4voXMzPM6aV3BPE3iWs3O31YvpfD1qtZOaqPkULGeRZ4t9HIOA2YqiF7J1QhigpULIQwLPt1U_RaIv7PywUAyxgHNpPS68Ejqb4kdcPnI2xH7DKg-UeLeb0F9BjpwkVIGCsgJlCapg-vMNrAnHykfwCvPVBQg6Bo5J1gjoDnd-nQ";

/* ── Joint with smoke illustration (image asset) ── */
function SessionJointIllustration({ size = 180 }) {
  return (
    <img
      src={sessionJointImg}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className="object-contain select-none pointer-events-none transition-[width,height] duration-200"
      draggable={false}
      style={{ width: size, height: size }}
    />
  );
}

/* ── Centimeter slider for session intensity ── */
const INTENSITY_CM_MIN = 5;
const INTENSITY_CM_MAX = 50;

function IntensityCmSlider({ value, onChange, min = INTENSITY_CM_MIN, max = INTENSITY_CM_MAX }) {
  const pct = ((value - min) / (max - min)) * 100;
  const ticks = [min, Math.round((min + max) / 2), max];
  return (
    <div className="w-full select-none">
      <div className="relative h-10 w-full">
        {/* track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-outline-variant/40 rounded-full" />
        {/* filled */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
        {/* thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary shadow-md ring-4 ring-primary/15 pointer-events-none transition-[left] duration-150"
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Session intensity in centimeters"
        />
      </div>
      {/* tick labels */}
      <div className="relative h-5 w-full mt-1">
        {ticks.map((tick) => {
          const tickPct = ((tick - min) / (max - min)) * 100;
          return (
            <span
              key={tick}
              className="absolute top-0 -translate-x-1/2 text-[10px] font-bold tracking-wider text-on-surface-variant/60"
              style={{ left: `${tickPct}%` }}
            >
              {tick} cm
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function CreateEvent() {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      z.object({
        title: z.string().min(3, t("createEvent.schemaTitle")),
        description: z.string().optional(),
        location: z.string().min(3, t("createEvent.schemaLocation")),
        date: z.string().min(1, t("createEvent.schemaDate")),
        time: z.string().min(1, t("createEvent.schemaTime")),
      }),
    [t]
  );
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const addEvent = useStore((s) => s.addEvent);
  const updateEvent = useStore((s) => s.updateEvent);
  const uploadEventImage = useStore((s) => s.uploadEventImage);
  const setLoading = useStore((s) => s.setLoading);
  const pushToast = useStore((s) => s.pushToast);
  const session = useStore((s) => s.session);
  const users = useStore((s) => s.users);
  const events = useStore((s) => s.events);
  const currentUser = session
    ? users.find((u) => u.authId === session.user.id)
    : null;
  const [snackSize, setSnackSize] = useState(20); // session intensity, in cm
  const [maxSnackers, setMaxSnackers] = useState(8);
  const [geocoded, setGeocoded] = useState(null); // { label, lat, lng }
  const [imageFile, setImageFile] = useState(null);

  const editingEvent = useMemo(
    () => (eventId ? events.find((event) => event.id === Number(eventId)) : null),
    [eventId, events]
  );
  const isEditing = !!editingEvent;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const locationValue = watch("location") || "";
  const titleValue = watch("title") || "";
  const descriptionValue = watch("description") || "";
  const dateValue = watch("date") || "";
  const timeValue = watch("time") || "";

  // ---------- Defaults so form is pre-valid; user just adjusts ----------
  const todayISO = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!titleValue) setValue("title", t("createEvent.defaultTitle"), { shouldValidate: true });
    if (!dateValue) setValue("date", todayISO, { shouldValidate: true });
    if (!timeValue) setValue("time", "16:30", { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editingEvent) return;
    setValue("title", editingEvent.title || t("createEvent.defaultTitle"), { shouldValidate: true });
    setValue("description", editingEvent.description || "", { shouldValidate: false });
    setValue("location", editingEvent.location || "", { shouldValidate: true });
    setValue("date", editingEvent.date || todayISO, { shouldValidate: true });
    setValue("time", editingEvent.time || "16:30", { shouldValidate: true });
    setSnackSize(editingEvent.snackSize || 20);
    setMaxSnackers(editingEvent.maxSnackers || 8);
    if (editingEvent.lat != null && editingEvent.lng != null) {
      setGeocoded({
        label: editingEvent.location,
        short: editingEvent.location,
        lat: editingEvent.lat,
        lng: editingEvent.lng,
      });
    }
  }, [editingEvent, setValue, t, todayISO]);

  useEffect(() => {
    if (editingEvent) return;
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const label = searchParams.get("label") || t("createEvent.mapPinnedLocation");
    const item = { label, short: label, lat, lng };
    setGeocoded(item);
    setValue("location", label, { shouldValidate: true });
  }, [editingEvent, searchParams, setValue, t]);

  // ---------- Date wheel drag (angular) ----------
  const MAX_DAY_OFFSET = 180; // up to ~6 months ahead
  const [dayOffset, setDayOffset] = useState(0);
  const wheelRef = useRef(null);
  const wheelDragRef = useRef(null);

  // Keep dateValue in sync with dayOffset
  useEffect(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + dayOffset);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    setValue("date", iso, { shouldValidate: true });
  }, [dayOffset, setValue]);

  const angleFromCenter = (clientX, clientY) => {
    const el = wheelRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return (
      (Math.atan2(clientY - (r.top + r.height / 2), clientX - (r.left + r.width / 2)) *
        180) /
      Math.PI
    );
  };

  const onWheelPointerDown = (e) => {
    e.preventDefault();
    wheelRef.current?.setPointerCapture?.(e.pointerId);
    const a = angleFromCenter(e.clientX, e.clientY);
    wheelDragRef.current = {
      startOffset: dayOffset,
      lastAngle: a,
      accumulated: 0,
    };
  };
  const onWheelPointerMove = (e) => {
    const drag = wheelDragRef.current;
    if (!drag) return;
    const a = angleFromCenter(e.clientX, e.clientY);
    let delta = a - drag.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    drag.accumulated += delta;
    drag.lastAngle = a;
    // 12° per day → a full rotation = 30 days
    const dayDelta = Math.round(drag.accumulated / 12);
    const next = Math.max(0, Math.min(MAX_DAY_OFFSET, drag.startOffset + dayDelta));
    setDayOffset((prev) => (prev === next ? prev : next));
  };
  const onWheelPointerUp = (e) => {
    try {
      wheelRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    wheelDragRef.current = null;
  };

  // ---------- Time arc drag (horizontal) ----------
  const arcRef = useRef(null);
  const arcDragRef = useRef(false);

  const setTimeFromClientX = (clientX) => {
    const el = arcRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    // Snap to 5-minute increments
    const totalMinutes = Math.round((ratio * 24 * 60) / 5) * 5;
    const clamped = Math.min(24 * 60 - 5, totalMinutes);
    const h = Math.floor(clamped / 60);
    const m = clamped % 60;
    const s = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    setValue("time", s, { shouldValidate: true });
  };

  const onArcPointerDown = (e) => {
    e.preventDefault();
    arcRef.current?.setPointerCapture?.(e.pointerId);
    arcDragRef.current = true;
    setTimeFromClientX(e.clientX);
  };
  const onArcPointerMove = (e) => {
    if (!arcDragRef.current) return;
    setTimeFromClientX(e.clientX);
  };
  const onArcPointerUp = (e) => {
    try {
      arcRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    arcDragRef.current = false;
  };

  const onInvalid = (formErrors) => {
    console.warn("CreateEvent form invalid:", formErrors);
    const first =
      formErrors.title?.message ||
      formErrors.location?.message ||
      formErrors.date?.message ||
      formErrors.time?.message ||
      formErrors.description?.message ||
      Object.values(formErrors)[0]?.message ||
      t("createEvent.invalidForm");
    pushToast(first, "error");
  };

  /* Pretty bits used by the Date Wheel & Sun-arc visuals */
  const dateMeta = useMemo(() => {
    if (!dateValue) {
      const t = new Date();
      return {
        month: t.toLocaleString("en", { month: "long" }).toUpperCase(),
        day: t.getDate(),
        weekday: t.toLocaleString("en", { weekday: "long" }),
        nearby: [-2, -1, 0, 1, 2, 3].map((o) => {
          const d = new Date(t);
          d.setDate(t.getDate() + o);
          return { day: d.getDate(), active: o === 0 };
        }),
        progressDeg: 0,
        placeholder: true,
      };
    }
    const d = new Date(dateValue + "T00:00:00");
    const day = d.getDate();
    return {
      month: d.toLocaleString("en", { month: "long" }).toUpperCase(),
      day,
      weekday: d.toLocaleString("en", { weekday: "long" }),
      nearby: [-2, -1, 0, 1, 2, 3].map((o) => {
        const c = new Date(d);
        c.setDate(day + o);
        return { day: c.getDate(), active: o === 0 };
      }),
      progressDeg: ((day - 1) / 30) * 360,
      placeholder: false,
    };
  }, [dateValue]);

  const timeMeta = useMemo(() => {
    const [hStr, mStr] = (timeValue || "16:30").split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    const minutes = h * 60 + (Number.isFinite(m) ? m : 0);
    const ratio = Math.min(1, Math.max(0, minutes / (24 * 60))); // 0..1
    const isNight = h < 6 || h >= 19;
    let label = t("createEvent.labelDaydream");
    if (h < 6) label = t("createEvent.labelMoonlit");
    else if (h < 11) label = t("createEvent.labelSunriseSnack");
    else if (h < 14) label = t("createEvent.labelLunchBites");
    else if (h < 17) label = t("createEvent.labelHighTea");
    else if (h < 20) label = t("createEvent.labelSunsetSpread");
    else label = t("createEvent.labelMoonlit");
    return {
      label,
      isNight,
      ratio,
      display: timeValue || "16:30",
      placeholder: !timeValue,
    };
  }, [timeValue, t]);

  // Register location manually so the autocomplete drives it via setValue
  useEffect(() => {
    register("location");
    register("title");
    register("description");
  }, [register]);

  const intensityMeta = useMemo(() => {
    let label;
    if (snackSize <= 18) label = t("createEvent.snackSizeMildBlend");
    else if (snackSize <= 35) label = t("createEvent.snackSizeBalanced");
    else label = t("createEvent.snackSizeDeepBlend");
    return { label, cm: snackSize };
  }, [snackSize, t]);

  const onSubmit = async (data) => {
    console.log("CreateEvent onSubmit fired", { data, currentUser, geocoded, snackSize, maxSnackers });
    if (!currentUser) {
      pushToast(t("createEvent.loginRequired"), "error");
      return;
    }
    if (!geocoded) {
      pushToast(t("createEvent.pickFromDropdown"), "error");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = editingEvent?.image || DEFAULT_EVENT_IMAGE;
      if (imageFile) {
        try {
          imageUrl = await uploadEventImage(imageFile);
        } catch (err) {
          setLoading(false);
          pushToast(t("createEvent.uploadFail", { error: getErrorMessage(err, t("common.unknownError")) }), "error");
          return;
        }
      }

      const payload = {
        ...data,
        snackSize,
        maxSnackers,
        hostId: currentUser.id,
        currentSnackers: editingEvent?.currentSnackers ?? 0,
        lat: geocoded.lat,
        lng: geocoded.lng,
        image: imageUrl,
        status: editingEvent?.status || "planning",
        tag: editingEvent?.tag || "New",
        walkTime: t("createEvent.defaultWalkTime"),
        title: data.title || t("createEvent.defaultTitle"),
        description:
          data.description || t("createEvent.defaultDescription", { location: data.location }),
      };

      if (isEditing) await updateEvent(editingEvent.id, payload);
      else await addEvent(payload);

      pushToast(isEditing ? t("createEvent.updated") : t("createEvent.created"), "success");
      navigate("/manage");
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      setLoading(false);
      pushToast(t(isEditing ? "createEvent.updateFail" : "createEvent.createFail", { error: getErrorMessage(err, t("common.unknownError")) }), "error");
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-12">
      {/* ─────────────────────── MOBILE ─────────────────────── */}
      <div className="md:hidden">
        <header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-xl px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-dim transition-colors"
          >
            <ChevronLeft size={20} className="text-on-surface" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-on-surface">
            {t("createEvent.mobileTitle")}
          </h1>
        </header>

        <main className="px-6 pt-4">
          <p className="text-on-surface-variant text-sm mb-8">
            {t("createEvent.mobileSubtitle")}
          </p>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-10">
            <section className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-4">
                  {t("createEvent.titleLabel")}
                </label>
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setValue("title", e.target.value, { shouldValidate: true })}
                  placeholder={t("createEvent.titlePlaceholder")}
                  className="w-full bg-surface-container-highest border-none rounded-full px-5 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-fixed"
                />
                {errors.title && <p className="text-error text-xs ml-4 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-4">
                  {t("createEvent.descriptionLabel")}
                </label>
                <textarea
                  value={descriptionValue}
                  onChange={(e) => setValue("description", e.target.value, { shouldValidate: false })}
                  placeholder={t("createEvent.descriptionPlaceholder")}
                  rows={3}
                  className="w-full bg-surface-container-highest border-none rounded-2xl px-5 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-fixed resize-none"
                />
              </div>
            </section>

            {/* Location */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <MapPin size={18} className="text-primary" />
                <h2 className="text-base font-bold tracking-tight">{t("createEvent.gatheringSpot")}</h2>
              </div>
              <AddressAutocomplete
                value={locationValue}
                onChange={(v) => {
                  setValue("location", v, { shouldValidate: true });
                  if (!v) setGeocoded(null);
                }}
                onSelect={(item) => {
                  setValue("location", item.label, { shouldValidate: true });
                  setGeocoded(item);
                }}
                placeholder={t("createEvent.locationPlaceholder")}
                inputClassName="w-full bg-surface-container-highest border-none rounded-full px-5 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-fixed transition-all pr-12"
              />
              {geocoded && (
                <p className="ml-4 text-xs text-primary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  {t("createEvent.pinnedCoords", {
                    lat: geocoded.lat.toFixed(4),
                    lng: geocoded.lng.toFixed(4),
                  })}
                </p>
              )}
              {errors.location && (
                <p className="text-error text-xs ml-4">{errors.location.message}</p>
              )}
            </section>

            {/* Cover Image */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <ImageIcon size={18} className="text-primary" />
                <h2 className="text-base font-bold tracking-tight">{t("createEvent.coverImage")}</h2>
                <span className="text-xs text-on-surface-variant font-medium">· {t("common.optional")}</span>
              </div>
              <ImageUpload value={imageFile || editingEvent?.image} onChange={setImageFile} />
            </section>

            {/* Date & Time */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <CalendarDays size={18} className="text-primary" />
                <h2 className="text-base font-bold tracking-tight">{t("createEvent.dateTimeTitle")}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-4">{t("createEvent.dateLabel")}</label>
                  <input
                    type="date"
                    {...register("date")}
                    className="w-full bg-surface-container-highest border-none rounded-full px-5 py-3.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed"
                  />
                  {errors.date && <p className="text-error text-xs ml-4 mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-4">{t("createEvent.timeLabel")}</label>
                  <input
                    type="time"
                    {...register("time")}
                    className="w-full bg-surface-container-highest border-none rounded-full px-5 py-3.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed"
                  />
                  {errors.time && <p className="text-error text-xs ml-4 mt-1">{errors.time.message}</p>}
                </div>
              </div>
            </section>

            {/* Max Snackers */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Users size={18} className="text-primary" />
                <h2 className="text-base font-bold tracking-tight">{t("createEvent.maxSnackers")}</h2>
              </div>
              <div className="flex items-center justify-between bg-surface-container-highest rounded-full p-2">
                <button
                  type="button"
                  onClick={() => setMaxSnackers((v) => Math.max(1, v - 1))}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-surface text-primary shadow-sm text-xl font-bold"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-on-surface px-6 tabular-nums">{maxSnackers}</span>
                <button
                  type="button"
                  onClick={() => setMaxSnackers((v) => v + 1)}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-primary text-on-primary shadow-md text-xl font-bold"
                >
                  +
                </button>
              </div>
            </section>

            {/* Session Intensity */}
            <section className="space-y-4 bg-surface-container-low rounded-3xl p-5">
              <div className="flex items-center gap-2.5">
                <Leaf size={18} className="text-primary" />
                <h2 className="text-base font-bold tracking-tight">{t("createEvent.snackSize")}</h2>
              </div>
              <div className="flex flex-col items-center justify-center pt-2">
                <SessionJointIllustration
                  size={70 + ((snackSize - INTENSITY_CM_MIN) / (INTENSITY_CM_MAX - INTENSITY_CM_MIN)) * 140}
                />
                <p className="mt-2 text-2xl font-extrabold text-primary tabular-nums">
                  {intensityMeta.cm} cm
                </p>
                <p className="text-sm font-semibold text-on-surface-variant">
                  {intensityMeta.label}
                </p>
              </div>
              <div className="px-2 pt-1">
                <IntensityCmSlider value={snackSize} onChange={setSnackSize} />
              </div>
            </section>

            <div className="pt-4 flex flex-col items-center">
              <button
                type="submit"
                className="w-full py-4 bg-linear-to-br from-primary to-primary-container text-on-primary text-lg font-bold rounded-full shadow-[0_12px_40px_rgba(55,96,44,0.2)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>{t("createEvent.publishEvent")}</span>
                <Sparkles size={20} />
              </button>
              <p className="mt-4 text-sm text-on-surface-variant font-medium italic">
                {t("createEvent.mobileFooter")}
              </p>
            </div>
          </form>
        </main>
      </div>

      {/* ─────────────────────── DESKTOP ─────────────────────── */}
      <main className="hidden md:flex max-w-7xl mx-auto px-6 py-12 md:py-20 flex-col items-center">
        <header className="text-center mb-24 max-w-2xl">
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter text-primary mb-6">
            {t("createEvent.desktopTitle")}
          </h1>
          <p className="text-on-surface-variant text-lg font-light leading-relaxed">
            {t("createEvent.desktopSubtitle")}
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="w-full grid grid-cols-1 lg:grid-cols-12 gap-20"
        >
          {/* ── Left column: scheduling visuals ── */}
          <div className="lg:col-span-7 flex flex-col gap-24">
            {/* 01. Date Wheel */}
            <section className="relative">
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-display text-2xl font-bold text-primary">01.</span>
                <h2 className="font-display text-3xl font-semibold">{t("createEvent.dateWheel")}</h2>
              </div>

              <div
                ref={wheelRef}
                onPointerDown={onWheelPointerDown}
                onPointerMove={onWheelPointerMove}
                onPointerUp={onWheelPointerUp}
                onPointerCancel={onWheelPointerUp}
                role="slider"
                aria-label={t("createEvent.pickDateByDragging")}
                aria-valuemin={0}
                aria-valuemax={MAX_DAY_OFFSET}
                aria-valuenow={dayOffset}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                    e.preventDefault();
                    setDayOffset((v) => Math.min(MAX_DAY_OFFSET, v + 1));
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                    e.preventDefault();
                    setDayOffset((v) => Math.max(0, v - 1));
                  }
                }}
                className="relative w-full aspect-square max-w-md mx-auto md:mx-0 block cursor-grab active:cursor-grabbing select-none touch-none group"
              >
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-32 border-surface-container-high opacity-50" />
                {/* Progress arc — uses conic-gradient driven by the chosen day */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-500"
                  style={{
                    background: `conic-gradient(var(--color-primary-fixed) ${dateMeta.progressDeg}deg, transparent ${dateMeta.progressDeg}deg)`,
                    WebkitMask:
                      "radial-gradient(circle, transparent calc(50% - 32px), #000 calc(50% - 32px))",
                    mask: "radial-gradient(circle, transparent calc(50% - 32px), #000 calc(50% - 32px))",
                  }}
                />

                {/* Centre stack */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-on-surface-variant font-display text-sm tracking-widest uppercase">
                    {dateMeta.month}
                  </span>
                  <span
                    className={`text-8xl font-display font-extrabold -mt-2 ${
                      dateMeta.placeholder ? "text-on-surface-variant/40" : "text-primary"
                    }`}
                  >
                    {dateMeta.day}
                  </span>
                  <span className="text-on-surface-variant font-medium">
                    {dateMeta.placeholder ? t("createEvent.dragToChoose") : dateMeta.weekday}
                  </span>
                </div>

                {/* Surrounding day numbers */}
                <div className="absolute inset-0 p-4 pointer-events-none">
                  <div className="w-full h-full relative">
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-primary">
                      {dateMeta.nearby[2].day}
                    </span>
                    <span className="absolute top-1/4 right-4 opacity-30">
                      {dateMeta.nearby[3].day}
                    </span>
                    <span className="absolute bottom-1/4 right-4 opacity-30">
                      {dateMeta.nearby[4].day}
                    </span>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-30">
                      {dateMeta.nearby[5].day}
                    </span>
                    <span className="absolute bottom-1/4 left-4 opacity-30">
                      {dateMeta.nearby[1].day}
                    </span>
                    <span className="absolute top-1/4 left-4 opacity-30">
                      {dateMeta.nearby[0].day}
                    </span>
                  </div>
                </div>
              </div>
              {errors.date && (
                <p className="text-error text-xs mt-3 text-center">{errors.date.message}</p>
              )}
            </section>

            {/* 02. Light & Shadows (time) */}
            <section>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-display text-2xl font-bold text-primary">02.</span>
                <h2 className="font-display text-3xl font-semibold">{t("createEvent.lightAndShadows")}</h2>
              </div>

              <div className="relative group">
                <div
                  className="absolute inset-0 bg-surface-container-high group-hover:bg-primary-fixed/20 transition-all duration-500 -rotate-1"
                  style={{ borderRadius: "58% 42% 33% 67% / 50% 60% 40% 50%" }}
                />
                <div
                  ref={arcRef}
                  onPointerDown={onArcPointerDown}
                  onPointerMove={onArcPointerMove}
                  onPointerUp={onArcPointerUp}
                  onPointerCancel={onArcPointerUp}
                  role="slider"
                  aria-label={t("createEvent.chooseTimeByDragging")}
                  aria-valuemin={0}
                  aria-valuemax={1435}
                  aria-valuenow={Math.round(timeMeta.ratio * 1435)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    const [hStr, mStr] = (timeValue || "16:30").split(":");
                    let total = Number(hStr) * 60 + Number(mStr);
                    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                      e.preventDefault();
                      total = Math.min(24 * 60 - 5, total + 5);
                    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                      e.preventDefault();
                      total = Math.max(0, total - 5);
                    } else {
                      return;
                    }
                    const h = Math.floor(total / 60);
                    const m = total % 60;
                    setValue(
                      "time",
                      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
                      { shouldValidate: true }
                    );
                  }}
                  className="relative pt-20 pb-12 px-8 cursor-grab active:cursor-grabbing select-none touch-none"
                >
                  <div className="w-full h-40 border-t-2 border-dashed border-primary-fixed/40 rounded-[100%] flex items-center justify-center relative">
                    {/* Selected time marker — slides along the arc with the chosen time */}
                    <div
                      className="absolute -top-10 flex flex-col items-center transition-[left] duration-500"
                      style={{
                        left: `calc(${timeMeta.ratio * 100}% - 32px)`,
                      }}
                    >
                      <div className="w-16 h-16 bg-linear-to-tr from-primary to-primary-container rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/20">
                        {timeMeta.isNight ? <Moon size={28} fill="currentColor" /> : <Sun size={28} fill="currentColor" />}
                      </div>
                      <span className="mt-4 font-display text-3xl font-bold text-primary tabular-nums">
                        {timeMeta.display}
                      </span>
                      <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant whitespace-nowrap">
                        {timeMeta.label}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-4 flex flex-col items-center">
                      <Sun size={20} className="text-outline-variant" />
                      <span className="text-[10px] mt-2 font-bold opacity-40">{t("createEvent.sunrise")}</span>
                    </div>
                    <div className="absolute bottom-0 right-4 flex flex-col items-center">
                      <Moon size={20} className="text-outline-variant" />
                      <span className="text-[10px] mt-2 font-bold opacity-40">{t("createEvent.moonrise")}</span>
                    </div>
                  </div>
                </div>
              </div>
              {errors.time && (
                <p className="text-error text-xs mt-3 text-center">{errors.time.message}</p>
              )}
            </section>
          </div>

          {/* ── Right column: organic inputs + serving size + CTA ── */}
          <div className="lg:col-span-5 flex flex-col gap-12">
            <section className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
                  {t("createEvent.titleLabel")}
                </label>
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setValue("title", e.target.value, { shouldValidate: true })}
                  placeholder={t("createEvent.titlePlaceholder")}
                  className="w-full bg-surface-container-highest rounded-full px-6 py-4 text-xl font-headline font-bold text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed"
                />
                {errors.title && <p className="text-error text-xs mt-2 ml-4">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
                  {t("createEvent.descriptionLabel")}
                </label>
                <textarea
                  value={descriptionValue}
                  onChange={(e) => setValue("description", e.target.value, { shouldValidate: false })}
                  placeholder={t("createEvent.descriptionPlaceholder")}
                  rows={3}
                  className="w-full bg-surface-container-highest rounded-3xl px-6 py-4 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed resize-none"
                />
              </div>
            </section>

            {/* Location organic shape */}
            <section className="flex flex-col gap-8">
              <div className="relative group">
                <div
                  className="absolute inset-0 bg-surface-container-high group-hover:bg-primary-fixed/20 transition-all duration-500 -rotate-2"
                  style={{ borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%" }}
                />
                <div className="relative p-12">
                  <label className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
                    {t("createEvent.locationSanctuary")}
                  </label>
                  <AddressAutocomplete
                    value={locationValue}
                    onChange={(v) => {
                      setValue("location", v, { shouldValidate: true });
                      if (!v) setGeocoded(null);
                    }}
                    onSelect={(item) => {
                      setValue("location", item.label, { shouldValidate: true });
                      setGeocoded(item);
                    }}
                    placeholder={t("createEvent.whereGather")}
                    inputClassName="w-full bg-transparent border-none text-2xl font-headline font-bold focus:outline-none focus:ring-0 placeholder:text-outline-variant text-on-surface"
                  />
                  <div className="flex items-center gap-2 mt-4 text-primary">
                    <MapPin size={14} />
                    <span className="text-sm font-medium">
                      {geocoded
                        ? `Pinned · ${geocoded.lat.toFixed(4)}, ${geocoded.lng.toFixed(4)}`
                        : t("createEvent.autoDetecting")}
                    </span>
                  </div>
                  {errors.location && (
                    <p className="text-error text-xs mt-2">{errors.location.message}</p>
                  )}
                </div>
              </div>

              {/* Max Snackers organic shape */}
              <div className="relative group">
                <div
                  className="absolute inset-0 bg-surface-container-highest group-hover:bg-primary-fixed/20 transition-all duration-500 rotate-3"
                  style={{ borderRadius: "61% 39% 36% 64% / 54% 30% 70% 46%" }}
                />
                <div className="relative p-12 flex justify-between items-center">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
                      {t("createEvent.maxSnackers")}
                    </label>
                    <div className="flex items-baseline gap-4">
                      <span className="text-6xl font-display font-extrabold text-primary tabular-nums">
                        {String(maxSnackers).padStart(2, "0")}
                      </span>
                      <span className="text-on-surface-variant font-medium">{t("createEvent.guests")}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setMaxSnackers((v) => v + 1)}
                      className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                      aria-label={t("createEvent.increaseSnackers")}
                    >
                      <Plus size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaxSnackers((v) => Math.max(1, v - 1))}
                      className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                      aria-label={t("createEvent.decreaseSnackers")}
                    >
                      <Minus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 03. Session Intensity */}
            <section>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-display text-2xl font-bold text-primary">03.</span>
                <h2 className="font-display text-3xl font-semibold flex items-center gap-3">
                  <Leaf size={22} className="text-primary" />
                  {t("createEvent.snackSize")}
                </h2>
              </div>
              <div className="relative group">
                <div
                  className="absolute inset-0 bg-surface-container-high group-hover:bg-primary-fixed/20 transition-all duration-500 rotate-2"
                  style={{ borderRadius: "45% 55% 62% 38% / 58% 42% 58% 42%" }}
                />
                <div className="relative p-10">
                  <div className="flex flex-col items-center justify-center pt-2">
                    <SessionJointIllustration
                      size={110 + ((snackSize - INTENSITY_CM_MIN) / (INTENSITY_CM_MAX - INTENSITY_CM_MIN)) * 200}
                    />
                    <p className="mt-2 text-base font-semibold text-on-surface-variant">
                      {intensityMeta.label}
                    </p>
                  </div>
                  <div className="w-3/4 mx-auto mt-6">
                    <IntensityCmSlider value={snackSize} onChange={setSnackSize} />
                  </div>
                </div>
              </div>
            </section>

            {/* Cover Image — compact card to keep the column rhythm */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <ImageIcon size={18} className="text-primary" />
                <h2 className="font-display text-lg font-semibold">{t("createEvent.coverImage")}</h2>
                <span className="text-xs text-on-surface-variant font-medium">· {t("common.optional")}</span>
              </div>
              <ImageUpload value={imageFile || editingEvent?.image} onChange={setImageFile} />
            </section>

            {/* CTA */}
            <button
              type="submit"
              className="group relative py-6 px-12 rounded-full overflow-hidden transition-all transform active:scale-95 shadow-xl shadow-primary/20"
            >
              <div className="absolute inset-0 bg-linear-to-r from-primary to-primary-container transition-transform group-hover:scale-105" />
              <div className="relative flex items-center justify-center gap-4 text-white">
                <span className="font-display text-xl font-bold">{t("createEvent.publishGathering")}</span>
                <Sparkles size={20} />
              </div>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

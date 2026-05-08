import { create } from "zustand";
import { supabase } from "../utils/supabase";

/* ── Haversine distance in km ── */
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

/* ── Map snake_case rows to camelCase used throughout the UI ── */
const mapEvent = (e) => ({
  id: e.id,
  title: e.title,
  description: e.description,
  hostId: e.host_id,
  date: e.date,
  time: e.time,
  location: e.location,
  lat: e.lat,
  lng: e.lng,
  maxSnackers: e.max_snackers,
  currentSnackers: e.current_snackers,
  snackSize: e.snack_size,
  image: e.image,
  status: e.status,
  tag: e.tag,
  walkTime: e.walk_time,
});

const mapProfile = (p) => ({
  id: p.id,
  authId: p.auth_id,
  name: p.name,
  avatar: p.avatar,
  bio: p.bio,
  favoriteSnack: p.favorite_snack,
  hobbies: p.hobbies || [],
  rating: Number(p.rating ?? 5),
  eventsHosted: p.events_hosted ?? 0,
  eventsAttended: p.events_attended ?? 0,
  badge: p.badge,
});

const mapApplicant = (a) => ({
  id: a.id,
  eventId: a.event_id,
  userId: a.user_id,
  name: a.name,
  avatar: a.avatar,
  message: a.message,
  status: a.status,
});

const mapPastEvent = (p) => ({
  id: p.id,
  userId: p.user_id,
  title: p.title,
  location: p.location,
  date: p.date,
  image: p.image,
  tag: p.tag,
});

/* ── Zustand Store ── */
const useStore = create<any>((set, get) => ({
  /* ── Auth ── */
  session: null,
  authReady: false,

  /* ── Data ── */
  users: [],
  events: [],
  pastEvents: [],
  applicants: [],

  /* ── UI ── */
  searchQuery: "",
  userLocation: null,          // { lat, lng } or null
  locationStatus: "pending",
  isLoading: false,
  toasts: [],                  // [{ id, message, type, duration }]

  /* ─────────────────── DERIVED ─────────────────── */
  getCurrentUser: () => {
    const { users, session } = get();
    if (!session) return null;
    return users.find((u) => u.authId === session.user.id) || null;
  },
  getHost: (hostId) => get().users.find((u) => u.id === hostId),
  getEvent: (id) => get().events.find((e) => e.id === Number(id)),
  getMyEvents: () => {
    const { events } = get();
    const me = get().getCurrentUser();
    if (!me) return [];
    return events.filter((e) => e.hostId === me.id);
  },
  getApplicantsForEvent: (eventId) =>
    get().applicants.filter((a) => a.eventId === eventId),

  getNearbyEvents: (radiusKm = 10) => {
    const { events, userLocation } = get();
    if (!userLocation) return events;
    return events.filter(
      (e) =>
        e.lat != null &&
        haversineKm(userLocation.lat, userLocation.lng, e.lat, e.lng) <= radiusKm
    );
  },

  /* ─────────────────── UI ACTIONS ─────────────────── */
  setSearchQuery: (q) => set({ searchQuery: q }),
  setLoading: (val) => set({ isLoading: val }),
  setUserLocation: (lat, lng) =>
    set({ userLocation: { lat, lng }, locationStatus: "granted" }),
  setLocationStatus: (status) => set({ locationStatus: status }),

  /* ── Toasts ── */
  pushToast: (message, type = "info", duration) => {
    const id = Date.now() + Math.random();
    set((s) => ({
      toasts: [...s.toasts, { id, message, type, duration }],
    }));
    return id;
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  requestLocation: () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        set({ locationStatus: "unavailable" });
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          set({ userLocation: loc, locationStatus: "granted" });
          resolve(loc);
        },
        () => {
          set({ locationStatus: "denied" });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  },

  /* ─────────────────── AUTH ACTIONS ─────────────────── */

  /** Restore session, subscribe to auth changes, load initial data. */
  initAuth: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, authReady: true });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) get().fetchAll();
    });

    if (data.session) await get().fetchAll();
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ session: data.session });
    await get().fetchAll();
    return data;
  },

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    // If session is returned (email confirmation disabled), load data
    if (data.session) {
      set({ session: data.session });
      await get().fetchAll();
    }
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      session: null,
      users: [],
      events: [],
      pastEvents: [],
      applicants: [],
    });
  },

  /* ─────────────────── DATA FETCHING ─────────────────── */
  fetchAll: async () => {
    await Promise.all([
      get().fetchProfiles(),
      get().fetchEvents(),
      get().fetchPastEvents(),
      get().fetchApplicants(),
    ]);
  },

  fetchProfiles: async () => {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      console.error("fetchProfiles", error);
      return;
    }
    set({ users: (data || []).map(mapProfile) });
  },

  fetchEvents: async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    if (error) {
      console.error("fetchEvents", error);
      return;
    }
    set({ events: (data || []).map(mapEvent) });
  },

  fetchPastEvents: async () => {
    const { data, error } = await supabase.from("past_events").select("*");
    if (error) {
      console.error("fetchPastEvents", error);
      return;
    }
    set({ pastEvents: (data || []).map(mapPastEvent) });
  },

  fetchApplicants: async () => {
    const { data, error } = await supabase.from("applicants").select("*");
    if (error) {
      console.error("fetchApplicants", error);
      return;
    }
    set({ applicants: (data || []).map(mapApplicant) });
  },

  /* ─────────────────── STORAGE ─────────────────── */

  /** Upload a cover image to the public `event-images` bucket and return its URL. */
  uploadEventImage: async (file) => {
    if (!file) throw new Error("No file provided");
    if (!file.type?.startsWith("image/")) {
      throw new Error("Please select an image file.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image is too large (max 5 MB).");
    }
    const me = get().getCurrentUser();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${me?.id || "anon"}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("event-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (error) {
      console.error("uploadEventImage", error);
      throw error;
    }
    const { data } = supabase.storage.from("event-images").getPublicUrl(path);
    return data.publicUrl;
  },

  /* ─────────────────── MUTATIONS ─────────────────── */

  addEvent: async (event) => {
    const me = get().getCurrentUser();
    if (!me) throw new Error("Not signed in");

    const payload = {
      title: event.title,
      description: event.description,
      host_id: me.id,
      date: event.date,
      time: event.time,
      location: event.location,
      lat: event.lat,
      lng: event.lng,
      max_snackers: event.maxSnackers,
      current_snackers: event.currentSnackers ?? 0,
      snack_size: event.snackSize,
      image: event.image,
      status: event.status ?? "planning",
      tag: event.tag,
      walk_time: event.walkTime,
    };

    const { data, error } = await supabase
      .from("events")
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.error("addEvent failed", error);
      throw error;
    }

    // Optimistic update + authoritative refetch
    set((s) => ({ events: [...s.events, mapEvent(data)] }));
    await get().fetchEvents();
    return mapEvent(data);
  },

  updateApplicantStatus: async (applicantId, status) => {
    const applicant = get().applicants.find((a) => a.id === applicantId);
    if (!applicant) throw new Error("Applicant not found");

    const wasAccepted = applicant.status === "accepted";
    const willBeAccepted = status === "accepted";

    // 1) Update applicant status
    const { error } = await supabase
      .from("applicants")
      .update({ status })
      .eq("id", applicantId);
    if (error) {
      console.error("updateApplicantStatus", error);
      throw error;
    }

    // 2) Keep events.current_snackers in sync when acceptance flips
    let delta = 0;
    if (!wasAccepted && willBeAccepted) delta = 1;
    else if (wasAccepted && !willBeAccepted) delta = -1;

    if (delta !== 0) {
      const ev = get().events.find((e) => e.id === applicant.eventId);
      if (ev) {
        const nextCount = Math.max(
          0,
          Math.min(ev.maxSnackers, (ev.currentSnackers || 0) + delta)
        );
        const { error: evErr } = await supabase
          .from("events")
          .update({ current_snackers: nextCount })
          .eq("id", ev.id);
        if (evErr) console.error("bump current_snackers", evErr);
        else {
          set((s) => ({
            events: s.events.map((e) =>
              e.id === ev.id ? { ...e, currentSnackers: nextCount } : e
            ),
          }));
        }
      }
    }

    set((s) => ({
      applicants: s.applicants.map((a) =>
        a.id === applicantId ? { ...a, status } : a
      ),
    }));
  },

  applyToEvent: async (eventId, message) => {
    const me = get().getCurrentUser();
    if (!me) throw new Error("Not signed in");

    // Prevent duplicate applications
    const existing = get().applicants.find(
      (a) => a.eventId === eventId && a.userId === me.id
    );
    if (existing) {
      const err = new Error("You've already applied to this snack.");
      err.code = "DUPLICATE_APPLICATION";
      throw err;
    }

    const payload = {
      event_id: eventId,
      user_id: me.id,
      name: me.name,
      avatar: me.avatar,
      message,
      status: "pending",
    };

    const { data, error } = await supabase
      .from("applicants")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    set((s) => ({ applicants: [...s.applicants, mapApplicant(data)] }));
    return mapApplicant(data);
  },
}));

export default useStore;

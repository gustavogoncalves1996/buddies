import { create } from "zustand";

/* ── Initial Data ── */
const initialUsers = [
  {
    id: 1,
    name: "Julian Hearthstone",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDTDMsxzNJvcl1sUSbJ-JPqZun_GgLarqwepjbm8196TZQRINVn_WHCdU8uv9Kssfk_m35OlMQx8KmLfCn7a7ftRSKCB13TJCfBrB34ZdDKcxVrBrxaOEH3NToBlr0sGX_yAzpO0sdeRUYl6QdhMsBbqdcIfK9I7roHSNwk0W7y0CJ29vzCOxQwADXHnngcE9cifh5FtdBhnI-MwT5VSee31_tGPi9GPwd5AKp2Q7IeyjlL2gE6kwe5riFliDRA5fawnk8VdTzjfHc",
    bio: "Curating the intersection of atmospheric smoke and artisanal snacking. A seeker of the perfect char and the quietest tea rooms.",
    favoriteSnack: "Dark Chocolate Matcha Truffles",
    hobbies: ["Tea Ceremonies", "Sourdough", "Pottery", "Foraging", "Latte Art"],
    rating: 5.0,
    eventsHosted: 100,
    eventsAttended: 42,
    badge: "50cm Snack Mastery",
  },
  {
    id: 2,
    name: "Master Kenji",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCj78_h-oMjA6c7Qd-w6Yd8dGH4sE_9e5BcXgEkSKR732JFXpJBL2zDVA35p4SAN8ImffXNOLc8GgWF53DUk7DXliov5pge_2clngVNfIeqqz7fKeXW-iauTwtVZzAmwdp75L0WWgaXHqUo7V_8-PPCWOteWuN9WNCMJiNi1gbRbNDTqPVinKpy_FaVQG_1oEhatBzeQkImVkiKAJcNO5aOglN7Lv7onC8ujYQcYDNDqo3b85Jj-t2tvQl4jc3sgtv_MJoTr1E4xnEV",
    bio: "A third-generation tea ceremony instructor dedicated to making the art of Zen accessible.",
    favoriteSnack: "Wagashi",
    hobbies: ["Matcha", "Calligraphy", "Meditation"],
    rating: 5.0,
    eventsHosted: 200,
  },
  {
    id: 3,
    name: "Sofia Baker",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDG9lvQOTfX-l1rdquMHIV5iW-beaAPgQru5cQCgAOonadA9j4p_YYMNDcmhXS5fiDaFOUMdYQZxIHdovAZpVzBdJ8q0fUMJFSXNjZVV2hPuekmUpVIyp7DXCtvTVXo6mQB26tLUXp3nVi_r3crUvxS3Pn-OSp62uJ6gxlQ-oLMNkAqg9Ma_y9n4Eue3X4iuiocA4cX7SpyT3JPPxdPHL-xnM-H_ULmokmLJMr0hFHLADDOOqIi7hjullxqCirqY98GEfMypHyjDZ8f",
    bio: "Passionate baker who loves sharing fresh pastries with the community.",
    favoriteSnack: "Croissants",
    hobbies: ["Baking", "Photography", "Hiking"],
    rating: 4.8,
    eventsHosted: 34,
  },
];

const initialEvents = [
  {
    id: 1,
    title: "Green Whisk Pop-up",
    description:
      "Experimental matcha tea & mochi pairing session in a cozy garden setting.",
    hostId: 2,
    date: "2026-04-20",
    time: "14:00",
    location: "Jardim do Morro, Vila Nova de Gaia",
    lat: 41.1375,
    lng: -8.6093,
    maxSnackers: 8,
    currentSnackers: 5,
    snackSize: 12,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCaZN-4WWPz68IO5galEggKHp4npqYWWQaCQuWND3wFUT5fh94ZDX7z3TkginTNzwxxOeXMuavXHhrAWM5VsQu6RJvMIdFr3WHY4voXMzPM6aV3BPE3iWs3O31YvpfD1qtZOaqPkULGeRZ4t9HIOA2YqiF7J1QhigpULIQwLPt1U_RaIv7PywUAyxgHNpPS68Ejqb4kdcPnI2xH7DKg-UeLeb0F9BjpwkVIGCsgJlCapg-vMNrAnHykfwCvPVBQg6Bo5J1gjoDnd-nQ",
    status: "confirmed",
    tag: "Brewing Now",
    walkTime: "5 min walk",
  },
  {
    id: 2,
    title: "The Butter Nook",
    description:
      "Warm sea-salt chocolate chip cookies freshly baked and shared with love.",
    hostId: 3,
    date: "2026-04-21",
    time: "10:00",
    location: "Rua das Flores, Porto",
    lat: 41.1456,
    lng: -8.6147,
    maxSnackers: 6,
    currentSnackers: 4,
    snackSize: 8,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAcfIrFi1NJc9q7EZYfYkdNPvegNehvF1qGbFbd0GikJTMGfmvxpqcCvsTGHpvPSeQE3C5QMHKP4WXHfaMzArXzRX0X3BD3y_Mtsq-A2xxDrOUgQ_aR8TfEJclXemAdJXufRTavx24yG0ZsU3KnXqmLZYHTQULfuKcLbQE4lYFieer8hQe556-lqIDOBQlVWW1Mt1A6vNgdk4Zny54Wx7sw-lq9uXnGrFl5RwlWbhvB03x0MK5uQI4ejQ0RfJROswGmi3XbN4FbYBGg",
    status: "confirmed",
    tag: "Baker's Choice",
    walkTime: "0.4 km away",
  },
  {
    id: 3,
    title: "Espresso & Ego",
    description:
      "Single origin beans from local roasters. Perfect pour-over demonstration.",
    hostId: 1,
    date: "2026-04-22",
    time: "16:00",
    location: "Majestic Café, Rua Santa Catarina, Porto",
    lat: 41.1505,
    lng: -8.6050,
    maxSnackers: 5,
    currentSnackers: 2,
    snackSize: 15,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQYfnXmgpdvdDspGQWdRnFrIR8kzlxibwjuF6lk9osfcCD4c62DWPgGSUzg1ma8DRi_ywZl8MYgo614VJGGiULO3EOLRKGQ_l_lpqIIgplyUozICr5CCr87TWK5-AMwGks3_c-BUeiQSaBC95Kq8zIp4ETHvWc0KI4Gbb4Al0Kns671ctnMWx_eqp2AslEJkNh-ZfmAmdV9tyMqvL93LJDGiiUeO061ccNRPlRagB1PEuhP0IYt4_1dXMlhaKX3FvwgpEp8KJ8Ly1f",
    status: "planning",
    tag: "Trending",
    walkTime: "1.2 km away",
  },
  {
    id: 4,
    title: "Sourdough & Stories Brunch",
    description:
      "Share your sourdough starter and hear stories from fellow bread enthusiasts.",
    hostId: 1,
    date: "2026-04-25",
    time: "10:00",
    location: "Mercado do Bolhão, Porto",
    lat: 41.1530,
    lng: -8.6070,
    maxSnackers: 10,
    currentSnackers: 6,
    snackSize: 20,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3cR--3TpUYLwCDG6AstPxxuERcRfpPDpdfaklG8V3WlqjNjLIrIQuxVjJ6x_lvMRMsw2696ZMSjD_sF6-5EutFld9S2Jv4gwZ5KSLuJzE-ZVmBMYFrCiWDvArv2mDFfw5iExdqL2tlWuQPHJA85ODIv-eWk2W8Ck4WbVIIkblCq8OW45UmEnUQzsAilREBIPDRCjFOZ_myCw1HEK_gHD5vnfxvndjxZGjya8wmx-ooW_lTwqBUKGxPa2vgNESHnA0DpVKL7lzqteb",
    status: "planning",
    tag: "New",
    walkTime: "0.8 km away",
  },
];

const initialPastEvents = [
  {
    id: 10,
    title: "The Charred Selection",
    location: "Ribeira, Porto",
    date: "Oct 2023",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnXof_8InVM3DwD02u31Gid2Sz75dbHA-WCAwNUJQKrggGF2bceaRppRrlwXd3sxYY5YUPH4_EgCK1xpTkXJpYS8fk9rdqGuXXxCG2AWr8G-UZPENbuD-pdv9cHtLHIZ4OAir4gufkLAWXbb2ebDFEg4wP-kQ57QG7QJIG-HFBBpmxWFPBwk3x48pvh8EjtCg2FvZ78NiOwdjYdX6MpbVqMy1Tx66sZNyKx2loyBzo5-k5w_pXb1cx8RIGWmufefRXiVRRAB_w5mo",
    tag: "Midnight Market",
  },
  {
    id: 11,
    title: "Aged Comté Pairings",
    location: "Foz do Douro, Porto",
    date: "Sep 2023",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNO49MbcZopFIovg558OEa-29Pfm_DfXREQS-6YKd3vKV9_ZIVrwI15zop6tYfpJoQDGExf7hLphrNfbQ4Sgz5zVCABRolysE-sry9SFqQhPjpKUqx2oZOlD2c2kyXZTpkk1FSevULuldRabfMrfVeoaBTjuLpuV-NwVEYb0PH8YHWk27wCRJHoCZhBgOUZdpWs7Sr4JOi6S0ApIZwltfF1e9DEvdUZ9a-dxW4J8hbLXUWrFoVg9dFTwRWrip0nhjc2_K1R4Ut6tc",
  },
  {
    id: 12,
    title: "Zen Morning Whisk",
    location: "Cedofeita, Porto",
    date: "Aug 2023",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHn5XEb5aejP3POZuRV25u4ZITDVpH4DsD_Xl_UKP_vZ1bXDQJ9Zz5O5vA9Vy8tIWj5osQleAWOlT0luji2GOKD4HpqHFomdb3dXTehmhWuQg3Prbo8qet1qIS9bKg_ZwDl_vtHNN7C9Ih9zfuYQON7_Qs4_zVHQUOdzQCPIFRIVMw2EVQpKe3a7v_EgLo4Tk7XWKPrub1LQ3o2fN2cjUuz61YWo7wAIGal9j21kOhn3t8lRb6wsVh44DEeHkBDJgg-AKyvpn43rc",
  },
  {
    id: 13,
    title: "Dust & Cacao",
    location: "Boavista, Porto",
    date: "Jul 2023",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDrqY8HSkXlSZgE2rtFzYNKOGWAJQC4hKKmFSF8D95gQyAaiTnvCoqK8VkONK7qx8CUtF1MztWaXcS1qvH83pHl8SRyxP5i43FSDLDEYMBbei8sLiWLkV9j4ODH9TRtrsrsyF2npu4kK8iGa6pjL4tua-96Tw2xT9OxXU13Hj9_JUVITFKzLvjZ4R-JDt7YD3U8h59pfQ1NykpRWAevyXHgrYtQ3E1Bydxh6TKYvFmHib95dzJPMVTlsJvcMgbvSLV5N1awaKyz6I8",
  },
];

const initialApplicants = [
  {
    id: 101,
    name: "Aiko Tanaka",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDtVl-lbVHNMZfrPOWbtnGyz-sjM_97XH9Ab_RdvY3L3Ud_l2tJ_WWqi56BtHftKBPhOgSypcGkjvK19Kem9tyUjPo8h0TdYpC19FVH4HFMa5KBsPPx4JbLI7j3nB8cFEJWft56EeIL4VC0LOtTQ49rjH7KkowW6W_gqO8TG1_mWRpGFG7kPe7sFca4Zt0lw_cdcg11Q93JMSwefe3x3JyC2zeJvoJiVRFhKDXRYidTo0_pHbDzFo7JrsGhK2VHXuSJ7lLYuhjce02o",
    message:
      "I've been studying matcha ceremony for two years and would love to learn from a master!",
    eventId: 1,
    status: "pending",
  },
  {
    id: 102,
    name: "Lars Bergström",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvaBM2KESHMj9arpU6eBTQJMduK09BN7H5EpcsOQTNcRStWjFvNEHuyU4i5lwvkGo6mNofKuNbVmh6dXp_UuJX2NSXkllSHcZpUF9MvCHqJMMsIn2ABRUEkBy1FDvMHHum_e7TYnVUqis5EryL7ahInfem9pVugfKo_FTf7638nkuJwe5s8khHLht7XJ6RrmEzOhCJp4UES98cj-sHxaVVI0OjNjz7_IpF3Cq5_8_l-jPmOFf0MP_VGf-dqB3nRkwlbbgeHxgQdUI_",
    message: "Big fan of artisanal baking – count me in!",
    eventId: 1,
    status: "pending",
  },
  {
    id: 103,
    name: "Priya Nair",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBoyo1wCEEzPVAkcskd-NIoWhASM4Qfd1O1iGFv0x8CUAcQvwMZ7R_qfA4uj0LZ8m7f_w7yWgARVU1RHC42tIeQk6fyGZNQhea6rvg-OZF2A-TTgEaGKuMmd8zk0qribKHou3IKZPTlQ9Q6668VnDwp2JmO-wxEWJWDKygttKTRQwXiQvdjYcZybc0Fx-u_5caZUKV0PfkVeDHF5ZHvlHP48b0e76fjJNDgXSg02XYiFBVoDUIVT9ul9c3sYpM83MnkK6xs95JhxRxn",
    message:
      "Would love to share some chai-spiced cookies from my kitchen too!",
    eventId: 2,
    status: "pending",
  },
];

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

/* ── Zustand Store ── */
const useStore = create((set, get) => ({
  /* ── State ── */
  users: initialUsers,
  events: initialEvents,
  pastEvents: initialPastEvents,
  applicants: initialApplicants,
  currentUserId: 1,
  searchQuery: "",
  userLocation: null,          // { lat, lng } or null
  locationStatus: "pending",   // "pending" | "granted" | "denied" | "unavailable"

  /* ── Derived ── */
  getCurrentUser: () => {
    const s = get();
    return s.users.find((u) => u.id === s.currentUserId);
  },
  getHost: (hostId) => get().users.find((u) => u.id === hostId),
  getEvent: (id) => get().events.find((e) => e.id === Number(id)),
  getMyEvents: () => {
    const s = get();
    return s.events.filter((e) => e.hostId === s.currentUserId);
  },
  getApplicantsForEvent: (eventId) =>
    get().applicants.filter((a) => a.eventId === eventId),

  /** Return events within `radiusKm` of the user (default 10 km).
   *  Falls back to ALL events if location is unknown. */
  getNearbyEvents: (radiusKm = 10) => {
    const { events, userLocation } = get();
    if (!userLocation) return events;
    return events.filter(
      (e) =>
        e.lat != null &&
        haversineKm(userLocation.lat, userLocation.lng, e.lat, e.lng) <= radiusKm
    );
  },

  /* ── Actions ── */
  setSearchQuery: (q) => set({ searchQuery: q }),

  setUserLocation: (lat, lng) =>
    set({ userLocation: { lat, lng }, locationStatus: "granted" }),

  setLocationStatus: (status) => set({ locationStatus: status }),

  /** Call once on app mount to request browser geolocation */
  requestLocation: () => {
    if (!navigator.geolocation) {
      set({ locationStatus: "unavailable" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        set({
          userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          locationStatus: "granted",
        }),
      () => set({ locationStatus: "denied" }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  },

  addEvent: (event) =>
    set((s) => ({
      events: [
        ...s.events,
        { ...event, id: Math.max(...s.events.map((e) => e.id)) + 1 },
      ],
    })),

  updateApplicantStatus: (applicantId, status) =>
    set((s) => ({
      applicants: s.applicants.map((a) =>
        a.id === applicantId ? { ...a, status } : a
      ),
    })),

  applyToEvent: (eventId, message) =>
    set((s) => {
      const user = s.users.find((u) => u.id === s.currentUserId);
      return {
        applicants: [
          ...s.applicants,
          {
            id: Math.max(...s.applicants.map((a) => a.id)) + 1,
            name: user.name,
            avatar: user.avatar,
            message,
            eventId,
            status: "pending",
          },
        ],
      };
    }),
}));

export default useStore;

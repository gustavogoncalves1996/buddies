import { useMemo } from "react";
import { Star, MapPin, CalendarDays, Settings, LogOut, Sparkles, Crown, Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";
import { ProfileSkeleton } from "../components/PageSkeletons";

const SMOKE_TEXTURE =
  "https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=1600&q=80";

export default function Profile() {
  const { t } = useTranslation();
  const users = useStore((s) => s.users);
  const session = useStore((s) => s.session);
  const allPastEvents = useStore((s) => s.pastEvents);
  const dataReady = useStore((s) => s.dataReady);
  const fetchAll = useStore((s) => s.fetchAll);
  const signOut = useStore((s) => s.signOut);
  const user = useMemo(
    () => (session ? users.find((u) => u.authId === session.user.id) : null),
    [users, session]
  );
  const pastEvents = useMemo(
    () => (user ? allPastEvents.filter((e) => e.userId === user.id) : []),
    [allPastEvents, user]
  );
  const hasRating = !!user && user.eventsAttended > 0;
  const ratingDisplay = hasRating ? user.rating : "—";

  const featuredBadges = [
    {
      tag: t("profile.legendaryAchievement"),
      label: t("profile.cookieMaster"),
      Icon: Crown,
    },
    {
      tag: t("profile.communityPillarTag"),
      label: t("profile.topHost"),
      Icon: Cloud,
    },
  ];

  const awards = [
    { emoji: "🌿", label: t("profile.cookieMaster") },
    { emoji: "✨", label: t("profile.topHost") },
    { emoji: "🔥", label: t("profile.streak10") },
    { emoji: "🤝", label: t("profile.communityHero") },
  ];

  if (!dataReady || !user) {
    if (!dataReady) return <ProfileSkeleton />;
    return (
      <div className="min-h-screen bg-surface px-6 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-on-surface mb-3">{t("profile.notReadyTitle")}</h1>
        <p className="text-on-surface-variant mb-6 max-w-xl mx-auto">{t("profile.notReadyBody")}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fetchAll()}
            className="rounded-full bg-primary text-on-primary px-5 py-3 font-bold"
          >
            {t("profile.retrySync")}
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-full bg-surface-container-high text-on-surface px-5 py-3 font-bold"
          >
            {t("profile.logOut")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-12">
      {/* ======= DESKTOP HERO ======= */}
      <section className="hidden md:block relative min-h-170 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#0d1f08] via-[#1f3a16] to-[#0d1f08]" />
        {/* Smokey atmospheric layers */}
        <img
          src={SMOKE_TEXTURE}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-screen pointer-events-none"
        />
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(192,240,173,0.25), transparent 60%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.10), transparent 50%), radial-gradient(circle at 80% 30%, rgba(192,240,173,0.18), transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, transparent 60%, #0d1f08 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-170 text-center px-8 py-16">
          {/* Avatar with golden/green glow */}
          <div className="relative mb-10">
            <div className="absolute -inset-6 rounded-full bg-linear-to-br from-[#c0f0ad]/40 via-[#FFD700]/20 to-transparent blur-2xl" />
            <div className="relative w-48 lg:w-56 h-48 lg:h-56 rounded-full overflow-hidden border-[6px] border-[#c0f0ad]/40 shadow-[0_24px_80px_rgba(0,0,0,0.5)] ring-4 ring-[#FFD700]/15">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <h1
            className="text-5xl lg:text-7xl text-[#f3ead4] tracking-tight mb-4 drop-shadow-sm"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
          >
            {user.name}
          </h1>
          <p
            className="italic text-lg text-[#e8f5d8]/85 max-w-2xl leading-relaxed mb-10"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {user.bio || t("profile.bioFallback")}
          </p>
          <div className="flex gap-12 mb-10">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-white">{user.eventsHosted}</span>
              <p className="text-sm text-primary-fixed/70 mt-1">{t("profile.eventsHosted")}</p>
            </div>
            <div className="text-center">
              <span className="text-4xl font-extrabold text-white">{user.eventsAttended}</span>
              <p className="text-sm text-primary-fixed/70 mt-1">{t("profile.attended")}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star size={20} fill={hasRating ? "#FFD700" : "none"} color={hasRating ? "#FFD700" : "#c0f0ad"} />
                <span className="text-4xl font-extrabold text-white">{ratingDisplay}</span>
              </div>
              <p className="text-sm text-primary-fixed/70 mt-1">{t("profile.rating")}</p>
            </div>
          </div>

          {/* Featured achievement cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full max-w-3xl">
            {featuredBadges.map(({ tag, label, Icon }) => (
              <div
                key={label}
                className="relative bg-white/8 backdrop-blur-sm rounded-2xl px-6 py-5 border border-white/15 hover:bg-white/12 transition-colors flex items-center gap-5 text-left"
              >
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#c0f0ad]/30 to-[#FFD700]/10 flex items-center justify-center border border-[#c0f0ad]/30 shrink-0">
                  <Icon size={26} className="text-[#c0f0ad]" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#c0f0ad]/80 mb-1">
                    {tag}
                  </span>
                  <span
                    className="block text-xl text-[#f3ead4]"
                    style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= MOBILE HERO ======= */}
      <section className="md:hidden relative bg-linear-to-br from-[#0d1f08] via-[#1f3a16] to-[#0d1f08] py-10 overflow-hidden">
        <img
          src={SMOKE_TEXTURE}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-screen pointer-events-none"
        />
        <div className="relative flex flex-col items-center text-center px-6">
          <div className="relative mb-4">
            <div className="absolute -inset-3 rounded-full bg-linear-to-br from-[#c0f0ad]/40 to-[#FFD700]/15 blur-xl" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#c0f0ad]/50 shadow-lg">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <h1
            className="text-3xl text-[#f3ead4] tracking-tight mb-1"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
          >
            {user.name}
          </h1>
          <p
            className="italic text-sm text-[#e8f5d8]/85 mb-4 px-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {user.bio || t("profile.bioFallback")}
          </p>
          <div className="flex gap-8">
            <div className="text-center">
              <span className="text-xl font-extrabold text-white">{user.eventsHosted}</span>
              <p className="text-[10px] text-primary-fixed/70 mt-0.5">{t("profile.hostedShort")}</p>
            </div>
            <div className="text-center">
              <span className="text-xl font-extrabold text-white">{user.eventsAttended}</span>
              <p className="text-[10px] text-primary-fixed/70 mt-0.5">{t("profile.attendedShort")}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-0.5 justify-center">
                <Star size={14} fill={hasRating ? "#FFD700" : "none"} color={hasRating ? "#FFD700" : "#c0f0ad"} />
                <span className="text-xl font-extrabold text-white">{ratingDisplay}</span>
              </div>
              <p className="text-[10px] text-primary-fixed/70 mt-0.5">{t("profile.rating")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content area */}
      <div className="max-w-350 mx-auto px-5 md:px-12 pt-6 md:pt-12">
        {/* Mobile awards */}
        <div className="md:hidden flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {awards.map((a, i) => (
            <div
              key={i}
              className="shrink-0 bg-secondary-container rounded-2xl px-4 py-3 text-center"
            >
              <span className="text-xl block mb-1">{a.emoji}</span>
              <span className="text-[10px] font-bold text-on-secondary-container">{a.label}</span>
            </div>
          ))}
        </div>

        {/* Section title */}
        <h2
          className="text-lg md:text-3xl text-on-surface mb-4 md:mb-8"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
        >
          {t("profile.memoriesTitle")}
        </h2>

        {pastEvents.length === 0 ? (
          /* ─── Cozy empty state (PT) ─── */
          <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-secondary-container to-primary-fixed/60 p-8 md:p-14 text-center shadow-cozy">
            <div className="absolute -top-6 -right-6 text-8xl md:text-9xl opacity-20 select-none rotate-12">
              🍪
            </div>
            <div className="absolute -bottom-4 -left-4 text-7xl md:text-8xl opacity-20 select-none -rotate-12">
              🧁
            </div>
            <div className="relative z-10 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
                <Sparkles size={14} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                  {t("profile.journeyTag")}
                </span>
              </div>
              <h3 className="font-headline text-2xl md:text-4xl font-extrabold text-on-secondary-container leading-tight mb-3">
                {t("profile.emptyTitle")}
              </h3>
              <p className="text-sm md:text-base text-on-secondary-container/80 leading-relaxed mb-6">
                {t("profile.emptyBody")} <br className="hidden md:block" />
                <span className="italic">{t("profile.emptyMotto")}</span>
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-headline font-bold text-sm px-6 py-3 rounded-full shadow-cozy hover:bg-primary-container transition-colors"
              >
                {t("profile.discoverNearMe")} →
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop: Bento Masonry Grid */}
            <div className="hidden md:grid md:grid-cols-4 auto-rows-[250px] gap-6">
              {pastEvents.map((event, i) => {
                const isFeatured = i === 0;
                return (
                  <div
                    key={event.id}
                    className={`group relative rounded-2xl overflow-hidden shadow-cozy ${
                      isFeatured ? "md:col-span-2 md:row-span-2" : ""
                    }`}
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-on-surface/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                        {event.tag}
                      </span>
                      <h3 className={`font-extrabold text-white leading-tight ${isFeatured ? "text-2xl" : "text-lg"}`}>
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-4 text-white/70 text-xs mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: 2-col gallery */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative rounded-2xl overflow-hidden aspect-3/4"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-on-surface/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider mb-1 inline-block">
                      {event.tag}
                    </span>
                    <h3 className="text-sm font-extrabold text-white leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-[10px] text-white/70 mt-0.5 flex items-center gap-1">
                      <CalendarDays size={10} />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Settings section (mobile) */}
        <div className="md:hidden mt-8 space-y-3">
          <Link to="/settings" className="w-full flex items-center gap-4 px-5 py-4 bg-surface-container-lowest rounded-2xl shadow-cozy text-on-surface font-bold text-sm">
            <Settings size={18} className="text-on-surface-variant" />
            {t("profile.accountSettings")}
          </Link>
          <button className="w-full flex items-center gap-4 px-5 py-4 bg-surface-container-lowest rounded-2xl shadow-cozy text-error font-bold text-sm">
            <LogOut size={18} className="text-error" />
            {t("profile.logOut")}
          </button>
        </div>
      </div>
    </div>
  );
}

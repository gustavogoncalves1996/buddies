import { useMemo } from "react";
import { Star, MapPin, CalendarDays, Settings, LogOut, Sparkles } from "lucide-react";
import useStore from "../store/useStore";

export default function Profile() {
  const users = useStore((s) => s.users);
  const session = useStore((s) => s.session);
  const allPastEvents = useStore((s) => s.pastEvents);
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

  const awards = [
    { emoji: "🍪", label: "Cookie Master" },
    { emoji: "⭐", label: "Top Host" },
    { emoji: "🔥", label: "Streak 10" },
    { emoji: "🤝", label: "Community Hero" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-12">
      {/* ======= DESKTOP HERO ======= */}
      <section className="hidden md:block relative min-h-170 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#1a3a14] via-[#2d5a22] to-[#1a3a14]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,rgba(192,240,173,0.3),transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-170 text-center px-8">
          <div className="w-48 lg:w-56 h-48 lg:h-56 rounded-full overflow-hidden border-[6px] border-primary-fixed/40 shadow-[0_24px_80px_rgba(0,0,0,0.4)] mb-8">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {user.name}
          </h1>
          <p className="text-xl text-primary-fixed/80 font-medium mb-6">{user.bio}</p>
          <div className="flex gap-12 mb-10">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-white">{user.eventsHosted}</span>
              <p className="text-sm text-primary-fixed/60 mt-1">Events Hosted</p>
            </div>
            <div className="text-center">
              <span className="text-4xl font-extrabold text-white">{user.eventsAttended}</span>
              <p className="text-sm text-primary-fixed/60 mt-1">Attended</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star size={20} fill={hasRating ? "#FFD700" : "none"} color={hasRating ? "#FFD700" : "#c0f0ad"} />
                <span className="text-4xl font-extrabold text-white">{ratingDisplay}</span>
              </div>
              <p className="text-sm text-primary-fixed/60 mt-1">Rating</p>
            </div>
          </div>
          {/* Awards */}
          <div className="flex gap-6">
            {awards.map((a, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center hover:bg-white/15 transition-colors"
              >
                <span className="text-3xl mb-2 block">{a.emoji}</span>
                <span className="text-xs text-primary-fixed/80 font-bold">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= MOBILE HERO ======= */}
      <section className="md:hidden relative bg-linear-to-br from-primary to-primary-container py-10">
        <div className="flex flex-col items-center text-center px-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-fixed/40 shadow-lg mb-4">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">{user.name}</h1>
          <p className="text-sm text-primary-fixed/80 mb-4">{user.bio}</p>
          <div className="flex gap-8">
            <div className="text-center">
              <span className="text-xl font-extrabold text-white">{user.eventsHosted}</span>
              <p className="text-[10px] text-primary-fixed/60 mt-0.5">Hosted</p>
            </div>
            <div className="text-center">
              <span className="text-xl font-extrabold text-white">{user.eventsAttended}</span>
              <p className="text-[10px] text-primary-fixed/60 mt-0.5">Attended</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-0.5 justify-center">
                <Star size={14} fill={hasRating ? "#FFD700" : "none"} color={hasRating ? "#FFD700" : "#c0f0ad"} />
                <span className="text-xl font-extrabold text-white">{ratingDisplay}</span>
              </div>
              <p className="text-[10px] text-primary-fixed/60 mt-0.5">Rating</p>
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
        <h2 className="text-lg md:text-3xl font-extrabold text-on-surface mb-4 md:mb-8">
          Snack Memories
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
                  A tua jornada começa aqui
                </span>
              </div>
              <h3 className="font-headline text-2xl md:text-4xl font-extrabold text-on-secondary-container leading-tight mb-3">
                Ainda não tens memórias<br />para saborear. 🥐
              </h3>
              <p className="text-sm md:text-base text-on-secondary-container/80 leading-relaxed mb-6">
                Parece que a tua despensa de histórias está vazia! Junta-te a um
                encontro, partilha uns bolinhos, e começa a colecionar momentos
                deliciosos com a comunidade. <br className="hidden md:block" />
                <span className="italic">A vida é curta, come o snack primeiro. 😋</span>
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-headline font-bold text-sm px-6 py-3 rounded-full shadow-cozy hover:bg-primary-container transition-colors"
              >
                Descobrir encontros perto de mim →
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
          <button className="w-full flex items-center gap-4 px-5 py-4 bg-surface-container-lowest rounded-2xl shadow-cozy text-on-surface font-bold text-sm">
            <Settings size={18} className="text-on-surface-variant" />
            Account Settings
          </button>
          <button className="w-full flex items-center gap-4 px-5 py-4 bg-surface-container-lowest rounded-2xl shadow-cozy text-error font-bold text-sm">
            <LogOut size={18} className="text-error" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

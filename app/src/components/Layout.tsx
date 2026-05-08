import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Map, PlusCircle, CalendarDays, User, Search, Bell, LogOut, Sparkles } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";

type CurrentUser = {
  id: number;
  avatar: string;
  name: string;
};

type NotificationItem = {
  id: number;
  eventId: number;
  name: string;
  avatar: string;
  message: string;
  eventTitle: string;
};

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop TopNav — hidden below md */}
      <TopNav />
      <Outlet />
      {/* Mobile BottomNav — hidden at md+ */}
      <BottomNav />
    </div>
  );
}

/* ─── Desktop Top Navigation Bar ─── */
function TopNav() {
  const { t } = useTranslation();
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const session = useStore((s) => s.session);
  const users = useStore((s) => s.users);
  const signOut = useStore((s) => s.signOut);
  const navigate = useNavigate();
  const currentUser = session
    ? users.find((u) => u.authId === session.user.id)
    : null;
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: t("nav.map") },
    { to: "/create", label: t("nav.create") },
    { to: "/manage", label: t("nav.manage") },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-[#ffffffcc] backdrop-blur-xl shadow-cozy">
      <div className="flex justify-between items-center px-12 py-4 w-full">
        {/* Left — Brand + Nav */}
        <div className="flex items-center gap-12">
          <NavLink to="/" className="text-2xl font-bold text-primary italic font-headline tracking-tight">
            {t("nav.brand")}
          </NavLink>
          <nav className="flex items-center gap-8 font-headline tracking-tight">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={
                    isActive
                      ? "text-primary font-bold border-b-2 border-primary pb-1"
                      : "text-on-surface-variant font-medium hover:text-primary transition-colors"
                  }
                >
                  {label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Center — Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              className="w-full bg-surface-container-highest border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-container text-on-surface-variant font-body text-sm"
            />
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-4">
          <NotificationsBell currentUser={currentUser} />
          <button
            onClick={handleLogout}
            title={t("nav.logoutTitle")}
            className="p-2 hover:bg-surface-container rounded-full transition-all duration-300"
          >
            <LogOut size={20} className="text-primary" />
          </button>
          <NavLink
            to="/profile"
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed hover:scale-105 transition-transform"
          >
            {currentUser && (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            )}
          </NavLink>
        </div>
      </div>
      <div className="bg-surface-container-low h-px w-full" />
    </header>
  );
}

/* ─── Mobile Bottom Navigation ─── */
function BottomNav() {
  const { t } = useTranslation();
  const links = [
    { to: "/", icon: Map, label: t("nav.map") },
    { to: "/create", icon: PlusCircle, label: t("nav.create") },
    { to: "/manage", icon: CalendarDays, label: t("nav.manage") },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/20">
      <div className="flex justify-around items-center py-3 px-2">
        {/* eslint-disable-next-line no-unused-vars */}
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "text-primary bg-primary-fixed/30"
                  : "text-on-surface-variant hover:text-primary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold tracking-wide">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/* ─── Notifications Bell w/ Popover ─── */
function NotificationsBell({ currentUser }: { currentUser: CurrentUser | null }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<number>>(() => new Set());
  const ref = useRef<HTMLDivElement | null>(null);
  const events = useStore((s) => s.events);
  const applicants = useStore((s) => s.applicants);

  /* Real notifications = applicants applying to MY events */
  const notifications = useMemo(() => {
    if (!currentUser) return [];
    const myEventIds = events
      .filter((e) => e.hostId === currentUser.id)
      .map((e) => e.id);
    return applicants
      .filter((a) => myEventIds.includes(a.eventId) && a.status === "pending")
      .map((a) => {
        const ev = events.find((e) => e.id === a.eventId);
        return { ...a, eventTitle: ev?.title || t("notifications.eventFallback") };
      }) as NotificationItem[];
  }, [currentUser, events, applicants, t]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !seenIds.has(n.id)).length,
    [notifications, seenIds]
  );

  const markCurrentAsSeen = () => {
    if (notifications.length === 0) return;
    setSeenIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) markCurrentAsSeen();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggleOpen}
        className="relative p-2 hover:bg-surface-container rounded-full transition-all duration-300"
      >
        <Bell size={20} className="text-primary" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-surface-container-lowest rounded-2xl shadow-cozy overflow-hidden z-50 border border-outline-variant/30">
          <div className="px-5 py-4 bg-secondary-container flex items-center justify-between">
            <h3 className="font-headline font-extrabold text-on-secondary-container text-sm">
              {t("notifications.title")}
            </h3>
            <span className="text-[10px] font-bold text-on-secondary-container/70">
              {t("notifications.newCount", { count: unreadCount })}
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-5xl mb-3 select-none">🫖</div>
              <div className="inline-flex items-center gap-1.5 bg-primary-fixed/40 rounded-full px-3 py-1 mb-3">
                <Sparkles size={12} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {t("notifications.emptyBadge")}
                </span>
              </div>
              <h4 className="font-headline text-base font-extrabold text-on-surface leading-tight">
                {t("notifications.emptyTitle")}
              </h4>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                {t("notifications.emptyBody")}
              </p>
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-outline-variant/20">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-start gap-3 p-4 hover:bg-surface-container-low">
                  <img src={n.avatar} alt={n.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-on-surface leading-snug">
                      {t("notifications.appliedTo", {
                        name: n.name,
                        eventTitle: n.eventTitle,
                      })}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2">
                      "{n.message}"
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

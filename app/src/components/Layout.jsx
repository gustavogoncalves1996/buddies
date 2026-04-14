import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Map, PlusCircle, CalendarDays, User, Search, Bell } from "lucide-react";
import useStore from "../store/useStore";

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
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);
  const currentUser = users.find((u) => u.id === currentUserId);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Map" },
    { to: "/create", label: "Create" },
    { to: "/manage", label: "Manage" },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-[#ffffffcc] backdrop-blur-xl shadow-cozy">
      <div className="flex justify-between items-center px-12 py-4 w-full">
        {/* Left — Brand + Nav */}
        <div className="flex items-center gap-12">
          <NavLink to="/" className="text-2xl font-bold text-primary italic font-headline tracking-tight">
            The Culinary Hearth
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
              placeholder="Search for cozy snack events..."
              className="w-full bg-surface-container-highest border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-container text-on-surface-variant font-body text-sm"
            />
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-surface-container rounded-full transition-all duration-300">
            <Bell size={20} className="text-primary" />
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
  const links = [
    { to: "/", icon: Map, label: "Map" },
    { to: "/create", icon: PlusCircle, label: "Create" },
    { to: "/manage", icon: CalendarDays, label: "Manage" },
    { to: "/profile", icon: User, label: "Profile" },
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

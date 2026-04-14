import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CalendarDays, MapPin, Users, Star, MessageCircle } from "lucide-react";
import { useState, useMemo } from "react";
import useStore from "../store/useStore";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const events = useStore((s) => s.events);
  const users = useStore((s) => s.users);
  const applyToEvent = useStore((s) => s.applyToEvent);

  const event = useMemo(() => events.find((e) => e.id === Number(id)) || events[0], [events, id]);
  const host = useMemo(() => users.find((u) => u.id === event.hostId), [users, event.hostId]);

  const spotsLeft = event.maxSnackers - event.currentSnackers;
  const fillPercent = (event.currentSnackers / event.maxSnackers) * 100;

  const handleApply = () => {
    applyToEvent(event.id, message);
    alert("Application sent!");
  };

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-12">
      {/* Hero Image */}
      <section className="relative h-64 md:h-153.5 md:min-h-125 w-full overflow-hidden md:mx-auto md:max-w-350 md:px-6 lg:px-12 md:pt-8">
        <div className="md:rounded-lg overflow-hidden relative h-full md:shadow-2xl">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-on-surface/60 via-transparent to-transparent" />

          {/* Mobile back button */}
          <button
            onClick={() => navigate(-1)}
            className="md:hidden absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-surface-container-lowest/80 backdrop-blur flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-on-surface" />
          </button>

          {/* Badge + Title overlay */}
          <div className="absolute bottom-4 md:bottom-12 left-4 md:left-12 z-10 max-w-3xl">
            <span className="bg-secondary-container text-on-secondary-container px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2 md:mb-4 inline-block">
              {event.tag}
            </span>
            <h1 className="hidden md:block text-white text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 leading-[1.1]">
              {event.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-350 mx-auto px-6 lg:px-12 pt-6 md:pt-8">
        {/* Mobile title */}
        <h1 className="md:hidden text-2xl font-extrabold tracking-tight text-on-surface leading-tight mb-6">
          {event.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* Main column */}
          <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
            {/* Desktop apply button */}
            <button
              onClick={handleApply}
              className="hidden md:block w-full py-6 bg-primary text-on-primary text-2xl font-bold rounded-full shadow-[0_12px_40px_rgba(55,96,44,0.15)] hover:scale-[1.01] active:scale-95 transition-all duration-300"
            >
              Apply to Join
            </button>

            {/* Quick Info Row */}
            <div className="flex flex-wrap gap-4 md:gap-8 bg-surface-container-low p-4 md:p-8 rounded-2xl md:rounded-full">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-10 md:h-12 w-10 md:w-12 rounded-full bg-primary-fixed flex items-center justify-center">
                  <CalendarDays size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] md:text-xs font-medium uppercase tracking-wider">Date &amp; Time</p>
                  <p className="text-on-surface font-bold text-sm md:text-base">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} &bull; {event.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-10 md:h-12 w-10 md:w-12 rounded-full bg-primary-fixed flex items-center justify-center">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] md:text-xs font-medium uppercase tracking-wider">Location</p>
                  <p className="text-on-surface font-bold text-sm md:text-base">{event.location}</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary-fixed flex items-center justify-center">
                  <Users size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">Capacity</p>
                  <p className="text-on-surface font-bold">{event.maxSnackers} Guests Only</p>
                </div>
              </div>
            </div>

            {/* Description (mobile) */}
            <p className="md:hidden text-on-surface-variant text-sm leading-relaxed">
              {event.description}
            </p>

            {/* Snack Details Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-secondary-container p-5 md:p-8 rounded-2xl md:rounded-lg relative overflow-hidden group">
                <p className="text-[10px] md:text-xs font-bold text-on-secondary-fixed-variant uppercase tracking-wider mb-1 md:mb-2">
                  Snack Size
                </p>
                <h4 className="text-2xl md:text-3xl font-bold text-on-secondary-container">
                  {event.snackSize}cm
                </h4>
                <p className="hidden md:block text-on-secondary-fixed-variant mt-2">Perfect for a light afternoon tasting.</p>
                <span className="absolute -bottom-2 -right-2 text-5xl md:text-9xl opacity-10">&#127850;</span>
              </div>

              <div className="bg-surface-container-high p-5 md:p-8 rounded-2xl md:rounded-lg relative overflow-hidden group">
                <p className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 md:mb-2">
                  Spots Left
                </p>
                <h4 className="text-2xl md:text-3xl font-bold text-on-surface">
                  {spotsLeft}/{event.maxSnackers}
                </h4>
                <div className="w-full bg-surface-variant h-2 md:h-2.5 rounded-full mt-3 md:mt-6 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: fillPercent + "%" }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Host + Apply */}
            <div className="md:hidden space-y-6">
              {host && (
                <div className="bg-surface-container-low p-5 rounded-2xl">
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={host.avatar}
                      alt={host.name}
                      className="w-14 h-14 rounded-full object-cover border-3 border-surface-container-highest"
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-on-surface">{host.name}</h3>
                      <div className="flex items-center gap-0.5 text-tertiary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} fill="#FFD700" color="#FFD700" />
                        ))}
                        <span className="ml-1 text-sm font-bold text-on-surface">{host.rating}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{host.bio}</p>
                </div>
              )}

              <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-cozy space-y-4">
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} className="text-primary" />
                  <h3 className="font-bold text-base text-on-surface">Apply to Join</h3>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Why do you want to join this snack?"
                  rows={3}
                  className="w-full bg-surface-container-highest border-none rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-fixed resize-none"
                />
                <button
                  onClick={handleApply}
                  className="w-full py-4 bg-linear-to-br from-primary to-primary-container text-on-primary text-base font-bold rounded-full shadow-[0_12px_40px_rgba(55,96,44,0.15)] hover:scale-[1.01] active:scale-95 transition-all duration-300"
                >
                  Submit Application to Join
                </button>
              </div>
            </div>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:block lg:col-span-4 space-y-8">
            {host && (
              <div className="bg-surface-container-low p-8 rounded-lg shadow-sm border-t-8 border-primary">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-surface-container-highest">
                    <img src={host.avatar} alt={host.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold">{host.name}</h3>
                    <div className="flex items-center gap-1 text-tertiary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill="#FFD700" color="#FFD700" />
                      ))}
                      <span className="ml-1 font-bold">{host.rating}</span>
                    </div>
                  </div>
                </div>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">{host.bio}</p>
                <button className="w-full py-3 bg-surface-container-highest text-on-surface font-bold rounded-full hover:bg-surface-dim transition-colors">
                  View Full Profile
                </button>
              </div>
            )}
            <div className="p-6 bg-surface-container-low rounded-lg text-center">
              <p className="text-sm font-medium text-on-surface-variant">Questions about this event?</p>
              <a className="text-primary font-bold underline decoration-primary-fixed decoration-4 underline-offset-4 mt-2 inline-block" href="#">Contact the Host</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, CalendarDays, Clock, Users, Cookie, Sparkles, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

const schema = z.object({
  location: z.string().min(3, "Please enter a location"),
  date: z.string().min(1, "Please pick a date"),
  time: z.string().min(1, "Please pick a time"),
});

export default function CreateEvent() {
  const navigate = useNavigate();
  const addEvent = useStore((s) => s.addEvent);
  const [snackSize, setSnackSize] = useState(12);
  const [maxSnackers, setMaxSnackers] = useState(8);
  const [emojiSize, setEmojiSize] = useState(24);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    setEmojiSize(16 + (snackSize / 50) * 48);
  }, [snackSize]);

  const getEmoji = () => {
    if (snackSize <= 10) return "🍪";
    if (snackSize <= 20) return "🧁";
    if (snackSize <= 35) return "🥐";
    return "🎂";
  };

  const onSubmit = (data) => {
    addEvent({
      ...data,
      snackSize,
      maxSnackers,
      hostId: 1,
      currentSnackers: 0,
      lat: 48.8566,
      lng: 2.3422,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaZN-4WWPz68IO5galEggKHp4npqYWWQaCQuWND3wFUT5fh94ZDX7z3TkginTNzwxxOeXMuavXHhrAWM5VsQu6RJvMIdFr3WHY4voXMzPM6aV3BPE3iWs3O31YvpfD1qtZOaqPkULGeRZ4t9HIOA2YqiF7J1QhigpULIQwLPt1U_RaIv7PywUAyxgHNpPS68Ejqb4kdcPnI2xH7DKg-UeLeb0F9BjpwkVIGCsgJlCapg-vMNrAnHykfwCvPVBQg6Bo5J1gjoDnd-nQ",
      status: "planning",
      tag: "New",
      walkTime: "Near you",
      title: "New Snack Gathering",
      description: "A fresh snack gathering at " + data.location,
    });
    alert("Event created! 🎉");
    navigate("/manage");
  };

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-12">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-xl px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-dim transition-colors"
        >
          <ChevronLeft size={20} className="text-on-surface" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-on-surface">
          Host a Snack Gathering
        </h1>
      </header>

      {/* Desktop header */}
      <header className="hidden md:block text-center pt-12 md:pt-20 mb-12">
        <h1 className="text-5xl font-extrabold text-on-surface tracking-tight mb-4">
          Host a Snack Gathering
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
          Create a cozy space for fellow foodies to share delightful bites and warm conversations.
        </p>
      </header>

      {/* Form */}
      <main className="px-6 pt-4 md:pt-0 max-w-3xl mx-auto">
        <p className="md:hidden text-on-surface-variant text-sm mb-8">
          Create a cozy space for fellow foodies to share delightful bites.
        </p>

        {/* Desktop form card wrapper */}
        <div className="md:bg-surface-container-lowest md:rounded-lg md:p-8 lg:p-12 md:shadow-cozy md:relative md:overflow-hidden">
          {/* Matcha gradient accent bar (desktop) */}
          <div className="hidden md:block absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary to-primary-container" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 md:space-y-12">
            {/* Location */}
            <section className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2.5 md:gap-3">
                <MapPin size={18} className="text-primary" />
                <h2 className="text-base md:text-xl font-bold tracking-tight">Gathering Spot</h2>
              </div>
              <div className="relative">
                <input
                  {...register("location")}
                  placeholder="Search for a park, cafe, or address..."
                  className="w-full bg-surface-container-highest border-none rounded-full px-5 md:px-6 py-3.5 md:py-4 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-fixed transition-all"
                />
                <MapPin size={16} className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              </div>
              {errors.location && (
                <p className="text-error text-xs ml-4">{errors.location.message}</p>
              )}
            </section>

            {/* Date & Time */}
            <section className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2.5 md:gap-3">
                <CalendarDays size={18} className="text-primary" />
                <h2 className="text-base md:text-xl font-bold tracking-tight">When shall we meet?</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 md:mb-2 ml-4">
                    Date
                  </label>
                  <input
                    type="date"
                    {...register("date")}
                    className="w-full bg-surface-container-highest border-none rounded-full px-5 md:px-6 py-3.5 md:py-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed"
                  />
                  {errors.date && (
                    <p className="text-error text-xs ml-4 mt-1">{errors.date.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 md:mb-2 ml-4">
                    Time
                  </label>
                  <input
                    type="time"
                    {...register("time")}
                    className="w-full bg-surface-container-highest border-none rounded-full px-5 md:px-6 py-3.5 md:py-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed"
                  />
                  {errors.time && (
                    <p className="text-error text-xs ml-4 mt-1">{errors.time.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Desktop: Max Snackers + Snack Size side by side */}
            <div className="md:grid md:grid-cols-2 md:gap-12 space-y-10 md:space-y-0">
              {/* Max Snackers */}
              <section className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2.5 md:gap-3">
                  <Users size={18} className="text-primary" />
                  <h2 className="text-base md:text-xl font-bold tracking-tight">Max Snackers</h2>
                </div>
                <div className="flex items-center justify-between bg-surface-container-highest rounded-full p-2">
                  <button
                    type="button"
                    onClick={() => setMaxSnackers((v) => Math.max(1, v - 1))}
                    className="w-11 md:w-12 h-11 md:h-12 flex items-center justify-center rounded-full bg-surface hover:bg-surface-container-lowest transition-colors text-primary shadow-sm text-xl font-bold"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-on-surface px-6 md:px-8 tabular-nums">
                    {maxSnackers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMaxSnackers((v) => v + 1)}
                    className="w-11 md:w-12 h-11 md:h-12 flex items-center justify-center rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-md text-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </section>

              {/* Snack Size Slider */}
              <section className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <Cookie size={18} className="text-primary" />
                    <h2 className="text-base md:text-xl font-bold tracking-tight">Snack Size</h2>
                  </div>
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-2xl md:rounded-lg text-sm font-bold">
                    {snackSize}cm
                  </span>
                </div>

                <div className="flex justify-center items-center h-20 md:h-12 bg-surface-container-low rounded-2xl md:rounded-xl">
                  <span
                    className="transition-all duration-200"
                    style={{ fontSize: emojiSize + "px" }}
                  >
                    {getEmoji()}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="50"
                  value={snackSize}
                  onChange={(e) => setSnackSize(Number(e.target.value))}
                  className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-medium px-1">
                  <span>Cookie 🍪</span>
                  <span>Cake 🎂</span>
                </div>
              </section>
            </div>

            {/* Submit */}
            <div className="pt-4 md:pt-8 flex flex-col items-center">
              <button
                type="submit"
                className="w-full md:w-auto md:px-16 py-4 md:py-5 bg-linear-to-br from-primary to-primary-container text-on-primary text-lg md:text-xl font-bold rounded-full md:rounded-xl shadow-[0_12px_40px_rgba(55,96,44,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3"
              >
                <span>Publish Event</span>
                <Sparkles size={20} />
              </button>
              <p className="mt-4 md:mt-6 text-sm text-on-surface-variant font-medium italic">
                Ready to welcome the hearth? 🌿
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";
import useStore from "../store/useStore";

/**
 * Confirmed events for the current user (ones they're hosting OR accepted into).
 *
 * Thanks to `persistQueryClient` + `localStorage`, this query's data is
 * rehydrated synchronously on app start — so when the user reopens the app
 * offline, the list & details show up instantly while we silently retry
 * in the background once connectivity returns.
 */
export function useConfirmedEvents() {
  const me = useStore((s) => s.getCurrentUser());

  return useQuery({
    queryKey: ["confirmed-events", me?.id ?? "anon"],
    enabled: !!me,
    queryFn: async () => {
      // Events hosted by me
      const hosted = supabase
        .from("events")
        .select("*")
        .eq("host_id", me.id);

      // Events I'm accepted into
      const accepted = supabase
        .from("applicants")
        .select("event_id, events(*)")
        .eq("user_id", me.id)
        .eq("status", "accepted");

      const [{ data: hostedRows = [] }, { data: acceptedRows = [] }] =
        await Promise.all([hosted, accepted]);

      const map = new Map();
      hostedRows.forEach((e) => map.set(e.id, e));
      acceptedRows.forEach((r) => r.events && map.set(r.events.id, r.events));

      return [...map.values()].sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );
    },
  });
}

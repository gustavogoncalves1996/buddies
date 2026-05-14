import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import webpush from "npm:web-push@3.6.7";

type ApplicantRecord = {
  id: number;
  event_id: number;
  user_id: string;
  name?: string | null;
  message?: string | null;
  status?: string | null;
};

type ApplicantsWebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: ApplicantRecord;
  old_record?: Record<string, unknown> | null;
};

const jsonHeaders = { "content-type": "application/json" };

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com";
const webhookSecret = Deno.env.get("WEBHOOK_SECRET") ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn("Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY; notifications will fail.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

function response(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: jsonHeaders,
  });
}

function shouldRejectBySecret(req: Request) {
  if (!webhookSecret) return false;
  const inbound = req.headers.get("x-webhook-secret") ?? "";
  return inbound !== webhookSecret;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return response(405, { ok: false, error: "Method not allowed" });
  }

  if (shouldRejectBySecret(req)) {
    return response(401, { ok: false, error: "Unauthorized webhook" });
  }

  let payload: ApplicantsWebhookPayload;
  try {
    payload = (await req.json()) as ApplicantsWebhookPayload;
  } catch (_err) {
    return response(400, { ok: false, error: "Invalid JSON payload" });
  }

  if (payload.table && payload.table !== "applicants") {
    return response(200, { ok: true, skipped: true, reason: "Not applicants table" });
  }

  if (payload.type && payload.type.toUpperCase() !== "INSERT") {
    return response(200, { ok: true, skipped: true, reason: "Not INSERT event" });
  }

  const record = payload.record;
  if (!record?.event_id) {
    return response(200, { ok: true, skipped: true, reason: "No event_id in record" });
  }

  if (record.status && record.status !== "pending") {
    return response(200, { ok: true, skipped: true, reason: "Application status is not pending" });
  }

  const { data: eventRow, error: eventError } = await supabaseAdmin
    .from("events")
    .select("id, title, host_id")
    .eq("id", record.event_id)
    .single();

  if (eventError || !eventRow) {
    console.error("Failed to fetch event", eventError);
    return response(404, { ok: false, error: "Event not found" });
  }

  const { data: hostProfile, error: hostError } = await supabaseAdmin
    .from("profiles")
    .select("id, name, push_subscription")
    .eq("id", eventRow.host_id)
    .single();

  if (hostError || !hostProfile) {
    console.error("Failed to fetch host profile", hostError);
    return response(404, { ok: false, error: "Host profile not found" });
  }

  const subscription = hostProfile.push_subscription;
  if (!subscription) {
    return response(200, {
      ok: true,
      skipped: true,
      reason: "Host has no push subscription",
      host_id: hostProfile.id,
    });
  }

  const notificationPayload = {
    title: "New snack application",
    body: `${record.name ?? "Someone"} applied to ${eventRow.title}`,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: {
      eventId: eventRow.id,
      url: "/manage",
      applicantId: record.id,
      applicantName: record.name ?? null,
      message: record.message ?? null,
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await webpush.sendNotification(subscription as webpush.PushSubscription, JSON.stringify(notificationPayload));

    return response(200, {
      ok: true,
      sent: true,
      host_id: hostProfile.id,
      event_id: eventRow.id,
      applicant_id: record.id,
    });
  } catch (err) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    const message = (err as { message?: string })?.message ?? "Push send failed";

    console.error("Push send error", { statusCode, message });

    // 404/410 means the subscription is expired or no longer valid.
    if (statusCode === 404 || statusCode === 410) {
      const { error: clearError } = await supabaseAdmin
        .from("profiles")
        .update({ push_subscription: null })
        .eq("id", hostProfile.id);

      if (clearError) {
        console.error("Failed to clear invalid push subscription", clearError);
      }
    }

    return response(500, {
      ok: false,
      error: "Failed to send push notification",
      details: message,
      statusCode: statusCode ?? null,
    });
  }
});

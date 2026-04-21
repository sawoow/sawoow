/**
 * Luzze Consultancy — Google Calendar + Stripe web app.
 *
 * Deploy:
 *   1. Extensions → Apps Script → paste this file.
 *   2. Set SHARED_SECRET below.
 *   3. File → Project Settings → Script Properties, add:
 *        STRIPE_SECRET_KEY   = sk_test_... (or sk_live_...)
 *        (optional) STRIPE_WEBHOOK_SECRET — unused by default; we re-fetch
 *        the PaymentIntent from Stripe instead of trusting webhook bodies.
 *   4. Deploy → New deployment → Type: Web app →
 *        Execute as: Me → Who has access: Anyone. Deploy.
 *   5. Copy the Web-app URL into the site's VITE_GCAL_ENDPOINT.
 *   6. In Stripe Dashboard → Developers → Webhooks → Add endpoint:
 *        URL:    <your web app URL>?action=stripe-webhook
 *        Events: payment_intent.succeeded
 *   7. In the Apps Script editor, run `installReminderTrigger` once.
 *
 * Endpoints:
 *   GET  ?action=busy&date=YYYY-MM-DD
 *   POST ?action=create-payment-intent   { token, bookingId, service, slot, customer }
 *   POST ?action=finalize-booking        { token, bookingId, paymentIntentId }
 *   POST ?action=stripe-webhook          (raw Stripe event)
 */

var SHARED_SECRET = "CHANGE_ME";
var CALENDAR_ID = "primary";
var SITE_URL = "https://sawoow-luzze.github.io/sawoow-luzze/";
var CURRENCY = "usd";

// -------------------------------------------------------------------- utils

function getCalendar_() {
  if (CALENDAR_ID === "primary") return CalendarApp.getDefaultCalendar();
  return CalendarApp.getCalendarById(CALENDAR_ID);
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function props_() {
  return PropertiesService.getScriptProperties();
}

function getStripeKey_() {
  var key = props_().getProperty("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY not set in Script Properties");
  return key;
}

function checkToken_(body) {
  if (SHARED_SECRET && body.token !== SHARED_SECRET) {
    throw new Error("unauthorized");
  }
}

function stripeApi_(method, path, payload) {
  var url = "https://api.stripe.com/v1" + path;
  var options = {
    method: method,
    headers: {
      Authorization: "Basic " + Utilities.base64Encode(getStripeKey_() + ":"),
    },
    muteHttpExceptions: true,
  };
  if (payload) options.payload = payload;
  var res = UrlFetchApp.fetch(url, options);
  var body = JSON.parse(res.getContentText() || "{}");
  if (res.getResponseCode() >= 400) {
    throw new Error(
      "Stripe " + path + " " + res.getResponseCode() + ": " +
      (body.error && body.error.message) || res.getContentText()
    );
  }
  return body;
}

// flatten { a: 1, b: { c: 2 } } into { a: 1, "b[c]": 2 } — Stripe wants form-encoded.
function flattenForStripe_(obj, prefix, out) {
  out = out || {};
  Object.keys(obj).forEach(function (k) {
    var v = obj[k];
    var key = prefix ? prefix + "[" + k + "]" : k;
    if (v === null || v === undefined) return;
    if (typeof v === "object" && !Array.isArray(v)) {
      flattenForStripe_(v, key, out);
    } else {
      out[key] = String(v);
    }
  });
  return out;
}

function slotIsBusy_(startIso, endIso) {
  var start = new Date(startIso);
  var end = new Date(endIso);
  var pad = 15 * 60 * 1000;
  var events = getCalendar_().getEvents(
    new Date(start.getTime() - pad),
    new Date(end.getTime() + pad)
  );
  return events.some(function (ev) {
    if (ev.isAllDayEvent()) return false;
    return ev.getStartTime() < end && ev.getEndTime() > start;
  });
}

// --------------------------------------------------------------- doGet / doPost

function doGet(e) {
  try {
    var action = (e.parameter && e.parameter.action) || "";
    if (action === "busy") return handleBusy_(e);
    return jsonOut_({ error: "unknown action" });
  } catch (err) {
    return jsonOut_({ error: String(err) });
  }
}

function doPost(e) {
  try {
    var action = (e.parameter && e.parameter.action) || "";
    if (action === "stripe-webhook") return handleStripeWebhook_(e);

    var body = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (action === "create-payment-intent") return handleCreatePI_(body);
    if (action === "finalize-booking") return handleFinalize_(body);

    // Legacy: calendar-only create (kept for any older client still calling it).
    checkToken_(body);
    return createCalendarEvent_(body);
  } catch (err) {
    return jsonOut_({ error: String(err) });
  }
}

// -------------------------------------------------------------- GET busy

function handleBusy_(e) {
  var dateStr = e.parameter.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr || "")) {
    return jsonOut_({ error: "invalid date" });
  }
  var parts = dateStr.split("-");
  // Build the window as midnight-to-midnight EAT (UTC+3) explicitly so the
  // result is correct regardless of the Apps Script project timezone setting.
  var EAT_OFFSET_MS = 3 * 60 * 60 * 1000;
  var start = new Date(
    Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)) - EAT_OFFSET_MS
  );
  var end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  var events = getCalendar_().getEvents(start, end);
  var busy = events
    .filter(function (ev) { return !ev.isAllDayEvent(); })
    .map(function (ev) {
      return {
        start: ev.getStartTime().toISOString(),
        end: ev.getEndTime().toISOString(),
      };
    });
  return jsonOut_({ busy: busy });
}

// ------------------------------------------------- POST create-payment-intent

function handleCreatePI_(body) {
  checkToken_(body);
  var service = body.service || {};
  var slot = body.slot || {};
  var customer = body.customer || {};
  if (!body.bookingId) return jsonOut_({ error: "missing bookingId" });
  if (!slot.start || !slot.end) return jsonOut_({ error: "missing slot" });
  if (!Number.isFinite(service.amount) || service.amount <= 0) {
    return jsonOut_({ error: "invalid amount" });
  }
  if (!customer.email) return jsonOut_({ error: "missing email" });

  if (slotIsBusy_(slot.start, slot.end)) {
    return jsonOut_({ error: "slot_unavailable" });
  }

  var payload = flattenForStripe_({
    amount: Math.round(service.amount * 100),
    currency: CURRENCY,
    receipt_email: customer.email,
    description: "Luzze Consultancy — " + service.title,
    automatic_payment_methods: { enabled: "true" },
    metadata: {
      bookingId: body.bookingId,
      service_title: service.title || "",
      service_amount: String(service.amount),
      slot_start: slot.start,
      slot_end: slot.end,
      customer_name: customer.name || "",
      customer_email: customer.email,
    },
  });

  var form = Object.keys(payload)
    .map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(payload[k]); })
    .join("&");

  var pi = stripeApi_("post", "/payment_intents", form);
  return jsonOut_({ clientSecret: pi.client_secret, bookingId: body.bookingId, paymentIntentId: pi.id });
}

// ---------------------------------------------------- POST finalize-booking

function handleFinalize_(body) {
  checkToken_(body);
  if (!body.bookingId || !body.paymentIntentId) {
    return jsonOut_({ error: "missing fields" });
  }
  var result = finalizeBooking_(body.paymentIntentId, body.bookingId);
  return jsonOut_(result);
}

function finalizeBooking_(paymentIntentId, expectedBookingId) {
  // idempotency check
  var dedupKey = "finalized:" + (expectedBookingId || paymentIntentId);
  var cached = props_().getProperty(dedupKey);
  if (cached) {
    return { confirmed: true, cached: true, eventId: JSON.parse(cached).eventId };
  }

  var pi = stripeApi_("get", "/payment_intents/" + paymentIntentId);
  if (pi.status !== "succeeded") {
    return { confirmed: false, error: "payment_not_succeeded", status: pi.status };
  }
  var md = pi.metadata || {};
  if (expectedBookingId && md.bookingId !== expectedBookingId) {
    return { confirmed: false, error: "bookingId_mismatch" };
  }
  if (!md.slot_start || !md.slot_end) {
    return { confirmed: false, error: "missing_metadata" };
  }

  // race: another booking slipped in
  if (slotIsBusy_(md.slot_start, md.slot_end)) {
    try {
      stripeApi_("post", "/payment_intents/" + paymentIntentId + "/refund", "");
    } catch (e) {}
    return { confirmed: false, error: "slot_conflict_refunded" };
  }

  var start = new Date(md.slot_start);
  var end = new Date(md.slot_end);
  var title = "Luzze: " + md.service_title + " — " + (md.customer_name || md.customer_email);
  var desc = [
    md.service_title + " (paid USD " + md.service_amount + ")",
    "Customer: " + (md.customer_name || "(no name)") + " <" + md.customer_email + ">",
    "Booking ID: " + md.bookingId,
    "LUZZE_REMINDER_EMAIL=" + md.customer_email,
  ].join("\n");

  var options = {
    description: desc,
    sendInvites: true,
    guests: md.customer_email,
  };
  var ev = getCalendar_().createEvent(title, start, end, options);
  ev.addEmailReminder(60 * 24);
  ev.addPopupReminder(30);

  // confirmation email (server-side — replaces the old EmailJS template)
  try {
    var when = Utilities.formatDate(start, "Africa/Nairobi", "EEEE d MMMM yyyy, HH:mm");
    MailApp.sendEmail({
      to: md.customer_email,
      subject: "Your Luzze Consultancy booking is confirmed — " + md.service_title,
      body: [
        "Hi " + (md.customer_name || "there") + ",",
        "",
        "Your booking is confirmed.",
        "",
        "  Service: " + md.service_title,
        "  When:    " + when + " EAT (Uganda, UTC+3)",
        "  Paid:    USD " + md.service_amount,
        "",
        "A calendar invite has been sent to this address. You'll also get a reminder 24 hours before.",
        "",
        "To reschedule or cancel, reply to this email or write to sauda.luzze@gmail.com.",
        "",
        "See you soon,",
        "Sauda · Luzze Consultancy",
        SITE_URL,
      ].join("\n"),
    });
  } catch (mailErr) {
    // non-fatal: event exists, customer still has Stripe receipt
  }

  props_().setProperty(dedupKey, JSON.stringify({ eventId: ev.getId(), at: new Date().toISOString() }));
  return { confirmed: true, eventId: ev.getId() };
}

// --------------------------------------------------------- Stripe webhook

function handleStripeWebhook_(e) {
  try {
    var body = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (body.type !== "payment_intent.succeeded") {
      return jsonOut_({ received: true, ignored: body.type });
    }
    // trust only the id — re-fetch from Stripe to confirm
    var piId = body.data && body.data.object && body.data.object.id;
    if (!piId) return jsonOut_({ received: true, error: "no pi id" });
    var pi = stripeApi_("get", "/payment_intents/" + piId);
    var bookingId = pi.metadata && pi.metadata.bookingId;
    if (!bookingId) return jsonOut_({ received: true, error: "no bookingId in metadata" });
    var out = finalizeBooking_(piId, bookingId);
    return jsonOut_({ received: true, out: out });
  } catch (err) {
    return jsonOut_({ received: true, error: String(err) });
  }
}

// ------------------------------------------------------------ legacy path

function createCalendarEvent_(body) {
  if (!body.title || !body.start || !body.end) {
    return jsonOut_({ error: "missing fields" });
  }
  var start = new Date(body.start);
  var end = new Date(body.end);
  var description = [
    body.notes || "",
    body.email ? "Attendee email: " + body.email : "",
    "LUZZE_REMINDER_EMAIL=" + (body.email || ""),
  ].filter(Boolean).join("\n\n");
  var options = { description: description, sendInvites: true };
  if (body.email) options.guests = body.email;
  var ev = getCalendar_().createEvent(body.title, start, end, options);
  ev.addEmailReminder(60 * 24);
  ev.addPopupReminder(30);
  return jsonOut_({ id: ev.getId(), htmlLink: "https://www.google.com/calendar" });
}

// ------------------------------------------------------------- reminder cron

function installReminderTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "sendReminderEmails") {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger("sendReminderEmails").timeBased().everyHours(1).create();
}

function sendReminderEmails() {
  var now = new Date();
  var windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  var windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  var events = getCalendar_().getEvents(windowStart, windowEnd);

  var sentKey = "luzzeReminders";
  var sent = JSON.parse(props_().getProperty(sentKey) || "{}");

  events.forEach(function (ev) {
    var id = ev.getId();
    if (sent[id]) return;
    var desc = ev.getDescription() || "";
    var match = desc.match(/LUZZE_REMINDER_EMAIL=([^\s]+)/);
    if (!match) return;
    var email = match[1];
    if (!email) return;
    var when = Utilities.formatDate(ev.getStartTime(), "Africa/Nairobi", "EEEE d MMMM, HH:mm");
    MailApp.sendEmail({
      to: email,
      subject: "Reminder: your Luzze session tomorrow",
      body: [
        "Hi,",
        "",
        "Quick reminder that your session with Luzze Consultancy is scheduled for:",
        "  " + when + " EAT (Uganda, UTC+3)",
        "",
        ev.getTitle(),
        "",
        "If you need to reschedule, reply to this email or write to sauda.luzze@gmail.com.",
        "",
        "See you soon,",
        "Sauda · Luzze Consultancy",
      ].join("\n"),
    });
    sent[id] = true;
  });
  props_().setProperty(sentKey, JSON.stringify(sent));
}

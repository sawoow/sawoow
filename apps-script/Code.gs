/**
 * Luzze Consultancy — Google Calendar web app + 24h reminder cron.
 *
 * Deploy:
 *   1. Extensions → Apps Script → paste this file.
 *   2. Set SHARED_SECRET below.
 *   3. Deploy → New deployment → Type: Web app →
 *      Execute as: Me → Who has access: Anyone. Deploy.
 *   4. Copy the Web-app URL into the site's VITE_GCAL_ENDPOINT.
 *   5. In the Apps Script editor, run `installReminderTrigger` once
 *      (Apps Script menu → select function → Run). It schedules an
 *      hourly trigger that sends 24h reminder emails.
 *
 * Endpoints:
 *   GET  ?action=busy&date=YYYY-MM-DD  → { busy: [{start, end}, ...] }
 *   POST { token, title, start, end, email, notes }
 *                                      → { id, htmlLink }
 */

var SHARED_SECRET = "CHANGE_ME";   // must match VITE_GCAL_TOKEN in the site
var CALENDAR_ID = "primary";       // or an email like "sauda.luzze@gmail.com"

function getCalendar_() {
  if (CALENDAR_ID === "primary") return CalendarApp.getDefaultCalendar();
  return CalendarApp.getCalendarById(CALENDAR_ID);
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doGet(e) {
  try {
    var action = (e.parameter && e.parameter.action) || "";
    if (action !== "busy") {
      return jsonOut_({ error: "unknown action" });
    }
    var dateStr = e.parameter.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr || "")) {
      return jsonOut_({ error: "invalid date" });
    }
    var parts = dateStr.split("-");
    var start = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
      0, 0, 0
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
  } catch (err) {
    return jsonOut_({ error: String(err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    if (SHARED_SECRET && body.token !== SHARED_SECRET) {
      return jsonOut_({ error: "unauthorized" });
    }
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
    ev.addEmailReminder(60 * 24);   // 24 h before
    ev.addPopupReminder(30);        // 30 min before

    return jsonOut_({
      id: ev.getId(),
      htmlLink: "https://www.google.com/calendar",
    });
  } catch (err) {
    return jsonOut_({ error: String(err) });
  }
}

/** Run once from the Apps Script editor: installs an hourly trigger. */
function installReminderTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "sendReminderEmails") {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger("sendReminderEmails").timeBased().everyHours(1).create();
}

/**
 * Belt-and-braces reminder: every hour, look at events ~24h out and send a
 * short text reminder to attendees. Google's built-in email reminder already
 * goes out as part of the event itself; this covers the case where an invite
 * bounces or the guest doesn't accept.
 */
function sendReminderEmails() {
  var now = new Date();
  var windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  var windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  var events = getCalendar_().getEvents(windowStart, windowEnd);

  var props = PropertiesService.getScriptProperties();
  var sentKey = "luzzeReminders";
  var sent = JSON.parse(props.getProperty(sentKey) || "{}");

  events.forEach(function (ev) {
    var id = ev.getId();
    if (sent[id]) return;
    var desc = ev.getDescription() || "";
    var match = desc.match(/LUZZE_REMINDER_EMAIL=([^\s]+)/);
    if (!match) return;
    var email = match[1];
    if (!email) return;

    var when = Utilities.formatDate(
      ev.getStartTime(),
      "Africa/Nairobi",
      "EEEE d MMMM, HH:mm"
    );
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

  // prune entries older than 3 days so the property doesn't grow forever
  var threeDaysAgo = now.getTime() - 3 * 24 * 60 * 60 * 1000;
  Object.keys(sent).forEach(function (k) {
    if (sent[k] && sent[k].t && sent[k].t < threeDaysAgo) delete sent[k];
  });
  props.setProperty(sentKey, JSON.stringify(sent));
}

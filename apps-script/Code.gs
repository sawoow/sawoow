/**
 * Luzze Consultancy — Google Calendar web app.
 *
 * Deploy: Extensions → Apps Script → paste this file → Deploy → New deployment →
 *   Type: Web app → Execute as: Me → Who has access: Anyone → Deploy.
 * Copy the web-app URL into the site's VITE_GCAL_ENDPOINT env var.
 *
 * Endpoints:
 *   GET  ?action=busy&date=YYYY-MM-DD   → { busy: [{start, end}, ...] }
 *   POST  { token, title, start, end, email, notes }
 *                                       → { id, htmlLink }
 *
 * Security: the POST handler checks `token` against SHARED_SECRET. Set this to
 * the same string you put in VITE_GCAL_TOKEN in the site's env. Keep it secret-ish
 * (it's baked into the client bundle, so it's low-assurance — mainly to discourage
 * bots spamming events).
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
    var description = (body.notes || "") +
      (body.email ? "\n\nAttendee email: " + body.email : "");
    var options = {};
    if (body.email) options.guests = body.email;
    options.sendInvites = true;
    options.description = description;

    var ev = getCalendar_().createEvent(body.title, start, end, options);
    return jsonOut_({
      id: ev.getId(),
      htmlLink: "https://www.google.com/calendar",
    });
  } catch (err) {
    return jsonOut_({ error: String(err) });
  }
}

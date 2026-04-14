# Luzze Consultancy

Static React site for Luzze Consultancy — a diaspora relocation advisory
for returning home to Uganda. Built with **Vite + React**, deployed to
**GitHub Pages**, with a custom in-app booking flow (calendar → dummy
payment → confirmation email), a Google Calendar sync through a Google
Apps Script web app, and a contact form powered by EmailJS.

Live site: <https://sawoow-luzze.github.io/sawoow-luzze/>

## Local development

Requires [Bun](https://bun.sh).

```sh
bun install
cp .env.example .env        # fill in values (see below)
bun run dev                 # http://localhost:5173
bun run build && bun run preview
```

Without env values set, every integration degrades gracefully:

- Booking still works end-to-end in the UI.
- Calendar shows all slots as available.
- Confirmation / contact emails log a warning instead of sending.
- The "event created" step is skipped and a "Sauda will add it manually"
  notice is shown.

## Environment variables

All are prefixed `VITE_` so they're baked into the build.

| Variable | Purpose |
|---|---|
| `VITE_GCAL_ENDPOINT` | URL of the deployed Google Apps Script web app |
| `VITE_GCAL_TOKEN` | Shared secret sent on `POST` (must match `SHARED_SECRET` in `apps-script/Code.gs`) |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID (Gmail / Outlook / etc.) |
| `VITE_EMAILJS_BOOKING_TEMPLATE_ID` | Template for customer confirmation email |
| `VITE_EMAILJS_CONTACT_TEMPLATE_ID` | Template for contact-form email to Sauda |

## Setup steps

### 1. Google Calendar sync

1. Open <https://script.google.com/> while signed in as the Google account
   whose calendar should receive events.
2. Create a new project and paste the contents of `apps-script/Code.gs`.
3. Set `SHARED_SECRET` at the top of the file to a random string.
4. Save → **Deploy** → **New deployment** → Type: **Web app**.
5. Configure: **Execute as: Me**, **Who has access: Anyone**. Deploy.
6. Authorise when prompted (the script needs Calendar access).
7. Copy the Web-app URL into `VITE_GCAL_ENDPOINT`, and set
   `VITE_GCAL_TOKEN` to the same string as `SHARED_SECRET`.

### 2. EmailJS

1. Sign up at <https://www.emailjs.com/> and connect an email service
   (Gmail recommended — `sauda.luzze@gmail.com`).
2. Create two templates:
   - **booking_confirm** — sent to customers. Use these variables:
     `{{to_name}}`, `{{to_email}}`, `{{service}}`, `{{price}}`,
     `{{slot_start}}`, `{{slot_end}}`. Set the "To Email" field to
     `{{to_email}}`.
   - **contact_form** — sent to Sauda. Variables: `{{from_name}}`,
     `{{from_email}}`, `{{message}}`. Hard-code "To Email" to
     `sauda.luzze@gmail.com`.
3. Copy the public key, service ID, and both template IDs into `.env`.

### 3. Images

Placeholder SVGs are committed in `public/images/`. To replace with real
photos, follow `public/images/README.md`.

### 4. GitHub Pages deploy

1. Push to `main`. The workflow at `.github/workflows/deploy.yml`
   builds the site and publishes it to GitHub Pages.
2. In the repo: **Settings → Pages → Build and deployment →
   Source: GitHub Actions**.
3. Still in **Settings**, add the env vars under
   **Secrets and variables → Actions → Variables** (not Secrets — the
   workflow reads them as `vars.*`). These get baked into the client
   bundle, so treat `VITE_GCAL_TOKEN` as low-assurance rate-limiting
   rather than a real secret.

The deployed site will live at
`https://<owner>.github.io/sawoow-luzze/`. The Vite `base` is already
set to `/sawoow-luzze/` in `vite.config.js`.

## Project layout

```
src/
├── App.jsx                  top-level state (page + booking modal)
├── main.jsx                 Vite entry
├── styles.css               global resets
├── components/
│   ├── Nav.jsx
│   ├── BookingModal.jsx     calendar → payment → confirm state machine
│   ├── Calendar.jsx         custom date/time picker, reads GCal busy times
│   ├── PaymentForm.jsx      fake card form (demo only)
│   ├── ContactForm.jsx      EmailJS-powered contact form
│   └── PlaceholderImage.jsx <img> with gradient fallback
├── pages/
│   ├── Home.jsx
│   ├── WhyLuzze.jsx
│   ├── Services.jsx
│   └── Contact.jsx
└── lib/
    ├── gcal.js              wraps the Apps Script endpoint
    └── email.js             wraps EmailJS
apps-script/Code.gs          Google Apps Script source (deployed separately)
public/images/               site images + their README
```

## Notes

- Payment is deliberately **dummy** (styled card form, 1.2 s simulated
  spinner, clearly labelled "Demo payment — no real charge"). Swap in
  Stripe Checkout when ready.
- Availability is fixed to Mon–Fri, 09:00–17:00 local time, 30-min
  slots. Change in `src/components/Calendar.jsx`.
- Business-hour filtering is client-side, so the script returns raw
  calendar busy ranges; the UI overlaps them against the fixed slot
  grid.

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

Without env values set, integrations degrade gracefully:

- Calendar shows all slots as available (no busy feed).
- Contact form logs a warning instead of sending.
- The payment step warns that the gateway isn't configured and points the
  user at Sauda's email; no charge is attempted.
- Booking confirmation, calendar event, and reminders all originate from
  the Apps Script backend — they only run when that endpoint + Stripe
  keys are set.

## Environment variables

All are prefixed `VITE_` so they're baked into the build.

| Variable | Purpose |
|---|---|
| `VITE_GCAL_ENDPOINT` | URL of the deployed Google Apps Script web app |
| `VITE_GCAL_TOKEN` | Shared secret sent on `POST` (must match `SHARED_SECRET` in `apps-script/Code.gs`) |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID (Gmail / Outlook / etc.) |
| `VITE_EMAILJS_CONTACT_TEMPLATE_ID` | Template for contact-form email to Sauda |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...` / `pk_live_...`) |
| `VITE_PLAUSIBLE_DOMAIN` | Optional. Your Plausible analytics domain |

The Stripe **secret key** is *not* an env var — it lives in the Apps Script
Script Properties (see below), never in the client bundle.

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

### 2. Stripe

The booking flow uses Stripe's **Payment Element** (embedded). Payment
Intents are created and verified by the Apps Script web app so the Stripe
secret key never reaches the browser.

1. Create a Stripe account at <https://stripe.com>.
2. In the Stripe Dashboard, note:
   - **Publishable key** (`pk_test_...`) → paste into
     `VITE_STRIPE_PUBLISHABLE_KEY`.
   - **Secret key** (`sk_test_...`) → open the Apps Script project
     (see step 1 above) → **File → Project Settings → Script Properties**
     → add property `STRIPE_SECRET_KEY` with the secret key as the value.
3. Configure the webhook so a paid booking still lands even if the
   customer closes their browser on Stripe's screen:
   - Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
   - URL: `<APPS_SCRIPT_WEB_APP_URL>?action=stripe-webhook`.
   - Events: `payment_intent.succeeded`.
4. Test cards. Only work while a `pk_test_...` / `sk_test_...` key pair
   is in use. For every card: **expiry** = any future date (e.g. `12/34`),
   **CVC** = any 3 digits (`123`), **ZIP** = any valid-looking value
   (`12345` or `SW1A 1AA`), **name** = anything.

   Happy path:

   | Card number           | Brand      | Outcome                                       |
   |-----------------------|------------|-----------------------------------------------|
   | `4242 4242 4242 4242` | Visa       | Immediate success                             |
   | `5555 5555 5555 4444` | Mastercard | Immediate success                             |
   | `3782 822463 10005`   | Amex       | Immediate success (4-digit CVC)               |

   3D Secure / SCA:

   | Card number           | Outcome                                                 |
   |-----------------------|---------------------------------------------------------|
   | `4000 0025 0000 3155` | 3DS challenge shown, redirect flow, approves            |
   | `4000 0027 6000 3184` | 3DS challenge shown, redirect flow, approves            |
   | `4000 0000 0000 3220` | 3DS required then **declined** after authentication     |

   Declines:

   | Card number           | Outcome                                              |
   |-----------------------|------------------------------------------------------|
   | `4000 0000 0000 0002` | Generic decline                                      |
   | `4000 0000 0000 9995` | `insufficient_funds`                                 |
   | `4000 0000 0000 9987` | `lost_card`                                          |
   | `4000 0000 0000 0069` | `expired_card`                                       |
   | `4000 0000 0000 0127` | `incorrect_cvc`                                      |
   | `4000 0000 0000 0119` | `processing_error` (good for retry UX testing)       |

   What to verify during QA:

   - **Success card** (`4242…`): modal shows the confirmation screen,
     a Google Calendar event appears on Sauda's calendar with the
     customer as a guest, and the customer receives both the Stripe
     receipt email and the Luzze confirmation email.
   - **3DS card** (`4000 0027 6000 3184`): the browser redirects to
     `hooks.stripe.com`, you complete the 3DS challenge, then land back
     on the site with `?payment_intent=…&redirect_status=succeeded` in
     the URL — the booking modal should reopen in the "Finalising" state
     and then the "Booking confirmed" state. The URL should be cleaned.
   - **Decline card** (`4000 0000 0000 0002`): modal stays on the
     payment step, shows the Stripe error message inline, and *no*
     calendar event is created.
   - **Idempotency**: pay with `4242…`, then in the Stripe Dashboard →
     the PaymentIntent → "Send test webhook" → `payment_intent.succeeded`.
     A second calendar event should **not** appear — the
     `finalized:<bookingId>` dedup key in Script Properties blocks it.

   Full reference: <https://docs.stripe.com/testing>

5. When going live: replace both keys with `pk_live_...` / `sk_live_...`
   and re-deploy the Apps Script (Deployments → Manage deployments →
   edit → **New version**).

### 3. EmailJS (contact form only)

1. Sign up at <https://www.emailjs.com/> and connect an email service
   (Gmail recommended — `sauda.luzze@gmail.com`).
2. Create one template:
   - **contact_form** — sent to Sauda. Variables: `{{from_name}}`,
     `{{from_email}}`, `{{message}}`. Hard-code "To Email" to
     `sauda.luzze@gmail.com`.
3. Copy the public key, service ID, and template ID into `.env`.

The booking confirmation email is sent server-side by the Apps Script
after Stripe confirms payment — you don't need an EmailJS template for it.

### 4. Images

Placeholder SVGs are committed in `public/images/`. To replace with real
photos, follow `public/images/README.md`.

### 5. GitHub Pages deploy

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

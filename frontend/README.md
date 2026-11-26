# Thadaw Rental - Frontend

Premium bike, scooty and car rental website for **Thadaw Rental**, Amarsingh Chowk, Pokhara, Nepal.
Frontend only, backend-ready. React + Vite + TypeScript + Tailwind + shadcn/ui-style components + React Router + Motion + React Hook Form + Zod + Zustand.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm test           # pricing engine tests (Vitest)
npm run build      # production build (build:strict also runs the type check first)
npm run preview
```

## Where to edit things

| What | File |
|---|---|
| Shop address, hours, notices | `src/config/shop.ts` |
| Phone and **WhatsApp number** | `.env` (`VITE_SHOP_PHONE`, `VITE_WHATSAPP_NUMBER`) |
| Base rates, off-road surcharge, **discount tiers**, car price (null = pending) | `src/config/pricing.ts` |
| Vehicles (sample listings, replace with real fleet) | `src/data/vehicles.ts` |
| Destinations, off-road flag, extra charge, `confirmed` | `src/data/destinations.ts` |
| FAQ, steps, pending policy list | `src/data/content.ts` |
| Pricing logic (pure functions, no React) | `src/lib/pricing.ts` |
| WhatsApp message builder | `src/lib/whatsapp.ts` |
| Booking API seam | `src/api/index.ts` and `src/api/endpoints.ts` (set `VITE_API_BASE_URL`) |

## Final-launch checklist

Prices are treated as final: base rates (scooty and bike रु. 1,000/day), the off-road surcharge (+ रु. 1,000/day) and the 5 / 8 / 12 / 18 % long-term discounts are live, and the four destinations (Mustang, Manang, Muktinath, Pokhara) are visible. Change any of it in **/admin** or in `src/config/pricing.ts` and `src/data/destinations.ts`.

Still to supply before you go live:

1. **WhatsApp / phone**: copy `.env.example` to `.env` and set `VITE_WHATSAPP_NUMBER` (and optionally `VITE_SHOP_PHONE`). Until then no WhatsApp link is generated (buttons copy the inquiry message) and the phone line is hidden. Opening hours are hidden until you set `openingHours` in `src/config/shop.ts`.
2. **Car price**: empty in Admin > Pricing, so car requests are custom quotations. Enter a rate there when you have one.
3. **Fleet and photos**: the vehicles are generic types and the images are generated illustrations (`npm run images`), not photographs. Replace them in Admin > Vehicles (image URLs) and `public/images`. The footer keeps a one-line note that images are illustrative; remove it once real photos are in.
4. **Admin and bookings need a backend** for real use (see the Admin section). Booking requests are only stored in the browser until `VITE_API_BASE_URL` is wired to an API.
5. **Map** searches by address; add a verified pin when you have one. The logo is a temporary text mark.

## Pricing rules

`days = return date - start date` (minimum 1). City: `rate x days`. Eligible off-road adventure: `(rate + surcharge + destination charge) x days`. Discount tier is chosen by day count. Ineligible vehicle/route, custom destination or missing rate -> custom quotation.

## Admin panel (frontend only)

Open `/admin` (a small "Staff" link is in the footer). Demo password comes from `VITE_ADMIN_DEMO_PASSWORD` in `.env` (source default: `thadaw-demo`).

- **Booking requests**: requests sent from the public form appear here. Set status to New / Confirmed / Declined / Completed.
- **Vehicles**: add, edit, delete, feature. Replace the sample listings and image URLs with real fleet data.
- **Destinations**: add, edit, hide/show and delete destinations (name, text, image, eligible categories, route info, off-road flag, extra per-day charge, custom-quote-only). After adding one, tick it on each eligible vehicle in Vehicles.
- **Pricing**: daily rates (empty = pending), off-road surcharge, discount tiers, "approved" flag, live preview.

`src/store/adminStore.ts` keeps all of this in the browser's localStorage and pushes edits into the public catalogue, so changes show on the public pages. **The login is client-side and not secure.** For production, replace the store actions and the login with a real backend and authentication (see `src/api/index.ts` and `src/api/remote.ts` for the API seam).


## Customer reviews (review link flow)

Only customers the shop sends a link to can write a review. No customer login is needed.

1. In Admin > Booking requests, set a booking to **Completed** when the vehicle is returned.
2. Click **Send review link**. WhatsApp opens to the customer's number with a message containing
   `/review?ref=<booking reference>&key=<secret>`. **Copy link** is there as a fallback.
3. The customer opens the link, rates the rental and writes a comment. The review is saved as **pending**.
4. In Admin > Reviews, **Approve** it. Approved reviews show on the home page, on that vehicle's page and as
   a star rating on its card, with a "Verified rental" badge.

Right now everything is stored in the browser (localStorage), so a link only works in the browser where the
booking exists. To make it real, set `VITE_API_BASE_URL` and implement these endpoints (see `src/api/contract.ts`).
**The server must enforce the rules; the browser checks are only for the demo.**

| Endpoint | Purpose |
| --- | --- |
| `POST /booking-requests/:id/review-key` (admin) | Only if status is `completed`. Create the key once (16+ random bytes, hex) and return `{ key }` every time. Store `reviewLinkSentAt`. |
| `GET /reviews/link?ref=&key=` | 404 if booking missing, not `completed`, or key differs. 409 if a review already exists for that booking. Otherwise `{ reference, vehicleSlug, vehicleName, customerName }`. |
| `POST /reviews` | Body `{ reference, key, name, rating (1-5), comment (10-600 chars) }`. Re-run the checks above, save as `pending`. |
| `GET /reviews` | Public: `approved` only, no booking reference. |
| `GET /reviews?scope=admin`, `PATCH /reviews/:id`, `DELETE /reviews/:id` | Admin only: list all, approve/reject, delete. |

Also rate-limit `GET /reviews/link` and `POST /reviews` per IP, and compare keys in constant time.


## Availability, uploads, calendar and export

- **Auto-blocked dates:** a booking set to *Confirmed* blocks its dates for that vehicle on the site (calendar, "Booked ..."
  note and the clash warning). Dates typed in the vehicle form still work for repairs or in-person bookings.
  Backend: `GET /availability` returns `{ "<vehicle-slug>": [{ "start": "2026-12-05", "end": "2026-12-08" }] }` for
  **confirmed** bookings only. Dates only, no customer details. Re-check for clashes when a booking is confirmed or created.
- **Photo upload (admin):** `POST /uploads` with multipart field `file`; respond `{ "url": "https://..." }`.
  Demo mode keeps shrunk photos inside the browser.
- **Admin > Calendar** shows all non-declined bookings by month. **Export CSV** on Booking requests exports the
  currently filtered list (spreadsheet formulas in customer text are neutralised).
- Original full-size PNGs are in `source-images/` (not served). The site uses the WebP copies in `public/images/`.


## Finding bikes by date

- The home page date bar sends visitors to `/bikes?from=YYYY-MM-DD&to=YYYY-MM-DD`. The same date bar is on every vehicle
  list page, and the dates stay in the URL when switching between Bikes, Scooties, Cars and Jeeps.
- With dates set, only vehicles that are free for the whole period are listed. A vehicle counts as booked when it clashes with
  a confirmed booking or with the blocked dates typed in Admin > Vehicles. "Also show booked" lists the rest greyed out.
- The chosen dates are remembered, so "Book this bike" opens the booking form with them already filled in.

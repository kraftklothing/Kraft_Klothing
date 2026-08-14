# Kraft Klothing

A peer-to-peer marketplace for renting clothing and one-time wear fashion.

## What's included (MVP)

- **Home page** — hero, featured items, how-it-works
- **Browse** — filter by category (gowns, cocktail, bridal, etc.)
- **Item detail** — photos, pricing, rental request form
- **List an item** — owners can submit listings (demo form)

## Getting started

You'll need [Node.js](https://nodejs.org/) (v18+) installed.

```bash
cd Kraft_Klothing
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**

## Next steps

When you're ready to go beyond the MVP:

1. **Database** — add Supabase or PostgreSQL for items, users, and bookings
2. **Auth** — sign up / login for renters and lenders
3. **Payments** — Stripe for rental fees and security deposits
4. **Image uploads** — Cloudinary or S3 for user-submitted photos
5. **Search & filters** — size, location, price range, availability calendar
6. **Messaging** — renter ↔ owner chat for pickup/shipping details

## Project structure

```
Kraft_Klothing/
├── app/              # Pages (home, browse, item detail, list)
├── components/       # UI components
├── lib/              # Types and sample data
└── public/           # Static assets
```

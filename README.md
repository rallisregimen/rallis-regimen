# Rallis Regimen

## Stack
- **Frontend/Backend**: Next.js (hosted on Vercel)
- **Database + Auth**: Supabase
- **Payments**: Stripe
- **AI**: Anthropic Claude (powers The Regimen chat + program generation)

---

## First-Time Setup

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/rallis-regimen.git
cd rallis-regimen
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env.local` and fill in your keys:
```bash
cp .env.example .env.local
```

Required keys:
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `STRIPE_SECRET_KEY` — from dashboard.stripe.com → Developers → API Keys
- `STRIPE_WEBHOOK_SECRET` — from Stripe webhook setup (see below)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from Stripe dashboard
- `STRIPE_MONTHLY_PRICE_ID` — create a $47/month recurring price in Stripe
- `STRIPE_ANNUAL_PRICE_ID` — create a $397/year recurring price in Stripe

Supabase keys are already pre-filled in `.env.example`.

### 3. Set up Supabase database
1. Go to supabase.com/dashboard/project/jehlppchjdjizacytpks
2. Click SQL Editor
3. Paste and run the contents of `schema.sql`

### 4. Set up Stripe products
1. Go to dashboard.stripe.com → Products → Add Product
2. Create "Rallis Regimen Monthly" — $47/month recurring
3. Copy the Price ID → paste as `STRIPE_MONTHLY_PRICE_ID`
4. Create "Rallis Regimen Annual" — $397/year recurring
5. Copy the Price ID → paste as `STRIPE_ANNUAL_PRICE_ID`

### 5. Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel

### First deploy
1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your GitHub repo
3. Add all environment variables from `.env.example` in Vercel's settings
4. Deploy

### Set up Stripe webhooks (after deploy)
1. Go to dashboard.stripe.com → Developers → Webhooks
2. Add endpoint: `https://www.rallisregimen.com/api/stripe-webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy the webhook signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

### Connect your domain
1. In Vercel project settings → Domains → Add `rallisregimen.com`
2. Follow Vercel's DNS instructions to point your domain

---

## Updating the App

### Adding new programs or exercises
Edit `lib/systemPrompt.js` — this is the knowledge base for The Regimen chat.
Add new exercise variations to the appropriate section (PULL, PUSH, or LOWER).
Commit and push — Vercel redeploys automatically in ~90 seconds.

### Updating the generation logic
Edit `pages/api/generate.js` — specifically the `GENERATION_PROMPT` function.
Add new program types, meal structures, or protocol variations here.

### Adding new intake questions
Edit `pages/intake.js` — add fields to the form.
Edit `schema.sql` — add corresponding columns to `intake_submissions` table.
Update `lib/systemPrompt.js` — reference the new fields in the member profile section.

---

## File Structure
```
rallis-regimen/
├── pages/
│   ├── index.js           Landing page
│   ├── join.js            Signup + Stripe checkout
│   ├── intake.js          Intake form (6 steps)
│   ├── dashboard.js       Member dashboard
│   └── api/
│       ├── chat.js        The Regimen chat (secure Anthropic call)
│       ├── generate.js    Program generation
│       ├── intake.js      Save intake to Supabase
│       ├── checkout.js    Create Stripe checkout session
│       └── stripe-webhook.js  Handle Stripe events
├── lib/
│   ├── systemPrompt.js    The Regimen's knowledge base (update this)
│   └── supabase.js        Supabase client
├── styles/
│   └── globals.css
├── schema.sql             Run this in Supabase SQL editor
├── .env.example           Copy to .env.local and fill in keys
└── README.md
```

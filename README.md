# YMM Parts Finder — Custom Shopify Private App

A full-stack Shopify embedded app built with **Remix + PostgreSQL**.

## Features
- Year / Make / Model vehicle selector (storefront widget)
- Product compatibility management (admin UI)
- Inventory view filtered by vehicle fitment
- Shopify Admin embedded app (OAuth, App Bridge)
- REST + Metafields sync for product compatibility data

---

## Stack
| Layer | Tech |
|---|---|
| Framework | Remix (Shopify CLI scaffold) |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | Shopify OAuth + Session storage |
| Storefront | Theme App Extension (vanilla JS widget) |
| Hosting | Fly.io / Railway / Render (any Node host) |

---

## Project Structure
```
ymm-shopify-app/
├── prisma/
│   └── schema.prisma          # DB schema
├── app/
│   ├── db.server.ts           # Prisma client
│   ├── shopify.server.ts      # Shopify auth config
│   ├── routes/
│   │   ├── app._index.tsx     # Admin dashboard
│   │   ├── app.compatibility.tsx  # Compatibility manager
│   │   ├── app.inventory.tsx  # Inventory by vehicle
│   │   └── api.ymm.tsx        # Public API for storefront
├── extensions/
│   └── ymm-widget/
│       ├── assets/
│       │   └── ymm.js         # Storefront widget JS
│       └── blocks/
│           └── ymm_selector.liquid  # Theme block
├── package.json
└── .env.example
```

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database (local or hosted)
- Shopify Partner account
- Shopify CLI: `npm install -g @shopify/cli`

### 2. Clone & Install
```bash
git clone <your-repo>
cd ymm-shopify-app
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in:
```bash
cp .env.example .env
```

### 4. Database Setup
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run Locally
```bash
shopify app dev
```

### 6. Deploy
```bash
shopify app deploy
```

---

## Storefront Widget Installation
After installing the app on your store:
1. Go to **Online Store → Themes → Customize**
2. Add the **YMM Parts Finder** block to any section
3. Configure display options in the block settings

# Car Spare Parts E-Commerce Platform — Developer Brief

## Project Overview

Build a full-stack car spare parts e-commerce platform for the **Egyptian market**. Customers select their car (brand, model, year), browse available spare parts, and order. Parts are imported from abroad — pricing is all-inclusive (shipping to door included in price).

**Live Mockup (reference for design/UX):** https://adam-mantaray.github.io/car-parts-store/
**Admin Mockup:** https://adam-mantaray.github.io/car-parts-store/admin/
**GitHub (mockup source):** https://github.com/adam-mantaray/car-parts-store

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | **Next.js 14+** (App Router) + **Tailwind CSS** |
| Backend | **Convex** (real-time database + serverless functions) |
| Auth | Phone OTP (via Resend) or Email/Password |
| Payments | **Paymob** (Egypt) + Cash on Delivery |
| Search | **Meilisearch** or Convex full-text search (must support Arabic) |
| Hosting | **Vercel** (frontend) + Convex (backend) |
| Analytics | **PostHog** |
| Image Storage | Convex file storage or S3 |

---

## Design Direction

The mockup uses a **"Premium E-Commerce"** design:
- **Dark theme**: #1c1c1e background + #c9a96e gold accents
- **Typography**: "Cairo" for Arabic (large, bold), "Inter" for English, "JetBrains Mono" for OEM numbers
- **Bilingual**: Arabic + English shown together on all pages
- **RTL-friendly** layout
- No emojis — use Font Awesome icons
- Smooth transitions, card hover effects

Follow the mockup closely for the production build.

---

## Core Features

### Customer-Facing

#### 1. Car Selector (Homepage)
- Cascading dropdowns: **Brand → Model → Year**
- Brands (Phase 1): BMW, Mercedes-Benz
- On selection → redirect to catalog page filtered for that car

#### 2. Parts Catalog
- Grid/list view of parts matching selected car
- **Filter by category** (19 categories — see below)
- **Search by**:
  - OEM part number (exact match)
  - Part name (Arabic or English)
  - Egyptian market name (e.g., searching "إكصدام" returns all bumpers)
- **Sort by**: price (low/high), name, newest
- Each part card shows: image, Arabic name, English name, OEM number (monospace), EGP price, availability badge

#### 3. Part Detail Page
- Large image (diagram or product photo)
- Part name: Arabic (large) + English (smaller)
- Egyptian market name
- OEM number + alternative OEM numbers
- Price in EGP (large, gold)
- Compatibility list (which car models/years fit)
- "Add to Cart" button
- Related/similar parts

#### 4. Cart & Checkout
- Cart with quantity adjustment
- Order summary in EGP
- **"السعر شامل التوصيل للباب"** (price includes door-to-door delivery) — must be prominent
- Checkout form: name, phone, city (Egyptian cities dropdown), area, address
- Payment: Paymob card payment + Cash on Delivery option
- Order confirmation page

#### 5. Customer Account
- Phone OTP login
- Order history with status tracking
- Saved cars (for quick part lookup)

### Admin Dashboard

#### 6. Dashboard Home
- Stats: total orders, revenue (EGP), total parts, current exchange rate
- Recent orders
- Charts: orders over time, revenue, top selling parts

#### 7. Parts Management
- CRUD for all parts
- Table view: OEM, name (AR/EN), category, USD price, EGP price (auto-calculated), stock status
- Bulk import from CSV/JSON
- Image upload

#### 8. Exchange Rate / Pricing Engine
- **Formula**: `EGP_PRICE = USD_PRICE × max(50, admin_rate)`
- Base rate is 50 EGP/USD (floor)
- Admin can set a custom rate — if it's higher than 50, the higher rate is used
- When rate changes, ALL EGP prices auto-recalculate
- Rate change preview: show before/after prices

#### 9. Orders Management
- Order list with status filters
- Status flow: `pending → confirmed → processing → shipped → delivered` (also `cancelled`)
- Update status (sends notification to customer)
- Order detail: items, customer info, shipping address

#### 10. Brands/Models Management
- CRUD for brands and models
- Add new car models and years as inventory expands

---

## Data Model (Convex Schema)

### `brands` table
```typescript
{
  nameEn: string,       // "Mercedes-Benz"
  nameAr: string,       // "مرسيدس بنز"
  slug: string,         // "mercedes-benz"
  logo: string,         // storage ID or URL
  catalogType: string,  // "epc" | "etka" | "cross"
  active: boolean,
}
```

### `models` table
```typescript
{
  brandId: Id<"brands">,
  nameEn: string,       // "C-Class"
  nameAr: string,       // "سي كلاس"
  chassis: string,      // "W205"
  bodyType: string,     // "sedan" | "suv" | "coupe"
  yearFrom: number,     // 2014
  yearTo: number,       // 2021
  image: string,
  active: boolean,
}
```

### `categories` table
```typescript
{
  slug: string,          // "front-bumper"
  nameEn: string,        // "Front Bumper"
  nameAr: string,        // "إكصدام أمامي"
  marketNameAr: string,  // "إكصدام" (Egyptian market slang)
  group: string,         // "body" | "lighting" | "cooling" | "brakes"
  icon: string,          // Font Awesome icon name
  sortOrder: number,
}
```

### `parts` table
```typescript
{
  oem: string,                    // "A2058800118" — primary key for search
  categoryId: Id<"categories">,
  brandId: Id<"brands">,
  compatibleModels: Id<"models">[], // which models this fits
  nameEn: string,                 // "Front Fender Left"
  nameAr: string,                 // "رفرف أمامي يسار"
  descriptionEn?: string,
  descriptionAr?: string,
  priceUsd: number,               // 180.00 — set by admin
  condition: string,              // "new" | "used" | "refurbished"
  origin: string,                 // "genuine" | "aftermarket" | "oem"
  weight?: string,
  diagramUrl?: string,            // from nemigaparts scraping
  images: string[],               // uploaded product photos
  alternativeOems: string[],      // cross-reference OEM numbers
  supersededBy?: string,          // if this OEM replaced by newer one
  inStock: boolean,
  leadTimeDays: number,           // typically 7-21 days
}
// Note: EGP price is NOT stored — always calculated: priceUsd × exchangeRate
```

### `settings` table
```typescript
{
  key: string,           // "exchange_rate" | "base_rate"
  value: number,         // 50 (base), or current admin rate
  updatedBy: string,
  updatedAt: number,
}
// Exchange rate logic: effectiveRate = max(settings.base_rate, settings.exchange_rate)
// EGP price = part.priceUsd × effectiveRate
```

### `orders` table
```typescript
{
  orderNumber: string,    // "ORD-2026-0001" (auto-generated)
  customerId: Id<"users">,
  items: Array<{
    partId: Id<"parts">,
    oem: string,
    nameAr: string,
    quantity: number,
    priceUsd: number,
    priceEgp: number,
  }>,
  subtotalEgp: number,
  exchangeRateUsed: number,  // snapshot at time of order
  status: string,            // "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    fullName: string,
    phone: string,
    city: string,
    area: string,
    address: string,
  },
  paymentMethod: string,     // "card" | "cod"
  paymentStatus: string,     // "pending" | "paid" | "refunded"
  notes?: string,
  createdAt: number,
  updatedAt: number,
}
```

### `users` table
```typescript
{
  name: string,
  phone: string,          // primary identifier
  email?: string,
  city?: string,
  savedCars: Array<{
    brandId: Id<"brands">,
    modelId: Id<"models">,
    year: number,
  }>,
  role: string,           // "customer" | "admin"
}
```

---

## The 19 Part Categories

| # | Slug | English | Arabic | Egyptian Market Name | Group |
|---|------|---------|--------|---------------------|-------|
| 1 | front-bumper | Front Bumper | إكصدام أمامي | إكصدام | body |
| 2 | rear-bumper | Rear Bumper | إكصدام خلفي | إكصدام | body |
| 3 | hood | Engine Hood (Bonnet) | كبوت | كبوت | body |
| 4 | front-fender | Front Fender | رفرف أمامي | رفرف | body |
| 5 | rear-fender | Rear Fender | رفرف خلفي | رفرف | body |
| 6 | headlamp | Headlamp | فانوس أمامي | فانوس | lighting |
| 7 | tail-light | Rear Light (Tail Light) | فانوس خلفي | فانوس | lighting |
| 8 | reflector | Reflector | عاكس | عاكس | lighting |
| 9 | turn-indicator | Turn Indicator | إشارة | إشارة | lighting |
| 10 | trunk-lid | Trunk Lid (Tailgate for SUV) | شنطة | شنطة | body |
| 11 | front-door | Front Door | باب أمامي | باب | body |
| 12 | rear-door | Rear Door | باب خلفي | باب | body |
| 13 | front-grille | Front Grille | شبكة أمامية | شبكة | body |
| 14 | side-mirror | Exterior Side Mirror | مرايا جانبية | مرايات | body |
| 15 | fog-lamp | Fog Lamp | فانوس شبورة | شبورة | lighting |
| 16 | transmission-cooler | Transmission Oil Cooler | مبرد فتيس | مبرد فتيس | cooling |
| 17 | engine-oil-cooler | Engine Oil Cooler | مبرد ماتور | مبرد ماتور | cooling |
| 18 | radiator | Radiator | ريداتير | ريداتير | cooling |
| 19 | brake-pads | Brake Pads | تيل فرامل | تيل | brakes |

---

## Data Source & Scraping

### Primary Data Source: nemigaparts.com

We built a scraper to extract real OEM part data from nemigaparts.com's parts catalogs.

#### What We Scraped
- **Mercedes-Benz** (EPC catalog): Successfully scraped body parts (group 88), lighting, cooling, brakes for W205 (C-Class)
- Extracted: **OEM part numbers**, **English part names**, **diagram images**, **some USD prices**
- Working scraper: `/nemiga-scraper/scraper.py` (Python, SQLite output)

#### How the Catalogs Work

**Mercedes EPC** (nemigaparts.com/cat_spares/epc/mercedes/):
```
Series (1-7) → Model (205=C-Class, 213=E-Class) → Variant (205002/c01) → Group (88=body) → Subgroup (015=fender) → Parts table
```
- Static HTML pages — scrape with requests + BeautifulSoup
- Parts in `<table class="technical">` elements
- OEM numbers: regex `[A-Z]?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3,4}[0-9]*`
- Diagram images: `http://nemigaparts.com/img/catalogs/epc/mb/bm/{hash}.png`
- Thumbnails: `http://nemigaparts.com/img/catalogs/epc/mb/bm_thumb/{hash}.png`

**ETKA Catalog** (Audi, VW, Skoda, Seat):
```
Brand → Model → Variant → Group (0-9) → Subgroup (6-digit code) → Parts table
```
- Also static HTML, same scraping approach
- Same table structure

**Cross Catalog** (Toyota, Hyundai, Kia, Nissan, BMW, etc.):
```
Brand → Model → Variant → Groups loaded via AJAX (JavaScript)
```
- **NOT SCRAPABLE** — the AJAX endpoint (`/querys/cross_tree_parts1.php`) returns 404
- Part group IDs and names ARE available in the HTML (e.g., `lookup_parts(10287,'Bumper/ Parts')`)
- Would need an alternative source for these brands

#### Relevant Group IDs (Cross Catalog — for future reference)
```
Bumper: 10287, 11749, 11806
Bonnet/Hood: 10284, 11754, 11883
Fender/Wing: 10285, 11750, 10265
Headlight: 10243, 11565, 11756
Tail Light: 11511, 11818
Indicator: 10245, 11520, 11769
Fog Light: 10377, 11441, 11761
Grille: 10291, 11775
Door: 10289, 11794
Mirror: 10666, 11798
Reflector: 10395, 14121
Radiator: 10202, 10203, 14165, 14166
Brake Pads: 10130, 14183
```

#### Data Gaps (Need Manual Entry or Alternative Sources)
- **BMW parts**: nemigaparts cross catalog is broken for BMW. Alternative: realoem.com (has diagrams + OEM numbers)
- **Product photos**: nemigaparts only has technical diagrams, not product photos. Will need supplier photos or stock images.
- **Egyptian Arabic names**: Mapped manually (see categories table). Search must support these market names.
- **USD prices**: Some available from scraping, but final prices come from the client's supplier pricing sheet.
- **Stock/availability**: Must be manually managed by admin.

#### Scraper Output
- SQLite database with tables: brands, models, variants, parts
- CSV export
- Resumable (tracks progress)
- Rate limited (1.5s between requests)
- Located at: `nemiga-scraper/scraper.py`

### Data Population Strategy
1. **Phase 1**: Seed database with scraped Mercedes data (~6000 parts)
2. **Phase 2**: Admin manually adds BMW parts (from realoem.com reference)
3. **Phase 3**: Admin adds pricing from supplier price lists
4. **Ongoing**: Admin adds new parts, adjusts prices, manages stock

---

## Pricing Model — Important

The pricing is designed to protect against currency fluctuation:

```
BASE_RATE = 50 EGP per 1 USD (this is the floor — never goes below this)
ADMIN_RATE = whatever the admin sets (can be higher than 50)
EFFECTIVE_RATE = max(BASE_RATE, ADMIN_RATE)

Customer sees: EGP_PRICE = PART_USD_PRICE × EFFECTIVE_RATE
```

**Key rules:**
- Admin sets **USD price** per part (this is the cost including their margin, shipping, customs — all baked in)
- Admin sets the **exchange rate** (typically tracks market rate)
- If market rate drops below 50, the system still uses 50 (protects margin)
- If market rate goes above 50, admin updates the rate and all prices auto-adjust
- Customer **ONLY sees EGP prices** — never sees USD
- **"السعر شامل التوصيل للباب"** — price includes shipping. No separate shipping fees.
- EGP price is **NOT stored in the database** — always calculated on-the-fly from USD price × effective rate

---

## Search Requirements

Search is critical — Egyptian customers search in different ways:

1. **OEM Number Search**: Exact match on `parts.oem` and `parts.alternativeOems`
2. **Arabic Name Search**: Full-text on `nameAr` — must handle Arabic properly
3. **Market Name Search**: Search `categories.marketNameAr` and return all parts in matching categories (e.g., "إكصدام" → all bumpers)
4. **English Name Search**: Full-text on `nameEn`
5. **Combined**: "BMW إكصدام" should find BMW bumpers

Recommend **Meilisearch** for Arabic full-text search with typo tolerance.

---

## Pages / Routes

### Customer
| Route | Page |
|-------|------|
| `/` | Homepage — car selector, featured parts |
| `/catalog?brand=X&model=Y&year=Z` | Parts catalog (filtered) |
| `/catalog` | All parts (no filter) |
| `/part/[oem]` | Part detail page |
| `/cart` | Shopping cart |
| `/checkout` | Checkout form + payment |
| `/order/[id]` | Order confirmation / tracking |
| `/account` | Customer account (orders, saved cars) |
| `/login` | Phone OTP login |

### Admin (`/admin/*`)
| Route | Page |
|-------|------|
| `/admin` | Dashboard (stats, charts) |
| `/admin/parts` | Parts management (CRUD table) |
| `/admin/parts/new` | Add new part |
| `/admin/parts/[id]` | Edit part |
| `/admin/pricing` | Exchange rate settings |
| `/admin/orders` | Orders list |
| `/admin/orders/[id]` | Order detail |
| `/admin/brands` | Brands/models management |
| `/admin/customers` | Customer list |

---

## Phase Roadmap

### Phase 1 — MVP (4-6 weeks)
- [ ] Next.js project setup + Tailwind + Convex
- [ ] Convex schema + seed data (Mercedes from scraper)
- [ ] Car selector (brand → model → year)
- [ ] Parts catalog with filters + search
- [ ] Part detail page
- [ ] Cart + checkout (COD only)
- [ ] Admin: parts CRUD + exchange rate
- [ ] Admin: orders management
- [ ] Basic auth (phone OTP)
- [ ] Deploy to Vercel + Convex production

### Phase 2 — Polish (2-3 weeks)
- [ ] Paymob card payment integration
- [ ] Meilisearch for Arabic search
- [ ] Customer accounts + saved cars
- [ ] BMW parts data population
- [ ] Product image upload for admin
- [ ] Email notifications (order confirmation, status updates)
- [ ] Mobile responsive optimization

### Phase 3 — Scale (2-3 weeks)
- [ ] Additional brands (if data sources found)
- [ ] Bulk CSV/JSON import for parts
- [ ] Analytics dashboard (PostHog)
- [ ] SEO optimization (Arabic + English)
- [ ] Performance optimization
- [ ] Inventory alerts (low stock notifications)

---

## Assets & References

| Asset | Location |
|-------|----------|
| Design mockup (live) | https://adam-mantaray.github.io/car-parts-store/ |
| Mockup source code | https://github.com/adam-mantaray/car-parts-store |
| Data structure doc | `/car-parts-mockup/data/DATA_STRUCTURE.md` |
| Scraper (Python) | `/nemiga-scraper/scraper.py` |
| Scraped data (SQLite) | `/nemiga-scraper/parts.db` |
| Scraped data (CSV) | `/nemiga-scraper/parts_export.csv` |

---

## Notes for Developer

1. **Arabic is first-class** — not an afterthought. Layout should work naturally with RTL text.
2. **Egyptian dialect** for market names — not MSA (Modern Standard Arabic). "إكصدام" not "مصد".
3. **Performance matters** — catalog pages may have 100+ parts. Use pagination or virtual scrolling.
4. **Convex real-time** — when admin changes exchange rate, customer prices should update in real-time (Convex reactivity handles this).
5. **No stored EGP prices** — always calculate from USD × rate. This ensures price consistency.
6. **OEM numbers are sacred** — display in monospace, make them copyable, searchable.
7. **Mobile first** — most Egyptian users browse on mobile.
8. **The mockup CSS/JS** can be referenced for component structure, color values, and layout ideas — but rebuild properly in Next.js + Tailwind.

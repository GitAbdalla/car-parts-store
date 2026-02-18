# Car Parts Store — Data Structure Context

## Overview
E-commerce platform for imported car spare parts targeting the Egyptian market.
BMW and Mercedes-Benz first, expandable to other brands.

---

## Core Entities

### 1. Brand
```json
{
  "id": "brand_001",
  "nameEn": "Mercedes-Benz",
  "nameAr": "مرسيدس بنز",
  "logo": "/img/brands/mercedes.svg",
  "catalogType": "epc",
  "active": true
}
```

### 2. Model
```json
{
  "id": "model_001",
  "brandId": "brand_001",
  "nameEn": "C-Class",
  "nameAr": "سي كلاس",
  "chassis": "W205",
  "bodyType": "sedan",
  "years": { "from": 2014, "to": 2021 },
  "image": "/img/models/w205.jpg",
  "active": true
}
```

### 3. Part Category
The 19 target categories with Egyptian market Arabic names:

```json
[
  { "id": "cat_01", "slug": "front-bumper",       "nameEn": "Front Bumper",              "nameAr": "إكصدام أمامي",    "marketNameAr": "إكصدام",     "group": "body" },
  { "id": "cat_02", "slug": "rear-bumper",        "nameEn": "Rear Bumper",               "nameAr": "إكصدام خلفي",     "marketNameAr": "إكصدام",     "group": "body" },
  { "id": "cat_03", "slug": "hood",               "nameEn": "Engine Hood (Bonnet)",       "nameAr": "كبوت",            "marketNameAr": "كبوت",       "group": "body" },
  { "id": "cat_04", "slug": "front-fender",       "nameEn": "Front Fender",              "nameAr": "رفرف أمامي",      "marketNameAr": "رفرف",       "group": "body" },
  { "id": "cat_05", "slug": "rear-fender",        "nameEn": "Rear Fender",               "nameAr": "رفرف خلفي",       "marketNameAr": "رفرف",       "group": "body" },
  { "id": "cat_06", "slug": "headlamp",           "nameEn": "Headlamp",                  "nameAr": "فانوس أمامي",     "marketNameAr": "فانوس",      "group": "lighting" },
  { "id": "cat_07", "slug": "tail-light",         "nameEn": "Rear Light (Tail Light)",    "nameAr": "فانوس خلفي",      "marketNameAr": "فانوس",      "group": "lighting" },
  { "id": "cat_08", "slug": "reflector",          "nameEn": "Reflector",                 "nameAr": "عاكس",            "marketNameAr": "عاكس",       "group": "lighting" },
  { "id": "cat_09", "slug": "turn-indicator",     "nameEn": "Turn Indicator",            "nameAr": "إشارة",           "marketNameAr": "إشارة",      "group": "lighting" },
  { "id": "cat_10", "slug": "trunk-lid",          "nameEn": "Trunk Lid",                 "nameAr": "شنطة",            "marketNameAr": "شنطة",       "group": "body" },
  { "id": "cat_11", "slug": "front-door",         "nameEn": "Front Door",                "nameAr": "باب أمامي",       "marketNameAr": "باب",        "group": "body" },
  { "id": "cat_12", "slug": "rear-door",          "nameEn": "Rear Door",                 "nameAr": "باب خلفي",        "marketNameAr": "باب",        "group": "body" },
  { "id": "cat_13", "slug": "front-grille",       "nameEn": "Front Grille",              "nameAr": "شبكة أمامية",     "marketNameAr": "شبكة",       "group": "body" },
  { "id": "cat_14", "slug": "side-mirror",        "nameEn": "Exterior Side Mirror",      "nameAr": "مرايا جانبية",    "marketNameAr": "مرايات",     "group": "body" },
  { "id": "cat_15", "slug": "fog-lamp",           "nameEn": "Fog Lamp",                  "nameAr": "فانوس شبورة",     "marketNameAr": "شبورة",      "group": "lighting" },
  { "id": "cat_16", "slug": "transmission-cooler","nameEn": "Transmission Oil Cooler",   "nameAr": "مبرد فتيس",       "marketNameAr": "مبرد فتيس",  "group": "cooling" },
  { "id": "cat_17", "slug": "engine-oil-cooler",  "nameEn": "Engine Oil Cooler",         "nameAr": "مبرد ماتور",      "marketNameAr": "مبرد ماتور", "group": "cooling" },
  { "id": "cat_18", "slug": "radiator",           "nameEn": "Radiator",                  "nameAr": "ريداتير",         "marketNameAr": "ريداتير",    "group": "cooling" },
  { "id": "cat_19", "slug": "brake-pads",         "nameEn": "Brake Pads",                "nameAr": "تيل فرامل",       "marketNameAr": "تيل",        "group": "brakes" }
]
```

### 4. Part (Product)
```json
{
  "id": "part_001",
  "oem": "A2058800118",
  "categoryId": "cat_04",
  "brandId": "brand_001",
  "compatibleModels": ["model_001", "model_002"],
  "nameEn": "Front Fender Left",
  "nameAr": "رفرف أمامي يسار",
  "descriptionEn": "Original replacement front fender, left side",
  "descriptionAr": "رفرف أمامي أصلي، جانب يسار",
  "priceUsd": 180.00,
  "priceEgp": 9000,
  "condition": "new",
  "origin": "genuine",
  "weight": "3.2kg",
  "diagramUrl": "https://nemigaparts.com/img/catalogs/epc/mb/bm/xxx.png",
  "thumbnailUrl": "https://nemigaparts.com/img/catalogs/epc/mb/bm_thumb/xxx.png",
  "images": [],
  "alternativeOems": ["2058800118", "A20588001189999"],
  "supersededBy": null,
  "inStock": true,
  "leadTimeDays": 14,
  "createdAt": "2026-02-18T00:00:00Z"
}
```

### 5. Order
```json
{
  "id": "order_001",
  "orderNumber": "ORD-2026-0001",
  "customerId": "cust_001",
  "items": [
    {
      "partId": "part_001",
      "quantity": 1,
      "priceUsd": 180.00,
      "priceEgp": 9000
    }
  ],
  "subtotalUsd": 180.00,
  "subtotalEgp": 9000,
  "exchangeRateUsed": 50,
  "status": "pending",
  "shippingAddress": {
    "fullName": "أحمد محمد",
    "phone": "+201012345678",
    "city": "القاهرة",
    "area": "مدينة نصر",
    "address": "شارع مصطفى النحاس، عمارة 15"
  },
  "notes": "",
  "createdAt": "2026-02-18T00:00:00Z",
  "updatedAt": "2026-02-18T00:00:00Z"
}
```

Order statuses: `pending` → `confirmed` → `processing` → `shipped` → `delivered` | `cancelled`

### 6. Customer
```json
{
  "id": "cust_001",
  "name": "أحمد محمد",
  "phone": "+201012345678",
  "email": "ahmed@example.com",
  "city": "القاهرة",
  "savedCars": [
    { "brandId": "brand_001", "modelId": "model_001", "year": 2018 }
  ],
  "orderCount": 3,
  "createdAt": "2026-02-18T00:00:00Z"
}
```

---

## Pricing Model

### Exchange Rate Logic
```
BASE_RATE = 50 EGP/USD (fixed floor)
MARKET_RATE = current market rate

EFFECTIVE_RATE = max(BASE_RATE, MARKET_RATE)
EGP_PRICE = USD_PRICE × EFFECTIVE_RATE
```

### Admin Controls
- Set USD price per part (sourced from supplier)
- Set custom exchange rate override
- System auto-uses max(50, custom_rate)
- All customer-facing prices in EGP
- "السعر شامل التوصيل للباب" (price includes door-to-door delivery)

### Price Breakdown (internal only, not shown to customer)
```
Part cost (USD)     → from supplier
Shipping (USD)      → baked into USD price
Customs/duties      → baked into USD price
Margin              → baked into USD price
Final USD price     → what admin sets
EGP price           → USD × effective_rate
```

---

## Category Groups

| Group     | Categories                                                        |
|-----------|-------------------------------------------------------------------|
| body      | bumper, hood, fender, trunk, door, grille, mirror                 |
| lighting  | headlamp, tail light, reflector, indicator, fog lamp              |
| cooling   | radiator, transmission cooler, engine oil cooler                  |
| brakes    | brake pads                                                        |

---

## Data Sources

### Scraped (nemigaparts.com)
- **Mercedes EPC**: W205 (C-Class), W213 (E-Class), X253 (GLC), W166/W167 (GLE)
- **BMW ETK**: Not available on nemigaparts (cross catalog API broken)
- **Available**: OEM numbers, part names (English), diagram images, some USD prices

### Manual Entry Required
- Egyptian Arabic market names (mapped above)
- USD supplier prices (from client's supplier)
- Stock status
- Lead times
- Product photos (beyond diagrams)

### Alternative Data Sources (for BMW + expansion)
- realoem.com (BMW/MINI parts diagrams)
- parts.bmw.com (official BMW)
- partsouq.com (Middle East focused)

---

## Search & Discovery

### Primary Flow
1. Select Brand → Model → Year
2. Browse categories (19 listed)
3. View parts grid with filters
4. Part detail → Add to cart

### Secondary Flow
- Search by OEM part number (exact match)
- Search by part name (Arabic or English)
- Search by Egyptian market name (e.g., "إكصدام" finds all bumpers)

---

## Tech Stack (Production — future)

| Layer       | Suggestion                                  |
|-------------|---------------------------------------------|
| Frontend    | Next.js + Tailwind CSS                      |
| Backend     | Node.js / Convex                            |
| Database    | PostgreSQL or Convex                        |
| Search      | Algolia or Meilisearch (Arabic support)     |
| Payments    | Paymob (Egypt) / Cash on delivery           |
| Hosting     | Vercel / AWS                                |
| Admin       | Custom dashboard                            |
| Analytics   | PostHog                                     |

---

## Mockup vs Production

| Feature              | Mockup (current)       | Production (future)    |
|----------------------|------------------------|------------------------|
| Data                 | Static JSON in JS      | Database + API         |
| Auth                 | None                   | Phone OTP / Email      |
| Payments             | Fake checkout          | Paymob / COD           |
| Search               | JS filter              | Algolia / Meilisearch  |
| Images               | Diagrams + placeholders| Real product photos    |
| Arabic translations  | Hardcoded              | CMS / Admin editable   |
| Exchange rate        | localStorage           | Database + admin API   |
| Orders               | localStorage           | Full order system      |

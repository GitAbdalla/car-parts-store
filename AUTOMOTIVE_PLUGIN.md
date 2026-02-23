# Automotive Plugin Implementation Guide

This document is a complete implementation spec for adding plugin support to the
`@mantaray-digital/store-sdk` and building the `@mantaray-digital/plugin-automotive`
package. It is written for the developer (or Claude) working in the SDK repo.

---

## Overview

We are adding a **plugin system** to the Mantaray SDK so that vertical-specific
features (automotive fitment, OEM search, exchange rate pricing) can be shipped
as separate npm packages without touching the core SDK or affecting existing stores.

Two things need to be built:

1. **Plugin interface in the SDK core** — `@mantaray-digital/store-sdk`
2. **The automotive plugin package** — `@mantaray-digital/plugin-automotive`

And two things need to be added to the **Convex backend**:

3. **New Convex tables** — vehicle brands, vehicle models, product fitment
4. **New Convex query/mutation functions** — fitment, OEM search, exchange rate

---

## Part 1 — SDK Core Changes (`store-sdk` repo)

### 1.1 Define the Plugin Interface

Create `src/types/plugin.ts`:

```typescript
import type { MantarayStore } from '../store'

export interface MantarayPlugin {
  name: string
  install(store: MantarayStore): void
}
```

### 1.2 Update `MantarayStore` Constructor

Update the store's options type and constructor to accept plugins:

```typescript
export interface MantarayStoreOptions {
  apiKey?: string
  convexUrl?: string
  plugins?: MantarayPlugin[]   // ← new
}

export class MantarayStore {
  constructor(options?: MantarayStoreOptions) {
    // ...existing initialization (apiKey, convexUrl, modules)...

    // Run plugins last, after all built-in modules are initialized
    options?.plugins?.forEach(plugin => plugin.install(this))
  }

  /**
   * Called by plugins to attach a new named module to the store.
   * Example: plugin calls store.extend('fitment', fitmentModule)
   * Then users can call store.fitment.getBrands()
   */
  extend<T>(moduleName: string, module: T): void {
    (this as any)[moduleName] = module
  }
}
```

### 1.3 Export the Plugin Type

In `src/index.ts`, add to the existing exports:

```typescript
export type { MantarayPlugin } from './types/plugin'
```

### 1.4 Versioning

Bump the package version to the next **minor** version (e.g. `1.0.0` → `1.1.0`).
This is backward-compatible. Existing projects are completely unaffected — the
`plugins` option is optional and defaults to nothing.

---

## Part 2 — Convex Backend Changes

These changes go in the **Mantaray Convex backend** deployment. All new tables
and fields are optional — existing stores that don't use the automotive plugin
will simply never populate them.

### 2.1 New Tables to Add to the Convex Schema

```typescript
// Vehicle brands (BMW, Mercedes-Benz, etc.)
vehicle_brands: defineTable({
  nameEn:      v.string(),            // "Mercedes-Benz"
  nameAr:      v.string(),            // "مرسيدس بنز"
  slug:        v.string(),            // "mercedes-benz"
  logo:        v.optional(v.string()),
  catalogType: v.optional(v.string()),// "epc" | "etka" | "cross" — which nemigaparts catalog
  active:      v.boolean(),
}).index('by_slug', ['slug']),

// Vehicle models (C-Class W205, E-Class W213, etc.)
vehicle_models: defineTable({
  brandId:   v.id('vehicle_brands'),
  nameEn:    v.string(),   // "C-Class"
  nameAr:    v.string(),   // "سي كلاس"
  chassis:   v.string(),   // "W205"
  bodyType:  v.string(),   // "sedan" | "suv" | "coupe" | "hatchback"
  yearFrom:  v.number(),   // 2014
  yearTo:    v.number(),   // 2021
  image:     v.optional(v.string()),
  active:    v.boolean(),
}).index('by_brand', ['brandId']),

// Maps products to compatible vehicle models
product_fitment: defineTable({
  productId: v.id('products'),
  modelId:   v.id('vehicle_models'),
  yearFrom:  v.optional(v.number()),  // narrow year range within model's range
  yearTo:    v.optional(v.number()),
}).index('by_product',       ['productId'])
 .index('by_model',         ['modelId'])
 .index('by_model_product', ['modelId', 'productId']),
```

### 2.2 Add Optional Fields to Existing `products` Table

These fields extend the existing product schema. They are all optional so no
existing product records break:

```typescript
// Add to the existing products table definition:
oemNumber:       v.optional(v.string()),   // "A2058800118" — primary OEM
alternativeOems: v.optional(v.array(v.string())),  // cross-reference OEMs
supersededBy:    v.optional(v.string()),   // newer OEM number if discontinued
condition:       v.optional(v.string()),   // "new" | "used" | "refurbished"
origin:          v.optional(v.string()),   // "genuine" | "aftermarket" | "oem"
leadTimeDays:    v.optional(v.number()),   // estimated import time (7–21 days)
diagramUrl:      v.optional(v.string()),   // full technical diagram from nemigaparts
thumbnailUrl:    v.optional(v.string()),   // thumbnail version (nemigaparts bm_thumb path)
weight:          v.optional(v.string()),   // e.g. "3.2kg"
scraped:         v.optional(v.boolean()),  // true = auto-scraped, false = manually entered
sourceUrl:       v.optional(v.string()),   // reference URL e.g. nemigaparts part page

// IMPORTANT — null price handling:
// priceUsd can be null for scraped parts where price wasn't available.
// Store as v.optional(v.number()) and treat null as "price on request".
// The storefront should show "اتصل للسعر" when priceUsd is null/missing.
// Never attempt to calculate EGP price if priceUsd is null.

// Add search indexes:
// .index('by_oem', ['oemNumber'])
// .searchIndex('search_oem', { searchField: 'oemNumber' })
// .searchIndex('search_name_ar', { searchField: 'nameAr' })
// .searchIndex('search_name_en', { searchField: 'name' })
```

### 2.3 Add Optional Fields to Existing `categories` Table

```typescript
// Add to the existing categories table definition:
slug:         v.optional(v.string()),  // "front-bumper" — used in URL routing
marketNameAr: v.optional(v.string()),  // Egyptian market slang, e.g. "إكصدام"
group:        v.optional(v.string()),  // "body" | "lighting" | "cooling" | "brakes"
icon:         v.optional(v.string()),  // Font Awesome class, e.g. "fa-car", "fa-lightbulb"
                                       // REQUIRED for the storefront category grid UI
```

The 15 categories used in the mockup with their icons (reference for seeding):

| slug | nameAr | marketNameAr | group | icon |
|------|--------|-------------|-------|------|
| front-bumper | اكصدام امامي | اكصدام | body | fa-car |
| rear-bumper | اكصدام خلفي | اكصدام | body | fa-car-rear |
| fender | رفرف | رفرف | body | fa-shield-halved |
| hood | كبوت | كبوت | body | fa-car-on |
| trunk | شنطة | شنطة | body | fa-box |
| door | باب | باب | body | fa-door-open |
| headlamp | فانوس امامي | فانوس | lighting | fa-lightbulb |
| tail-light | فانوس خلفي | فانوس | lighting | fa-circle-half-stroke |
| fog-lamp | فانوس شبورة | شبورة | lighting | fa-smog |
| side-mirror | مرايا جانبية | مرايات | body | fa-clone |
| front-grille | شبكة امامية | شبكة | body | fa-grip |
| radiator | ريداتير | ريداتير | cooling | fa-temperature-high |
| engine-oil-cooler | مبرد ماتور | مبرد ماتور | cooling | fa-droplet |
| brake-pads | تيل فرامل | تيل | brakes | fa-circle-stop |
| turn-indicator | اشارة | اشارة | lighting | fa-arrow-right |

### 2.4 Exchange Rate — Use Existing `settings` Table + New History Table

Add these keys to the existing `settings` table:

| key | value type | description |
|-----|-----------|-------------|
| `automotive_exchange_rate` | number | Admin-set rate (e.g. 52.5) |
| `automotive_min_rate` | number | Floor rate — never go below this (default: 50) |
| `automotive_base_currency` | string | "USD" |
| `automotive_display_currency` | string | "EGP" |

Seed these defaults when a store first enables the automotive plugin.

**Also add a new `exchange_rate_log` table** — the admin pricing page shows a history
of all rate changes with dates and % change. This is shown in the admin UI:

```typescript
exchange_rate_log: defineTable({
  storeId:   v.id('stores'),
  rate:      v.number(),        // the rate that was set
  setBy:     v.string(),        // admin user id or name
  createdAt: v.number(),        // timestamp
}).index('by_store', ['storeId']),
```

When `setExchangeRate` is called, insert a new row here automatically so the
admin can see the full rate history with percentage change over time.

### 2.5 New Convex Query Functions to Add

Create these in the Convex functions directory. Suggested file structure:

```
convex/
  fitment/
    queries.ts
    mutations.ts
  automotive/
    pricing.ts
    oemSearch.ts
```

#### `fitment/queries.ts`

```typescript
// Get all active vehicle brands for a store
export const getBrands = query({
  args: { apiKey: v.string() },
  handler: async (ctx, { apiKey }) => {
    const store = await validateApiKey(ctx, apiKey)
    return ctx.db
      .query('vehicle_brands')
      .filter(q => q.eq(q.field('storeId'), store._id))
      .filter(q => q.eq(q.field('active'), true))
      .collect()
  }
})

// Get all active models for a brand
export const getModels = query({
  args: { apiKey: v.string(), brandId: v.id('vehicle_brands') },
  handler: async (ctx, { apiKey, brandId }) => {
    const store = await validateApiKey(ctx, apiKey)
    return ctx.db
      .query('vehicle_models')
      .withIndex('by_brand', q => q.eq('brandId', brandId))
      .filter(q => q.eq(q.field('active'), true))
      .collect()
  }
})

// Get products compatible with a specific model and year
export const getProductsByVehicle = query({
  args: {
    apiKey:      v.string(),
    modelId:     v.id('vehicle_models'),
    year:        v.optional(v.number()),
    categoryId:  v.optional(v.string()),
    sortBy:      v.optional(v.string()),
    limit:       v.optional(v.number()),
    cursor:      v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const store = await validateApiKey(ctx, args.apiKey)

    // Get all fitment records for this model
    let fitmentQuery = ctx.db
      .query('product_fitment')
      .withIndex('by_model', q => q.eq('modelId', args.modelId))

    const fitmentRecords = await fitmentQuery.collect()

    // Filter by year if provided
    const filtered = args.year
      ? fitmentRecords.filter(f => {
          const from = f.yearFrom ?? 0
          const to   = f.yearTo   ?? 9999
          return args.year >= from && args.year <= to
        })
      : fitmentRecords

    const productIds = filtered.map(f => f.productId)

    // Fetch the actual products
    const products = await Promise.all(
      productIds.map(id => ctx.db.get(id))
    )

    // Apply category filter if provided
    const result = args.categoryId
      ? products.filter(p => p?.categoryId === args.categoryId)
      : products

    return result.filter(Boolean)
  }
})
```

#### `fitment/mutations.ts`

```typescript
// Admin: create a vehicle brand
export const createBrand = mutation({
  args: {
    apiKey: v.string(),
    nameEn: v.string(),
    nameAr: v.string(),
    slug:   v.string(),
    logo:   v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAdminApiKey(ctx, args.apiKey)
    return ctx.db.insert('vehicle_brands', {
      nameEn: args.nameEn,
      nameAr: args.nameAr,
      slug:   args.slug,
      logo:   args.logo,
      active: true,
    })
  }
})

// Admin: create a vehicle model
export const createModel = mutation({
  args: {
    apiKey:    v.string(),
    brandId:   v.id('vehicle_brands'),
    nameEn:    v.string(),
    nameAr:    v.string(),
    chassis:   v.string(),
    bodyType:  v.string(),
    yearFrom:  v.number(),
    yearTo:    v.number(),
    image:     v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAdminApiKey(ctx, args.apiKey)
    const { apiKey, ...data } = args
    return ctx.db.insert('vehicle_models', { ...data, active: true })
  }
})

// Admin: link a product to a vehicle model
export const addFitment = mutation({
  args: {
    apiKey:    v.string(),
    productId: v.id('products'),
    modelId:   v.id('vehicle_models'),
    yearFrom:  v.optional(v.number()),
    yearTo:    v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await validateAdminApiKey(ctx, args.apiKey)
    const { apiKey, ...data } = args
    return ctx.db.insert('product_fitment', data)
  }
})

// Admin: remove a fitment link
export const removeFitment = mutation({
  args: { apiKey: v.string(), fitmentId: v.id('product_fitment') },
  handler: async (ctx, { apiKey, fitmentId }) => {
    await validateAdminApiKey(ctx, apiKey)
    await ctx.db.delete(fitmentId)
  }
})
```

#### `automotive/pricing.ts`

```typescript
// Get the current exchange rate config for this store
export const getExchangeRate = query({
  args: { apiKey: v.string() },
  handler: async (ctx, { apiKey }) => {
    const store = await validateApiKey(ctx, apiKey)

    const rateSetting    = await getStoreSetting(ctx, store._id, 'automotive_exchange_rate')
    const minRateSetting = await getStoreSetting(ctx, store._id, 'automotive_min_rate')
    const baseCurrency   = await getStoreSetting(ctx, store._id, 'automotive_base_currency')
    const displayCurrency = await getStoreSetting(ctx, store._id, 'automotive_display_currency')

    const rate    = rateSetting?.value    ?? 50
    const minRate = minRateSetting?.value ?? 50

    return {
      rate:            rate,
      minRate:         minRate,
      effectiveRate:   Math.max(rate, minRate),  // the rate actually applied
      baseCurrency:    baseCurrency?.value    ?? 'USD',
      displayCurrency: displayCurrency?.value ?? 'EGP',
    }
  }
})

// Admin: update the exchange rate — also logs the change to exchange_rate_log
export const setExchangeRate = mutation({
  args: { apiKey: v.string(), rate: v.number() },
  handler: async (ctx, { apiKey, rate }) => {
    const admin = await validateAdminApiKey(ctx, apiKey)
    await upsertStoreSetting(ctx, 'automotive_exchange_rate', rate)
    // Log the change for history display in admin pricing page
    await ctx.db.insert('exchange_rate_log', {
      storeId:   admin.storeId,
      rate:      rate,
      setBy:     admin.userId,
      createdAt: Date.now(),
    })
  }
})

// Admin: get rate change history (for the admin pricing page history table)
export const getExchangeRateHistory = query({
  args: { apiKey: v.string() },
  handler: async (ctx, { apiKey }) => {
    const admin = await validateAdminApiKey(ctx, apiKey)
    return ctx.db
      .query('exchange_rate_log')
      .withIndex('by_store', q => q.eq('storeId', admin.storeId))
      .order('desc')
      .take(20)
  }
})
```

#### `automotive/oemSearch.ts`

```typescript
// Search products by OEM number, alternative OEMs, Egyptian market name, or part name.
//
// SEARCH PRIORITY:
//  1. Exact OEM number match (primary oemNumber field)
//  2. Alternative OEM match (alternativeOemsText — denormalized join of alternativeOems)
//  3. Egyptian market name match (categories.marketNameAr → all parts in that category)
//     e.g. "إكصدام" → finds bumper category → returns ALL bumper parts
//  4. Arabic name full-text search (nameAr)
//  5. English name full-text search (name)
//
// NOTE: Add 'alternativeOemsText' as an optional string field on products:
//   alternativeOemsText: v.optional(v.string())
//   = alternativeOems.join(' ') — kept in sync whenever alternativeOems is updated.
//   This allows Convex search index to find parts by alternative OEM numbers.

export const searchByOem = query({
  args: {
    apiKey: v.string(),
    query:  v.string(),
  },
  handler: async (ctx, { apiKey, query }) => {
    const store = await validateApiKey(ctx, apiKey)
    const q = query.trim()
    const seen = new Set<string>()
    const combined: any[] = []

    const push = (products: any[]) => {
      for (const p of products) {
        if (p && !seen.has(p._id)) { combined.push(p); seen.add(p._id) }
      }
    }

    // 1. Exact match on primary OEM — return immediately if found
    const exactOem = await ctx.db
      .query('products')
      .withIndex('by_oem', qb => qb.eq('oemNumber', q))
      .filter(qb => qb.eq(qb.field('storeId'), store._id))
      .collect()
    push(exactOem)
    if (combined.length > 0) return combined

    // 2. Alternative OEM match via denormalized text field
    const altMatches = await ctx.db
      .query('products')
      .withSearchIndex('search_alt_oem', qb =>
        qb.search('alternativeOemsText', q).eq('storeId', store._id)
      )
      .take(10)
    push(altMatches)
    if (combined.length > 0) return combined

    // 3. Egyptian market name → category → all parts in that category
    //    This is the PRIMARY Arabic discovery path for Egyptian customers
    const matchingCategories = await ctx.db
      .query('categories')
      .filter(qb =>
        qb.and(
          qb.eq(qb.field('storeId'), store._id),
          qb.eq(qb.field('marketNameAr'), q)
        )
      )
      .collect()

    if (matchingCategories.length > 0) {
      const catProducts = await Promise.all(
        matchingCategories.map(cat =>
          ctx.db
            .query('products')
            .filter(qb =>
              qb.and(
                qb.eq(qb.field('storeId'), store._id),
                qb.eq(qb.field('categoryId'), cat._id)
              )
            )
            .take(50)
        )
      )
      push(catProducts.flat())
      if (combined.length > 0) return combined
    }

    // 4 & 5. Full-text search on Arabic and English names
    const [arMatches, enMatches] = await Promise.all([
      ctx.db
        .query('products')
        .withSearchIndex('search_name_ar', qb =>
          qb.search('nameAr', q).eq('storeId', store._id)
        )
        .take(20),
      ctx.db
        .query('products')
        .withSearchIndex('search_name_en', qb =>
          qb.search('name', q).eq('storeId', store._id)
        )
        .take(20),
    ])
    push(arMatches)
    push(enMatches)

    return combined
  }
})
```

---

## Part 3 — Build the Plugin Package (`plugin-automotive` repo)

Create a **new repository** published as `@mantaray-digital/plugin-automotive`.

### 3.1 Package Structure

```
plugin-automotive/
  src/
    index.ts          ← main export: AutomotivePlugin + types
    modules/
      fitment.ts      ← store.fitment module
      pricing.ts      ← store.pricing module
      oem.ts          ← store.oem module
    types.ts          ← all TypeScript types
  package.json
  tsconfig.json
  README.md
```

### 3.2 `package.json`

```json
{
  "name": "@mantaray-digital/plugin-automotive",
  "version": "1.0.0",
  "description": "Automotive plugin for Mantaray Store SDK — vehicle fitment, OEM search, exchange rate pricing",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@mantaray-digital/store-sdk": ">=1.1.0"
  }
}
```

### 3.3 `src/types.ts`

```typescript
export interface VehicleBrand {
  _id:    string
  nameEn: string
  nameAr: string
  slug:   string
  logo?:  string
  active: boolean
}

export interface VehicleModel {
  _id:      string
  brandId:  string
  nameEn:   string
  nameAr:   string
  chassis:  string       // "W205"
  bodyType: string       // "sedan" | "suv" | "coupe"
  yearFrom: number
  yearTo:   number
  image?:   string
  active:   boolean
}

export interface ExchangeRate {
  rate:            number   // admin-set rate
  minRate:         number   // floor (50 EGP/USD)
  effectiveRate:   number   // max(rate, minRate) — use this for pricing
  baseCurrency:    string   // "USD"
  displayCurrency: string   // "EGP"
}

export interface OemSearchResult {
  _id:             string
  oemNumber?:      string
  alternativeOems?: string[]
  name:            string
  nameAr?:         string
  basePrice:       number   // USD price
  images:          string[]
  categoryId?:     string
}

export interface FitmentFilter {
  modelId:     string
  year?:       number
  categoryId?: string
  group?:      'body' | 'lighting' | 'cooling' | 'brakes'  // filter by category group
}

export interface SavedCar {
  brandId: string
  modelId: string
  year:    number
}

/**
 * Egyptian-specific shipping address format.
 * Replaces the SDK's generic ShippingAddress for this storefront.
 * Note: no postalCode — Egypt doesn't use postal codes in practice.
 */
export interface EgyptianShippingAddress {
  fullName: string    // الاسم بالكامل
  phone:    string    // رقم الموبايل (Egyptian mobile, starts with 010/011/012/015)
  city:     string    // المحافظة — must be one of EGYPTIAN_GOVERNORATES
  area:     string    // المنطقة / الحي — neighborhood within the city
  address:  string    // العنوان بالتفصيل — street, building, apartment
  notes?:   string    // ملاحظات — optional delivery notes
}
```

### 3.4 `src/modules/fitment.ts`

```typescript
import type { MantarayStore } from '@mantaray-digital/store-sdk'
import type { VehicleBrand, VehicleModel, FitmentFilter } from '../types'

export class FitmentModule {
  constructor(private store: MantarayStore) {}

  async getBrands(): Promise<VehicleBrand[]> {
    return this.store['_client'].query('fitment:getBrands', {
      apiKey: this.store['_apiKey']
    })
  }

  async getModels(brandId: string): Promise<VehicleModel[]> {
    return this.store['_client'].query('fitment:getModels', {
      apiKey: this.store['_apiKey'],
      brandId,
    })
  }

  /**
   * Get unique years available for a model.
   * Derived from model.yearFrom and model.yearTo — no separate query needed.
   */
  getYears(model: VehicleModel): number[] {
    const years: number[] = []
    for (let y = model.yearFrom; y <= model.yearTo; y++) {
      years.push(y)
    }
    return years
  }

  async getProducts(filter: FitmentFilter) {
    return this.store['_client'].query('fitment:getProductsByVehicle', {
      apiKey:     this.store['_apiKey'],
      modelId:    filter.modelId,
      year:       filter.year,
      categoryId: filter.categoryId,
    })
  }

  /**
   * Saved cars — customers save their car (brand + model + year) for quick lookup.
   * Stored on the customer profile. Requires customer to be logged in.
   */
  async getSavedCars(): Promise<SavedCar[]> {
    return this.store['_client'].query('fitment:getSavedCars', {
      apiKey: this.store['_apiKey'],
    })
  }

  async saveCar(car: SavedCar): Promise<void> {
    return this.store['_client'].mutation('fitment:saveCar', {
      apiKey:  this.store['_apiKey'],
      brandId: car.brandId,
      modelId: car.modelId,
      year:    car.year,
    })
  }

  async removeSavedCar(carIndex: number): Promise<void> {
    return this.store['_client'].mutation('fitment:removeSavedCar', {
      apiKey:     this.store['_apiKey'],
      carIndex,
    })
  }
}
```

### 3.5 `src/modules/pricing.ts`

```typescript
import type { MantarayStore } from '@mantaray-digital/store-sdk'
import type { ExchangeRate } from '../types'

export class PricingModule {
  private _rate: ExchangeRate | null = null

  constructor(private store: MantarayStore) {}

  async getRate(): Promise<ExchangeRate> {
    const rate = await this.store['_client'].query('automotive:getExchangeRate', {
      apiKey: this.store['_apiKey']
    })
    this._rate = rate
    return rate
  }

  /**
   * Convert USD price to display currency (EGP).
   * Uses effectiveRate = max(adminRate, minRate).
   * Call getRate() at app initialization before using this.
   */
  toDisplayPrice(usdAmount: number): number {
    if (!this._rate) {
      throw new Error('[AutomotivePlugin] Call store.pricing.getRate() before toDisplayPrice()')
    }
    return Math.round(usdAmount * this._rate.effectiveRate)
  }

  /**
   * Format price for display to Egyptian customers.
   * Returns e.g. "٢٥٠٠ ج.م" or "2500 EGP"
   */
  formatPrice(usdAmount: number, locale: 'ar' | 'en' = 'ar'): string {
    const egp = this.toDisplayPrice(usdAmount)
    if (locale === 'ar') {
      return `${egp.toLocaleString('ar-EG')} ج.م`
    }
    return `${egp.toLocaleString('en-EG')} EGP`
  }
}
```

### 3.6 `src/modules/oem.ts`

```typescript
import type { MantarayStore } from '@mantaray-digital/store-sdk'
import type { OemSearchResult } from '../types'

export class OemModule {
  constructor(private store: MantarayStore) {}

  /**
   * Search by OEM number or part name (Arabic or English).
   * - If query looks like an OEM number: exact match first
   * - Otherwise: full-text name search
   */
  async search(query: string): Promise<OemSearchResult[]> {
    return this.store['_client'].query('automotive:searchByOem', {
      apiKey: this.store['_apiKey'],
      query,
    })
  }
}
```

### 3.7 `src/index.ts` — The Plugin Entry Point

```typescript
import type { MantarayPlugin, MantarayStore } from '@mantaray-digital/store-sdk'
import { FitmentModule } from './modules/fitment'
import { PricingModule } from './modules/pricing'
import { OemModule }     from './modules/oem'

export const AutomotivePlugin: MantarayPlugin = {
  name: 'automotive',

  install(store: MantarayStore) {
    store.extend('fitment', new FitmentModule(store))
    store.extend('pricing', new PricingModule(store))
    store.extend('oem',     new OemModule(store))
  }
}

// Re-export all types so storefront can import from one place
export type {
  VehicleBrand,
  VehicleModel,
  ExchangeRate,
  OemSearchResult,
  FitmentFilter,
  SavedCar,
  EgyptianShippingAddress,
} from './types'

// Re-export constants
export { EGYPTIAN_GOVERNORATES } from './constants'
export type { EgyptianGovernorate } from './constants'
```

### 3.8 TypeScript Augmentation (optional but recommended)

Add a declaration file so TypeScript knows about the new modules on the store:

```typescript
// src/augment.ts
import type { MantarayStore } from '@mantaray-digital/store-sdk'
import type { FitmentModule }  from './modules/fitment'
import type { PricingModule }  from './modules/pricing'
import type { OemModule }      from './modules/oem'

declare module '@mantaray-digital/store-sdk' {
  interface MantarayStore {
    fitment: FitmentModule
    pricing: PricingModule
    oem:     OemModule
  }
}
```

Export this from `src/index.ts` so it is automatically applied when the plugin is imported.

---

## Part 4 — How the Car Parts Storefront Will Use This

This section is **for reference only** — no action needed in the SDK repos.
The storefront developer will use the final packages as follows:

### Installation

```bash
npm install @mantaray-digital/store-sdk @mantaray-digital/plugin-automotive
```

### Initialization (once, in `lib/store.ts`)

```typescript
import { MantarayStore }    from '@mantaray-digital/store-sdk'
import { AutomotivePlugin } from '@mantaray-digital/plugin-automotive'

export const store = new MantarayStore({
  plugins: [AutomotivePlugin]
})

// Initialize pricing at app startup (fetches exchange rate once)
export async function initStore() {
  await store.pricing.getRate()
}
```

### Car Selector Page

```typescript
const brands = await store.fitment.getBrands()
// → [{ _id, nameEn: "Mercedes-Benz", nameAr: "مرسيدس بنز", slug, ... }]

const models = await store.fitment.getModels(selectedBrandId)
// → [{ _id, nameEn: "C-Class", nameAr: "سي كلاس", chassis: "W205", yearFrom: 2014, yearTo: 2021 }]

const years = store.fitment.getYears(selectedModel)
// → [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
```

### Parts Catalog (filtered by vehicle)

```typescript
const parts = await store.fitment.getProducts({
  modelId:    selectedModelId,
  year:       selectedYear,
  categoryId: selectedCategoryId,  // optional
})
```

### Price Display

```typescript
// All prices from backend are in USD
// Never show USD to customer — always convert

const egpPrice = store.pricing.toDisplayPrice(part.basePrice)
// → 2700

const formatted = store.pricing.formatPrice(part.basePrice, 'ar')
// → "٢٧٠٠ ج.م"

const formattedEn = store.pricing.formatPrice(part.basePrice, 'en')
// → "2700 EGP"
```

### OEM Search

```typescript
const results = await store.oem.search('A2058800118')
// → exact match on OEM number

const results = await store.oem.search('رفرف أمامي')
// → full-text Arabic name search

const results = await store.oem.search('إكصدام')
// → returns all parts whose category has marketNameAr matching
```

---

## Summary Checklist

### In `store-sdk` repo:
- [ ] Create `src/types/plugin.ts` with `MantarayPlugin` interface
- [ ] Update `MantarayStore` constructor to accept `plugins?: MantarayPlugin[]`
- [ ] Add `store.extend(name, module)` method to `MantarayStore`
- [ ] Export `MantarayPlugin` type from `src/index.ts`
- [ ] Bump version to next minor (e.g. `1.1.0`)
- [ ] Publish to npm

### In Convex backend:
- [ ] Add `vehicle_brands` table (with `catalogType` field)
- [ ] Add `vehicle_models` table
- [ ] Add `product_fitment` table
- [ ] Add `exchange_rate_log` table
- [ ] Add optional OEM fields to `products` table: `oemNumber`, `alternativeOems`, `alternativeOemsText`, `supersededBy`, `condition`, `origin`, `leadTimeDays`, `diagramUrl`, `thumbnailUrl`, `weight`, `scraped`, `sourceUrl`
- [ ] Add `slug`, `marketNameAr`, `group`, `icon` to `categories` table
- [ ] Add search indexes on products: `by_oem`, `search_name_ar`, `search_name_en`, `search_alt_oem`
- [ ] Create `fitment/queries.ts` (getBrands, getModels, getProductsByVehicle, getSavedCars)
- [ ] Create `fitment/mutations.ts` (createBrand, createModel, addFitment, removeFitment, saveCar, removeSavedCar)
- [ ] Create `automotive/pricing.ts` (getExchangeRate, setExchangeRate, getExchangeRateHistory)
- [ ] Create `automotive/oemSearch.ts` (searchByOem — with marketNameAr + alternativeOems support)
- [ ] Deploy

### In new `plugin-automotive` repo:
- [ ] Init package `@mantaray-digital/plugin-automotive`
- [ ] Create `src/types.ts` (all types including `SavedCar`, `EgyptianShippingAddress`)
- [ ] Create `src/modules/fitment.ts` (with `getSavedCars`, `saveCar`, `removeSavedCar`)
- [ ] Create `src/modules/pricing.ts` (with null price guard)
- [ ] Create `src/modules/oem.ts`
- [ ] Create `src/constants.ts` (export `EGYPTIAN_GOVERNORATES` array)
- [ ] Create `src/index.ts` with `AutomotivePlugin` export
- [ ] Add TypeScript module augmentation for `MantarayStore`
- [ ] Publish to npm

### After all published — come back to car parts storefront repo:
- [ ] `npm install @mantaray-digital/store-sdk @mantaray-digital/plugin-automotive`
- [ ] Initialize store with `AutomotivePlugin`
- [ ] Set up store in Mantaray dashboard (products, categories, exchange rate, vehicle fitment)
- [ ] Get API key from dashboard
- [ ] Add `MANTARAY_API_KEY` and `CONVEX_URL` to `.env.local`
- [ ] Build Next.js storefront

---

## Notes for Implementation

- The `store['_client']` and `store['_apiKey']` accessors used in the plugin modules
  depend on how the SDK stores its Convex client and API key internally. Adjust the
  property names to match the actual SDK internals.

- The Convex function paths (`'fitment:getBrands'`, `'automotive:getExchangeRate'`, etc.)
  follow Convex's file-based routing. Adjust to match the actual file structure you create.

- All new schema fields are optional (`v.optional(...)`) — this is critical to avoid
  breaking existing store data.

- The `validateApiKey` and `validateAdminApiKey` helpers should follow the same pattern
  already used in existing Convex query/mutation handlers.

- Exchange rate: `effectiveRate = Math.max(adminRate, minRate)` — the minRate (floor)
  defaults to 50 EGP/USD and protects the store's margin if the market rate drops.

---

## Part 5 — Egyptian Storefront Specifics

This section documents details discovered from the mockup that affect implementation.

### 5.1 Egyptian Governorates Constant

Export this from `src/constants.ts` in the plugin. Used in the checkout city dropdown.
The mockup (cart.html) uses exactly these 26 governorates:

```typescript
export const EGYPTIAN_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الاسكندرية', 'الشرقية', 'الدقهلية',
  'المنوفية', 'الغربية', 'البحيرة', 'كفر الشيخ', 'الفيوم',
  'بني سويف', 'المنيا', 'اسيوط', 'سوهاج', 'قنا',
  'الاقصر', 'اسوان', 'البحر الاحمر', 'الوادي الجديد', 'مطروح',
  'شمال سيناء', 'جنوب سيناء', 'السويس', 'الاسماعيلية',
  'بورسعيد', 'دمياط',
] as const

export type EgyptianGovernorate = typeof EGYPTIAN_GOVERNORATES[number]
```

### 5.2 Address Format

The SDK's default `ShippingAddress` uses `addressLine1/addressLine2/postalCode`.
Egypt uses a different structure — use `EgyptianShippingAddress` from `src/types.ts`:

```
fullName  → الاسم بالكامل
phone     → رقم الموبايل (format: 01XXXXXXXXX)
city      → المحافظة (must be from EGYPTIAN_GOVERNORATES)
area      → المنطقة / الحي (neighborhood — e.g. "مدينة نصر")
address   → العنوان بالتفصيل (street + building + apartment)
notes?    → ملاحظات للسائق (optional delivery notes)
```

No postal code field. Egypt doesn't use postal codes in normal commerce.

### 5.3 Null / Missing Price Handling

Some parts scraped from nemigaparts have `null` prices (e.g. discontinued variants).
The storefront MUST handle this:

```typescript
// In pricing module — add a guard:
isPriceAvailable(usdAmount: number | null | undefined): boolean {
  return usdAmount != null && usdAmount > 0
}

// Usage in storefront:
if (store.pricing.isPriceAvailable(part.basePrice)) {
  return store.pricing.formatPrice(part.basePrice, 'ar')
} else {
  return 'اتصل للسعر'  // "Contact for price"
}
```

Never attempt `toDisplayPrice(null)` — it will return `NaN`.

### 5.4 Order Items — Snapshot Exchange Rate

When an order is created, the exchange rate used must be snapshotted on each item.
This prevents price discrepancies if the rate changes after order placement.

The order structure (see DATA_STRUCTURE.md) stores:
```typescript
// On the order:
exchangeRateUsed: number    // the effectiveRate at time of order

// On each item:
priceUsd: number            // USD price at time of order
priceEgp: number            // = priceUsd × exchangeRateUsed (pre-computed, snapshotted)
```

When building the checkout `createOrder` call, the storefront must:
1. Get `store.pricing._rate.effectiveRate` (the cached rate)
2. Compute `priceEgp` for each cart item
3. Pass these values into the order creation payload

### 5.5 Facelift / Year Sub-Range on Parts

Many W205 parts exist in TWO variants: pre-facelift (2014-2018) and facelift (2018-2021).
Both are within the model's overall range (2014-2021), but each part only fits part of it.

This is handled by `product_fitment.yearFrom` and `product_fitment.yearTo`:
- Model W205: yearFrom=2014, yearTo=2021
- Part "Facelift Bumper": fitment.yearFrom=2018, fitment.yearTo=2021
- Part "Standard Bumper": fitment.yearFrom=2014, fitment.yearTo=2018

When user selects year 2016 → only "Standard Bumper" appears.
When user selects year 2019 → only "Facelift Bumper" appears.
When user selects year 2018 → BOTH appear (overlap year).

The `getProductsByVehicle` Convex function already handles this with the year filter.

In the admin UI (parts.html add/edit modal), the "سنوات التوافق" field (e.g. "2018-2021")
maps to the fitment record's yearFrom/yearTo, NOT to the model's yearFrom/yearTo.

### 5.6 Design Tokens (for storefront CSS)

These exact values from `css/style.css` must be used in the Next.js Tailwind config:

```typescript
// tailwind.config.ts
colors: {
  dark: {
    1: '#1c1c1e',  // page background
    2: '#2a2a2e',  // card/section background
    3: '#333338',  // borders, subtle elements
  },
  gold: {
    DEFAULT: '#c9a96e',
    light:   '#d4b97e',
    dark:    '#b8944f',
  },
  muted: '#9a9a9e',
  success: '#4ade80',
  error:   '#ef4444',
  info:    '#60a5fa',
}

fontFamily: {
  cairo: ['Cairo', 'sans-serif'],       // Arabic text — weights 400,600,700,800,900
  inter: ['Inter', 'sans-serif'],        // English text — weights 300,400,500,600,700
  mono:  ['JetBrains Mono', 'monospace'],// OEM numbers — weights 400,500,600
}
```

### 5.7 "السعر شامل التوصيل للباب" Banner

This message must appear prominently on the cart page — delivery is included in the price,
there are no separate shipping fees. In the mockup it appears as a gold-bordered banner
above the cart items:

```
[ 🚚 السعر شامل التوصيل للباب ]
```

In the SDK checkout, use a single free shipping tier:
- name: "التوصيل للباب"
- nameAr: "التوصيل للباب"
- cost: 0
- freeAbove: 0

Or: hide the shipping tier selector entirely and hard-code free delivery.
The cart should never show a shipping line item — the total IS the final price.

### 5.8 Part Detail Page — Compatibility Table

The part detail page (part.html) shows a compatibility table with:
- الماركة (brand name) — e.g. "Mercedes-Benz"
- الموديل (model name) — e.g. "C-Class"
- الشاسيه (chassis code) — e.g. "W205"
- سنوات الصنع (production years) — e.g. "2014-2021"

In the Next.js storefront, this data comes from resolving the `product_fitment` records:
```typescript
const fitmentRecords = await store.fitment.getCompatibleVehicles(partId)
// Returns: [{ brand, model, chassis, yearFrom, yearTo }]
```

Add `getCompatibleVehicles(productId)` to the fitment Convex queries and FitmentModule.

### 5.9 Admin Pages Summary (for the car parts admin — built separately)

The admin mockup has 4 pages. These are built as a custom Next.js admin,
NOT using the SDK (which is customer-facing only):

| Page | Route | Key Features |
|------|-------|-------------|
| Dashboard | `/admin` | Stats: total parts, categories, in-stock count, inventory EGP value. Bar chart of parts per category. Recent orders table. |
| Parts CRUD | `/admin/parts` | Table: OEM (mono), nameAr, nameEn, category, USD price, EGP price (auto-computed), stock status, edit button. Add/edit modal. |
| Pricing | `/admin/pricing` | Current rate display. Formula: `EGP = USD × max(50, rate)`. Rate input + update button. Preview table (before/after for first 10 parts). Rate change history table. |
| Orders | `/admin/orders` | Stats: total, delivered, shipped, pending. Table with order number, customer, phone, city, items count, total EGP, status dropdown (inline update), expandable part names row. |

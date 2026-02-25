# @mantaray-digital/plugin-automotive

Automotive plugin for the **Mantaray Store SDK** — adds vehicle fitment lookup, OEM part search, and USD→EGP exchange rate pricing to your storefront.

Built for Egyptian automotive parts stores.

---

## Installation

```bash
npm install @mantaray-digital/store-sdk @mantaray-digital/plugin-automotive
```

**Requirements**
- `@mantaray-digital/store-sdk >= 1.1.0`
- The store must have the **Automotive Plugin** enabled by the platform admin

---

## Quick Start

```ts
import { MantarayStore } from '@mantaray-digital/store-sdk'
import { AutomotivePlugin } from '@mantaray-digital/plugin-automotive'

const store = new MantarayStore({
  apiKey: 'mk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  convexUrl: 'https://fast-jaguar-540.convex.cloud',
  plugins: [AutomotivePlugin],
})

// Load the exchange rate once at app startup
await store.pricing.getRate()

// Now use the three modules
store.fitment   // vehicle fitment
store.pricing   // USD → EGP conversion
store.oem       // OEM part search
```

---

## Modules

### `store.fitment` — Vehicle Fitment

Lets customers filter parts by their specific car (brand → model → year).

#### `getBrands(): Promise<VehicleBrand[]>`
Returns all active vehicle brands.

```ts
const brands = await store.fitment.getBrands()
// [{ _id, nameEn: 'BMW', nameAr: 'بي إم دبليو', slug: 'bmw', active: true }, ...]
```

#### `getModels(brandId: string): Promise<VehicleModel[]>`
Returns active models for a brand.

```ts
const models = await store.fitment.getModels(brands[0]._id)
// [{ _id, nameEn: '3 Series (F30)', nameAr: '...', chassis: 'F30', bodyType: 'sedan', yearFrom: 2012, yearTo: 2018 }]
```

#### `getYears(model: VehicleModel): number[]`
Returns the year range for a model as an array. Client-side — no API call.

```ts
const years = store.fitment.getYears(model)
// [2012, 2013, 2014, 2015, 2016, 2017, 2018]
```

#### `getProducts(filter: FitmentFilter): Promise<Product[]>`
Returns products compatible with a vehicle. Optionally filter by year and/or category.

```ts
const parts = await store.fitment.getProducts({
  modelId: model._id,
  year: 2016,           // optional — filter to facelift/pre-facelift
  categoryId: cat._id,  // optional — filter by category
})
```

#### `getCompatibleVehicles(productId: string): Promise<CompatibleVehicle[]>`
Returns all vehicles compatible with a specific product. Use on the product detail page.

```ts
const vehicles = await store.fitment.getCompatibleVehicles(product._id)
// [{ brand: { nameEn: 'BMW' }, model: { nameEn: '3 Series (F30)', chassis: 'F30' }, yearFrom: 2012, yearTo: 2018 }]
```

#### Saved Cars (localStorage)
Saves up to 5 cars per customer browser. No backend required.

```ts
await store.fitment.saveCar({ brandId, modelId, year: 2016 })
const saved = await store.fitment.getSavedCars()
await store.fitment.removeSavedCar(0) // remove by index
```

---

### `store.pricing` — Exchange Rate Pricing

Converts USD prices to EGP using the rate set by the store admin.

#### `getRate(): Promise<ExchangeRate>`
Fetches the current rate from Convex. **Call this once at app startup** before using `toDisplayPrice` or `formatPrice`.

```ts
const rate = await store.pricing.getRate()
// { rate: 57, minRate: 50, effectiveRate: 57, baseCurrency: 'USD', displayCurrency: 'EGP' }
```

> `effectiveRate = Math.max(rate, minRate)` — the floor prevents the admin from setting a rate too low.

#### `isPriceAvailable(usdAmount): boolean`
Returns `false` for `null` / `undefined` / `0` prices (scraped parts with no price yet).

```ts
if (!store.pricing.isPriceAvailable(product.basePrice)) {
  return 'اتصل للسعر'
}
```

#### `toDisplayPrice(usdAmount: number): number`
Converts USD → EGP (rounded). Requires `getRate()` to have been called first.

```ts
const egp = store.pricing.toDisplayPrice(49.99) // e.g. 2849
```

#### `formatPrice(usdAmount, locale?): string`
Formats for display. Returns `'اتصل للسعر'` / `'Contact for price'` when unavailable.

```ts
store.pricing.formatPrice(49.99)         // "٢٨٤٩ ج.م"  (Arabic, default)
store.pricing.formatPrice(49.99, 'en')   // "2849 EGP"
store.pricing.formatPrice(null)          // "اتصل للسعر"
store.pricing.formatPrice(null, 'en')    // "Contact for price"
```

---

### `store.oem` — OEM Part Search

Searches the catalog by OEM number or part name.

#### `search(query: string): Promise<OemSearchResult[]>`

Search priority (handled server-side):
1. **Exact OEM match** — searches `oemNumber` field
2. **Alternative OEM match** — searches `alternativeOems` list
3. **Egyptian market name** — e.g. `"إكصدام"` → finds the bumper category → returns all bumper parts
4. **Arabic name full-text search** — `nameAr`
5. **English name full-text search** — `name`

```ts
const results = await store.oem.search('A2051101600')   // exact OEM
const results = await store.oem.search('إكصدام')        // Arabic market name
const results = await store.oem.search('bumper')        // English name
```

---

## TypeScript

The plugin ships with full types and automatically augments `MantarayStore`:

```ts
import '@mantaray-digital/plugin-automotive' // import augment as side-effect

// store.fitment, store.pricing, store.oem are fully typed
```

### Key Types

```ts
interface VehicleBrand {
  _id: string
  nameEn: string       // "Mercedes-Benz"
  nameAr: string       // "مرسيدس بنز"
  slug: string         // "mercedes-benz"
  active: boolean
}

interface VehicleModel {
  _id: string
  brandId: string
  nameEn: string       // "C-Class (W205)"
  nameAr: string       // "سي كلاس W205"
  chassis: string      // "W205"
  bodyType: string     // "sedan" | "suv" | "coupe" | "hatchback" | ...
  yearFrom: number     // 2014
  yearTo: number       // 2021
  active: boolean
}

interface ExchangeRate {
  rate: number          // admin-set rate (EGP per USD)
  minRate: number       // floor rate
  effectiveRate: number // max(rate, minRate) — use this for display
  baseCurrency: string  // "USD"
  displayCurrency: string // "EGP"
}

interface FitmentFilter {
  modelId: string
  year?: number
  categoryId?: string
}

interface SavedCar {
  brandId: string
  modelId: string
  year: number
}

// Egyptian-specific shipping address (no postal code)
interface EgyptianShippingAddress {
  fullName: string
  phone: string    // Egyptian mobile: 010/011/012/015
  city: string     // one of EGYPTIAN_GOVERNORATES
  area: string     // neighbourhood / district
  address: string  // street, building, apartment
  notes?: string
}
```

---

## Egyptian Governorates

```ts
import { EGYPTIAN_GOVERNORATES, EgyptianGovernorate } from '@mantaray-digital/plugin-automotive'

// Use in your checkout city dropdown
// ['القاهرة', 'الجيزة', 'الاسكندرية', ...] (26 governorates)
```

---

## Backend Requirements

Your Convex deployment must have these functions deployed (included in the Mantaray platform):

| Function | Description |
|----------|-------------|
| `fitment/storefront:getBrands` | List active vehicle brands |
| `fitment/storefront:getModels` | List models for a brand |
| `fitment/storefront:getProductsByVehicle` | Products by model/year/category |
| `fitment/storefront:getCompatibleVehicles` | Vehicles compatible with a product |
| `automotive/storefront:getExchangeRate` | Current USD→EGP rate |
| `automotive/oemSearch:searchByOem` | OEM / name search |

All functions authenticate with your **API key** — the same key you pass to `MantarayStore`.

---

## Example: Vehicle Selector Component

```tsx
import { useState, useEffect } from 'react'
import { store } from './store' // your MantarayStore instance

export function VehicleSelector({ onSelect }) {
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [brand, setBrand] = useState(null)
  const [model, setModel] = useState(null)
  const [year, setYear]   = useState(null)

  useEffect(() => {
    store.fitment.getBrands().then(setBrands)
  }, [])

  const handleBrand = async (b) => {
    setBrand(b)
    setModels(await store.fitment.getModels(b._id))
  }

  const handleYear = (y) => {
    setYear(y)
    onSelect({ modelId: model._id, year: y })
    store.fitment.saveCar({ brandId: brand._id, modelId: model._id, year: y })
  }

  return (
    <div>
      <select onChange={e => handleBrand(brands.find(b => b._id === e.target.value))}>
        <option>Select brand...</option>
        {brands.map(b => <option key={b._id} value={b._id}>{b.nameAr}</option>)}
      </select>

      {models.length > 0 && (
        <select onChange={e => setModel(models.find(m => m._id === e.target.value))}>
          <option>Select model...</option>
          {models.map(m => <option key={m._id} value={m._id}>{m.nameAr}</option>)}
        </select>
      )}

      {model && (
        <select onChange={e => handleYear(Number(e.target.value))}>
          <option>Select year...</option>
          {store.fitment.getYears(model).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      )}
    </div>
  )
}
```

---

## Example: Price Display

```tsx
// In your app root — load rate once
await store.pricing.getRate()

// In your product card
function ProductPrice({ basePrice }) {
  return (
    <span className="price">
      {store.pricing.formatPrice(basePrice, 'ar')}
    </span>
  )
}
// Renders: "٢٨٤٩ ج.م" or "اتصل للسعر"
```

---

## Convex Deployment

The plugin targets:
```
https://fast-jaguar-540.convex.cloud
```

Pass this as `convexUrl` when initialising `MantarayStore`.

---

## License

MIT — © Mantaray Digital

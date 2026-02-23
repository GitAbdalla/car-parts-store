# @mantaray-digital/store-sdk

TypeScript SDK for building custom storefronts with Mantaray e-commerce backend. This SDK allows you to create fully customizable frontend experiences that integrate seamlessly with your Mantaray store.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Core Concepts](#core-concepts)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Building Your Storefront](#building-your-storefront)
- [Design Guidelines](#design-guidelines)
- [Examples](#examples)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)

---

## 🚀 Getting Started

### For Store Admins

1. **Sign up for Mantaray Dashboard**
   - Go to [dashboard.mantaray-digital.com](https://dashboard.mantaray-digital.com)
   - Create your account and store

2. **Configure Your Store**
   - Add products, categories, collections
   - Set up shipping tiers
   - Configure payment methods
   - Customize store theme and settings

3. **Get Your API Credentials**
   - Navigate to Settings → API Keys
   - Generate a new API key
   - Copy your Convex deployment URL

### For Frontend Developers

Once you have your API credentials, you can start building your custom storefront using this SDK.

---

## 🔐 Authentication

The SDK requires two credentials:

| Credential | Description | Where to Find |
|------------|-------------|---------------|
| `MANTARAY_API_KEY` | Your store's API key | Dashboard → Settings → API Keys |
| `CONVEX_URL` | Your Convex deployment URL | Dashboard → Settings → API Keys |

### Setting Up Credentials

**Option 1: Environment Variables (Recommended)**

Create a `.env` file in your project:

```env
MANTARAY_API_KEY=mk_live_xxxxxxxxxxxxxxxxxxxxxxxxx
CONVEX_URL=https://your-deployment.convex.cloud
```

**Option 2: Pass Directly**

```typescript
const store = new MantarayStore({
  apiKey: 'mk_live_xxxxxxxxxxxxxxxxxxxxxxxxx',
  convexUrl: 'https://your-deployment.convex.cloud',
});
```

---

## 📦 Installation

```bash
npm install @mantaray-digital/store-sdk
# or
yarn add @mantaray-digital/store-sdk
# or
pnpm add @mantaray-digital/store-sdk
```

---

## ⚡ Quick Start

```typescript
import { MantarayStore } from '@mantaray-digital/store-sdk';

// Initialize with environment variables
const store = new MantarayStore();

// Fetch products
const { products } = await store.products.list();

// Display products
products.forEach(product => {
  console.log(product.name, product.basePrice);
});
```

---

## 📚 API Reference

### Store Module

Get store configuration and settings.

```typescript
const config = await store.store.getConfig();
// Returns: StoreConfig with theme, settings, currency, etc.
```

**Important**: Always fetch store config on app initialization to:
- Apply the correct currency and currency position
- Use the store's theme colors
- Display store information correctly

### Products Module

#### List Products

```typescript
// Get all products
const { products, total, hasMore } = await store.products.list();

// Filter by category
const { products } = await store.products.list({
  categoryId: 'category_id_here'
});

// Sort products
const { products } = await store.products.list({
  sortBy: 'price_asc' // or 'price_desc', 'name_asc', 'newest'
});

// Filter by price range
const { products } = await store.products.list({
  minPrice: 100,
  maxPrice: 500
});

// Only in-stock products
const { products } = await store.products.list({
  inStockOnly: true
});
```

#### Get Product Details

```typescript
const product = await store.products.get('product_id_here');
```

**Product Structure**:
```typescript
{
  _id: string;
  name: string;
  nameAr?: string;           // Arabic name (if available)
  description: string;
  descriptionAr?: string;    // Arabic description (if available)
  basePrice: number;         // Always in store's currency
  compareAtPrice?: number;   // Original price (if on sale)
  images: string[];          // Array of image URLs
  hasVariants: boolean;      // Whether product has variants
  options?: ProductOption[]; // Size, color, etc.
  variants?: ProductVariant[];
  stock?: number;
  isPreOrderEnabled?: boolean;
  specifications?: Record<string, string | number | boolean | string[]>;
  trustSignals?: TrustSignals;
  fitInfo?: FitInfo;
}
```

**Design Note**: Always display:
- `name` or `nameAr` based on user's locale
- `basePrice` formatted with store's currency symbol and position
- `compareAtPrice` if available (show as strikethrough)
- All images from the `images` array
- Stock status if `stock` is provided

### Categories Module

```typescript
// Get all categories
const categories = await store.categories.list();

// Get category tree (nested structure)
const tree = await store.categories.getTree();

// Get single category
const category = await store.categories.get('category_id_here');
```

**Category Structure**:
```typescript
{
  _id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  imageUrl: string | null;
  productCount: number;
  sortOrder: number;
}
```

### Collections Module

```typescript
// Get all collections
const collections = await store.collections.list();

// Get collection with products
const collection = await store.collections.getWithProducts('collection_id_here');
```

**Collection Structure**:
```typescript
{
  _id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  imageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
}
```

### Cart Module

```typescript
// Get current cart
const cart = await store.cart.get();

// Add item to cart
await store.cart.addItem({
  productId: 'product_id_here',
  variantId: 'variant_id_here', // Required if product has variants
  quantity: 1
});

// Update item quantity
await store.cart.updateItem('cart_item_id_here', 2);

// Remove item from cart
await store.cart.removeItem('cart_item_id_here');

// Clear cart
await store.cart.clear();
```

**Cart Structure**:
```typescript
{
  _id?: string;
  items: CartItem[];
  subtotal: number;      // Always in store's currency
  itemCount: number;     // Total number of items
}
```

**Design Note**: Display cart with:
- Product images, names, and prices
- Quantity controls
- Subtotal calculation
- Currency formatting from store config

### Checkout Module

```typescript
// Get available shipping tiers
const shippingTiers = await store.checkout.getShippingTiers();

// Create order
const order = await store.checkout.createOrder({
  customerId: 'customer_id_here',
  shippingAddress: {
    name: 'John Doe',
    phone: '+1234567890',
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4B',
    city: 'New York',
    postalCode: '10001'
  },
  shippingTierId: 'shipping_tier_id_here',
  notes: 'Special instructions'
});
```

**Shipping Tier Structure**:
```typescript
{
  _id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  cost: number;              // Shipping cost in store's currency
  freeAbove?: number;        // Free shipping above this amount
  estimatedDays?: string;    // e.g., "2-3 business days"
  estimatedDaysAr?: string;
}
```

**Design Note for Checkout Page**:
1. **Display shipping options** with:
   - Tier name and description
   - Cost (or "Free" if `freeAbove` is met)
   - Estimated delivery time
   - Allow user to select one tier

2. **Order summary** should show:
   - Cart items with quantities
   - Subtotal
   - Shipping cost
   - Total amount
   - All in store's currency

3. **Address form** should collect:
   - Full name
   - Phone number
   - Complete address (line 1, line 2, city, postal code)

### Customer Module

```typescript
// Register new customer
const result = await store.customer.register({
  email: 'customer@example.com',
  password: 'secure_password',
  name: 'John Doe',
  phone: '+1234567890'
});

// Login
const loginResult = await store.customer.login({
  email: 'customer@example.com',
  password: 'secure_password'
});

// Get customer profile
const profile = await store.customer.getProfile();

// Update customer profile
await store.customer.updateProfile({
  name: 'Jane Doe',
  phone: '+0987654321'
});
```

**After Login**:
```typescript
// Link customer to cart, wishlist, etc.
store.setCustomer(loginResult.customerId);
```

### Wishlist Module

```typescript
// Get wishlist
const wishlist = await store.wishlist.get();

// Add to wishlist
await store.wishlist.add('product_id_here');

// Remove from wishlist
await store.wishlist.remove('wishlist_item_id_here');

// Check if product is in wishlist
const isInWishlist = await store.wishlist.has('product_id_here');
```

### Analytics Module

Track user events for analytics:

```typescript
// Track page view
await store.analytics.track('page_view', {
  path: '/products/123'
});

// Track product view
await store.analytics.track('product_view', {
  productId: 'product_id_here'
});

// Track add to cart
await store.analytics.track('add_to_cart', {
  productId: 'product_id_here',
  variantId: 'variant_id_here',
  quantity: 1
});

// Track checkout started
await store.analytics.track('checkout_started', {
  cartId: 'cart_id_here'
});

// Track checkout completed
await store.analytics.track('checkout_completed', {
  orderId: 'order_id_here',
  total: 100.50
});
```

---

## 🎨 Building Your Storefront

### Step 1: Initialize the SDK

```typescript
import { MantarayStore } from '@mantaray-digital/store-sdk';

const store = new MantarayStore();
```

### Step 2: Fetch Store Configuration

```typescript
const config = await store.store.getConfig();

// Apply theme to your app
document.documentElement.style.setProperty('--primary-color', config.theme.primaryColor);
document.documentElement.style.setProperty('--secondary-color', config.theme.secondaryColor);
```

### Step 3: Create a Product List Page

```typescript
async function loadProducts() {
  const { products } = await store.products.list();

  return products.map(product => ({
    id: product._id,
    name: product.name,
    price: formatPrice(product.basePrice, config.settings),
    image: product.images[0],
    inStock: product.stock > 0
  }));
}

function formatPrice(amount: number, settings: StoreSettings) {
  const symbol = settings.currencySymbol;
  const position = settings.currencyPosition;
  
  return position === 'before'
    ? `${symbol}${amount.toFixed(2)}`
    : `${amount.toFixed(2)}${symbol}`;
}
```

### Step 4: Create a Product Detail Page

```typescript
async function loadProduct(productId: string) {
  const product = await store.products.get(productId);

  return {
    id: product._id,
    name: product.name,
    description: product.description,
    price: product.basePrice,
    compareAtPrice: product.compareAtPrice,
    images: product.images,
    hasVariants: product.hasVariants,
    variants: product.variants,
    stock: product.stock,
    specifications: product.specifications,
    trustSignals: product.trustSignals
  };
}
```

### Step 5: Create a Cart Page

```typescript
async function loadCart() {
  const cart = await store.cart.get();

  return {
    items: cart.items.map(item => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.imageUrl
    })),
    subtotal: cart.subtotal,
    itemCount: cart.itemCount
  };
}
```

### Step 6: Create a Checkout Page

```typescript
async function loadCheckout() {
  const [cart, shippingTiers] = await Promise.all([
    store.cart.get(),
    store.checkout.getShippingTiers()
  ]);

  return {
    cart,
    shippingTiers
  };
}

async function placeOrder(data: CreateOrderData) {
  const order = await store.checkout.createOrder(data);
  return order;
}
```

---

## 🎯 Design Guidelines

### Currency Formatting

Always use the store's currency settings:

```typescript
const config = await store.store.getConfig();

function formatPrice(amount: number) {
  const { currencySymbol, currencyPosition } = config.settings;
  
  if (currencyPosition === 'before') {
    return `${currencySymbol}${amount.toFixed(2)}`;
  } else {
    return `${amount.toFixed(2)}${currencySymbol}`;
  }
}
```

### Localization

Support both English and Arabic:

```typescript
function getLocalizedText(item: { name: string; nameAr?: string }, locale: 'en' | 'ar') {
  return locale === 'ar' && item.nameAr ? item.nameAr : item.name;
}
```

### Image Handling

Products have multiple images. Always:
- Display the first image as the main image
- Show all images in a gallery
- Handle missing images gracefully

```typescript
function getProductImage(product: Product, index = 0) {
  return product.images[index] || '/placeholder-image.png';
}
```

### Stock Display

Show stock status to users:

```typescript
function getStockStatus(product: Product) {
  if (!product.stock) return 'In Stock';
  if (product.stock === 0) return 'Out of Stock';
  if (product.stock < 5) return `Only ${product.stock} left`;
  return 'In Stock';
}
```

### Sale Display

Show sale price when available:

```typescript
function renderPrice(product: Product) {
  if (product.compareAtPrice && product.compareAtPrice > product.basePrice) {
    return (
      <div>
        <span className="sale-price">{formatPrice(product.basePrice)}</span>
        <span className="original-price">{formatPrice(product.compareAtPrice)}</span>
      </div>
    );
  }
  return <span>{formatPrice(product.basePrice)}</span>;
}
```

---

## 💡 Examples

### Complete Product Listing Component

```typescript
import { MantarayStore } from '@mantaray-digital/store-sdk';

const store = new MantarayStore();

export async function ProductList() {
  const config = await store.store.getConfig();
  const { products } = await store.products.list();

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product._id} product={product} config={config} />
      ))}
    </div>
  );
}

function ProductCard({ product, config }: { product: Product; config: StoreConfig }) {
  const price = formatPrice(product.basePrice, config.settings);
  const image = product.images[0] || '/placeholder.png';

  return (
    <div className="product-card">
      <img src={image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">{price}</p>
      {product.compareAtPrice && (
        <p className="original-price">
          {formatPrice(product.compareAtPrice, config.settings)}
        </p>
      )}
      <button onClick={() => addToCart(product._id)}>
        Add to Cart
      </button>
    </div>
  );
}
```

### Complete Checkout Flow

```typescript
import { MantarayStore } from '@mantaray-digital/store-sdk';

const store = new MantarayStore();

export async function CheckoutPage() {
  const [cart, shippingTiers] = await Promise.all([
    store.cart.get(),
    store.checkout.getShippingTiers()
  ]);

  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);

  const handlePlaceOrder = async (address: ShippingAddress) => {
    if (!selectedShipping) {
      alert('Please select a shipping method');
      return;
    }

    const order = await store.checkout.createOrder({
      customerId: 'customer_id_here',
      shippingAddress: address,
      shippingTierId: selectedShipping
    });

    // Redirect to order confirmation
    window.location.href = `/order/${order.orderId}`;
  };

  return (
    <div className="checkout">
      <h1>Checkout</h1>

      {/* Cart Summary */}
      <section className="cart-summary">
        <h2>Order Summary</h2>
        {cart.items.map(item => (
          <div key={item.productId} className="cart-item">
            <img src={item.imageUrl} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Price: {formatPrice(item.price)}</p>
            </div>
          </div>
        ))}
        <div className="totals">
          <p>Subtotal: {formatPrice(cart.subtotal)}</p>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="shipping-options">
        <h2>Shipping Method</h2>
        {shippingTiers.map(tier => (
          <label key={tier._id}>
            <input
              type="radio"
              name="shipping"
              value={tier._id}
              onChange={() => setSelectedShipping(tier._id)}
            />
            <div>
              <h3>{tier.name}</h3>
              <p>{tier.description}</p>
              <p>Cost: {tier.cost === 0 ? 'Free' : formatPrice(tier.cost)}</p>
              {tier.estimatedDays && (
                <p>Delivery: {tier.estimatedDays}</p>
              )}
            </div>
          </label>
        ))}
      </section>

      {/* Address Form */}
      <section className="address-form">
        <h2>Shipping Address</h2>
        <AddressForm onSubmit={handlePlaceOrder} />
      </section>
    </div>
  );
}
```

---

## ❌ Error Handling

The SDK provides detailed error information:

```typescript
import { MantarayError, MantarayErrorCode } from '@mantaray-digital/store-sdk';

try {
  const product = await store.products.get('invalid_id');
} catch (error) {
  if (error instanceof MantarayError) {
    switch (error.code) {
      case MantarayErrorCode.API_KEY_REQUIRED:
        console.error('API key is missing');
        break;
      case MantarayErrorCode.NOT_FOUND:
        console.error('Product not found');
        break;
      case MantarayErrorCode.VALIDATION_ERROR:
        console.error('Invalid input:', error.message);
        break;
      case MantarayErrorCode.NETWORK_ERROR:
        console.error('Network error, please try again');
        break;
      default:
        console.error('An error occurred:', error.message);
    }
  }
}
```

---

## 📘 TypeScript Support

The SDK is fully typed. Import types as needed:

```typescript
import type {
  Product,
  Cart,
  Order,
  CustomerProfile,
  ShippingAddress,
  MantarayStoreConfig
} from '@mantaray-digital/store-sdk';
```

---

## 📞 Support

- **Documentation**: [docs.mantaray-digital.com](https://docs.mantaray-digital.com)
- **Dashboard**: [dashboard.mantaray-digital.com](https://dashboard.mantaray-digital.com)
- **Issues**: [GitHub Issues](https://github.com/mantaray-digital/store-sdk/issues)

---

## 📄 License

MIT © Mantaray Digital

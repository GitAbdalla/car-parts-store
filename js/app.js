// ===== CAR PARTS STORE - Main Application =====

// ===== DATA =====
const CAR_DATA = {
  'BMW': {
    '3 Series': { codes: 'E90/F30/G20', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] },
    '5 Series': { codes: 'F10/G30', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] },
    'X3': { codes: 'F25/G01', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] },
    'X5': { codes: 'E70/F15/G05', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] }
  },
  'Mercedes-Benz': {
    'C-Class': { codes: 'W204/W205/W206', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] },
    'E-Class': { codes: 'W212/W213', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] },
    'GLC': { codes: 'X253', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] },
    'GLE': { codes: 'W166/W167', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] }
  }
};

const CATEGORIES = [
  { id: 'front-bumper', ar: 'إكصدام أمامي', en: 'Front Bumper', icon: '🛡️' },
  { id: 'rear-bumper', ar: 'إكصدام خلفي', en: 'Rear Bumper', icon: '🛡️' },
  { id: 'hood', ar: 'كبوت', en: 'Engine Hood', icon: '🔧' },
  { id: 'front-fender', ar: 'رفرف أمامي', en: 'Front Fender', icon: '🚗' },
  { id: 'rear-fender', ar: 'رفرف خلفي', en: 'Rear Fender', icon: '🚗' },
  { id: 'headlamp', ar: 'فانوس أمامي', en: 'Headlamp', icon: '💡' },
  { id: 'tail-light', ar: 'فانوس خلفي', en: 'Tail Light', icon: '🔴' },
  { id: 'reflector', ar: 'عاكس', en: 'Reflector', icon: '🔵' },
  { id: 'indicator', ar: 'إشارة', en: 'Turn Indicator', icon: '🟡' },
  { id: 'trunk', ar: 'شنطة', en: 'Trunk Lid', icon: '📦' },
  { id: 'front-door', ar: 'باب أمامي', en: 'Front Door', icon: '🚪' },
  { id: 'rear-door', ar: 'باب خلفي', en: 'Rear Door', icon: '🚪' },
  { id: 'grille', ar: 'شبكة أمامية', en: 'Front Grille', icon: '⬛' },
  { id: 'mirror', ar: 'مرايا جانبية', en: 'Side Mirror', icon: '🪞' },
  { id: 'fog-lamp', ar: 'فانوس شبورة', en: 'Fog Lamp', icon: '🌫️' },
  { id: 'trans-cooler', ar: 'مبرد فتيس', en: 'Transmission Oil Cooler', icon: '❄️' },
  { id: 'engine-cooler', ar: 'مبرد ماتور', en: 'Engine Oil Cooler', icon: '❄️' },
  { id: 'radiator', ar: 'ريداتير', en: 'Radiator', icon: '🌡️' },
  { id: 'brake-pads', ar: 'تيل فرامل', en: 'Brake Pads', icon: '🛑' }
];

// Generate realistic parts data
const PARTS_DB = [];
let partId = 1;

function genOEM(brand, cat, model) {
  const prefixes = {
    'BMW': '51',
    'Mercedes-Benz': 'A'
  };
  const catCodes = {
    'front-bumper': '11', 'rear-bumper': '12', 'hood': '13', 'front-fender': '14',
    'rear-fender': '15', 'headlamp': '63', 'tail-light': '63', 'reflector': '63',
    'indicator': '63', 'trunk': '41', 'front-door': '21', 'rear-door': '22',
    'grille': '13', 'mirror': '16', 'fog-lamp': '63', 'trans-cooler': '17',
    'engine-cooler': '17', 'radiator': '17', 'brake-pads': '34'
  };
  if (brand === 'BMW') {
    return `${prefixes[brand]} ${catCodes[cat] || '99'} ${Math.floor(1000000 + Math.random() * 9000000)}`;
  }
  return `${prefixes[brand]} ${catCodes[cat] || '999'} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(10 + Math.random() * 90)}`;
}

const basePrices = {
  'front-bumper': 180, 'rear-bumper': 165, 'hood': 220, 'front-fender': 130,
  'rear-fender': 140, 'headlamp': 250, 'tail-light': 180, 'reflector': 25,
  'indicator': 35, 'trunk': 280, 'front-door': 350, 'rear-door': 320,
  'grille': 85, 'mirror': 120, 'fog-lamp': 65, 'trans-cooler': 150,
  'engine-cooler': 140, 'radiator': 95, 'brake-pads': 45
};

Object.keys(CAR_DATA).forEach(brand => {
  Object.keys(CAR_DATA[brand]).forEach(model => {
    CATEGORIES.forEach(cat => {
      const usd = basePrices[cat.id] + Math.floor(Math.random() * 40 - 20);
      const years = CAR_DATA[brand][model].years;
      const startYear = years[Math.floor(Math.random() * 3)];
      const endYear = years[years.length - 1 - Math.floor(Math.random() * 2)];
      const compatYears = years.filter(y => y >= startYear && y <= endYear);

      PARTS_DB.push({
        id: partId++,
        brand, model,
        codes: CAR_DATA[brand][model].codes,
        category: cat.id,
        nameAr: cat.ar,
        nameEn: cat.en,
        icon: cat.icon,
        oem: genOEM(brand, cat.id, model),
        altOem: genOEM(brand, cat.id, model),
        priceUsd: usd,
        years: compatYears,
        stock: Math.random() > 0.15 ? 'in-stock' : 'on-order'
      });
    });
  });
});

// ===== STATE =====
const STATE = {
  exchangeRate: parseFloat(localStorage.getItem('exchangeRate')) || 50,
  cart: JSON.parse(localStorage.getItem('cart')) || [],
  orders: JSON.parse(localStorage.getItem('orders')) || generateSampleOrders(),
  selectedBrand: null,
  selectedModel: null,
  selectedYear: null
};

function generateSampleOrders() {
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
  const cities = ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'طنطا'];
  const names = ['أحمد محمد', 'محمد علي', 'سارة أحمد', 'عمر حسن', 'فاطمة إبراهيم'];
  const orders = [];
  for (let i = 1; i <= 8; i++) {
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    for (let j = 0; j < numItems; j++) {
      const p = PARTS_DB[Math.floor(Math.random() * PARTS_DB.length)];
      items.push({ partId: p.id, name: `${p.nameAr} / ${p.nameEn}`, qty: 1, priceEgp: p.priceUsd * 50 });
    }
    orders.push({
      id: 1000 + i,
      date: `2026-02-${String(10 + i).padStart(2, '0')}`,
      customer: names[i % names.length],
      phone: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
      city: cities[i % cities.length],
      address: `شارع ${i * 10} - ${cities[i % cities.length]}`,
      status: statuses[i % statuses.length],
      items,
      total: items.reduce((s, it) => s + it.priceEgp * it.qty, 0)
    });
  }
  return orders;
}

function saveState() {
  localStorage.setItem('exchangeRate', STATE.exchangeRate);
  localStorage.setItem('cart', JSON.stringify(STATE.cart));
  localStorage.setItem('orders', JSON.stringify(STATE.orders));
}

function getEgpPrice(usd) { return usd * Math.max(50, STATE.exchangeRate); }
function formatEgp(amount) { return amount.toLocaleString('ar-EG') + ' ج.م'; }
function formatEgpEn(amount) { return amount.toLocaleString() + ' EGP'; }

// ===== CART =====
function addToCart(partId, qty = 1) {
  const existing = STATE.cart.find(c => c.partId === partId);
  if (existing) { existing.qty += qty; }
  else { STATE.cart.push({ partId, qty }); }
  saveState();
  updateCartBadge();
  showToast('✅ تمت الإضافة للسلة / Added to cart');
}

function removeFromCart(partId) {
  STATE.cart = STATE.cart.filter(c => c.partId !== partId);
  saveState();
  updateCartBadge();
  if (typeof renderCart === 'function') renderCart();
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = STATE.cart.reduce((s, c) => s + c.qty, 0);
  badges.forEach(b => { b.textContent = count; b.style.display = count > 0 ? 'flex' : 'none'; });
}

function getCartTotal() {
  return STATE.cart.reduce((sum, item) => {
    const part = PARTS_DB.find(p => p.id === item.partId);
    return sum + (part ? getEgpPrice(part.priceUsd) * item.qty : 0);
  }, 0);
}

// ===== TOAST =====
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== CAR SELECTOR =====
function initCarSelector() {
  const brandSel = document.getElementById('brand-select');
  const modelSel = document.getElementById('model-select');
  const yearSel = document.getElementById('year-select');
  if (!brandSel) return;

  Object.keys(CAR_DATA).forEach(brand => {
    brandSel.add(new Option(brand, brand));
  });

  brandSel.addEventListener('change', () => {
    modelSel.innerHTML = '<option value="">اختر الموديل / Select Model</option>';
    yearSel.innerHTML = '<option value="">اختر السنة / Select Year</option>';
    if (brandSel.value) {
      Object.keys(CAR_DATA[brandSel.value]).forEach(model => {
        const d = CAR_DATA[brandSel.value][model];
        modelSel.add(new Option(`${model} (${d.codes})`, model));
      });
    }
  });

  modelSel.addEventListener('change', () => {
    yearSel.innerHTML = '<option value="">اختر السنة / Select Year</option>';
    if (modelSel.value && brandSel.value) {
      CAR_DATA[brandSel.value][modelSel.value].years.forEach(y => {
        yearSel.add(new Option(y, y));
      });
    }
  });
}

function searchParts() {
  const brand = document.getElementById('brand-select')?.value;
  const model = document.getElementById('model-select')?.value;
  const year = document.getElementById('year-select')?.value;
  if (brand && model && year) {
    window.location.href = `catalog.html?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&year=${year}`;
  } else {
    showToast('⚠️ اختر الماركة والموديل والسنة', '');
  }
}

// ===== CATALOG PAGE =====
function initCatalog() {
  const params = new URLSearchParams(window.location.search);
  const brand = params.get('brand');
  const model = params.get('model');
  const year = parseInt(params.get('year'));
  const catFilter = params.get('cat');

  if (!brand || !model) return;

  // Update header
  const h = document.getElementById('catalog-header');
  if (h) h.textContent = `${brand} ${model} ${year || ''}`;
  const bc = document.getElementById('breadcrumb-car');
  if (bc) bc.textContent = `${brand} ${model} ${year || ''}`;

  let parts = PARTS_DB.filter(p => p.brand === brand && p.model === model);
  if (year) parts = parts.filter(p => p.years.includes(year));
  if (catFilter) parts = parts.filter(p => p.category === catFilter);

  // Render filters
  renderCatalogFilters(parts, catFilter);

  // Search by part number
  const searchInput = document.getElementById('part-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      const filtered = q ? parts.filter(p => p.oem.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.nameAr.includes(q)) : parts;
      renderParts(filtered);
    });
  }

  renderParts(parts);
  const rc = document.getElementById('results-count');
  if (rc) rc.innerHTML = `عرض <strong>${parts.length}</strong> قطعة`;
}

function renderCatalogFilters(parts, activeCat) {
  const container = document.getElementById('filter-categories');
  if (!container) return;
  const params = new URLSearchParams(window.location.search);

  const counts = {};
  parts.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });

  container.innerHTML = CATEGORIES.map(cat => {
    const count = counts[cat.id] || 0;
    if (count === 0) return '';
    const isActive = activeCat === cat.id;
    const newParams = new URLSearchParams(params);
    if (isActive) newParams.delete('cat'); else newParams.set('cat', cat.id);
    return `<label class="${isActive ? 'font-bold' : ''}">
      <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.location.search='${newParams.toString()}'">
      <span>${cat.icon} ${cat.ar} / ${cat.en}</span>
      <span class="filter-count">(${count})</span>
    </label>`;
  }).join('');
}

function renderParts(parts) {
  const grid = document.getElementById('parts-grid');
  if (!grid) return;

  if (parts.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="icon">🔍</div><h3>لا توجد نتائج</h3><p>No parts found matching your criteria</p></div>`;
    return;
  }

  grid.innerHTML = parts.map(p => `
    <div class="part-card" onclick="window.location.href='part.html?id=${p.id}'" style="cursor:pointer">
      <div class="part-card-img">
        ${p.icon}
        ${p.stock === 'in-stock' ? '<span class="part-badge">متوفر ✓</span>' : '<span class="part-badge" style="background:var(--gray-300)">طلب خاص</span>'}
      </div>
      <div class="part-card-body">
        <div class="part-name-ar">${p.nameAr}</div>
        <div class="part-name-en">${p.nameEn} — ${p.brand} ${p.model}</div>
        <div class="part-oem">OEM: ${p.oem}</div>
        <div class="part-card-footer">
          <div class="part-price">${formatEgp(getEgpPrice(p.priceUsd))}</div>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();addToCart(${p.id})">
            🛒 أضف للسلة
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== PART DETAIL =====
function initPartDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const part = PARTS_DB.find(p => p.id === id);
  if (!part) return;

  document.getElementById('part-icon').textContent = part.icon;
  document.getElementById('part-name-ar').textContent = part.nameAr;
  document.getElementById('part-name-en').textContent = `${part.nameEn} — ${part.brand} ${part.model}`;
  document.getElementById('part-price').innerHTML = `${formatEgp(getEgpPrice(part.priceUsd))} <small>شامل التوصيل</small>`;
  document.getElementById('part-oem').textContent = part.oem;
  document.getElementById('part-alt-oem').textContent = part.altOem;
  document.getElementById('part-brand').textContent = part.brand;
  document.getElementById('part-category').textContent = `${part.nameAr} / ${part.nameEn}`;
  document.getElementById('part-stock').innerHTML = part.stock === 'in-stock'
    ? '<span class="badge badge-success">متوفر / In Stock</span>'
    : '<span class="badge badge-warning">طلب خاص / On Order</span>';

  const bcName = document.getElementById('breadcrumb-part');
  if (bcName) bcName.textContent = `${part.nameAr} / ${part.nameEn}`;

  // Compatibility
  const compat = PARTS_DB.filter(p => p.category === part.category && p.brand === part.brand)
    .map(p => `${p.model} (${p.codes}) ${p.years[0]}-${p.years[p.years.length-1]}`);
  const uniqueCompat = [...new Set(compat)];
  document.getElementById('compatibility-list').innerHTML = uniqueCompat.map(c => `<span class="compat-tag">${c}</span>`).join('');

  // Add to cart button
  document.getElementById('add-to-cart-btn').onclick = () => {
    const qty = parseInt(document.getElementById('qty-input')?.value || 1);
    addToCart(part.id, qty);
  };
}

// ===== CART PAGE =====
function initCart() {
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const summary = document.getElementById('cart-summary-details');
  if (!container) return;

  if (STATE.cart.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="icon">🛒</div><h3>السلة فاضية</h3><p>Your cart is empty. Start shopping!</p><a href="index.html" class="btn btn-primary mt-2">تصفح القطع</a></div>`;
    if (summary) summary.innerHTML = '';
    return;
  }

  container.innerHTML = STATE.cart.map(item => {
    const p = PARTS_DB.find(pp => pp.id === item.partId);
    if (!p) return '';
    return `
      <div class="cart-item">
        <div class="cart-item-img">${p.icon}</div>
        <div class="cart-item-name">
          <div class="ar">${p.nameAr}</div>
          <div class="en">${p.nameEn} — ${p.brand} ${p.model}</div>
          <div class="oem">OEM: ${p.oem}</div>
        </div>
        <div class="cart-item-price">${formatEgp(getEgpPrice(p.priceUsd) * item.qty)}</div>
        <div class="cart-item-remove" onclick="removeFromCart(${p.id})">✕</div>
      </div>`;
  }).join('');

  const total = getCartTotal();
  if (summary) {
    summary.innerHTML = `
      <div class="summary-row"><span>المجموع / Subtotal</span><span>${formatEgp(total)}</span></div>
      <div class="summary-row"><span>الشحن / Shipping</span><span style="color:var(--green)">مجاني ✓</span></div>
      <div class="summary-row total"><span>الإجمالي / Total</span><span>${formatEgp(total)}</span></div>
    `;
  }
}

function placeOrder() {
  if (STATE.cart.length === 0) return showToast('⚠️ السلة فاضية');
  const name = document.getElementById('checkout-name')?.value;
  const phone = document.getElementById('checkout-phone')?.value;
  if (!name || !phone) return showToast('⚠️ الرجاء ملء البيانات المطلوبة');

  const order = {
    id: 1000 + STATE.orders.length + 1,
    date: new Date().toISOString().split('T')[0],
    customer: name,
    phone,
    city: document.getElementById('checkout-city')?.value || '',
    address: document.getElementById('checkout-address')?.value || '',
    status: 'pending',
    items: STATE.cart.map(c => {
      const p = PARTS_DB.find(pp => pp.id === c.partId);
      return { partId: c.partId, name: p ? `${p.nameAr} / ${p.nameEn}` : '', qty: c.qty, priceEgp: p ? getEgpPrice(p.priceUsd) : 0 };
    }),
    total: getCartTotal()
  };
  STATE.orders.push(order);
  STATE.cart = [];
  saveState();
  showToast('✅ تم تأكيد الطلب بنجاح! / Order placed successfully!');
  setTimeout(() => { renderCart(); updateCartBadge(); }, 500);
}

// ===== HOMEPAGE FEATURED PARTS =====
function initHomepage() {
  const grid = document.getElementById('featured-parts');
  if (!grid) return;
  const featured = PARTS_DB.filter(p => p.stock === 'in-stock').sort(() => Math.random() - 0.5).slice(0, 8);
  grid.innerHTML = featured.map(p => `
    <div class="part-card" onclick="window.location.href='part.html?id=${p.id}'" style="cursor:pointer">
      <div class="part-card-img">
        ${p.icon}
        <span class="part-badge">متوفر ✓</span>
      </div>
      <div class="part-card-body">
        <div class="part-name-ar">${p.nameAr}</div>
        <div class="part-name-en">${p.nameEn} — ${p.brand} ${p.model}</div>
        <div class="part-oem">OEM: ${p.oem}</div>
        <div class="part-card-footer">
          <div class="part-price">${formatEgp(getEgpPrice(p.priceUsd))}</div>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();addToCart(${p.id})">🛒 أضف</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== ADMIN: DASHBOARD =====
function initAdminDashboard() {
  document.getElementById('stat-orders').textContent = STATE.orders.length;
  document.getElementById('stat-revenue').textContent = formatEgp(STATE.orders.reduce((s, o) => s + o.total, 0));
  document.getElementById('stat-parts').textContent = PARTS_DB.length;
  document.getElementById('stat-rate').textContent = STATE.exchangeRate + ' EGP/USD';

  const tbody = document.getElementById('recent-orders');
  if (!tbody) return;
  const recent = STATE.orders.slice(-5).reverse();
  tbody.innerHTML = recent.map(o => `
    <tr>
      <td><strong>#${o.id}</strong></td>
      <td>${o.customer}</td>
      <td>${o.date}</td>
      <td>${o.items.length} قطعة</td>
      <td class="ar" style="font-weight:700">${formatEgp(o.total)}</td>
      <td>${statusBadge(o.status)}</td>
    </tr>
  `).join('');
}

function statusBadge(status) {
  const map = {
    'pending': ['badge-warning', 'قيد الانتظار'],
    'confirmed': ['badge-info', 'مؤكد'],
    'shipped': ['badge-info', 'تم الشحن'],
    'delivered': ['badge-success', 'تم التوصيل']
  };
  const [cls, label] = map[status] || ['badge-gray', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ===== ADMIN: PARTS =====
function initAdminParts() {
  renderAdminParts();
}

function renderAdminParts(filter = '') {
  const tbody = document.getElementById('parts-tbody');
  if (!tbody) return;

  let parts = PARTS_DB;
  if (filter) {
    const q = filter.toLowerCase();
    parts = parts.filter(p => p.nameEn.toLowerCase().includes(q) || p.nameAr.includes(q) || p.oem.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }

  const page = parts.slice(0, 50); // Show first 50
  tbody.innerHTML = page.map(p => `
    <tr>
      <td>${p.id}</td>
      <td class="part-name-cell"><span class="ar">${p.nameAr}</span><span class="en">${p.nameEn}</span></td>
      <td>${p.brand} ${p.model}</td>
      <td style="font-family:monospace;font-size:12px">${p.oem}</td>
      <td>$${p.priceUsd}</td>
      <td class="ar" style="font-weight:600">${formatEgp(getEgpPrice(p.priceUsd))}</td>
      <td>${p.stock === 'in-stock' ? '<span class="badge badge-success">متوفر</span>' : '<span class="badge badge-warning">طلب خاص</span>'}</td>
      <td><button class="btn btn-outline btn-sm" onclick="editPart(${p.id})">✏️</button></td>
    </tr>
  `).join('');

  const countEl = document.getElementById('parts-count');
  if (countEl) countEl.textContent = `${parts.length} قطعة`;
}

function editPart(id) {
  showToast('✏️ تعديل القطعة #' + id + ' — (mockup mode)');
}

// ===== ADMIN: PRICING =====
function initAdminPricing() {
  const rateInput = document.getElementById('rate-input');
  const rateDisplay = document.getElementById('rate-display');
  const effectiveRate = document.getElementById('effective-rate');

  if (rateInput) rateInput.value = STATE.exchangeRate;
  if (rateDisplay) rateDisplay.textContent = STATE.exchangeRate;
  if (effectiveRate) effectiveRate.textContent = Math.max(50, STATE.exchangeRate);

  renderPricePreview();
}

function updateRate() {
  const rateInput = document.getElementById('rate-input');
  if (!rateInput) return;
  const newRate = parseFloat(rateInput.value);
  if (isNaN(newRate) || newRate <= 0) return showToast('⚠️ سعر غير صالح');
  STATE.exchangeRate = newRate;
  saveState();
  const effectiveRate = document.getElementById('effective-rate');
  const rateDisplay = document.getElementById('rate-display');
  if (rateDisplay) rateDisplay.textContent = newRate;
  if (effectiveRate) effectiveRate.textContent = Math.max(50, newRate);
  renderPricePreview();
  showToast('✅ تم تحديث سعر الصرف');
}

function renderPricePreview() {
  const tbody = document.getElementById('price-preview-tbody');
  if (!tbody) return;
  const samples = [
    { name: 'Front Bumper BMW 3 Series', nameAr: 'إكصدام أمامي BMW 3 Series', usd: 180 },
    { name: 'Headlamp Mercedes C-Class', nameAr: 'فانوس أمامي Mercedes C-Class', usd: 250 },
    { name: 'Brake Pads BMW X5', nameAr: 'تيل فرامل BMW X5', usd: 45 },
    { name: 'Side Mirror Mercedes GLC', nameAr: 'مرايا جانبية Mercedes GLC', usd: 120 },
    { name: 'Radiator BMW 5 Series', nameAr: 'ريداتير BMW 5 Series', usd: 95 },
    { name: 'Front Grille Mercedes E-Class', nameAr: 'شبكة أمامية Mercedes E-Class', usd: 85 },
  ];
  tbody.innerHTML = samples.map(s => `
    <tr>
      <td class="part-name-cell"><span class="ar">${s.nameAr}</span><span class="en">${s.name}</span></td>
      <td>$${s.usd}</td>
      <td class="ar" style="font-weight:700;font-size:16px">${formatEgp(s.usd * Math.max(50, STATE.exchangeRate))}</td>
    </tr>
  `).join('');
}

// ===== ADMIN: ORDERS =====
function initAdminOrders() {
  renderAdminOrders();
}

function renderAdminOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = STATE.orders.map(o => `
    <tr>
      <td><strong>#${o.id}</strong></td>
      <td>${o.customer}</td>
      <td>${o.phone}</td>
      <td>${o.city}</td>
      <td>${o.date}</td>
      <td>${o.items.length} قطعة</td>
      <td class="ar" style="font-weight:700">${formatEgp(o.total)}</td>
      <td>${statusBadge(o.status)}</td>
      <td>
        <select class="form-control" style="padding:6px 8px;font-size:12px;width:auto" onchange="updateOrderStatus(${o.id}, this.value)">
          <option value="pending" ${o.status==='pending'?'selected':''}>قيد الانتظار</option>
          <option value="confirmed" ${o.status==='confirmed'?'selected':''}>مؤكد</option>
          <option value="shipped" ${o.status==='shipped'?'selected':''}>تم الشحن</option>
          <option value="delivered" ${o.status==='delivered'?'selected':''}>تم التوصيل</option>
        </select>
      </td>
    </tr>
  `).join('');
}

function updateOrderStatus(orderId, status) {
  const order = STATE.orders.find(o => o.id === orderId);
  if (order) { order.status = status; saveState(); showToast('✅ تم تحديث حالة الطلب'); renderAdminOrders(); }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  // Detect page
  const path = window.location.pathname;
  if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
    if (document.getElementById('featured-parts')) { initHomepage(); initCarSelector(); }
    if (document.getElementById('stat-orders')) initAdminDashboard();
  }
  if (path.includes('catalog')) initCatalog();
  if (path.includes('part.html')) initPartDetail();
  if (path.includes('cart')) initCart();
  if (document.getElementById('stat-orders') && path.includes('admin')) initAdminDashboard();
  if (document.getElementById('parts-tbody') && path.includes('parts')) initAdminParts();
  if (document.getElementById('rate-input')) initAdminPricing();
  if (document.getElementById('orders-tbody') && path.includes('orders')) initAdminOrders();

  // Admin parts search
  const adminSearch = document.getElementById('admin-parts-search');
  if (adminSearch) adminSearch.addEventListener('input', () => renderAdminParts(adminSearch.value));
});

// Qty buttons
function changeQty(delta) {
  const input = document.getElementById('qty-input');
  if (!input) return;
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  input.value = val;
}

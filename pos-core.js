// ==========================================================
// POS CORE ENGINE - BILINGUAL (EN / AR), BILLING & PRINTING
// ==========================================================

const FALLBACK_SHOPS = [
  { id: 'shop1', name: 'BROST', url: 'https://rgsoehlmucocfmoblxvr.supabase.co', key: 'sb_publishable_HBaYFMLtuNSD2ZcKffAbzA_-dkXWKCU', pin: '1111' }
];

function getAllShops() {
  if (typeof window.SHOPS_CONFIG !== 'undefined' && Array.isArray(window.SHOPS_CONFIG) && window.SHOPS_CONFIG.length > 0) {
    return window.SHOPS_CONFIG;
  }
  return FALLBACK_SHOPS;
}

// --- LANGUAGE DICTIONARY (ENGLISH & ARABIC) ---
let currentLang = localStorage.getItem('pos_lang') || 'en';

const i18n = {
  en: {
    pinTitle: "ENTER 4-DIGIT PIN",
    pinSubtitle: "Enter Shop PIN",
    pinClear: "CLEAR",
    pinDirect: "🍗 Direct Access (BROST)",
    masterText: "Select Branch to Open:",
    cancel: "Cancel",
    langToggle: "🌐 العربية",
    kdsScreen: "📺 KDS Screen",
    reports: "📊 Reports",
    settings: "⚙️ Settings",
    logout: "🔒 Logout",
    takeaway: "📦 Takeaway (سفري)",
    dinein: "🍽️ Dine-in (محلي)",
    phoneOrder: "📞 Phone Order (هاتف)",
    custPhonePlaceholder: "Customer Mobile (Optional)",
    btnBack: "⬅️ Categories (Back)",
    categoriesTitle: "Main Categories",
    cartTitle: "Order List",
    clearCart: "🗑️ Clear Cart",
    subtotal: "Subtotal:",
    vat: "VAT (15%):",
    total: "Total:",
    payCash: "💵 CASH (نقداً)",
    payCard: "💳 MADA / CARD (شبكة)",
    flavorTitle: "Select Flavor",
    flvNormal: "Normal (عادي)",
    flvSpicy: "Spicy 🌶️ (حار)",
    addBill: "Add to Bill",
    cashModalTitle: "💵 Cash Payment",
    billAmount: "Bill Amount:",
    changeDue: "Change Due:",
    printComplete: "Print & Complete",
    online: "ONLINE",
    offline: "OFFLINE (LOCAL)"
  },
  ar: {
    pinTitle: "أدخل الرقم السري (4 أرقام)",
    pinSubtitle: "أدخل الرقم السري للفرع",
    pinClear: "مسح",
    pinDirect: "🍗 الدخول المباشر (بروست)",
    masterText: "اختر الفرع لفتحه:",
    cancel: "إلغاء",
    langToggle: "🌐 English",
    kdsScreen: "📺 شاشة المطبخ",
    reports: "📊 التقارير",
    settings: "⚙️ الإعدادات",
    logout: "🔒 تسجيل خروج",
    takeaway: "📦 سفري (Takeaway)",
    dinein: "🍽️ محلي (Dine-in)",
    phoneOrder: "📞 طلب هاتف (Phone)",
    custPhonePlaceholder: "رقم جوال العميل (اختياري)",
    btnBack: "⬅️ الأقسام (رجوع)",
    categoriesTitle: "الأقسام الرئيسية",
    cartTitle: "قائمة الطلب",
    clearCart: "🗑️ إلغاء الطلب",
    subtotal: "المجموع الفرعي:",
    vat: "ضريبة القيمة المضافة (15%):",
    total: "الإجمالي النهائي:",
    payCash: "💵 نقداً (CASH)",
    payCard: "💳 شبكة / مدى (MADA)",
    flavorTitle: "اختر النكهة",
    flvNormal: "عادي (Normal)",
    flvSpicy: "حار 🌶️ (Spicy)",
    addBill: "إضافة للطلب",
    cashModalTitle: "💵 الدفع نقداً",
    billAmount: "مبلغ الفاتورة:",
    changeDue: "المبلغ المتبقي:",
    printComplete: "طباعة وإنهاء",
    online: "متصل (ONLINE)",
    offline: "غير متصل (LOCAL)"
  }
};

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  localStorage.setItem('pos_lang', currentLang);
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = i18n[lang];

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  const setPlaceholder = (id, val) => { const el = document.getElementById(id); if (el) el.placeholder = val; };

  setText('ui-pin-title', t.pinTitle);
  setText('ui-pin-subtitle', t.pinSubtitle);
  setText('ui-pin-clear', t.pinClear);
  setText('ui-pin-direct-btn', t.pinDirect);
  setText('ui-master-select-text', t.masterText);
  setText('ui-master-cancel', t.cancel);
  setText('btn-lang-toggle', t.langToggle);
  setText('ui-btn-kds', t.kdsScreen);
  setText('ui-btn-reports', t.reports);
  setText('ui-btn-settings', t.settings);
  setText('ui-btn-logout', t.logout);
  setText('btn-type-takeaway', t.takeaway);
  setText('btn-type-dinein', t.dinein);
  setText('btn-type-phone', t.phoneOrder);
  setPlaceholder('cust-phone', t.custPhonePlaceholder);
  setText('btn-back', t.btnBack);
  if (currentView === 'categories') {
    setText('current-title', t.categoriesTitle);
  }
  setText('ui-cart-title', t.cartTitle);
  setText('ui-btn-clear-cart', t.clearCart);
  setText('ui-lbl-subtotal', t.subtotal);
  setText('ui-lbl-vat', t.vat);
  setText('ui-lbl-total', t.total);
  setText('ui-btn-pay-cash', t.payCash);
  setText('ui-btn-pay-card', t.payCard);
  setText('flavor-modal-title', t.flavorTitle);
  setText('ui-flv-normal', t.flvNormal);
  setText('ui-flv-spicy', t.flvSpicy);
  setText('ui-btn-flv-cancel', t.cancel);
  setText('ui-btn-flv-confirm', t.addBill);
  setText('ui-cash-modal-title', t.cashModalTitle);
  setText('ui-cash-lbl-bill', t.billAmount);
  setText('ui-cash-lbl-change', t.changeDue);
  setText('ui-btn-cash-cancel', t.cancel);
  setText('ui-btn-cash-confirm', t.printComplete);

  updateNetworkStatus();
}

// Global POS State
let enteredPin = "";
let currentShop = null;
let supabaseClient = null;
let kdsChannel = null;
try { kdsChannel = new BroadcastChannel('broast_pos_channel'); } catch(e) {}

let shop = { nameAr: "مطعم البروستد الذهبي", nameEn: "Golden Broasted Restaurant", vatNo: "310123456700003", phone: "0551234567" };

let kitchenStations = [
  { id: "main_kitchen", name: "Main Kitchen", routing: "Both", pin: "1111" },
  { id: "broast_station", name: "Broast Station", routing: "Both", pin: "1001" },
  { id: "drinks_counter", name: "Drinks Counter", routing: "Display Only", pin: "1002" }
];

let categories = [
  { id: "broast", name: "Broasted (بروستد)", icon: "🍗", station: "Broast Station" },
  { id: "potatoes", name: "Potatoes (بطاطس)", icon: "🍟", station: "Broast Station" },
  { id: "drinks", name: "Drinks (مشروبات)", icon: "🥤", station: "Drinks Counter" },
  { id: "addons", name: "Add-ons (إضافات)", icon: "➕", station: "Main Kitchen" }
];

let items = [
  { id: 1, name: "4 Pcs Broast (بروستد 4 قطع)", price: 18.00, catId: "broast", hasFlavor: true, img: "" },
  { id: 2, name: "8 Pcs Broast (بروستد 8 قطع)", price: 34.00, catId: "broast", hasFlavor: true, img: "" },
  { id: 3, name: "Potatoes Small (بطاطس صغير)", price: 5.00, catId: "potatoes", hasFlavor: false, img: "" },
  { id: 4, name: "Pepsi (بيبسي)", price: 3.50, catId: "drinks", hasFlavor: false, img: "" },
  { id: 5, name: "Thoom / Garlic (ثوم)", price: 1.00, catId: "addons", hasFlavor: false, img: "" }
];

let orderHistory = [];
let printerMode = 'combined';
let currentShiftNo = 1;

let cart = [];
let currentView = 'categories';
let selectedTempItem = null;
let activeOrderType = "Takeaway";
let editingItemId = null;
let editingCatId = null;
let editingStId = null;
let tempImageBase64 = "";

// --- Network Status Indicator ---
function updateNetworkStatus() {
  const badge = document.getElementById('network-status-badge');
  if (!badge) return;
  const t = i18n[currentLang];
  if (navigator.onLine) {
    badge.innerText = t.online;
    badge.style.background = "#16a34a";
  } else {
    badge.innerText = t.offline;
    badge.style.background = "#e11d48";
  }
}
window.addEventListener('online', () => { updateNetworkStatus(); syncPendingOfflineOrders(); });
window.addEventListener('offline', updateNetworkStatus);

// --- Saudi 6:00 AM Restaurant Cut-off Date ---
function getSaudiBusinessDate() {
  const now = new Date();
  const saudiTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3 * 3600000));
  if (saudiTime.getHours() < 6) {
    saudiTime.setDate(saudiTime.getDate() - 1);
  }
  return saudiTime.toISOString().slice(0, 10);
}

// --- 4-Digit Direct PIN Authentication ---
function pressKey(num) {
  if (enteredPin.length < 4) {
    enteredPin += String(num);
    updatePinDots();
    clearPinError();
    if (enteredPin.length === 4) {
      setTimeout(verify4DigitPin, 100);
    }
  }
}

function pressBackspace() {
  if (enteredPin.length > 0) {
    enteredPin = enteredPin.slice(0, -1);
    updatePinDots();
    clearPinError();
  }
}

function clearPinInput() {
  enteredPin = "";
  updatePinDots();
  clearPinError();
}

function clearPinError() {
  const el = document.getElementById('pin-error-msg');
  if (el) el.innerText = '';
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) dot.classList.toggle('filled', i < enteredPin.length);
  }
}

function verify4DigitPin() {
  const masterPin = typeof window.MASTER_PIN !== 'undefined' ? String(window.MASTER_PIN).trim() : "0000";
  const shops = getAllShops();

  if (enteredPin === masterPin) {
    openMasterBranchPicker();
    return;
  }

  let matchedShop = shops.find(s => String(s.pin).trim() === enteredPin);
  if (!matchedShop && (enteredPin === "1111" || enteredPin === "1234")) {
    matchedShop = shops[0];
  }

  if (matchedShop) {
    activateShopSession(matchedShop);
  } else {
    const err = document.getElementById('pin-error-msg');
    if (err) err.innerText = currentLang === 'ar' ? "❌ رمز غير صحيح! (1111 أو 1234)" : "❌ Invalid PIN! (1111 or 1234)";
    setTimeout(clearPinInput, 800);
  }
}

function directOpenShop() {
  const shops = getAllShops();
  if (shops.length > 0) activateShopSession(shops[0]);
}

function openMasterBranchPicker() {
  const picker = document.getElementById('master-branch-picker');
  const container = document.getElementById('master-branches-container');
  container.innerHTML = '';
  picker.style.display = 'flex';

  getAllShops().forEach(s => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-top';
    btn.style.cssText = 'padding:14px; font-size:13px; background:#0f172a; border:1px solid #475569;';
    btn.innerText = `${s.name} (${s.pin})`;
    btn.onclick = () => {
      picker.style.display = 'none';
      activateShopSession(s);
    };
    container.appendChild(btn);
  });
}

// --- Session Activation & Instant Rendering ---
async function activateShopSession(s) {
  currentShop = s;
  localStorage.setItem('pos_active_shop_id', s.id);

  const overlay = document.getElementById('pin-lock-overlay');
  if (overlay) overlay.style.display = 'none';
  clearPinInput();

  const nameEl = document.getElementById('top-shop-name');
  if (nameEl) nameEl.innerText = s.name;

  const badgeEl = document.getElementById('top-shop-badge');
  if (badgeEl) badgeEl.innerText = (s.id || 'SHOP').toUpperCase();

  const dateEl = document.getElementById('business-date-badge');
  if (dateEl) dateEl.innerText = `📅 Shift: ${getSaudiBusinessDate()}`;
  updateNetworkStatus();

  // Load Local Persistence
  loadLocalState(s.id);

  // Apply Language & Render
  applyLanguage(currentLang);
  showCategories();
  updateTokenDisplay();

  // Connect Supabase Cloud Sync
  if (s.url && s.key && window.supabase) {
    supabaseClient = window.supabase.createClient(s.url, s.key);
    syncCloudData(s.id).then(() => {
      showCategories();
      updateTokenDisplay();
    });
  }

  syncPendingOfflineOrders();
}

function loadLocalState(shopId) {
  const savedOrders = localStorage.getItem(`pos_orders_${shopId}`);
  if (savedOrders) {
    try { orderHistory = JSON.parse(savedOrders); } catch(e) {}
  } else {
    orderHistory = [];
  }

  const savedShift = localStorage.getItem(`pos_shift_no_${shopId}`);
  currentShiftNo = savedShift ? parseInt(savedShift) : 1;

  const savedStations = localStorage.getItem(`pos_stations_${shopId}`);
  if (savedStations) {
    try { kitchenStations = JSON.parse(savedStations); } catch(e) {}
  }

  const savedCats = localStorage.getItem(`pos_cats_${shopId}`);
  if (savedCats) {
    try { categories = JSON.parse(savedCats); } catch(e) {}
  }

  const savedItems = localStorage.getItem(`pos_items_${shopId}`);
  if (savedItems) {
    try { items = JSON.parse(savedItems); } catch(e) {}
  }

  const savedShop = localStorage.getItem(`pos_shop_${shopId}`);
  if (savedShop) {
    try { shop = JSON.parse(savedShop); } catch(e) {}
  }
}

function saveLocalState(shopId) {
  localStorage.setItem(`pos_orders_${shopId}`, JSON.stringify(orderHistory));
  localStorage.setItem(`pos_shift_no_${shopId}`, currentShiftNo.toString());
  localStorage.setItem(`pos_stations_${shopId}`, JSON.stringify(kitchenStations));
  localStorage.setItem(`pos_cats_${shopId}`, JSON.stringify(categories));
  localStorage.setItem(`pos_items_${shopId}`, JSON.stringify(items));
  localStorage.setItem(`pos_shop_${shopId}`, JSON.stringify(shop));
}

function lockPOS() {
  currentShop = null;
  supabaseClient = null;
  localStorage.removeItem('pos_active_shop_id');
  clearPinInput();
  document.getElementById('pin-lock-overlay').style.display = 'flex';
}

// --- Background Cloud Sync ---
async function syncCloudData(shopId) {
  if (!supabaseClient || !navigator.onLine) return;
  try {
    const { data: stData } = await supabaseClient.from('kitchen_stations').select('*').eq('shop_id', shopId);
    if (stData && stData.length > 0) kitchenStations = stData;

    const { data: catData } = await supabaseClient.from('categories').select('*').eq('shop_id', shopId);
    if (catData && catData.length > 0) categories = catData;

    const { data: itemData } = await supabaseClient.from('menu_items').select('*').eq('shop_id', shopId);
    if (itemData && itemData.length > 0) {
      items = itemData.map(i => ({ id: i.id, name: i.name, price: parseFloat(i.price), catId: i.cat_id, hasFlavor: i.has_flavor, img: i.img }));
    }

    const { data: profile } = await supabaseClient.from('shop_settings').select('*').eq('shop_id', shopId).single();
    if (profile) {
      shop = { nameAr: profile.name_ar, nameEn: profile.name_en, vatNo: profile.vat_no, phone: profile.phone };
      printerMode = profile.printer_mode || 'combined';
    }

    const bDate = getSaudiBusinessDate();
    const { data: cloudOrders } = await supabaseClient.from('orders').select('*').eq('shop_id', shopId).eq('business_date', bDate).order('id', { ascending: false });
    if (cloudOrders && cloudOrders.length > 0) {
      cloudOrders.forEach(co => {
        if (!orderHistory.find(lo => String(lo.id) === String(co.id))) {
          orderHistory.unshift(co);
        }
      });
    }

    saveLocalState(shopId);
  } catch (err) {
    console.warn("Background cloud sync notice:", err);
  }
}

function updateHeaderInfo() {
  const now = new Date();
  const el = document.getElementById('current-date-time');
  if (el) el.innerText = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
}
setInterval(updateHeaderInfo, 1000);

function getNextToken() {
  const bDate = getSaudiBusinessDate();
  const todays = orderHistory.filter(o => o.business_date === bDate);
  return "Token #" + String(todays.length + 1).padStart(2, '0');
}

function updateTokenDisplay() {
  const el = document.getElementById('token-display');
  if (el) el.innerText = getNextToken();
}

function setOrderType(type, btn) {
  activeOrderType = type;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// --- Menu Navigation & Cart Actions ---
function showCategories() {
  currentView = 'categories';
  const backBtn = document.getElementById('btn-back');
  if (backBtn) backBtn.style.display = 'none';
  const title = document.getElementById('current-title');
  if (title) title.innerText = i18n[currentLang].categoriesTitle;

  const grid = document.getElementById('pos-grid');
  if (!grid) return;
  grid.innerHTML = '';

  categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'pos-card';
    card.innerHTML = `
      <div class="card-icon">${cat.icon || '📁'}</div>
      <div class="card-info"><h4>${cat.name}</h4><small style="color:#64748b; font-size:10px;">${cat.station || ''}</small></div>
    `;
    card.onclick = () => showItemsOfCategory(cat);
    grid.appendChild(card);
  });
}

function showItemsOfCategory(cat) {
  currentView = cat.id;
  const backBtn = document.getElementById('btn-back');
  if (backBtn) backBtn.style.display = 'block';
  const title = document.getElementById('current-title');
  if (title) title.innerText = `${cat.name}`;

  const grid = document.getElementById('pos-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const filtered = items.filter(it => it.catId === cat.id);

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'pos-card';
    card.innerHTML = `
      ${item.img ? `<img src="${item.img}" class="card-img" alt="">` : `<div class="card-icon">🍗</div>`}
      <div class="card-info">
        <h4>${item.name}</h4>
        <div class="price">${item.price.toFixed(2)} SAR</div>
      </div>
    `;
    card.onclick = () => handleItemSelect(item, cat);
    grid.appendChild(card);
  });
}

function handleItemSelect(item, cat) {
  if (item.hasFlavor) {
    selectedTempItem = { ...item, station: cat ? cat.station : 'Main Kitchen' };
    document.getElementById('flavor-modal-title').innerText = item.name;
    document.getElementById('flavor-modal').style.display = 'flex';
  } else {
    addToCart(item.name, item.price, cat ? cat.station : 'Main Kitchen');
    showCategories();
  }
}

function confirmBroastFlavor() {
  const spice = document.querySelector('input[name="spice"]:checked').value;
  const spiceLabel = spice === 'Spicy' ? '(حار / Spicy)' : '(عادي / Normal)';
  addToCart(`${selectedTempItem.name} ${spiceLabel}`, selectedTempItem.price, selectedTempItem.station);
  closeModals();
  showCategories();
}

function closeModals() {
  document.querySelectorAll('.modal-backdrop').forEach(m => m.style.display = 'none');
}

function addToCart(name, price, station) {
  const exist = cart.find(i => i.name === name);
  if (exist) exist.qty += 1;
  else cart.push({ name, price, qty: 1, station: station || 'Main Kitchen' });
  updateCartUI();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartUI();
}

function clearCart() {
  if (cart.length === 0) return;
  const msg = currentLang === 'ar' ? "هل تريد إلغاء هذا الطلب بالكامل؟" : "Clear this order completely?";
  if (confirm(msg)) {
    cart = [];
    document.getElementById('cust-phone').value = '';
    updateCartUI();
  }
}

function updateCartUI() {
  const list = document.getElementById('cart-list');
  if (!list) return;
  list.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    list.innerHTML += `
      <div class="cart-row">
        <div style="flex:1;">
          <strong>${item.name}</strong>
          <div style="color:#64748b; font-size:11px;">${item.price.toFixed(2)} SAR | [${item.station}]</div>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
        </div>
        <div style="font-weight:bold; width:60px; text-align:right;">${itemTotal.toFixed(2)}</div>
      </div>
    `;
  });

  const subtotal = total / 1.15;
  const vat = total - subtotal;
  document.getElementById('subtotal').innerText = subtotal.toFixed(2) + " SAR";
  document.getElementById('vat').innerText = vat.toFixed(2) + " SAR";
  document.getElementById('grand-total').innerText = total.toFixed(2) + " SAR";
}

function openCashPaymentModal() {
  if (cart.length === 0) return alert(currentLang === 'ar' ? "السلة فارغة!" : "Cart is empty!");
  const total = parseFloat(document.getElementById('grand-total').innerText);
  document.getElementById('cash-bill-amt').innerText = total.toFixed(2) + " SAR";
  document.getElementById('cash-received-input').value = total.toFixed(2);
  document.getElementById('cash-change-amt').innerText = "0.00";
  document.getElementById('cash-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('cash-received-input').select(), 100);
}

function calculateChange() {
  const total = parseFloat(document.getElementById('grand-total').innerText);
  const rec = parseFloat(document.getElementById('cash-received-input').value) || 0;
  const change = rec - total;
  document.getElementById('cash-change-amt').innerText = (change > 0 ? change : 0).toFixed(2);
}

function processCardPayment() {
  if (cart.length === 0) return alert(currentLang === 'ar' ? "السلة فارغة!" : "Cart is empty!");
  finalizeOrder('Mada/Card');
}

// --- Order Finalization with Clean Supabase Mapping ---
async function finalizeOrder(method) {
  closeModals();
  const grandTotal = parseFloat(document.getElementById('grand-total').innerText);
  const subtotal = grandTotal / 1.15;
  const vat = grandTotal - subtotal;
  const token = getNextToken();
  const phone = document.getElementById('cust-phone').value.trim();
  const bDate = getSaudiBusinessDate();
  const timeStr = new Date().toLocaleTimeString();
  const shopId = currentShop ? currentShop.id : 'shop1';

  const orderObj = {
    id: Date.now(),
    shop_id: shopId,
    business_date: bDate,
    shift_no: currentShiftNo,
    time: timeStr,
    token: token,
    order_type: activeOrderType,
    customer_phone: phone,
    items: [...cart],
    subtotal: subtotal,
    vat: vat,
    total: grandTotal,
    payment_method: method,
    status: 'pending'
  };

  // 1. Local Storage
  orderHistory.unshift(orderObj);
  saveLocalState(shopId);

  // 2. KDS Broadcast
  if (kdsChannel) {
    try { kdsChannel.postMessage({ type: 'NEW_ORDER', order: orderObj }); } catch(e) {}
  }

  // 3. Supabase Insert Payload
  const dbOrderPayload = {
    id: orderObj.id,
    shop_id: orderObj.shop_id,
    business_date: orderObj.business_date,
    shift_no: orderObj.shift_no,
    token: orderObj.token,
    order_type: orderObj.order_type,
    customer_phone: orderObj.customer_phone || null,
    items: orderObj.items,
    subtotal: orderObj.subtotal,
    vat: orderObj.vat,
    total: orderObj.total,
    payment_method: orderObj.payment_method,
    status: 'pending'
  };

  saveToOfflineQueue(dbOrderPayload);

  if (navigator.onLine && supabaseClient) {
    try {
      const { error } = await supabaseClient.from('orders').insert([dbOrderPayload]);
      if (!error) {
        markSynced(orderObj.id);
      } else {
        console.warn("Supabase insert notice:", error);
      }
    } catch (e) {
      console.warn("Saved offline, will sync:", e);
    }
  }

  cart = [];
  document.getElementById('cust-phone').value = '';
  updateCartUI();
  updateTokenDisplay();
  showCategories();

  executeDirectPrint(orderObj);
}

function saveToOfflineQueue(orderPayload) {
  let q = JSON.parse(localStorage.getItem('pos_pending_sync')) || [];
  q.push(orderPayload);
  localStorage.setItem('pos_pending_sync', JSON.stringify(q));
}

function markSynced(orderId) {
  let q = JSON.parse(localStorage.getItem('pos_pending_sync')) || [];
  q = q.filter(o => String(o.id) !== String(orderId));
  localStorage.setItem('pos_pending_sync', JSON.stringify(q));
}

async function syncPendingOfflineOrders() {
  if (!navigator.onLine || !supabaseClient) return;
  let q = JSON.parse(localStorage.getItem('pos_pending_sync')) || [];
  if (q.length === 0) return;

  for (let order of [...q]) {
    try {
      const { error } = await supabaseClient.from('orders').upsert([order]);
      if (!error) markSynced(order.id);
    } catch(e) {}
  }
}

// --- Bilingual Thermal Direct Kiosk Printing (ZATCA Compliant) ---
function executeDirectPrint(order) {
  const printArea = document.getElementById('print-area');
  try {
    if (printerMode === 'combined') {
      printArea.innerHTML = getCustomerBillHTML(order) + `
        <div class="cut-line">---------------- CUT HERE ----------------</div>
      ` + getKitchenSlipHTML(order);
    } else {
      printArea.innerHTML = getCustomerBillHTML(order);
    }

    renderQRIntoElement('print-qrcode', order);

    setTimeout(() => {
      try { window.print(); } catch(err) {}
    }, 300);
  } catch (err) {}
}

function getCustomerBillHTML(order) {
  let itemsRows = order.items.map(it => `
    <div class="receipt-row">
      <span style="flex:2;">${it.name}</span>
      <span style="flex:0.5; text-align:center;">${it.qty}</span>
      <span style="flex:1; text-align:right;">${(it.price * it.qty).toFixed(2)}</span>
    </div>
  `).join('');

  const payMethodAr = order.payment_method === 'Cash' ? 'نقداً (Cash)' : 'شبكة / مدى (Mada)';
  const orderTypeAr = order.order_type === 'Takeaway' ? 'سفري / Takeaway' : (order.order_type === 'Dine-in' ? 'محلي / Dine-in' : 'هاتف / Phone');

  return `
    <div class="receipt-center">
      <h2 style="margin:2px 0; font-size:16px;">${shop.nameAr}</h2>
      <div style="font-size:12px; font-weight:bold;">${currentShop ? currentShop.name : shop.nameEn}</div>
      <div style="font-size:11px;">فاتورة ضريبية مبسطة</div>
      <div style="font-size:10px;">Simplified Tax Invoice</div>
      <div style="font-size:11px; margin-top:2px;">الرقم الضريبي / VAT: ${shop.vatNo}</div>
      <div style="font-size:11px;">الهاتف / Tel: ${shop.phone}</div>
      <div class="receipt-line"></div>
      <h1 style="margin: 2px 0; font-size:26px;">${order.token}</h1>
      <div class="receipt-bold" style="font-size:13px;">${orderTypeAr} [Shift #${order.shift_no}]</div>
      ${order.customer_phone ? `<div style="font-size:11px; font-weight:bold;">Customer Mob: ${order.customer_phone}</div>` : ''}
      <div style="font-size:10px; margin-top:2px;">Shift Date: ${order.business_date} | Time: ${order.time}</div>
    </div>
    <div class="receipt-line"></div>
    <div class="receipt-row receipt-bold" style="font-size:11px;">
      <span>الصنف / ITEM</span>
      <span>العدد</span>
      <span>المجموع</span>
    </div>
    <div class="receipt-line"></div>
    ${itemsRows}
    <div class="receipt-line"></div>
    <div class="receipt-row"><span>المجموع الفرعي (Subtotal):</span><span>${order.subtotal.toFixed(2)}</span></div>
    <div class="receipt-row"><span>ضريبة القيمة المضافة 15% (VAT):</span><span>${order.vat.toFixed(2)}</span></div>
    <div class="receipt-row receipt-bold" style="font-size:14px;"><span>الإجمالي (TOTAL):</span><span>${order.total.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>طريقة الدفع (Payment):</span><span>${payMethodAr}</span></div>
    <div class="qr-center"><div id="print-qrcode"></div></div>
    <div class="receipt-center" style="font-size:10px;">شكراً لزيارتكم<br>Thank you for your visit</div>
  `;
}

function getKitchenSlipHTML(order) {
  let itemsRows = order.items.map(it => `
    <div class="receipt-row" style="font-size:14px; font-weight:bold; margin:6px 0;">
      <span style="flex:2.5;">${it.name}</span>
      <span style="flex:1; text-align:right; font-size:16px;">[ X ${it.qty} ]</span>
    </div>
  `).join('');

  return `
    <div class="receipt-center">
      <h2 style="font-size:18px; margin:2px 0;">*** تذكرة المطبخ / KITCHEN ***</h2>
      <h1 style="font-size:30px; margin:4px 0;">${order.token}</h1>
      <div style="font-size:14px; font-weight:bold;">${order.order_type} [Shift #${order.shift_no}]</div>
      ${order.customer_phone ? `<div style="font-size:12px; font-weight:bold; margin:3px 0;">Customer Mob: ${order.customer_phone}</div>` : ''}
      <div style="font-size:11px;">Date: ${order.business_date} | ${order.time}</div>
    </div>
    <div class="receipt-line"></div>
    ${itemsRows}
    <div class="receipt-line"></div>
  `;
}

// --- ZATCA Phase-2 Base64 TLV QR Generation ---
function getTLV(tagNum, tagValue) {
  const encoder = new TextEncoder();
  const valBytes = encoder.encode(tagValue);
  const res = new Uint8Array(2 + valBytes.length);
  res[0] = tagNum; res[1] = valBytes.length; res.set(valBytes, 2);
  return res;
}

function generateZatcaQRBase64(seller, vatNo, timestamp, total, vat) {
  try {
    const t1 = getTLV(1, seller);
    const t2 = getTLV(2, vatNo);
    const t3 = getTLV(3, timestamp);
    const t4 = getTLV(4, total.toFixed(2));
    const t5 = getTLV(5, vat.toFixed(2));
    const totalLen = t1.length + t2.length + t3.length + t4.length + t5.length;
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    [t1, t2, t3, t4, t5].forEach(t => { combined.set(t, offset); offset += t.length; });
    let bin = '';
    for (let i = 0; i < combined.length; i++) bin += String.fromCharCode(combined[i]);
    return btoa(bin);
  } catch(e) { return ""; }
}

function renderQRIntoElement(elId, order) {
  const target = document.getElementById(elId);
  if (!target) return;
  target.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    try {
      const qrData = generateZatcaQRBase64(shop.nameAr, shop.vatNo, `${order.business_date}T${order.time}Z`, order.total, order.vat);
      new QRCode(target, { text: qrData, width: 95, height: 95, correctLevel: QRCode.CorrectLevel.M });
    } catch(e) {}
  }
}

// --- Kitchen Stations Management ---
async function saveKitchenStation() {
  const name = document.getElementById('new-station-name').value.trim();
  const routing = document.getElementById('new-station-routing').value;
  const pin = document.getElementById('new-station-pin').value.trim() || '1111';
  const shopId = currentShop ? currentShop.id : 'shop1';

  if (!name) return alert(currentLang === 'ar' ? "يرجى كتابة اسم القسم!" : "Enter station name!");

  let stObj = null;
  if (editingStId) {
    stObj = kitchenStations.find(s => s.id === editingStId);
    if (stObj) {
      stObj.name = name;
      stObj.routing = routing;
      stObj.pin = pin;
    }
  } else {
    const id = name.toLowerCase().replace(/\s+/g, '_');
    stObj = { id, name, routing, pin, shop_id: shopId };
    kitchenStations.push(stObj);
  }

  saveLocalState(shopId);
  resetStationForm();
  renderStationsTable();
  populateStationDropdowns();

  if (supabaseClient && navigator.onLine) {
    try {
      await supabaseClient.from('kitchen_stations').upsert([stObj]);
    } catch(e) {}
  }
}

function startEditStation(id) {
  const st = kitchenStations.find(s => s.id === id);
  if (!st) return;
  editingStId = st.id;
  document.getElementById('st-form-title').innerText = `Edit Station: "${st.name}"`;
  document.getElementById('new-station-name').value = st.name;
  document.getElementById('new-station-routing').value = st.routing || 'Both';
  document.getElementById('new-station-pin').value = st.pin || '1111';
  document.getElementById('btn-save-st').innerText = "Update";
  document.getElementById('btn-cancel-st').style.display = 'inline-block';
}

function resetStationForm() {
  editingStId = null;
  document.getElementById('st-form-title').innerText = "🧑‍🍳 Kitchen Station Management:";
  document.getElementById('new-station-name').value = '';
  document.getElementById('new-station-routing').value = 'Both';
  document.getElementById('new-station-pin').value = '';
  document.getElementById('btn-save-st').innerText = "Save";
  document.getElementById('btn-cancel-st').style.display = 'none';
}

async function deleteStation(id) {
  const msg = currentLang === 'ar' ? "هل أنت متأكد من حذف هذا القسم؟" : "Delete this kitchen station?";
  if (!confirm(msg)) return;
  const shopId = currentShop ? currentShop.id : 'shop1';
  kitchenStations = kitchenStations.filter(s => s.id !== id);

  saveLocalState(shopId);
  renderStationsTable();
  populateStationDropdowns();

  if (supabaseClient && navigator.onLine) {
    try {
      await supabaseClient.from('kitchen_stations').delete().match({ id, shop_id: shopId });
    } catch(e) {}
  }
}

function renderStationsTable() {
  const tbody = document.getElementById('stations-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  kitchenStations.forEach(st => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${st.name}</strong></td>
        <td>${st.routing || 'Both'}</td>
        <td style="text-align:center; font-family:monospace; font-weight:bold; color:#f59e0b;">${st.pin || '1111'}</td>
        <td>
          <button onclick="startEditStation('${st.id}')" style="background:#0284c7; color:#fff; border:none; padding:2px 6px; border-radius:3px; cursor:pointer;">Edit</button>
          <button onclick="deleteStation('${st.id}')" style="background:#ef4444; color:#fff; border:none; padding:2px 6px; border-radius:3px; cursor:pointer;">Delete</button>
        </td>
      </tr>
    `;
  });
}

function populateStationDropdowns() {
  const catStationSelect = document.getElementById('cat-station-select');
  if (!catStationSelect) return;
  catStationSelect.innerHTML = '';
  kitchenStations.forEach(st => {
    catStationSelect.innerHTML += `<option value="${st.name}">${st.name}</option>`;
  });
}

// --- Category Management ---
async function saveCategoryToCloud() {
  const name = document.getElementById('cat-name-input').value.trim();
  const icon = document.getElementById('cat-icon-input').value.trim() || '📁';
  const station = document.getElementById('cat-station-select').value;
  const shopId = currentShop ? currentShop.id : 'shop1';

  if (!name) return alert(currentLang === 'ar' ? "يرجى كتابة اسم القسم!" : "Enter category name!");

  let targetCat = null;
  if (editingCatId) {
    targetCat = categories.find(c => c.id === editingCatId);
    if (targetCat) {
      targetCat.name = name;
      targetCat.icon = icon;
      targetCat.station = station;
    }
  } else {
    const id = name.toLowerCase().replace(/\s+/g, '_');
    targetCat = { id, shop_id: shopId, name, icon, station };
    categories.push(targetCat);
  }

  saveLocalState(shopId);
  resetCatForm();
  renderCatDropdown();
  renderCategoriesTable();
  showCategories();

  if (supabaseClient && navigator.onLine) {
    try {
      await supabaseClient.from('categories').upsert([targetCat]);
    } catch(e) {}
  }
}

function startEditCategory(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;
  editingCatId = cat.id;
  document.getElementById('cat-form-title').innerText = `Edit Category: "${cat.name}"`;
  document.getElementById('cat-name-input').value = cat.name;
  document.getElementById('cat-icon-input').value = cat.icon || '📁';
  document.getElementById('cat-station-select').value = cat.station || 'Main Kitchen';
  document.getElementById('btn-save-cat').innerText = "Update";
  document.getElementById('btn-cancel-cat-edit').style.display = 'inline-block';
}

function resetCatForm() {
  editingCatId = null;
  document.getElementById('cat-form-title').innerText = "📁 Category Management:";
  document.getElementById('cat-name-input').value = '';
  document.getElementById('cat-icon-input').value = '';
  document.getElementById('btn-save-cat').innerText = "Save";
  document.getElementById('btn-cancel-cat-edit').style.display = 'none';
}

async function deleteCategory(id) {
  const msg = currentLang === 'ar' ? "هل تريد حذف هذا القسم؟" : "Delete this category?";
  if (!confirm(msg)) return;
  const shopId = currentShop ? currentShop.id : 'shop1';
  categories = categories.filter(c => c.id !== id);

  saveLocalState(shopId);
  renderCatDropdown();
  renderCategoriesTable();
  showCategories();

  if (supabaseClient && navigator.onLine) {
    try {
      await supabaseClient.from('categories').delete().match({ id, shop_id: shopId });
    } catch(e) {}
  }
}

function renderCategoriesTable() {
  const tbody = document.getElementById('categories-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  categories.forEach(c => {
    tbody.innerHTML += `
      <tr>
        <td style="font-size:16px;">${c.icon || '📁'}</td>
        <td><strong>${c.name}</strong></td>
        <td>${c.station || 'Main Kitchen'}</td>
        <td>
          <button onclick="startEditCategory('${c.id}')" style="background:#0284c7; color:#fff; border:none; padding:2px 6px; border-radius:3px; cursor:pointer;">Edit</button>
          <button onclick="deleteCategory('${c.id}')" style="background:#ef4444; color:#fff; border:none; padding:2px 6px; border-radius:3px; cursor:pointer;">Delete</button>
        </td>
      </tr>
    `;
  });
}

function renderCatDropdown() {
  const sel = document.getElementById('item-cat-select');
  if (!sel) return;
  sel.innerHTML = '';
  categories.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name} (${c.station || 'Main'})</option>`);
}

// --- Menu Item Management ---
async function saveItemFromForm() {
  const name = document.getElementById('item-name-input').value.trim();
  const price = parseFloat(document.getElementById('item-price-input').value);
  const catId = document.getElementById('item-cat-select').value;
  const hasFlavor = document.getElementById('item-spicy-checkbox').checked;
  const shopId = currentShop ? currentShop.id : 'shop1';

  if (!name || isNaN(price)) return alert(currentLang === 'ar' ? "يرجى إدخال اسم وسعر صحيح!" : "Enter valid item name and price!");

  let target = null;
  if (editingItemId) {
    target = items.find(i => i.id === editingItemId);
    if (target) {
      target.name = name; target.price = price; target.catId = catId; target.hasFlavor = hasFlavor;
      if (tempImageBase64) target.img = tempImageBase64;
    }
  } else {
    target = { id: Date.now(), name, price, catId, hasFlavor, img: tempImageBase64 };
    items.push(target);
  }

  saveLocalState(shopId);
  resetItemForm();
  renderSettingsTable();
  showCategories();

  if (supabaseClient && navigator.onLine) {
    try {
      await supabaseClient.from('menu_items').upsert({
        id: target.id,
        shop_id: shopId,
        name: target.name,
        price: target.price,
        cat_id: target.catId,
        has_flavor: target.hasFlavor,
        img: target.img || null
      });
    } catch(e) {}
  }
}

function startEditItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  editingItemId = item.id;
  document.getElementById('item-form-title').innerText = `Edit Item: "${item.name}"`;
  document.getElementById('item-name-input').value = item.name;
  document.getElementById('item-price-input').value = item.price;
  document.getElementById('item-cat-select').value = item.catId;
  document.getElementById('item-spicy-checkbox').checked = item.hasFlavor;
  document.getElementById('btn-save-item').innerText = "Update";
  document.getElementById('btn-cancel-edit').style.display = 'inline-block';
}

function resetItemForm() {
  editingItemId = null;
  document.getElementById('item-form-title').innerText = "Add Menu Item:";
  document.getElementById('item-name-input').value = "";
  document.getElementById('item-price-input').value = "";
  document.getElementById('item-spicy-checkbox').checked = false;
  document.getElementById('btn-save-item').innerText = "Add Item";
  document.getElementById('btn-cancel-edit').style.display = 'none';
  removeSelectedImage();
}

function renderSettingsTable() {
  const tbody = document.getElementById('settings-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  items.forEach(item => {
    const cat = categories.find(c => c.id === item.catId);
    tbody.innerHTML += `
      <tr>
        <td>${item.img ? `<img src="${item.img}" class="thumb-preview">` : '🍗'}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.price.toFixed(2)} SAR</td>
        <td>${cat ? cat.name : item.catId}</td>
        <td>${item.hasFlavor ? '🌶️ Yes' : 'No'}</td>
        <td>
          <button onclick="startEditItem(${item.id})" style="background:#0284c7; color:#fff; border:none; padding:3px 7px; border-radius:4px; cursor:pointer;">Edit</button>
        </td>
      </tr>
    `;
  });
}

function handleImageFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width, height = img.height;
      if (width > 300) { height = Math.round(height * (300 / width)); width = 300; }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      tempImageBase64 = canvas.toDataURL('image/jpeg', 0.75);
      document.getElementById('item-preview-img').src = tempImageBase64;
      document.getElementById('item-preview-img').style.display = 'block';
      document.getElementById('item-remove-img-btn').style.display = 'inline-block';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeSelectedImage() {
  tempImageBase64 = "";
  const fileInp = document.getElementById('item-file-input');
  if (fileInp) fileInp.value = "";
  const prevImg = document.getElementById('item-preview-img');
  if (prevImg) prevImg.style.display = 'none';
  const remBtn = document.getElementById('item-remove-img-btn');
  if (remBtn) remBtn.style.display = 'none';
}

// --- Shop Profile Settings ---
function openSettingsModal() {
  document.getElementById('set-shop-ar').value = shop.nameAr;
  document.getElementById('set-shop-en').value = shop.nameEn;
  document.getElementById('set-vat-no').value = shop.vatNo;
  document.getElementById('set-phone').value = shop.phone;
  document.getElementById('set-printer-mode').value = printerMode;

  renderStationsTable();
  populateStationDropdowns();
  renderCatDropdown();
  renderCategoriesTable();
  renderSettingsTable();
  resetItemForm();
  resetCatForm();
  resetStationForm();
  document.getElementById('settings-modal').style.display = 'flex';
}

async function saveShopProfile() {
  shop.nameAr = document.getElementById('set-shop-ar').value.trim();
  shop.nameEn = document.getElementById('set-shop-en').value.trim();
  shop.vatNo = document.getElementById('set-vat-no').value.trim();
  shop.phone = document.getElementById('set-phone').value.trim();
  printerMode = document.getElementById('set-printer-mode').value;
  const shopId = currentShop ? currentShop.id : 'shop1';

  saveLocalState(shopId);

  if (supabaseClient && navigator.onLine) {
    try {
      await supabaseClient.from('shop_settings').upsert({
        shop_id: shopId,
        name_ar: shop.nameAr,
        name_en: shop.nameEn,
        vat_no: shop.vatNo,
        phone: shop.phone,
        printer_mode: printerMode
      });
      alert(currentLang === 'ar' ? "تم حفظ بيانات المنشأة بنجاح!" : "Shop settings saved!");
    } catch(e) {}
  }
}

// --- Physical Keyboard Support ---
window.addEventListener('keydown', (e) => {
  const overlay = document.getElementById('pin-lock-overlay');
  if (overlay && overlay.style.display !== 'none') {
    if (e.key >= '0' && e.key <= '9') pressKey(e.key);
    else if (e.key === 'Backspace') pressBackspace();
  }
});

// Auto-resume Active Session
const activeShopId = localStorage.getItem('pos_active_shop_id');
const existing = getAllShops().find(s => s.id === activeShopId);
if (existing) {
  activateShopSession(existing);
} else {
  const overlay = document.getElementById('pin-lock-overlay');
  if (overlay) overlay.style.display = 'flex';
}

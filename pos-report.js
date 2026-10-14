// ==========================================================
// POS REPORT ENGINE - SPLIT PAY, PETTY CASH, VOID & LOCAL SQLITE AUDIT
// ==========================================================

let cachedActiveReportOrders = [];
let cachedActivePettyCash = [];
let currentViewingLevel = "Full Day Total";

// --- Open Report Modal & Initialize Filters ---
async function openShiftAndZReportModal() {
  const bDate = getSaudiBusinessDate();
  const datePicker = document.getElementById('rep-calendar-picker');
  if (datePicker) datePicker.value = bDate;

  await updateShiftDropdownOptions(bDate);
  await loadAndRenderReport();

  const modal = document.getElementById('report-modal');
  if (modal) modal.style.display = 'flex';
}

// --- Populate Shifts Dropdown Based on Selected Date ---
async function updateShiftDropdownOptions(selectedDate) {
  const selector = document.getElementById('rep-shift-selector');
  if (!selector) return;

  const lang = localStorage.getItem('pos_lang') || 'en';
  const prevSelected = selector.value;

  const fullDayLabel = lang === 'ar' ? '🌟 إجمالي اليوم (Full Day)' : '🌟 Full Day Total (إجمالي اليوم)';
  const activeShiftLabel = lang === 'ar' ? `⚡ الوردية الحالية (Shift #${currentShiftNo})` : `⚡ Active Live Shift #${currentShiftNo}`;

  selector.innerHTML = `
    <option value="ALL">${fullDayLabel}</option>
    <option value="CURRENT">${activeShiftLabel}</option>
  `;

  const shopId = currentShop ? currentShop.id : 'shop1';
  let dateOrders = orderHistory.filter(o => o.business_date === selectedDate);

  if (supabaseClient && navigator.onLine) {
    try {
      const { data } = await supabaseClient
        .from('orders')
        .select('shift_no')
        .eq('shop_id', shopId)
        .eq('business_date', selectedDate);
      if (data && data.length > 0) {
        data.forEach(d => {
          if (!dateOrders.find(o => o.shift_no === d.shift_no)) {
            dateOrders.push({ shift_no: d.shift_no });
          }
        });
      }
    } catch (e) {}
  }

  const shiftsSet = new Set();
  dateOrders.forEach(o => {
    if (o.shift_no) shiftsSet.add(Number(o.shift_no));
  });

  Array.from(shiftsSet).sort((a, b) => a - b).forEach(sNo => {
    const opt = document.createElement('option');
    opt.value = String(sNo);
    opt.innerText = lang === 'ar' ? `🧑‍💼 وردية رقم #${sNo}` : `🧑‍💼 Shift #${sNo}`;
    selector.appendChild(opt);
  });

  if (Array.from(selector.options).some(o => o.value === prevSelected)) {
    selector.value = prevSelected;
  } else {
    selector.value = "ALL";
  }
}

// --- Filter Change Listener ---
async function onReportFilterChange() {
  await loadAndRenderReport();
}

// --- Fetch & Render Report Data (Split Pay, Petty Cash & Void Aware) ---
async function loadAndRenderReport() {
  const datePicker = document.getElementById('rep-calendar-picker');
  const selectedDate = datePicker ? datePicker.value : getSaudiBusinessDate();
  const shiftSelector = document.getElementById('rep-shift-selector');
  const selectedShiftFilter = shiftSelector ? shiftSelector.value : "ALL";
  const shopId = currentShop ? currentShop.id : 'shop1';
  const lang = localStorage.getItem('pos_lang') || 'en';

  // 1. Fetch Local State Orders
  let dateOrders = orderHistory.filter(o => o.business_date === selectedDate);
  let datePetty = pettyCashHistory.filter(p => p.business_date === selectedDate);

  // 2. Fetch from Local SQLite Server if available
  const serverIp = window.LOCAL_SERVER_IP || window.location.hostname || 'localhost';
  try {
    const srvRes = await fetch(`http://${serverIp}:3000/api/reports?shop_id=${shopId}&business_date=${selectedDate}`);
    if (srvRes.ok) {
      const srvOrders = await srvRes.json();
      if (Array.isArray(srvOrders)) {
        srvOrders.forEach(so => {
          if (!dateOrders.find(lo => String(lo.id) === String(so.id))) {
            dateOrders.push(so);
          }
        });
      }
    }
  } catch(e) {}

  // 3. Fetch Cloud Orders if Online
  if (supabaseClient && navigator.onLine) {
    try {
      const { data: cloudOrders } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('shop_id', shopId)
        .eq('business_date', selectedDate);

      if (cloudOrders && cloudOrders.length > 0) {
        cloudOrders.forEach(co => {
          if (!dateOrders.find(lo => String(lo.id) === String(co.id))) {
            dateOrders.push(co);
          }
        });
      }

      const { data: cloudPetty } = await supabaseClient
        .from('petty_cash')
        .select('*')
        .eq('shop_id', shopId)
        .eq('business_date', selectedDate);

      if (cloudPetty && cloudPetty.length > 0) {
        cloudPetty.forEach(cp => {
          if (!datePetty.find(lp => String(lp.id) === String(cp.id))) {
            datePetty.push(cp);
          }
        });
      }
    } catch (e) {}
  }

  // 4. Apply Shift Filters
  let filteredOrders = [];
  let filteredPetty = [];

  if (selectedShiftFilter === "ALL") {
    filteredOrders = dateOrders;
    filteredPetty = datePetty;
    currentViewingLevel = lang === 'ar' ? "إجمالي اليوم بالكامل" : "Full Day Total";
  } else if (selectedShiftFilter === "CURRENT") {
    filteredOrders = dateOrders.filter(o => Number(o.shift_no) === Number(currentShiftNo));
    filteredPetty = datePetty.filter(p => Number(p.shift_no) === Number(currentShiftNo));
    currentViewingLevel = lang === 'ar' ? `الوردية النشطة #${currentShiftNo}` : `Active Live Shift #${currentShiftNo}`;
  } else {
    const targetShiftNo = Number(selectedShiftFilter);
    filteredOrders = dateOrders.filter(o => Number(o.shift_no) === targetShiftNo);
    filteredPetty = datePetty.filter(p => Number(p.shift_no) === targetShiftNo);
    currentViewingLevel = lang === 'ar' ? `وردية رقم #${targetShiftNo}` : `Shift #${targetShiftNo}`;
  }

  cachedActiveReportOrders = filteredOrders;
  cachedActivePettyCash = filteredPetty;

  // 5. Compute Financials
  let totalCash = 0;
  let totalCard = 0;
  let totalVat = 0;
  let grandTotal = 0;
  let itemMap = {};
  let validBillsCount = 0;
  let voidBillsCount = 0;

  filteredOrders.forEach(o => {
    if (o.status === 'void') {
      voidBillsCount += 1;
      return;
    }

    validBillsCount += 1;
    const oTotal = parseFloat(o.total || 0);
    const oVat = parseFloat(o.vat || 0);

    grandTotal += oTotal;
    totalVat += oVat;

    if (o.payment_method === 'Split' && o.split_details) {
      totalCash += parseFloat(o.split_details.cash || 0);
      totalCard += parseFloat(o.split_details.card || 0);
    } else if (o.payment_method === 'Cash') {
      totalCash += oTotal;
    } else {
      totalCard += oTotal;
    }

    (o.items || []).forEach(it => {
      const itName = it.name || 'Item';
      const itQty = Number(it.qty || 1);
      const itPrice = Number(it.price || 0);

      if (!itemMap[itName]) {
        itemMap[itName] = { qty: 0, amount: 0 };
      }
      itemMap[itName].qty += itQty;
      itemMap[itName].amount += (itPrice * itQty);
    });
  });

  let totalPettyCash = 0;
  filteredPetty.forEach(p => {
    totalPettyCash += parseFloat(p.amount || 0);
  });

  const netCashInDrawer = totalCash - totalPettyCash;

  // 6. Update UI Cards
  const cashEl = document.getElementById('kpi-cash-val');
  if (cashEl) cashEl.innerText = totalCash.toFixed(2);

  const cardEl = document.getElementById('kpi-card-val');
  if (cardEl) cardEl.innerText = totalCard.toFixed(2);

  const totalEl = document.getElementById('kpi-total-val');
  if (totalEl) totalEl.innerText = grandTotal.toFixed(2);

  const billsCountEl = document.getElementById('kpi-bills-count');
  if (billsCountEl) {
    billsCountEl.innerText = lang === 'ar'
      ? `${validBillsCount} فواتير ${voidBillsCount > 0 ? `(${voidBillsCount} ملغاة)` : ''}`
      : `${validBillsCount} Bills ${voidBillsCount > 0 ? `(${voidBillsCount} Void)` : ''}`;
  }

  const repDateEl = document.getElementById('rep-date-display');
  if (repDateEl) repDateEl.innerText = selectedDate;

  const repLevelEl = document.getElementById('rep-level-display');
  if (repLevelEl) repLevelEl.innerText = currentViewingLevel;

  const repPettyEl = document.getElementById('rep-petty-display');
  if (repPettyEl) {
    repPettyEl.innerText = `${totalPettyCash.toFixed(2)} SAR (Net Cash: ${netCashInDrawer.toFixed(2)} SAR)`;
  }

  const repVatEl = document.getElementById('rep-vat-display');
  if (repVatEl) repVatEl.innerText = `${totalVat.toFixed(2)} SAR`;

  const itemsTbody = document.getElementById('rep-items-tbody');
  if (itemsTbody) {
    itemsTbody.innerHTML = '';
    const itemNames = Object.keys(itemMap);
    if (itemNames.length === 0) {
      const emptyMsg = lang === 'ar' ? "لا توجد مبيعات مسجلة" : "No items sold";
      itemsTbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#64748b; padding:10px;">${emptyMsg}</td></tr>`;
    } else {
      itemNames.sort().forEach(name => {
        const row = itemMap[name];
        itemsTbody.innerHTML += `
          <tr>
            <td><strong>${name}</strong></td>
            <td style="text-align:center; font-weight:bold;">${row.qty}</td>
            <td style="text-align:right;">${row.amount.toFixed(2)} SAR</td>
          </tr>
        `;
      });
    }
  }
}

// --- Execute Shift Closing (X-Report) ---
async function executeShiftClosing() {
  const shopId = currentShop ? currentShop.id : 'shop1';
  const bDate = getSaudiBusinessDate();
  const lang = localStorage.getItem('pos_lang') || 'en';

  const confirmMsg = lang === 'ar'
    ? `هل تريد إغلاق الوردية الحالية (Shift #${currentShiftNo})؟\nسيتم فتح وردية جديدة تلقائياً برقم (#${currentShiftNo + 1}).`
    : `Close active shift (Shift #${currentShiftNo})?\nA new shift (#${currentShiftNo + 1}) will begin immediately.`;

  if (!confirm(confirmMsg)) return;

  const shiftOrders = orderHistory.filter(o => o.business_date === bDate && Number(o.shift_no) === Number(currentShiftNo));
  const shiftPetty = pettyCashHistory.filter(p => p.business_date === bDate && Number(p.shift_no) === Number(currentShiftNo));

  let totalCash = 0;
  let totalCard = 0;
  let totalVat = 0;
  let grandTotal = 0;
  let validBillsCount = 0;

  shiftOrders.forEach(o => {
    if (o.status === 'void') return;
    validBillsCount += 1;
    const oTotal = parseFloat(o.total || 0);
    const oVat = parseFloat(o.vat || 0);
    grandTotal += oTotal;
    totalVat += oVat;

    if (o.payment_method === 'Split' && o.split_details) {
      totalCash += parseFloat(o.split_details.cash || 0);
      totalCard += parseFloat(o.split_details.card || 0);
    } else if (o.payment_method === 'Cash') {
      totalCash += oTotal;
    } else {
      totalCard += oTotal;
    }
  });

  let totalPetty = 0;
  shiftPetty.forEach(p => totalPetty += parseFloat(p.amount || 0));
  const netCash = totalCash - totalPetty;

  const shiftClosingRecord = {
    shop_id: shopId,
    business_date: bDate,
    shift_no: currentShiftNo,
    employee_name: 'Cashier',
    started_at: shiftOrders.length > 0 ? new Date(shiftOrders[shiftOrders.length - 1].id).toISOString() : new Date().toISOString(),
    closed_at: new Date().toISOString(),
    cash_sales: totalCash,
    card_sales: totalCard,
    petty_cash: totalPetty,
    net_cash_drawer: netCash,
    total_sales: grandTotal,
    vat_amount: totalVat,
    bills_count: validBillsCount,
    closing_note: `Shift #${currentShiftNo} Closed`
  };

  // 1. Save to Local SQLite Server
  const serverIp = window.LOCAL_SERVER_IP || window.location.hostname || 'localhost';
  fetch(`http://${serverIp}:3000/api/closings/shift`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shiftClosingRecord)
  }).catch(() => {});

  // 2. Supabase Cloud Sync
  if (supabaseClient && navigator.onLine) {
    try {
      await supabaseClient.from('shift_closings').insert([shiftClosingRecord]);
    } catch (e) {}
  }

  // 3. Print Official Shift X-Report Slip
  printShiftXReportSlip(shiftClosingRecord, shiftOrders, shiftPetty);

  // 4. Increment Shift Number
  currentShiftNo += 1;
  saveLocalState(shopId);

  const alertMsg = lang === 'ar'
    ? `تم إغلاق الوردية #${currentShiftNo - 1} بنجاح!\nبدأت الوردية الجديدة #${currentShiftNo}.`
    : `Shift #${currentShiftNo - 1} closed successfully!\nShift #${currentShiftNo} has started.`;

  alert(alertMsg);
  closeModals();
}

// --- Execute Full Day Z-Closing ---
async function executeZDailyClosing() {
  const shopId = currentShop ? currentShop.id : 'shop1';
  const bDate = getSaudiBusinessDate();
  const lang = localStorage.getItem('pos_lang') || 'en';

  const confirmMsg = lang === 'ar'
    ? `هل تريد إغلاق مبيعات اليوم بالكامل (تقرير Z النهائي)؟\nسيتم تثبيت الحسابات وبدء يوم عمل جديد.`
    : `Perform full day end Z-Closing audit?\nThis will finalize today's sales and prepare for the next business day.`;

  if (!confirm(confirmMsg)) return;

  const dayOrders = orderHistory.filter(o => o.business_date === bDate);
  const dayPetty = pettyCashHistory.filter(p => p.business_date === bDate);

  let totalCash = 0;
  let totalCard = 0;
  let totalVat = 0;
  let grandTotal = 0;
  let validBillsCount = 0;
  let voidBillsCount = 0;

  dayOrders.forEach(o => {
    if (o.status === 'void') {
      voidBillsCount += 1;
      return;
    }
    validBillsCount += 1;
    const oTotal = parseFloat(o.total || 0);
    const oVat = parseFloat(o.vat || 0);
    grandTotal += oTotal;
    totalVat += oVat;

    if (o.payment_method === 'Split' && o.split_details) {
      totalCash += parseFloat(o.split_details.cash || 0);
      totalCard += parseFloat(o.split_details.card || 0);
    } else if (o.payment_method === 'Cash') {
      totalCash += oTotal;
    } else {
      totalCard += oTotal;
    }
  });

  let totalPetty = 0;
  dayPetty.forEach(p => totalPetty += parseFloat(p.amount || 0));
  const netCash = totalCash - totalPetty;

  const dailyClosingRecord = {
    shop_id: shopId,
    business_date: bDate,
    closed_at: new Date().toISOString(),
    total_sales: grandTotal,
    cash_sales: totalCash,
    card_sales: totalCard,
    petty_cash: totalPetty,
    net_cash_drawer: netCash,
    vat_amount: totalVat,
    bills_count: validBillsCount,
    void_count: voidBillsCount,
    total_shifts: currentShiftNo,
    closed_by: 'Manager'
  };

  // 1. Save to Local SQLite Server
  const serverIp = window.LOCAL_SERVER_IP || window.location.hostname || 'localhost';
  fetch(`http://${serverIp}:3000/api/closings/daily`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dailyClosingRecord)
  }).catch(() => {});

  // 2. Cloud Sync
  if (supabaseClient && navigator.onLine) {
    try {
      await supabaseClient.from('daily_closings').insert([dailyClosingRecord]);
    } catch (e) {}
  }

  // 3. Print Official Z-Report Slip
  printFullDayZReportSlip(dailyClosingRecord, dayOrders, dayPetty);

  // 4. Mark this business date as closed in localStorage
  localStorage.setItem(`pos_last_closed_date_${shopId}`, bDate);

  // 5. Reset Shift & Token
  currentShiftNo = 1;
  saveLocalState(shopId);

  const dateBadge = document.getElementById('business-date-badge');
  if (dateBadge) dateBadge.innerText = `📅 Shift: ${getSaudiBusinessDate()}`;
  updateTokenDisplay();

  const alertMsg = lang === 'ar'
    ? "تم إغلاق حسابات اليوم بالكامل (تقرير Z) وبدء دورة العمل الجديدة بنجاح!"
    : "Day completed and finalized with cloud (Z-Report done)! New business day initiated.";

  alert(alertMsg);
  closeModals();
}

// --- Bilingual Thermal 80mm Print: Shift X-Report ---
function printShiftXReportSlip(shiftRec, shiftOrders, shiftPetty) {
  let itemMap = {};
  shiftOrders.forEach(o => {
    if (o.status === 'void') return;
    (o.items || []).forEach(it => {
      const name = it.name || 'Item';
      if (!itemMap[name]) itemMap[name] = { qty: 0, amount: 0 };
      itemMap[name].qty += Number(it.qty || 1);
      itemMap[name].amount += Number(it.price * (it.qty || 1));
    });
  });

  let itemsRows = Object.keys(itemMap).map(name => `
    <div class="receipt-row">
      <span style="flex:2;">${name}</span>
      <span style="flex:0.6; text-align:center;">${itemMap[name].qty}</span>
      <span style="flex:1; text-align:right;">${itemMap[name].amount.toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('print-area').innerHTML = `
    <div class="receipt-center">
      <h2 style="margin:2px 0;">${shop.nameAr}</h2>
      <div style="font-size:12px; font-weight:bold;">${currentShop ? currentShop.name : shop.nameEn}</div>
      <h3 style="margin:4px 0;">*** SHIFT X-REPORT ***</h3>
      <div style="font-weight:bold; font-size:13px;">تقرير إغلاق الوردية (X)</div>
      <h2 style="margin:2px 0;">SHIFT #${shiftRec.shift_no}</h2>
      <div>Cashier: ${shiftRec.employee_name}</div>
      <div>Shift Date / التاريخ: ${shiftRec.business_date}</div>
      <div>Printed: ${new Date().toLocaleTimeString()}</div>
    </div>
    <div class="receipt-line"></div>
    <div class="receipt-row"><span>عدد الفواتير (Bills Count):</span><span>${shiftRec.bills_count}</span></div>
    <div class="receipt-row"><span>إجمالي النقدي (Cash Sales):</span><span>${shiftRec.cash_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>مبيعات الشبكة (Mada/Card):</span><span>${shiftRec.card_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-row" style="color:#d97706;"><span>مصروفات الدرج (Petty Cash):</span><span>-${shiftRec.petty_cash.toFixed(2)} SAR</span></div>
    <div class="receipt-row receipt-bold"><span>صافي نقد الدرج (Net Cash):</span><span>${shiftRec.net_cash_drawer.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>ضريبة القيمة المضافة (VAT):</span><span>${shiftRec.vat_amount.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-row receipt-bold" style="font-size:14px;"><span>إجمالي المبيعات (TOTAL):</span><span>${shiftRec.total_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-center receipt-bold" style="margin:4px 0;">الأصناف المباعة / ITEMS BREAKDOWN</div>
    <div class="receipt-row receipt-bold"><span>ITEM / الصنف</span><span>العدد</span><span>المجموع</span></div>
    <div class="receipt-line"></div>
    ${itemsRows || '<div class="receipt-center">No Items</div>'}
    <div class="receipt-line"></div>
  `;
  setTimeout(() => window.print(), 250);
}

// --- Bilingual Thermal 80mm Print: Full Day Z-Report ---
function printFullDayZReportSlip(dailyRec, dayOrders, dayPetty) {
  let itemMap = {};
  dayOrders.forEach(o => {
    if (o.status === 'void') return;
    (o.items || []).forEach(it => {
      const name = it.name || 'Item';
      if (!itemMap[name]) itemMap[name] = { qty: 0, amount: 0 };
      itemMap[name].qty += Number(it.qty || 1);
      itemMap[name].amount += Number(it.price * (it.qty || 1));
    });
  });

  let itemsRows = Object.keys(itemMap).map(name => `
    <div class="receipt-row">
      <span style="flex:2;">${name}</span>
      <span style="flex:0.6; text-align:center;">${itemMap[name].qty}</span>
      <span style="flex:1; text-align:right;">${itemMap[name].amount.toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('print-area').innerHTML = `
    <div class="receipt-center">
      <h2 style="margin:2px 0;">${shop.nameAr}</h2>
      <div style="font-size:12px; font-weight:bold;">${currentShop ? currentShop.name : shop.nameEn}</div>
      <h3 style="margin:4px 0;">*** OFFICIAL Z-REPORT ***</h3>
      <div style="font-weight:bold; font-size:13px;">التقرير النهائي لليوم (Z-Audit)</div>
      <div>Shift Date / التاريخ: ${dailyRec.business_date}</div>
      <div>Total Shifts / إجمالي الورديات: ${dailyRec.total_shifts}</div>
      <div>Closed By: ${dailyRec.closed_by}</div>
      <div>Printed: ${new Date().toLocaleTimeString()}</div>
    </div>
    <div class="receipt-line"></div>
    <div class="receipt-row"><span>الفواتير الصحيحة (Valid Bills):</span><span>${dailyRec.bills_count}</span></div>
    ${dailyRec.void_count > 0 ? `<div class="receipt-row" style="color:#ef4444;"><span>الفواتير الملغاة (Void Bills):</span><span>${dailyRec.void_count}</span></div>` : ''}
    <div class="receipt-row"><span>المبيعات النقدية (Cash Sales):</span><span>${dailyRec.cash_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>مبيعات الشبكة (Mada/Card):</span><span>${dailyRec.card_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-row" style="color:#d97706;"><span>مصروفات الدرج (Petty Cash):</span><span>-${dailyRec.petty_cash.toFixed(2)} SAR</span></div>
    <div class="receipt-row receipt-bold"><span>صافي كاش الدرج (Net Cash):</span><span>${dailyRec.net_cash_drawer.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>إجمالي الضريبة (VAT 15%):</span><span>${dailyRec.vat_amount.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-row receipt-bold" style="font-size:15px;"><span>الإجمالي العام (GRAND TOTAL):</span><span>${dailyRec.total_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-center receipt-bold" style="margin:4px 0;">مبيعات الأصناف / DAY ITEMS BREAKDOWN</div>
    <div class="receipt-row receipt-bold"><span>ITEM / الصنف</span><span>العدد</span><span>المجموع</span></div>
    <div class="receipt-line"></div>
    ${itemsRows || '<div class="receipt-center">No Items</div>'}
    <div class="receipt-line"></div>
  `;
  setTimeout(() => window.print(), 250);
}

// --- Print Filtered Sales Slip ---
function printSelectedReportSlip() {
  closeModals();
  const datePicker = document.getElementById('rep-calendar-picker');
  const selectedDate = datePicker ? datePicker.value : getSaudiBusinessDate();

  let itemMap = {};
  let totalCash = 0;
  let totalCard = 0;
  let totalVat = 0;
  let grandTotal = 0;
  let validCount = 0;

  cachedActiveReportOrders.forEach(o => {
    if (o.status === 'void') return;
    validCount += 1;
    const oTotal = parseFloat(o.total || 0);
    const oVat = parseFloat(o.vat || 0);
    grandTotal += oTotal;
    totalVat += oVat;

    if (o.payment_method === 'Split' && o.split_details) {
      totalCash += parseFloat(o.split_details.cash || 0);
      totalCard += parseFloat(o.split_details.card || 0);
    } else if (o.payment_method === 'Cash') {
      totalCash += oTotal;
    } else {
      totalCard += oTotal;
    }

    (o.items || []).forEach(it => {
      const name = it.name || 'Item';
      if (!itemMap[name]) itemMap[name] = { qty: 0, amount: 0 };
      itemMap[name].qty += Number(it.qty || 1);
      itemMap[name].amount += Number(it.price * (it.qty || 1));
    });
  });

  let totalPetty = 0;
  cachedActivePettyCash.forEach(p => totalPetty += parseFloat(p.amount || 0));
  const netCash = totalCash - totalPetty;

  let itemsRows = Object.keys(itemMap).map(name => `
    <div class="receipt-row">
      <span style="flex:2;">${name}</span>
      <span style="flex:0.6; text-align:center;">${itemMap[name].qty}</span>
      <span style="flex:1; text-align:right;">${itemMap[name].amount.toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('print-area').innerHTML = `
    <div class="receipt-center">
      <h2 style="margin:2px 0;">${shop.nameAr}</h2>
      <h3 style="margin:2px 0;">SALES AUDIT / تقرير المبيعات</h3>
      <div style="font-weight:bold; font-size:13px;">${currentViewingLevel}</div>
      <div>Date / التاريخ: ${selectedDate}</div>
      <div>Printed: ${new Date().toLocaleTimeString()}</div>
    </div>
    <div class="receipt-line"></div>
    <div class="receipt-row"><span>عدد الفواتير (Bills):</span><span>${validCount}</span></div>
    <div class="receipt-row"><span>نقداً (Cash):</span><span>${totalCash.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>شبكة / مدى (Mada):</span><span>${totalCard.toFixed(2)} SAR</span></div>
    <div class="receipt-row" style="color:#d97706;"><span>مصروفات الدرج (Petty Cash):</span><span>-${totalPetty.toFixed(2)} SAR</span></div>
    <div class="receipt-row receipt-bold"><span>صافي كاش الدرج (Net Cash):</span><span>${netCash.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>ضريبة (VAT 15%):</span><span>${totalVat.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-row receipt-bold" style="font-size:14px;"><span>المجموع (TOTAL):</span><span>${grandTotal.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-center receipt-bold" style="margin:4px 0;">الأصناف / ITEMS BREAKDOWN</div>
    <div class="receipt-row receipt-bold"><span>ITEM / الصنف</span><span>العدد</span><span>المجموع</span></div>
    <div class="receipt-line"></div>
    ${itemsRows || '<div class="receipt-center">No Items</div>'}
    <div class="receipt-line"></div>
  `;
  setTimeout(() => window.print(), 250);
}

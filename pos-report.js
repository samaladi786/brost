// ==========================================================
// POS REPORT ENGINE - SHIFT (X-REPORT) & DAILY (Z-REPORT)
// ==========================================================

let cachedActiveReportOrders = [];
let currentViewingLevel = "Full Day";

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

  const prevSelected = selector.value;
  selector.innerHTML = `
    <option value="ALL">🌟 അന്നത്തെ ആകെ കച്ചവടം (Full Day)</option>
    <option value="CURRENT">⚡ നിലവിലെ ഷിഫ്റ്റ് (Shift #${currentShiftNo} - Active)</option>
  `;

  // Find unique shifts present in orders for this business date
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

  // Sort and append shift options
  Array.from(shiftsSet).sort((a, b) => a - b).forEach(sNo => {
    const opt = document.createElement('option');
    opt.value = String(sNo);
    opt.innerText = `🧑‍💼 ഷിഫ്റ്റ് #${sNo} (Shift ${sNo})`;
    selector.appendChild(opt);
  });

  // Retain selection if valid, otherwise fallback to ALL
  if (Array.from(selector.options).some(o => o.value === prevSelected)) {
    selector.value = prevSelected;
  } else {
    selector.value = "ALL";
  }
}

// --- Filter Change Listener ---
async function onReportFilterChange() {
  const datePicker = document.getElementById('rep-calendar-picker');
  const selectedDate = datePicker ? datePicker.value : getSaudiBusinessDate();
  await loadAndRenderReport();
}

// --- Fetch & Render Report Data ---
async function loadAndRenderReport() {
  const datePicker = document.getElementById('rep-calendar-picker');
  const selectedDate = datePicker ? datePicker.value : getSaudiBusinessDate();
  const shiftSelector = document.getElementById('rep-shift-selector');
  const selectedShiftFilter = shiftSelector ? shiftSelector.value : "ALL";
  const shopId = currentShop ? currentShop.id : 'shop1';

  // 1. Local Orders for this date
  let dateOrders = orderHistory.filter(o => o.business_date === selectedDate);

  // 2. Fetch from Supabase if Online & Merge
  if (supabaseClient && navigator.onLine) {
    try {
      const { data } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('shop_id', shopId)
        .eq('business_date', selectedDate);

      if (data && data.length > 0) {
        data.forEach(co => {
          if (!dateOrders.find(lo => String(lo.id) === String(co.id))) {
            dateOrders.push(co);
          }
        });
      }
    } catch (e) {}
  }

  // 3. Apply Shift Filter
  let filtered = [];
  if (selectedShiftFilter === "ALL") {
    filtered = dateOrders;
    currentViewingLevel = "Full Day Total";
  } else if (selectedShiftFilter === "CURRENT") {
    filtered = dateOrders.filter(o => Number(o.shift_no) === Number(currentShiftNo));
    currentViewingLevel = `Active Live Shift #${currentShiftNo}`;
  } else {
    const targetShiftNo = Number(selectedShiftFilter);
    filtered = dateOrders.filter(o => Number(o.shift_no) === targetShiftNo);
    currentViewingLevel = `Shift #${targetShiftNo}`;
  }

  cachedActiveReportOrders = filtered;

  // 4. Compute Financials & Item Breakdown
  let totalCash = 0;
  let totalCard = 0;
  let totalVat = 0;
  let grandTotal = 0;
  let itemMap = {};

  filtered.forEach(o => {
    const oTotal = parseFloat(o.total || 0);
    const oVat = parseFloat(o.vat || 0);

    grandTotal += oTotal;
    totalVat += oVat;

    if (o.payment_method === 'Cash') {
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

  // 5. Update UI Cards & Info
  const cashEl = document.getElementById('kpi-cash-val');
  if (cashEl) cashEl.innerText = totalCash.toFixed(2);

  const cardEl = document.getElementById('kpi-card-val');
  if (cardEl) cardEl.innerText = totalCard.toFixed(2);

  const totalEl = document.getElementById('kpi-total-val');
  if (totalEl) totalEl.innerText = grandTotal.toFixed(2);

  const billsCountEl = document.getElementById('kpi-bills-count');
  if (billsCountEl) billsCountEl.innerText = `${filtered.length} Bills`;

  const repDateEl = document.getElementById('rep-date-display');
  if (repDateEl) repDateEl.innerText = selectedDate;

  const repLevelEl = document.getElementById('rep-level-display');
  if (repLevelEl) repLevelEl.innerText = currentViewingLevel;

  const repVatEl = document.getElementById('rep-vat-display');
  if (repVatEl) repVatEl.innerText = `${totalVat.toFixed(2)} SAR`;

  // 6. Populate Items Table
  const itemsTbody = document.getElementById('rep-items-tbody');
  if (itemsTbody) {
    itemsTbody.innerHTML = '';
    const itemNames = Object.keys(itemMap);
    if (itemNames.length === 0) {
      itemsTbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#64748b; padding:10px;">ഐറ്റങ്ങൾ വിറ്റിട്ടില്ല</td></tr>`;
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

// --- Execute Employee Shift Closing (X-Report) ---
async function executeShiftClosing() {
  const shopId = currentShop ? currentShop.id : 'shop1';
  const bDate = getSaudiBusinessDate();

  if (!confirm(`ഈ ഷിഫ്റ്റ് (Shift #${currentShiftNo}) പൂർണ്ണമായി ക്ലോസ് ചെയ്യണോ?\nഇതോടെ അടുത്ത ജീവനക്കാരനായി പുതിയ ഷിഫ്റ്റ് (#${currentShiftNo + 1}) ആരംഭിക്കും.`)) {
    return;
  }

  // Filter current active shift orders
  const shiftOrders = orderHistory.filter(o => o.business_date === bDate && Number(o.shift_no) === Number(currentShiftNo));

  let totalCash = 0;
  let totalCard = 0;
  let totalVat = 0;
  let grandTotal = 0;

  shiftOrders.forEach(o => {
    const oTotal = parseFloat(o.total || 0);
    const oVat = parseFloat(o.vat || 0);
    grandTotal += oTotal;
    totalVat += oVat;
    if (o.payment_method === 'Cash') totalCash += oTotal;
    else totalCard += oTotal;
  });

  const shiftClosingRecord = {
    shop_id: shopId,
    business_date: bDate,
    shift_no: currentShiftNo,
    employee_name: 'Cashier',
    started_at: shiftOrders.length > 0 ? new Date(shiftOrders[shiftOrders.length - 1].id).toISOString() : new Date().toISOString(),
    closed_at: new Date().toISOString(),
    cash_sales: totalCash,
    card_sales: totalCard,
    total_sales: grandTotal,
    vat_amount: totalVat,
    bills_count: shiftOrders.length,
    closing_note: `Shift #${currentShiftNo} Closed`
  };

  // 1. Cloud Persistence
  if (supabaseClient && navigator.onLine) {
    try {
      await supabaseClient.from('shift_closings').insert([shiftClosingRecord]);
    } catch (e) {
      console.warn("Shift closing save failed:", e);
    }
  }

  // 2. Print Official Shift X-Report
  printShiftXReportSlip(shiftClosingRecord, shiftOrders);

  // 3. Increment Shift Number for Next Employee
  currentShiftNo += 1;
  saveLocalState(shopId);

  alert(`ഷിഫ്റ്റ് #${currentShiftNo - 1} വിജയകരമായി ക്ലോസ് ചെയ്തു!\nഅടുത്ത ഷിഫ്റ്റ് (#${currentShiftNo}) ആരംഭിച്ചു.`);
  closeModals();
}

// --- Execute Full Day Z-Closing (Z-Report) ---
async function executeZDailyClosing() {
  const shopId = currentShop ? currentShop.id : 'shop1';
  const bDate = getSaudiBusinessDate();

  if (!confirm(`ഇന്നത്തെ മുഴുവൻ ബിസിനസ്സും ക്ലൗഡിൽ സ്ഥിരമായി ക്ലോസ് ചെയ്യണോ (Z-Closing)?\nഅന്നത്തെ എല്ലാ ഷിഫ്റ്റുകളും ഇതിൽ ഫൈനൽ ആകും.`)) {
    return;
  }

  // All orders for this business date
  const dayOrders = orderHistory.filter(o => o.business_date === bDate);

  let totalCash = 0;
  let totalCard = 0;
  let totalVat = 0;
  let grandTotal = 0;

  dayOrders.forEach(o => {
    const oTotal = parseFloat(o.total || 0);
    const oVat = parseFloat(o.vat || 0);
    grandTotal += oTotal;
    totalVat += oVat;
    if (o.payment_method === 'Cash') totalCash += oTotal;
    else totalCard += oTotal;
  });

  const dailyClosingRecord = {
    shop_id: shopId,
    business_date: bDate,
    closed_at: new Date().toISOString(),
    total_sales: grandTotal,
    cash_sales: totalCash,
    card_sales: totalCard,
    vat_amount: totalVat,
    bills_count: dayOrders.length,
    total_shifts: currentShiftNo,
    closed_by: 'Manager'
  };

  // 1. Cloud Persistence
  if (supabaseClient && navigator.onLine) {
    try {
      await supabaseClient.from('daily_closings').insert([dailyClosingRecord]);
    } catch (e) {
      console.warn("Daily closing save failed:", e);
    }
  }

  // 2. Print Official Z-Report Slip
  printFullDayZReportSlip(dailyClosingRecord, dayOrders);

  alert("ഇന്നത്തെ ബിസിനസ്സ് വിജയകരമായി ക്ലൗഡിൽ ക്ലോസ് ചെയ്തു (Z-Report Completed)!");
  closeModals();
}

// --- Thermal Printing: Shift X-Report ---
function printShiftXReportSlip(shiftRec, shiftOrders) {
  let itemMap = {};
  shiftOrders.forEach(o => {
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
      <h3>${shop.nameAr}</h3>
      <h2>*** SHIFT X-REPORT ***</h2>
      <h3 style="margin:2px 0;">SHIFT #${shiftRec.shift_no}</h3>
      <div>Staff: ${shiftRec.employee_name}</div>
      <div>Shift Date: ${shiftRec.business_date}</div>
      <div>Print Time: ${new Date().toLocaleTimeString()}</div>
    </div>
    <div class="receipt-line"></div>
    <div class="receipt-row"><span>Total Bills:</span><span>${shiftRec.bills_count}</span></div>
    <div class="receipt-row"><span>Cash Sales:</span><span>${shiftRec.cash_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>Mada / Card:</span><span>${shiftRec.card_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>VAT (15%):</span><span>${shiftRec.vat_amount.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-row receipt-bold" style="font-size:15px;"><span>SHIFT TOTAL:</span><span>${shiftRec.total_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-center receipt-bold" style="margin:4px 0;">SHIFT ITEMS BREAKDOWN</div>
    <div class="receipt-row receipt-bold"><span>ITEM</span><span>QTY</span><span>AMOUNT</span></div>
    <div class="receipt-line"></div>
    ${itemsRows || '<div class="receipt-center">No Items</div>'}
    <div class="receipt-line"></div>
  `;
  setTimeout(() => window.print(), 250);
}

// --- Thermal Printing: Full Day Z-Report ---
function printFullDayZReportSlip(dailyRec, dayOrders) {
  let itemMap = {};
  dayOrders.forEach(o => {
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
      <h3>${shop.nameAr}</h3>
      <h2>*** OFFICIAL Z-REPORT ***</h2>
      <h3 style="margin:2px 0;">FULL DAY AUDIT</h3>
      <div>Shift Date: ${dailyRec.business_date}</div>
      <div>Total Shifts: ${dailyRec.total_shifts}</div>
      <div>Closed By: ${dailyRec.closed_by}</div>
      <div>Print Time: ${new Date().toLocaleTimeString()}</div>
    </div>
    <div class="receipt-line"></div>
    <div class="receipt-row"><span>Total Bills:</span><span>${dailyRec.bills_count}</span></div>
    <div class="receipt-row"><span>Cash Sales:</span><span>${dailyRec.cash_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>Mada / Card:</span><span>${dailyRec.card_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>Total VAT:</span><span>${dailyRec.vat_amount.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-row receipt-bold" style="font-size:15px;"><span>GRAND TOTAL:</span><span>${dailyRec.total_sales.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-center receipt-bold" style="margin:4px 0;">DAY ITEMS BREAKDOWN</div>
    <div class="receipt-row receipt-bold"><span>ITEM</span><span>QTY</span><span>AMOUNT</span></div>
    <div class="receipt-line"></div>
    ${itemsRows || '<div class="receipt-center">No Items</div>'}
    <div class="receipt-line"></div>
  `;
  setTimeout(() => window.print(), 250);
}

// --- Print Currently Viewed Filter (Slip) ---
function printSelectedReportSlip() {
  closeModals();
  const datePicker = document.getElementById('rep-calendar-picker');
  const selectedDate = datePicker ? datePicker.value : getSaudiBusinessDate();

  let itemMap = {};
  let totalCash = 0;
  let totalCard = 0;
  let totalVat = 0;
  let grandTotal = 0;

  cachedActiveReportOrders.forEach(o => {
    const oTotal = parseFloat(o.total || 0);
    const oVat = parseFloat(o.vat || 0);
    grandTotal += oTotal;
    totalVat += oVat;
    if (o.payment_method === 'Cash') totalCash += oTotal;
    else totalCard += oTotal;

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
      <h3>${shop.nameAr}</h3>
      <h2>SALES REPORT SLIP</h2>
      <div style="font-weight:bold;">${currentViewingLevel}</div>
      <div>Date: ${selectedDate}</div>
      <div>Print Time: ${new Date().toLocaleTimeString()}</div>
    </div>
    <div class="receipt-line"></div>
    <div class="receipt-row"><span>Total Bills:</span><span>${cachedActiveReportOrders.length}</span></div>
    <div class="receipt-row"><span>Cash Sales:</span><span>${totalCash.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>Mada / Card:</span><span>${totalCard.toFixed(2)} SAR</span></div>
    <div class="receipt-row"><span>Total VAT:</span><span>${totalVat.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-row receipt-bold" style="font-size:15px;"><span>TOTAL:</span><span>${grandTotal.toFixed(2)} SAR</span></div>
    <div class="receipt-line"></div>
    <div class="receipt-center receipt-bold" style="margin:4px 0;">ITEMS BREAKDOWN</div>
    <div class="receipt-row receipt-bold"><span>ITEM</span><span>QTY</span><span>AMOUNT</span></div>
    <div class="receipt-line"></div>
    ${itemsRows || '<div class="receipt-center">No Items</div>'}
    <div class="receipt-line"></div>
  `;
  setTimeout(() => window.print(), 250);
}

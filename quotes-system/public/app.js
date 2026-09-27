const state = { user: null, tab: 'quotes', view: 'list', currentDoc: null };

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function money(n, currency) {
  return `${currency} ${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function statusBadge(status) {
  const label = status.replace('_', ' ');
  return `<span class="status status-${status}">${label}</span>`;
}

// ---------- Auth ----------

async function init() {
  try {
    const { user } = await api('/api/auth/me');
    if (user) { state.user = user; showApp(); }
    else showLogin();
  } catch (e) { showLogin(); }
}

function showLogin() {
  document.getElementById('login-screen').hidden = false;
  document.getElementById('app').hidden = true;
}

function showApp() {
  document.getElementById('login-screen').hidden = true;
  document.getElementById('app').hidden = false;
  document.getElementById('whoami').textContent = `${state.user.display_name} (${state.user.role})`;
  document.getElementById('users-tab-btn').hidden = state.user.role !== 'admin';
  renderTab();
}

document.getElementById('login-btn').addEventListener('click', async () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    const { user } = await api('/api/auth/login', { method: 'POST', body: { username, password } });
    state.user = user;
    document.getElementById('login-error').textContent = '';
    showApp();
  } catch (e) {
    document.getElementById('login-error').textContent = e.message;
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  location.reload();
});

document.querySelectorAll('nav button[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.tab = btn.dataset.tab;
    state.view = 'list';
    renderTab();
  });
});

function renderTab() {
  if (state.tab === 'users') return renderUsers();
  if (state.view === 'edit') return renderEditor(state.tab, state.currentDoc);
  return renderList(state.tab);
}

// ---------- List view ----------

async function renderList(kind) {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="card"><em>Loading…</em></div>`;
  const { documents } = await api(`/api/documents?kind=${kind === 'invoices' ? 'invoice' : 'quote'}`);

  const rows = documents.map(d => `
    <tr>
      <td>${d.number}${d.version > 1 ? ` <span class="muted">v${d.version}</span>` : ''}</td>
      <td>${d.client_name || '<span class="muted">—</span>'}</td>
      <td>${d.po_number || '<span class="muted">—</span>'}</td>
      <td>${money(d.grand_total, d.currency)}</td>
      <td>${statusBadge(d.status)}</td>
      ${kind === 'invoices' ? `<td>${d.payment_status ? `<span class="status pay-${d.payment_status}">${d.payment_status}</span>` : ''}</td>` : ''}
      <td><button class="plain" onclick="openDoc(${d.id})">Open</button></td>
    </tr>
  `).join('');

  main.innerHTML = `
    <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0; color:#071A2E;">${kind === 'invoices' ? 'Invoices' : 'Quotes'}</h2>
      <button class="gold" onclick="newDoc('${kind === 'invoices' ? 'invoice' : 'quote'}')">+ New ${kind === 'invoices' ? 'Invoice' : 'Quote'}</button>
    </div>
    <div class="card">
      <table>
        <thead><tr>
          <th>Number</th><th>Client</th><th>PO</th><th>Total</th><th>Status</th>
          ${kind === 'invoices' ? '<th>Payment</th>' : ''}
          <th></th>
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="7" class="muted">No ${kind} yet.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

window.newDoc = (kind) => {
  state.view = 'edit';
  state.currentDoc = { kind, items: [{ description: '', days: 1, qty: 1, unit: 'Each', unit_price: 0 }] };
  renderTab();
};

window.openDoc = async (id) => {
  const { document: doc, history } = await api(`/api/documents/${id}`);
  state.view = 'edit';
  state.currentDoc = doc;
  state.history = history;
  renderTab();
};

// ---------- Editor ----------

function calcTotalsLocal(items, discountType, discountValue, taxType) {
  const subtotal = items.reduce((s, it) => s + (Number(it.days) || 0) * (Number(it.qty) || 0) * (Number(it.unit_price) || 0), 0);
  let discount = discountType === 'percent' ? subtotal * ((Number(discountValue) || 0) / 100) : (Number(discountValue) || 0);
  discount = Math.min(discount, subtotal);
  const rate = taxType === '16' ? 0.16 : 0;
  const taxable = subtotal - discount;
  const tax = taxType === 'exempt' ? 0 : taxable * rate;
  const grand = taxable + tax;
  return { subtotal, discount, tax, grand };
}

function renderEditor(kind, doc) {
  const isInvoice = doc.kind === 'invoice';
  const editable = !doc.id || doc.status === 'draft';
  const currency = doc.currency || 'JOD';

  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h2 style="margin:0; color:#071A2E;">${isInvoice ? 'Invoice' : 'Quote'} ${doc.number || '(new)'} ${doc.version > 1 ? `v${doc.version}` : ''}</h2>
        ${doc.status ? statusBadge(doc.status) : ''} ${doc.payment_status ? `<span class="status pay-${doc.payment_status}">${doc.payment_status}</span>` : ''}
      </div>
      <button class="plain" onclick="state.view='list'; renderTab();">← Back to list</button>
    </div>

    <div class="card">
      <div class="grid grid-2">
        <div class="field"><label>Client / Organization</label><input id="f-client" value="${doc.client_name || ''}" ${!editable ? 'disabled' : ''}></div>
        <div class="field"><label>Contact Person</label><input id="f-contact" value="${doc.contact_person || ''}" ${!editable ? 'disabled' : ''}></div>
        <div class="field"><label>Project / Event</label><input id="f-project" value="${doc.project_title || ''}" ${!editable ? 'disabled' : ''}></div>
        <div class="field"><label>Venue</label><input id="f-venue" value="${doc.venue || ''}" ${!editable ? 'disabled' : ''}></div>
        <div class="field">
          <label>PO Number (optional)</label>
          <input id="f-po" value="${doc.po_number || ''}" ${!editable ? 'disabled' : ''}>
        </div>
        ${!isInvoice ? '' : `<div class="field"><label>Due Date</label><input id="f-due" type="date" value="${doc.due_date ? doc.due_date.slice(0,10) : ''}" ${!editable ? 'disabled' : ''}></div>`}
      </div>
      ${editable ? `<button class="plain" id="po-scan-btn" type="button">📷 Scan PO (OCR)</button><div id="po-scan-result"></div>` : ''}
    </div>

    <div class="card">
      <div class="grid grid-3">
        <div class="field"><label>Currency</label>
          <select id="f-currency" ${!editable ? 'disabled' : ''}>
            ${['JOD','USD','EUR'].map(c => `<option value="${c}" ${currency===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Tax</label>
          <select id="f-tax" ${!editable ? 'disabled' : ''}>
            <option value="16" ${doc.tax_type==='16'||!doc.tax_type?'selected':''}>16%</option>
            <option value="0" ${doc.tax_type==='0'?'selected':''}>0%</option>
            <option value="exempt" ${doc.tax_type==='exempt'?'selected':''}>Exempt</option>
          </select>
        </div>
        <div class="field"><label>Discount</label>
          <div style="display:flex; gap:6px;">
            <select id="f-discount-type" style="width:90px;" ${!editable ? 'disabled' : ''}>
              <option value="flat" ${doc.discount_type!=='percent'?'selected':''}>Flat</option>
              <option value="percent" ${doc.discount_type==='percent'?'selected':''}>%</option>
            </select>
            <input id="f-discount-value" type="number" step="0.01" value="${doc.discount_value || 0}" ${!editable ? 'disabled' : ''}>
          </div>
        </div>
      </div>

      <table id="items-table">
        <thead><tr><th>Description</th><th style="width:70px;">Days</th><th style="width:70px;">Qty</th><th style="width:90px;">Unit</th><th style="width:100px;">Unit Price</th><th style="width:100px;">Total</th><th></th></tr></thead>
        <tbody id="items-body"></tbody>
      </table>
      ${editable ? `<button class="plain" id="add-row-btn" type="button" style="margin-top:8px;">+ Add line</button>` : ''}

      <div class="totals-box">
        <div>Subtotal: <span id="t-subtotal"></span></div>
        <div>Discount: <span id="t-discount"></span></div>
        <div>Tax: <span id="t-tax"></span></div>
        <div class="grand">Grand Total: <span id="t-grand"></span></div>
      </div>

      <div class="field" style="margin-top:12px;"><label>Notes</label><textarea id="f-notes" rows="2" ${!editable ? 'disabled' : ''}>${doc.notes || ''}</textarea></div>
    </div>

    <div class="card" id="actions-card"></div>
  `;

  window.__items = (doc.items && doc.items.length ? doc.items : [{ description: '', days: 1, qty: 1, unit: 'Each', unit_price: 0 }]).map(i => ({ ...i }));
  renderItemsBody(editable);
  recalcTotals();

  if (editable) document.getElementById('add-row-btn').addEventListener('click', () => {
    window.__items.push({ description: '', days: 1, qty: 1, unit: 'Each', unit_price: 0 });
    renderItemsBody(true);
  });

  const poScanBtn = document.getElementById('po-scan-btn');
  if (poScanBtn) poScanBtn.addEventListener('click', triggerPoScan);

  renderActions(doc);
}

function renderItemsBody(editable) {
  const body = document.getElementById('items-body');
  body.innerHTML = window.__items.map((it, idx) => `
    <tr>
      <td class="autocomplete">
        <input data-idx="${idx}" class="item-desc" value="${it.description || ''}" ${!editable ? 'disabled' : ''} autocomplete="off">
        <div class="options" id="opts-${idx}" hidden></div>
      </td>
      <td><input type="number" step="0.5" data-idx="${idx}" class="item-days" value="${it.days ?? 1}" ${!editable ? 'disabled' : ''}></td>
      <td><input type="number" step="1" data-idx="${idx}" class="item-qty" value="${it.qty ?? 1}" ${!editable ? 'disabled' : ''}></td>
      <td><input data-idx="${idx}" class="item-unit" value="${it.unit || 'Each'}" ${!editable ? 'disabled' : ''}></td>
      <td><input type="number" step="0.01" data-idx="${idx}" class="item-price" value="${it.unit_price ?? 0}" ${!editable ? 'disabled' : ''}></td>
      <td class="row-total">${money(lineTotal(it), '')}</td>
      <td>${editable ? `<button class="plain" onclick="removeRow(${idx})" type="button">✕</button>` : ''}</td>
    </tr>
  `).join('');

  if (editable) {
    body.querySelectorAll('.item-desc').forEach(inp => {
      inp.addEventListener('input', onDescInput);
      inp.addEventListener('blur', () => setTimeout(() => hideOptions(inp.dataset.idx), 150));
    });
    body.querySelectorAll('.item-days, .item-qty, .item-unit, .item-price').forEach(inp => {
      inp.addEventListener('input', onFieldChange);
    });
  }
}

function lineTotal(it) {
  return (Number(it.days) || 0) * (Number(it.qty) || 0) * (Number(it.unit_price) || 0);
}

function onFieldChange(e) {
  const idx = Number(e.target.dataset.idx);
  const it = window.__items[idx];
  if (e.target.classList.contains('item-days')) it.days = Number(e.target.value);
  if (e.target.classList.contains('item-qty')) it.qty = Number(e.target.value);
  if (e.target.classList.contains('item-unit')) it.unit = e.target.value;
  if (e.target.classList.contains('item-price')) it.unit_price = Number(e.target.value);
  const row = e.target.closest('tr');
  row.querySelector('.row-total').textContent = money(lineTotal(it), '');
  recalcTotals();
}

let acTimer;
async function onDescInput(e) {
  const idx = Number(e.target.dataset.idx);
  window.__items[idx].description = e.target.value;
  recalcTotals();
  clearTimeout(acTimer);
  const q = e.target.value.trim();
  const opts = document.getElementById(`opts-${idx}`);
  if (!q) { opts.hidden = true; return; }
  acTimer = setTimeout(async () => {
    const { items } = await api(`/api/items?q=${encodeURIComponent(q)}`);
    if (!items.length) { opts.hidden = true; return; }
    opts.innerHTML = items.map(i => `<div data-name="${i.name.replace(/"/g, '&quot;')}">${i.name}</div>`).join('')
      + `<div style="border-top:1px solid #eee; color:#071A2E; font-weight:600;" data-add="${q.replace(/"/g, '&quot;')}">+ Add "${q}" to list</div>`;
    opts.hidden = false;
    opts.querySelectorAll('div').forEach(d => d.addEventListener('mousedown', async () => {
      const name = d.dataset.add !== undefined ? d.dataset.add : d.dataset.name;
      if (d.dataset.add !== undefined) await api('/api/items', { method: 'POST', body: { name } });
      window.__items[idx].description = name;
      const input = document.querySelector(`.item-desc[data-idx="${idx}"]`);
      input.value = name;
      opts.hidden = true;
    }));
  }, 200);
}

function hideOptions(idx) {
  const opts = document.getElementById(`opts-${idx}`);
  if (opts) opts.hidden = true;
}

window.removeRow = (idx) => {
  window.__items.splice(idx, 1);
  if (!window.__items.length) window.__items.push({ description: '', days: 1, qty: 1, unit: 'Each', unit_price: 0 });
  renderItemsBody(true);
  recalcTotals();
};

function currentFormValues() {
  return {
    client_name: val('f-client'),
    contact_person: val('f-contact'),
    project_title: val('f-project'),
    venue: val('f-venue'),
    po_number: val('f-po') || null,
    due_date: val('f-due') || null,
    currency: val('f-currency'),
    tax_type: val('f-tax'),
    discount_type: val('f-discount-type'),
    discount_value: Number(val('f-discount-value') || 0),
    notes: val('f-notes'),
    items: window.__items.filter(it => it.description && it.description.trim()),
  };
}
function val(id) { const el = document.getElementById(id); return el ? el.value : undefined; }

function recalcTotals() {
  const taxEl = document.getElementById('f-tax');
  const discTypeEl = document.getElementById('f-discount-type');
  const discValEl = document.getElementById('f-discount-value');
  const currencyEl = document.getElementById('f-currency');
  if (!taxEl) return;
  const t = calcTotalsLocal(window.__items, discTypeEl.value, discValEl.value, taxEl.value);
  const c = currencyEl.value;
  document.getElementById('t-subtotal').textContent = money(t.subtotal, c);
  document.getElementById('t-discount').textContent = `-${money(t.discount, c)}`;
  document.getElementById('t-tax').textContent = money(t.tax, c);
  document.getElementById('t-grand').textContent = money(t.grand, c);
}
['f-tax','f-discount-type','f-discount-value','f-currency'].forEach(id => {
  document.addEventListener('input', (e) => { if (e.target && e.target.id === id) recalcTotals(); });
  document.addEventListener('change', (e) => { if (e.target && e.target.id === id) recalcTotals(); });
});

async function triggerPoScan() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    const resultEl = document.getElementById('po-scan-result');
    resultEl.innerHTML = '<em>Reading scan…</em>';
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/ocr/po-scan', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const g = data.guesses || {};
      resultEl.innerHTML = `
        <div class="muted">Detected (review before applying):</div>
        ${g.po_number ? `<div>PO Number: <b>${g.po_number}</b> <button class="plain" onclick="document.getElementById('f-po').value='${g.po_number}'">Use</button></div>` : ''}
        ${g.client_name ? `<div>Client: <b>${g.client_name}</b> <button class="plain" onclick="document.getElementById('f-client').value=${JSON.stringify(g.client_name)}">Use</button></div>` : ''}
        ${g.date ? `<div>Date found: <b>${g.date}</b></div>` : ''}
        ${g.amount ? `<div>Amount found: <b>${g.amount}</b></div>` : ''}
        ${!Object.keys(g).length ? '<div class="muted">Nothing recognized automatically — enter manually.</div>' : ''}
      `;
    } catch (e) {
      resultEl.innerHTML = `<div class="error">${e.message}</div>`;
    }
  };
  input.click();
}

function renderActions(doc) {
  const el = document.getElementById('actions-card');
  const btns = [];
  const isAdmin = state.user.role === 'admin';

  if (!doc.id || doc.status === 'draft') {
    btns.push(`<button class="primary" onclick="saveDraft('${doc.status === 'draft' && doc.id ? 'update' : 'create'}')">Save Draft</button>`);
  }
  if (doc.id && doc.status === 'draft') {
    btns.push(`<button class="gold" onclick="docAction(${doc.id}, 'submit')">Submit for Approval</button>`);
  }
  if (doc.id && doc.status === 'pending_approval' && isAdmin) {
    btns.push(`<button class="gold" onclick="docAction(${doc.id}, 'approve')">Approve</button>`);
  }
  if (doc.id && doc.status === 'approved') {
    btns.push(`<button class="gold" onclick="docAction(${doc.id}, 'send')">Mark as Sent</button>`);
  }
  if (doc.id && !['cancelled', 'amended'].includes(doc.status)) {
    btns.push(`<button class="plain" onclick="docAction(${doc.id}, 'amend')">Amend (new version)</button>`);
    btns.push(`<button class="danger" onclick="if(confirm('Cancel this document? It stays in the record.')) docAction(${doc.id}, 'cancel')">Cancel</button>`);
  }
  if (doc.id) {
    btns.push(`<a class="plain" style="text-decoration:none; display:inline-block;" href="/api/documents/${doc.id}/pdf" target="_blank">Download PDF</a>`);
  }
  if (doc.id && doc.kind === 'quote' && ['approved','sent'].includes(doc.status)) {
    btns.push(`<button class="gold" onclick="createInvoiceFromQuote(${doc.id})">Create Invoice from this Quote</button>`);
  }
  if (doc.id && doc.kind === 'invoice' && doc.payment_status === 'unpaid') {
    btns.push(`<button class="plain" onclick="docAction(${doc.id}, 'mark-paid')">Mark as Paid</button>`);
  }

  el.innerHTML = `<div style="display:flex; gap:8px; flex-wrap:wrap;">${btns.join('')}</div><div class="error" id="action-error"></div>`;
}

window.saveDraft = async (mode) => {
  const values = currentFormValues();
  try {
    let result;
    if (mode === 'update') {
      result = await api(`/api/documents/${state.currentDoc.id}`, { method: 'PUT', body: values });
    } else {
      result = await api('/api/documents', { method: 'POST', body: { kind: state.currentDoc.kind, ...values } });
    }
    state.currentDoc = result.document;
    renderTab();
  } catch (e) {
    document.getElementById('action-error') && (document.getElementById('action-error').textContent = e.message);
  }
};

window.docAction = async (id, action) => {
  try {
    const result = await api(`/api/documents/${id}/${action}`, { method: 'POST', body: {} });
    if (result.document) { state.currentDoc = result.document; renderTab(); }
    else { const r = await api(`/api/documents/${id}`); state.currentDoc = r.document; renderTab(); }
  } catch (e) {
    document.getElementById('action-error').textContent = e.message;
  }
};

window.createInvoiceFromQuote = async (quoteId) => {
  try {
    const { document: inv } = await api(`/api/documents/from-quote/${quoteId}`, { method: 'POST', body: {} });
    state.tab = 'invoices';
    state.currentDoc = inv;
    state.view = 'edit';
    document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === 'invoices'));
    renderTab();
  } catch (e) {
    alert(e.message);
  }
};

// ---------- Users (admin only) ----------

async function renderUsers() {
  const main = document.getElementById('main');
  const { users } = await api('/api/users');
  main.innerHTML = `
    <div class="card">
      <h2 style="margin-top:0; color:#071A2E;">Users</h2>
      <table>
        <thead><tr><th>Username</th><th>Name</th><th>Role</th><th></th></tr></thead>
        <tbody>${users.map(u => `<tr><td>${u.username}</td><td>${u.display_name}</td><td>${u.role}</td>
          <td>${u.id !== state.user.id ? `<button class="danger" onclick="removeUser(${u.id})">Remove</button>` : ''}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <div class="card">
      <h3 style="margin-top:0;">Add User</h3>
      <div class="grid grid-2">
        <div class="field"><label>Username</label><input id="nu-username"></div>
        <div class="field"><label>Display Name</label><input id="nu-name"></div>
        <div class="field"><label>Password</label><input id="nu-password" type="password"></div>
        <div class="field"><label>Role</label>
          <select id="nu-role"><option value="staff">Staff / Business Dev</option><option value="admin">Admin</option></select>
        </div>
      </div>
      <button class="primary" onclick="addUser()">Add User</button>
      <div class="error" id="nu-error"></div>
    </div>
  `;
}

window.addUser = async () => {
  try {
    await api('/api/users', { method: 'POST', body: {
      username: val('nu-username'), display_name: val('nu-name'), password: val('nu-password'), role: val('nu-role'),
    }});
    renderUsers();
  } catch (e) {
    document.getElementById('nu-error').textContent = e.message;
  }
};

window.removeUser = async (id) => {
  if (!confirm('Remove this user?')) return;
  await api(`/api/users/${id}`, { method: 'DELETE' });
  renderUsers();
};

init();

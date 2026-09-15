const dom = {
  navLinks: document.querySelectorAll('.nav-link'),
  views: document.querySelectorAll('.view'),
  navAccountBtn: document.getElementById('navAccountBtn'),
  medSearchInput: document.getElementById('medSearchInput'),
  medSearchBtn: document.getElementById('medSearchBtn'),
  searchTags: document.querySelectorAll('.tag'),
  resultsTitle: document.getElementById('resultsTitle'),
  resultsSub: document.getElementById('resultsSub'),
  resultsGrid: document.getElementById('resultsGrid'),
  resultsSection: document.getElementById('resultsSection'),
  sortSelect: document.getElementById('sortSelect'),
  filterInStock: document.getElementById('filterInStock'),
  altSuggestion: document.getElementById('altSuggestion'),
  altChips: document.getElementById('altChips'),
  tickerList: document.getElementById('tickerList'),
  lowStockTable: document.getElementById('lowStockTable'),
  demandList: document.getElementById('demandList'),
  inventoryTable: document.getElementById('inventoryTable'),
  reservationList: document.getElementById('reservationList'),
  trendChart: document.getElementById('trendChart'),
  rxQueue: document.getElementById('rxQueue'),
  uploadRxBtn: document.getElementById('uploadRxBtn'),
  prescriptionInput: document.getElementById('prescriptionInput'),
  historyTableBody: document.getElementById('historyTableBody'),
  collectionTable: document.getElementById('collectionTable'),
  medInfoGrid: document.getElementById('medInfoGrid'),
  verificationTable: document.getElementById('verificationTable'),
  auditTable: document.getElementById('auditTable'),
  adminTrendChart: document.getElementById('adminTrendChart'),
  toast: document.getElementById('toast'),
  reserveModal: document.getElementById('reserveModal'),
  reserveStep1: document.getElementById('reserveStep1'),
  reserveStep2: document.getElementById('reserveStep2'),
  reserveMedName: document.getElementById('reserveMedName'),
  reservePharmName: document.getElementById('reservePharmName'),
  qtyInput: document.getElementById('qtyInput'),
  qtyMinus: document.getElementById('qtyMinus'),
  qtyPlus: document.getElementById('qtyPlus'),
  confirmReserveBtn: document.getElementById('confirmReserveBtn'),
  doneReserveBtn: document.getElementById('doneReserveBtn'),
  closeReserve: document.getElementById('closeReserve'),
  pageLinks: document.querySelectorAll('[data-page-link]'),
  cartBtn: document.getElementById('cartBtn'),
  cartCount: document.getElementById('cartCount'),
  cartModal: document.getElementById('cartModal'),
  closeCart: document.getElementById('closeCart'),
  cartViewMain: document.getElementById('cartViewMain'),
  cartViewSuccess: document.getElementById('cartViewSuccess'),
  cartItemsContainer: document.getElementById('cartItemsContainer'),
  reserveAllBtn: document.getElementById('reserveAllBtn'),
  cartSuccessList: document.getElementById('cartSuccessList'),
  cartDoneBtn: document.getElementById('cartDoneBtn'),
  viewCartFromReserveBtn: document.getElementById('viewCartFromReserveBtn'),
  addedToCartSummary: document.getElementById('addedToCartSummary'),
  cartNoteInput: document.getElementById('cartNoteInput'),
  prescriptionOrderModal: document.getElementById('prescriptionOrderModal'),
  closePrescriptionOrder: document.getElementById('closePrescriptionOrder'),
  prescriptionOrderStep1: document.getElementById('prescriptionOrderStep1'),
  prescriptionOrderStep2: document.getElementById('prescriptionOrderStep2'),
  prescriptionPharmacySelect: document.getElementById('prescriptionPharmacySelect'),
  prescriptionNoteInput: document.getElementById('prescriptionNoteInput'),
  prescriptionFilesInput: document.getElementById('prescriptionFilesInput'),
  submitPrescriptionOrderBtn: document.getElementById('submitPrescriptionOrderBtn'),
  prescriptionOrderCode: document.getElementById('prescriptionOrderCode'),
  donePrescriptionOrderBtn: document.getElementById('donePrescriptionOrderBtn'),
  cartPrescriptionSection: document.getElementById('cartPrescriptionSection'),
  cartPrescriptionFilesInput: document.getElementById('cartPrescriptionFilesInput'),
  draftReviewModal: document.getElementById('draftReviewModal'),
  closeDraftReview: document.getElementById('closeDraftReview'),
  draftReviewPharmacyLine: document.getElementById('draftReviewPharmacyLine'),
  draftReviewItemsContainer: document.getElementById('draftReviewItemsContainer'),
  draftReviewNoteBox: document.getElementById('draftReviewNoteBox'),
  rejectDraftBtn: document.getElementById('rejectDraftBtn'),
  acceptDraftBtn: document.getElementById('acceptDraftBtn'),
};

const state = {
  currentSearchKey: '',
  currentMedicine: null,
  currentResultItem: null,
  currentMaxQty: null,
  showInStockOnly: false,
  currentUser: null,
  authToken: null,
  assistantMessages: [],
  currentPrescriptionId: null,
  cart: [],
  currentComparisonRows: [],
  currentDraftReservation: null,
};

const STORAGE_KEYS = {
  user: 'medifind-user',
  token: 'medifind-token',
  assistant: 'medifind-assistant',
  preferences: 'medifind-preferences',
};

const API_BASE_URL = localStorage.getItem('medifind-api-url') || '';
const DEMO_PASSWORD = 'Demo@12345';
const SEEDED_PASSWORDS = {
  'admin@medifind.test': 'Admin@1234',
  'customer@medifind.test': 'Customer@1234',
  'pharmacist@medifind.test': 'Pharmacist@1234',
};

const readJson = (key, fallbackValue) => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
};

const roleToApiRole = (role) => {
  const roleMap = {
    customer: 'CUSTOMER',
    pharmacist: 'PHARMACIST',
    admin: 'ADMIN',
    CUSTOMER: 'CUSTOMER',
    PHARMACIST: 'PHARMACIST',
    ADMIN: 'ADMIN',
    PHARMACY_OWNER: 'PHARMACY_OWNER',
  };

  return roleMap[role] || 'CUSTOMER';
};

const roleFromApiRole = (role) => String(role || 'CUSTOMER').toLowerCase();

const injectEnhancements = () => {
  if (document.getElementById('prescriptionInput')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <input type="file" id="prescriptionInput" accept=".pdf,.jpg,.jpeg,.png,.txt" hidden>
  `);
};

const cacheEnhancementDom = () => {
  dom.assistantDock = document.getElementById('assistantDock');
  dom.assistantFab = document.getElementById('assistantFab');
  dom.assistantPanel = document.getElementById('assistantPanel');
  dom.assistantMessages = document.getElementById('assistantMessages');
  dom.assistantForm = document.getElementById('assistantForm');
  dom.assistantInput = document.getElementById('assistantInput');
  dom.authModal = document.getElementById('authModal');
  dom.closeAuth = document.getElementById('closeAuth');
  dom.uploadRxBtn = document.getElementById('uploadRxBtn');
  dom.prescriptionInput = document.getElementById('prescriptionInput');
  dom.authForm = document.getElementById('authForm');
  dom.authTitle = document.getElementById('authTitle');
  dom.authSubtitle = document.getElementById('authSubtitle');
  dom.authName = document.getElementById('authName');
  dom.authEmail = document.getElementById('authEmail');
  dom.authRole = document.getElementById('authRole');
  dom.authSubmit = document.getElementById('authSubmit');
  dom.authSignOut = document.getElementById('authSignOut');
};

const persistPreferences = () => {
  writeJson(STORAGE_KEYS.preferences, {
    search: state.currentSearchKey,
    sort: dom.sortSelect?.value || 'distance',
    inStockOnly: state.showInStockOnly,
  });
};

const loadPreferences = () => {
  const preferences = readJson(STORAGE_KEYS.preferences, {});
  if (dom.medSearchInput && preferences.search) {
    dom.medSearchInput.value = preferences.search;
    state.currentSearchKey = preferences.search;
  }
  if (dom.sortSelect && preferences.sort) {
    dom.sortSelect.value = preferences.sort;
  }
  state.showInStockOnly = Boolean(preferences.inStockOnly);
  if (dom.filterInStock) {
    dom.filterInStock.classList.toggle('active', state.showInStockOnly);
  }
};

const renderAuthState = () => {
  const userStr = localStorage.getItem('medifind-user');
  const navBtn = document.getElementById('navAccountBtn');
  
  if (!navBtn) return;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const safeName = user.name || 'User'; 
      const initial = safeName.charAt(0).toUpperCase();
      const firstName = safeName.split(' ')[0];

      // User IS logged in -> Show Name and make it a Logout button
      navBtn.innerHTML = `
        <span class="user-avatar" style="background: var(--ink); color: white; padding: 4px 8px; border-radius: 50%; margin-right: 8px; font-size: 0.8rem;">
          ${initial}
        </span>
        ${firstName} (Logout)
      `;

      navBtn.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('medifind-token');
        localStorage.removeItem('medifind-user');
        window.location.href = 'login.html'; // Kick them back to login page
      };
      
    } catch (e) {
      // If data is corrupted, default to logged out state
      navBtn.textContent = 'Sign in';
      navBtn.onclick = () => window.location.href = 'login.html';
    }
  } else {
    // User IS NOT logged in -> Send them to the real login page
    navBtn.textContent = 'Sign in';
    navBtn.onclick = () => window.location.href = 'login.html';
  }
};
const enforceRoleAccess = () => {
  const userStr = localStorage.getItem('medifind-user');
  if (!userStr) return;
  
  const user = JSON.parse(userStr);
  const role = user.role;

  // Find all navigation links across the platform
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    // Check where the link is trying to go (either via data-view or href)
    const target = link.dataset.view || link.getAttribute('href') || '';

    // Define which roles are allowed to see which links
    let allowedRoles = [];
    
    if (target.includes('customer') || target.includes('history') || target.includes('index.html')) {
      allowedRoles = ['CUSTOMER', 'PHARMACIST', 'OWNER', 'ADMIN', 'SUPER_ADMIN'];
    } else if (target.includes('pharmacist') || target.includes('pharmacist-desk.html')) {
      allowedRoles = ['PHARMACIST', 'OWNER', 'ADMIN', 'SUPER_ADMIN'];
    } else if (target.includes('pharmacy') || target.includes('pharmacy-dashboard.html')) {
      allowedRoles = ['OWNER', 'ADMIN', 'SUPER_ADMIN'];
    } else if (target.includes('admin') || target.includes('admin-console.html')) {
      allowedRoles = ['ADMIN', 'SUPER_ADMIN'];
    }

    // Hide the link completely if the user's role is not authorized
    if (!allowedRoles.includes(role)) {
      link.style.display = 'none';
    }
  });
};
const openAuthModal = () => {
  const userStr = localStorage.getItem('medifind-user');
  if (userStr) {
    // If logged in, clicking logs them out
    localStorage.removeItem('medifind-token');
    localStorage.removeItem('medifind-user');
    window.location.href = 'login.html';
  } else {
    // If not logged in, send to the real login page
    window.location.href = 'login.html';
  }
};

const closeAuthModal = () => {
  if (!dom.authModal) return;
  dom.authModal.classList.remove('active');
};

const signOut = () => {
  state.currentUser = null;
  
  state.currentPrescriptionId = null;
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.token);
  renderAuthState();
  closeAuthModal();
  void renderAccountActivity();
  toastMessage('Signed out on this device.');
};

const ensureActivityPanel = () => {
  const container = document.getElementById('heroActivityContainer');
  if (!container) return null;
  let panel = container.querySelector('[data-user-activity]');
  if (!panel) {
    container.insertAdjacentHTML('beforeend', `
      <div class="panel-card" data-user-activity>
        <div class="panel-card-head">
          <h3>Your activity</h3>
          <span class="badge">Reservations & prescriptions</span>
        </div>
        <div data-user-activity-body></div>
      </div>
    `);
    panel = container.querySelector('[data-user-activity]');
  }
  return panel;
};

const renderAccountActivity = async () => {
  const panel = ensureActivityPanel();
  const body = panel?.querySelector('[data-user-activity-body]');
  if (!body) return;

  if (!state.currentUser ) {
    body.innerHTML = '<p class="muted">Sign in to see your reservations and prescriptions.</p>';
    return;
  }

  body.innerHTML = '<p class="muted">Loading your recent activity…</p>';

  try {
    const [reservationsPayload, prescriptionsPayload] = await Promise.all([
      apiFetch('/api/reservations').catch(() => ({ success: true, data: [] })),
      apiFetch('/api/prescriptions').catch(() => ({ success: true, data: [] })),
    ]);

    const reservations = (reservationsPayload.data || []).slice(0, 3).map((reservation) => {
      const isAwaitingReview = reservation.status === 'AWAITING_REVIEW';
      const isDraft = reservation.status === 'DRAFT_SENT';
      const itemCount = reservation.Items?.length || 0;
      return {
        kind: 'reservation',
        reservationId: reservation.id,
        raw: reservation,
        title: isAwaitingReview
          ? 'Prescription order — awaiting pharmacist review'
          : isDraft
            ? 'Pharmacist sent a draft — review needed'
            : (reservation.medicineName || 'Medicine reservation'),
        detail: isAwaitingReview
          ? `${reservation.pharmacyName || 'Pharmacy'}${reservation.customerNote ? ` • Note: ${reservation.customerNote}` : ''}`
          : isDraft
            ? `${itemCount} item${itemCount === 1 ? '' : 's'} proposed by ${reservation.pharmacyName || 'the pharmacy'}`
            : `${itemCount || 1} item${itemCount === 1 ? '' : 's'} • ${reservation.pharmacyName || 'Pharmacy'}${reservation.pharmacistNote ? ` • Pharmacist: ${reservation.pharmacistNote}` : ''}`,
        status: reservation.status,
        isDraft,
        pillClass: reservation.status === 'COMPLETED' ? 'ok' : (reservation.status === 'REJECTED' || reservation.status === 'CANCELLED') ? 'danger' : 'neutral',
        when: new Date(reservation.createdAt).toLocaleString(),
        code: reservation.reservationCode,
      };
    });

    const prescriptions = (prescriptionsPayload.data || []).slice(0, 3).map((prescription) => ({
      kind: 'prescription',
      title: 'Prescription upload',
      detail: prescription.fileUrl || 'Uploaded prescription',
      status: prescription.status,
      pillClass: prescription.status === 'APPROVED' ? 'ok' : prescription.status === 'REJECTED' ? 'danger' : 'neutral',
      when: new Date(prescription.createdAt).toLocaleString(),
      code: prescription.id,
    }));

    const items = [...reservations, ...prescriptions]
      .sort((a, b) => new Date(b.when) - new Date(a.when))
      .slice(0, 5);

    if (!items.length) {
      body.innerHTML = '<p class="muted">No reservations or prescriptions yet.</p>';
      return;
    }

    body.innerHTML = `
      <div class="reservation-list">
        ${items.map((item) => `
          <article class="reservation-row">
            <div class="reservation-info">
              <span class="reservation-id-mono">${escapeHtml(item.kind === 'reservation' ? item.code : item.code)}</span>
              <span class="reservation-customer">${escapeHtml(item.title)}</span>
              <span class="reservation-detail">${escapeHtml(item.detail)}</span>
            </div>
            <div class="reservation-actions">
              <span class="pill pill-${item.pillClass}">${escapeHtml(item.status)}</span>
              <span class="reservation-detail">${escapeHtml(item.when)}</span>
              ${item.isDraft ? `<button type="button" class="review-draft-btn" data-reservation-id="${escapeHtml(item.reservationId)}" style="margin-left:8px; display:inline-block; background:#0f766e; color:#ffffff; border:none; border-radius:6px; padding:6px 12px; font-size:0.85rem; font-weight:600; cursor:pointer; opacity:1; visibility:visible;">Review draft</button>` : ''}
              ${item.status === 'ACCEPTED' && item.raw.Pharmacy?.latitude ? `<button type="button" class="view-map-btn" data-lat="${item.raw.Pharmacy.latitude}" data-lng="${item.raw.Pharmacy.longitude}" data-pname="${escapeHtml(item.raw.Pharmacy.name)}" style="margin-left:8px; display:inline-block; background:var(--ink); color:#ffffff; border:none; border-radius:6px; padding:6px 12px; font-size:0.85rem; font-weight:600; cursor:pointer;">View Map</button>` : ''}
            </div>
          </article>
        `).join('')}
      </div>
    `;

    body.querySelectorAll('.review-draft-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const match = reservations.find((r) => r.reservationId === btn.dataset.reservationId);
        if (match) openDraftReviewModal(match.raw);
      });
    });
    body.querySelectorAll('.view-map-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lat = parseFloat(btn.dataset.lat);
        const lng = parseFloat(btn.dataset.lng);
        const pname = btn.dataset.pname;
        showMapModal(lat, lng, pname);
      });
    });
  } catch (error) {
    body.innerHTML = '<p class="muted">We could not load your recent activity right now.</p>';
  }
};

const uploadPrescriptionFile = async (file) => {
  if (!file) return;
  if (!state.currentUser) {
    toastMessage('Please sign in before uploading a prescription.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/prescriptions`, {
      method: 'POST',
        body: formData,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || 'Prescription upload failed');
    }

    state.currentPrescriptionId = payload.data?.id || null;
    void renderAccountActivity();
    toastMessage('Prescription uploaded successfully.');
  } catch (error) {
    toastMessage(`Prescription upload failed: ${error.message}`);
  }
};

const loadPharmacyOptions = async () => {
  if (!dom.prescriptionPharmacySelect) return;
  dom.prescriptionPharmacySelect.innerHTML = '<option value="">Loading pharmacies…</option>';
  try {
    const payload = await apiFetch('/api/pharmacies');
    const pharmacies = payload.data || [];
    if (!pharmacies.length) {
      dom.prescriptionPharmacySelect.innerHTML = '<option value="">No pharmacies available</option>';
      return;
    }
    dom.prescriptionPharmacySelect.innerHTML = pharmacies.map((pharmacy) => `
      <option value="${escapeHtml(pharmacy.id)}">${escapeHtml(pharmacy.name)}${pharmacy.city ? ` — ${escapeHtml(pharmacy.city)}` : ''}</option>
    `).join('');
  } catch (error) {
    dom.prescriptionPharmacySelect.innerHTML = '<option value="">Could not load pharmacies</option>';
  }
};

const openPrescriptionOrderModal = () => {
  if (!dom.prescriptionOrderModal) return;
  if (!state.currentUser ) {
    toastMessage('Please sign in before uploading a prescription.');
    return;
  }
  if (dom.prescriptionOrderStep1) dom.prescriptionOrderStep1.hidden = false;
  if (dom.prescriptionOrderStep2) dom.prescriptionOrderStep2.hidden = true;
  if (dom.prescriptionNoteInput) dom.prescriptionNoteInput.value = '';
  if (dom.prescriptionFilesInput) dom.prescriptionFilesInput.value = '';
  void loadPharmacyOptions();
  dom.prescriptionOrderModal.classList.add('active');
};

const closePrescriptionOrderModal = () => {
  if (!dom.prescriptionOrderModal) return;
  dom.prescriptionOrderModal.classList.remove('active');
};

const submitPrescriptionOrder = async () => {
  const pharmacyId = dom.prescriptionPharmacySelect?.value;
  const note = dom.prescriptionNoteInput?.value?.trim() || '';
  const files = dom.prescriptionFilesInput?.files || [];

  if (!pharmacyId) {
    toastMessage('Please choose a pharmacy.');
    return;
  }
  if (files.length === 0) {
    toastMessage('Please attach at least one prescription file.');
    return;
  }

  const formData = new FormData();
  formData.append('mode', 'prescription_only');
  formData.append('pharmacyId', pharmacyId);
  if (note) formData.append('note', note);
  Array.from(files).forEach((file) => formData.append('prescriptions', file));

  try {
    const response = await fetch(`${API_BASE_URL}/api/reservations`, {
      method: 'POST',
        body: formData,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || 'Could not submit prescription order');
    }

    if (dom.prescriptionOrderStep1) dom.prescriptionOrderStep1.hidden = true;
    if (dom.prescriptionOrderStep2) dom.prescriptionOrderStep2.hidden = false;
    if (dom.prescriptionOrderCode) {
      dom.prescriptionOrderCode.textContent = payload.data?.reservationCode || 'MF-000000';
    }

    void renderAccountActivity();
    toastMessage('Prescription sent for review.');
  } catch (error) {
    toastMessage(`Submission failed: ${error.message}`);
  }
};

const FOOD_TIMING_LABEL = {
  BEFORE_FOOD: 'before food',
  AFTER_FOOD: 'after food',
};

// Classic "1-0-0" style shorthand (morning-afternoon-evening), the same
// notation pharmacists normally write by hand on a strip or bottle
const formatDosageCode = (item) => {
  return `${item.morningDose ? 1 : 0}-${item.afternoonDose ? 1 : 0}-${item.eveningDose ? 1 : 0}`;
};

const formatDosageSchedule = (item) => {
  const m = item.morningDose ? 1 : 0;
  const a = item.afternoonDose ? 1 : 0;
  const e = item.eveningDose ? 1 : 0;
  
  const schedule = `${m}-${a}-${e}`;
  
  let timing = [];
  if (item.morningTiming) timing.push(`Morning: ${FOOD_TIMING_LABEL[item.morningTiming]}`);
  if (item.afternoonTiming) timing.push(`Afternoon: ${FOOD_TIMING_LABEL[item.afternoonTiming]}`);
  if (item.eveningTiming) timing.push(`Evening: ${FOOD_TIMING_LABEL[item.eveningTiming]}`);
  
  const timingStr = timing.length > 0 ? ` (${timing.join(', ')})` : '';
  
  return schedule === '0-0-0' ? 'No specific timing given' : `Dosage: ${schedule}${timingStr}`;
};

const openDraftReviewModal = (reservation) => {
  if (!dom.draftReviewModal) return;
  state.currentDraftReservation = reservation;

  if (dom.draftReviewPharmacyLine) {
    dom.draftReviewPharmacyLine.textContent = `${reservation.pharmacyName || 'The pharmacy'} has proposed the following:`;
  }

  const items = reservation.Items || [];
  if (dom.draftReviewItemsContainer) {
    let grandTotal = 0;

    const itemsHtml = items.map((item) => {
      // Safely grab the price from the backend's MedicineBatch data
      const price = item.MedicineBatch?.sellingPrice || 0;
      const lineTotal = price * item.quantity;
      grandTotal += lineTotal;

      return `
        <div style="border:1px solid var(--line, #e2e8f0); border-radius:8px; padding:10px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; font-weight:600;">
            <span>${escapeHtml(item.Medicine?.brandName || 'Medicine')} &times; ${item.quantity}</span>
            <span>₹${lineTotal.toFixed(2)} <span class="muted" style="font-size:0.8rem; font-weight:400;">(₹${price.toFixed(2)} ea)</span></span>
          </div>
          <div class="muted" style="font-size:0.85rem; margin-top:4px;">${escapeHtml(formatDosageSchedule(item))}</div>
          ${item.dosageNote ? `<div class="muted" style="font-size:0.8rem; margin-top:2px;">Note: ${escapeHtml(item.dosageNote)}</div>` : ''}
        </div>
      `;
    }).join('');

    dom.draftReviewItemsContainer.innerHTML = items.length
      ? itemsHtml + `<div style="text-align:right; font-weight:700; font-size:1.1rem; margin-top:10px; padding-top:10px; border-top:1px solid var(--line);">Total: ₹${grandTotal.toFixed(2)}</div>`
      : '<p class="muted">No items were proposed.</p>';
  }

  if (dom.draftReviewNoteBox) {
    if (reservation.pharmacistNote) {
      dom.draftReviewNoteBox.style.display = 'flex';
      dom.draftReviewNoteBox.innerHTML = `<span>Pharmacist note: ${escapeHtml(reservation.pharmacistNote)}</span>`;
    } else {
      dom.draftReviewNoteBox.style.display = 'none';
    }
  }

  dom.draftReviewModal.classList.add('active');
};

const closeDraftReviewModal = () => {
  if (!dom.draftReviewModal) return;
  dom.draftReviewModal.classList.remove('active');
};

const acceptDraft = async () => {
  const reservation = state.currentDraftReservation;
  if (!reservation) return;
  try {
    const payload = await apiFetch(`/api/reservations/${reservation.id}/accept`, { method: 'PATCH' });
    toastMessage(`Accepted! Show code ${payload.data?.reservationCode || ''} at pickup.`);
    closeDraftReviewModal();
    void renderAccountActivity();
  } catch (error) {
    toastMessage(`Could not accept: ${error.message}`);
  }
};

const rejectDraft = async () => {
  const reservation = state.currentDraftReservation;
  if (!reservation) return;
  try {
    await apiFetch(`/api/reservations/${reservation.id}/reject-draft`, { method: 'PATCH' });
    toastMessage('Draft declined.');
    closeDraftReviewModal();
    void renderAccountActivity();
  } catch (error) {
    toastMessage(`Could not decline: ${error.message}`);
  }
};

const getPasswordForProfile = (profile) => {
  return SEEDED_PASSWORDS[profile.email.toLowerCase()] || DEMO_PASSWORD;
};

const saveProfile = async (event) => {
  event.preventDefault();
  const profile = {
    name: dom.authName.value.trim(),
    email: dom.authEmail.value.trim().toLowerCase(),
    role: roleToApiRole(dom.authRole.value),
  };
  if (!profile.name || !profile.email) return;

  const password = getPasswordForProfile(profile);
  const previousLabel = dom.authSubmit?.textContent;
  if (dom.authSubmit) {
    dom.authSubmit.disabled = true;
    dom.authSubmit.textContent = 'Connecting...';
  }

  try {
    let authPayload;

    try {
      authPayload = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...profile, password }),
      });
    } catch (error) {
      if (!/already registered/i.test(error.message)) throw error;
      authPayload = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: profile.email, password }),
      });
    }

    state.currentUser = {
      ...authPayload.user,
      role: roleFromApiRole(authPayload.user.role),
    };
    
    writeJson(STORAGE_KEYS.user, state.currentUser);
    
    renderAuthState();
    closeAuthModal();
    void renderAccountActivity();
    toastMessage(`Welcome, ${state.currentUser.name.split(' ')[0]}.`);
  } catch (error) {
    toastMessage(`Sign in failed: ${error.message}`);
  } finally {
    if (dom.authSubmit) {
      dom.authSubmit.disabled = false;
      dom.authSubmit.textContent = previousLabel || 'Save profile';
    }
  }
};

const loadProfile = async () => {
  // 1. Grab data from local storage
  state.currentUser = readJson('medifind-user', null);
  
  renderAuthState(); // Update the button immediately

  if (!state.currentUser) return;

  // 2. Try to verify with backend in the background
  try {
    const payload = await apiFetch('/api/auth/me');
    if (payload?.user) {
      state.currentUser = {
        ...payload.user,
        role: String(payload.user.role || 'CUSTOMER').toUpperCase(),
      };
      writeJson('medifind-user', state.currentUser);
      renderAuthState();
    }
  } catch (error) {
    // If backend ping fails, log the error but DO NOT delete the session!
    console.warn("Backend validation ping failed, but keeping session active:", error);
  }
};
const loadAssistantHistory = () => {
  const savedMessages = readJson(STORAGE_KEYS.assistant, []);
  state.assistantMessages = savedMessages.length ? savedMessages : [
    { role: 'assistant', text: 'I can help you search medicines, reserve stock, sign in, or jump to a dashboard.' },
  ];
};

const renderAssistantMessages = () => {
  if (!dom.assistantMessages) return;
  dom.assistantMessages.innerHTML = state.assistantMessages.map((message) => `
    <div class="assistant-bubble ${message.role === 'user' ? 'user' : 'assistant'}">
      <span>${escapeHtml(message.text)}</span>
    </div>
  `).join('');
  dom.assistantMessages.scrollTop = dom.assistantMessages.scrollHeight;
};

const storeAssistantMessage = (message) => {
  state.assistantMessages.push(message);
  if (state.assistantMessages.length > 40) {
    state.assistantMessages = state.assistantMessages.slice(-40);
  }
  writeJson(STORAGE_KEYS.assistant, state.assistantMessages);
  renderAssistantMessages();
};

const findMedicineMatch = (text) => {
  const query = text.toLowerCase();
  return Object.values(MEDICINES_DB).find((medicine) => {
    if (query.includes(medicine.name.toLowerCase()) || query.includes(medicine.generic.toLowerCase())) return true;
    return (medicine.brands || []).some((brand) => query.includes(brand.toLowerCase()));
  });
};

const getAssistantReply = (text) => {
  const query = text.toLowerCase();
  const matchedMedicine = findMedicineMatch(text);

  if (/^(hi|hello|hey)\b/.test(query)) {
    return 'Hello. I can help you search medicine, reserve stock, sign in, or move between the dashboard pages.';
  }
  if (query.includes('sign in') || query.includes('login') || query.includes('account')) {
    return 'Use the Sign in button in the header to save your profile. Your name, email, and role are stored on this device.';
  }
  if (query.includes('reserve') || query.includes('booking') || query.includes('hold stock')) {
    return 'Search a medicine first, then use Reserve on a result card. I can help you find in-stock options before you confirm.';
  }
  if (query.includes('pharmacy') || query.includes('dashboard')) {
    return 'The site includes Pharmacy Dashboard, Pharmacist Desk, and Admin Console pages. Use the header tabs to switch between them.';
  }
  if (matchedMedicine) {
    const topResult = matchedMedicine.results[0];
    const stockNote = matchedMedicine.requiresRx ? 'It requires a prescription.' : 'It is available without a prescription.';
    return `${matchedMedicine.name} is tracked here. The nearest listed pharmacy is ${topResult.pharmacy}, about ${formatDistance(topResult.distance)}, with ${topResult.qty} units at ${formatCurrency(topResult.price)}. ${stockNote}`;
  }
  if (query.includes('search')) {
    return 'Use the search box at the top of the page, then sort by distance, price, or stock.';
  }
  return 'I can help with medicine search, reservations, sign in, and navigating the site. Ask me about a medicine name to get started.';
};

const openAssistant = () => {
  if (!dom.assistantPanel) return;
  dom.assistantPanel.classList.add('active');
  dom.assistantPanel.setAttribute('aria-hidden', 'false');
  dom.assistantFab?.setAttribute('aria-expanded', 'true');
  dom.assistantInput?.focus();
};

const closeAssistant = () => {
  if (!dom.assistantPanel) return;
  dom.assistantPanel.classList.remove('active');
  dom.assistantPanel.setAttribute('aria-hidden', 'true');
  dom.assistantFab?.setAttribute('aria-expanded', 'false');
};

const toggleAssistant = () => {
  if (!dom.assistantPanel) return;
  if (dom.assistantPanel.classList.contains('active')) {
    closeAssistant();
  } else {
    openAssistant();
  }
};

const submitAssistantMessage = (rawText) => {
  const text = rawText.trim();
  if (!text) return;
  storeAssistantMessage({ role: 'user', text });
  storeAssistantMessage({ role: 'assistant', text: getAssistantReply(text) });
};

const formatCurrency = (value) => `₹${Number(value).toFixed(0)}`;
const formatDistance = (value) => {
  if (value === null || value === undefined || value === 'N/A') return 'Distance N/A';
  const num = Number(value);
  return isNaN(num) ? 'Distance N/A' : `${num.toFixed(1)} km`;
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const toastMessage = (message) => {
  if (!dom.toast) return;
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  window.clearTimeout(dom.toast.timer);
  dom.toast.timer = window.setTimeout(() => dom.toast.classList.remove('show'), 2500);
};

const setActiveNav = (view) => {
  dom.navLinks.forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  dom.views.forEach((panel) => panel.classList.toggle('active', panel.id === `view-${view}`));
  
  if (view === 'history') {
    loadCustomerHistory();
  }
};

const setActiveDashboardPanel = (root, defaultPanel) => {
  if (!root) return;
  const buttons = root.querySelectorAll('.dash-nav-item');
  const panels = root.closest('.dash-shell')?.querySelectorAll('.dash-panel') || [];

  const activatePanel = (panelName) => {
    buttons.forEach((button) => button.classList.toggle('active', button.dataset.panel === panelName));
    panels.forEach((panel) => panel.classList.toggle('active', panel.id === `panel-${panelName}`));
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => activatePanel(button.dataset.panel));
  });

  activatePanel(defaultPanel || buttons[0]?.dataset.panel);
};

const renderTicker = () => {
  if (!dom.tickerList) return;
  dom.tickerList.innerHTML = TICKER_ITEMS.map((item) => `
    <div class="ticker-item">
      <div class="ticker-item-left">
        <span class="pulse-dot pulse-dot--sm ${item.status === 'in' ? 'live' : item.status === 'low' ? 'low' : 'out'}"></span>
        <div>
          <div class="ticker-med">${escapeHtml(item.med)}</div>
          <span class="ticker-pharmacy">${escapeHtml(item.pharmacy)}</span>
        </div>
      </div>
      <span class="ticker-status ${item.status}">${item.status.toUpperCase()}</span>
    </div>
  `).join('');
};

const renderAltSuggestions = (query) => {
  if (!dom.altSuggestion || !dom.altChips) return;
  const suggestions = ALTERNATIVE_SUGGESTIONS[query] || [];
  if (!suggestions.length) {
    dom.altSuggestion.hidden = true;
    dom.altChips.innerHTML = '';
    return;
  }

  dom.altSuggestion.hidden = false;
  dom.altChips.innerHTML = suggestions.map((alt) => `<button class="tag" type="button" data-alt="${escapeHtml(alt)}">${escapeHtml(alt)}</button>`).join('');
  dom.altChips.querySelectorAll('[data-alt]').forEach((button) => {
    button.addEventListener('click', () => {
      const alt = button.dataset.alt || '';
      if (dom.medSearchInput) dom.medSearchInput.value = alt;
      state.currentSearchKey = alt;
      renderSearchResults();
    });
  });
};

const normalizeApiMedicine = (medicine) => ({
  id: medicine.id,
  name: medicine.brandName,
  generic: medicine.genericName,
  dosage: [medicine.dosageForm, medicine.strength].filter(Boolean).join(' '),
  requiresRx: Boolean(medicine.prescriptionRequired),
  isRestricted: Boolean(medicine.isRestricted),
  saltComposition: medicine.saltComposition,
  hsnCode: medicine.hsnCode,
  packSize: medicine.packSize,
  gstRate: medicine.gstRate,
  results: (medicine.pharmacies || []).map((item, index) => ({
    pharmacy: item.pharmacyName,
    pharmacyId: item.pharmacyId,
    medicineId: medicine.id,
    medicineName: medicine.brandName,
    genericName: medicine.genericName,
    requiresRx: Boolean(medicine.prescriptionRequired),
    isRestricted: Boolean(medicine.isRestricted),
    saltComposition: medicine.saltComposition,
    batchId: item.batchId,
    batchNumber: item.batchNumber,
    distance: item.distance !== undefined && item.distance !== null ? item.distance : 'N/A',
    price: item.sellingPrice,
    mrp: item.mrp,
    ptr: item.ptr,
    qty: item.availableQuantity,
    updated: 'just now',
    expiryDate: item.expiryDate,
    rackNumber: item.rackNumber,
    shelfNumber: item.shelfNumber,
    supplierName: item.supplierName,
  })),
});
const findNearbyPharmacies = () => {
  const box = document.getElementById('nearbyResultsBox');
  if (!box) return;

  const fetchPharmacies = async (latitude, longitude) => {
    try {
      const payload = await apiFetch(`/api/pharmacies?lat=${latitude}&lng=${longitude}&radiusKm=10`);
      const pharmacies = payload.data || [];

      if (!pharmacies.length) {
        box.innerHTML = '<p class="muted">No approved pharmacies found within 10km. Try searching a medicine instead to see all listings.</p>';
        return;
      }

      box.innerHTML = pharmacies.map((p) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; border:1px solid var(--line, #e2e8f0); border-radius:8px; margin-bottom:8px;">
          <div>
            <div style="font-weight:600;">${escapeHtml(p.name)}</div>
            <div class="muted" style="font-size:0.85rem;">${escapeHtml(p.address || p.city || '')}</div>
          </div>
          <div style="font-weight:600; color:var(--ink);">${p.distanceKm} km</div>
        </div>
      `).join('');
    } catch (error) {
      box.innerHTML = `<p class="muted">Could not load nearby pharmacies: ${escapeHtml(error.message)}</p>`;
    }
  };

  box.style.display = 'block';
  box.innerHTML = '<p class="muted">Finding pharmacies near you…</p>';

  const savedLoc = localStorage.getItem('medifind-loc');
  if (savedLoc) {
    const parsed = JSON.parse(savedLoc);
    fetchPharmacies(parsed.lat, parsed.lng);
    return;
  }

  if (!navigator.geolocation) {
    box.innerHTML = '<p class="muted">Your browser does not support location access. Please set location manually above.</p>';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => fetchPharmacies(position.coords.latitude, position.coords.longitude),
    () => {
      box.innerHTML = '<p class="muted">Could not access your location. Please allow location access or set location manually above.</p>';
    }
  );
};
const getCurrentPositionAsync = () => new Promise((resolve) => {
  if (!navigator.geolocation) return resolve(null);
  navigator.geolocation.getCurrentPosition(
    (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    () => resolve(null)
  );
});

let currentMap = null;
const showMapModal = async (pharmacyLat, pharmacyLng, pharmacyName) => {
  const modal = document.getElementById('mapModal');
  if (!modal) return;
  modal.classList.add('active');

  let custLat = null;
  let custLng = null;
  const savedLoc = localStorage.getItem('medifind-loc');
  if (savedLoc) {
    try {
      const p = JSON.parse(savedLoc);
      custLat = p.lat; custLng = p.lng;
    } catch(e) {}
  } else {
    const loc = await getCurrentPositionAsync();
    if (loc) {
      custLat = loc.lat; custLng = loc.lng;
    }
  }

  if (!currentMap) {
    currentMap = L.map('pharmacyMap');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(currentMap);
  }

  currentMap.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      currentMap.removeLayer(layer);
    }
  });

  const pMarker = L.marker([pharmacyLat, pharmacyLng]).addTo(currentMap)
    .bindTooltip(`<b>${pharmacyName}</b>`, { permanent: true, direction: 'top', className: 'map-label' });

  const bounds = L.latLngBounds([[pharmacyLat, pharmacyLng]]);

  if (custLat != null && custLng != null) {
    L.marker([custLat, custLng]).addTo(currentMap)
      .bindTooltip("<b>You are here</b>", { permanent: true, direction: 'top', className: 'map-label' });
    bounds.extend([custLat, custLng]);
  }

  currentMap.fitBounds(bounds, { padding: [50, 50] });
  setTimeout(() => currentMap.invalidateSize(), 100);
};

const searchMedicinesFromApi = async (query) => {
  let lat = null, lng = null;
  const savedLoc = localStorage.getItem('medifind-loc');
  if (savedLoc) {
    try {
      const parsed = JSON.parse(savedLoc);
      lat = parsed.lat;
      lng = parsed.lng;
    } catch(e) {}
  } else {
    const loc = await getCurrentPositionAsync();
    if (loc) {
      lat = loc.lat;
      lng = loc.lng;
    }
  }
  
  let url = `/api/medicines?q=${encodeURIComponent(query)}`;
  if (lat != null && lng != null) {
    url += `&lat=${lat}&lng=${lng}`;
  }
  
  const payload = await apiFetch(url);
  return (payload.data || []).map(normalizeApiMedicine);
};

const normalizeSalt = (value) => String(value || '').trim().toLowerCase();

// Build one flat, comparable list of pharmacy listings across every brand
// that shares the same salt composition as the primary match, so price
// sort can genuinely compare "same medicine, different brand" side by side.
const buildComparisonRows = (medicines, saltComposition) => {
  const targetSalt = normalizeSalt(saltComposition);
  const matchingMedicines = targetSalt
    ? medicines.filter((med) => normalizeSalt(med.saltComposition) === targetSalt)
    : medicines;

  const rows = [];
  matchingMedicines.forEach((med) => {
    med.results.forEach((result) => {
      rows.push({ ...result, rowId: `${med.id}-${result.pharmacyId}-${result.batchId}` });
    });
  });
  return rows;
};

const bindReserveButtons = () => {
  document.querySelectorAll('.result-reserve').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.currentComparisonRows.find((result) => result.rowId === button.dataset.rowId);
      if (!item) return;
      state.currentResultItem = item;
      openReserveModal(item.medicineName, item.pharmacy);
    });
  });
};

const openReserveModal = (medicineName, pharmacyName) => {
  if (!dom.reserveModal) return;
  if (dom.reserveMedName) dom.reserveMedName.textContent = medicineName;
  if (dom.reservePharmName) dom.reservePharmName.textContent = pharmacyName;
  if (dom.qtyInput) dom.qtyInput.value = 1;

  const item = state.currentResultItem;
  const stockAvailable = item ? Math.max(0, Number(item.qty) || 0) : 0;
  const globalCap = parseInt(localStorage.getItem('medifind-resv-cap'), 10) || DEFAULT_MAX_RESERVATION;
  const maxQty = Math.max(1, Math.min(stockAvailable || globalCap, globalCap));

  if (dom.qtyInput) dom.qtyInput.max = maxQty;
  state.currentMaxQty = maxQty;

  if (dom.reserveStep1) dom.reserveStep1.hidden = false;
  if (dom.reserveStep2) dom.reserveStep2.hidden = true;
  dom.reserveModal.classList.add('active');
};

const closeReserveModal = () => {
  if (!dom.reserveModal) return;
  dom.reserveModal.classList.remove('active');
};

const renderSearchResults = async () => {
  if (!dom.resultsGrid) return;

  const query = state.currentSearchKey.trim();
  if (!query) {
    dom.resultsTitle.textContent = 'Search a medicine to see live pharmacy stock';
    dom.resultsSub.textContent = 'Results show distance, price, and exact quantity on shelf - updated within minutes.';
    dom.resultsGrid.innerHTML = '';
    if (dom.altSuggestion) dom.altSuggestion.hidden = true;
    state.currentMedicine = null;
    state.currentComparisonRows = [];
    return;
  }

  dom.resultsTitle.textContent = `Searching \u201c${query}\u201d...`;
  dom.resultsSub.textContent = 'Fetching live stock from the backend.';
  dom.resultsGrid.innerHTML = '<div class="empty-state"><p>Searching live inventory\u2026</p></div>';

  try {
    let medicines = await searchMedicinesFromApi(query);
    const primaryMedicine = medicines.find((item) => {
      const haystack = `${item.name} ${item.generic} ${item.saltComposition || ''}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    }) || medicines[0] || null;

    state.currentMedicine = primaryMedicine;

    if (!primaryMedicine || !primaryMedicine.results.length) {
      dom.resultsTitle.textContent = `No live results for \u201c${query}\u201d`;
      dom.resultsSub.textContent = 'Try a generic name or another common brand.';
      dom.resultsGrid.innerHTML = '<div class="empty-state"><p>No pharmacies currently list that medicine.</p></div>';
      if (dom.altSuggestion) dom.altSuggestion.hidden = true;
      state.currentComparisonRows = [];
      return;
    }

    // Fetch sibling brands sharing the same salt \u2014 a brand-name search
    // (e.g. "Calpol") won't surface other brands on its own, since their
    // salt text doesn't contain the word "Calpol". Searching directly by
    // the salt composition does.
    if (primaryMedicine.saltComposition) {
      try {
        const siblingMedicines = await searchMedicinesFromApi(primaryMedicine.saltComposition);
        const knownIds = new Set(medicines.map((med) => med.id));
        siblingMedicines.forEach((med) => {
          if (!knownIds.has(med.id)) {
            medicines.push(med);
            knownIds.add(med.id);
          }
        });
      } catch {
        // Non-fatal \u2014 worst case, comparison is limited to the primary brand only
      }
    }

    const comparisonRows = buildComparisonRows(medicines, primaryMedicine.saltComposition);
    const brandCount = new Set(comparisonRows.map((row) => row.medicineId)).size;

    dom.resultsTitle.textContent = brandCount > 1
      ? `${brandCount} brands available for ${primaryMedicine.generic || primaryMedicine.name}`
      : `${primaryMedicine.name} available nearby`;
    dom.resultsSub.textContent = brandCount > 1
      ? 'Comparing every brand with the same salt composition \u2014 sort by price to find the cheapest.'
      : 'Live stock and pricing across nearby pharmacies.';

    const results = comparisonRows.slice();
    const sortValue = dom.sortSelect?.value || 'distance';
    if (sortValue === 'distance') results.sort((a, b) => a.distance - b.distance);
    if (sortValue === 'price') results.sort((a, b) => a.price - b.price);
    if (sortValue === 'stock') results.sort((a, b) => b.qty - a.qty);

    state.currentComparisonRows = results;

    const filtered = results.filter((item) => (state.showInStockOnly ? item.qty > 0 : true));
    dom.resultsGrid.innerHTML = filtered.length ? filtered.map((item) => {
     const currentQty = item.qty || 0;
      const outOfStock = currentQty === 0;

      const stockClass = outOfStock ? 'out-stock' : currentQty <= 10 ? 'low-stock' : 'in-stock';
      const stockLabel = outOfStock ? 'Out of stock' : `${currentQty} units`;

      return `
        <article class="result-card" data-pharmacy="${escapeHtml(item.pharmacy)}">
          <div class="result-pharmacy">
            <div class="result-pharmacy-name">${escapeHtml(item.medicineName)}${item.requiresRx ? ' <span class="muted" style="font-size:0.7rem; font-weight:500;">(Rx)</span>' : ''}${item.isRestricted ? ' <span style="font-size:0.7rem; font-weight:700; color:#b45309; background:#fef3c7; padding:2px 6px; border-radius:4px; margin-left:4px;">\u26a0 Restricted</span>' : ''}</div>
            <div class="result-meta" style="font-weight:500;">
              ${escapeHtml(item.pharmacy)}
            </div>
            <div class="result-meta">
              <span>${formatDistance(item.distance)}</span>
              <span>\u2022</span>
              <span>Updated ${escapeHtml(item.updated)}</span>
            </div>
          </div>
          <div class="result-col">
            <span class="result-col-label">Price</span>
            <span class="result-col-value price">${formatCurrency(item.price)}</span>
          </div>
          <div class="result-col">
            <span class="result-col-label">Quantity</span>
            <span class="result-col-value">${stockLabel}</span>
          </div>
          <div class="stock-status ${stockClass}">
            <span class="pulse-dot pulse-dot--sm ${outOfStock ? 'out' : item.qty <= 10 ? 'low' : 'live'}"></span>
            ${outOfStock ? 'Unavailable' : currentQty <= 10 ? 'Low stock' : 'In stock'}
          </div>
<button class="btn-reserve result-reserve" data-row-id="${item.rowId}" ${outOfStock ? 'disabled' : ''}>Add to Cart</button>        </article>
      `;
    }).join('') : '<div class="empty-state"><p>No pharmacies match your filters. Try removing the in-stock filter or searching a nearby alternative.</p></div>';

    renderAltSuggestions(query);
    bindReserveButtons();
  } catch (error) {
    state.currentMedicine = null;
    state.currentComparisonRows = [];
    dom.resultsTitle.textContent = 'Unable to load live inventory';
    dom.resultsSub.textContent = 'The backend search is temporarily unavailable.';
    dom.resultsGrid.innerHTML = '<div class="empty-state"><p>Unable to load live inventory right now.</p></div>';
    if (dom.altSuggestion) dom.altSuggestion.hidden = true;
  }
};

const CART_STORAGE_KEY = 'medifind-cart';

const persistCart = () => {
  writeJson(CART_STORAGE_KEY, state.cart);
};

const loadCart = () => {
  state.cart = readJson(CART_STORAGE_KEY, []);
};

const updateCartBadge = () => {
  if (!dom.cartCount) return;
  const totalItems = state.cart.length;
  dom.cartCount.textContent = String(totalItems);
  dom.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
};

const addToCart = () => {
  if (!state.currentResultItem || !dom.qtyInput || !dom.reserveStep1 || !dom.reserveStep2) return;

  if (!state.currentUser ) {
    toastMessage('Please sign in before reserving medicine.');
    return;
  }

  const requestedQty = Math.max(1, Number(dom.qtyInput.value) || 1);
  const maxQty = state.currentMaxQty || DEFAULT_MAX_RESERVATION;

  if (requestedQty > maxQty) {
    toastMessage(`Only ${maxQty} unit(s) available. Please lower the quantity.`);
    return;
  }

  const item = state.currentResultItem;

  // Merge with an existing cart line for the SAME batch at the SAME pharmacy,
  // rather than creating a duplicate row
  const existing = state.cart.find((line) => line.batchId === item.batchId && line.pharmacyId === item.pharmacyId);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + requestedQty, maxQty);
  } else {
    state.cart.push({
      cartLineId: `${item.pharmacyId}-${item.batchId}-${Date.now()}`,
      pharmacyId: item.pharmacyId,
      pharmacyName: item.pharmacy,
      medicineId: item.medicineId,
      medicineName: item.medicineName || state.currentMedicine?.name || 'Medicine',
      batchId: item.batchId,
      quantity: requestedQty,
      maxQty,
      price: item.price || 0,
      requiresRx: Boolean(item.requiresRx),
      isRestricted: Boolean(item.isRestricted),
    });
  }

  persistCart();
  updateCartBadge();

  dom.reserveStep1.hidden = true;
  dom.reserveStep2.hidden = false;
  if (dom.addedToCartSummary) {
    dom.addedToCartSummary.textContent = `${requestedQty} \u00d7 ${item.medicineName || 'Medicine'} added from ${item.pharmacy}.`;
  }
};

const renderCartModal = () => {
  if (!dom.cartItemsContainer) return;

  if (state.cart.length === 0) {
    dom.cartItemsContainer.innerHTML = '<div class="empty-state"><p>Your cart is empty. Search for medicine and add items to get started.</p></div>';
    if (dom.reserveAllBtn) dom.reserveAllBtn.disabled = true;
    return;
  }

  if (dom.reserveAllBtn) dom.reserveAllBtn.disabled = false;

  const groups = {};
  state.cart.forEach((line) => {
    if (!groups[line.pharmacyId]) {
      groups[line.pharmacyId] = { pharmacyName: line.pharmacyName, lines: [] };
    }
    groups[line.pharmacyId].lines.push(line);
  });

  dom.cartItemsContainer.innerHTML = Object.entries(groups).map(([pharmacyId, group]) => {
    const groupTotal = group.lines.reduce((sum, line) => sum + (line.price * line.quantity), 0);
    return `
      <div class="cart-group" style="border:1px solid var(--line, #e2e8f0); border-radius:8px; padding:12px; margin-bottom:12px;">
        <div style="font-weight:600; margin-bottom:8px; display:flex; justify-content:space-between;">
          <span>${escapeHtml(group.pharmacyName)}</span>
          <span class="muted" style="font-weight:400;">Separate order</span>
        </div>
        ${group.lines.map((line) => `
          <div class="cart-line" data-line-id="${line.cartLineId}" style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 0; border-top:1px solid var(--line, #e2e8f0);">
            <div style="flex:1;">
              <div>${escapeHtml(line.medicineName)}${line.requiresRx ? ' <span class="muted" style="font-size:0.75rem;">(Rx)</span>' : ''}${line.isRestricted ? ' <span style="font-size:0.7rem; font-weight:700; color:#b45309; background:#fef3c7; padding:1px 5px; border-radius:4px;">\u26a0 Restricted</span>' : ''}</div>
              <div class="muted" style="font-size:0.8rem;">${formatCurrency(line.price)} each</div>
            </div>
            <div class="qty-control" style="display:flex; align-items:center; gap:6px;">
              <button type="button" class="cart-qty-minus" data-line-id="${line.cartLineId}">\u2212</button>
              <input type="number" class="cart-qty-input" data-line-id="${line.cartLineId}" value="${line.quantity}" min="1" max="${line.maxQty}" style="width:48px; text-align:center;">
              <button type="button" class="cart-qty-plus" data-line-id="${line.cartLineId}">+</button>
            </div>
            <button type="button" class="cart-remove-btn" data-line-id="${line.cartLineId}" title="Remove" style="background:none; border:none; color:#dc2626; cursor:pointer; font-size:1.1rem;">&times;</button>
          </div>
        `).join('')}
        <div style="text-align:right; margin-top:8px; font-weight:600;">Subtotal: ${formatCurrency(groupTotal)}</div>
      </div>
    `;
  }).join('');

  if (dom.cartPrescriptionSection) {
    const needsFile = state.cart.some((line) => line.requiresRx || line.isRestricted);
    dom.cartPrescriptionSection.style.display = needsFile ? 'block' : 'none';
  }

  dom.cartItemsContainer.querySelectorAll('.cart-qty-minus').forEach((btn) => {
    btn.addEventListener('click', () => adjustCartLineQty(btn.dataset.lineId, -1));
  });
  dom.cartItemsContainer.querySelectorAll('.cart-qty-plus').forEach((btn) => {
    btn.addEventListener('click', () => adjustCartLineQty(btn.dataset.lineId, 1));
  });
  dom.cartItemsContainer.querySelectorAll('.cart-qty-input').forEach((input) => {
    input.addEventListener('change', () => {
      const line = state.cart.find((l) => l.cartLineId === input.dataset.lineId);
      if (!line) return;
      const value = Math.max(1, Number(input.value) || 1);
      if (value > line.maxQty) {
        toastMessage(`Only ${line.maxQty} unit(s) available for ${line.medicineName}.`);
      }
      line.quantity = value;
      persistCart();
    });
  });
  dom.cartItemsContainer.querySelectorAll('.cart-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.cart = state.cart.filter((l) => l.cartLineId !== btn.dataset.lineId);
      persistCart();
      updateCartBadge();
      renderCartModal();
    });
  });
};

const adjustCartLineQty = (lineId, delta) => {
  const line = state.cart.find((l) => l.cartLineId === lineId);
  if (!line) return;
  const newQty = Math.max(1, Math.min(line.maxQty, line.quantity + delta));
  if (line.quantity + delta > line.maxQty) {
    toastMessage(`Only ${line.maxQty} unit(s) available for ${line.medicineName}.`);
  }
  line.quantity = newQty;
  persistCart();
  renderCartModal();
};

const openCartModal = () => {
  if (!dom.cartModal) return;
  if (dom.cartViewMain) dom.cartViewMain.hidden = false;
  if (dom.cartViewSuccess) dom.cartViewSuccess.hidden = true;
  renderCartModal();
  dom.cartModal.classList.add('active');
};

const closeCartModal = () => {
  if (!dom.cartModal) return;
  dom.cartModal.classList.remove('active');
};

const reserveAllCartItems = async () => {
  if (!state.currentUser ) {
    toastMessage('Please sign in before reserving medicine.');
    return;
  }
  if (state.cart.length === 0) return;

  const needsFile = state.cart.some((line) => line.requiresRx || line.isRestricted);
  const files = dom.cartPrescriptionFilesInput?.files || [];

  if (needsFile && files.length === 0) {
    alert('please attach a valid prescription');
    toastMessage('please attach a valid prescription');
    return;
  }

  const groups = {};
  state.cart.forEach((line) => {
    if (!groups[line.pharmacyId]) {
      groups[line.pharmacyId] = { pharmacyName: line.pharmacyName, lines: [] };
    }
    groups[line.pharmacyId].lines.push(line);
  });

  const results = [];
  const succeededLineIds = [];
  const cartNote = dom.cartNoteInput?.value?.trim() || '';

  for (const [pharmacyId, group] of Object.entries(groups)) {
    try {
      const cartPayload = group.lines.map((line) => ({
        medicineId: line.medicineId,
        batchId: line.batchId,
        quantity: line.quantity,
      }));

      let payload;

      if (needsFile) {
        // Same file(s) are attached to every per-pharmacy order in this
        // checkout — harmless for groups that don't actually need it,
        // since the backend only enforces the check where it applies.
        const formData = new FormData();
        formData.append('pharmacyId', pharmacyId);
        formData.append('cart', JSON.stringify(cartPayload));
        if (cartNote) formData.append('note', cartNote);
        Array.from(files).forEach((file) => formData.append('prescriptions', file));

        const response = await fetch(`${API_BASE_URL}/api/reservations`, {
          method: 'POST',
          headers: {  },
        body: formData,
        });
        payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.message || 'Request failed');
        }
      } else {
        payload = await apiFetch('/api/reservations', {
          method: 'POST',
        body: JSON.stringify({
            pharmacyId,
            cart: JSON.stringify(cartPayload),
            note: cartNote || undefined,
          }),
        });
      }

      results.push({
        pharmacyName: group.pharmacyName,
        ok: true,
        reservationCode: payload.data?.reservationCode || 'MF-000000',
      });
      group.lines.forEach((line) => succeededLineIds.push(line.cartLineId));
    } catch (error) {
      results.push({
        pharmacyName: group.pharmacyName,
        ok: false,
        message: error.message,
      });
    }
  }

  state.cart = state.cart.filter((line) => !succeededLineIds.includes(line.cartLineId));
  persistCart();
  updateCartBadge();

  if (dom.cartViewMain) dom.cartViewMain.hidden = true;
  if (dom.cartViewSuccess) dom.cartViewSuccess.hidden = false;
  if (dom.cartSuccessList) {
    dom.cartSuccessList.innerHTML = results.map((result) => {
      if (result.ok) {
        return `<div style="margin-bottom:8px;">\u2705 <strong>${escapeHtml(result.pharmacyName)}</strong> \u2014 reserved. Show code <strong>${escapeHtml(result.reservationCode)}</strong> at pickup.</div>`;
      }
      return `<div style="margin-bottom:8px; color:#dc2626;">\u274c <strong>${escapeHtml(result.pharmacyName)}</strong> \u2014 failed: ${escapeHtml(result.message)}</div>`;
    }).join('');
  }

  await renderSearchResults();
  void renderAccountActivity();

  const successCount = results.filter((r) => r.ok).length;
  if (successCount > 0) {
    toastMessage(`${successCount} order(s) reserved.`);
  }
};

const renderLowStockTable = () => {
  if (!dom.lowStockTable) return;
  dom.lowStockTable.innerHTML = `
    <thead>
      <tr><th>Medicine</th><th>Batch</th><th>Qty</th><th>Threshold</th></tr>
    </thead>
    <tbody>
      ${LOW_STOCK_DATA.map((item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.batch)}</td>
          <td>${item.qty}</td>
          <td>${item.threshold}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
};

const renderDemandList = () => {
  if (!dom.demandList) return;
  const maxValue = Math.max(...DEMAND_DATA.map((item) => item.value), 1);
  dom.demandList.innerHTML = DEMAND_DATA.map((item) => {
    const percent = Math.round((item.value / maxValue) * 100);
    return `
      <div class="bar-row">
        <div class="bar-row-label">
          <span>${escapeHtml(item.name)}</span>
          <span>${item.value}</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width: ${percent}%"></div></div>
      </div>
    `;
  }).join('');
};

const renderInventoryTable = () => {
  if (!dom.inventoryTable) return;
  dom.inventoryTable.innerHTML = `
    <thead>
      <tr><th>Medicine</th><th>Batch</th><th>Qty</th><th>Price</th><th>Expiry</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${INVENTORY_DATA.map((item) => {
        const orig = item.originalQty || 50; 
        let statusText = 'Good';
        let pillClass = 'ok';
        
        if (item.qty < 5 || item.qty <= orig * 0.3) {
          statusText = 'Low';
          pillClass = 'danger';
        } else if (item.qty <= orig * 0.6) {
          statusText = 'Medium';
          pillClass = 'warn';
        }

        // if the mock data marked it as expiring, keep that note
        if (item.status === 'expiring') {
          statusText = 'Expiring soon';
          pillClass = 'warn';
        }

        return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.batch)}</td>
          <td>${item.qty}</td>
          <td>${formatCurrency(item.price)}</td>
          <td>${escapeHtml(item.expiry)}</td>
          <td><span class="pill pill-${pillClass}">${escapeHtml(statusText)}</span></td>
        </tr>
      `}).join('')}
    </tbody>
  `;
};

const renderReservationList = () => {
  if (!dom.reservationList) return;
  dom.reservationList.innerHTML = RESERVATIONS_DATA.map((item) => `
    <article class="reservation-row">
      <div class="reservation-info">
        <span class="reservation-id-mono">${escapeHtml(item.id)}</span>
        <span class="reservation-customer">${escapeHtml(item.customer)}</span>
        <span class="reservation-detail">${escapeHtml(item.medicine)} • ${item.qty} units</span>
      </div>
      <div class="reservation-actions">
        <span class="pill pill-${item.status === 'collected' ? 'ok' : item.status === 'accepted' ? 'neutral' : 'warn'}">${escapeHtml(item.status.replace('_', ' '))}</span>
        <span class="reservation-detail">${escapeHtml(item.time)}</span>
      </div>
    </article>
  `).join('');
};

const renderTrendChart = (svg, data, color = '#0f766e') => {
  if (!svg || !data.length) return;
  const width = 600;
  const height = 220;
  const padding = 26;
  const maxVal = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => {
    const x = padding + (index * (width - padding * 2) / Math.max(data.length - 1, 1));
    const y = height - padding - ((item.value / maxVal) * (height - padding * 2));
    return `${x},${y}`;
  }).join(' ');

  svg.innerHTML = `
    <defs>
      <linearGradient id="trendGradient-${color.replace('#', '')}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.3" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0" />
      </linearGradient>
    </defs>
    <polygon points="${points} ${width - padding},${height - padding} ${padding},${height - padding}" fill="url(#trendGradient-${color.replace('#', '')})" />
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    ${data.map((item, index) => {
      const x = padding + (index * (width - padding * 2) / Math.max(data.length - 1, 1));
      const y = height - padding - ((item.value / maxVal) * (height - padding * 2));
      return `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="${color}" stroke-width="3"></circle>`;
    }).join('')}
  `;
};

const renderRxQueue = () => {
  const rxQueue = document.getElementById('rxQueue');
  if (!rxQueue) return;
  
  // Clean empty state ready for backend integration
  rxQueue.innerHTML = `
    <div class="empty-state" style="background: #fff; padding: 40px; border-radius: var(--radius-md); box-shadow: var(--shadow-card);">
      <p style="margin: 0; color: var(--slate);">No pending prescriptions to review.</p>
    </div>
  `;
};

const renderCollectionTable = () => {
  if (!dom.collectionTable) return;
  dom.collectionTable.innerHTML = `
    <thead>
      <tr><th>Reservation</th><th>Customer</th><th>Medicine</th><th>Qty</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${COLLECTION_DATA.map((item) => `
        <tr>
          <td>${escapeHtml(item.id)}</td>
          <td>${escapeHtml(item.customer)}</td>
          <td>${escapeHtml(item.medicine)}</td>
          <td>${item.qty}</td>
          <td><span class="pill pill-${item.status === 'collected' ? 'ok' : 'neutral'}">${escapeHtml(item.status)}</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
};

const renderMedInfoGrid = () => {
  if (!dom.medInfoGrid) return;
  dom.medInfoGrid.innerHTML = MED_INFO_DATA.map((item) => `
    <article class="med-info-card">
      <h3>${escapeHtml(item.name)}</h3>
      <div class="med-info-row"><span>Generic</span><span>${escapeHtml(item.generic)}</span></div>
      <div class="med-info-row"><span>Dosage</span><span>${escapeHtml(item.dosage)}</span></div>
      <div class="med-info-row"><span>Alternatives</span><span>${escapeHtml(item.alt)}</span></div>
    </article>
  `).join('');
};

const renderVerificationTable = () => {
  if (!dom.verificationTable) return;
  dom.verificationTable.innerHTML = `
    <thead>
      <tr><th>Pharmacy</th><th>Owner</th><th>License</th><th>Submitted</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${VERIFICATION_DATA.map((item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.owner)}</td>
          <td>${escapeHtml(item.license)}</td>
          <td>${escapeHtml(item.submitted)}</td>
          <td><span class="pill pill-${item.status === 'approved' ? 'ok' : 'warn'}">${escapeHtml(item.status)}</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
};

const renderAuditTable = () => {
  if (!dom.auditTable) return;
  dom.auditTable.innerHTML = `
    <thead>
      <tr><th>Time</th><th>Actor</th><th>Action</th><th>Level</th></tr>
    </thead>
    <tbody>
      ${AUDIT_DATA.map((item) => `
        <tr>
          <td>${escapeHtml(item.time)}</td>
          <td>${escapeHtml(item.actor)}</td>
          <td>${escapeHtml(item.action)}</td>
          <td><span class="pill pill-${escapeHtml(item.level)}">${escapeHtml(item.level)}</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
};

// ==========================================
// 12. LOAD CUSTOMER PURCHASE HISTORY
// ==========================================
async function loadCustomerHistory() {
  if (!dom.historyTableBody) return;
  
  try {
    const data = await apiFetch('/api/reservations');
    
    if (data.success && data.data) {
      dom.historyTableBody.innerHTML = '';
      if (data.data.length === 0) {
        dom.historyTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--slate);">No purchase history found.</td></tr>`;
        return;
      }

      data.data.forEach(order => {
        let statusColor = 'var(--slate)';
        if (order.status === 'ACCEPTED' || order.status === 'COMPLETED' || order.status === 'APPROVED') statusColor = '#10b981';
        if (order.status === 'REJECTED' || order.status === 'CANCELLED') statusColor = '#ef4444';

        const date = new Date(order.createdAt).toLocaleDateString();
        
        let itemsHtml = order.Items.map(item => {
          const name = item.Medicine?.brandName || (order.orderType === 'PRESCRIPTION_ONLY' ? 'Prescription Order' : 'Unknown');
          const price = item.MedicineBatch?.sellingPrice || 0;
          return `<div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
            <span>${name} (x${item.quantity})</span>
            <span>₹${(price * item.quantity).toFixed(2)}</span>
          </div>`;
        }).join('');
        
        const orderTotal = order.Items.reduce((sum, item) => sum + (item.quantity * (item.MedicineBatch?.sellingPrice || 0)), 0);
        itemsHtml += `<div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--line); font-weight: 600;">
            <span>Total</span>
            <span>₹${orderTotal.toFixed(2)}</span>
          </div>`;

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--line)';
        tr.innerHTML = `
          <td style="padding: 12px 16px; font-size: 0.9rem; font-weight: 500;">${order.reservationCode}</td>
          <td style="padding: 12px 16px; font-size: 0.9rem; color: var(--slate);">${date}</td>
          <td style="padding: 12px 16px; font-size: 0.9rem;">${order.pharmacyName}</td>
          <td style="padding: 12px 16px;">${itemsHtml}</td>
          <td style="padding: 12px 16px;">
            <span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
              ${order.status}
            </span>
          </td>
        `;
        dom.historyTableBody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Failed to load history', err);
    dom.historyTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #ef4444;">Failed to load purchase history.</td></tr>`;
  }
}

const setupEventListeners = () => {
  dom.navLinks.forEach((button) => {
    button.addEventListener('click', () => setActiveNav(button.dataset.view));
  });
  // 1. "View Cart" button inside the Reservation Success Modal
  if (dom.viewCartFromReserveBtn) {
    dom.viewCartFromReserveBtn.addEventListener('click', () => {
      closeReserveModal();
      openCartModal();
    });
  }

  // 2. "Reserve all" button inside the Cart Modal
  if (dom.reserveAllBtn) {
    dom.reserveAllBtn.addEventListener('click', () => {
      reserveAllCartItems();
    });
  }

  // 3. "Done" button on the Cart Success screen
  if (dom.cartDoneBtn) {
    dom.cartDoneBtn.addEventListener('click', () => {
      closeCartModal();
    });
  }
  // Add this inside setupEventListeners()
if (dom.cartBtn) {
    dom.cartBtn.addEventListener('click', openCartModal);
}

if (dom.closeCart) {
    dom.closeCart.addEventListener('click', closeCartModal);
}

  dom.searchTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const query = tag.dataset.q || '';
      if (dom.medSearchInput) dom.medSearchInput.value = query;
      state.currentSearchKey = query;
      void renderSearchResults();
    });
  });

 if (dom.medSearchBtn) {
    dom.medSearchBtn.addEventListener('click', () => {
      const nearbyPharmaciesBtn = document.getElementById('nearbyPharmaciesBtn');
if (nearbyPharmaciesBtn) {
  nearbyPharmaciesBtn.addEventListener('click', findNearbyPharmacies);
}
      const query = dom.medSearchInput.value.trim();
      if (!query) return;
      state.currentSearchKey = query;
      void renderSearchResults();
      persistPreferences();
    });
  }

  if (dom.medSearchInput) {
    dom.medSearchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        state.currentSearchKey = dom.medSearchInput.value.trim();
        void renderSearchResults();
        persistPreferences();
      }
    });
    dom.medSearchInput.addEventListener('input', () => {
      state.currentSearchKey = dom.medSearchInput.value;
      persistPreferences();
    });
  }

  if (dom.sortSelect) {
    dom.sortSelect.addEventListener('change', () => {
      void renderSearchResults();
      persistPreferences();
    });
  }

  if (dom.filterInStock) {
    dom.filterInStock.addEventListener('click', () => {
      state.showInStockOnly = !state.showInStockOnly;
      dom.filterInStock.classList.toggle('active', state.showInStockOnly);
      void renderSearchResults();
      persistPreferences();
    });
  }

 

  if (dom.closeReserve) dom.closeReserve.addEventListener('click', closeReserveModal);
  if (dom.reserveModal) {
    dom.reserveModal.addEventListener('click', (event) => {
      if (event.target === dom.reserveModal) closeReserveModal();
    });
  }
if (dom.qtyInput) {
  dom.qtyInput.addEventListener('change', () => {
    const max = state.currentMaxQty || DEFAULT_MAX_RESERVATION;
    const value = Math.max(1, Number(dom.qtyInput.value) || 1);
    if (value > max) {
      toastMessage(`Only ${max} unit(s) available.`);
    }
    dom.qtyInput.value = Math.min(value, max);
  });
}
  if (dom.qtyMinus && dom.qtyInput) {
    dom.qtyMinus.addEventListener('click', () => {
      const value = Number(dom.qtyInput.value) || 1;
      dom.qtyInput.value = Math.max(1, value - 1);
    });
  }
  if (dom.qtyPlus && dom.qtyInput) {
   dom.qtyPlus.addEventListener('click', () => {
    const value = Number(dom.qtyInput.value) || 1;
    const maxQty = state.currentMaxQty || DEFAULT_MAX_RESERVATION;
    dom.qtyInput.value = Math.min(maxQty, value + 1);
});
  }
if (dom.confirmReserveBtn) dom.confirmReserveBtn.addEventListener('click', () => { addToCart(); });
  if (dom.doneReserveBtn) dom.doneReserveBtn.addEventListener('click', closeReserveModal);

  if (dom.uploadRxBtn) {
    dom.uploadRxBtn.addEventListener('click', openPrescriptionOrderModal);
  }
  if (dom.closePrescriptionOrder) dom.closePrescriptionOrder.addEventListener('click', closePrescriptionOrderModal);
  if (dom.prescriptionOrderModal) {
    dom.prescriptionOrderModal.addEventListener('click', (event) => {
      if (event.target === dom.prescriptionOrderModal) closePrescriptionOrderModal();
    });
  }
  if (dom.submitPrescriptionOrderBtn) {
    dom.submitPrescriptionOrderBtn.addEventListener('click', () => { void submitPrescriptionOrder(); });
  }
  if (dom.donePrescriptionOrderBtn) {
    dom.donePrescriptionOrderBtn.addEventListener('click', closePrescriptionOrderModal);
  }
  if (dom.closeDraftReview) {
    dom.closeDraftReview.addEventListener('click', closeDraftReviewModal);
  }
  if (dom.draftReviewModal) {
    dom.draftReviewModal.addEventListener('click', (event) => {
      if (event.target === dom.draftReviewModal) closeDraftReviewModal();
    });
  }
  if (dom.acceptDraftBtn) {
    dom.acceptDraftBtn.addEventListener('click', () => { void acceptDraft(); });
  }
  if (dom.rejectDraftBtn) {
    dom.rejectDraftBtn.addEventListener('click', () => { void rejectDraft(); });
  }
  if (dom.prescriptionInput) {
    dom.prescriptionInput.addEventListener('change', (event) => {
      const [file] = event.target.files || [];
      if (file) {
        void uploadPrescriptionFile(file);
      }
      event.target.value = '';
    });
  }

  if (dom.assistantFab) dom.assistantFab.addEventListener('click', toggleAssistant);
  if (dom.assistantClose) dom.assistantClose.addEventListener('click', closeAssistant);
  if (dom.assistantForm) {
    dom.assistantForm.addEventListener('submit', (event) => {
      event.preventDefault();
      submitAssistantMessage(dom.assistantInput?.value || '');
      if (dom.assistantInput) dom.assistantInput.value = '';
    });
  }
  document.querySelectorAll('[data-assist]').forEach((chip) => {
    chip.addEventListener('click', () => {
      submitAssistantMessage(chip.dataset.assist || '');
      openAssistant();
    });
  });

  if (dom.authForm) dom.authForm.addEventListener('submit', saveProfile);
  if (dom.closeAuth) dom.closeAuth.addEventListener('click', closeAuthModal);
  if (dom.authSignOut) dom.authSignOut.addEventListener('click', signOut);
  if (dom.authModal) {
    dom.authModal.addEventListener('click', (event) => {
      if (event.target === dom.authModal) closeAuthModal();
    });
  }

  dom.pageLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const target = link.dataset.pageLink;
      if (!target) return;
      window.location.href = target;
    });
  });
};
const enforceRoleUI = () => {
  const userStr = localStorage.getItem('medifind-user');
  let role = 'GUEST';
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      role = user.role; 
    } catch (e) {}
  }

  try {
    // 1. Clean up the Navigation Bar Links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const target = link.getAttribute('href') || link.dataset.view || '';
      let isAllowed = false;

      // Lock down the search page to GUEST, Customers and Admins
      if (target.includes('index') || target === 'customer') {
        isAllowed = ['GUEST', 'CUSTOMER', 'PHARMACIST', 'OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
      }
      else if (target === 'history') {
        isAllowed = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
      }
      // Pharmacist Desk access
      else if (target.includes('pharmacist') && ['PHARMACIST', 'OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
        isAllowed = true;
      }
      // Pharmacy Dashboard access
      else if (target.includes('pharmacy') && ['OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
        isAllowed = true;
      }
      // Admin Console access
      else if (target.includes('admin') && ['ADMIN', 'SUPER_ADMIN'].includes(role)) {
        isAllowed = true;
      }

      if (!isAllowed) {
        link.style.display = 'none';
      }
    });

    // 2. Destroy the "Back to search" button for non-customers
    const backToSearchBtn = document.querySelector('a.nav-cta[href="index.html"]');
    if (backToSearchBtn && role !== 'CUSTOMER' && role !== 'ADMIN') {
      backToSearchBtn.style.display = 'none';
    }

  } catch (error) {
    console.error("Failed to parse user for UI segregation:", error);
  }
};

const setupLocationOverrides = () => {
  const setLocationBtn = document.getElementById('setLocationBtn');
  if (!setLocationBtn) return;

  const savedLoc = localStorage.getItem('medifind-loc');
  if (savedLoc) {
    try {
      const parsed = JSON.parse(savedLoc);
      const disp = document.getElementById('locationDisplay');
      if (disp) {
        disp.style.display = 'block';
        disp.innerHTML = `📍 Current Location: <strong>${escapeHtml(parsed.name)}</strong>`;
      }
    } catch(e) {}
  }

  setLocationBtn.addEventListener('click', async () => {
    const locInput = document.getElementById('locationInput');
    const loc = locInput.value.trim();
    if (!loc) return alert('Enter a city or area.');
    
    setLocationBtn.textContent = 'Searching...';
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const name = data[0].display_name.split(',')[0]; 
        localStorage.setItem('medifind-loc', JSON.stringify({lat, lng, name}));
        const disp = document.getElementById('locationDisplay');
        if (disp) {
          disp.style.display = 'block';
          disp.innerHTML = `📍 Current Location: <strong>${escapeHtml(name)}</strong>`;
        }
        locInput.value = ''; // clear input
        alert(`Location successfully set to ${name}`);
      } else {
        alert("Location not found. Please try a different search.");
      }
    } catch (err) {
      alert("Error fetching location.");
    }
    setLocationBtn.textContent = 'Set Location';
  });

  document.getElementById('autoLocationBtn')?.addEventListener('click', () => {
    localStorage.removeItem('medifind-loc');
    const disp = document.getElementById('locationDisplay');
    if (disp) disp.style.display = 'none';
    document.getElementById('locationInput').value = '';
    alert("Location reset. We will now auto-detect your location.");
  });
};
const init = () => {
  injectEnhancements();
  cacheEnhancementDom();
  loadProfile();
  loadPreferences();
  loadAssistantHistory();
  loadCart();
  updateCartBadge();
  renderTicker();
  renderLowStockTable();
  renderDemandList();
  renderInventoryTable();
  renderReservationList();
  renderTrendChart(dom.trendChart, DEMAND_DATA, '#0f766e');
  renderRxQueue();
  renderCollectionTable();
  renderMedInfoGrid();
  renderVerificationTable();
  renderAuditTable();
  renderTrendChart(dom.adminTrendChart, DEMAND_DATA, '#c77530');

  renderAssistantMessages();
  renderAuthState();
  enforceRoleUI();
  enforceRoleAccess();
  void renderAccountActivity();

  setupLocationOverrides();
  setupEventListeners();

  const activeView = document.body.dataset.view;
  if (activeView && dom.views.length) {
    setActiveNav(activeView);
  }

  const dashboardRoots = document.querySelectorAll('.dash-shell .dash-nav');
  dashboardRoots.forEach((root) => {
    const activePanel = root.querySelector('.dash-nav-item.active')?.dataset.panel || root.querySelector('.dash-nav-item')?.dataset.panel;
    setActiveDashboardPanel(root, activePanel);
  });

  if (dom.medSearchInput && dom.medSearchInput.value.trim()) {
    state.currentSearchKey = dom.medSearchInput.value.trim();
    void renderSearchResults();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.loadRestrictedMedicines = async function() {
  const tbody = document.getElementById('restrictedMedicinesTable');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading restricted medicines...</td></tr>';
  
  try {
    const payload = await apiFetch('/api/medicines/restricted');
    if (payload.success && payload.data) {
      if (payload.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No restricted medicines found.</td></tr>';
        return;
      }
      
      tbody.innerHTML = payload.data.map(med => `
        <tr>
          <td><strong>${med.brandName}</strong></td>
          <td>${med.genericName}</td>
          <td>${med.category || 'N/A'}</td>
          <td><span class="badge" style="background:var(--error);color:white;">Restricted</span></td>
          <td>
            <button class="btn btn-primary" onclick="toggleMedicineRestriction('${med.id}', false)" style="padding: 5px 10px; font-size: 0.8rem; background: var(--slate);">
              Remove Restriction
            </button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load restricted medicines', err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Error loading restricted medicines.</td></tr>';
  }
}

window.toggleMedicineRestriction = async (id, isRestricted) => {
  if (!confirm('Are you sure you want to change the restriction status of this medicine?')) return;
  try {
    const res = await apiFetch(`/api/medicines/${id}/restrict`, {
      method: 'PATCH',
      body: JSON.stringify({ isRestricted })
    });
    if (res.success) {
      toastMessage(isRestricted ? 'Medicine marked as restricted.' : 'Restriction removed.');
      if (typeof window.loadRestrictedMedicines === 'function') window.loadRestrictedMedicines();
      if (typeof window.loadNormalMedicines === 'function') window.loadNormalMedicines();
    } else {
      toastMessage('Failed to update status', true);
    }
  } catch (err) {
    console.error(err);
    toastMessage('An error occurred', true);
  }
};

window.loadNormalMedicines = async function() {
  const tbody = document.getElementById('normalMedicinesTable');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading normal medicines...</td></tr>';
  
  try {
    const payload = await apiFetch('/api/medicines/search?q=');
    if (payload.success && payload.data) {
      // Filter out restricted ones if search endpoint returns all
      const normalMeds = payload.data.filter(m => !m.isRestricted);
      if (normalMeds.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No normal medicines found.</td></tr>';
        return;
      }
      
      tbody.innerHTML = normalMeds.map(med => `
        <tr>
          <td><strong>${med.brandName}</strong></td>
          <td>${med.genericName}</td>
          <td>${med.category || 'N/A'}</td>
          <td><span class="badge" style="background:var(--ok);color:white;">Normal</span></td>
          <td>
            <button class="btn btn-primary" onclick="window.toggleMedicineRestriction('${med.id}', true)" style="padding: 5px 10px; font-size: 0.8rem;">Restrict</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error(error);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load normal medicines</td></tr>';
  }
};

window.submitComplaint = async function() {
  const reporterId = JSON.parse(localStorage.getItem('medifind-user'))?.id;
  const reportedEmail = document.getElementById('complaintUserEmail').value.trim();
  const issueType = document.getElementById('complaintReasonSelect').value;
  const customReason = document.getElementById('complaintReasonCustom').value.trim();
  
  if (!reportedEmail) {
    alert('Please enter the user email to report.');
    return;
  }
  
  const finalReason = issueType === 'OTHER' ? customReason : issueType;
  
  try {
    const res = await apiFetch('/api/admin/complaints', {
      method: 'POST',
      body: JSON.stringify({ reportedEmail, issueType: finalReason })
    });
    
    if (res.success) {
      alert('Report submitted successfully.');
      document.getElementById('complaintModal').style.display = 'none';
    } else {
      alert('Error: ' + res.error);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to submit report.');
  }
};

window.openComplaintModal = function() {
  const modal = document.getElementById('complaintModal');
  if (modal) modal.style.display = 'flex';
};

window.closeComplaintModal = function() {
  const modal = document.getElementById('complaintModal');
  if (modal) modal.style.display = 'none';
};

window.toggleComplaintCustomReason = function() {
  const select = document.getElementById('complaintReasonSelect');
  const customBox = document.getElementById('complaintOtherReasonBox');
  if (select.value === 'OTHER') {
    customBox.style.display = 'block';
  } else {
    customBox.style.display = 'none';
  }
};

/* Les Aliments Benito — front-end application */

const translations = {
  en: {
    navProducts: 'Products',
    navLocation: 'Location',
    navOrder: 'Place your order',
    navLogin: 'Login',
    navSignup: 'Create account',
    navAccount: 'My account',
    navHome: 'Home',
    heroEyebrow: 'Wholesale meat supplier',
    heroTitle: 'Fresh meat products for restaurants, markets, and food businesses.',
    heroText: 'Les Aliments Benito supplies reliable beef, chicken, pork, lamb, specialty products, and kitchen essentials for professional buyers.',
    heroOrder: 'Place your order',
    heroContact: 'Contact us',
    aboutEyebrow: 'Built for food service',
    aboutTitle: 'Dependable supply, clear ordering, and bilingual service.',
    aboutText: 'We help restaurants, caterers, grocery counters, and production kitchens order the products they need with less back-and-forth.',
    productsEyebrow: 'Product families',
    productsTitle: 'Meat, poultry, lamb, pork, specialty, and grocery items.',
    beefTitle: 'Beef',
    beefText: 'Quality cuts for shawarma, kitchens, and wholesale service.',
    chickenTitle: 'Chicken',
    chickenText: 'Breasts, wings, cubes, and fresh poultry formats.',
    porkTitle: 'Pork',
    porkText: 'Practical pork cuts for production and prepared menus.',
    lambTitle: 'Lamb',
    lambText: 'Premium lamb products for professional kitchens.',
    orderEyebrow: 'Fast order request',
    orderTitle: 'Build your order online and send it directly to our team.',
    orderButton: 'Open order page',
    locationEyebrow: 'Location',
    locationTitle: 'Serving professional food buyers in the Montreal area.',
    locationText: 'Phone: 514 723 2378. Add your delivery address when placing an order and our team will confirm the details.',
    contactEyebrow: 'Contact',
    contactTitle: 'Need a custom product or special quantity?',
    contactText: 'Send the details through the order form. You can include notes for cuts, packing, delivery, and substitutions.',
    footerAdmin: 'Admin',
    orderPageEyebrow: 'Order request',
    orderPageTitle: 'Place your order',
    orderPageText: 'Choose products, quantities, units, and notes. Your request will be saved and sent to the Benito team.',
    searchPlaceholder: 'Search products',
    allCategories: 'All categories',
    selectedTitle: 'Selected products',
    companyLabel: 'Company name',
    contactLabel: 'Contact name',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    deliveryDateLabel: 'Delivery date',
    addressLabel: 'Delivery address',
    messageLabel: 'Notes / Special instructions',
    sendOrder: 'Send order',
    addProduct: 'Add',
    quantity: 'Quantity',
    notes: 'Notes',
    emptySelection: 'No products selected yet.',
    orderMissing: 'Select at least one product.',
    companyMissing: 'Enter your company name.',
    emailMissing: 'Enter a valid email address.',
    productsLoadError: 'Products could not load. Refresh the page and try again.',
    sendingOrder: 'Sending order...',
    orderSuccess: 'Order sent. Your order number is',
    orderSaved: 'Order received. Your order number is',
    orderError: 'We could not send the order. Please try again.',
    loginEyebrow: 'Account access',
    loginTitle: 'Login',
    passwordLabel: 'Password',
    loginButton: 'Login',
    loginError: 'Invalid email or password.',
    loginSignupText: 'Need an account?',
    loginSignupLink: 'Create one',
    signupEyebrow: 'Customer account',
    signupTitle: 'Create account',
    signupButton: 'Create account',
    signupError: 'We could not create the account. Please check the information.',
    accountEyebrow: 'Customer account',
    accountTitle: 'My order history',
    accountLoadError: 'Please login to view your orders.',
    logoutButton: 'Logout',
    adminEyebrow: 'Order dashboard',
    adminTitle: 'Orders received',
    noOrders: 'No orders have been received yet.',
    adminLoadError: 'Please login as admin to view orders.'
  },
  fr: {
    navProducts: 'Produits',
    navLocation: 'Emplacement',
    navOrder: 'Passer une commande',
    navLogin: 'Connexion',
    navSignup: 'Creer un compte',
    navAccount: 'Mon compte',
    navHome: 'Accueil',
    heroEyebrow: 'Fournisseur de viande en gros',
    heroTitle: 'Produits de viande frais pour restaurants, marches et entreprises alimentaires.',
    heroText: "Les Aliments Benito fournit du boeuf, du poulet, du porc, de l'agneau, des specialites et des essentiels de cuisine pour acheteurs professionnels.",
    heroOrder: 'Passer une commande',
    heroContact: 'Nous contacter',
    aboutEyebrow: 'Concu pour la restauration',
    aboutTitle: 'Approvisionnement fiable, commande claire et service bilingue.',
    aboutText: "Nous aidons restaurants, traiteurs, comptoirs alimentaires et cuisines de production a commander plus facilement les produits necessaires.",
    productsEyebrow: 'Familles de produits',
    productsTitle: "Viande, volaille, agneau, porc, specialites et produits d'epicerie.",
    beefTitle: 'Boeuf',
    beefText: 'Coupes de qualite pour shawarma, cuisines et service en gros.',
    chickenTitle: 'Poulet',
    chickenText: 'Poitrines, ailes, cubes et formats de volaille fraiche.',
    porkTitle: 'Porc',
    porkText: 'Coupes pratiques pour production et menus prepares.',
    lambTitle: 'Agneau',
    lambText: "Produits d'agneau de qualite pour cuisines professionnelles.",
    orderEyebrow: 'Demande rapide',
    orderTitle: 'Preparez votre commande en ligne et envoyez-la directement a notre equipe.',
    orderButton: 'Ouvrir la commande',
    locationEyebrow: 'Emplacement',
    locationTitle: 'Au service des acheteurs alimentaires professionnels de la region de Montreal.',
    locationText: 'Telephone : 514 723 2378. Ajoutez votre adresse de livraison lors de la commande et notre equipe confirmera les details.',
    contactEyebrow: 'Contact',
    contactTitle: "Besoin d'un produit personnalise ou d'une quantite speciale?",
    contactText: "Envoyez les details dans le formulaire de commande. Vous pouvez ajouter des notes pour les coupes, l'emballage, la livraison et les substitutions.",
    footerAdmin: 'Admin',
    orderPageEyebrow: 'Demande de commande',
    orderPageTitle: 'Passer une commande',
    orderPageText: "Choisissez les produits, quantites, unites et notes. Votre demande sera sauvegardee et envoyee a l'equipe Benito.",
    searchPlaceholder: 'Rechercher des produits',
    allCategories: 'Toutes les categories',
    selectedTitle: 'Produits selectionnes',
    companyLabel: "Nom de l'entreprise",
    contactLabel: 'Nom du contact',
    emailLabel: 'Courriel',
    phoneLabel: 'Telephone',
    deliveryDateLabel: 'Date de livraison',
    addressLabel: 'Adresse de livraison',
    messageLabel: 'Notes / Instructions speciales',
    sendOrder: 'Envoyer la commande',
    addProduct: 'Ajouter',
    quantity: 'Quantite',
    notes: 'Notes',
    emptySelection: 'Aucun produit selectionne.',
    orderMissing: 'Selectionnez au moins un produit.',
    companyMissing: "Entrez le nom de votre entreprise.",
    emailMissing: 'Entrez une adresse courriel valide.',
    productsLoadError: 'Impossible de charger les produits. Actualisez la page et reessayez.',
    sendingOrder: 'Envoi de la commande...',
    orderSuccess: 'Commande envoyee. Votre numero de commande est',
    orderSaved: 'Commande recue. Votre numero de commande est',
    orderError: "Impossible d'envoyer la commande. Veuillez reessayer.",
    loginEyebrow: 'Acces au compte',
    loginTitle: 'Connexion',
    passwordLabel: 'Mot de passe',
    loginButton: 'Connexion',
    loginError: 'Courriel ou mot de passe invalide.',
    loginSignupText: "Besoin d'un compte?",
    loginSignupLink: 'Creer un compte',
    signupEyebrow: 'Compte client',
    signupTitle: 'Creer un compte',
    signupButton: 'Creer le compte',
    signupError: 'Impossible de creer le compte. Verifiez les informations.',
    accountEyebrow: 'Compte client',
    accountTitle: 'Historique de mes commandes',
    accountLoadError: 'Connectez-vous pour voir vos commandes.',
    logoutButton: 'Deconnexion',
    adminEyebrow: 'Tableau des commandes',
    adminTitle: 'Commandes recues',
    noOrders: 'Aucune commande recue pour le moment.',
    adminLoadError: 'Connectez-vous comme admin pour voir les commandes.'
  }
};

const STATUS_LABELS = {
  new: 'New',
  processing: 'Processing',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

let language = localStorage.getItem('benitoLanguage') || 'en';
let products = [];
let selectedItems = [];

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage();
  bindLanguageToggle();
  applySettingsLogo(); // update header logo from settings (non-blocking)

  const page = document.body.dataset.page;
  if (page === 'order') initOrderPage();
  else if (page === 'login') initLoginPage();
  else if (page === 'signup') initSignupPage();
  else if (page === 'account') initAccountPage();
  else if (page === 'admin') initAdminPage();
  else updateNavForSession();
});

// ── Logo from settings ────────────────────────────────────────────────────────

async function applySettingsLogo() {
  try {
    const s = await fetch('/api/settings').then((r) => r.json());
    if (!s) return;
    if (s.logoPath) updateHeaderLogo(s.logoPath);
    document.querySelectorAll('[data-setting]').forEach((el) => {
      const val = s[el.dataset.setting];
      if (val) el.textContent = val;
    });
  } catch (_) {}
}

function updateHeaderLogo(logoPath) {
  document.querySelectorAll('header img[alt*="logo"]').forEach((img) => {
    img.src = logoPath;
  });
}

// ── i18n ──────────────────────────────────────────────────────────────────────

function t(key) {
  return translations[language][key] || translations.en[key] || key;
}

function bindLanguageToggle() {
  document.querySelectorAll('[data-language-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      language = language === 'en' ? 'fr' : 'en';
      localStorage.setItem('benitoLanguage', language);
      applyLanguage();
      renderProducts();
      renderSelectedItems();
      if (window.currentOrders) renderOrdersTable(window.currentOrders);
      if (window.currentAccountOrders) renderAccountOrders(window.currentAccountOrders);
    });
  });
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-language-toggle]').forEach((button) => {
    button.textContent = language === 'en' ? 'FR' : 'EN';
  });
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
}

// ── Dynamic nav ───────────────────────────────────────────────────────────────

async function updateNavForSession() {
  try {
    const { authenticated, user } = await fetch('/api/session').then((r) => r.json());
    document.querySelectorAll('[data-auth="guest"]').forEach((el) => {
      el.style.display = authenticated ? 'none' : '';
    });
    document.querySelectorAll('[data-auth="auth"]').forEach((el) => {
      el.style.display = authenticated ? '' : 'none';
    });
    document.querySelectorAll('[data-auth="customer"]').forEach((el) => {
      el.style.display = (authenticated && user && user.role === 'customer') ? '' : 'none';
    });
    document.querySelectorAll('[data-auth="admin"]').forEach((el) => {
      el.style.display = (authenticated && user && user.role === 'admin') ? '' : 'none';
    });

    if (authenticated) {
      document.querySelectorAll('[data-auth="auth"]').forEach((btn) => {
        if (btn.tagName === 'BUTTON') {
          btn.addEventListener('click', async () => {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
          });
        }
      });
    }
  } catch (_) { /* session check failed — leave nav as-is */ }
}

// ── Badge helper ──────────────────────────────────────────────────────────────

function statusBadge(status) {
  const label = STATUS_LABELS[status] || status;
  return `<span class="badge badge-${status}">${label}</span>`;
}

// ── Order page ─────────────────────────────────────────────────────────────────

async function initOrderPage() {
  const form = document.getElementById('orderForm');
  form.addEventListener('submit', submitOrder);
  await updateNavForSession();
  await prefillOrderForm();

  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Products failed to load');
    const data = await response.json();
    products = data.products;
    setupCategoryFilter();
    applyCategoryFromUrl();
    renderProducts();
    renderSelectedItems();
    document.getElementById('productSearch').addEventListener('input', renderProducts);
    document.getElementById('categoryFilter').addEventListener('change', renderProducts);
  } catch (_) {
    const status = document.getElementById('orderStatus');
    status.classList.add('error');
    status.textContent = t('productsLoadError');
  }
}

async function prefillOrderForm() {
  try {
    const session = await fetch('/api/session').then((r) => r.json());
    if (!session.authenticated || !session.user) return;
    const form = document.getElementById('orderForm');
    if (!form) return;
    form.company.value = session.user.company || '';
    form.contact.value = session.user.name || '';
    form.email.value = session.user.email || '';
    form.phone.value = session.user.phone || '';
    form.deliveryAddress.value = session.user.deliveryAddress || '';
  } catch (_) { /* prefill is optional */ }
}

function setupCategoryFilter() {
  const filter = document.getElementById('categoryFilter');
  const categories = [...new Set(products.map((p) => p.category))];
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    filter.appendChild(option);
  });
}

function applyCategoryFromUrl() {
  const filter = document.getElementById('categoryFilter');
  const requestedCategory = new URLSearchParams(window.location.search).get('category');
  if (!filter || !requestedCategory) return;

  const matchingOption = [...filter.options].find((option) => (
    option.value.toLowerCase() === requestedCategory.toLowerCase()
  ));
  if (matchingOption) filter.value = matchingOption.value;
}

function renderProducts() {
  const catalog = document.getElementById('productCatalog');
  if (!catalog) return;

  const query = document.getElementById('productSearch').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const visible = products.filter((p) => {
    const name = `${p.name} ${p.nameFr}`.toLowerCase();
    return name.includes(query) && (category === 'all' || p.category === category);
  });

  catalog.innerHTML = visible.map((p) => `
    <article class="catalog-card">
      <img src="${p.image || '/image/beni.png'}" alt="${language === 'fr' ? p.nameFr : p.name}" />
      <div class="catalog-card-body">
        <h3>${language === 'fr' ? (p.nameFr || p.name) : p.name}</h3>
        <p>${language === 'fr' ? (p.descriptionFr || p.description) : p.description}</p>
        <div class="catalog-controls">
          <input id="qty-${p.id}" type="number" min="0.01" step="0.01" placeholder="${t('quantity')}" />
          <select id="unit-${p.id}">
            <option value="kg">kg</option>
            <option value="lb">lb</option>
            <option value="box">box</option>
            <option value="case">case</option>
          </select>
          <textarea id="notes-${p.id}" rows="2" placeholder="${t('notes')}"></textarea>
          <button class="button primary full" type="button" data-add-product="${p.id}">${t('addProduct')}</button>
        </div>
      </div>
    </article>
  `).join('');

  catalog.querySelectorAll('[data-add-product]').forEach((button) => {
    button.addEventListener('click', () => addProduct(button.dataset.addProduct));
  });
}

function addProduct(productId) {
  const product = products.find((p) => p.id === productId);
  const quantity = Number(document.getElementById(`qty-${productId}`).value);
  const unit = document.getElementById(`unit-${productId}`).value;
  const notes = document.getElementById(`notes-${productId}`).value.trim();

  if (!product || quantity <= 0) return;

  selectedItems.push({ productId: product.id, sku: product.sku || '', name: product.name, nameFr: product.nameFr, quantity, unit, notes });
  document.getElementById(`qty-${productId}`).value = '';
  document.getElementById(`notes-${productId}`).value = '';
  renderSelectedItems();
}

function renderSelectedItems() {
  const list = document.getElementById('selectedItems');
  if (!list) return;

  if (!selectedItems.length) {
    list.innerHTML = `<p>${t('emptySelection')}</p>`;
    return;
  }

  list.innerHTML = selectedItems.map((item, index) => `
    <div class="selected-item">
      <div>
        <strong>${language === 'fr' ? (item.nameFr || item.name) : item.name}</strong>
        <p>${item.quantity} ${item.unit}${item.notes ? ` - ${item.notes}` : ''}</p>
      </div>
      <button class="icon-button" type="button" aria-label="Remove" data-remove-item="${index}">x</button>
    </div>
  `).join('');

  list.querySelectorAll('[data-remove-item]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedItems.splice(Number(button.dataset.removeItem), 1);
      renderSelectedItems();
    });
  });
}

async function submitOrder(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById('orderStatus');
  const submitButton = form.querySelector('[type="submit"]');
  status.classList.remove('error');

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!String(payload.company || '').trim()) { status.classList.add('error'); status.textContent = t('companyMissing'); return; }
  if (!emailPattern.test(String(payload.email || '').trim())) { status.classList.add('error'); status.textContent = t('emailMissing'); return; }
  if (!selectedItems.length) { status.classList.add('error'); status.textContent = t('orderMissing'); return; }

  payload.items = selectedItems;

  try {
    submitButton.disabled = true;
    status.textContent = t('sendingOrder');
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const resultText = await response.text();
    let result = {};
    try { result = resultText ? JSON.parse(resultText) : {}; } catch (_) { console.error('Order response was not JSON:', resultText); }

    if (!response.ok) throw new Error(result.message || resultText || response.statusText);
    if (result.success === false) throw new Error(result.message || 'Order failed');

    selectedItems = [];
    form.reset();
    renderSelectedItems();
    status.textContent = `${t('orderSaved')} ${result.orderNumber || ''}.`;
  } catch (error) {
    console.error('Order submit failed:', error);
    status.classList.add('error');
    status.textContent = t('orderError');
  } finally {
    submitButton.disabled = false;
  }
}

// ── Login page ────────────────────────────────────────────────────────────────

function initLoginPage() {
  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = document.getElementById('loginStatus');
    status.classList.remove('error');
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      status.classList.add('error');
      status.textContent = result.message || t('loginError');
      return;
    }

    window.location.href = result.user && result.user.role === 'admin' ? '/admin' : '/account';
  });
}

// ── Signup page ───────────────────────────────────────────────────────────────

function initSignupPage() {
  document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = document.getElementById('signupStatus');
    status.classList.remove('error');
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      window.location.href = '/account';
    } catch (error) {
      status.classList.add('error');
      status.textContent = error.message || t('signupError');
    }
  });
}

// ── Account page ──────────────────────────────────────────────────────────────

async function initAccountPage() {
  const session = await fetch('/api/session').then((r) => r.json());
  if (!session.authenticated) { window.location.href = '/login'; return; }
  if (session.user.role === 'admin') { window.location.href = '/admin'; return; }

  const user = session.user;

  document.getElementById('logoutButton').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  });

  renderProfileFields(user);
  bindProfileEdit(user);

  try {
    const response = await fetch('/api/my-orders');
    if (!response.ok) throw new Error('Login required');
    const data = await response.json();
    window.currentAccountOrders = data.orders;
    renderAccountOrders(data.orders);
  } catch (_) {
    document.getElementById('accountOrdersList').innerHTML =
      `<p class="form-status error">${t('accountLoadError')}</p>`;
  }
}

function renderProfileFields(user) {
  setText('profileName', user.name || user.company || user.email);
  setText('profileCompany', user.company || '—');
  setText('profileEmail', user.email);
  setText('profilePhone', user.phone || '—');
  setText('profileAddress', user.deliveryAddress || '—');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function bindProfileEdit(initialUser) {
  let currentUser = { ...initialUser };

  const editBtn = document.getElementById('editProfileBtn');
  const form = document.getElementById('profileEditForm');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const status = document.getElementById('profileEditStatus');

  editBtn.addEventListener('click', () => {
    document.getElementById('editName').value = currentUser.name || '';
    document.getElementById('editCompany').value = currentUser.company || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editAddress').value = currentUser.deliveryAddress || '';
    form.style.display = 'grid';
    editBtn.style.display = 'none';
    status.textContent = '';
    status.classList.remove('error');
  });

  cancelBtn.addEventListener('click', () => {
    form.style.display = 'none';
    editBtn.style.display = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.classList.remove('error');
    status.textContent = 'Saving...';

    const payload = {
      name: document.getElementById('editName').value.trim(),
      company: document.getElementById('editCompany').value.trim(),
      phone: document.getElementById('editPhone').value.trim(),
      deliveryAddress: document.getElementById('editAddress').value.trim()
    };

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Save failed');

      currentUser = result.user;
      renderProfileFields(result.user);
      form.style.display = 'none';
      editBtn.style.display = '';
      status.textContent = '';
    } catch (error) {
      status.classList.add('error');
      status.textContent = error.message || 'Could not save changes.';
    }
  });
}

function renderAccountOrders(orders) {
  const list = document.getElementById('accountOrdersList');
  if (!list) return;

  if (!orders.length) {
    list.innerHTML = `<p>${t('noOrders')}</p>`;
    return;
  }

  list.innerHTML = orders.map((order) => `
    <article class="order-card">
      <div class="order-card-header">
        <div>
          <h3 style="margin:0 0 4px">${order.orderNumber}</h3>
          <span style="color:var(--muted);font-size:13px">${new Date(order.createdAt).toLocaleString()}</span>
        </div>
        ${statusBadge(order.status)}
      </div>

      <ul class="order-items-list" style="margin:14px 0">
        ${order.items.map((item) => `
          <li>
            <span>${language === 'fr' ? (item.nameFr || item.name) : item.name}${item.notes ? ` <em style="color:var(--muted);font-size:12px">(${item.notes})</em>` : ''}</span>
            <span class="item-qty">${item.quantity} ${item.unit}</span>
          </li>
        `).join('')}
      </ul>

      <dl class="order-card-meta">
        ${order.customer.deliveryAddress ? `<dt>Delivery address</dt><dd>${order.customer.deliveryAddress}</dd>` : ''}
        ${order.customer.phone ? `<dt>Phone</dt><dd>${order.customer.phone}</dd>` : ''}
        ${order.customer.message ? `<dt>Note</dt><dd>${order.customer.message}</dd>` : ''}
      </dl>
    </article>
  `).join('');
}

// ── Admin page ────────────────────────────────────────────────────────────────

async function initAdminPage() {
  const session = await fetch('/api/session').then((r) => r.json());
  if (!session.authenticated || session.user.role !== 'admin') {
    window.location.href = '/login';
    return;
  }

  document.getElementById('logoutButton').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  });

  bindAdminTabs();
  await loadAdminDashboard();
}

function bindAdminTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((btn) => {
    btn.addEventListener('click', async () => {
      tabs.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`tab-${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');

      switch (btn.dataset.tab) {
        case 'dashboard': await loadAdminDashboard(); break;
        case 'orders': await loadAdminOrders(); break;
        case 'products': await loadAdminProducts(); break;
        case 'customers': await loadAdminCustomers(); break;
        case 'settings': await loadAdminSettings(); break;
      }
    });
  });
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────

async function loadAdminDashboard() {
  try {
    const stats = await fetch('/api/admin/stats').then((r) => r.json());

    setText('statTotal', stats.totalOrders);
    setText('statNew', stats.ordersByStatus && stats.ordersByStatus.new || 0);
    setText('statMonth', stats.ordersThisMonth);
    setText('statWeek', stats.ordersThisWeek);
    setText('statCustomers', stats.totalCustomers);

    const recentEl = document.getElementById('dashRecentOrders');
    if (recentEl) {
      if (!stats.recentOrders || !stats.recentOrders.length) {
        recentEl.innerHTML = '<p style="color:var(--muted);font-size:14px">No orders yet.</p>';
      } else {
        recentEl.innerHTML = stats.recentOrders.map((o) => `
          <div class="recent-order-row">
            <span class="order-num">${o.orderNumber}</span>
            <span class="order-company">${o.customer && o.customer.company || '—'}</span>
            <span class="order-date">${new Date(o.createdAt).toLocaleDateString()}</span>
            ${statusBadge(o.status)}
          </div>
        `).join('');
      }
    }

    const topEl = document.getElementById('dashTopProducts');
    if (topEl) {
      if (!stats.topProducts || !stats.topProducts.length) {
        topEl.innerHTML = '<li style="color:var(--muted);font-size:14px;padding:10px 0">No data yet.</li>';
      } else {
        topEl.innerHTML = stats.topProducts.map((p) => `
          <li>
            <span>${p.name || p.productId}</span>
            <span class="qty-badge">${p.totalQty}</span>
          </li>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Dashboard stats failed:', error);
  }
}

// ── Admin Orders ──────────────────────────────────────────────────────────────

async function loadAdminOrders(status = '', search = '') {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);

  try {
    const response = await fetch(`/api/orders?${params}`);
    if (!response.ok) throw new Error('Auth required');
    const data = await response.json();
    window.currentOrders = data.orders;
    renderOrdersTable(data.orders);
  } catch (error) {
    const tbody = document.getElementById('ordersTableBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="form-status error">${t('adminLoadError')}</td></tr>`;
  }

  const filterBtn = document.getElementById('orderFilterBtn');
  const searchInput = document.getElementById('orderSearch');
  const statusSelect = document.getElementById('orderStatusFilter');

  if (filterBtn && !filterBtn.dataset.bound) {
    filterBtn.dataset.bound = '1';
    filterBtn.addEventListener('click', () => loadAdminOrders(statusSelect.value, searchInput.value.trim()));
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') filterBtn.click(); });
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('ordersTableBody');
  const empty = document.getElementById('ordersTableEmpty');
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  tbody.innerHTML = orders.map((order) => {
    const itemSummary = (order.items || []).slice(0, 2)
      .map((i) => `${i.quantity} ${i.unit} ${i.name}`).join(', ');
    const more = order.items.length > 2 ? ` +${order.items.length - 2} more` : '';

    return `
      <tr>
        <td><strong style="color:var(--red)">${order.orderNumber}</strong></td>
        <td style="white-space:nowrap">${new Date(order.createdAt).toLocaleDateString()}</td>
        <td><strong>${order.customer && order.customer.company || '—'}</strong></td>
        <td style="color:var(--muted)">${order.customer && order.customer.email || '—'}</td>
        <td class="order-items-preview">${itemSummary}${more}</td>
        <td>${statusBadge(order.status)}</td>
        <td>
          <select class="status-select" data-order-id="${order.id}" data-current="${order.status}">
            <option value="new" ${order.status === 'new' ? 'selected' : ''}>New</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
      <tr class="order-detail-row">
        <td colspan="7">
          <div class="order-detail-inner" style="display:none" id="detail-${order.id}">
            <div>
              <dl>
                <dt>Contact</dt><dd>${order.customer && order.customer.contact || '—'}</dd>
                <dt>Phone</dt><dd>${order.customer && order.customer.phone || '—'}</dd>
                <dt>Delivery date</dt><dd>${order.customer && order.customer.deliveryDate || '—'}</dd>
                <dt>Address</dt><dd>${order.customer && order.customer.deliveryAddress || '—'}</dd>
                <dt>Notes</dt><dd>${order.customer && order.customer.message || '—'}</dd>
              </dl>
            </div>
            <div>
              <strong>Items</strong>
              <ul style="list-style:none;padding:0;margin:8px 0 0">
                ${(order.items || []).map((i) => `<li style="padding:4px 0;font-size:13px">${i.name}: <strong>${i.quantity} ${i.unit}</strong>${i.notes ? ` (${i.notes})` : ''}</li>`).join('')}
              </ul>
            </div>
          </div>
          <button class="detail-toggle" style="padding:6px 14px;display:block" data-detail="${order.id}">Show details ▾</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.status-select').forEach((sel) => {
    sel.addEventListener('change', async () => {
      const { orderId } = sel.dataset;
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: sel.value })
      });
      if (!response.ok) {
        alert('Could not update status. Please try again.');
        sel.value = sel.dataset.current;
      } else {
        sel.dataset.current = sel.value;
        const badgeCell = sel.closest('tr').querySelector('.badge');
        if (badgeCell) badgeCell.outerHTML = statusBadge(sel.value);
      }
    });
  });

  tbody.querySelectorAll('[data-detail]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const detail = document.getElementById(`detail-${btn.dataset.detail}`);
      if (!detail) return;
      const open = detail.style.display !== 'none';
      detail.style.display = open ? 'none' : 'grid';
      btn.textContent = open ? 'Show details ▾' : 'Hide details ▴';
    });
  });
}

// ── Admin Products ────────────────────────────────────────────────────────────

let adminProducts = [];
let editingProductId = null;

async function loadAdminProducts() {
  try {
    const data = await fetch('/api/admin/products').then((r) => r.json());
    adminProducts = data.products || [];
    renderAdminProducts();
    bindProductModal();
  } catch (error) {
    const grid = document.getElementById('productsAdminGrid');
    if (grid) grid.innerHTML = '<p class="form-status error">Could not load products.</p>';
  }
}

function renderAdminProducts() {
  const grid = document.getElementById('productsAdminGrid');
  if (!grid) return;

  if (!adminProducts.length) {
    grid.innerHTML = '<p style="color:var(--muted)">No products yet. Click "Add Product" to get started.</p>';
    return;
  }

  grid.innerHTML = adminProducts.map((p) => `
    <div class="product-admin-card ${p.active ? '' : 'inactive'}" data-product-id="${p.id}">
      <div class="product-admin-img">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" />` : '<span>No image</span>'}
      </div>
      <div class="product-admin-body">
        <h3>${p.name}</h3>
        <p class="product-cat">${p.category}${p.sku ? ` · ${p.sku}` : ''}${!p.active ? ' · INACTIVE' : ''}</p>
        <p style="font-size:13px;color:var(--muted);margin:0 0 4px">${p.nameFr || ''}</p>
        <div class="product-admin-actions">
          <button class="btn-sm primary" data-edit-product="${p.id}">Edit</button>
          <label class="btn-sm" style="cursor:pointer">
            Upload image
            <input type="file" accept="image/*" style="display:none" data-upload-image="${p.id}" />
          </label>
          ${p.active
            ? `<button class="btn-sm danger" data-deactivate="${p.id}">Deactivate</button>`
            : `<button class="btn-sm" data-activate="${p.id}">Activate</button>`}
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-edit-product]').forEach((btn) => {
    btn.addEventListener('click', () => openProductModal(btn.dataset.editProduct));
  });

  grid.querySelectorAll('[data-deactivate]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Deactivate this product? It will no longer appear in the order form.')) return;
      await fetch(`/api/products/${btn.dataset.deactivate}`, { method: 'DELETE' });
      await loadAdminProducts();
    });
  });

  grid.querySelectorAll('[data-activate]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await fetch(`/api/products/${btn.dataset.activate}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true })
      });
      await loadAdminProducts();
    });
  });

  grid.querySelectorAll('[data-upload-image]').forEach((input) => {
    input.addEventListener('change', async () => {
      if (!input.files[0]) return;
      const productId = input.dataset.uploadImage;
      const formData = new FormData();
      formData.append('image', input.files[0]);
      const response = await fetch(`/api/products/${productId}/image`, { method: 'POST', body: formData });
      if (response.ok) {
        await loadAdminProducts();
      } else {
        alert('Image upload failed.');
      }
    });
  });
}

function bindProductModal() {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  const cancelBtn = document.getElementById('productModalCancel');
  const addBtn = document.getElementById('addProductBtn');
  const imageInput = document.getElementById('pImageFile');
  const imagePreview = document.getElementById('pImagePreview');

  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = '1';
    addBtn.addEventListener('click', () => openProductModal(null));
  }

  if (cancelBtn && !cancelBtn.dataset.bound) {
    cancelBtn.dataset.bound = '1';
    cancelBtn.addEventListener('click', () => closeProductModal());
  }

  if (modal && !modal.dataset.bound) {
    modal.dataset.bound = '1';
    modal.addEventListener('click', (e) => { if (e.target === modal) closeProductModal(); });
  }

  if (imageInput && !imageInput.dataset.bound) {
    imageInput.dataset.bound = '1';
    imageInput.addEventListener('change', () => {
      if (imageInput.files[0]) {
        imagePreview.src = URL.createObjectURL(imageInput.files[0]);
        imagePreview.style.display = 'block';
      }
    });
  }

  if (form && !form.dataset.bound) {
    form.dataset.bound = '1';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('productModalSave');
      saveBtn.disabled = true;

      const payload = {
        name: document.getElementById('pName').value.trim(),
        nameFr: document.getElementById('pNameFr').value.trim(),
        category: document.getElementById('pCategory').value,
        sku: document.getElementById('pSku').value.trim(),
        description: document.getElementById('pDesc').value.trim(),
        descriptionFr: document.getElementById('pDescFr').value.trim()
      };

      if (!payload.name) { alert('Product name is required.'); saveBtn.disabled = false; return; }

      const isEdit = Boolean(editingProductId);
      const url = isEdit ? `/api/products/${editingProductId}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Save failed');

        const productId = result.product.id;

        if (imageInput.files[0]) {
          const formData = new FormData();
          formData.append('image', imageInput.files[0]);
          await fetch(`/api/products/${productId}/image`, { method: 'POST', body: formData });
        }

        closeProductModal();
        await loadAdminProducts();
      } catch (error) {
        alert(error.message || 'Could not save product.');
      } finally {
        saveBtn.disabled = false;
      }
    });
  }
}

function openProductModal(productId) {
  editingProductId = productId;
  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  const imagePreview = document.getElementById('pImagePreview');
  const imageInput = document.getElementById('pImageFile');

  document.getElementById('productId').value = productId || '';
  imagePreview.style.display = 'none';
  imagePreview.src = '';
  if (imageInput) imageInput.value = '';

  if (productId) {
    const p = adminProducts.find((x) => x.id === productId);
    if (p) {
      title.textContent = 'Edit Product';
      document.getElementById('pName').value = p.name || '';
      document.getElementById('pNameFr').value = p.nameFr || '';
      document.getElementById('pCategory').value = p.category || 'Other';
      document.getElementById('pSku').value = p.sku || '';
      document.getElementById('pDesc').value = p.description || '';
      document.getElementById('pDescFr').value = p.descriptionFr || '';
      if (p.image) { imagePreview.src = p.image; imagePreview.style.display = 'block'; }
    }
  } else {
    title.textContent = 'Add Product';
    document.getElementById('pName').value = '';
    document.getElementById('pNameFr').value = '';
    document.getElementById('pCategory').value = 'Beef';
    document.getElementById('pSku').value = '';
    document.getElementById('pDesc').value = '';
    document.getElementById('pDescFr').value = '';
  }

  modal.classList.remove('hidden');
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.add('hidden');
  editingProductId = null;
}

// ── Admin Customers ───────────────────────────────────────────────────────────

// ── Admin Settings ────────────────────────────────────────────────────────────

let settingsLoaded = false;

async function loadAdminSettings() {
  if (settingsLoaded) return;
  try {
    const s = await fetch('/api/settings').then((r) => r.json());
    setVal('sCompanyName',     s.companyName     || '');
    setVal('sCompanySubtitle', s.companySubtitle || '');
    setVal('sCompanyAddress',  s.companyAddress  || '');
    setVal('sCompanyPhone',    s.companyPhone    || '');
    setVal('sCompanyFax',      s.companyFax      || '');
    const logoEl = document.getElementById('currentLogo');
    if (logoEl && s.logoPath) logoEl.src = s.logoPath;
    settingsLoaded = true;
    bindSettingsForms();
  } catch (error) {
    console.error('Settings load failed:', error);
  }
}

function bindSettingsForms() {
  const form = document.getElementById('settingsForm');
  const statusEl = document.getElementById('settingsStatus');
  if (form && !form._bound) {
    form._bound = true;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusEl.textContent = 'Saving…';
      try {
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName:     getVal('sCompanyName'),
            companySubtitle: getVal('sCompanySubtitle'),
            companyAddress:  getVal('sCompanyAddress'),
            companyPhone:    getVal('sCompanyPhone'),
            companyFax:      getVal('sCompanyFax')
          })
        });
        const data = await res.json();
        statusEl.textContent = data.success ? 'Saved.' : (data.message || 'Save failed.');
        statusEl.className = 'form-status' + (data.success ? '' : ' error');
      } catch (_) {
        statusEl.textContent = 'Save failed.';
        statusEl.className = 'form-status error';
      }
    });
  }

  const logoForm = document.getElementById('logoForm');
  const logoStatus = document.getElementById('logoStatus');
  if (logoForm && !logoForm._bound) {
    logoForm._bound = true;
    logoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = document.getElementById('logoFile').files[0];
      if (!file) { logoStatus.textContent = 'Choose a file first.'; return; }
      logoStatus.textContent = 'Uploading…';
      const fd = new FormData();
      fd.append('logo', file);
      try {
        const res = await fetch('/api/admin/logo', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          logoStatus.textContent = 'Logo updated.';
          logoStatus.className = 'form-status';
          const bust = data.logoPath + '?v=' + Date.now();
          const logoEl = document.getElementById('currentLogo');
          if (logoEl) logoEl.src = bust;
          updateHeaderLogo(bust); // also refresh the site header immediately
        } else {
          logoStatus.textContent = data.message || 'Upload failed.';
          logoStatus.className = 'form-status error';
        }
      } catch (_) {
        logoStatus.textContent = 'Upload failed.';
        logoStatus.className = 'form-status error';
      }
    });
  }
}

function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function getVal(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }

// ── Admin Customers ───────────────────────────────────────────────────────────

async function loadAdminCustomers() {
  try {
    const data = await fetch('/api/admin/customers').then((r) => r.json());
    const customers = data.customers || [];
    const countEl = document.getElementById('customerCount');
    if (countEl) countEl.textContent = `${customers.length} customer${customers.length !== 1 ? 's' : ''}`;

    const tbody = document.getElementById('customersTableBody');
    const empty = document.getElementById('customersTableEmpty');

    if (!customers.length) {
      if (tbody) tbody.innerHTML = '';
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    if (tbody) {
      tbody.innerHTML = customers.map((c) => `
        <tr>
          <td><strong>${c.company || '—'}</strong></td>
          <td>${c.name || '—'}</td>
          <td style="color:var(--muted)">${c.email}</td>
          <td>${c.phone || '—'}</td>
          <td><strong>${c.orderCount}</strong></td>
          <td>${c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : '—'}</td>
          <td style="color:var(--muted);font-size:13px">${new Date(c.createdAt).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }
  } catch (error) {
    const tbody = document.getElementById('customersTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="form-status error">Could not load customers.</td></tr>';
  }
}

// -----------------------
// Hero parallax (background moves at 35% of scroll speed → depth illusion)
// -----------------------
(function () {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  const img = document.querySelector('.hero-bg img');
  if (!img) return;
  let pending = false;
  window.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      img.style.transform = `translateY(${window.scrollY * 0.35}px)`;
      pending = false;
    });
  }, { passive: true });
})();

// -----------------------
// Lightweight reveal animations (no external deps)
// -----------------------
(function () {
  try {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    const selectors = [
      '.hero-content',
      '.hero-media',
      '.product-card',
      '.catalog-card',
      '.section-heading',
      '.order-band',
      '.product-admin-card'
    ];

    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      // hero-media uses separate subtle class
      if (el.classList.contains('hero-media')) el.classList.add('reveal-hero-media');
      else if (el.classList.contains('hero-content')) el.classList.add('reveal', 'hero');
      else el.classList.add('reveal');

      observer.observe(el);
    });
  } catch (e) {
    // fail silently — animations are progressive enhancement
    console.error('Reveal init failed:', e);
  }
})();

const API_BASE = '';

let currentTab = 'products';
let editingProductId = null;
let editingProjectId = null;

// Elements
const loginBox = document.getElementById('admin-login');
const dashboard = document.getElementById('admin-dashboard');
const loginBtn = document.getElementById('admin-login-btn');
const logoutBtn = document.getElementById('admin-logout');
const loginMsg = document.getElementById('login-msg');

// Check login status on load
async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/me`);
    const data = await res.json();
    if (data.loggedIn) {
      loginBox.classList.add('hide');
      dashboard.classList.remove('hide');
      loadTab(currentTab);
    }
  } catch (err) {
    console.error(err);
  }
}

// Login
loginBtn.addEventListener('click', async () => {
  const password = document.getElementById('admin-password').value;
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await res.json();
  if (data.success) {
    loginBox.classList.add('hide');
    dashboard.classList.remove('hide');
    loadTab(currentTab);
  } else {
    loginMsg.textContent = data.error;
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch(`${API_BASE}/api/admin/logout`, { method: 'POST' });
  loginBox.classList.remove('hide');
  dashboard.classList.add('hide');
  location.reload();
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    loadTab(currentTab);
  });
});

function loadTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hide'));
  document.getElementById('tab-' + tab).classList.remove('hide');

  if (tab === 'products') loadProductsAdmin();
  if (tab === 'projects') loadProjectsAdmin();
  if (tab === 'enquiries') loadEnquiriesAdmin();
}

// ---------- PRODUCTS ----------
async function loadProductsAdmin() {
  const res = await fetch(`${API_BASE}/api/admin/products`);
  const products = await res.json();
  const tbody = document.querySelector('#products-table tbody');
  tbody.innerHTML = '';

  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.title}</td>
      <td>${p.category}</td>
      <td>${p.image ? `<img src="${p.image}" style="height:40px;border-radius:4px">` : '-'}</td>
      <td>
        <button class="btn-edit" data-id="${p.id}">Edit</button>
        <button class="btn-delete" data-id="${p.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('#products-table .btn-edit').forEach(btn => {
    btn.addEventListener('click', () => editProduct(btn.dataset.id));
  });
  document.querySelectorAll('#products-table .btn-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
  });
}

async function editProduct(id) {
  const res = await fetch(`${API_BASE}/api/admin/products`);
  const products = await res.json();
  const p = products.find(x => x.id == id);
  if (!p) return;

  editingProductId = p.id;
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-title').value = p.title;
  document.getElementById('prod-category').value = p.category;
  document.getElementById('prod-desc').value = p.description;
  document.getElementById('prod-image').value = p.image;
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById('prod-title').value,
    category: document.getElementById('prod-category').value,
    description: document.getElementById('prod-desc').value,
    image: document.getElementById('prod-image').value
  };

  const url = editingProductId
    ? `${API_BASE}/api/admin/products/${editingProductId}`
    : `${API_BASE}/api/admin/products`;
  const method = editingProductId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    resetProductForm();
    loadProductsAdmin();
  } else {
    alert('Save nahi hua');
  }
});

document.getElementById('prod-reset').addEventListener('click', resetProductForm);

function resetProductForm() {
  editingProductId = null;
  document.getElementById('product-form').reset();
  document.getElementById('prod-id').value = '';
}

async function deleteProduct(id) {
  if (!confirm('Delete karna hai?')) return;
  await fetch(`${API_BASE}/api/admin/products/${id}`, { method: 'DELETE' });
  loadProductsAdmin();
}

// ---------- PROJECTS ----------
async function loadProjectsAdmin() {
  const res = await fetch(`${API_BASE}/api/admin/projects`);
  const projects = await res.json();
  const tbody = document.querySelector('#projects-table tbody');
  tbody.innerHTML = '';

  projects.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.title}</td>
      <td>${p.category}</td>
      <td>${p.image ? `<img src="${p.image}" style="height:40px;border-radius:4px">` : '-'}</td>
      <td>
        <button class="btn-edit" data-id="${p.id}">Edit</button>
        <button class="btn-delete" data-id="${p.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('#projects-table .btn-edit').forEach(btn => {
    btn.addEventListener('click', () => editProject(btn.dataset.id));
  });
  document.querySelectorAll('#projects-table .btn-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteProject(btn.dataset.id));
  });
}

async function editProject(id) {
  const res = await fetch(`${API_BASE}/api/admin/projects`);
  const projects = await res.json();
  const p = projects.find(x => x.id == id);
  if (!p) return;

  editingProjectId = p.id;
  document.getElementById('proj-id').value = p.id;
  document.getElementById('proj-title').value = p.title;
  document.getElementById('proj-category').value = p.category;
  document.getElementById('proj-desc').value = p.description;
  document.getElementById('proj-image-url').value = p.image;
}

document.getElementById('project-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('proj-image-file');
  let imageUrl = document.getElementById('proj-image-url').value;

  // Upload file if selected
  if (fileInput.files[0]) {
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    const res = await fetch(`${API_BASE}/api/admin/upload`, {
      method: 'POST',
      // no content-type header for FormData
      body: formData
    });
    const data = await res.json();
    if (data.url) imageUrl = data.url;
    else { alert('Upload fail: ' + data.error); return; }
  }

  const payload = {
    title: document.getElementById('proj-title').value,
    category: document.getElementById('proj-category').value,
    description: document.getElementById('proj-desc').value,
    image: imageUrl
  };

  const url = editingProjectId
    ? `${API_BASE}/api/admin/projects/${editingProjectId}`
    : `${API_BASE}/api/admin/projects`;
  const method = editingProjectId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    resetProjectForm();
    loadProjectsAdmin();
  } else {
    alert('Save nahi hua');
  }
});

document.getElementById('proj-reset').addEventListener('click', resetProjectForm);

function resetProjectForm() {
  editingProjectId = null;
  document.getElementById('project-form').reset();
  document.getElementById('proj-id').value = '';
}

async function deleteProject(id) {
  if (!confirm('Delete karna hai?')) return;
  await fetch(`${API_BASE}/api/admin/projects/${id}`, { method: 'DELETE' });
  loadProjectsAdmin();
}

// ---------- ENQUIRIES ----------
async function loadEnquiriesAdmin() {
  const res = await fetch(`${API_BASE}/api/admin/enquiries`);
  const enquiries = await res.json();
  const tbody = document.querySelector('#enquiries-table tbody');
  tbody.innerHTML = '';

  enquiries.reverse().forEach(q => {
    const tr = document.createElement('tr');
    const date = new Date(q.date).toLocaleString();
    tr.innerHTML = `
      <td>${q.name}</td>
      <td>${q.phone}</td>
      <td>${q.message}</td>
      <td>${date}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Init
checkAuth();

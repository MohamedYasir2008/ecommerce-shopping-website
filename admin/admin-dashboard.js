// admin-dashboard.js – Populate the Admin Dashboard with dynamic data

document.addEventListener('DOMContentLoaded', () => {
  const session = StorageAPI.getSession();
  if (!session || session.role !== 'admin') {
    // Redirect non‑admin users to login or home
    window.location.href = '../login.html';
    return;
  }

  // Helper to set innerText of an element by id
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  // Users
  const users = StorageAPI.get(StorageAPI.keys.users) || [];
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalSellers = users.filter(u => u.role === 'seller').length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  setText('totalUsers', totalUsers);
  if (document.getElementById('totalAdmins')) setText('totalAdmins', totalAdmins);
  setText('totalSellers', totalSellers);
  setText('totalCustomers', totalCustomers);

  // Products
  const products = StorageAPI.get(StorageAPI.keys.products) || [];
  const totalProducts = products.length;
  const approvedProducts = products.filter(p => p.status === 'approved').length;
  const pendingProducts = products.filter(p => p.status === 'pending').length;
  setText('totalProducts', totalProducts);
  if (document.getElementById('approvedProducts')) setText('approvedProducts', approvedProducts);
  if (document.getElementById('pendingProducts')) setText('pendingProducts', pendingProducts);

  // Orders
  const orders = StorageAPI.get(StorageAPI.keys.orders) || [];
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  setText('totalOrders', totalOrders);
  if (document.getElementById('totalSales')) setText('totalSales', totalSales.toFixed(2));

  // Recent Orders – show up to 5 latest orders
  const recentContainer = document.getElementById('recentOrders');
  if (recentContainer) {
    const recent = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    recentContainer.innerHTML = recent
      .map(o => {
        const user = users.find(u => u.id === o.userId) || { name: 'Unknown' };
        return `<div class="order-card">
                  <p><strong>#${o.id}</strong> – ${user.name}</p>
                  <p>Total: ₹${(o.totalAmount || 0).toFixed(2)}</p>
                  <p>Status: ${o.status || 'pending'}</p>
                </div>`;
      })
      .join('');
  }
});

// customer/profile.js – Load and edit the logged‑in customer's profile

document.addEventListener('DOMContentLoaded', () => {
  const session = StorageAPI.getSession();
  if (!session || session.role !== 'customer') {
    // Not logged in as customer – redirect to login page
    window.location.href = '../login.html';
    return;
  }

  const userId = session.userId;
  const users = StorageAPI.get(StorageAPI.keys.users) || [];
  const user = users.find(u => u.id === userId);
  if (!user) {
    alert('User not found.');
    return;
  }

  // Populate form fields
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const addressInput = document.getElementById('address');
  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (phoneInput) phoneInput.value = user.phone || '';
  if (addressInput) addressInput.value = user.address || '';

  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Update user object – keep id, role, email, password unchanged
    user.name = nameInput.value.trim();
    user.phone = phoneInput.value.trim();
    user.address = addressInput.value.trim();
    // Save back to storage
    StorageAPI.set(StorageAPI.keys.users, users);
    // Also update session (in case UI elsewhere reads from it)
    StorageAPI.setSession({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    });
    alert('Profile saved successfully.');
  });
});

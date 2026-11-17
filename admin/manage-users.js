// admin/manage-users.js – Load and manage user list for Admin

document.addEventListener('DOMContentLoaded', () => {
  const session = StorageAPI.getSession();
  if (!session || session.role !== 'admin') {
    window.location.href = '../login.html';
    return;
  }

  const usersListDiv = document.getElementById('usersList');
  const searchInput = document.getElementById('search');
  const roleFilter = document.getElementById('roleFilter');

  const render = () => {
    const users = StorageAPI.get(StorageAPI.keys.users) || [];
    const term = (searchInput?.value || '').trim().toLowerCase();
    const role = roleFilter?.value || '';
    const filtered = users.filter(u => {
      const matchesTerm = u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
      const matchesRole = role === '' || u.role === role;
      return matchesTerm && matchesRole;
    });

    if (!usersListDiv) return;
    usersListDiv.innerHTML = filtered.map(u => {
      const isCurrentAdmin = session.userId === u.id && u.role === 'admin';
      const deleteBtn = `<button class="btn-delete" data-id="${u.id}" ${isCurrentAdmin ? 'disabled' : ''}>Delete</button>`;
      return `<div class="user-card" id="user-${u.id}">
                <p><strong>${u.name}</strong> (${u.email}) - ${u.role}</p>
                ${deleteBtn}
              </div>`;
    }).join('');
  };

  // Delete handler
  const handleDelete = (e) => {
    if (!e.target.matches('.btn-delete')) return;
    const userId = e.target.getAttribute('data-id');
    const users = StorageAPI.get(StorageAPI.keys.users) || [];
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    // Prevent deleting self
    if (targetUser.id === session.userId) {
      alert('You cannot delete your own admin account.');
      return;
    }
    // Prevent deleting the last admin
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (targetUser.role === 'admin' && adminCount <= 1) {
      alert('At least one admin must remain in the system.');
      return;
    }
    if (!confirm(`Delete user ${targetUser.name} (${targetUser.email})?`)) return;
    const newList = users.filter(u => u.id !== userId);
    StorageAPI.set(StorageAPI.keys.users, newList);
    render();
  };

  // Attach listeners
  if (usersListDiv) usersListDiv.addEventListener('click', handleDelete);
  if (searchInput) searchInput.addEventListener('input', render);
  if (roleFilter) roleFilter.addEventListener('change', render);

  render();
});

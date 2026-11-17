// admin/manage-categories.js – Load and manage categories for Admin

document.addEventListener('DOMContentLoaded', () => {
  const session = StorageAPI.getSession();
  if (!session || session.role !== 'admin') {
    window.location.href = '../login.html';
    return;
  }

  const categoriesListDiv = document.getElementById('categoriesList');
  const addForm = document.getElementById('addCategoryForm');
  const catNameInput = document.getElementById('catName');

  const render = () => {
    const categories = StorageAPI.get(StorageAPI.keys.categories) || [];
    if (!categoriesListDiv) return;
    categoriesListDiv.innerHTML = categories.map(cat => {
      return `<div class="cat-card" id="cat-${cat.id}">
                <span>${cat.name}</span>
                <button class="btn-edit" data-id="${cat.id}">Edit</button>
                <button class="btn-delete" data-id="${cat.id}">Delete</button>
              </div>`;
    }).join('');
  };

  const addCategory = (e) => {
    e.preventDefault();
    const name = catNameInput.value.trim();
    if (!name) return alert('Category name cannot be empty.');
    const categories = StorageAPI.get(StorageAPI.keys.categories) || [];
    const duplicate = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (duplicate) return alert('Category already exists.');
    const newCat = { id: 'c-' + Date.now(), name };
    categories.push(newCat);
    StorageAPI.set(StorageAPI.keys.categories, categories);
    catNameInput.value = '';
    render();
  };

  const handleDelete = (e) => {
    if (!e.target.matches('.btn-delete')) return;
    const catId = e.target.getAttribute('data-id');
    // Check if any product uses this category
    const products = StorageAPI.get(StorageAPI.keys.products) || [];
    const used = products.some(p => p.categoryId === catId);
    if (used) return alert('Cannot delete category that is used by products.');
    if (!confirm('Delete this category?')) return;
    const categories = StorageAPI.get(StorageAPI.keys.categories) || [];
    const updated = categories.filter(c => c.id !== catId);
    StorageAPI.set(StorageAPI.keys.categories, updated);
    render();
  };

  // Simple edit: replace name with prompt
  const handleEdit = (e) => {
    if (!e.target.matches('.btn-edit')) return;
    const catId = e.target.getAttribute('data-id');
    const categories = StorageAPI.get(StorageAPI.keys.categories) || [];
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    const newName = prompt('Enter new name for category', cat.name);
    if (!newName) return;
    const duplicate = categories.find(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== catId);
    if (duplicate) return alert('Another category with this name already exists.');
    cat.name = newName.trim();
    StorageAPI.set(StorageAPI.keys.categories, categories);
    render();
  };

  if (addForm) addForm.addEventListener('submit', addCategory);
  if (categoriesListDiv) {
    categoriesListDiv.addEventListener('click', handleDelete);
    categoriesListDiv.addEventListener('click', handleEdit);
  }

  render();
});

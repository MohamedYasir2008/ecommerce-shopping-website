// products.js – renders product list, search, category filter, and add‑to‑cart actions
(function(){
    const storage = window.StorageAPI;
    const prodContainer = document.getElementById('product-list');
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('categoryFilter');

    function loadCategories(){
        const categories = storage.get(storage.keys.categories) || [];
        categories.forEach(cat=>{
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            categorySelect.appendChild(opt);
        });
    }

    function renderProducts(){
        const allProducts = storage.get(storage.keys.products) || [];
        const query = searchInput.value.trim().toLowerCase();
        const catId = categorySelect.value;
        const filtered = allProducts.filter(p=>{
            if(p.status!=='approved' || p.stock<=0) return false; // only visible products
            if(query && !p.name.toLowerCase().includes(query) && !p.description.toLowerCase().includes(query)) return false;
            if(catId && p.categoryId!==catId) return false;
            return true;
        });
        prodContainer.innerHTML = '';
        if(filtered.length===0){
            prodContainer.innerHTML = '<p>No products found.</p>';
            return;
        }
        filtered.forEach(p=>{
            const card = document.createElement('div');
            card.className='card';
            card.innerHTML = `
                <img src="${p.image}" alt="${p.name}" />
                <h3>${p.name}</h3>
                <p>₹${p.price.toFixed(2)}</p>
                <a href="product-details.html?id=${p.id}" class="btn">Details</a>
                <button class="btn" onclick="window.CommonUI.addToCart('${p.id}')">Add to Cart</button>
            `;
            prodContainer.appendChild(card);
        });
    }

    // Expose addToCart through CommonUI (so it can be called from HTML inline)
    window.CommonUI.addToCart = function(productId){
        const sess = storage.getSession();
        if(!sess || sess.role!=='customer'){
            alert('Login as a customer to add to cart');
            window.location.href='login.html';
            return;
        }
        const cart = storage.getCart(sess.userId);
        const existing = cart.find(i=>i.productId===productId);
        if(existing){ existing.quantity+=1; }
        else { cart.push({productId, quantity:1}); }
        storage.setCart(sess.userId, cart);
        alert('Added to cart');
    };

    // Event listeners
    if(searchInput) searchInput.addEventListener('input', renderProducts);
    if(categorySelect) categorySelect.addEventListener('change', renderProducts);

    // Init
    document.addEventListener('DOMContentLoaded', function(){
        loadCategories();
        renderProducts();
    });
})();
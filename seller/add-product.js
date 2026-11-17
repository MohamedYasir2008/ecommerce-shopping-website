// add-product.js – handles new product creation for sellers
(function(){
    const storage = window.StorageAPI;
    const sess = storage.getSession();
    if(!sess || sess.role!=='seller'){
        alert('Please log in as a seller');
        window.location.href='../login.html';
        return;
    }
    const categorySelect = document.getElementById('category');
    const msgDiv = document.getElementById('msg');

    // Populate categories dropdown
    const categories = storage.get(storage.keys.categories) || [];
    categories.forEach(cat=>{
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        categorySelect.appendChild(opt);
    });

    document.getElementById('addProductForm').addEventListener('submit', function(e){
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const description = document.getElementById('description').value.trim();
        const categoryId = document.getElementById('category').value;
        const price = parseFloat(document.getElementById('price').value);
        const stock = parseInt(document.getElementById('stock').value);
        const image = document.getElementById('image').value.trim();
        if(!name || !description || !categoryId || isNaN(price) || isNaN(stock) || !image){
            msgDiv.textContent = 'Please fill in all fields.';
            msgDiv.style.color = 'red';
            return;
        }
        const products = storage.get(storage.keys.products) || [];
        const newProduct = {
            id: 'p-' + crypto.randomUUID(),
            sellerId: sess.userId,
            categoryId,
            name,
            description,
            price,
            stock,
            image,
            rating: 0,
            reviewCount: 0,
            status: 'pending',
            createdAt: new Date().toISOString(),
            rejectionRemarks: ''
        };
        products.push(newProduct);
        storage.set(storage.keys.products, products);
        msgDiv.textContent = 'Product added and pending approval.';
        msgDiv.style.color = 'green';
        // reset form
        e.target.reset();
    });
})();
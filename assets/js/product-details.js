// product-details.js – display product info and allow add to cart
(function(){
    const storage = window.StorageAPI;
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('id');
    if(!prodId){
        document.getElementById('product-detail').innerHTML = '<p>Product not found.</p>';
        return;
    }
    const product = (storage.get(storage.keys.products) || []).find(p=>p.id===prodId && p.status==='approved');
    if(!product){
        document.getElementById('product-detail').innerHTML = '<p>Product not available.</p>';
        return;
    }
    const container = document.getElementById('product-detail');
    container.innerHTML = `
        <h2>${product.name}</h2>
        <img src="${product.image}" alt="${product.name}" style="max-width:300px;" />
        <p>${product.description}</p>
        <p>Category: ${getCategoryName(product.categoryId)}</p>
        <p>Price: ₹${product.price.toFixed(2)}</p>
        <p>In stock: ${product.stock}</p>
        <button class="btn" id="addBtn">Add to Cart</button>
    `;
    document.getElementById('addBtn').addEventListener('click', function(){
        const sess = storage.getSession();
        if(!sess || sess.role!=='customer'){
            alert('Login as a customer to add to cart');
            window.location.href='login.html';
            return;
        }
        const cart = storage.getCart(sess.userId);
        const existing = cart.find(i=>i.productId===product.id);
        if(existing){ existing.quantity+=1; }
        else { cart.push({productId:product.id, quantity:1}); }
        storage.setCart(sess.userId, cart);
        alert('Added to cart');
    });

    function getCategoryName(catId){
        const cat = (storage.get(storage.keys.categories)||[]).find(c=>c.id===catId);
        return cat ? cat.name : '';
    }
})();
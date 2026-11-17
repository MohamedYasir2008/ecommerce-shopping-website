// manage-products.js – list, edit, delete seller's own products
(function(){
    const storage = window.StorageAPI;
    const sess = storage.getSession();
    if(!sess || sess.role!=='seller'){
        alert('Please log in as a seller');
        window.location.href='../login.html';
        return;
    }
    const products = storage.get(storage.keys.products) || [];
    const myProducts = products.filter(p=>p.sellerId===sess.userId);
    const container = document.getElementById('productsList');
    if(myProducts.length===0){
        container.innerHTML = '<p>You have no products yet.</p>';
        return;
    }
    myProducts.forEach(p=>{
        const card = document.createElement('div');
        card.className='card';
        card.innerHTML = `
            <h3>${p.name}</h3>
            <p><strong>Category:</strong> ${getCategoryName(p.categoryId)}</p>
            <p><strong>Price:</strong> ₹${p.price.toFixed(2)}</p>
            <p><strong>Stock:</strong> ${p.stock}</p>
            <p><strong>Status:</strong> ${p.status}</p>
            ${p.status==='rejected' ? `<p><strong>Remark:</strong> ${p.rejectionRemarks || '—'}</p>` : ''}
            <button class="btn editBtn" data-id="${p.id}">Edit</button>
            <button class="btn deleteBtn" data-id="${p.id}">Delete</button>
        `;
        container.appendChild(card);
    });

    // helper to map category id to name
    function getCategoryName(catId){
        const cat = (storage.get(storage.keys.categories)||[]).find(c=>c.id===catId);
        return cat ? cat.name : '';
    }

    // Edit flow – simple prompts for each field
    container.addEventListener('click', function(e){
        if(e.target.classList.contains('editBtn')){
            const pid = e.target.dataset.id;
            const product = products.find(p=>p.id===pid);
            if(!product) return;
            const newName = prompt('Product name:', product.name) || product.name;
            const newDesc = prompt('Description:', product.description) || product.description;
            const newPrice = parseFloat(prompt('Price (₹):', product.price));
            const newStock = parseInt(prompt('Stock quantity:', product.stock));
            const newImg = prompt('Image URL:', product.image) || product.image;
            const newCatId = prompt('Category ID (use existing IDs):', product.categoryId) || product.categoryId;
            // Basic validation
            if(isNaN(newPrice) || isNaN(newStock)){
                alert('Invalid number entered. Edit cancelled.');
                return;
            }
            product.name = newName.trim();
            product.description = newDesc.trim();
            product.price = newPrice;
            product.stock = newStock;
            product.image = newImg.trim();
            product.categoryId = newCatId;
            // keep status as is (cannot become approved)
            storage.set(storage.keys.products, products);
            alert('Product updated.');
            location.reload();
        }
        if(e.target.classList.contains('deleteBtn')){
            const pid = e.target.dataset.id;
            if(confirm('Delete this product? This cannot be undone.')){
                const idx = products.findIndex(p=>p.id===pid);
                if(idx>-1){
                    products.splice(idx,1);
                    storage.set(storage.keys.products, products);
                    alert('Product deleted.');
                    location.reload();
                }
            }
        }
    });
})();
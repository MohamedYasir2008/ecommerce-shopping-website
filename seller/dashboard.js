// dashboard.js – seller dashboard logic
(function(){
    const storage = window.StorageAPI;
    const sess = storage.getSession();
    if(!sess || sess.role!=='seller'){
        alert('Please log in as a seller');
        window.location.href='../login.html';
        return;
    }
    // Welcome name
    document.getElementById('sellerName').textContent = sess.name || sess.email;

    const products = storage.get(storage.keys.products) || [];
    const myProducts = products.filter(p=>p.sellerId===sess.userId);
    const total = myProducts.length;
    const approved = myProducts.filter(p=>p.status==='approved').length;
    const pending = myProducts.filter(p=>p.status==='pending').length;
    document.getElementById('totalProducts').textContent = total;
    document.getElementById('approvedProducts').textContent = approved;
    document.getElementById('pendingProducts').textContent = pending;

    // Orders that contain seller's products
    const orders = storage.get(storage.keys.orders) || [];
    const sellerOrders = orders.filter(o=>o.items.some(it=>it.sellerId===sess.userId));
    document.getElementById('totalOrders').textContent = sellerOrders.length;

    // Recent orders (latest 3)
    const recentContainer = document.getElementById('recentOrders');
    const recent = sellerOrders.slice(-3).reverse();
    if(recent.length===0){
        recentContainer.innerHTML = '<p>No recent orders.</p>';
    } else {
        recent.forEach(order=>{
            const div = document.createElement('div');
            div.className='card';
            div.innerHTML = `
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Status:</strong> ${order.deliveryStatus}</p>
            `;
            recentContainer.appendChild(div);
        });
    }
})();
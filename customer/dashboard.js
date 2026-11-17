// dashboard.js – customer dashboard logic
(function(){
    const storage = window.StorageAPI;
    const sess = storage.getSession();
    if(!sess || sess.role!=='customer'){
        alert('Please log in as a customer');
        window.location.href='../login.html';
        return;
    }
    // Populate welcome name
    document.getElementById('custName').textContent = sess.name || sess.email;

    const orders = storage.get(storage.keys.orders) || [];
    const myOrders = orders.filter(o=>o.customerId===sess.userId);
    // totals
    document.getElementById('totalOrders').textContent = myOrders.length;
    const pending = myOrders.filter(o=>o.deliveryStatus==='Placed' || o.deliveryStatus==='Packed' || o.deliveryStatus==='Shipped');
    document.getElementById('pendingOrders').textContent = pending.length;

    // recent orders (most recent 3)
    const recentContainer = document.getElementById('recentOrders');
    const recent = myOrders.slice(-3).reverse(); // latest first
    if(recent.length===0){
        recentContainer.innerHTML = '<p>No recent orders.</p>';
        return;
    }
    recent.forEach(order=>{
        const div = document.createElement('div');
        div.className='card';
        div.innerHTML = `
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.deliveryStatus}</p>
            <a href="orders.html" class="btn">View All Orders</a>
        `;
        recentContainer.appendChild(div);
    });
})();
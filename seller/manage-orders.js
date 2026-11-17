// manage-orders.js – seller view of orders containing their products & status updates
(function(){
    const storage = window.StorageAPI;
    const sess = storage.getSession();
    if(!sess || sess.role!=='seller'){
        alert('Please log in as a seller');
        window.location.href='../login.html';
        return;
    }
    const orders = storage.get(storage.keys.orders) || [];
    const users = storage.get(storage.keys.users) || [];
    const sellerOrders = orders.filter(o=>o.items.some(it=>it.sellerId===sess.userId));
    const container = document.getElementById('ordersList');

    if(sellerOrders.length===0){
        container.innerHTML = '<p>No orders for your products yet.</p>';
        return;
    }

    sellerOrders.forEach(order=>{
        const card = document.createElement('div');
        card.className='card';
        const cust = users.find(u=>u.id===order.customerId);
        const custName = cust ? (cust.name || cust.email) : 'Unknown';
        const myItems = order.items.filter(it=>it.sellerId===sess.userId);
        const itemsHtml = myItems.map(it=>`<li>${it.name} (x${it.quantity}) – ₹${it.price.toFixed(2)} each</li>`).join('');
        const statusOptions = ['Placed','Packed','Shipped','Delivered'];
        const selectHtml = statusOptions.map(st=>`<option value="${st}" ${st===order.deliveryStatus?'selected':''}>${st}</option>`).join('');
        card.innerHTML = `
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Customer:</strong> ${custName}</p>
            <p><strong>Items:</strong></p>
            <ul>${itemsHtml}</ul>
            <p><strong>Status:</strong> 
                <select class="statusSelect">${selectHtml}</select>
                <button class="btn saveBtn">Save</button>
            </p>
        `;
        container.appendChild(card);
        const select = card.querySelector('.statusSelect');
        const btn = card.querySelector('.saveBtn');
        btn.addEventListener('click', function(){
            const newStatus = select.value;
            order.deliveryStatus = newStatus;
            const allOrders = storage.get(storage.keys.orders) || [];
            const idx = allOrders.findIndex(o=>o.orderId===order.orderId);
            if(idx>-1){
                allOrders[idx] = order;
                storage.set(storage.keys.orders, allOrders);
                alert('Order status updated');
            }
        });
    });
})();
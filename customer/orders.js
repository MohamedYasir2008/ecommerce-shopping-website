// orders.js – displays customer's order history
(function(){
    const storage = window.StorageAPI;
    const sess = storage.getSession();
    if(!sess || sess.role!=='customer'){
        alert('Login as a customer');
        window.location.href='../login.html';
        return;
    }
    const orders = storage.get(storage.keys.orders) || [];
    const myOrders = orders.filter(o=>o.customerId===sess.userId).reverse(); // newest first
    const listDiv = document.getElementById('ordersList');
    if(myOrders.length===0){
        listDiv.innerHTML = '<p>No orders placed yet.</p>';
        return;
    }
    myOrders.forEach(order=>{
        const div = document.createElement('div');
        div.className='card';
        div.innerHTML = `
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
            <p><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
            <p><strong>Status:</strong> ${order.deliveryStatus}</p>
            <button class="btn" data-id="${order.orderId}">View Details</button>
            <div class="details" id="details-${order.orderId}" style="display:none; margin-top:0.5rem;"></div>
        `;
        listDiv.appendChild(div);
        const btn = div.querySelector('button');
        const detailsDiv = div.querySelector('.details');
        btn.addEventListener('click', function(){
            if(detailsDiv.style.display==='none'){
                // build details view
                const itemsHtml = order.items.map(it=>`<li>${it.name} (x${it.quantity}) – ₹${it.price.toFixed(2)} each</li>`).join('');
                detailsDiv.innerHTML = `<ul>${itemsHtml}</ul>`;
                detailsDiv.style.display='block';
                btn.textContent='Hide Details';
            } else {
                detailsDiv.style.display='none';
                btn.textContent='View Details';
            }
        });
    });
})();
// checkout.js – renders cart summary and processes order placement
(function(){
    const storage = window.StorageAPI;
    const sess = storage.getSession();
    if(!sess || sess.role!=='customer'){
        alert('Please log in as a customer');
        window.location.href='../login.html';
        return;
    }
    const summaryDiv = document.getElementById('orderSummary');
    const form = document.getElementById('checkoutForm');
    const confirmDiv = document.getElementById('confirmationMessage');
    const orderIdDisplay = document.getElementById('orderIdDisplay');

    function renderSummary(){
        const cart = storage.getCart(sess.userId);
        if(cart.length===0){
            summaryDiv.innerHTML = '<p>Your cart is empty.</p>';
            form.style.display='none';
            return;
        }
        const products = storage.get(storage.keys.products) || [];
        let total = 0;
        const table = document.createElement('table');
        table.innerHTML = `<tr><th>Product</th><th>Qty</th><th>Price</th><th>Sub‑total</th></tr>`;
        cart.forEach(item=>{
            const prod = products.find(p=>p.id===item.productId);
            if(!prod) return;
            const sub = prod.price * item.quantity;
            total += sub;
            const row = document.createElement('tr');
            row.innerHTML = `<td>${prod.name}</td><td>${item.quantity}</td><td>₹${prod.price.toFixed(2)}</td><td>₹${sub.toFixed(2)}</td>`;
            table.appendChild(row);
        });
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `<td colspan="3"><strong>Total</strong></td><td><strong>₹${total.toFixed(2)}</strong></td>`;
        table.appendChild(totalRow);
        summaryDiv.innerHTML = '';
        summaryDiv.appendChild(table);
    }

    function placeOrder(event){
        event.preventDefault();
        const cart = storage.getCart(sess.userId);
        if(cart.length===0){
            alert('Cart is empty');
            return;
        }
        // gather form data
        const fullName = document.getElementById('fullName').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const paymentMethod = document.getElementById('paymentMethod').value;
        if(!fullName || !address || !phone){
            alert('Please fill all delivery fields');
            return;
        }
        // verify stock availability
        const products = storage.get(storage.keys.products) || [];
        for(const item of cart){
            const prod = products.find(p=>p.id===item.productId);
            if(!prod){ alert('Product not found: '+item.productId); return; }
            if(item.quantity > prod.stock){
                alert(`Insufficient stock for ${prod.name}. Available: ${prod.stock}`);
                return;
            }
        }
        // build order object
        const orderId = 'ORD-'+Date.now();
        const orderItems = cart.map(item=>{
            const prod = products.find(p=>p.id===item.productId);
            return {
                productId: prod.id,
                sellerId: prod.sellerId,
                name: prod.name,
                price: prod.price,
                quantity: item.quantity,
                subTotal: prod.price * item.quantity
            };
        });
        const totalAmount = orderItems.reduce((sum,i)=>sum+i.subTotal,0);
        const order = {
            orderId,
            customerId: sess.userId,
            items: orderItems,
            total: totalAmount,
            paymentMethod,
            paymentStatus: (paymentMethod==='COD') ? 'pending' : 'paid',
            deliveryStatus: 'Placed',
            deliveryAddress: { name: fullName, address, phone },
            orderDate: new Date().toISOString()
        };
        // update product stock
        orderItems.forEach(oi=>{
            const prod = products.find(p=>p.id===oi.productId);
            prod.stock -= oi.quantity;
            if(prod.stock===0) prod.status='out_of_stock';
        });
        // persist updates
        storage.set(storage.keys.products, products);
        const orders = storage.get(storage.keys.orders) || [];
        orders.push(order);
        storage.set(storage.keys.orders, orders);
        // clear cart
        storage.setCart(sess.userId, []);
        // show confirmation
        form.style.display='none';
        summaryDiv.style.display='none';
        orderIdDisplay.textContent = `Your order ID is ${orderId}`;
        confirmDiv.style.display='block';
    }

    // init
    document.addEventListener('DOMContentLoaded', function(){
        renderSummary();
        form.addEventListener('submit', placeOrder);
    });
})();
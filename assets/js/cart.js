// cart.js – display items, edit quantities, remove, compute totals
(function(){
    const storage = window.StorageAPI;
    const sess = storage.getSession();
    if(!sess || sess.role!=='customer'){
        alert('Login as a customer to view cart');
        window.location.href='../login.html';
        return;
    }
    const cartContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    function render(){
        const cart = storage.getCart(sess.userId);
        if(cart.length===0){
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
            totalEl.textContent = '';
            return;
        }
        const products = storage.get(storage.keys.products) || [];
        let total = 0;
        const table = document.createElement('table');
        table.innerHTML = `<tr><th>Product</th><th>Qty</th><th>Price</th><th>Sub</th><th>Actions</th></tr>`;
        cart.forEach(item=>{
            const prod = products.find(p=>p.id===item.productId);
            if(!prod) return; // skip deleted
            const sub = prod.price * item.quantity;
            total += sub;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${prod.name}</td>
                <td><input type='number' min='1' max='${prod.stock}' value='${item.quantity}' data-id='${item.productId}' class='qty-input' /></td>
                <td>₹${prod.price.toFixed(2)}</td>
                <td>₹${sub.toFixed(2)}</td>
                <td><button class='btn' data-id='${item.productId}'>Remove</button></td>
            `;
            table.appendChild(row);
        });
        cartContainer.innerHTML = '';
        cartContainer.appendChild(table);
        totalEl.textContent = 'Total: ₹' + total.toFixed(2);
        // listeners
        cartContainer.querySelectorAll('.qty-input').forEach(inp=>{
            inp.addEventListener('change', function(){
                const pid = this.dataset.id;
                const newQty = parseInt(this.value);
                const prod = products.find(p=>p.id===pid);
                if(newQty>prod.stock){
                    alert('Cannot exceed stock');
                    this.value = prod.stock;
                    return;
                }
                const cart = storage.getCart(sess.userId);
                const entry = cart.find(i=>i.productId===pid);
                if(entry){ entry.quantity = newQty; }
                storage.setCart(sess.userId, cart);
                render();
            });
        });
        cartContainer.querySelectorAll('button').forEach(btn=>{
            btn.addEventListener('click', function(){
                const pid = this.dataset.id;
                let cart = storage.getCart(sess.userId);
                cart = cart.filter(i=>i.productId!==pid);
                storage.setCart(sess.userId, cart);
                render();
            });
        });
    }
    document.addEventListener('DOMContentLoaded', render);
})();
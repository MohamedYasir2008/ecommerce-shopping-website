// main.js – builds navigation bar and common UI helpers
(function(){
    // Build nav items based on role
    function buildNav(){
        const nav = document.getElementById('navbar');
        if(!nav) return;
        const session = window.StorageAPI.getSession();
        const links = [];
        // Common links
        links.push({href:'index.html', text:'Home'});
        links.push({href:'products.html', text:'Shop'});
        links.push({href:'about.html', text:'About'});
        links.push({href:'contact.html', text:'Contact'});
        if(!session){
            links.push({href:'login.html', text:'Login'});
            links.push({href:'register.html', text:'Register'});
        } else {
            if(session.role==='admin'){
                links.push({href:'admin/dashboard.html', text:'Admin'});
            } else if(session.role==='seller'){
                links.push({href:'seller/dashboard.html', text:'Seller'});
            } else if(session.role==='customer'){
                links.push({href:'customer/dashboard.html', text:'My Account'});
                links.push({href:'customer/cart.html', text:'Cart'});
            }
            links.push({href:'#', text:'Logout', onClick: logout});
        }
        // Render
        nav.innerHTML = '';
        links.forEach(l=>{
            const a = document.createElement('a');
            a.href = l.href;
            a.textContent = l.text;
            if(l.onClick){ a.addEventListener('click', function(e){ e.preventDefault(); l.onClick();}); }
            nav.appendChild(a);
        });
    }

    function logout(){
        window.StorageAPI.clearSession();
        // simple toast message
        alert('Logged out');
        buildNav();
        // redirect to home after short delay
        setTimeout(()=>{window.location.href='index.html';},500);
    }

    // expose for other scripts
    window.CommonUI = {buildNav, logout};

    // auto-run on load
    document.addEventListener('DOMContentLoaded', function(){
        buildNav();
        if(document.getElementById('category-list')) renderHome();
    });

    // Home page rendering – categories & featured products
    function renderHome(){
        const catContainer = document.getElementById('category-list');
        const prodContainer = document.getElementById('featured-list');
        const categories = window.StorageAPI.get(window.StorageAPI.keys.categories) || [];
        const products = window.StorageAPI.get(window.StorageAPI.keys.products) || [];
        // render categories
        catContainer.innerHTML = '';
        categories.forEach(cat=>{
            const div = document.createElement('div');
            div.className='card';
            div.innerHTML = `<h3>${cat.name}</h3>`;
            catContainer.appendChild(div);
        });
        // render featured (first 4 approved products)
        const approved = products.filter(p=>p.status==='approved' && p.stock>0);
        approved.slice(0,4).forEach(p=>{
            const div = document.createElement('div');
            div.className='card';
            div.innerHTML = `
                <img src="${p.image}" alt="${p.name}" />
                <h4>${p.name}</h4>
                <p>₹${p.price.toFixed(2)}</p>
                <a href="product-details.html?id=${p.id}" class="btn">Details</a>
                <button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button>
            `;
            prodContainer.appendChild(div);
        });
    }

    // Simple cart add (used from home cards)
    function addToCart(productId){
        const sess = window.StorageAPI.getSession();
        if(!sess){
            alert('Please log in as a customer first');
            window.location.href='login.html';
            return;
        }
        if(sess.role!=='customer'){
            alert('Only customers can add to cart');
            return;
        }
        const cart = window.StorageAPI.getCart(sess.userId);
        const existing = cart.find(i=>i.productId===productId);
        if(existing){ existing.quantity+=1; }
        else { cart.push({productId, quantity:1}); }
        window.StorageAPI.setCart(sess.userId, cart);
        alert('Added to cart');
    }

})();
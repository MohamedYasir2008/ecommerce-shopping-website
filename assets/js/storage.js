// storage.js – simple wrapper for LocalStorage and initial seed data
(function(){
    const STORAGE_KEYS = {
        users: 'ecom_users',
        categories: 'ecom_categories',
        products: 'ecom_products',
        orders: 'ecom_orders',
        reviews: 'ecom_reviews',
        // cart is stored per‑customer: ecom_cart_<userId>
    };

    // --- Helper: get parsed JSON or fallback ---
    function get(key){
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    }
    function set(key, value){
        localStorage.setItem(key, JSON.stringify(value));
    }

    // --- Seed data – runs only on first load ---
    function seed(){
        if(!get(STORAGE_KEYS.users)){
            const demoUsers = [
                {id: 'u-admin', role:'admin', name:'Admin', email:'admin@shopdemo.com', password:'Admin@123'},
                {id: 'u-seller', role:'seller', name:'Seller', email:'seller@shopdemo.com', password:'Seller@123'},
                {id: 'u-customer', role:'customer', name:'Customer', email:'customer@shopdemo.com', password:'Customer@123'}
            ];
            set(STORAGE_KEYS.users, demoUsers);
        }
        if(!get(STORAGE_KEYS.categories)){
            const cats = [
                {id:'c-1', name:'Electronics'},
                {id:'c-2', name:'Fashion'},
                {id:'c-3', name:'Home & Kitchen'}
            ];
            set(STORAGE_KEYS.categories, cats);
        }
        if(!get(STORAGE_KEYS.products)){
            const products = [
                {id:'p-1', sellerId:'u-seller', categoryId:'c-1', name:'Simple Speaker', description:'A small Bluetooth speaker.', price:29.99, stock:15, image:'https://via.placeholder.com/200?text=Speaker', rating:4.2, reviewCount:3, status:'approved', createdAt:new Date().toISOString()},
                {id:'p-2', sellerId:'u-seller', categoryId:'c-2', name:'Cotton T‑Shirt', description:'Comfortable unisex tee.', price:19.99, stock:30, image:'https://via.placeholder.com/200?text=TShirt', rating:4.5, reviewCount:5, status:'approved', createdAt:new Date().toISOString()},
                {id:'p-3', sellerId:'u-seller', categoryId:'c-3', name:'Ceramic Mug', description:'12 oz coffee mug.', price:9.99, stock:0, image:'https://via.placeholder.com/200?text=Mug', rating:0, reviewCount:0, status:'out_of_stock', createdAt:new Date().toISOString()},
                // pending product example for seller demo
                {id:'p-4', sellerId:'u-seller', categoryId:'c-1', name:'Wireless Mouse', description:'Ergonomic mouse.', price:24.99, stock:20, image:'https://via.placeholder.com/200?text=Mouse', rating:0, reviewCount:0, status:'pending', createdAt:new Date().toISOString()}
            ];
            set(STORAGE_KEYS.products, products);
        }
        if(!get(STORAGE_KEYS.orders)) set(STORAGE_KEYS.orders, []);
        if(!get(STORAGE_KEYS.reviews)) set(STORAGE_KEYS.reviews, []);
    }

    // --- Cart helpers (per‑customer) ---
    function getCart(userId){
        if(!userId) return [];
        return get('ecom_cart_' + userId) || [];
    }
    function setCart(userId, cart){
        if(userId) set('ecom_cart_' + userId, cart);
    }

    // --- Notification helpers (per‑customer) ---
    function getNotifications(userId){
        if(!userId) return [];
        return get('ecom_notifications_' + userId) || [];
    }
    function addNotification(userId, message){
        if(!userId) return;
        const notes = getNotifications(userId);
        notes.push({msg:message, date:new Date().toISOString(), read:false});
        set('ecom_notifications_' + userId, notes);
    }

    // --- Review helpers ---
    function getReviews(productId){
        const all = get(STORAGE_KEYS.reviews) || [];
        return all.filter(r=>r.productId===productId);
    }
    function addReview(review){
        const reviews = get(STORAGE_KEYS.reviews) || [];
        reviews.push(review);
        set(STORAGE_KEYS.reviews, reviews);
        // Update aggregate rating on the product
        const products = get(STORAGE_KEYS.products) || [];
        const prod = products.find(p=>p.id===review.productId);
        if(prod){
            const productReviews = reviews.filter(r=>r.productId===prod.id);
            const sum = productReviews.reduce((s,r)=>s+r.rating,0);
            prod.rating = productReviews.length ? (sum/productReviews.length) : 0;
            prod.reviewCount = productReviews.length;
            set(STORAGE_KEYS.products, products);
        }
    }

    // --- Auth helpers ---
    function findUserByEmail(email){
        const users = get(STORAGE_KEYS.users) || [];
        return users.find(u=>u.email===email);
    }
    function getSession(){
        const raw = localStorage.getItem('ecom_session');
        return raw ? JSON.parse(raw) : null;
    }
    function setSession(session){
        localStorage.setItem('ecom_session', JSON.stringify(session));
    }
    function clearSession(){
        localStorage.removeItem('ecom_session');
    }

    // Expose API
    window.StorageAPI = {
        keys: STORAGE_KEYS,
        get,
        set,
        seed,
        findUserByEmail,
        getSession,
        setSession,
        clearSession,
        getCart,
        setCart,
        getNotifications,
        addNotification,
        getReviews,
        addReview
    };

    // Run seed on script load
    seed();
})();
// auth.js – login, register, session handling
(function(){
    const storage = window.StorageAPI;
    const sessionKey = 'ecom_session';

    // Helper: hash password (simple base64 for demo, NOT secure)
    function simpleHash(pwd){
        return btoa(pwd);
    }

    // Register new user (role = customer or seller)
    function register({name,email,password,role}){
        const users = storage.get(storage.keys.users) || [];
        if(users.some(u=>u.email===email)){
            alert('Email already exists');
            return false;
        }
        const newUser = {
            id: 'u-' + crypto.randomUUID(),
            name,
            email,
            password: simpleHash(password),
            role,
        };
        users.push(newUser);
        storage.set(storage.keys.users, users);
        alert('Registration successful. You can now log in.');
        window.location.href = 'login.html';
        return true;
    }

    // Login – verifies email/password
    function login(email,password){
        const users = storage.get(storage.keys.users) || [];
        const user = users.find(u=>u.email===email);
        if(!user){ alert('No account found'); return false; }
        if(user.password !== simpleHash(password)){
            alert('Incorrect password');
            return false;
        }
        const session = {userId:user.id, role:user.role, name:user.name, email:user.email};
        storage.setSession(session);
        // redirect based on role
        if(user.role==='admin') window.location.href='admin/dashboard.html';
        else if(user.role==='seller') window.location.href='seller/dashboard.html';
        else window.location.href='customer/dashboard.html';
        return true;
    }

    // Helper to enforce role on a page
    function requireRole(allowedRoles){
        const sess = storage.getSession();
        if(!sess || !allowedRoles.includes(sess.role)){
            alert('Access denied. Please log in with appropriate account.');
            window.location.href='login.html';
            return false;
        }
        return true;
    }

    // expose API
    window.Auth = {register, login, requireRole, getSession:()=>storage.getSession()};
})();
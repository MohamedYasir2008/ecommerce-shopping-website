// reports.js – simple sales summary for the logged‑in seller
(function(){
    const storage = window.StorageAPI;
    const sess = storage.getSession();
    if(!sess || sess.role!=='seller'){
        alert('Please log in as a seller');
        window.location.href='../login.html';
        return;
    }
    const orders = storage.get(storage.keys.orders) || [];
    const myOrders = orders.filter(o=>o.items.some(it=>it.sellerId===sess.userId));
    const totalRevenue = myOrders.reduce((sum,o)=>sum+o.total,0);
    const totalOrders = myOrders.length;
    document.getElementById('summary').innerHTML = `
        <p><strong>Total Orders:</strong> ${totalOrders}</p>
        <p><strong>Total Revenue:</strong> ₹${totalRevenue.toFixed(2)}</p>
        <p>(For a beginner project this is a static summary.)</p>
    `;
})();
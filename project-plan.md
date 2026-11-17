# Implementation Plan for Multi‑Vendor E‑Commerce Shopping Website

**Repository:** `https://github.com/MohamedYasir2008/ecommerce-shopping-website`
**Deployment:** GitHub Pages (static site)
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), LocalStorage, Chart.js, Font Awesome / Lucide, Google Fonts

---

## 1. Application Architecture Overview

- **Static Front‑End Only** – All pages are pure HTML/CSS/JS served from GitHub Pages. No server‑side code.
- **Routing** – Simple relative links; each HTML file represents a view. No SPA router, but shared JS modules provide common functionality.
- **Data Layer** – Central `data/` module (`app.js`) abstracts LocalStorage CRUD for:
  - Users (admin, seller, customer)
  - Products
  - Categories
  - Orders
  - Reviews & Wishlist
  - Sessions (current logged‑in user token)
- **Role‑Based UI** – UI components read the current session role and hide/show navigation items and pages accordingly.
- **Analytics** – Admin & seller dashboards use Chart.js to visualise sales, order status, product counts, etc.
- **Export** – CSV generation performed client‑side via Blob URLs.
- **Notification System** – Toast component for success/failure/validation messages.
- **Responsive Design System** – CSS custom properties (`--brand-color`, `--font-primary`, etc.) and utility classes for spacing, grids, and typography.
- **Asset Management** – `/assets/` folder stores images, icons, fonts.

---

## 2. Final Folder Structure

```
root/
│   README.md                # project overview, build & deploy instructions
│   index.html               # home page (public)
│   shop.html                # product listing (public)
│   product-details.html     # product details view (public)
│   categories.html          # category grid (public)
│   about.html               # static about page
│   contact.html             # static contact page
│   login.html               # auth page (public)
│   register.html            # registration page (public)
│   cart.html                # shopping cart (public)
│   checkout.html            # checkout flow (public)
│   order-success.html       # order confirmation
│   track-order.html         # order tracking page
│   404.html                 # custom not‑found page
│
├───admin/
│   │   dashboard.html
│   │   users.html            # manage customers
│   │   sellers.html          # manage sellers
│   │   customers.html        # view customers
│   │   categories.html       # CRUD categories
│   │   products.html         # view all products
│   │   product-approvals.html#pending
│   │   orders.html           # all orders
│   │   reports.html          # charts and CSV export
│   │   settings.html
│   │
│   └───assets/ (admin‑specific icons)
│
├───seller/
│   │   dashboard.html
│   │   products.html         # list own products
│   │   add-product.html
│   │   edit-product.html
│   │   orders.html
│   │   order-details.html
│   │   reports.html
│   │   profile.html
│   │
│   └───assets/ (seller icons)
│
├───customer/
│   │   dashboard.html
│   │   profile.html
│   │   orders.html
│   │   order-details.html
│   │   reviews.html
│   │   wishlist.html
│   │
│   └───assets/
│
├───assets/
│   │   logo.svg
│   │   banner.jpg
│   │   icons/ (Font Awesome / Lucide CDN fallback)
│   │   fonts/ (Google Fonts local fallback)
│   │   placeholder-product.jpg
│   │
│   └───img/ (product images – uploaded by sellers, stored in repo for demo)
│
├───css/
│   │   style.css            # global stylesheet + design system
│   │   admin.css            # admin overrides (optional)
│   │   seller.css           # seller overrides
│   │   customer.css         # customer overrides
│   │   components.css       # reusable UI components (cards, tables, toast)
│
├───js/
│   │   app.js               # core data layer, utilities, routing helpers
│   │   auth.js              # login/register, session management
│   │   ui.js                # toast, modal, confirmation dialogs
│   │   cart.js              # cart CRUD + UI sync
│   │   checkout.js          # checkout flow, payment simulation
│   │   admin.js             # admin dashboard logic, approvals, charts
│   │   seller.js            # seller CRUD, order handling, CSV export
│   │   customer.js          # customer browsing, reviews, wishlist
│   │   analytics.js         # Chart.js wrappers
│   │   validation.js        # form validation helpers
│
└───data/                     # optional JSON seed files for demo data
    │   categories.json
    │   products-demo.json
    │   users-demo.json
```

---

## 3. Page Inventory

| Area | Pages | Primary Purpose |
|------|-------|-----------------|
| **Public** | `index.html`, `shop.html`, `product-details.html`, `categories.html`, `about.html`, `contact.html`, `login.html`, `register.html`, `cart.html`, `checkout.html`, `order-success.html`, `track-order.html`, `404.html` | Landing, browsing, authentication, cart & checkout flow |
| **Customer** | `customer/dashboard.html`, `customer/profile.html`, `customer/orders.html`, `customer/order-details.html`, `customer/reviews.html`, `customer/wishlist.html` | Account management, order history, review submission |
| **Seller** | `seller/dashboard.html`, `seller/products.html`, `seller/add-product.html`, `seller/edit-product.html`, `seller/orders.html`, `seller/order-details.html`, `seller/reports.html`, `seller/profile.html` | Product CRUD, order processing, sales analytics |
| **Administrator** | `admin/dashboard.html`, `admin/users.html`, `admin/sellers.html`, `admin/customers.html`, `admin/categories.html`, `admin/products.html`, `admin/product-approvals.html`, `admin/orders.html`, `admin/reports.html`, `admin/settings.html` | User management, approvals, site‑wide analytics |

---

## 4. LocalStorage Data Models & Relationships

```json
// users
{
  "users": [
    {
      "id": "u-<uuid>",
      "role": "admin|seller|customer",
      "email": "...",
      "passwordHash": "...", // simple base64‑encoded SHA‑256 for demo
      "name": "...",
      "profile": { /* extra fields per role */ }
    }
  ]
}

// categories
{
  "categories": [
    { "id": "c-1", "name": "Electronics", "image": "assets/img/categories/electronics.jpg" }
  ]
}

// products
{
  "products": [
    {
      "id": "p-<uuid>",
      "sellerId": "u-<seller uuid>",
      "categoryId": "c-1",
      "name": "Smartphone X",
      "brand": "BrandCo",
      "description": "...",
      "price": 199.99,
      "originalPrice": 249.99,
      "stock": 45,
      "images": ["assets/img/products/xyz1.jpg"],
      "rating": 4.3,
      "reviewCount": 12,
      "createdAt": "2026‑11‑01T12:34:00Z",
      "status": "pending|approved|rejected|out_of_stock",
      "rejectionRemarks": "..."
    }
  ]
}

// orders
{
  "orders": [
    {
      "orderId": "ORD-<timestamp>-<random>",
      "customerId": "u-<customer uuid>",
      "sellerId": "u-<seller uuid>",
      "items": [
        { "productId": "p-...", "quantity": 2, "price": 199.99 }
      ],
      "total": 399.98,
      "paymentMethod": "UPI|CARD|COD",
      "paymentStatus": "paid|pending",
      "deliveryStatus": "packed|shipped|delivered|cancelled",
      "deliveryAddress": { "name": "...", "street": "...", "city": "...", "state": "...", "pin": "..." },
      "orderDate": "2026‑11‑15T09:20:00Z"
    }
  ]
}

// reviews
{
  "reviews": [
    {
      "id": "r-<uuid>",
      "productId": "p-...",
      "customerId": "u-...",
      "rating": 5,
      "comment": "Excellent product!",
      "date": "2026‑11‑16"
    }
  ]
}

// wishlist (per customer)
{
  "wishlists": {
    "u-<customer uuid>": ["p-1", "p-23"]
  }
}
```

**Relationships** are resolved in JavaScript by cross‑referencing IDs (e.g., product → seller, order → customer). All CRUD operations update the corresponding LocalStorage keys and re‑render the UI.

---

## 5. Authentication & Role‑Based Navigation

1. **Registration** – `register.html` collects name, email, password, role (customer or seller). Admin accounts are pre‑seeded in the demo data.
2. **Login** – `login.html` validates credentials against `users` in LocalStorage, creates a **session object**:
   ```js
   session = { userId, role, name, token: crypto.randomUUID() };
   localStorage.setItem('session', JSON.stringify(session));
   ```
3. **Protected Pages** – Each protected HTML file includes `auth.js` which runs on load:
   - Reads `session`.
   - If missing or role mismatch, redirects to `login.html`.
4. **Navigation Bar** – Built dynamically in `ui.js` based on `session.role`:
   - Admin → admin links.
   - Seller → seller links.
   - Customer → customer links + cart/wishlist.
5. **Logout** – Clears `session` and redirects to home.

---

## 6. Product Submission & Admin Approval Workflow

1. **Seller adds product** via `seller/add-product.html` – form data saved to `products` with `status: "pending"`.
2. **Admin Dashboard** – `admin/product-approvals.html` lists pending items with:
   - Approve button → sets `status: "approved"`.
   - Reject button → opens modal for rejection remarks, sets `status: "rejected"` and stores `rejectionRemarks`.
3. **Visibility Logic** – Public product listings (`shop.html`, `product-details.html`) render only items where `status === "approved" && stock > 0`.
4. **Seller View** – `seller/products.html` shows all own products with a status badge and, if rejected, displays `rejectionRemarks`.
5. **Notification** – When admin changes status, a toast notifies the seller on next page load (checked via a small “notifications” array in LocalStorage).

---

## 7. Shopping Cart, Checkout & Payment Simulation

- **Cart Model** – Stored under key `cart_<customerId>` as an array of `{ productId, quantity }`.
- **Cart UI** – `cart.html` reads the model, validates stock, calculates:
  - Sub‑total = Σ(price * qty)
  - Delivery charge = flat rate (e.g., ₹50) or free over a threshold.
  - Discount coupons – demo codes (`SAVE10`, `WELCOME5`) applied via simple lookup.
- **Checkout Flow** – `checkout.html` collects delivery info, chooses payment method.
  - **UPI / Card** – Simulated async success after 1‑2 s using `setTimeout` → toast *Payment Successful*.
  - **COD** – Immediate order creation with `paymentStatus: "pending"`.
- **Order Creation** – On successful payment, an order object is pushed to `orders`, stock is decremented, cart cleared, and user is redirected to `order-success.html` showing the generated `orderId`.

---

## 8. Order Management & Stock Updates

- **Customer Order History** – `customer/orders.html` lists orders filtered by status/date; clicking leads to `customer/order-details.html`.
- **Seller Order View** – `seller/orders.html` shows orders for products belonging to the seller; allows status updates (packed → shipped → delivered).
- **Admin Order Overview** – `admin/orders.html` displays all orders with global filters.
- **Stock Logic** – When an order is placed, the product’s `stock` is reduced. If stock reaches 0, product status automatically becomes `out_of_stock` (still approved, but hidden from customers). Restocking via edit‑product form updates `stock` and re‑enables visibility.

---

## 9. Reviews, Ratings & Wishlist

- **Review Submission** – After an order reaches `delivered`, `customer/reviews.html` shows a form to rate (1‑5 stars) and comment. Submitting creates a `review` entry, updates product’s average rating & `reviewCount`.
- **Display** – Product cards show star rating and count; product‑detail page lists recent reviews.
- **Wishlist** – Customers can click the heart icon on any product → adds product ID to `wishlists[customerId]`. `customer/wishlist.html` lists saved items with quick‑add‑to‑cart buttons.
- **Persistence** – All lists stored in LocalStorage; UI updates on each change.

---

## 10. Admin & Seller Analytics

- **Admin Dashboard (`admin/dashboard.html`)** – Uses Chart.js to plot:
  - Total sales over time.
  - Orders per status.
  - New users per week.
  - Top‑selling categories.
- **Seller Dashboard (`seller/dashboard.html`)** – Charts for:
  - Sales by product.
  - Monthly revenue.
  - Order status breakdown.
- Data is derived from the `orders` and `products` arrays on the client side.

---

## 11. CSV Export & Notifications

- **Export** – Seller report page provides a "Export CSV" button. Clicking runs a small utility that converts the current filtered order list into a CSV string, creates a Blob, and triggers a download (`seller-reports-<date>.csv`).
- **Toast Notifications** – Central `ui.js` component displays non‑blocking messages for actions like:
  - "Product added successfully. Pending approval."
  - "Order placed!"
  - "CSV exported."
- **Confirmation Dialogs** – Before destructive actions (delete product, cancel order) a modal asks for confirmation.

---

## 12. Responsive UI Design System

- **CSS Custom Properties** – Defined in `css/style.css`:
  ```css
  :root {
    --brand-color: #0D6EFD;   /* primary blue */
    --bg-color: #ffffff;
    --text-primary: #212529;
    --text-muted: #6c757d;
    --spacing-unit: 0.5rem;
    --border-radius: 4px;
    --transition-speed: 0.2s;
  }
  ```
- **Grid Layout** – CSS Grid for product listings (`grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));`).
- **Utility Classes** – `.mt-1`, `.p-2`, `.text-center`, `.btn-primary`, `.badge`, etc.
- **Media Queries** – Breakpoints at 576 px, 768 px, 992 px, 1200 px to adapt navbar, sidebars, and card layouts.
- **Accessibility** – Semantic HTML, focus outlines, ARIA labels for icons, sufficient colour contrast.
- **Icons** – Font Awesome CDN (or Lucide) for cart, wishlist, admin tools.
- **Fonts** – Google Fonts "Roboto" for body, "Montserrat" for headings.

---

## 13. GitHub Pages Deployment Process

1. **Repository Setup** – Create repo `ecommerce-shopping-website` under the provided GitHub account.
2. **Branch** – Use `main` branch; GitHub Pages source = `main` (root folder).
3. **Commit** – All files from the structure above are committed.
4. **Build** – No build step needed (static). Optionally run a script that copies demo seed JSON into `data/`.
5. **Enable Pages** – In repo settings, enable GitHub Pages → `https://MohamedYasir2008.github.io/ecommerce-shopping-website/`.
6. **CNAME (optional)** – If a custom domain is later desired, add `CNAME` file.
7. **Continuous Update** – After each implementation phase, push to `main`; GitHub Pages automatically reflects changes.

---

## 14. Phased Implementation Plan

| Phase | Objectives | Files (create/modify) | Core Features | Dependencies | Testing & Acceptance |
|------|------------|-----------------------|--------------|--------------|----------------------|
| **0 – Setup** | Repo init, tooling, baseline assets | `README.md`, `.gitignore`, `assets/` (logos), `css/style.css`, `js/app.js`, `js/auth.js`, `js/ui.js` | Basic site skeleton, navigation bar, auth utilities | None | Verify repo visible on GitHub, run `index.html` locally, navigation works, theme colors applied. |
| **1 – Core Public Pages** | Home, shop, product details, 404, static pages | `index.html`, `shop.html`, `product-details.html`, `categories.html`, `about.html`, `contact.html`, `404.html` | Featured product grid, category cards, search bar, pagination (client‑side), product detail modal | Data seed (`data/categories.json`, `data/products-demo.json`) | All products displayed correctly, links open correct pages, responsive layout at 3 breakpoints. |
| **2 – Authentication & Role Guard** | Register, login, session, role‑based navbar | `login.html`, `register.html`, updates to `ui.js`, `auth.js`, navigation generation | Secure (hash) password storage, redirects on unauthorized access, role‑specific nav items | `admin/`, `seller/`, `customer/` folders exist (empty) | Login works for demo admin, new seller, new customer; attempting to open protected pages redirects to login. |
| **3 – Admin Dashboard & Approvals** | User management, category CRUD, product approvals, analytics | `admin/dashboard.html`, `admin/users.html`, `admin/categories.html`, `admin/product-approvals.html`, `js/admin.js`, `js/analytics.js` | Approve/reject workflow, chart visualisations for sales/users, CRUD for categories | Phase 2 (auth) + `Chart.js` CDN | Admin can approve a pending product and it instantly appears on shop page; charts display correct data. |
| **4 – Seller Dashboard & Product CRUD** | Seller product lifecycle, order view, CSV export | `seller/dashboard.html`, `seller/products.html`, `seller/add-product.html`, `seller/edit-product.html`, `seller/orders.html`, `seller/reports.html`, `js/seller.js` | Add/edit/delete products (status set to pending), upload image (via `<input type=file>` → FileReader base64), export orders CSV, order status updates | Phases 2‑3 (auth + admin approvals) | Seller can create a product, see it pending, admin approves, product appears for customers; CSV download works; order status changes reflect in UI. |
| **5 – Customer Experience** | Browse, search/filters, wishlist, cart, checkout, order history | `shop.html` (filter UI), `cart.html`, `checkout.html`, `order-success.html`, `track-order.html`, `customer/dashboard.html`, `customer/orders.html`, `customer/reviews.html`, `customer/wishlist.html`, `js/customer.js`, `js/cart.js`, `js/checkout.js` | Search by name, price range, category; sort; rating filter; wishlist add/remove; persistent cart; coupon demo; simulated payments; order tracking | Phases 1‑4 (public pages, auth, seller flow) | Customer can add items to cart, checkout with any payment method, see order confirmation, view order in history, track status, submit a review after delivery. |
| **6 – Reviews, Ratings & Wishlist** | Review submission, rating aggregation, wishlist UI | `js/review.js` (or integrated in `customer.js`), update `product-details.html` & cards to show stars | Average rating auto‑updates, wishlist persists across sessions | Phase 5 | Reviews appear under product, rating stars reflect average, wishlist page lists saved items. |
| **7 – Final polish & Accessibility** | Responsive refinements, toast & modal design, form validation, SEO meta tags | Update all CSS utility classes, `validation.js`, add ARIA attributes, improve loading placeholders | Consistent hover effects, loading spinners for async actions, mobile‑first navigation drawer | All previous phases | WCAG colour contrast ≥ 4.5:1, keyboard navigation works, no console errors, pages pass Lighthouse mobile performance > 90. |
| **8 – Deployment & Documentation** | GitHub Pages enable, README with usage guide, deployment script | `README.md` (install steps, demo credentials), optional `deploy.sh` (git push shortcut) | Deploy URL reachable, README shows how to run locally (`npm i -g http-server` optional) | Completed codebase | Visiting `https://MohamedYasir2008.github.io/ecommerce-shopping-website/` loads the home page; all links functional; README matches repository.

---

## 15. Master Checklist (All Requirements Covered)

- [ ] **Roles** – Admin, Seller, Customer with separate dashboards.
- [ ] **Admin Features** – User management, category CRUD, product approvals, sales reports, CSV export.
- [ ] **Seller Features** – Product CRUD (auto pending), image upload, order handling, status updates, analytics, CSV export.
- [ ] **Customer Features** – Registration/login, product browse, search/filters, sort, rating, wishlist, cart, checkout, simulated payments, order tracking, review system.
- [ ] **Data Persistence** – All entities stored in LocalStorage; demo seed data provided.
- [ ] **Approval Workflow** – Pending → Approved/Rejected with remarks.
- [ ] **Stock Management** – Quantity checks, out‑of‑stock handling, stock update on order.
- [ ] **Responsive UI** – Grid layout, mobile nav drawer, consistent design system.
- [ ] **Notifications** – Toasts, confirmation modals.
- [ ] **Analytics** – Chart.js dashboards for admin & seller.
- [ ] **CSV Export** – Seller reports downloadable.
- [ ] **Reviews & Ratings** – Post‑delivery rating, average rating display.
- [ ] **Wishlist** – Persistent per‑customer list.
- [ ] **Deployment** – Ready for GitHub Pages, README with steps.
- [ ] **No Backend** – Pure static assets, LocalStorage only.
- [ ] **No PHP/MySQL** – Confirmed.
- [ ] **GitHub Repo** – Target repo `ecommerce-shopping-website` under provided account.

---

**Next:** Review this `project-plan.md` artifact. Let me know if any phase needs adjustment, or if you’d like to start implementation of Phase 0.

---

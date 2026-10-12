/* =========================================================
   FlavorNest Restaurant Website
   Login, Signup, Menu, Cart, Checkout, Orders, Reservations,
   Reviews, Favourites and Theme
========================================================= */

"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE = {
  users: "flavornest_users_v2",
  session: "flavornest_session_v2",
  cart: "flavornest_cart_v2",
  orders: "flavornest_orders_v2",
  reviews: "flavornest_reviews_v2",
  reservations: "flavornest_reservations_v2",
  favorites: "flavornest_favorites_v2",
  theme: "flavornest_theme_v2"
};

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

function toast(message, type = "success") {
  const container = $("#toastContainer");

  if (!container) {
    alert(message);
    return;
  }

  const box = document.createElement("div");
  box.className = `toast ${type}`;
  box.textContent = message;
  container.append(box);

  setTimeout(() => box.remove(), 3600);
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36).slice(2, 7).toUpperCase()}`;
}

function currentUser() {
  return load(STORAGE.session, null);
}

/* =========================================================
   MENU DATA
========================================================= */

const dishes = [
  {id:1,name:"Crispy Veg Spring Rolls",category:"Starters",price:169,veg:true,rating:4.6,tag:"Bestseller",desc:"Crispy rolls filled with seasoned vegetables.",image:"photo-1544025162-d76694265947"},
  {id:2,name:"Paneer Tikka",category:"Starters",price:229,veg:true,rating:4.8,tag:"Chef's Pick",desc:"Smoky paneer cubes marinated in Indian spices.",image:"photo-1567188040759-fb8a883dc6d8"},
  {id:3,name:"Chicken 65",category:"Starters",price:249,veg:false,rating:4.7,tag:"Popular",desc:"Spicy, crisp chicken bites with curry leaves.",image:"photo-1603894584373-5ac82b2ae398"},
  {id:4,name:"Garlic Bread",category:"Italian",price:139,veg:true,rating:4.4,tag:"Classic",desc:"Toasted bread with garlic butter and herbs.",image:"photo-1573140247632-f8fd74997d5c"},
  {id:5,name:"Margherita Pizza",category:"Italian",price:299,veg:true,rating:4.7,tag:"Classic",desc:"Tomato, mozzarella and fresh basil.",image:"photo-1579751626657-72bc17010498"},
  {id:6,name:"Farmhouse Pizza",category:"Italian",price:379,veg:true,rating:4.8,tag:"Bestseller",desc:"A colourful mix of vegetables and cheese.",image:"photo-1513104890138-7c749659a591"},
  {id:7,name:"Creamy Alfredo Pasta",category:"Italian",price:289,veg:true,rating:4.6,tag:"Comfort Food",desc:"Creamy white sauce pasta with herbs.",image:"photo-1473093295043-cdd812d0e601"},
  {id:8,name:"Chicken Alfredo Pasta",category:"Italian",price:329,veg:false,rating:4.7,tag:"Popular",desc:"Creamy pasta tossed with tender chicken.",image:"photo-1551183053-bf91a1d81141"},
  {id:9,name:"Classic Veg Burger",category:"Fast Food",price:149,veg:true,rating:4.4,tag:"Quick Bite",desc:"Crispy vegetable patty with fresh toppings.",image:"photo-1520072959219-c595dc870360"},
  {id:10,name:"Double Cheese Burger",category:"Fast Food",price:219,veg:true,rating:4.7,tag:"Cheesy",desc:"A juicy stack with double melted cheese.",image:"photo-1568901346375-23c9450c58cd"},
  {id:11,name:"Chicken Burger",category:"Fast Food",price:229,veg:false,rating:4.6,tag:"Popular",desc:"Seasoned chicken patty with a soft bun.",image:"photo-1606755962773-d324e0a13086"},
  {id:12,name:"French Fries",category:"Fast Food",price:99,veg:true,rating:4.5,tag:"Side Dish",desc:"Golden fries with a pinch of seasoning.",image:"photo-1573080496219-bb080dd4f877"},
  {id:13,name:"Paneer Butter Masala",category:"Indian",price:269,veg:true,rating:4.8,tag:"Bestseller",desc:"Paneer in a rich, creamy tomato gravy.",image:"photo-1631452180519-c014fe946bc7"},
  {id:14,name:"Chicken Biryani",category:"Indian",price:299,veg:false,rating:4.9,tag:"House Favourite",desc:"Fragrant basmati rice with spiced chicken.",image:"photo-1563379091339-03246963d96c"},
  {id:15,name:"Veg Biryani",category:"Indian",price:229,veg:true,rating:4.6,tag:"Popular",desc:"Aromatic rice cooked with vegetables and spices.",image:"photo-1589302168068-964664d93dc0"},
  {id:16,name:"Masala Dosa",category:"Breakfast",price:99,veg:true,rating:4.8,tag:"Breakfast Pick",desc:"Crisp dosa filled with spiced potato masala.",image:"photo-1668236543090-82eba5ee5976"},
  {id:17,name:"Idli Sambar",category:"Breakfast",price:79,veg:true,rating:4.7,tag:"Light & Fresh",desc:"Soft steamed idlis served with sambar and chutney.",image:"photo-1589301760014-d929f3979dbc"},
  {id:18,name:"Poori Bhaji",category:"Breakfast",price:109,veg:true,rating:4.5,tag:"Comfort Food",desc:"Fluffy pooris served with potato curry.",image:"photo-1626132647523-66f5bf380027"},
  {id:19,name:"Vegetable Upma",category:"Breakfast",price:79,veg:true,rating:4.3,tag:"Light Bite",desc:"Warm semolina upma with vegetables and spices.",image:"photo-1601050690597-df0568f70950"},
  {id:20,name:"Pongal",category:"Breakfast",price:89,veg:true,rating:4.6,tag:"South Indian",desc:"Soft rice and lentil pongal with pepper and ghee.",image:"photo-1630383249896-424e482df921"},
  {id:21,name:"Aloo Paratha",category:"Breakfast",price:119,veg:true,rating:4.6,tag:"Filling",desc:"Whole-wheat flatbread stuffed with spiced potato.",image:"photo-1565557623262-b51c2513a641"},
  {id:22,name:"Pancakes",category:"Breakfast",price:159,veg:true,rating:4.5,tag:"Sweet Start",desc:"Fluffy pancakes with syrup and fresh fruit.",image:"photo-1528207776546-365bb710ee93"},
  {id:23,name:"Waffles",category:"Breakfast",price:179,veg:true,rating:4.5,tag:"Sweet Start",desc:"Golden waffles with a sweet topping.",image:"photo-1562376552-0d160a2f238d"},
  {id:24,name:"Veg Cheese Sandwich",category:"Fast Food",price:129,veg:true,rating:4.4,tag:"Quick Bite",desc:"Toasted sandwich with vegetables and melted cheese.",image:"photo-1528735602780-2552fd46c7af"},
  {id:25,name:"Chicken Wrap",category:"Fast Food",price:199,veg:false,rating:4.5,tag:"On the Go",desc:"A soft wrap filled with seasoned chicken and salad.",image:"photo-1626700051175-6818013e1d4f"},
  {id:26,name:"Veg Momos",category:"Fast Food",price:139,veg:true,rating:4.5,tag:"Street Favourite",desc:"Steamed vegetable dumplings with spicy dip.",image:"photo-1563245372-f21724e3856d"},
  {id:27,name:"Chicken Nuggets",category:"Fast Food",price:179,veg:false,rating:4.4,tag:"Crispy",desc:"Crispy golden chicken bites served with dip.",image:"photo-1562967914-608f82629710"},
  {id:28,name:"Loaded Nachos",category:"Fast Food",price:189,veg:true,rating:4.4,tag:"Shareable",desc:"Crunchy nachos topped with cheese and salsa.",image:"photo-1513456852971-30c0b8199d4d"},
  {id:29,name:"Chicken Tacos",category:"Fast Food",price:219,veg:false,rating:4.6,tag:"Fresh & Tasty",desc:"Tacos filled with seasoned chicken and fresh toppings.",image:"photo-1551504734-5ee1c4a1479b"},
  {id:30,name:"Chocolate Brownie",category:"Desserts",price:129,veg:true,rating:4.7,tag:"Sweet Treat",desc:"Rich chocolate brownie with a soft centre.",image:"photo-1606313564200-e75d5e30476c"},
  {id:31,name:"New York Cheesecake",category:"Desserts",price:189,veg:true,rating:4.8,tag:"Chef's Pick",desc:"Creamy cheesecake on a buttery crumb base.",image:"photo-1533134242443-d4fd215305ad"},
  {id:32,name:"Gulab Jamun",category:"Desserts",price:89,veg:true,rating:4.6,tag:"Indian Sweet",desc:"Soft milk-solid dumplings in fragrant syrup.",image:"photo-1666190092159-7e7c2f1f1d84"},
  {id:33,name:"Mango Smoothie",category:"Drinks",price:119,veg:true,rating:4.5,tag:"Refreshing",desc:"A creamy mango drink made for sunny days.",image:"photo-1509042239860-f550ce710b93"},
  {id:34,name:"Cold Coffee",category:"Drinks",price:129,veg:true,rating:4.6,tag:"Popular",desc:"Chilled coffee blended until smooth and creamy.",image:"photo-1461023058943-07fcbe16d735"},
  {id:35,name:"Fresh Lime Soda",category:"Drinks",price:79,veg:true,rating:4.3,tag:"Refreshing",desc:"A refreshing lime drink, sweet or salted.",image:"photo-1513558161293-cdaf765edfd7"}
];

let activeCategory = "All";
let selectedRating = 0;
let appliedCoupon = false;
let cart = load(STORAGE.cart, []);
let favorites = load(STORAGE.favorites, []);
let authMode = "login";

/* =========================================================
   AUTHENTICATION
========================================================= */

function requireLogin(message = "Please log in to continue.") {
  if (currentUser()) return true;

  $("#site").classList.add("hidden");
  $("#authGate").classList.remove("hidden");
  toast(message, "error");
  return false;
}

function showSite(user) {
  $("#authGate").classList.add("hidden");
  $("#site").classList.remove("hidden");

  $("#welcomeUser").textContent = `Hi, ${user.name.split(" ")[0]}`;

  cart = load(STORAGE.cart, []);

  renderMenu();
  renderCart();
  renderReviews();
  renderOrderHistory();

  toast(`Welcome back, ${user.name.split(" ")[0]}!`, "success");
}

function setAuthMode(mode) {
  authMode = mode;

  const signup = mode === "signup";

  $("#authNameGroup").classList.toggle("hidden", !signup);
  $("#authName").required = signup;
  $("#authPassword").autocomplete = signup
    ? "new-password"
    : "current-password";

  $("#authSubmit").textContent = signup
    ? "Create Account"
    : "Login and Explore";

  $("#gateTitle").textContent = signup
    ? "Create your account"
    : "Welcome to FlavorNest";

  $("#gateSubtitle").textContent = signup
    ? "Sign up to discover food you'll love."
    : "Log in to explore your favourite food, build your cart and place an order.";

  $("#authSwitchText").innerHTML = signup
    ? 'Already have an account? <button type="button" data-switch-auth="login">Login</button>'
    : 'New here? <button type="button" data-switch-auth="signup">Create an account</button>';

  $$(".auth-tab").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.authMode === mode
    );
  });
}

$("#authGate").addEventListener("click", event => {
  const tab = event.target.closest("[data-auth-mode]");
  const switchButton = event.target.closest("[data-switch-auth]");

  if (tab) setAuthMode(tab.dataset.authMode);

  if (switchButton) {
    setAuthMode(switchButton.dataset.switchAuth);
  }
});

$("#authForm").addEventListener("submit", async event => {
  event.preventDefault();

  const name = $("#authName").value.trim();
  const email = $("#authEmail").value.trim().toLowerCase();
  const password = $("#authPassword").value;

  const users = load(STORAGE.users, []);

  if (password.length < 6) {
    return toast(
      "Password must contain at least 6 characters.",
      "error"
    );
  }

  /* SIGNUP: create account but do not log the user in */
  if (authMode === "signup") {
    if (!name) {
      return toast("Please enter your name.", "error");
    }

    if (users.some(user => user.email === email)) {
      setAuthMode("login");
      $("#authEmail").value = email;

      return toast(
        "This email already has an account. Please log in.",
        "error"
      );
    }

    const passwordHash = await hashPassword(password, email);

    const user = {
      id: makeId("USER"),
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    save(STORAGE.users, users);

    // IMPORTANT: do not automatically create a login session.
    localStorage.removeItem(STORAGE.session);

    // Return to Login mode.
    $("#authForm").reset();
    setAuthMode("login");

    $("#site").classList.add("hidden");
    $("#authGate").classList.remove("hidden");

    // Prefill the registered email for convenience.
    $("#authEmail").value = email;
    $("#authPassword").value = "";

    toast(
      "Account created successfully! Please log in.",
      "success"
    );

    return;
  }

  /* LOGIN: verify credentials before opening the website */
  const user = users.find(user => user.email === email);

  if (!user) {
    $("#authEmail").value = email;

    return toast(
      "No account found for this email. Please sign up first.",
      "error"
    );
  }

  const passwordHash = await hashPassword(password, email);

  if (user.passwordHash !== passwordHash) {
    return toast(
      "Incorrect password. Please try again.",
      "error"
    );
  }

  save(STORAGE.session, {
    id: user.id,
    name: user.name,
    email: user.email
  });

  $("#authForm").reset();

  showSite(user);
});

async function hashPassword(password, salt) {
  if (window.crypto?.subtle && window.TextEncoder) {
    const bytes = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest("SHA-256", bytes);

    return [...new Uint8Array(digest)]
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  let hash = 0;

  for (const char of `${salt}:${password}`) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }

  return `fallback-${hash}`;
}

$("#logoutBtn").addEventListener("click", () => {
  closeCart();
  closeCheckout();

  localStorage.removeItem(STORAGE.session);

  $("#site").classList.add("hidden");
  $("#authGate").classList.remove("hidden");

  $("#authForm").reset();
  setAuthMode("login");

  toast("You have logged out.", "success");
});

/* =========================================================
   MENU
========================================================= */

function imageURL(imageId) {
  if (!imageId || imageId === "photo- smoothie") {
    return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80";
  }

  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=900&q=80`;
}

function renderMenu() {
  const query = $("#menuSearch").value.trim().toLowerCase();
  const vegOnly = $("#vegOnly").checked;

  let shown = dishes.filter(dish =>
    (activeCategory === "All" || dish.category === activeCategory) &&
    (!vegOnly || dish.veg) &&
    (!query ||
      `${dish.name} ${dish.category} ${dish.desc}`
        .toLowerCase()
        .includes(query))
  );

  const sort = $("#sortMenu").value;

  if (sort === "low") shown.sort((a, b) => a.price - b.price);
  if (sort === "high") shown.sort((a, b) => b.price - a.price);
  if (sort === "rating") shown.sort((a, b) => b.rating - a.rating);

  $("#menuGrid").innerHTML = shown.map(dish => `
    <article class="food-card">
      <div class="food-image">
        <img
          src="${imageURL(dish.image)}"
          alt="${escapeHTML(dish.name)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/900x600/f7eee5/a2472e?text=FlavorNest'">

        <span class="food-tag">${escapeHTML(dish.tag)}</span>

        <button
          class="favorite-btn ${favorites.includes(dish.id) ? "favorited" : ""}"
          data-favorite="${dish.id}"
          type="button"
          aria-label="Toggle ${escapeHTML(dish.name)} favourite">
          ${favorites.includes(dish.id) ? "♥" : "♡"}
        </button>
      </div>

      <div class="food-card-content">
        <div class="food-card-heading">
          <h3>${escapeHTML(dish.name)}</h3>
          <span class="dish-rating">★ ${dish.rating.toFixed(1)}</span>
        </div>

        <p class="dish-category">
          ${escapeHTML(dish.category)} ·
          ${dish.veg ? "Vegetarian" : "Non-vegetarian"}
        </p>

        <p class="dish-description">
          ${escapeHTML(dish.desc)}
        </p>

        <div class="food-card-footer">
          <strong class="dish-price">${money(dish.price)}</strong>

          <div class="dish-actions">
            <button
              class="details-btn"
              data-details="${dish.id}"
              type="button">
              Details
            </button>

            <button
              class="add-to-cart"
              data-add="${dish.id}"
              type="button">
              Add +
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  $("#emptyMenu").classList.toggle("hidden", shown.length !== 0);
}

$("#menuSearch").addEventListener("input", renderMenu);
$("#sortMenu").addEventListener("change", renderMenu);
$("#vegOnly").addEventListener("change", renderMenu);

$("#categoryFilters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;

  $$(".filter-btn").forEach(item => {
    item.classList.toggle("active", item === button);
  });

  renderMenu();
});

$("#menuGrid").addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-favorite]");
  const addButton = event.target.closest("[data-add]");
  const detailsButton = event.target.closest("[data-details]");

  if (favoriteButton) {
    if (!requireLogin("Please log in to save favourites.")) return;

    const id = Number(favoriteButton.dataset.favorite);

    favorites = favorites.includes(id)
      ? favorites.filter(itemId => itemId !== id)
      : [...favorites, id];

    save(STORAGE.favorites, favorites);
    renderMenu();

    toast(
      favorites.includes(id)
        ? "Added to your favourites."
        : "Removed from favourites."
    );
  }

  if (addButton) {
    if (!requireLogin("Please log in before adding food to your cart.")) {
      return;
    }

    addToCart(Number(addButton.dataset.add));
  }

  if (detailsButton) {
    const dish = dishes.find(
      item => item.id === Number(detailsButton.dataset.details)
    );

    if (dish) toast(`${dish.name}: ${dish.desc}`);
  }
});

/* =========================================================
   CART
========================================================= */

function addToCart(id) {
  const dish = dishes.find(item => item.id === id);
  if (!dish) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }

  save(STORAGE.cart, cart);
  renderCart();

  toast(`${dish.name} added to your cart.`);
}

function updateQty(id, delta) {
  const item = cart.find(cartItem => cartItem.id === id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter(cartItem => cartItem.id !== id);
  }

  save(STORAGE.cart, cart);
  renderCart();
}

function subtotal() {
  return cart.reduce((sum, item) => {
    const dish = dishes.find(product => product.id === item.id);
    return sum + (dish?.price || 0) * item.qty;
  }, 0);
}

function discountAmount() {
  return appliedCoupon ? subtotal() * 0.10 : 0;
}

function taxAmount() {
  return Math.max(0, subtotal() - discountAmount()) * 0.05;
}

function totalAmount() {
  return Math.max(0, subtotal() - discountAmount()) + taxAmount();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  $("#cartCount").textContent = count;

  $("#cartItems").innerHTML = cart.length
    ? cart.map(item => {
        const dish = dishes.find(product => product.id === item.id);
        if (!dish) return "";

        return `
          <div class="cart-item">
            <img
              src="${imageURL(dish.image)}"
              alt="${escapeHTML(dish.name)}">

            <div class="cart-item-info">
              <h4>${escapeHTML(dish.name)}</h4>
              <strong>${money(dish.price)}</strong>

              <div class="quantity-controls">
                <button
                  type="button"
                  data-qty="${dish.id}"
                  data-delta="-1"
                  aria-label="Decrease quantity">−</button>

                <span>${item.qty}</span>

                <button
                  type="button"
                  data-qty="${dish.id}"
                  data-delta="1"
                  aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div class="cart-item-end">
              <strong>${money(dish.price * item.qty)}</strong>

              <button
                class="remove-cart-item"
                type="button"
                data-remove="${dish.id}">
                Remove
              </button>
            </div>
          </div>
        `;
      }).join("")
    : `
      <div class="cart-empty">
        <p style="font-size:38px">🛍</p>
        <h3>Your cart is empty</h3>
        <p>Find your favourite food and add it here.</p>
      </div>
    `;

  $("#cartSubtotal").textContent = money(subtotal());
  $("#cartDiscount").textContent = `−${money(discountAmount())}`;
  $("#cartTax").textContent = money(taxAmount());
  $("#cartTotal").textContent = money(totalAmount());

  $("#checkoutBtn").disabled = cart.length === 0;
  $("#checkoutBtn").style.opacity = cart.length ? "1" : ".5";

  if (!cart.length) {
    appliedCoupon = false;
    $("#couponMessage").textContent = "";
  }
}

function openCart() {
  if (!requireLogin()) return;

  $("#overlay").classList.remove("hidden");
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");

  if ($("#checkoutModal").classList.contains("hidden")) {
    $("#overlay").classList.add("hidden");
    document.body.classList.remove("modal-open");
  }
}

$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);

$("#overlay").addEventListener("click", () => {
  closeCart();
  closeCheckout();
});

$("#cartItems").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    updateQty(
      Number(quantityButton.dataset.qty),
      Number(quantityButton.dataset.delta)
    );
  }

  if (removeButton) {
    cart = cart.filter(
      item => item.id !== Number(removeButton.dataset.remove)
    );

    save(STORAGE.cart, cart);
    renderCart();
  }
});

$("#applyCoupon").addEventListener("click", () => {
  const coupon = $("#couponInput").value.trim().toUpperCase();

  if (coupon === "FLAVOR10") {
    if (subtotal() <= 0) {
      return toast("Add items before applying a coupon.", "error");
    }

    appliedCoupon = true;
    $("#couponMessage").textContent =
      "FLAVOR10 applied: 10% off your subtotal.";

    renderCart();
    toast("Coupon applied!");
  } else {
    appliedCoupon = false;
    $("#couponMessage").textContent = "Invalid coupon. Try FLAVOR10.";

    renderCart();
  }
});

$("#copyCoupon").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("FLAVOR10");
    toast("Coupon copied: FLAVOR10");
  } catch {
    $("#couponInput").value = "FLAVOR10";
    toast("Coupon code: FLAVOR10");
  }
});

/* =========================================================
   CHECKOUT
========================================================= */

function openCheckout() {
  if (!requireLogin()) return;

  if (!cart.length) {
    return toast("Your cart is empty.", "error");
  }

  $("#checkoutTotal").textContent = money(totalAmount());

  const user = currentUser();
  $("#deliveryName").value = user?.name || "";

  $("#checkoutModal").classList.remove("hidden");
  $("#overlay").classList.remove("hidden");

  document.body.classList.add("modal-open");
}

function closeCheckout() {
  $("#checkoutModal").classList.add("hidden");

  if (!$("#cartDrawer").classList.contains("open")) {
    $("#overlay").classList.add("hidden");
    document.body.classList.remove("modal-open");
  }
}

$("#checkoutBtn").addEventListener("click", openCheckout);
$("#checkoutClose").addEventListener("click", closeCheckout);

$("#paymentMethod").addEventListener("change", () => {
  const upi = $("#paymentMethod").value === "upi";

  $("#paymentNote").textContent = upi
    ? "PhonePe / UPI selected. Real payment verification requires a merchant UPI ID and payment gateway."
    : "Pay in cash when your order is delivered.";

  $("#placeOrderBtn").textContent = upi
    ? "Open UPI App"
    : "Place Order";
});

$("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!requireLogin()) return;

  if (!cart.length) {
    return toast("Your cart is empty.", "error");
  }

  const method = $("#paymentMethod").value;

  if (method === "upi") {
    const upiId = "YOUR_MERCHANT_UPI_ID";

    if (upiId === "YOUR_MERCHANT_UPI_ID") {
      return toast(
        "Configure your merchant UPI ID and payment gateway first.",
        "error"
      );
    }

    const amount = totalAmount().toFixed(2);
    const note = encodeURIComponent("FlavorNest food order");

    window.location.href =
      `upi://pay?pa=${encodeURIComponent(upiId)}` +
      `&pn=${encodeURIComponent("FlavorNest")}` +
      `&am=${amount}&cu=INR&tn=${note}`;

    return;
  }

  const user = currentUser();

  const order = {
    orderId: `FN${Date.now().toString().slice(-8)}`,
    userId: user.id,
    customer: $("#deliveryName").value.trim(),
    phone: $("#deliveryPhone").value.trim(),
    address: $("#deliveryAddress").value.trim(),
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pay on delivery",
    status: "Order placed",

    items: cart.map(item => {
      const dish = dishes.find(product => product.id === item.id);

      return {
        id: item.id,
        name: dish.name,
        price: dish.price,
        qty: item.qty
      };
    }),

    subtotal: subtotal(),
    discount: discountAmount(),
    tax: taxAmount(),
    total: totalAmount(),
    createdAt: new Date().toISOString()
  };

  const orders = load(STORAGE.orders, []);

  orders.unshift(order);
  save(STORAGE.orders, orders);

  cart = [];
  save(STORAGE.cart, cart);

  appliedCoupon = false;

  $("#couponInput").value = "";
  $("#couponMessage").textContent = "";

  renderCart();
  closeCheckout();
  closeCart();

  $("#checkoutForm").reset();

  renderOrderHistory();

  toast(
    `Thank you for your order! Your order number is ${order.orderId}.`,
    "success"
  );

  setTimeout(() => {
    $("#orderHistory").scrollIntoView({ behavior: "smooth" });
  }, 500);
});

/* =========================================================
   ORDER HISTORY — UPDATED EMPTY STATE
========================================================= */

function renderOrderHistory() {
  const container = $("#orderHistoryList");

  if (!container) return;

  const user = currentUser();

  if (!user) {
    container.innerHTML = "";
    return;
  }

  const orders = load(STORAGE.orders, [])
    .filter(order => order.userId === user.id);

  if (!orders.length) {
    container.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon" aria-hidden="true">🧾</div>

        <h3>No orders yet</h3>

        <p>Your placed orders will appear here.</p>

        <a href="#menu" class="explore-menu-btn">
          Explore Menu
        </a>
      </div>
    `;

    return;
  }

  container.innerHTML = orders.map(order => {
    const date = new Date(order.createdAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const itemsText = order.items
      .map(item => `${escapeHTML(item.name)} × ${item.qty}`)
      .join(" · ");

    return `
      <article class="history-card">
        <div class="history-card-head">
          <div>
            <p class="eyebrow">
              ORDER ${escapeHTML(order.orderId)}
            </p>

            <h3>${money(order.total)}</h3>

            <p class="small-note">${escapeHTML(date)}</p>
          </div>

          <span class="order-status">
            ${escapeHTML(order.status)}
          </span>
        </div>

        <p class="history-items">${itemsText}</p>

        <p class="small-note">
          Payment: ${escapeHTML(order.paymentMethod)}
          · ${escapeHTML(order.paymentStatus)}
        </p>

        <p class="small-note">
          Delivery: ${escapeHTML(order.address)}
        </p>
      </article>
    `;
  }).join("");
}

/* =========================================================
   RESERVATIONS
========================================================= */

function setMinimumReservationDate() {
  const now = new Date();

  $("#resDate").min =
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, "0")}-` +
    `${String(now.getDate()).padStart(2, "0")}`;
}

setMinimumReservationDate();

$("#reservationForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!requireLogin()) return;

  const form = new FormData(event.currentTarget);

  const reservation = {
    id: makeId("RES"),
    userId: currentUser().id,
    name: String(form.get("name")).trim(),
    phone: String(form.get("phone")).trim(),
    date: String(form.get("date")),
    time: String(form.get("time")),
    guests: String(form.get("guests")),
    createdAt: new Date().toISOString()
  };

  const reservations = load(STORAGE.reservations, []);

  reservations.unshift(reservation);
  save(STORAGE.reservations, reservations);

  event.currentTarget.reset();
  setMinimumReservationDate();

  toast(
    `Reservation request saved for ${reservation.date} at ${reservation.time}.`,
    "success"
  );
});

/* =========================================================
   FEEDBACK AND REVIEWS
========================================================= */

$("#starRating").addEventListener("click", event => {
  const button = event.target.closest("[data-rating]");
  if (!button) return;

  selectedRating = Number(button.dataset.rating);

  $$("#starRating button").forEach(star => {
    const selected = Number(star.dataset.rating) <= selectedRating;

    star.classList.toggle("selected", selected);
    star.setAttribute("aria-pressed", String(selected));
  });
});

$("#feedbackForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!requireLogin()) return;

  if (!selectedRating) {
    return toast("Please select a star rating.", "error");
  }

  const name = $("#reviewer").value.trim();
  const reviewText = $("#review").value.trim();

  if (!name || !reviewText) {
    return toast("Please complete your name and feedback.", "error");
  }

  const reviews = load(STORAGE.reviews, []);

  reviews.unshift({
    id: makeId("REV"),
    userId: currentUser().id,
    name,
    text: reviewText,
    rating: selectedRating,
    createdAt: new Date().toISOString()
  });

  save(STORAGE.reviews, reviews.slice(0, 50));

  event.currentTarget.reset();
  selectedRating = 0;

  $$("#starRating button").forEach(star => {
    star.classList.remove("selected");
    star.setAttribute("aria-pressed", "false");
  });

  renderReviews();

  toast("Thank you for sharing your feedback!");
});

function renderReviews() {
  const reviews = load(STORAGE.reviews, []);

  if (!reviews.length) {
    $("#reviewsList").innerHTML = `
      <div class="review-placeholder">
        <div class="empty-star">☆</div>
        <p>Your review could be the first one. Share your experience with us!</p>
      </div>
    `;

    return;
  }

  $("#reviewsList").innerHTML = reviews.slice(0, 10).map(review => `
    <article class="review-card">
      <div class="review-card-head">
        <div class="review-avatar">
          ${escapeHTML(review.name.trim().charAt(0).toUpperCase())}
        </div>

        <div>
          <strong>${escapeHTML(review.name)}</strong>

          <div class="small-note">
            ${escapeHTML(
              new Date(review.createdAt).toLocaleDateString("en-IN")
            )}
          </div>
        </div>
      </div>

      <div class="review-stars" aria-label="${review.rating} out of 5 stars">
        ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
      </div>

      <p>${escapeHTML(review.text)}</p>
    </article>
  `).join("");
}

/* =========================================================
   THEME AND NAVIGATION
========================================================= */

$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  save(
    STORAGE.theme,
    document.body.classList.contains("dark-mode")
  );
});

if (load(STORAGE.theme, false)) {
  document.body.classList.add("dark-mode");
}

$("#menuToggle").addEventListener("click", () => {
  $("#navLinks").classList.toggle("open");
});

$("#navLinks").addEventListener("click", event => {
  if (event.target.closest("a")) {
    $("#navLinks").classList.remove("open");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeCheckout();
  }
});

$("#year").textContent = new Date().getFullYear();

/* =========================================================
   INITIALIZATION
========================================================= */

setAuthMode("login");
renderCart();

if (currentUser()) {
  const users = load(STORAGE.users, []);
  const user = users.find(item => item.id === currentUser().id);

  if (user) {
    showSite(user);
  } else {
    localStorage.removeItem(STORAGE.session);

    $("#authGate").classList.remove("hidden");
    $("#site").classList.add("hidden");
  }
} else {
  $("#authGate").classList.remove("hidden");
  $("#site").classList.add("hidden");
}
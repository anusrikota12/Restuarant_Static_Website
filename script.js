"use strict";

// ---------- Helpers ----------

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function loadStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(message, type = "success") {
  const container = $("#toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function money(value) {
  return "₹" + Number(value || 0).toFixed(2);
}

function imageURL(id, width = 700) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}

// ---------- Application State ----------

let authMode = "login";
let currentUser = loadStored("flavornest-demo-session", null);

let selectedCategory = "All";
let selectedRating = 0;
let appliedCoupon = false;

let cart = [];
let favorites = [];

let demoUsers = loadStored("flavornest-demo-users", []);
let reviews = loadStored("flavornest-reviews", []);
let reservations = loadStored("flavornest-reservations", []);
let orders = loadStored("flavornest-orders", []);

function userKey(base) {
  return `${base}-${currentUser?.email || "guest"}`;
}

function loadUserData() {
  cart = loadStored(userKey("flavornest-cart"), []);
  favorites = loadStored(userKey("flavornest-favorites"), []);
}

function saveCart() {
  if (currentUser) saveStored(userKey("flavornest-cart"), cart);
}

function saveFavorites() {
  if (currentUser) saveStored(userKey("flavornest-favorites"), favorites);
}

function getUserOrders() {
  return orders.filter(order => order.email === currentUser?.email);
}

function getUserReservations() {
  return reservations.filter(
    reservation => reservation.email === currentUser?.email
  );
}

// ---------- Dish Data ----------

const dishes = [
  {
    id: 1, name: "Paneer Tikka", category: "Starters",
    price: 249, veg: true, rating: 4.8, tag: "Bestseller",
    desc: "Smoky paneer cubes with Indian spices.",
    image: "photo-1567188040759-fb8a883dc6d8"
  },
  {
    id: 2, name: "Veg Spring Rolls", category: "Starters",
    price: 179, veg: true, rating: 4.6, tag: "Crispy",
    desc: "Crunchy rolls filled with seasoned vegetables.",
    image: "photo-1606525437679-037aca74a3e5"
  },
  {
    id: 3, name: "Chicken Tikka", category: "Starters",
    price: 289, veg: false, rating: 4.8, tag: "Popular",
    desc: "Juicy chicken marinated with aromatic spices.",
    image: "photo-1599487488170-d11ec9c172f0"
  },
  {
    id: 4, name: "Crispy Corn", category: "Starters",
    price: 169, veg: true, rating: 4.5, tag: "Crunchy",
    desc: "Crispy golden corn with a spicy seasoning.",
    image: "photo-1630384060421-cb20d0e0649d"
  },
  {
    id: 5, name: "Butter Chicken", category: "Indian",
    price: 329, veg: false, rating: 4.9, tag: "Chef's Pick",
    desc: "Tender chicken in a creamy tomato gravy.",
    image: "photo-1603894584373-5ac82b2ae398"
  },
  {
    id: 6, name: "Paneer Butter Masala", category: "Indian",
    price: 279, veg: true, rating: 4.8, tag: "Bestseller",
    desc: "Soft paneer in a rich buttery tomato sauce.",
    image: "photo-1631452180519-c014fe946bc7"
  },
  {
    id: 7, name: "Veg Biryani", category: "Indian",
    price: 229, veg: true, rating: 4.6, tag: "Aromatic",
    desc: "Fragrant rice cooked with vegetables and spices.",
    image: "photo-1563379091339-03246963d51a"
  },
  {
    id: 8, name: "Chicken Biryani", category: "Indian",
    price: 299, veg: false, rating: 4.9, tag: "Bestseller",
    desc: "Aromatic basmati rice with spiced chicken.",
    image: "photo-1563379091339-03246963d51a"
  },
  {
    id: 9, name: "Masala Dosa", category: "Breakfast",
    price: 99, veg: true, rating: 4.8, tag: "South Indian",
    desc: "Crispy dosa with potato masala, chutney and sambar.",
    image: "photo-1668236543090-82eba5ee5976"
  },
  {
    id: 10, name: "Idli Sambar", category: "Breakfast",
    price: 79, veg: true, rating: 4.7, tag: "Light Meal",
    desc: "Soft steamed idlis served with hot sambar.",
    image: "photo-1589301760014-d929f3979dbc"
  },
  {
    id: 11, name: "Poori Bhaji", category: "Breakfast",
    price: 99, veg: true, rating: 4.6, tag: "Classic",
    desc: "Golden pooris with comforting potato curry.",
    image: "photo-1626132647523-66f5bf380027"
  },
  {
    id: 12, name: "Vegetable Upma", category: "Breakfast",
    price: 69, veg: true, rating: 4.4, tag: "Healthy",
    desc: "Warm semolina upma with vegetables and spices.",
    image: "photo-1606491956689-2ea866880c84"
  },
  {
    id: 13, name: "Ven Pongal", category: "Breakfast",
    price: 89, veg: true, rating: 4.6, tag: "Comfort Food",
    desc: "Creamy rice and lentils with pepper and cashews.",
    image: "photo-1630384060421-cb20d0e0649d"
  },
  {
    id: 14, name: "Aloo Paratha", category: "Breakfast",
    price: 119, veg: true, rating: 4.7, tag: "Filling",
    desc: "Stuffed paratha served with curd and pickle.",
    image: "photo-1626132647523-66f5bf380027"
  },
  {
    id: 15, name: "Pancakes", category: "Breakfast",
    price: 149, veg: true, rating: 4.5, tag: "Sweet Start",
    desc: "Fluffy pancakes with syrup and fresh fruit.",
    image: "photo-1528207776546-365bb710ee93"
  },
  {
    id: 16, name: "Waffles", category: "Breakfast",
    price: 169, veg: true, rating: 4.6, tag: "Sweet Start",
    desc: "Golden waffles with chocolate and fruit.",
    image: "photo-1562376552-0d160a2f238d"
  },
  {
    id: 17, name: "Margherita Pizza", category: "Italian",
    price: 249, veg: true, rating: 4.7, tag: "Classic",
    desc: "Mozzarella, tomato sauce and fresh basil.",
    image: "photo-1574071318508-1cdbab80d002"
  },
  {
    id: 18, name: "Farmhouse Pizza", category: "Italian",
    price: 329, veg: true, rating: 4.8, tag: "Popular",
    desc: "Pizza topped with vegetables and cheese.",
    image: "photo-1513104890138-7c749659a591"
  },
  {
    id: 19, name: "Alfredo Pasta", category: "Italian",
    price: 259, veg: true, rating: 4.6, tag: "Creamy",
    desc: "Pasta tossed in a creamy white sauce.",
    image: "photo-1473093295043-cdd812d0e601"
  },
  {
    id: 20, name: "Chicken Pasta", category: "Italian",
    price: 299, veg: false, rating: 4.7, tag: "Rich Flavour",
    desc: "Pasta with tender chicken and herbs.",
    image: "photo-1473093295043-cdd812d0e601"
  },
  {
    id: 21, name: "Veg Cheese Burger", category: "Fast Food",
    price: 139, veg: true, rating: 4.5, tag: "Quick Bite",
    desc: "A vegetable patty with cheese and fresh lettuce.",
    image: "photo-1568901346375-23c9450c58cd"
  },
  {
    id: 22, name: "Chicken Burger", category: "Fast Food",
    price: 179, veg: false, rating: 4.7, tag: "Bestseller",
    desc: "Juicy chicken patty with a delicious sauce.",
    image: "photo-1568901346375-23c9450c58cd"
  },
  {
    id: 23, name: "French Fries", category: "Fast Food",
    price: 99, veg: true, rating: 4.5, tag: "Crispy",
    desc: "Golden fries with your choice of seasoning.",
    image: "photo-1573080496219-bb080dd4f877"
  },
  {
    id: 24, name: "Veg Cheese Sandwich", category: "Fast Food",
    price: 129, veg: true, rating: 4.4, tag: "Quick Bite",
    desc: "Toasted bread with vegetables and melted cheese.",
    image: "photo-1528735602780-2552fd46c7af"
  },
  {
    id: 25, name: "Chicken Wrap", category: "Fast Food",
    price: 189, veg: false, rating: 4.6, tag: "On the Go",
    desc: "A soft wrap filled with chicken and fresh vegetables.",
    image: "photo-1626700051175-6818013e1d4f"
  },
  {
    id: 26, name: "Veg Momos", category: "Fast Food",
    price: 119, veg: true, rating: 4.5, tag: "Street Food",
    desc: "Steamed dumplings with a spicy dipping sauce.",
    image: "photo-1563245372-f21724e3856d"
  },
  {
    id: 27, name: "Chicken Nuggets", category: "Fast Food",
    price: 159, veg: false, rating: 4.5, tag: "Crispy",
    desc: "Crispy chicken nuggets served with dip.",
    image: "photo-1562967914-608f82629710"
  },
  {
    id: 28, name: "Loaded Nachos", category: "Fast Food",
    price: 179, veg: true, rating: 4.4, tag: "Cheesy",
    desc: "Crunchy nachos with cheese, salsa and vegetables.",
    image: "photo-1513456852971-30c0b8199d4d"
  },
  {
    id: 29, name: "Chocolate Brownie", category: "Desserts",
    price: 129, veg: true, rating: 4.8, tag: "Chocolate",
    desc: "A rich chocolate brownie for your sweet cravings.",
    image: "photo-1606313564200-e75d5e30476c"
  },
  {
    id: 30, name: "Gulab Jamun", category: "Desserts",
    price: 89, veg: true, rating: 4.7, tag: "Indian Sweet",
    desc: "Soft milk-solid dumplings soaked in sugar syrup.",
    image: "photo-1666190092159-2f6a8f6bce7c"
  },
  {
    id: 31, name: "Cheesecake", category: "Desserts",
    price: 169, veg: true, rating: 4.6, tag: "Creamy",
    desc: "Smooth cheesecake with a buttery biscuit base.",
    image: "photo-1533134242443-d4fd215305ad"
  },
  {
    id: 32, name: "Chocolate Milkshake", category: "Drinks",
    price: 119, veg: true, rating: 4.6, tag: "Chilled",
    desc: "A thick, creamy chocolate milkshake.",
    image: "photo-1572490122747-3968b75cc699"
  },
  {
    id: 33, name: "Fresh Lime Soda", category: "Drinks",
    price: 69, veg: true, rating: 4.4, tag: "Refreshing",
    desc: "Fresh lime soda served chilled.",
    image: "photo-1513558161293-cdaf765edfd7"
  },
  {
    id: 34, name: "Cold Coffee", category: "Drinks",
    price: 109, veg: true, rating: 4.5, tag: "Iced",
    desc: "Chilled coffee blended until smooth.",
    image: "photo-1461023058943-07fcbe16d735"
  }
];

// ---------- Login and Signup ----------

function setAuthMode(mode) {
  authMode = mode;

  $$("#authForm [data-auth-mode]").forEach(button => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });

  $$("[data-auth-mode]").forEach(button => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });

  const signup = mode === "signup";

  $("#authNameGroup").classList.toggle("hidden", !signup);
  $("#authName").required = signup;
  $("#authSubmit").textContent = signup ? "Create Account" : "Login and Explore";
  $("#gateTitle").textContent = signup ? "Create Your Account" : "Welcome Back!";
  $("#gateSubtitle").textContent = signup
    ? "Sign up to discover your favourite food."
    : "Log in to explore the menu and place your order.";

  $("#authPassword").value = "";
  $("#authPassword").setAttribute(
    "autocomplete",
    signup ? "new-password" : "current-password"
  );
}

function showRestaurant(user) {
  currentUser = user;
  saveStored("flavornest-demo-session", user);

  $("#authGate").classList.add("hidden");
  $("#site").classList.remove("hidden");

  $("#welcomeUser").textContent = `Hi, ${user.name}`;

  loadUserData();
  renderMenu();
  renderCart();
  renderOrderHistory();
  renderReviews();
  renderUserReservations();

  $("#deliveryName").value = user.name;
  $("#resName").value = user.name;
  $("#reviewer").value = user.name;

  showToast(`Welcome to FlavorNest, ${user.name}!`, "success");
}

function logout() {
  localStorage.removeItem("flavornest-demo-session");
  currentUser = null;

  cart = [];
  favorites = [];
  appliedCoupon = false;

  $("#site").classList.add("hidden");
  $("#authGate").classList.remove("hidden");

  $("#authForm").reset();
  setAuthMode("login");

  closeCart();
  $("#checkoutModal").classList.add("hidden");
  $("#overlay").classList.add("hidden");

  showToast("You have logged out.", "success");
}

$("#authForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#authName").value.trim();
  const email = $("#authEmail").value.trim().toLowerCase();
  const password = $("#authPassword").value;

  demoUsers = loadStored("flavornest-demo-users", []);

  if (password.length < 6) {
    showToast("Password must contain at least 6 characters.", "error");
    return;
  }

  if (authMode === "signup") {
    if (!name) {
      showToast("Please enter your full name.", "error");
      return;
    }

    if (demoUsers.some(user => user.email === email)) {
      showToast("This email is already registered. Please log in.", "error");
      setAuthMode("login");
      return;
    }

    /*
      This front-end demonstration does not save or verify passwords.
      Secure password authentication needs a backend.
    */
    demoUsers.push({ name, email });
    saveStored("flavornest-demo-users", demoUsers);

    showToast("Registration successful! Now log in.", "success");
    $("#authEmail").value = email;
    setAuthMode("login");
    return;
  }

  const user = demoUsers.find(item => item.email === email);

  if (!user) {
    showToast("Account not found. Please sign up first.", "error");
    return;
  }

  /*
    Front-end limitation: the password is not verified.
    Do not use this demo for real customer accounts.
  */
  showRestaurant(user);
});

$$("[data-auth-mode]").forEach(button => {
  button.addEventListener("click", () => {
    setAuthMode(button.dataset.authMode);
  });
});

$$("[data-switch-auth]").forEach(button => {
  button.addEventListener("click", () => {
    setAuthMode(button.dataset.switchAuth);
  });
});

$("#logoutBtn").addEventListener("click", logout);

// ---------- Menu Rendering and Filtering ----------

function renderMenu() {
  const grid = $("#menuGrid");
  if (!grid) return;

  const query = $("#menuSearch").value.trim().toLowerCase();
  const sort = $("#sortMenu").value;
  const vegOnly = $("#vegOnly").checked;

  let filtered = dishes.filter(dish => {
    const matchesCategory =
      selectedCategory === "All" || dish.category === selectedCategory;

    const matchesSearch =
      `${dish.name} ${dish.category} ${dish.desc}`.toLowerCase().includes(query);

    return matchesCategory && matchesSearch && (!vegOnly || dish.veg);
  });

  if (sort === "low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "high") filtered.sort((a, b) => b.price - a.price);
  if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

  grid.innerHTML = filtered.map(dish => `
    <article class="food-card">
      <div class="food-image">
        <img src="${imageURL(dish.image)}"
             alt="${escapeHTML(dish.name)}"
             loading="lazy"
             onerror="this.onerror=null;this.src='https://placehold.co/700x450/f7eee5/a2472e?text=FlavorNest'">
        <span class="food-tag">${escapeHTML(dish.tag)}</span>
        <button class="favorite-btn ${favorites.includes(dish.id) ? "favorited" : ""}"
                data-favorite="${dish.id}"
                aria-label="Add ${escapeHTML(dish.name)} to favourites"
                type="button">
          ${favorites.includes(dish.id) ? "♥" : "♡"}
        </button>
      </div>
      <div class="food-card-content">
        <div class="food-card-heading">
          <h3>${escapeHTML(dish.name)}</h3>
          <span class="dish-rating">★ ${dish.rating}</span>
        </div>
        <p class="dish-category">
          ${dish.veg ? "🟢 Vegetarian" : "🔴 Non-vegetarian"}
          · ${escapeHTML(dish.category)}
        </p>
        <p class="dish-description">${escapeHTML(dish.desc)}</p>
        <div class="food-card-footer">
          <span class="dish-price">${money(dish.price)}</span>
          <div class="dish-actions">
            <button class="add-to-cart" data-add="${dish.id}" type="button">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  $("#emptyMenu").classList.toggle("hidden", filtered.length > 0);
}

$("#menuSearch").addEventListener("input", renderMenu);
$("#sortMenu").addEventListener("change", renderMenu);
$("#vegOnly").addEventListener("change", renderMenu);

$("#categoryFilters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  selectedCategory = button.dataset.category;

  $$("#categoryFilters .filter-btn").forEach(item => {
    item.classList.toggle("active", item === button);
  });

  renderMenu();
});

$("#menuGrid").addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-favorite]");
  const addButton = event.target.closest("[data-add]");

  if (favoriteButton) {
    if (!requireLogin("save your favourite dishes")) return;

    const id = Number(favoriteButton.dataset.favorite);

    if (favorites.includes(id)) {
      favorites = favorites.filter(item => item !== id);
      showToast("Removed from favourites.");
    } else {
      favorites.push(id);
      showToast("Added to your favourites!", "success");
    }

    saveFavorites();
    renderMenu();
    return;
  }

  if (addButton) {
    addToCart(Number(addButton.dataset.add));
  }
});

// ---------- Login Gate for Protected Actions ----------

function requireLogin(action) {
  if (currentUser) return true;

  showToast(`Please log in to ${action}.`, "error");
  $("#site").classList.add("hidden");
  $("#authGate").classList.remove("hidden");
  setAuthMode("login");

  return false;
}

// ---------- Cart ----------

function addToCart(id) {
  if (!requireLogin("add items to your cart")) return;

  const dish = dishes.find(item => item.id === id);
  if (!dish) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: dish.id, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${dish.name} added to your cart!`, "success");
}

function changeQuantity(id, change) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry.id !== id);
  }

  saveCart();
  renderCart();
}

function removeCartItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function getCartDetails() {
  const items = cart.map(item => {
    const dish = dishes.find(d => d.id === item.id);
    return dish ? { ...dish, quantity: item.quantity } : null;
  }).filter(Boolean);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const discount = appliedCoupon ? subtotal * 0.10 : 0;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + tax;

  return { items, subtotal, discount, tax, total };
}

function renderCart() {
  if (!$("#cartItems")) return;

  const details = getCartDetails();

  $("#cartCount").textContent = details.items.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  if (!details.items.length) {
    $("#cartItems").innerHTML = `
      <div class="cart-empty">
        <p style="font-size:40px">🛍</p>
        <h3>Your cart is empty</h3>
        <p>Find your favourite food and add it here.</p>
        <button class="btn btn-primary" id="shopFromCart" type="button">
          Explore Menu
        </button>
      </div>
    `;
  } else {
    $("#cartItems").innerHTML = details.items.map(item => `
      <div class="cart-item">
        <img src="${imageURL(item.image, 200)}"
             alt="${escapeHTML(item.name)}"
             onerror="this.onerror=null;this.src='https://placehold.co/200x200/f7eee5/a2472e?text=Food'">
        <div class="cart-item-info">
          <h4>${escapeHTML(item.name)}</h4>
          <span>${money(item.price)}</span>
          <div class="quantity-controls">
            <button type="button" data-decrease="${item.id}">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-increase="${item.id}">+</button>
          </div>
        </div>
        <div class="cart-item-end">
          <strong>${money(item.price * item.quantity)}</strong>
          <button class="remove-cart-item" data-remove="${item.id}" type="button">
            Remove
          </button>
        </div>
      </div>
    `).join("");
  }

  $("#cartSubtotal").textContent = money(details.subtotal);
  $("#cartDiscount").textContent = "−" + money(details.discount);
  $("#cartTax").textContent = money(details.tax);
  $("#cartTotal").textContent = money(details.total);
  $("#checkoutTotal").textContent = money(details.total);

  $("#checkoutBtn").disabled = details.items.length === 0;
  $("#checkoutBtn").style.opacity = details.items.length ? "1" : ".5";
}

$("#cartItems").addEventListener("click", event => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const remove = event.target.closest("[data-remove]");

  if (event.target.id === "shopFromCart") {
    closeCart();
    $("#menu").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (increase) changeQuantity(Number(increase.dataset.increase), 1);
  if (decrease) changeQuantity(Number(decrease.dataset.decrease), -1);
  if (remove) removeCartItem(Number(remove.dataset.remove));
});

function openCart() {
  if (!requireLogin("view your cart")) return;

  renderCart();
  $("#overlay").classList.remove("hidden");
  $("#cartDrawer").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");

  if ($("#checkoutModal").classList.contains("hidden")) {
    $("#overlay").classList.add("hidden");
    document.body.style.overflow = "";
  }
}

$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", () => {
  closeCart();
  $("#checkoutModal").classList.add("hidden");
  $("#overlay").classList.add("hidden");
  document.body.style.overflow = "";
});

// ---------- Coupon ----------

$("#applyCoupon").addEventListener("click", () => {
  const code = $("#couponInput").value.trim().toUpperCase();

  if (code === "FLAVOR10") {
    if (getCartDetails().subtotal <= 0) {
      showToast("Add an item to your cart first.", "error");
      return;
    }

    appliedCoupon = true;
    $("#couponMessage").textContent = "10% discount applied!";
    $("#couponMessage").style.color = "green";
    showToast("Coupon applied successfully!", "success");
  } else {
    appliedCoupon = false;
    $("#couponMessage").textContent = "Invalid coupon code.";
    $("#couponMessage").style.color = "#b83227";
    showToast("Please enter a valid coupon code.", "error");
  }

  renderCart();
});

$("#copyCoupon").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("FLAVOR10");
    showToast("Coupon FLAVOR10 copied!", "success");
  } catch {
    $("#couponInput").value = "FLAVOR10";
    showToast("Coupon code: FLAVOR10", "success");
  }
});

// ---------- Checkout and Order Placement ----------

function openCheckout() {
  if (!requireLogin("place an order")) return;

  const details = getCartDetails();

  if (!details.items.length) {
    showToast("Your cart is empty.", "error");
    return;
  }

  $("#checkoutTotal").textContent = money(details.total);
  $("#checkoutModal").classList.remove("hidden");
  $("#overlay").classList.remove("hidden");
  closeCart();
  $("#overlay").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

$("#checkoutBtn").addEventListener("click", openCheckout);

$("#checkoutClose").addEventListener("click", () => {
  $("#checkoutModal").classList.add("hidden");
  $("#overlay").classList.add("hidden");
  document.body.style.overflow = "";
});

$("#paymentMethod").addEventListener("change", () => {
  const method = $("#paymentMethod").value;

  if (method === "cod") {
    $("#paymentNote").textContent =
      "Cash on Delivery selected. Pay in cash when your order is delivered.";
    $("#placeOrderBtn").textContent = "Place Order — Cash on Delivery";
  } else {
    $("#paymentNote").textContent =
      "PhonePe/UPI needs a real payment gateway. This demo cannot collect or verify UPI payments.";
    $("#placeOrderBtn").textContent = "Place Order";
  }
});

$("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!requireLogin("place an order")) return;

  const details = getCartDetails();
  if (!details.items.length) {
    showToast("Your cart is empty.", "error");
    return;
  }

  const paymentMethod = $("#paymentMethod").value;

  /*
    Do not claim that a UPI payment has succeeded without verification.
    No real PhonePe transaction can be performed by this static website.
  */
  if (paymentMethod === "upi") {
    showToast(
      "UPI payments are not connected yet. Choose Cash on Delivery.",
      "error"
    );
    return;
  }

  const orderNumber = "FN" + Date.now().toString().slice(-9);

  const order = {
    orderNumber,
    email: currentUser.email,
    customerName: $("#deliveryName").value.trim(),
    phone: $("#deliveryPhone").value.trim(),
    address: $("#deliveryAddress").value.trim(),
    items: details.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    subtotal: details.subtotal,
    discount: details.discount,
    tax: details.tax,
    total: details.total,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pay when delivered",
    status: "Order Placed",
    date: new Date().toISOString()
  };

  orders = loadStored("flavornest-orders", []);
  orders.unshift(order);
  saveStored("flavornest-orders", orders);

  cart = [];
  appliedCoupon = false;
  saveCart();

  $("#checkoutForm").reset();
  $("#paymentNote").textContent =
    "Pay in cash when your order is delivered.";
  $("#placeOrderBtn").textContent = "Place Order";

  $("#checkoutModal").classList.add("hidden");
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.add("hidden");
  document.body.style.overflow = "";

  renderCart();
  renderOrderHistory();

  showToast(
    `Thank you for your order! Order ID: ${orderNumber}`,
    "success"
  );

  $("#orderHistory").scrollIntoView({ behavior: "smooth" });
});

// ---------- Order History ----------

function renderOrderHistory() {
  const container = $("#orderHistoryList");
  if (!container) return;

  const userOrders = getUserOrders();

  if (!userOrders.length) {
    container.innerHTML = `
      <div class="review-placeholder">
        <p style="font-size:32px">🧾</p>
        <h3>No orders yet</h3>
        <p>Your placed orders will appear here.</p>
        <a class="btn btn-primary" href="#menu">Explore Menu</a>
      </div>
    `;
    return;
  }

  container.innerHTML = userOrders.map(order => `
    <article class="history-card">
      <div class="history-card-head">
        <div>
          <h3>Order ${escapeHTML(order.orderNumber)}</h3>
          <p class="small-note">
            ${new Date(order.date).toLocaleString()}
          </p>
        </div>
        <span class="order-status">${escapeHTML(order.status)}</span>
      </div>

      <div class="history-items">
        ${order.items.map(item =>
          `${escapeHTML(item.name)} × ${item.quantity} — ${money(item.price * item.quantity)}`
        ).join("<br>")}
      </div>

      <div class="history-card-head">
        <span>Payment: ${escapeHTML(order.paymentMethod)}</span>
        <strong>Total: ${money(order.total)}</strong>
      </div>

      <p class="small-note">
        Delivery address: ${escapeHTML(order.address)}
      </p>
      <p class="small-note">
        Payment status: ${escapeHTML(order.paymentStatus)}
      </p>
    </article>
  `).join("");
}

// ---------- Reservations ----------

$("#reservationForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!requireLogin("book a table")) return;

  const date = $("#resDate").value;
  const time = $("#resTime").value;

  if (date < new Date().toISOString().slice(0, 10)) {
    showToast("Please choose today or a future date.", "error");
    return;
  }

  const reservation = {
    id: "RSV" + Date.now().toString().slice(-7),
    email: currentUser.email,
    name: $("#resName").value.trim(),
    phone: $("#resPhone").value.trim(),
    date,
    time,
    guests: $("#resGuests").value,
    createdAt: new Date().toISOString()
  };

  reservations = loadStored("flavornest-reservations", []);
  reservations.unshift(reservation);
  saveStored("flavornest-reservations", reservations);

  $("#reservationForm").reset();
  $("#resName").value = currentUser.name;

  showToast(
    `Reservation request saved for ${date} at ${time}.`,
    "success"
  );

  renderUserReservations();
});

function renderUserReservations() {
  // Reservations are saved in this browser.
  // A real restaurant booking requires a backend.
}

// Set minimum reservation date to today
$("#resDate").min = new Date().toISOString().slice(0, 10);

// ---------- Feedback and Star Rating ----------

$("#starRating").addEventListener("click", event => {
  const button = event.target.closest("[data-rating]");
  if (!button) return;

  selectedRating = Number(button.dataset.rating);

  $$("#starRating button").forEach(star => {
    star.classList.toggle(
      "selected",
      Number(star.dataset.rating) <= selectedRating
    );
  });
});

$("#feedbackForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!requireLogin("submit feedback")) return;

  const name = $("#reviewer").value.trim();
  const message = $("#review").value.trim();

  if (selectedRating < 1 || selectedRating > 5) {
    showToast("Please select a star rating.", "error");
    return;
  }

  if (!name || !message) {
    showToast("Please complete all feedback fields.", "error");
    return;
  }

  const review = {
    id: Date.now(),
    email: currentUser.email,
    name,
    rating: selectedRating,
    message,
    date: new Date().toISOString()
  };

  reviews = loadStored("flavornest-reviews", []);
  reviews.unshift(review);
  reviews = reviews.slice(0, 50);
  saveStored("flavornest-reviews", reviews);

  $("#review").value = "";
  selectedRating = 0;

  $$("#starRating button").forEach(star => {
    star.classList.remove("selected");
  });

  renderReviews();
  showToast("Thank you for your feedback!", "success");
});

function renderReviews() {
  const container = $("#reviewsList");
  if (!container) return;

  reviews = loadStored("flavornest-reviews", []);

  if (!reviews.length) {
    container.innerHTML = `
      <div class="review-placeholder">
        <div class="empty-star">☆</div>
        <p>Your review could be the first one. Share your experience with us!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = reviews.map(review => `
    <article class="review-card">
      <div class="review-card-head">
        <div class="review-avatar">
          ${escapeHTML(review.name.charAt(0).toUpperCase())}
        </div>
        <div>
          <strong>${escapeHTML(review.name)}</strong>
          <div class="small-note">
            ${new Date(review.date).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div class="review-stars">
        ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
      </div>

      <p>${escapeHTML(review.message)}</p>
    </article>
  `).join("");
};

// ---------- Dark Mode ----------

$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const dark = document.body.classList.contains("dark-mode");
  $("#themeToggle").textContent = dark ? "☀" : "☾";

  localStorage.setItem("flavornest-dark-mode", dark ? "on" : "off");
});

if (localStorage.getItem("flavornest-dark-mode") === "on") {
  document.body.classList.add("dark-mode");
  $("#themeToggle").textContent = "☀";
}

// ---------- Mobile Navigation ----------

$("#menuToggle").addEventListener("click", () => {
  $("#navLinks").classList.toggle("open");
});

$$(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    $("#navLinks").classList.remove("open");
  });
});

// ---------- Footer Year ----------

$("#year").textContent = new Date().getFullYear();

// ---------- Initial Page Setup ----------

setAuthMode("login");
renderReviews();

if (currentUser && currentUser.email && currentUser.name) {
  showRestaurant(currentUser);
} else {
  currentUser = null;
  $("#authGate").classList.remove("hidden");
  $("#site").classList.add("hidden");
}
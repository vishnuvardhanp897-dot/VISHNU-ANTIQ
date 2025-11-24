/* main.js - cart & checkout logic for Vishnu's Antiq Gallary
   Responsibilities:
   - Provide product data
   - Render products on products.html
   - Manage cart in localStorage (vag_cart)
   - Update cart count in header
   - Handle Add to Cart, Remove, Clear Cart
   - Build order summary on payments.html
   - Generate Order ID and redirect to thankyou.html?orderId=XXXX
   - Display order id on thankyou.html
*/

/* ---------- Product Data ---------- */
const PRODUCTS = [
  { id: 1, title: "Ancient Roman Coin — 500 BC Edition", price: 12000, category: "coins", img: "https://via.placeholder.com/600x420?text=Roman+Coin" },
  { id: 2, title: "Carved Stone Vessel — Mughal Replica", price: 8500, category: "vessels", img: "https://via.placeholder.com/600x420?text=Stone+Vessel" },
  { id: 3, title: "Bronze Temple Figure", price: 17500, category: "figures", img: "https://via.placeholder.com/600x420?text=Bronze+Figure" },
  { id: 4, title: "Miniature Monument Replica", price: 2400, category: "decor", img: "https://via.placeholder.com/600x420?text=Mini+Monument" },
  { id: 5, title: "Vintage Oil Lamp", price: 1800, category: "decor", img: "https://via.placeholder.com/600x420?text=Oil+Lamp" },
  { id: 6, title: "Colonial Wooden Chest (Restored)", price: 9200, category: "furniture", img: "https://via.placeholder.com/600x420?text=Wooden+Chest" }
];

/* ---------- Utilities: localStorage cart ---------- */
const CART_KEY = 'vag_cart';

function readCart(){
  try{
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  }catch(e){
    return [];
  }
}
function writeCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

/* add product to cart */
function addToCart(productId, qty = 1){
  const prod = PRODUCTS.find(p => p.id === Number(productId));
  if(!prod) return;
  const cart = readCart();
  const exist = cart.find(i => i.id === prod.id);
  if(exist){
    exist.qty += qty;
  } else {
    cart.push({ id: prod.id, title: prod.title, price: prod.price, img: prod.img, qty });
  }
  writeCart(cart);
  alert(`${prod.title} added to cart`);
}

/* remove item */
function removeFromCart(productId){
  let cart = readCart();
  cart = cart.filter(i => i.id !== Number(productId));
  writeCart(cart);
}

/* change qty */
function changeQty(productId, newQty){
  const cart = readCart();
  const item = cart.find(i => i.id === Number(productId));
  if(!item) return;
  item.qty = Math.max(1, Number(newQty));
  writeCart(cart);
}

/* clear cart */
function clearCart(){
  localStorage.removeItem(CART_KEY);
  updateCartCount();
  renderCart(); // if cart UI exists
}

/* cart count calculation */
function getCartCount(){
  return readCart().reduce((s,i) => s + (i.qty || 0), 0);
}
function getCartSubtotal(){
  return readCart().reduce((s,i) => s + (i.price * i.qty), 0);
}

/* update header cart counters on any page */
function updateCartCount(){
  const count = getCartCount();
  document.querySelectorAll('#cart-count, #cart-count-2, #cart-count-3').forEach(el => {
    if(el) el.textContent = count;
  });
}

/* ---------- Products Rendering (products.html) ---------- */
function renderProductsPage(){
  const grid = document.getElementById('products-grid');
  if(!grid) return;

  const searchEl = document.getElementById('search');
  const catEl = document.getElementById('category');

  const search = (searchEl && searchEl.value) ? searchEl.value.toLowerCase() : '';
  const cat = (catEl && catEl.value) ? catEl.value : 'all';

  const filtered = PRODUCTS.filter(p => {
    if(cat !== 'all' && p.category !== cat) return false;
    if(search && !p.title.toLowerCase().includes(search)) return false;
    return true;
  });

  grid.innerHTML = '';
  filtered.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card antique-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${escapeHtml(p.title)}">
      <div class="card-body">
        <h4>${escapeHtml(p.title)}</h4>
        <p class="muted">Category: ${escapeHtml(p.category)}</p>
        <div class="card-actions">
          <span class="price">₹${numberWithCommas(p.price)}</span>
          <div>
            <button class="btn btn-small" data-action="add" data-id="${p.id}">Add to Cart</button>
            <button class="btn btn-small btn-outline" data-action="buy" data-id="${p.id}">Buy Now</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ---------- Cart UI (cart display in payment page) ---------- */
function renderCart(){
  // On payments page: order-items element
  const orderItemsEl = document.getElementById('order-items');
  if(!orderItemsEl) return;

  const cart = readCart();
  if(cart.length === 0){
    orderItemsEl.innerHTML = `<div class="muted">Your cart is empty. Browse <a href="products.html">Antiq Pieces</a>.</div>`;
    document.getElementById('summary-subtotal').textContent = '₹0';
    document.getElementById('summary-total').textContent = '₹0';
    return;
  }

  orderItemsEl.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'order-row';
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.marginBottom = '10px';
    row.innerHTML = `
      <div style="display:flex; gap:10px; align-items:center;">
        <img src="${item.img}" alt="${escapeHtml(item.title)}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;">
        <div>
          <div style="font-weight:700">${escapeHtml(item.title)}</div>
          <div class="muted" style="font-size:0.9rem;">₹${numberWithCommas(item.price)} × ${item.qty}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700">₹${numberWithCommas(item.qty * item.price)}</div>
        <div style="margin-top:6px;">
          <button class="btn btn-small" data-action="dec" data-id="${item.id}">-</button>
          <button class="btn btn-small" data-action="inc" data-id="${item.id}">+</button>
          <button class="btn btn-small btn-outline" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
    orderItemsEl.appendChild(row);
  });

  const subtotal = getCartSubtotal();
  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;
  document.getElementById('summary-subtotal').textContent = `₹${numberWithCommas(subtotal)}`;
  document.getElementById('summary-shipping').textContent = `₹${numberWithCommas(shipping)}`;
  document.getElementById('summary-total').textContent = `₹${numberWithCommas(total)}`;
}

/* ---------- Checkout handling ---------- */
function handleCheckoutSubmit(ev){
  ev.preventDefault();
  const frm = ev.target;
  // basic validation
  const fullname = frm.fullName.value.trim();
  const phone = frm.phone.value.trim();
  const email = frm.email.value.trim();
  const address = frm.address.value.trim();
  const city = frm.city.value.trim();
  const state = frm.state.value.trim();

  if(!fullname || !phone || !email || !address || !city || !state){
    alert('Please fill all required fields.');
    return;
  }

  // prepare order
  const order = {
    id: generateOrderId(),
    name: fullname,
    phone, email, address, city, state,
    items: readCart(),
    subtotal: getCartSubtotal(),
    shipping: getCartSubtotal() > 0 ? 200 : 0,
    total: getCartSubtotal() + (getCartSubtotal() > 0 ? 200 : 0),
    createdAt: new Date().toISOString()
  };

  // store last order for reference (could be used to show details in thankyou)
  localStorage.setItem('vag_last_order', JSON.stringify(order));

  // clear cart
  localStorage.removeItem(CART_KEY);
  updateCartCount();

  // redirect to thank you with order id
  window.location.href = `thankyou.html?orderId=${encodeURIComponent(order.id)}`;
}

/* ---------- Thank you page behavior ---------- */
function renderThankYou(){
  // parse order id from query string, fallback to last order in localStorage
  const params = new URLSearchParams(window.location.search);
  let orderId = params.get('orderId');

  if(!orderId){
    const last = localStorage.getItem('vag_last_order');
    if(last){
      try{
        const parsed = JSON.parse(last);
        orderId = parsed.id || null;
      }catch(e){}
    }
  }

  const orderEl = document.getElementById('order-id');
  if(orderEl){
    orderEl.textContent = orderId ? orderId : '—';
  }
}

/* ---------- Generic Event Delegation ---------- */
document.addEventListener('click', function(e){
  const btn = e.target.closest('button[data-action], button[data-id]');
  if(!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if(action === 'add'){
    addToCart(id, 1);
    updateCartCount();
    // If on payments page, re-render
    renderCart();
  } else if(action === 'buy'){
    // buy now -> add single item then redirect to payments page
    writeCart([]); // optional: if you want only this item in cart for buy now, clear previous cart
    addToCart(id, 1);
    updateCartCount();
    window.location.href = 'payments.html';
  } else if(action === 'inc'){
    changeQty(id, readCart().find(i => i.id === Number(id)).qty + 1);
    renderCart();
  } else if(action === 'dec'){
    const cart = readCart();
    const item = cart.find(i => i.id === Number(id));
    if(item){
      if(item.qty <= 1){
        removeFromCart(id);
      } else {
        changeQty(id, item.qty - 1);
      }
    }
    renderCart();
  } else if(action === 'remove'){
    removeFromCart(id);
    renderCart();
  }
});

/* clear cart button on payments page */
document.addEventListener('click', function(e){
  if(e.target && e.target.id === 'clear-cart-pay'){
    if(confirm('Clear entire cart?')) {
      clearCart();
      renderCart();
    }
  }
});

/* search & filter listeners (products page) */
document.addEventListener('input', function(e){
  if(e.target && (e.target.id === 'search' || e.target.id === 'category')){
    renderProductsPage();
  }
});

/* handle checkout form submission */
document.addEventListener('submit', function(e){
  if(e.target && e.target.id === 'checkout-form'){
    handleCheckoutSubmit(e);
  }
});

/* ---------- Page initialization ---------- */
window.addEventListener('DOMContentLoaded', function(){
  // update years in footer if present
  const y = new Date().getFullYear();
  ['year-home','year-products','year-payments','year-thank'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.textContent = y;
  });

  updateCartCount();

  // render products if on products page
  renderProductsPage();

  // render cart/order summary if on payments page
  renderCart();

  // show order id on thank you page
  renderThankYou();

  // Attach checkout form if present - already handled by submit listener
});

/* ---------- Helpers ---------- */
function generateOrderId(){
  // Format: VAG-YYYYMMDD-HHMMSS-XXXX (VAG = Vishnu's Antiq Gallary)
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rnd = Math.floor(Math.random() * 9000) + 1000;
  return `VAG-${ts}-${rnd}`;
}
function numberWithCommas(x){
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

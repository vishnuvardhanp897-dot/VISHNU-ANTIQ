/* main.js - cart & checkout logic for Vishnu's Antiq Gallary
   Works across index.html, products.html, payments.html, thankyou.html
*/

const PRODUCTS = [
  { id:1, title:"Ancient Roman Coin — 500 BC Edition", price:12000, category:"coins", img:"https://images.unsplash.com/photo-1525159831894-2d1a9cd7f72b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=4b9b0f0c5f2b2cd5feca6a8b9b0f7c1d" },
  { id:2, title:"Carved Stone Vessel — Mughal Replica", price:8500, category:"vessels", img:"https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=7de8b8c0d7c8f0a9c5d6b6aa9d2b3f90" },
  { id:3, title:"Bronze Temple Figure", price:17500, category:"figures", img:"https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=8a2e7b6f7f2c4b3a1a4b5c6d7e8f9a1b" },
  { id:4, title:"Miniature Monument Replica", price:2400, category:"decor", img:"https://images.unsplash.com/photo-1549893075-7b1c5b8f7c3a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d" },
  { id:5, title:"Vintage Oil Lamp", price:1800, category:"decor", img:"https://images.unsplash.com/photo-1481014474333-e7b720bb3f39?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f" },
  { id:6, title:"Colonial Wooden Chest (Restored)", price:9200, category:"furniture", img:"https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d" }
];

const CART_KEY = 'vag_cart';
const LAST_ORDER_KEY = 'vag_last_order';

/* ---------- Cart storage helpers ---------- */
function readCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch(e){ return []; }
}
function writeCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function clearCartStorage(){
  localStorage.removeItem(CART_KEY);
  updateCartCount();
}

/* ---------- Cart operations ---------- */
function addToCart(productId, qty=1){
  const prod = PRODUCTS.find(p=>p.id === Number(productId));
  if(!prod) return;
  const cart = readCart();
  const found = cart.find(i=>i.id === prod.id);
  if(found) found.qty += qty;
  else cart.push({ id:prod.id, title:prod.title, price:prod.price, img:prod.img, qty });
  writeCart(cart);
  alert(`${prod.title} added to cart`);
}

function removeFromCart(productId){
  let cart = readCart();
  cart = cart.filter(i => i.id !== Number(productId));
  writeCart(cart);
}

function changeQty(productId, delta){
  const cart = readCart();
  const idx = cart.findIndex(i => i.id === Number(productId));
  if(idx === -1) return;
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  writeCart(cart);
}

/* ---------- UI updates ---------- */
function updateCartCount(){
  const count = readCart().reduce((s,i)=>s + (i.qty||0), 0);
  document.querySelectorAll('#cart-count').forEach(el=>el.textContent = count);
}

/* ---------- Products page rendering ---------- */
function renderProducts(){
  const grid = document.getElementById('products-grid');
  if(!grid) return;
  const search = (document.getElementById('search')?.value || '').toLowerCase();
  const category = (document.getElementById('category')?.value || 'all');

  const filtered = PRODUCTS.filter(p=>{
    if(category !== 'all' && p.category !== category) return false;
    if(search && !p.title.toLowerCase().includes(search)) return false;
    return true;
  });

  grid.innerHTML = '';
  filtered.forEach(p=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
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
    grid.appendChild(el);
  });
}

/* ---------- Payments page: render order summary ---------- */
function renderOrderSummary(){
  const orderItemsEl = document.getElementById('order-items');
  if(!orderItemsEl) return;
  const cart = readCart();
  orderItemsEl.innerHTML = '';
  if(cart.length === 0){
    orderItemsEl.innerHTML = '<div class="muted">Your cart is empty. <a href="products.html">Shop now</a>.</div>';
    setSummaryTotals(0);
    return;
  }

  let subtotal = 0;
  cart.forEach(item=>{
    subtotal += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'order-row';
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.marginBottom = '10px';
    row.innerHTML = `
      <div style="display:flex; gap:10px; align-items:center;">
        <img src="${item.img}" style="width:64px;height:48px;object-fit:cover;border-radius:6px" alt="${escapeHtml(item.title)}">
        <div>
          <div style="font-weight:700">${escapeHtml(item.title)}</div>
          <div class="muted" style="font-size:0.9rem">₹${numberWithCommas(item.price)} × ${item.qty}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">₹${numberWithCommas(item.price * item.qty)}</div>
        <div style="margin-top:6px">
          <button class="btn btn-small" data-action="inc" data-id="${item.id}">+</button>
          <button class="btn btn-small" data-action="dec" data-id="${item.id}">-</button>
          <button class="btn btn-small btn-outline" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
    orderItemsEl.appendChild(row);
  });

  setSummaryTotals(subtotal);
}

function setSummaryTotals(subtotal){
  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;
  document.getElementById('summary-subtotal') && (document.getElementById('summary-subtotal').textContent = `₹${numberWithCommas(subtotal)}`);
  document.getElementById('summary-shipping') && (document.getElementById('summary-shipping').textContent = `₹${numberWithCommas(shipping)}`);
  document.getElementById('summary-total') && (document.getElementById('summary-total').textContent = `₹${numberWithCommas(total)}`);
}

/* ---------- Checkout handling ---------- */
function handleCheckoutForm(e){
  e.preventDefault();
  const cart = readCart();
  if(cart.length === 0){
    alert('Your cart is empty. Add antiques to cart before checkout.');
    return;
  }

  const form = e.target;
  const fullName = form.fullName.value.trim();
  const phone = form.phone.value.trim();
  const email = form.email.value.trim();
  const address = form.address.value.trim();
  const city = form.city.value.trim();
  const state = form.state.value.trim();
  const paymentMode = form.paymentMode.value || 'cod';

  if(!fullName || !phone || !email || !address || !city || !state){
    alert('Please fill all required fields.');
    return;
  }

  const subtotal = readCart().reduce((s,i)=>s + i.price * i.qty, 0);
  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;

  const order = {
    id: generateOrderId(),
    name: fullName,
    phone, email, address, city, state,
    paymentMode,
    items: readCart(),
    subtotal, shipping, total,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  clearCartStorage(); // empty cart after order
  window.location.href = `thankyou.html?orderId=${encodeURIComponent(order.id)}`;
}

/* ---------- Thank you page rendering ---------- */
function renderThankYou(){
  const params = new URLSearchParams(window.location.search);
  let orderId = params.get('orderId');
  if(!orderId){
    const last = localStorage.getItem(LAST_ORDER_KEY);
    if(last){
      try { orderId = JSON.parse(last).id; } catch(e) { orderId = null; }
    }
  }
  const el = document.getElementById('order-id');
  if(el) el.textContent = orderId ? orderId : '—';
}

/* ---------- Utilities ---------- */
function generateOrderId(){
  const now = new Date();
  const pad = n=>String(n).padStart(2,'0');
  const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rnd = Math.floor(Math.random()*9000)+1000;
  return `VAG-${ts}-${rnd}`;
}
function numberWithCommas(x){ return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function escapeHtml(str){ if(!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

/* ---------- Event delegation ---------- */
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-action]');
  if(!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if(action === 'add'){
    addToCart(id,1);
    renderOrderSummary();
  } else if(action === 'buy'){
    writeCart([]);
    addToCart(id,1);
    window.location.href = 'payments.html';
  } else if(action === 'inc'){
    changeQty(id, +1);
    renderOrderSummary();
  } else if(action === 'dec'){
    changeQty(id, -1);
    renderOrderSummary();
  } else if(action === 'remove'){
    removeFromCart(id);
    renderOrderSummary();
  }
});

/* clear cart button */
document.addEventListener('click', (e)=>{
  if(e.target && e.target.id === 'clear-cart-pay'){
    if(confirm('Clear whole cart?')){ clearCartStorage(); renderOrderSummary(); }
  }
});

/* search & filter handlers */
document.addEventListener('input', (e)=>{
  if(e.target && (e.target.id === 'search' || e.target.id === 'category')) renderProducts();
});

/* form submit */
document.addEventListener('submit', (e)=>{
  if(e.target && e.target.id === 'checkout-form') handleCheckoutForm(e);
});

/* ---------- Initialize UI on DOM load ---------- */
window.addEventListener('DOMContentLoaded', ()=>{
  // update footer years
  const y = new Date().getFullYear();
  ['year-home','year-products','year-payments','year-thank'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.textContent = y;
  });

  updateCartCount();
  renderProducts();
  renderOrderSummary();
  renderThankYou();
});

let cart = JSON.parse(localStorage.getItem("cart")) || [];


function addToCart(name, price) {
cart.push({ name, price });
localStorage.setItem("cart", JSON.stringify(cart));
alert("Added to cart!");
}


function loadSummary() {
let box = document.getElementById("orderSummary");
if (!box) return;


box.innerHTML = "";
let total = 0;


cart.forEach(item => {
box.innerHTML += `<p>${item.name} - ₹${item.price}</p>`;
total += item.price;
});


box.innerHTML += `<h4>Total: ₹${total}</h4>`;
}


function submitOrder(event) {
event.preventDefault();
let orderId = Math.floor(Math.random() * 900000) + 100000;
localStorage.removeItem("cart");
window.location.href = `thankyou.html?orderId=${orderId}`;
}


function loadOrderId() {
let p = document.getElementById("orderId");
if (!p) return;


let url = new URLSearchParams(window.location.search);
p.innerHTML = "Order ID: " + url.get("orderId");
}


window.onload = function () {
loadSummary();
loadOrderId();
};

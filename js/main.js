/* AB Gadgets — no libraries, server or build step required.
   LAUNCH SETUP: replace these blank values with your business details.
   whatsappNumber must include the country code and digits only, e.g. 91XXXXXXXXXX.
   Never put payment secrets or passwords in this public file. */
const STORE = {
  whatsappNumber: '',
  phone: '',
  email: '',
  upiId: '',
  upiQrImage: '', // Example: images/my-upi-qr.png (your actual payment QR)
  domain: ''
};
const products = window.PRODUCTS;
const money = value => '₹' + Number(value).toLocaleString('en-IN');
const byId = id => products.find(product => product.id === Number(id));
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const CART_KEY = 'ab-gadgets-cart-v1';
let storageAvailable = true;
/* Some private/file browsers restrict storage. Keep the current session usable
   and tell the customer if their browser cannot save the cart. */
function readCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    const cleaned = [];
    raw.forEach(item => {
      if (!item || !byId(item.id) || !Number.isInteger(item.qty) || item.qty < 1) return;
      const existing = cleaned.find(row => row.id === Number(item.id));
      if (existing) existing.qty = Math.min(99, existing.qty + item.qty);
      else cleaned.push({id:Number(item.id),qty:Math.min(99,item.qty)});
    });
    return cleaned;
  } catch (error) {
    if (!(error instanceof SyntaxError)) storageAvailable = false;
    return [];
  }
}
let cart = readCart();
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  catch { storageAvailable = false; }
  updateCartBadge();
}
function subtotal() { return cart.reduce((sum,item) => sum + byId(item.id).price * item.qty, 0); }
function updateCartBadge() {
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = cart.reduce((sum,item)=>sum+item.qty,0));
}
let toastTimer;
function toast(message) {
  const target = document.getElementById('toast');
  target.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => target.textContent = '', 5500);
}
function addToCart(id) {
  if (!byId(id)) return;
  const existing = cart.find(item => item.id === Number(id));
  if (existing && existing.qty >= 99) return toast('Maximum quantity is 99 per product.');
  if (existing) existing.qty++;
  else cart.push({id:Number(id),qty:1});
  saveCart();
  toast(storageAvailable ? byId(id).name + ' added to your cart.' : 'Added. Your browser cannot save this cart after you leave.');
}
function whatsappUrl(message) {
  return /^\d{10,15}$/.test(STORE.whatsappNumber) ? 'https://wa.me/' + STORE.whatsappNumber + '?text=' + encodeURIComponent(message) : null;
}
function chat(message) {
  const url = whatsappUrl(message);
  if (!url) { toast('WhatsApp ordering is not active yet. Business contact details are coming soon.'); return; }
  window.open(url, '_blank', 'noopener,noreferrer');
}
/* Shared header/footer are injected so you only need to edit them once. */
function renderShell() {
  const page = document.body.dataset.page;
  document.getElementById('site-header').innerHTML = `
    <a class="skip" href="#main">Skip to content</a>
    <div class="announcement">Little upgrades. Everyday possibilities. &nbsp; Discover the AB Gadgets collection →</div>
    <header class="header"><div class="container nav-row">
      <a class="logo" href="index.html" aria-label="AB Gadgets home"><span class="logo-mark">ab</span> gadgets<span style="color:var(--blue)">.</span></a>
      <nav class="nav" id="navigation" aria-label="Main navigation">${[['home','index.html','Home'],['shop','shop.html','Shop'],['about','about.html','Our story'],['contact','contact.html','Contact']].map(([key,url,label])=>`<a href="${url}" ${page===key?'aria-current="page"':''}>${label}</a>`).join('')}</nav>
      <div class="nav-tools"><a class="cart-link" href="cart.html" aria-label="View shopping cart">Bag <span class="cart-count">0</span></a><button class="icon-button menu-toggle" aria-label="Open menu" aria-controls="navigation" aria-expanded="false">☰</button></div>
    </div></header>`;
  document.getElementById('site-footer').innerHTML = `<footer class="footer"><div class="container"><div class="footer-grid">
    <div><a class="logo" href="index.html"><span class="logo-mark">ab</span> gadgets.</a><p class="muted" style="margin-top:20px;max-width:290px">Small upgrades for big days.<br>Tech essentials for your everyday.</p></div>
    <div><h3>Explore</h3><a href="shop.html">Shop all</a><a href="shop.html?category=Audio">Audio essentials</a><a href="shop.html?category=Phone%20accessories">Phone accessories</a><a href="about.html">Our story</a></div>
    <div><h3>Here to help</h3><a href="contact.html">Contact us</a><a href="about.html#shipping">Shipping & returns</a><a href="about.html#faq">Frequently asked questions</a><a href="cart.html">Your bag</a></div>
    </div><div class="footer-bottom">© ${new Date().getFullYear()} AB Gadgets. &nbsp; Made for your everyday. <br>Preview catalogue · Sample products and prices. Orders and payment setup pending.</div></div></footer>
    <button class="whatsapp" data-chat aria-label="Chat with AB Gadgets on WhatsApp">◉ &nbsp; Let's chat</button><div id="toast" class="toast" role="status" aria-live="polite"></div>`;
  document.querySelector('.menu-toggle').addEventListener('click', event => {
    const expanded = event.currentTarget.getAttribute('aria-expanded') !== 'true';
    event.currentTarget.setAttribute('aria-expanded', String(expanded));
    event.currentTarget.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
    document.getElementById('navigation').classList.toggle('open', expanded);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.getElementById('navigation').classList.contains('open')) {
      document.querySelector('.menu-toggle').click();
      document.querySelector('.menu-toggle').focus();
    }
  });
  updateCartBadge();
}
function productCard(product) {
  return `<article class="product-card"><a href="product.html?id=${product.id}" class="product-image" style="display:block"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)} — illustrative placeholder" loading="lazy" width="500" height="500"><span class="sample-label">ILLUSTRATIVE IMAGE</span></a><p class="category">${escapeHTML(product.category)}</p><h3><a href="product.html?id=${product.id}">${escapeHTML(product.name)}</a></h3><div class="product-card-bottom"><strong>${money(product.price)}</strong><button class="add-button" data-add="${product.id}" aria-label="Add ${escapeHTML(product.name)} to cart">+</button></div></article>`;
}
function renderShop() {
  const search = document.getElementById('search');
  const category = document.getElementById('category');
  const sort = document.getElementById('sort');
  const initial = new URLSearchParams(location.search).get('category');
  if (['Audio','Phone accessories'].includes(initial)) category.value = initial;
  function filter() {
    let filtered = products.filter(p => (category.value === 'All' || p.category === category.value) && p.name.toLowerCase().includes(search.value.trim().toLowerCase()));
    if (sort.value === 'low') filtered.sort((a,b) => a.price-b.price);
    if (sort.value === 'high') filtered.sort((a,b) => b.price-a.price);
    document.getElementById('product-grid').innerHTML = filtered.length ? filtered.map(productCard).join('') : '<div class="empty"><h3>No matches yet</h3><p>Try another search or choose all categories.</p></div>';
    document.getElementById('results-count').textContent = filtered.length + ' products';
  }
  search.addEventListener('input',filter);category.addEventListener('change',filter);sort.addEventListener('change',filter);filter();
}
function renderProduct() {
  const product = byId(new URLSearchParams(location.search).get('id'));
  const target = document.getElementById('product-detail');
  if (!product) {
    document.title = 'Product not found | AB Gadgets';
    target.innerHTML = '<div class="empty"><h1>Product not found</h1><p>This link does not match a product in our catalogue.</p><a class="button" href="shop.html">Explore the shop</a></div>';return;
  }
  document.title = product.name + ' | AB Gadgets';
  document.querySelector('meta[name="description"]').content = product.description;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = product.description;
  document.querySelector('meta[property="og:image"]').content = new URL(product.image,location.href).href;
  document.querySelector('meta[property="og:url"]').content = location.href;
  target.innerHTML = `<div class="breadcrumb"><a href="shop.html">Shop</a> / ${escapeHTML(product.category)} / ${escapeHTML(product.name)}</div><div class="detail-grid"><div class="detail-image"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)} — illustrative placeholder"><span class="sample-label">ILLUSTRATIVE IMAGE — REAL PHOTO COMING SOON</span></div><div class="detail-copy"><span class="eyebrow">${escapeHTML(product.tag)}</span><h1>${escapeHTML(product.name)}</h1><p class="muted">${escapeHTML(product.description)}</p><div class="price">${money(product.price)}</div><p class="notice">Sample product and price. Final specifications, availability and applicable taxes will be confirmed before payment.</p><button class="button" data-add="${product.id}">Add to bag &nbsp; +</button> <a class="text-link" href="cart.html">View bag →</a><div class="policy"><h3>At a glance</h3><ul>${product.specs.map(spec=>`<li>${escapeHTML(spec)}</li>`).join('')}</ul><p>These specifications are illustrative. Confirm exact details and compatibility with us before ordering.</p></div><div class="policy"><h3>Shipping & warranty</h3><p>Shipping charges, delivery estimate, return eligibility and product warranty will be confirmed on WhatsApp before payment. <a class="text-link" href="about.html#shipping">Read more →</a></p></div></div></div><section class="section"><h2>Customer reviews</h2><p class="muted">No customer reviews yet. Verified customer feedback will appear here once available.</p></section>`;
}
function renderCart() {
  const target = document.getElementById('cart-content');
  if (!cart.length) { target.innerHTML = '<div class="empty"><h2>Your bag is waiting.</h2><p class="muted">Find a little upgrade for your everyday.</p><a class="button" href="shop.html">Explore the collection →</a></div>';return; }
  target.innerHTML = `<div class="cart-layout"><div>${cart.map(item => {
    const p = byId(item.id);
    return `<article class="cart-item"><a href="product.html?id=${p.id}"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)} placeholder"></a><div><h3><a href="product.html?id=${p.id}">${escapeHTML(p.name)}</a></h3><p>${money(p.price)} each · <strong>${money(p.price*item.qty)}</strong></p><div class="cart-controls"><div class="quantity"><button data-quantity="${p.id}" data-step="-1" aria-label="Decrease ${escapeHTML(p.name)} quantity" ${item.qty===1?'disabled':''}>−</button><output aria-label="Quantity">${item.qty}</output><button data-quantity="${p.id}" data-step="1" aria-label="Increase ${escapeHTML(p.name)} quantity" ${item.qty===99?'disabled':''}>+</button></div><button class="remove" data-remove="${p.id}">Remove<span class="sr-only"> ${escapeHTML(p.name)}</span></button></div></div></article>`;
  }).join('')}</div>${orderSummary(true)}</div>`;
}
function orderSummary(withButton) {
  return `<aside class="summary-box"><h3>Order summary</h3><div class="summary-line"><span>Products</span><span>${cart.reduce((s,i)=>s+i.qty,0)}</span></div><div class="summary-line"><span>Subtotal</span><span>${money(subtotal())}</span></div><div class="summary-line"><span>Shipping & taxes</span><span>To confirm</span></div><div class="summary-line total"><span>Item total</span><span>${money(subtotal())}</span></div><p class="muted" style="font-size:13px">Final payable amount, stock and delivery will be confirmed on WhatsApp before payment.</p>${withButton?'<a href="checkout.html" class="button">Continue to checkout →</a><a href="shop.html" class="text-link">Continue shopping</a>':''}</aside>`;
}
function renderCheckout() {
  if (!cart.length) { document.getElementById('checkout-content').innerHTML = '<div class="empty"><h2>Your bag is empty</h2><a class="button" href="shop.html">Start shopping</a></div>';return; }
  document.getElementById('checkout-summary').innerHTML = orderSummary(false);
  const id = document.getElementById('upi-id');
  id.textContent = STORE.upiId || 'UPI ID will be added before launch';
  if (STORE.upiQrImage) { document.getElementById('upi-qr').src = STORE.upiQrImage;document.getElementById('upi-qr').alt = 'AB Gadgets UPI payment QR code'; }
  if (!whatsappUrl('')) document.getElementById('checkout-status').textContent = 'Preview mode: the store WhatsApp number has not been configured. You can explore checkout, but order requests cannot be sent yet.';
  document.getElementById('checkout-form').addEventListener('submit',event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = data.get('name').trim();const address = data.get('address').trim();
    const phone = data.get('phone').replace(/\D/g,'');
    const error = document.getElementById('checkout-status');
    if (name.length < 2 || address.length < 10 || !/^(?:91)?[6-9]\d{9}$/.test(phone)) {
      error.textContent = 'Enter your name, a valid Indian mobile number and a full delivery address (at least 10 characters).';error.focus();return;
    }
    if (!cart.length) { error.textContent = 'Your bag is empty. Add a product before requesting an order.';return; }
    const message = ['Hello AB Gadgets! I would like to request this order:','',...cart.map(item=>`${byId(item.id).name} × ${item.qty} — ${money(byId(item.id).price*item.qty)}`),'',`Item total: ${money(subtotal())}`,'Shipping, taxes and final total: please confirm.',`Payment preference: ${data.get('payment')}`,`Name: ${name}`,`Phone: ${phone}`,`Delivery address: ${address}`,'','Please confirm availability, delivery, returns and warranty before payment.'].join('\n');
    const url = whatsappUrl(message);
    if (!url) { error.textContent = 'Ordering is not active yet. The store owner needs to add the business WhatsApp number before launch.';error.focus();return; }
    document.getElementById('whatsapp-fallback').href = url;
    document.getElementById('whatsapp-fallback').hidden = false;
    window.open(url, '_blank', 'noopener,noreferrer');
    error.textContent = 'Your request is ready in WhatsApp. Tap Send there to share it. This is not an order confirmation; your bag has been kept.';
  });
}
function renderContact() {
  const values = [['whatsapp-contact',STORE.whatsappNumber,whatsappUrl('Hello AB Gadgets, I have a question.')],['phone-contact',STORE.phone,STORE.phone?'tel:'+STORE.phone.replace(/[^+\d]/g,''):''],['email-contact',STORE.email,STORE.email?'mailto:'+STORE.email:'']];
  values.forEach(([id,value,url]) => { const el=document.getElementById(id);if(value && url){el.textContent=value;el.href=url;}else{el.textContent='Details coming soon';el.removeAttribute('href');} });
}
renderShell();
const page = document.body.dataset.page;
if (page==='home') document.getElementById('featured-products').innerHTML = products.slice(0,4).map(productCard).join('');
if (page==='shop') renderShop();
if (page==='product') renderProduct();
if (page==='cart') renderCart();
if (page==='checkout') renderCheckout();
if (page==='contact') renderContact();
// Event delegation handles controls created dynamically by product/cart rendering.
document.addEventListener('click',event => {
  const add = event.target.closest('[data-add]');if(add) addToCart(add.dataset.add);
  const chatButton = event.target.closest('[data-chat]');if(chatButton) chat('Hello AB Gadgets, I have a question about your products.');
  const qty = event.target.closest('[data-quantity]');
  if(qty){const item=cart.find(row=>row.id===Number(qty.dataset.quantity));if(item){item.qty=Math.max(1,Math.min(99,item.qty+Number(qty.dataset.step)));saveCart();renderCart();const replacement=document.querySelector(`[data-quantity="${item.id}"][data-step="${qty.dataset.step}"]`);if(replacement && !replacement.disabled)replacement.focus();toast('Cart updated. Item total: '+money(subtotal()));}}
  const remove = event.target.closest('[data-remove]');if(remove){cart=cart.filter(item=>item.id!==Number(remove.dataset.remove));saveCart();renderCart();document.querySelector('.remove, #cart-content .button')?.focus();toast('Product removed from your bag.');}
});
// Keep the basket consistent when another tab changes it on a hosted site.
window.addEventListener('storage',event=>{if(event.key===CART_KEY){cart=readCart();updateCartBadge();if(page==='cart')renderCart();if(page==='checkout')location.reload();}});
if (STORE.domain) {
  try { const url = new URL(location.pathname.split('/').pop() + location.search, STORE.domain.replace(/\/$/,'')+'/');document.querySelector('meta[property="og:url"]').content=url.href; } catch { /* Leave relative metadata until a valid domain is configured. */ }
}

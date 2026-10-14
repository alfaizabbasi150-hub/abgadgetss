// Optional built-in Node test runner; no dependencies or build step.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const path = require('path');
process.chdir(path.join(__dirname,'..'));
let checks = 0;
function check(value,message) { assert.ok(value,message); checks++; }
const pages = ['index','shop','product','cart','checkout','about','contact'];
const titles = new Set();
for (const page of pages) {
  const html = fs.readFileSync(page+'.html','utf8');
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  check(!titles.has(title), 'unique title '+page);titles.add(title);
  for (const marker of ['name="description"','property="og:title"','property="og:description"','property="og:image"','property="og:url"','name="viewport"']) check(html.includes(marker),page+' '+marker);
  for(const image of html.matchAll(/<img\b[^>]*>/g))check(/alt="[^"]+"/.test(image[0]),'descriptive alt');
  for(const link of html.matchAll(/(?:src|href)="([^"?#]+)[^"]*"/g))if(!/^(https?:|#)/.test(link[1]))check(fs.existsSync(link[1]),'asset exists '+link[1]);
}
function environment(page='cart', saved='[]', search='') {
  const elements = new Map();
  const element = key => {
    if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:key==='category'?'All':'',dataset:{},content:'',hidden:true,attrs:{},classList:{toggle(){},contains(){return false;}},addEventListener(event,cb){this[event]=cb;},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},removeAttribute(){},focus(){}});
    return elements.get(key);
  };
  let stored=saved;let opened='';
  const document={body:{dataset:{page}},title:'',getElementById:element,querySelector:element,querySelectorAll:()=>[element('badge')],addEventListener(event,cb){this[event]=cb;}};
  const context=vm.createContext({document,location:{search,href:'https://test.invalid/'+page+'.html'+search,pathname:'/'+page+'.html',reload(){}},localStorage:{getItem(){return stored;},setItem(k,v){stored=v;}},URL,URLSearchParams,console,setTimeout:()=>1,clearTimeout(){},FormData:class{constructor(form){this.form=form;}get(k){return this.form.values[k];}}});
  context.window={addEventListener(){},open(url){opened=url;}};
  vm.runInContext(fs.readFileSync('js/products.js','utf8'),context);
  vm.runInContext(fs.readFileSync('js/main.js','utf8'),context);
  return {run:code=>vm.runInContext(code,context),element,document,get stored(){return stored;},get opened(){return opened;}};
}
const app=environment();
check(app.run('products.length')===12,'12 products');
check(app.run('new Set(products.map(p=>p.id)).size')===12,'unique IDs');
for(const p of app.run('products'))check(fs.existsSync(p.image),'product image');
app.run('addToCart(1);addToCart(1);addToCart(4);renderCart()');
check(app.run('subtotal()')===3397,'multi-item totals');
check(JSON.parse(app.stored)[0].qty===2,'quantity saved');
check(environment('cart',app.stored).run('subtotal()')===3397,'refresh persistence');
app.document.click({target:{closest(selector){return selector==='[data-quantity]'?{dataset:{quantity:'1',step:'-1'}}:null;}}});
check(app.run('subtotal()')===2098,'decrease quantity');
app.document.click({target:{closest(selector){return selector==='[data-remove]'?{dataset:{remove:'4'}}:null;}}});
check(app.run('subtotal()')===1299,'remove product');
check(environment('cart','{bad').run('cart.length')===0,'corrupt storage recovery');
check(environment('cart','[{"id":999,"qty":1},{"id":1,"qty":-2}]').run('cart.length')===0,'stale/invalid entries dropped');
check(environment('cart','[{"id":1,"qty":99},{"id":1,"qty":99}]').run('cart[0].qty')===99,'duplicate cap');
check(environment('checkout').element('checkout-content').innerHTML.includes('empty'),'empty checkout');
const shop=environment('shop','[]','?category=Audio');
check(shop.element('results-count').textContent==='6 products','category filtering');
shop.element('search').value='no product matches';shop.element('search').input();
check(shop.element('product-grid').innerHTML.includes('No matches'),'empty search');
shop.element('search').value='';shop.element('category').value='All';shop.element('sort').value='low';shop.element('sort').change();
check(shop.element('product-grid').innerHTML.indexOf('Clear Phone Case')<shop.element('product-grid').innerHTML.indexOf('Everyday Buds'),'price sorting');
check(environment('product','[]','?id=1').document.title==='Everyday Buds | AB Gadgets','dynamic product');
check(environment('product','[]','?id=unknown').element('product-detail').innerHTML.includes('not found'),'unknown product');
const checkout=environment('checkout','[{"id":1,"qty":2}]');
const form=checkout.element('checkout-form');form.values={name:'Test Buyer',phone:'9876543210',address:'Test address, Test City, 110001',payment:'Cash on delivery'};
form.submit({preventDefault(){},currentTarget:form});
check(!checkout.opened && checkout.element('checkout-status').textContent.includes('not active'),'missing number guard');
checkout.run("STORE.whatsappNumber='919999999999'");
form.submit({preventDefault(){},currentTarget:form});
const message=new URL(checkout.opened).searchParams.get('text');
check(message.includes('Everyday Buds × 2 — ₹2,598'),'order product/quantity/price');
check(message.includes('Test Buyer') && message.includes('Cash on delivery') && message.includes('Test address'),'order details');
check(checkout.run('cart.length')===1,'cart retained until actual order confirmation');
form.values.phone='123';form.submit({preventDefault(){},currentTarget:form});
check(checkout.element('checkout-status').textContent.includes('valid Indian'),'phone validation');
console.log('PASS: '+checks+' checks. Browser layout is not covered by these tests.');

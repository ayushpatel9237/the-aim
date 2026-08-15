/* ═══════════════════════════════════════════════════════════
   THE AIM — CART
   Persistent cart (survives refresh + page changes), slide-out
   drawer, header badge, toast. No backend needed yet — at
   checkout it hands off to whatever we wire in Phase 2.
   Requires: js/products-data.js loaded first.
═══════════════════════════════════════════════════════════ */
(function(){
  var KEY = 'ascentra_cart_v1';

  /* ═══ YOUR SHIPPING POLICY — set these to your real numbers ═══
     SHIP_FEE          : delivery charge in ₹ (set 0 if you always ship free)
     FREE_SHIP_ABOVE   : order value above which delivery is free
                         (set to null to charge SHIP_FEE on every order)   */
  var SHIP_FEE = 0;
  var FREE_SHIP_ABOVE = null;

  /* ── storage (degrades safely if blocked) ── */
  var mem = [];
  function read(){
    try{
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return mem; }
  }
  function write(items){
    mem = items;
    try{ localStorage.setItem(KEY, JSON.stringify(items)); }catch(e){}
  }

  var fmt = function(n){ return '₹' + n.toLocaleString('en-IN'); };
  function find(id){
    return (typeof PRODUCTS !== 'undefined')
      ? PRODUCTS.find(function(p){ return p.id === id; })
      : null;
  }

  /* ── public API ── */
  var Cart = {
    items: function(){ return read(); },
    count: function(){
      return read().reduce(function(n,i){ return n + i.qty; }, 0);
    },
    total: function(){
      return read().reduce(function(sum,i){
        var p = find(i.id);
        return sum + (p ? p.price * i.qty : 0);
      }, 0);
    },
    add: function(id, qty){
      qty = qty || 1;
      var items = read();
      var row = items.find(function(i){ return i.id === id; });
      if(row) row.qty = Math.min(row.qty + qty, 10);
      else items.push({ id:id, qty:Math.min(qty,10) });
      write(items); sync();
      var p = find(id);
      toast((p ? p.name : 'Item') + ' added to cart');
      return Cart;
    },
    setQty: function(id, qty){
      var items = read();
      if(qty <= 0) items = items.filter(function(i){ return i.id !== id; });
      else {
        var row = items.find(function(i){ return i.id === id; });
        if(row) row.qty = Math.min(qty, 10);
      }
      write(items); sync();
    },
    remove: function(id){ Cart.setQty(id, 0); },
    clear: function(){ write([]); sync(); },
    open: function(){ drawer.classList.add('open'); document.body.style.overflow='hidden'; },
    close: function(){ drawer.classList.remove('open'); document.body.style.overflow=''; }
  };

  /* ── build drawer + toast once ── */
  var drawer = document.createElement('div');
  drawer.className = 'cart-drawer';
  drawer.innerHTML =
    '<div class="cart-scrim" data-close></div>' +
    '<aside class="cart-panel" role="dialog" aria-label="Your cart">' +
      '<header class="cart-head">' +
        '<span class="cart-title">Your bag</span>' +
        '<button class="cart-x" data-close aria-label="Close cart">✕</button>' +
      '</header>' +
      '<div class="cart-body" id="cartBody"></div>' +
      '<footer class="cart-foot" id="cartFoot"></footer>' +
    '</aside>';
  document.body.appendChild(drawer);

  var toastEl = document.createElement('div');
  toastEl.className = 'cart-toast';
  document.body.appendChild(toastEl);
  var toastTimer;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2400);
  }

  drawer.addEventListener('click', function(e){
    if(e.target.hasAttribute('data-close')) Cart.close();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') Cart.close();
  });

  /* ── render ── */
  function sync(){
    /* header badges */
    var n = Cart.count();
    document.querySelectorAll('[data-cart-count]').forEach(function(el){
      el.textContent = n;
      el.classList.toggle('has', n > 0);
    });

    var body = document.getElementById('cartBody');
    var foot = document.getElementById('cartFoot');
    var items = read();

    if(!items.length){
      body.innerHTML =
        '<div class="cart-empty">' +
          '<span class="ce-mark">✦</span>' +
          '<p>Your bag is empty.</p>' +
          '<a href="shop.html" class="ce-link">Browse the drop →</a>' +
        '</div>';
      foot.innerHTML = '';
      return;
    }

    body.innerHTML = items.map(function(i){
      var p = find(i.id);
      if(!p) return '';
      return '<div class="cart-row" data-id="'+p.id+'">' +
        '<a class="cr-img" href="product.html?id='+p.id+'"><img src="'+p.hero+'" alt="'+p.name+'" /></a>' +
        '<div class="cr-mid">' +
          '<a class="cr-nm" href="product.html?id='+p.id+'">'+p.name+'</a>' +
          '<span class="cr-cat">'+p.category+'</span>' +
          '<div class="cr-qty">' +
            '<button data-dec aria-label="Decrease quantity">−</button>' +
            '<span>'+i.qty+'</span>' +
            '<button data-inc aria-label="Increase quantity">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="cr-end">' +
          '<span class="cr-pr">'+fmt(p.price * i.qty)+'</span>' +
          '<button class="cr-rm" data-rm>Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');

    var total = Cart.total();
    var ship = (FREE_SHIP_ABOVE !== null && total >= FREE_SHIP_ABOVE) ? 0 : SHIP_FEE;
    foot.innerHTML =
      '<a class="cart-view" href="cart.html">View full bag</a>' +
      '<div class="cf-line"><span>Subtotal</span><span>'+fmt(total)+'</span></div>' +
      (SHIP_FEE > 0
        ? '<div class="cf-line"><span>Delivery</span><span>'+(ship ? fmt(ship) : 'Free')+'</span></div>'
        : '') +
      '<div class="cf-total"><span>Total</span><span>'+fmt(total + ship)+'</span></div>' +
      (ship && FREE_SHIP_ABOVE !== null
        ? '<p class="cf-note">Add '+fmt(FREE_SHIP_ABOVE - total)+' more for free delivery</p>'
        : '') +
      '<button class="cf-btn" id="cfCheckout">Checkout →</button>';

    document.getElementById('cfCheckout').addEventListener('click', function(){
      if(!read().length){ toast('Your bag is empty'); return; }
      window.location.href = 'checkout.html';
    });
  }

  /* row controls */
  document.addEventListener('click', function(e){
    var row = e.target.closest('.cart-row');
    if(!row) return;
    var id = row.dataset.id;
    var cur = (read().find(function(i){ return i.id === id; }) || {}).qty || 0;
    if(e.target.hasAttribute('data-inc')) Cart.setQty(id, cur + 1);
    if(e.target.hasAttribute('data-dec')) Cart.setQty(id, cur - 1);
    if(e.target.hasAttribute('data-rm'))  Cart.remove(id);
  });

  /* quick-add buttons on shelf cards */
  document.addEventListener('click', function(e){
    var qa = e.target.closest('[data-add]');
    if(qa){ e.preventDefault(); e.stopPropagation(); Cart.add(qa.dataset.add, 1); }
  });

  /* header cart buttons */
  document.addEventListener('click', function(e){
    if(e.target.closest('[data-cart-open]')){ e.preventDefault(); Cart.open(); }
  });

  /* hooks used by product.html */
  window.addToCart = function(p, qty){ Cart.add(p.id, qty); Cart.open(); };
  /* Buy now means buy now — straight to checkout, not the drawer */
  window.buyNow    = function(p, qty){
    Cart.add(p.id, qty);
    window.location.href = 'checkout.html';
  };
  window.AscentraCart = Cart;

  /* keep tabs in sync */
  window.addEventListener('storage', function(e){ if(e.key === KEY) sync(); });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
})();

/* ═══════════════════════════════════════════════════════════
   THE AIM — CHECKOUT
   Validated address form + order summary. Places the order and
   hands off to payment. Works fully offline (test mode) now; when
   you deploy + add Razorpay keys, it switches to live payment.
═══════════════════════════════════════════════════════════ */
(function(){
  var Cart = window.AscentraCart;
  var page = document.getElementById('page');
  var fmt = function(n){ return '₹' + Number(n).toLocaleString('en-IN'); };
  var find = function(id){ return PRODUCTS.find(function(p){ return p.id === id; }); };

  /* ── shipping policy (keep in sync with cart.js) ── */
  var SHIP_FEE = 0;
  var FREE_SHIP_ABOVE = null;

  var items = Cart ? Cart.items() : [];
  if(!items.length){
    page.innerHTML =
      '<div class="empty-state"><h1>Your bag is empty</h1>' +
      '<p>Add something you didn\'t know you needed.</p>' +
      '<a href="shop.html">Browse all products →</a></div>';
    return;
  }

  var subtotal = items.reduce(function(s,i){ var p=find(i.id); return s + (p?p.price*i.qty:0); }, 0);
  var ship = (FREE_SHIP_ABOVE !== null && subtotal >= FREE_SHIP_ABOVE) ? 0 : SHIP_FEE;
  var total = subtotal + ship;

  page.innerHTML =
  '<a href="index.html" class="back-link">← Continue shopping</a>' +
  '<h1>Checkout</h1>' +
  '<div class="checkout-grid">' +
    '<div class="form-col">' +
      /* contact */
      '<div class="step-label"><span class="num">1</span>Contact</div>' +
      '<div class="field row2">' +
        '<div><label>Full name</label><input id="f-name" placeholder="Your name" autocomplete="name" /><div class="hint" id="h-name">Enter your name</div></div>' +
        '<div><label>Phone</label><input id="f-phone" inputmode="numeric" maxlength="10" placeholder="10-digit mobile" autocomplete="tel" /><div class="hint" id="h-phone">Enter a valid 10-digit number</div></div>' +
      '</div>' +
      '<div class="field"><label>Email (for order updates)</label><input id="f-email" type="email" placeholder="you@email.com" autocomplete="email" /><div class="hint" id="h-email">Enter a valid email</div></div>' +

      /* address */
      '<div class="step-label" style="margin-top:1.8rem"><span class="num">2</span>Delivery address</div>' +
      '<div class="field"><label>Address (house no, street, area)</label><textarea id="f-addr" placeholder="Flat / house no, building, street, area" autocomplete="street-address"></textarea><div class="hint" id="h-addr">Enter your full address</div></div>' +
      '<div class="field row2">' +
        '<div><label>City</label><input id="f-city" placeholder="City" autocomplete="address-level2" /><div class="hint" id="h-city">Enter your city</div></div>' +
        '<div><label>Pincode</label><input id="f-pin" inputmode="numeric" maxlength="6" placeholder="6-digit" autocomplete="postal-code" /><div class="hint" id="h-pin">Enter a valid 6-digit pincode</div></div>' +
      '</div>' +
      '<div class="field"><label>State</label>' +
        '<select id="f-state"><option value="">Select state</option>' + STATES.map(function(s){return '<option>'+s+'</option>';}).join('') + '</select>' +
        '<div class="hint" id="h-state">Select your state</div></div>' +
      '<div class="field"><label>Landmark (optional)</label><input id="f-land" placeholder="Near…" /></div>' +

      /* payment */
      '<div class="step-label" style="margin-top:1.8rem"><span class="num">3</span>Payment</div>' +
      '<div class="pay-methods" id="payMethods">' +
        '<label class="pay-opt sel" data-pay="upi"><span class="radio"></span><div><div class="pt">UPI / Cards / Netbanking</div><div class="ps">Pay securely online via Razorpay</div></div><span class="tag">Recommended</span></label>' +
        '<label class="pay-opt" data-pay="cod"><span class="radio"></span><div><div class="pt">Cash on Delivery</div><div class="ps">Pay when your order arrives</div></div></label>' +
      '</div>' +
    '</div>' +

    /* summary */
    '<aside class="summary">' +
      '<h2>Your order</h2>' +
      '<div id="sumItems">' +
        items.map(function(i){ var p=find(i.id); if(!p) return '';
          return '<div class="sum-row">' +
            '<img src="'+(p.thumb||p.hero)+'" alt="'+p.name+'" />' +
            '<div><div class="sum-nm">'+p.name+'</div><div class="sum-q">Qty '+i.qty+'</div></div>' +
            '<div class="sum-pr">'+fmt(p.price*i.qty)+'</div></div>';
        }).join('') +
      '</div>' +
      '<div style="margin-top:1rem">' +
        '<div class="sum-line"><span>Subtotal</span><span>'+fmt(subtotal)+'</span></div>' +
        (SHIP_FEE>0 ? '<div class="sum-line"><span>Delivery</span><span>'+(ship?fmt(ship):'Free')+'</span></div>' : '<div class="sum-line"><span>Delivery</span><span>Free</span></div>') +
        '<div class="sum-total"><span>Total</span><span>'+fmt(total)+'</span></div>' +
      '</div>' +
      '<button class="place-btn" id="placeBtn">Place order · '+fmt(total)+'</button>' +
      '<div class="trust"><span>Secure checkout</span><span>Ships across India</span><span>Easy returns</span></div>' +
    '</aside>' +
  '</div>';

  /* payment method selection */
  var payMethod = 'upi';
  document.getElementById('payMethods').addEventListener('click', function(e){
    var opt = e.target.closest('[data-pay]'); if(!opt) return;
    document.querySelectorAll('.pay-opt').forEach(function(o){ o.classList.remove('sel'); });
    opt.classList.add('sel'); payMethod = opt.dataset.pay;
  });

  /* validation */
  function val(id){ return document.getElementById(id).value.trim(); }
  function bad(id, hid, show){
    document.getElementById(id).classList.toggle('bad', show);
    document.getElementById(hid).classList.toggle('show', show);
    return !show;
  }
  function validate(){
    var ok = true;
    ok = bad('f-name','h-name', val('f-name').length < 2) && ok;
    ok = bad('f-phone','h-phone', !/^[6-9]\d{9}$/.test(val('f-phone'))) && ok;
    ok = bad('f-email','h-email', !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val('f-email'))) && ok;
    ok = bad('f-addr','h-addr', val('f-addr').length < 8) && ok;
    ok = bad('f-city','h-city', val('f-city').length < 2) && ok;
    ok = bad('f-pin','h-pin', !/^\d{6}$/.test(val('f-pin'))) && ok;
    ok = bad('f-state','h-state', !val('f-state')) && ok;
    return ok;
  }
  /* clear error as user types */
  ['f-name','f-phone','f-email','f-addr','f-city','f-pin','f-state'].forEach(function(id){
    document.getElementById(id).addEventListener('input', function(){
      this.classList.remove('bad');
      var h = document.getElementById('h-'+id.split('-')[1]); if(h) h.classList.remove('show');
    });
  });

  /* place order */
  document.getElementById('placeBtn').addEventListener('click', function(){
    if(!validate()){
      document.querySelector('.bad').scrollIntoView({behavior:'smooth', block:'center'});
      return;
    }
    var customer = {
      name: val('f-name'), phone: val('f-phone'), email: val('f-email'),
      address: val('f-addr'), city: val('f-city'), pincode: val('f-pin'),
      state: val('f-state'), landmark: val('f-land')
    };
    var lineItems = items.map(function(i){ var p=find(i.id);
      return { id:i.id, name:p.name, qty:i.qty, price:p.price, line:p.price*i.qty }; });

    var btn = this; btn.disabled = true; btn.textContent = 'Processing…';

    var refCode = window.ascentraActiveRef ? window.ascentraActiveRef() : null;

    var A = window.Ascentra;
    var live = A && A.configured() && A.raw;

    /* ── SECURE PATH: server creates the order (real prices, real Razorpay) ── */
    if(live){
      A.raw.functions.invoke('create-order', {
        body: { items: lineItems, customer: customer, payment: payMethod, ref_code: refCode, shipping: ship }
      }).then(function(res){
        var d = res.data;
        if(!d || !d.ok) throw new Error((d && d.error) || 'Could not create order');

        if(d.cod){                                   // COD confirmed on server
          storeLocal({ id:d.order.id, customer:customer, items:lineItems, subtotal:subtotal, shipping:ship, total:total, payment:'cod', status:'confirmed' });
          done();
          return;
        }
        // online: open Razorpay with the SERVER's order id
        openRazorpay(d, customer, btn);
      }).catch(function(err){
        alert('Checkout error: ' + err.message);
        btn.disabled=false; btn.textContent='Place order · '+fmt(total);
      });
      return;
    }

    /* ── DEMO PATH (no backend yet): local only, so you can preview the flow ── */
    var order = { id:'AIM'+Date.now().toString().slice(-8), customer:customer, items:lineItems,
                  subtotal:subtotal, shipping:ship, total:total, payment:payMethod,
                  status: payMethod==='cod'?'confirmed':'demo_unpaid' };
    storeLocal(order);
        done();
  });

  /* open Razorpay using the server-created order, then verify on the server */
  function openRazorpay(d, customer, btn){
    if(!window.Razorpay){ alert('Payment library not loaded.'); btn.disabled=false; btn.textContent='Place order · '+fmt(total); return; }
    var A = window.Ascentra;
    var rz = new Razorpay({
      key: d.razorpay_key,
      order_id: d.razorpay_order_id,               // created server-side
      amount: Math.round(d.order.total * 100),
      currency: 'INR',
      name: 'The AIM',
      description: 'Order ' + d.order.id,
      prefill: { name: customer.name, email: customer.email, contact: customer.phone },
      theme: { color: '#4FA8FF' },
      handler: function(resp){
        // verify the signature on the server before trusting the payment
        A.raw.functions.invoke('verify-payment', {
          body: {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature
          }
        }).then(function(vres){
          if(vres.data && vres.data.ok){
            storeLocal({ id:d.order.id, customer:customer, total:d.order.total, status:'paid', payment:'upi' });
            done();
          } else {
            alert('Payment could not be verified. If money was deducted, contact us — nothing is lost.');
            btn.disabled=false; btn.textContent='Place order · '+fmt(total);
          }
        });
      },
      modal: { ondismiss: function(){ btn.disabled=false; btn.textContent='Place order · '+fmt(total); } }
    });
    rz.open();
  }

  function storeLocal(order){
    try{
      localStorage.setItem('ascentra_last_order', JSON.stringify(order));
      var all = JSON.parse(localStorage.getItem('ascentra_orders')||'[]');
      all.unshift(order); localStorage.setItem('ascentra_orders', JSON.stringify(all));
    }catch(e){}
  }
  function done(){ if(Cart) Cart.clear(); window.location.href = 'order-confirmed.html'; }
})();

/* Indian states/UTs for the address dropdown */
var STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman & Nicobar","Chandigarh","Dadra & Nagar Haveli and Daman & Diu","Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry"];

/* ═══════════════════════════════════════════════════════════
   THE AIM — CHECKOUT
   Address form + order summary, then hands off to payment.
   The order is created server-side (Supabase Edge Function
   `create-order`) so prices and totals can't be tampered with
   from the browser; Razorpay is opened with the server's order
   id and the signature is verified server-side afterwards.
═══════════════════════════════════════════════════════════ */

/* Indian states/UTs — defined before use */
var STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman & Nicobar","Chandigarh","Dadra & Nagar Haveli and Daman & Diu","Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry"];

(function(){
  var Cart = window.AscentraCart;
  var page = document.getElementById('page');
  if(!page) return;
  var fmt  = function(n){ return '\u20b9' + Number(n).toLocaleString('en-IN'); };
  var find = function(id){ return PRODUCTS.find(function(p){ return p.id === id; }); };
  var esc  = function(t){ return String(t==null?'':t).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };

  /* ── shipping policy (keep in sync with cart.js) ── */
  var SHIP_FEE = 0;
  var FREE_SHIP_ABOVE = null;

  /* inject styling so the page renders correctly on its own */
  var st = document.createElement('style');
  st.textContent = `/* ══════════════════════════════════════════════════════════
   CHECKOUT — self-contained styling, injected by this file so
   it renders correctly whatever else is on the page.
   ══════════════════════════════════════════════════════════ */
.co-wrap{max-width:1120px;margin:0 auto;padding:2rem 1.1rem 5rem;}
.co-back{display:inline-flex;align-items:center;gap:.5em;font-family:var(--f-mono,monospace);
  font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:#8E96B8;
  text-decoration:none;margin-bottom:1.4rem;transition:color .2s;}
.co-back:hover{color:#D8C3A0;}
.co-h1{font-family:var(--f-body,system-ui),sans-serif;font-weight:700;
  font-size:clamp(1.6rem,4vw,2.1rem);color:#FFF1E2;margin:0 0 .35rem;letter-spacing:-.02em;}
.co-sub{color:#6E6C78;font-size:.82rem;margin:0 0 2rem;}

/* progress rail */
.co-rail{display:flex;align-items:center;gap:.6rem;margin:0 0 2.2rem;flex-wrap:wrap;}
.co-rail i{font-style:normal;display:inline-flex;align-items:center;gap:.5em;
  font-family:var(--f-mono,monospace);font-size:.56rem;letter-spacing:.16em;
  text-transform:uppercase;color:#6E6C78;}
.co-rail i.on{color:#D8C3A0;}
.co-rail i b{width:19px;height:19px;border-radius:50%;display:inline-flex;
  align-items:center;justify-content:center;font-size:.58rem;font-weight:700;
  border:1px solid rgba(216,195,160,.3);color:#8E96B8;}
.co-rail i.on b{background:#D8C3A0;color:#0A0F26;border-color:#D8C3A0;}
.co-rail s{flex:1;min-width:14px;max-width:44px;height:1px;background:rgba(255,255,255,.1);
  text-decoration:none;}

.co-grid{display:grid;grid-template-columns:1fr;gap:1.6rem;align-items:start;}
@media(min-width:900px){.co-grid{grid-template-columns:1fr 370px;gap:2.4rem;}}

/* ── panels ── */
.co-panel{background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.075);
  border-radius:16px;padding:1.4rem 1.3rem;margin-bottom:1.1rem;}
.co-step{display:flex;align-items:center;gap:.7rem;margin:0 0 1.2rem;}
.co-step b{width:24px;height:24px;flex:none;border-radius:50%;background:rgba(216,195,160,.13);
  border:1px solid rgba(216,195,160,.32);color:#D8C3A0;display:flex;align-items:center;
  justify-content:center;font-family:var(--f-mono,monospace);font-size:.62rem;font-weight:700;}
.co-step span{font-family:var(--f-body,system-ui),sans-serif;font-weight:600;
  font-size:1rem;color:#FFF1E2;}
.co-step em{margin-left:auto;font-style:normal;font-family:var(--f-mono,monospace);
  font-size:.55rem;letter-spacing:.14em;text-transform:uppercase;color:#5F678E;}

/* ── fields ── */
.co-f{margin-bottom:1rem;}
.co-2{display:grid;grid-template-columns:1fr;gap:1rem;}
@media(min-width:520px){.co-2{grid-template-columns:1fr 1fr;}}
.co-f label{display:block;font-family:var(--f-mono,monospace);font-size:.55rem;
  letter-spacing:.16em;text-transform:uppercase;color:#8E96B8;margin-bottom:.45rem;}
.co-f input,.co-f textarea,.co-f select{
  width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
  border-radius:11px;padding:.82rem .9rem;color:#FFF1E2;font-size:.92rem;
  font-family:inherit;transition:border-color .2s,background .2s,box-shadow .2s;
  -webkit-appearance:none;appearance:none;}
.co-f textarea{min-height:84px;resize:vertical;line-height:1.55;}
.co-f select{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8'><path d='M1 1l5 5 5-5' stroke='%238E96B8' stroke-width='1.5' fill='none'/></svg>");
  background-repeat:no-repeat;background-position:right 1rem center;padding-right:2.4rem;}
.co-f input::placeholder,.co-f textarea::placeholder{color:#4A5170;}
.co-f input:focus,.co-f textarea:focus,.co-f select:focus{
  outline:none;border-color:rgba(216,195,160,.5);background:rgba(255,255,255,.06);
  box-shadow:0 0 0 3px rgba(216,195,160,.09);}
.co-f input.bad,.co-f textarea.bad,.co-f select.bad{border-color:#E08A7A;background:rgba(224,138,122,.05);}
.co-hint{font-size:.7rem;color:#E08A7A;margin-top:.4rem;display:none;}
.co-hint.show{display:block;}

/* ── payment ── */
.co-pay{display:flex;flex-direction:column;gap:.65rem;}
.co-opt{display:flex;align-items:center;gap:.85rem;cursor:pointer;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);
  border-radius:13px;padding:1rem;transition:border-color .2s,background .2s;}
.co-opt:hover{border-color:rgba(216,195,160,.3);}
.co-opt.sel{border-color:#D8C3A0;background:rgba(216,195,160,.07);}
.co-radio{width:17px;height:17px;flex:none;border-radius:50%;
  border:1.5px solid rgba(255,255,255,.28);position:relative;transition:border-color .2s;}
.co-opt.sel .co-radio{border-color:#D8C3A0;}
.co-opt.sel .co-radio::after{content:"";position:absolute;inset:3px;border-radius:50%;background:#D8C3A0;}
.co-opt .pt{color:#FFF1E2;font-size:.9rem;margin-bottom:.15rem;}
.co-opt .ps{color:#6E6C78;font-size:.74rem;}
.co-tag{margin-left:auto;font-family:var(--f-mono,monospace);font-size:.5rem;
  letter-spacing:.12em;text-transform:uppercase;color:#7FBFA0;
  border:1px solid rgba(127,191,160,.35);background:rgba(127,191,160,.1);
  padding:.3em .7em;border-radius:999px;white-space:nowrap;}

/* ── summary ── */
.co-sum{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);
  border-radius:16px;padding:1.3rem;}
@media(min-width:900px){.co-sum{position:sticky;top:1.5rem;}}
.co-sum h2{font-family:var(--f-mono,monospace);font-size:.58rem;letter-spacing:.22em;
  text-transform:uppercase;color:#8E96B8;margin:0 0 1.1rem;font-weight:400;}
.co-row{display:flex;gap:.85rem;align-items:center;padding:.7rem 0;
  border-bottom:1px solid rgba(255,255,255,.055);}
.co-row:last-of-type{border-bottom:none;}
.co-row img{width:52px;height:52px;flex:none;border-radius:9px;object-fit:cover;background:#FFF1E2;}
.co-row .nm{color:#FFF1E2;font-size:.84rem;line-height:1.3;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.co-row .q{font-family:var(--f-mono,monospace);font-size:.6rem;color:#6E6C78;margin-top:.2rem;}
.co-row .pr{margin-left:auto;font-family:var(--f-mono,monospace);font-size:.8rem;
  color:#FFF1E2;white-space:nowrap;}
.co-lines{margin-top:1.1rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.08);}
.co-line{display:flex;justify-content:space-between;font-size:.82rem;
  color:#8E96B8;padding:.34rem 0;}
.co-line b{color:#7FBFA0;font-weight:400;}
.co-tot{display:flex;justify-content:space-between;align-items:baseline;
  margin-top:.8rem;padding-top:.9rem;border-top:1px solid rgba(255,255,255,.1);}
.co-tot span:first-child{color:#FFF1E2;font-size:.92rem;}
.co-tot span:last-child{font-family:var(--f-body,system-ui),sans-serif;font-weight:700;
  font-size:1.5rem;color:#D8C3A0;letter-spacing:-.02em;}
.co-btn{width:100%;margin-top:1.2rem;padding:1.05rem;cursor:pointer;border-radius:13px;
  border:0.5px solid rgba(255,255,255,.8);
  background:linear-gradient(180deg,#FFFFFF,#EFECE4);color:#0A0F26;
  font-family:var(--f-body,system-ui),sans-serif;font-size:.95rem;font-weight:700;
  box-shadow:inset 0 1px 0 rgba(255,255,255,1),0 8px 24px rgba(255,255,255,.13);
  transition:transform .15s,box-shadow .2s,opacity .2s;}
.co-btn:hover:not(:disabled){transform:translateY(-1px);}
.co-btn:disabled{opacity:.55;cursor:not-allowed;transform:none;}
.co-trust{display:flex;flex-wrap:wrap;gap:.5rem .9rem;margin-top:1.1rem;
  padding-top:1rem;border-top:1px solid rgba(255,255,255,.06);}
.co-trust span{display:inline-flex;align-items:center;gap:.4em;
  font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:.1em;
  text-transform:uppercase;color:#5F678E;}
.co-trust i{font-style:normal;color:#D8C3A0;}
.co-secure{display:flex;align-items:center;justify-content:center;gap:.5em;
  margin-top:.9rem;font-family:var(--f-mono,monospace);font-size:.54rem;
  letter-spacing:.12em;text-transform:uppercase;color:#5F678E;}

/* ── empty ── */
.co-empty{text-align:center;padding:5rem 1rem;}
.co-empty .mk{font-size:2rem;color:#D8C3A0;display:block;margin-bottom:1.2rem;opacity:.5;}
.co-empty h1{font-family:var(--f-display,serif);font-size:clamp(1.7rem,5vw,2.4rem);
  color:#FFF1E2;margin:0 0 .7rem;font-weight:400;}
.co-empty p{color:#6E6C78;margin:0 0 2rem;}
.co-empty a{display:inline-block;font-family:var(--f-mono,monospace);font-size:.62rem;
  letter-spacing:.2em;text-transform:uppercase;color:#D8C3A0;text-decoration:none;
  border:1px solid rgba(216,195,160,.35);border-radius:11px;padding:.9rem 1.7rem;
  transition:background .2s,border-color .2s;}
.co-empty a:hover{background:rgba(216,195,160,.1);border-color:#D8C3A0;}

/* ── error banner ── */
.co-err{display:none;align-items:flex-start;gap:.7rem;background:rgba(224,138,122,.09);
  border:1px solid rgba(224,138,122,.32);border-radius:12px;padding:.9rem 1rem;
  margin-bottom:1.2rem;color:#F0C4BB;font-size:.84rem;line-height:1.55;}
.co-err.show{display:flex;}
.co-err i{font-style:normal;color:#E08A7A;flex:none;}
`;
  document.head.appendChild(st);

  var items = Cart ? Cart.items() : [];

  if(!items.length){
    page.innerHTML =
      '<div class="co-wrap"><div class="co-empty">' +
        '<span class="mk">\u2726</span>' +
        '<h1>Your bag is empty</h1>' +
        '<p>Add something you didn\'t know you needed.</p>' +
        '<a href="shop.html">Browse all products</a>' +
      '</div></div>';
    return;
  }

  /* drop anything whose product no longer exists, so totals stay honest */
  items = items.filter(function(i){ return !!find(i.id); });
  if(!items.length){
    page.innerHTML =
      '<div class="co-wrap"><div class="co-empty">' +
        '<span class="mk">\u2726</span><h1>Your bag needs a refresh</h1>' +
        '<p>Those items are no longer available.</p>' +
        '<a href="shop.html">Browse all products</a>' +
      '</div></div>';
    return;
  }

  var subtotal = items.reduce(function(s,i){ var p=find(i.id); return s + p.price*i.qty; }, 0);
  var ship  = (FREE_SHIP_ABOVE !== null && subtotal >= FREE_SHIP_ABOVE) ? 0 : SHIP_FEE;
  var total = subtotal + ship;
  var count = items.reduce(function(n,i){ return n + i.qty; }, 0);
  var savings = items.reduce(function(s,i){
    var p = find(i.id);
    return s + ((p.mrp && p.mrp > p.price) ? (p.mrp - p.price) * i.qty : 0);
  }, 0);

  page.innerHTML =
  '<div class="co-wrap">' +
    '<a href="cart.html" class="co-back">\u2190 Back to bag</a>' +
    '<h1 class="co-h1">Checkout</h1>' +
    '<p class="co-sub">' + count + (count===1?' item':' items') + ' \u00b7 delivered across India in 1\u20132 days</p>' +

    '<div class="co-rail">' +
      '<i class="on"><b>\u2713</b>Bag</i><s></s>' +
      '<i class="on"><b>2</b>Details</i><s></s>' +
      '<i><b>3</b>Payment</i>' +
    '</div>' +

    '<div class="co-err" id="coErr"><i>!</i><span id="coErrMsg"></span></div>' +

    '<div class="co-grid">' +
      '<div>' +

        '<div class="co-panel">' +
          '<div class="co-step"><b>1</b><span>Contact</span><em>For order updates</em></div>' +
          '<div class="co-2">' +
            '<div class="co-f"><label>Full name</label>' +
              '<input id="f-name" placeholder="Your name" autocomplete="name" />' +
              '<div class="co-hint" id="h-name">Enter your name</div></div>' +
            '<div class="co-f"><label>Phone</label>' +
              '<input id="f-phone" inputmode="numeric" maxlength="10" placeholder="10-digit mobile" autocomplete="tel" />' +
              '<div class="co-hint" id="h-phone">Enter a valid 10-digit number</div></div>' +
          '</div>' +
          '<div class="co-f"><label>Email</label>' +
            '<input id="f-email" type="email" placeholder="you@email.com" autocomplete="email" />' +
            '<div class="co-hint" id="h-email">Enter a valid email</div></div>' +
        '</div>' +

        '<div class="co-panel">' +
          '<div class="co-step"><b>2</b><span>Delivery address</span></div>' +
          '<div class="co-f"><label>Address</label>' +
            '<textarea id="f-addr" placeholder="Flat / house no, building, street, area" autocomplete="street-address"></textarea>' +
            '<div class="co-hint" id="h-addr">Enter your full address</div></div>' +
          '<div class="co-2">' +
            '<div class="co-f"><label>City</label>' +
              '<input id="f-city" placeholder="City" autocomplete="address-level2" />' +
              '<div class="co-hint" id="h-city">Enter your city</div></div>' +
            '<div class="co-f"><label>Pincode</label>' +
              '<input id="f-pin" inputmode="numeric" maxlength="6" placeholder="6-digit" autocomplete="postal-code" />' +
              '<div class="co-hint" id="h-pin">Enter a valid 6-digit pincode</div></div>' +
          '</div>' +
          '<div class="co-2">' +
            '<div class="co-f"><label>State</label>' +
              '<select id="f-state"><option value="">Select state</option>' +
                STATES.map(function(s){ return '<option>'+s+'</option>'; }).join('') +
              '</select><div class="co-hint" id="h-state">Select your state</div></div>' +
            '<div class="co-f"><label>Landmark (optional)</label>' +
              '<input id="f-land" placeholder="Near\u2026" /></div>' +
          '</div>' +
        '</div>' +

        '<div class="co-panel">' +
          '<div class="co-step"><b>3</b><span>Payment</span></div>' +
          '<div class="co-pay" id="payMethods">' +
            '<label class="co-opt sel" data-pay="upi"><span class="co-radio"></span>' +
              '<div><div class="pt">UPI \u00b7 Cards \u00b7 Netbanking</div>' +
              '<div class="ps">Pay securely online via Razorpay</div></div>' +
              '<span class="co-tag">Recommended</span></label>' +
            '<label class="co-opt" data-pay="cod"><span class="co-radio"></span>' +
              '<div><div class="pt">Cash on Delivery</div>' +
              '<div class="ps">Pay when your order arrives</div></div></label>' +
          '</div>' +
        '</div>' +

      '</div>' +

      '<aside class="co-sum">' +
        '<h2>Order summary</h2>' +
        items.map(function(i){
          var p = find(i.id);
          return '<div class="co-row">' +
            '<img src="'+esc(p.thumb||p.hero)+'" alt="'+esc(p.name)+'" />' +
            '<div><div class="nm">'+esc(p.name)+'</div><div class="q">Qty '+i.qty+'</div></div>' +
            '<div class="pr">'+fmt(p.price*i.qty)+'</div></div>';
        }).join('') +
        '<div class="co-lines">' +
          '<div class="co-line"><span>Subtotal</span><span>'+fmt(subtotal)+'</span></div>' +
          (savings > 0 ? '<div class="co-line"><span>You save</span><b>\u2212'+fmt(savings)+'</b></div>' : '') +
          '<div class="co-line"><span>Delivery</span><span>'+(ship ? fmt(ship) : 'Free')+'</span></div>' +
          '<div class="co-tot"><span>Total</span><span>'+fmt(total)+'</span></div>' +
        '</div>' +
        '<button class="co-btn" id="placeBtn">Place order \u00b7 '+fmt(total)+'</button>' +
        '<div class="co-secure">\u1f512 Secure checkout</div>'.replace('\u1f512','\u25c8') +
        '<div class="co-trust">' +
          '<span><i>\u25c8</i>Secure payment</span>' +
          '<span><i>\u21c4</i>7-day returns</span>' +
          '<span><i>\u2691</i>Ships pan-India</span>' +
        '</div>' +
      '</aside>' +
    '</div>' +
  '</div>';

  /* ── payment method selection ── */
  var payMethod = 'upi';
  document.getElementById('payMethods').addEventListener('click', function(e){
    var opt = e.target.closest('[data-pay]'); if(!opt) return;
    document.querySelectorAll('.co-opt').forEach(function(o){ o.classList.remove('sel'); });
    opt.classList.add('sel'); payMethod = opt.dataset.pay;
  });

  /* ── error banner ── */
  var errBox = document.getElementById('coErr');
  var errMsg = document.getElementById('coErrMsg');
  function showErr(msg){
    errMsg.textContent = msg;
    errBox.classList.add('show');
    errBox.scrollIntoView({behavior:'smooth', block:'center'});
  }
  function hideErr(){ errBox.classList.remove('show'); }

  /* ── validation ── */
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
  /* clear the error as soon as they start fixing it */
  ['f-name','f-phone','f-email','f-addr','f-city','f-pin','f-state'].forEach(function(id){
    var el = document.getElementById(id);
    ['input','change'].forEach(function(ev){
      el.addEventListener(ev, function(){
        this.classList.remove('bad');
        var h = document.getElementById('h-'+id.split('-')[1]);
        if(h) h.classList.remove('show');
      });
    });
  });

  /* signed-in customers get their saved details filled in */
  document.addEventListener('account:ready', function(e){
    var u = e.detail && e.detail.user;
    if(!u) return;
    var em = document.getElementById('f-email');
    if(em && !em.value) em.value = u.email || '';
    var A2 = window.Ascentra;
    if(A2 && A2.raw){
      A2.raw.from('customer_profiles').select('*').eq('user_id', u.id).maybeSingle()
        .then(function(r){
          var p = r && r.data; if(!p) return;
          var map = { 'f-name':p.name, 'f-phone':p.phone, 'f-addr':p.address,
                      'f-city':p.city, 'f-pin':p.pincode, 'f-state':p.state };
          Object.keys(map).forEach(function(k){
            var el = document.getElementById(k);
            if(el && !el.value && map[k]) el.value = map[k];
          });
        }).catch(function(){});
    }
  });

  /* ── place order ── */
  var btn = document.getElementById('placeBtn');
  function resetBtn(){ btn.disabled = false; btn.textContent = 'Place order \u00b7 ' + fmt(total); }

  btn.addEventListener('click', function(){
    hideErr();
    if(!validate()){
      var firstBad = document.querySelector('.bad');
      if(firstBad) firstBad.scrollIntoView({behavior:'smooth', block:'center'});
      showErr('Please check the highlighted fields.');
      return;
    }
    var customer = {
      name: val('f-name'), phone: val('f-phone'), email: val('f-email'),
      address: val('f-addr'), city: val('f-city'), pincode: val('f-pin'),
      state: val('f-state'), landmark: val('f-land')
    };
    var lineItems = items.map(function(i){ var p=find(i.id);
      return { id:i.id, name:p.name, qty:i.qty, price:p.price, line:p.price*i.qty }; });

    btn.disabled = true; btn.textContent = 'Processing\u2026';

    var refCode = window.ascentraActiveRef ? window.ascentraActiveRef() : null;

    var A = window.Ascentra;
    var live = A && A.configured() && A.raw;

    /* ── SECURE PATH: the server creates the order ── */
    if(live){
      A.raw.functions.invoke('create-order', {
        body: { items: lineItems, customer: customer, payment: payMethod,
                ref_code: refCode, shipping: ship }
      }).then(function(res){
        var d = res.data;
        if(res.error) throw new Error(res.error.message || 'Could not reach the order service');
        if(!d || !d.ok) throw new Error((d && d.error) || 'Could not create order');

        if(d.cod){                                   /* COD confirmed on the server */
          try{
            storeLocal({ id:d.order.id, customer:customer, items:lineItems, subtotal:subtotal,
                         shipping:ship, total:total, payment:'cod', status:'confirmed' });
          }catch(e){ console.error('could not save local order copy', e); }
          try{ if(Cart) Cart.clear(); }catch(e){ console.error('could not clear cart', e); }
          window.location.href = 'order-confirmed.html';
          return;
        }
        openRazorpay(d, customer);
      }, function(err){
        /* second argument, not .catch — see the note on verify-payment */
        console.error('create-order call failed', err);
        showErr((err && err.message) || 'Something went wrong placing your order. Please try again.');
        resetBtn();
      });
      return;
    }

    /* ── DEMO PATH (no backend configured): local only ── */
    var order = { id:'AIM'+Date.now().toString().slice(-8), customer:customer, items:lineItems,
                  subtotal:subtotal, shipping:ship, total:total, payment:payMethod,
                  status: payMethod==='cod'?'confirmed':'demo_unpaid' };
    storeLocal(order);
    done();
  });

  /* open Razorpay with the server-created order, then verify server-side */
  function openRazorpay(d, customer){
    if(!window.Razorpay){
      showErr('Payment library did not load. Check your connection and try again.');
      resetBtn(); return;
    }
    var A = window.Ascentra;
    var rz = new Razorpay({
      key: d.razorpay_key,
      order_id: d.razorpay_order_id,
      amount: Math.round(d.order.total * 100),
      currency: 'INR',
      name: 'The AIM',
      description: 'Order ' + d.order.id,
      prefill: { name: customer.name, email: customer.email, contact: customer.phone },
      theme: { color: '#D8C3A0' },
      handler: function(resp){
        btn.textContent = 'Confirming\u2026';
        A.raw.functions.invoke('verify-payment', {
          body: {
            razorpay_order_id:   resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature:  resp.razorpay_signature
          }
        }).then(
          /* ── SUCCESS ── */
          function(vres){
            var verified = !!(vres && vres.data && vres.data.ok);
            if(!verified){
              showErr('Payment could not be verified. If money was deducted, contact us on WhatsApp \u2014 nothing is lost and we will sort it out.');
              resetBtn();
              return;
            }
            /* The payment IS verified from here on. Nothing below may
               report a failure to the customer — if saving a local copy
               breaks, that is our problem, not theirs. */
            try{
              storeLocal({ id:d.order.id, customer:customer, items:lineItems,
                           subtotal:subtotal, shipping:ship, total:d.order.total,
                           status:'paid', payment:'upi',
                           razorpay_payment_id: resp.razorpay_payment_id });
            }catch(e){ console.error('could not save local order copy', e); }

            try{ if(Cart) Cart.clear(); }catch(e){ console.error('could not clear cart', e); }
            window.location.href = 'order-confirmed.html';
          },
          /* ── FAILURE ── only a genuine network/server failure lands here,
             because it is the second argument to .then rather than a
             .catch chained after it. A .catch would also swallow errors
             thrown in the success handler and wrongly tell a paying
             customer their payment failed. */
          function(err){
            console.error('verify-payment call failed', err);
            showErr('Payment could not be verified. If money was deducted, contact us on WhatsApp \u2014 nothing is lost and we will sort it out.');
            resetBtn();
          }
        );
      },
      modal: { ondismiss: function(){ resetBtn(); } }
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

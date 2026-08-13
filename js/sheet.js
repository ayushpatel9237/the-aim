/* ═══════════════════════════════════════════════════════════
   THE AIM — PRODUCT SHEET

   Tapping any product opens it as a panel over the page — the
   background stays exactly where it was, blurred behind. Closing
   returns you to the same spot, no reload.

   Layout: framed photo with corner brackets, thumbnail rail
   beneath it, then the info as one flat column — seller, SKU,
   name, gold-ruled price, description, full details, and the
   quantity / buy / bag row. No cards; spacing holds it apart.
═══════════════════════════════════════════════════════════ */
(function(){
  if(typeof PRODUCTS === 'undefined') return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent = [
    /* ── scrim ── */
    '.sh-scrim{position:fixed;inset:0;z-index:9000;background:rgba(3,5,16,.72);',
      'backdrop-filter:blur(26px) saturate(140%);-webkit-backdrop-filter:blur(26px) saturate(140%);',
      'opacity:0;transition:opacity .4s ease;}',
    '.sh-scrim.on{opacity:1;}',

    /* ── the panel: one column, always ── */
    '.sh{position:fixed;z-index:9001;left:50%;top:50%;transform:translate(-50%,-50%);',
      'width:min(600px,94vw);max-height:92vh;overflow-y:auto;overflow-x:hidden;',
      'background:rgba(5,8,24,.94);border:1px solid rgba(230,203,168,.12);border-radius:22px;',
      'box-shadow:0 40px 90px -30px rgba(0,0,0,.9);padding:.85rem;scrollbar-width:none;',
      'opacity:0;transform:translate(-50%,-48%) scale(.985);',
      'transition:opacity .45s ease, transform .5s cubic-bezier(.2,.7,.24,1);}',
    '.sh.on{opacity:1;transform:translate(-50%,-50%) scale(1);}',
    '.sh::-webkit-scrollbar{display:none;}',

    /* ── framed photo, gold corner brackets ── */
    '.sh-frame{position:relative;background:#080C1F;border:1px solid rgba(230,203,168,.14);',
      'border-radius:18px;padding:1.1rem;}',
    '.sh-frame .ck{position:absolute;width:16px;height:16px;border:1px solid #E6CBA8;opacity:.8;}',
    '.sh-frame .ck.tl{top:12px;left:12px;border-right:none;border-bottom:none;}',
    '.sh-frame .ck.tr{top:12px;right:12px;border-left:none;border-bottom:none;}',
    '.sh-frame .ck.bl{bottom:12px;left:12px;border-right:none;border-top:none;}',
    '.sh-frame .ck.br{bottom:12px;right:12px;border-left:none;border-top:none;}',
    '.sh-ph{width:100%;background:#FFF1E2;border-radius:10px;overflow:hidden;cursor:zoom-in;',
      'display:flex;align-items:center;justify-content:center;}',
    '.sh-ph img{width:100%;height:auto;max-height:52vh;object-fit:contain;display:block;}',
    '.sh-main{position:absolute;left:20px;bottom:20px;z-index:3;display:none;',
      'font-family:var(--f-mono,monospace);font-size:.54rem;letter-spacing:.18em;text-transform:uppercase;',
      'background:rgba(5,8,24,.86);color:#FFF1E2;border:1px solid rgba(230,203,168,.3);',
      'padding:.55em 1em;border-radius:8px;cursor:pointer;backdrop-filter:blur(6px);}',
    '.sh-main.on{display:inline-flex;}',
    '.sh-main:hover{border-color:#E6CBA8;color:#F0DCC0;}',

    /* ── thumbnail rail, bare on the background ── */
    '.sh-rail{display:flex;gap:.5rem;overflow-x:auto;scrollbar-width:none;margin-top:.7rem;padding:.15rem;}',
    '.sh-rail::-webkit-scrollbar{display:none;}',
    '.sh-t{flex:none;width:74px;height:74px;border-radius:10px;overflow:hidden;cursor:pointer;',
      'background:#FFF1E2;border:2px solid transparent;opacity:.6;padding:2px;',
      'transition:opacity .25s,border-color .25s,transform .25s;',
      'display:flex;align-items:center;justify-content:center;}',
    '.sh-t:hover{opacity:1;transform:translateY(-2px);}',
    '.sh-t img{width:100%;height:100%;object-fit:contain;display:block;}',
    '.sh-t.on{opacity:1;border-color:#E6CBA8;}',
    '.sh-t.vid{position:relative;}',
    '.sh-t.vid::after{content:"▶";position:absolute;inset:0;display:flex;align-items:center;',
      'justify-content:center;background:rgba(5,8,24,.45);color:#fff;font-size:.75rem;}',

    /* ── info: flat column, spacing only ── */
    '.sh-body{padding:1.6rem .6rem .5rem;display:flex;flex-direction:column;gap:1.1rem;}',
    '.sh-body > *{margin:0;}',

    '.sh-seller{font-family:var(--f-mono,monospace);font-size:.6rem;letter-spacing:.3em;',
      'text-transform:uppercase;color:#E6CBA8;}',
    '.sh-skurow{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap;margin-top:-.75rem;}',
    '.sh-sku{font-family:var(--f-mono,monospace);font-size:.64rem;letter-spacing:.22em;',
      'text-transform:uppercase;color:#8E96B8;}',
    '.sh-badge{font-family:var(--f-mono,monospace);font-size:.54rem;letter-spacing:.12em;',
      'text-transform:uppercase;color:#5FA88C;border:1px solid rgba(106,168,143,.45);',
      'background:rgba(106,168,143,.1);padding:.32em .85em;border-radius:999px;}',

    '.sh-name{font-family:var(--f-body,system-ui),sans-serif;font-weight:600;',
      'font-size:clamp(1.35rem,4.4vw,1.75rem);line-height:1.18;letter-spacing:-.015em;',
      'color:#FFF1E2;overflow-wrap:anywhere;margin-top:-.35rem;}',
    '.sh-tagline{color:#8E96B8;font-size:.9rem;margin-top:-.7rem;}',

    /* price behind its gold rule */
    '.sh-pricebox{border-left:3px solid #E6CBA8;padding-left:1.05rem;display:flex;',
      'flex-direction:column;gap:.28rem;}',
    '.sh-price-row{display:flex;align-items:baseline;gap:.85rem;flex-wrap:wrap;}',
    '.sh-price{font-family:var(--f-body,system-ui),sans-serif;font-weight:600;',
      'font-size:clamp(1.7rem,6vw,2.1rem);line-height:1.05;color:#F0DCC0;}',
    '.sh-mrp{font-family:var(--f-mono,monospace);font-size:.72rem;color:#8E96B8;letter-spacing:.04em;}',
    '.sh-mrp s{color:#5F678E;}',
    '.sh-mrp b{color:#5FA88C;font-weight:700;}',
    '.sh-taxline{font-size:.76rem;color:#5F678E;}',
    '.sh-taxline i{color:#5FA88C;font-style:normal;}',

    '.sh-stock{font-family:var(--f-mono,monospace);font-size:.6rem;letter-spacing:.14em;',
      'text-transform:uppercase;color:#5FA88C;margin-top:-.55rem;}',
    '.sh-stock.low{color:#F0DCC0;} .sh-stock.out{color:#E08A7A;}',

    '.sh-desc{color:#8E96B8;line-height:1.75;font-size:.92rem;overflow-wrap:anywhere;}',

    /* full details — an underlined link, not a bar */
    '.sh-more-btn{align-self:flex-start;background:none;border:none;cursor:pointer;padding:0 0 .35em;',
      'font-family:var(--f-mono,monospace);font-size:.64rem;letter-spacing:.22em;text-transform:uppercase;',
      'color:#E6CBA8;border-bottom:1px dashed #E6CBA8;display:inline-flex;align-items:center;gap:.5em;}',
    '.sh-more-btn:hover{color:#F0DCC0;}',
    '.sh-more{max-height:0;overflow:hidden;transition:max-height .45s cubic-bezier(.2,.7,.24,1);',
      'margin-top:-.5rem;}',
    '.sh-more.open{max-height:380px;}',
    '.sh-more-in{border:1px solid #111735;border-radius:14px;background:rgba(255,255,255,.03);',
      'padding:.25rem 1rem;}',
    '.sh-more-in div{display:flex;justify-content:space-between;gap:.9rem;padding:.6rem 0;',
      'font-size:.84rem;color:#FFF1E2;min-width:0;border-bottom:1px dashed #111735;}',
    '.sh-more-in div:last-child{border-bottom:none;}',
    '.sh-more-in b{font-weight:400;color:#5F678E;font-family:var(--f-mono,monospace);',
      'font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;flex:none;}',
    '.sh-more-in span{text-align:right;overflow-wrap:anywhere;}',

    /* ── actions: three separate boxes ── */
    '.sh-acts{display:flex;gap:.65rem;align-items:stretch;flex-wrap:wrap;margin-top:.35rem;}',
    '.sh-qty{display:flex;align-items:center;flex:none;border:1px solid #1A2142;border-radius:14px;',
      'background:rgba(255,255,255,.03);overflow:hidden;}',
    '.sh-qty button{background:none;border:none;color:#8E96B8;cursor:pointer;font-size:1.15rem;',
      'width:42px;height:56px;transition:color .2s;}',
    '.sh-qty button:hover{color:#F0DCC0;}',
    '.sh-qty span{font-family:var(--f-mono,monospace);width:28px;text-align:center;font-size:.9rem;color:#FFF1E2;}',
    '.sh-buy{flex:1 1 170px;min-width:0;min-height:56px;border:none;border-radius:14px;',
      'padding:.7rem 1.2rem;cursor:pointer;background:linear-gradient(180deg,#F0DCC0,#E6CBA8);',
      'color:#080C1F;font-family:var(--f-body,system-ui),sans-serif;font-size:1rem;font-weight:700;',
      'display:flex;align-items:center;justify-content:center;gap:.45em;',
      'transition:transform .25s,box-shadow .25s;}',
    '.sh-buy:hover{transform:translateY(-2px);box-shadow:0 16px 34px -14px rgba(201,161,95,.6);}',
    '.sh-bag{flex:0 1 145px;min-height:56px;border:1px solid #1A2142;background:rgba(255,255,255,.03);',
      'border-radius:14px;padding:.7rem 1rem;cursor:pointer;color:#FFF1E2;',
      'font-family:var(--f-body,system-ui),sans-serif;font-size:.95rem;white-space:nowrap;',
      'display:flex;align-items:center;justify-content:center;transition:all .25s;}',
    '.sh-bag:hover{border-color:#E6CBA8;color:#F0DCC0;}',

    /* ── close ── */
    '.sh-x{position:absolute;top:1.5rem;right:1.5rem;z-index:9002;width:40px;height:40px;',
      'border-radius:50%;border:1px solid rgba(230,203,168,.22);cursor:pointer;',
      'background:rgba(5,8,24,.75);color:#FFF1E2;font-size:1rem;',
      'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transition:all .25s;}',
    '.sh-x:hover{background:#E6CBA8;color:#050818;border-color:#E6CBA8;}',

    /* ── zoom ── */
    '.sh-zoom{position:fixed;inset:0;z-index:9500;background:rgba(3,5,16,.94);display:flex;',
      'align-items:center;justify-content:center;padding:1.5rem;cursor:zoom-out;opacity:0;',
      'transition:opacity .3s ease;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);}',
    '.sh-zoom.on{opacity:1;}',
    '.sh-zoom img{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;}',

    /* ── phones ── */
    '@media (max-width:560px){',
      '.sh{width:94vw;max-height:90vh;padding:.6rem;border-radius:18px;}',
      '.sh-frame{padding:.85rem;border-radius:15px;}',
      '.sh-frame .ck{width:13px;height:13px;}',
      '.sh-frame .ck.tl,.sh-frame .ck.tr{top:9px;} .sh-frame .ck.bl,.sh-frame .ck.br{bottom:9px;}',
      '.sh-frame .ck.tl,.sh-frame .ck.bl{left:9px;} .sh-frame .ck.tr,.sh-frame .ck.br{right:9px;}',
      '.sh-ph img{max-height:38vh;}',
      '.sh-main{left:15px;bottom:15px;font-size:.5rem;}',
      '.sh-t{width:60px;height:60px;}',
      '.sh-body{padding:1.3rem .35rem .35rem;gap:1rem;}',
      '.sh-desc{font-size:.88rem;line-height:1.7;}',
      /* quantity + buy share a row, bag full width beneath */
      '.sh-qty{order:1;} .sh-buy{order:2;flex:1 1 auto;} .sh-bag{order:3;flex:1 1 100%;}',
      '.sh-x{top:1.1rem;right:1.1rem;width:36px;height:36px;}',
    '}',
    'body.sh-open{overflow:hidden;}'
  ].join('');
  document.head.appendChild(css);

  var scrim, sheet, esc;

  function money(n){ return '₹' + Number(n).toLocaleString('en-IN'); }

  function close(){
    if(!sheet) return;
    sheet.classList.remove('on'); scrim.classList.remove('on');
    document.body.classList.remove('sh-open');
    document.removeEventListener('keydown', esc);
    var s = sheet, c = scrim; sheet = scrim = null;
    setTimeout(function(){ if(s) s.remove(); if(c) c.remove(); }, 400);
  }

  function open(p){
    if(sheet) return;
    var imgs = (p.gallery && p.gallery.length) ? p.gallery : [p.hero];

    scrim = document.createElement('div');
    scrim.className = 'sh-scrim';
    scrim.addEventListener('click', close);
    document.body.appendChild(scrim);

    sheet = document.createElement('div');
    sheet.className = 'sh';
    sheet.setAttribute('role','dialog');
    sheet.setAttribute('aria-label', p.name);

    /* video (if any) becomes the first slide in the gallery */
    var slides = [];
    if(p.video) slides.push({ type:'video', src:p.video, poster:imgs[0] });
    imgs.forEach(function(src){ slides.push({ type:'img', src:src }); });

    /* same derived values the product page uses */
    var badgeText = p.badge || (p.isNew ? 'New' : '');
    var offPct = (p.mrp && p.mrp > p.price) ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    var stockCls = 'ok', stockTxt = 'In stock · ships in 1–2 days';
    if(p.stock != null && p.stock <= 0){ stockCls = 'out'; stockTxt = 'Sold out'; }
    else if(p.stock != null && p.stock <= 5){ stockCls = 'low'; stockTxt = 'Only ' + p.stock + ' left'; }

    /* only show the tagline when it actually says something the
       description doesn't — otherwise the same sentence prints twice */
    var tagline = '';
    if(p.short && p.desc && p.short.trim() !== p.desc.trim()) tagline = p.short;
    else if(p.short && !p.desc) tagline = p.short;

    sheet.innerHTML =
      '<button class="sh-x" aria-label="Close">✕</button>' +

      '<div class="sh-frame">' +
        '<span class="ck tl"></span><span class="ck tr"></span>' +
        '<span class="ck bl"></span><span class="ck br"></span>' +
        '<div class="sh-ph" id="shStage">' +
          '<img src="'+slides[0].src+'" alt="'+p.name+'" />' +
        '</div>' +
        '<button class="sh-main" id="shMainBtn">← Main photo</button>' +
      '</div>' +

      (slides.length > 1
        ? '<div class="sh-rail">' +
            slides.map(function(sl,i){
              return '<button class="sh-t'+(i===0?' on':'')+(sl.type==='video'?' vid':'')+'" data-i="'+i+'">' +
                     '<img src="'+(sl.type==='video' ? (sl.poster||'') : sl.src)+'" alt="" /></button>';
            }).join('') +
          '</div>'
        : '') +

      '<div class="sh-body">' +
        '<div class="sh-seller">The AIM · Verified</div>' +
        ((p.sku || badgeText)
          ? '<div class="sh-skurow">' +
              (p.sku ? '<span class="sh-sku">SKU '+p.sku+'</span>' : '') +
              (badgeText ? '<span class="sh-badge">'+badgeText+'</span>' : '') +
            '</div>'
          : '') +
        '<h2 class="sh-name">'+p.name+'</h2>' +
        (tagline ? '<p class="sh-tagline">'+tagline+'</p>' : '') +

        '<div class="sh-pricebox">' +
          '<div class="sh-price-row">' +
            '<span class="sh-price">'+money(p.price)+'</span>' +
            (offPct
              ? '<span class="sh-mrp">M.R.P. <s>'+money(p.mrp)+'</s> · <b>'+offPct+'% off</b></span>'
              : '') +
          '</div>' +
          '<div class="sh-taxline"><i>✓</i> Inclusive of all taxes · Free delivery above ₹499</div>' +
        '</div>' +

        '<div class="sh-stock '+stockCls+'">'+stockTxt+'</div>' +

        (p.desc ? '<p class="sh-desc">'+p.desc+'</p>' : '') +

        '<button class="sh-more-btn" id="shMoreBtn">See full details ▾</button>' +
        '<div class="sh-more" id="shMore"><div class="sh-more-in">' +
          '<div><b>Category</b><span>'+(p.category||'—')+'</span></div>' +
          '<div><b>Product code</b><span>'+(p.sku||'—')+'</span></div>' +
          (p.stock != null ? '<div><b>Availability</b><span>'+(p.stock>0?'In stock':'Sold out')+'</span></div>' : '') +
          '<div><b>Delivery</b><span>1–2 days, pan-India</span></div>' +
          '<div><b>Returns</b><span>7 days</span></div>' +
        '</div></div>' +

        '<div class="sh-acts">' +
          '<div class="sh-qty"><button data-q="-1" aria-label="Decrease quantity">−</button>' +
            '<span id="shQ">1</span>' +
            '<button data-q="1" aria-label="Increase quantity">+</button></div>' +
          '<button class="sh-buy" id="shBuy">⚡ Buy now</button>' +
          '<button class="sh-bag" id="shBag">+ Bag</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(sheet);
    document.body.classList.add('sh-open');

    requestAnimationFrame(function(){
      scrim.classList.add('on');
      sheet.classList.add('on');
    });

    /* gallery — thumbnails switch the stage, video plays inline */
    var stage   = sheet.querySelector('#shStage');
    var mainBtn = sheet.querySelector('#shMainBtn');

    function showSlide(i){
      var sl = slides[i];
      if(!sl) return;
      if(sl.type === 'video' && window.AscentraVideo){
        stage.innerHTML = AscentraVideo.embedHTML(sl.src);
      } else {
        stage.innerHTML = '<img src="'+sl.src+'" alt="'+p.name+'" />';
      }
      mainBtn.classList.toggle('on', i !== 0);
      sheet.querySelectorAll('.sh-t').forEach(function(z,k){ z.classList.toggle('on', k === i); });
    }
    sheet.querySelectorAll('.sh-t').forEach(function(t){
      t.addEventListener('click', function(){ showSlide(+t.dataset.i); });
    });
    mainBtn.addEventListener('click', function(e){ e.stopPropagation(); showSlide(0); });

    /* tap the main image → full-screen zoom */
    stage.addEventListener('click', function(){
      var img = stage.querySelector('img');
      if(!img) return;                        // video playing, don't zoom
      var z = document.createElement('div');
      z.className = 'sh-zoom';
      z.innerHTML = '<img src="'+img.src+'" alt="'+p.name+'" />';
      document.body.appendChild(z);
      requestAnimationFrame(function(){ z.classList.add('on'); });
      z.addEventListener('click', function(){
        z.classList.remove('on');
        setTimeout(function(){ z.remove(); }, 320);
      });
    });

    /* full details — expands in place */
    var more = sheet.querySelector('#shMore');
    var moreBtn = sheet.querySelector('#shMoreBtn');
    moreBtn.addEventListener('click', function(){
      var open = more.classList.toggle('open');
      moreBtn.textContent = open ? 'Hide full details ▴' : 'See full details ▾';
    });

    /* quantity + actions */
    var q = 1, qEl = sheet.querySelector('#shQ');
    sheet.querySelectorAll('[data-q]').forEach(function(btn){
      btn.addEventListener('click', function(){
        q = Math.max(1, Math.min(10, q + (+btn.dataset.q)));
        qEl.textContent = q;
      });
    });
    sheet.querySelector('#shBag').addEventListener('click', function(){
      if(window.Cart) Cart.add(p.id, q);
      this.textContent = 'Added ✓';
      var self = this; setTimeout(function(){ self.textContent = '+ Bag'; }, 1400);
    });
    sheet.querySelector('#shBuy').addEventListener('click', function(){
      if(window.Cart) Cart.add(p.id, q);
      window.location.href = 'checkout.html';
    });
    sheet.querySelector('.sh-x').addEventListener('click', close);

    esc = function(e){ if(e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
  }

  /* intercept product links anywhere on the site */
  document.addEventListener('click', function(e){
    if(reduce) return;
    var a = e.target.closest && e.target.closest('a[href*="product.html"]');
    if(!a) return;
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    var m = /[?&]id=([^&]+)/.exec(a.getAttribute('href') || '');
    if(!m) return;
    var p = PRODUCTS.filter(function(x){ return x.id === decodeURIComponent(m[1]); })[0];
    if(!p) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open(p);
  }, true);
})();

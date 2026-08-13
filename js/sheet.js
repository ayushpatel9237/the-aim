/* ═══════════════════════════════════════════════════════════
   THE AIM — PRODUCT SHEET

   Tapping any product opens it as a panel over the page — the
   background stays exactly where it was, blurred behind. Inside:
   the big photo, small thumbnails under it, then the name, price,
   details and buy options. Closing returns you to the same spot.

   The layout mirrors product.html exactly — seller line, SKU,
   gold-ruled price with M.R.P. and discount, description, full
   details, then quantity / buy / bag as three separate boxes.
   Whichever route a customer takes, they see the same page.
═══════════════════════════════════════════════════════════ */
(function(){
  if(typeof PRODUCTS === 'undefined') return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent = [
    /* scrim */
    '.sh-scrim{position:fixed;inset:0;z-index:9000;background:rgba(3,5,16,.66);',
      'backdrop-filter:blur(26px) saturate(140%);-webkit-backdrop-filter:blur(26px) saturate(140%);',
      'opacity:0;transition:opacity .4s ease;}',
    '.sh-scrim.on{opacity:1;}',

    '.sh{position:fixed;z-index:9001;left:50%;top:50%;width:min(1000px,92vw);max-height:90vh;',
      'transform:translate(-50%,-50%);overflow-y:auto;overflow-x:hidden;padding:.35rem;',
      'display:grid;grid-template-columns:1fr;gap:.7rem;align-content:start;scrollbar-width:none;}',
    '.sh::-webkit-scrollbar{display:none;}',
    '@media (min-width:900px){.sh{grid-template-columns:1.05fr .95fr;align-items:start;gap:1rem;}',
      '.sh-col-a,.sh-col-b{display:grid;gap:.7rem;align-content:start;min-width:0;}}',

    /* ══ card shell — the site\'s own palette, not white glass ══ */
    '.card-f{background:rgba(10,15,38,.82);border:1px solid rgba(230,203,168,.16);border-radius:16px;',
      'box-shadow:0 22px 56px -24px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,.06);',
      'backdrop-filter:blur(30px) saturate(160%);-webkit-backdrop-filter:blur(30px) saturate(160%);',
      'color:#FFF1E2;min-width:0;overflow:hidden;',
      'opacity:0;transform:translateY(14px) scale(.985);',
      'transition:opacity .5s ease var(--d,0s), transform .55s cubic-bezier(.2,.7,.24,1) var(--d,0s);}',
    '.sh.on .card-f{opacity:1;transform:none;}',

    /* hero photo — cream panel, nothing cropped */
    '.sh-hero{padding:.5rem;cursor:zoom-in;}',
    '.sh-hero .ph{width:100%;background:#FFF1E2;border-radius:11px;overflow:hidden;',
      'display:flex;align-items:center;justify-content:center;}',
    '.sh-hero img{width:100%;height:auto;max-height:54vh;object-fit:contain;display:block;}',

    '.sh-thumbs{padding:.45rem;display:flex;gap:.4rem;overflow-x:auto;scrollbar-width:none;}',
    '.sh-thumbs::-webkit-scrollbar{display:none;}',
    '.sh-t{flex:none;width:56px;height:56px;border-radius:9px;overflow:hidden;cursor:pointer;',
      'background:#FFF1E2;border:1.5px solid transparent;opacity:.6;padding:2px;',
      'transition:opacity .25s,border-color .25s,transform .25s;display:flex;align-items:center;justify-content:center;}',
    '.sh-t:hover{transform:translateY(-2px);opacity:1;}',
    '.sh-t img{width:100%;height:100%;object-fit:contain;display:block;}',
    '.sh-t.on{opacity:1;border-color:#E6CBA8;box-shadow:0 0 0 1px #E6CBA8;}',
    '.sh-t.vid{position:relative;}',
    '.sh-t.vid::after{content:"▶";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
      'background:rgba(5,8,24,.45);color:#fff;font-size:.65rem;}',

    /* ══ info — same order and styling as product.html ══ */
    '.sh-info{padding:1.1rem 1.15rem;display:flex;flex-direction:column;gap:.9rem;}',

    '.sh-seller{font-family:var(--f-mono,monospace);font-size:.58rem;letter-spacing:.3em;',
      'text-transform:uppercase;color:#E6CBA8;}',
    '.sh-skurow{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;margin-top:-.5rem;}',
    '.sh-sku{font-family:var(--f-mono,monospace);font-size:.6rem;letter-spacing:.22em;',
      'text-transform:uppercase;color:#8E96B8;}',
    '.sh-badge{font-family:var(--f-mono,monospace);font-size:.52rem;letter-spacing:.12em;',
      'text-transform:uppercase;color:#5FA88C;border:1px solid rgba(106,168,143,.45);',
      'background:rgba(106,168,143,.1);padding:.3em .8em;border-radius:999px;}',

    '.sh-name{font-family:var(--f-body,system-ui),sans-serif;font-weight:600;',
      'font-size:clamp(1.15rem,2.4vw,1.6rem);line-height:1.2;letter-spacing:-.01em;',
      'margin:-.4rem 0 0;color:#FFF1E2;overflow-wrap:anywhere;}',
    '.sh-tagline{color:#8E96B8;font-size:.88rem;margin:-.55rem 0 0;}',

    /* price behind its gold rule */
    '.sh-pricebox{border-left:2px solid #E6CBA8;padding-left:1rem;display:flex;',
      'flex-direction:column;gap:.25rem;}',
    '.sh-price-row{display:flex;align-items:baseline;gap:.8rem;flex-wrap:wrap;}',
    '.sh-price{font-family:var(--f-body,system-ui),sans-serif;font-weight:600;',
      'font-size:clamp(1.5rem,4vw,1.85rem);line-height:1.1;color:#F0DCC0;}',
    '.sh-mrp{font-family:var(--f-mono,monospace);font-size:.68rem;color:#8E96B8;}',
    '.sh-mrp s{color:#5F678E;}',
    '.sh-mrp b{color:#5FA88C;font-weight:700;}',
    '.sh-taxline{font-size:.74rem;color:#5F678E;}',
    '.sh-taxline i{color:#5FA88C;font-style:normal;}',

    '.sh-stock{font-family:var(--f-mono,monospace);font-size:.58rem;letter-spacing:.14em;',
      'text-transform:uppercase;color:#5FA88C;margin-top:-.45rem;}',
    '.sh-stock.low{color:#F0DCC0;} .sh-stock.out{color:#E08A7A;}',

    '.sh-desc{color:#8E96B8;line-height:1.7;font-size:.86rem;margin:0;overflow-wrap:anywhere;}',

    /* see full details */
    '.sh-more{padding:0;}',
    '.sh-more > button{width:100%;text-align:left;background:none;border:none;cursor:pointer;',
      'padding:.9rem 1.15rem;font-family:var(--f-mono,monospace);font-size:.56rem;letter-spacing:.2em;',
      'text-transform:uppercase;color:#E6CBA8;display:flex;justify-content:space-between;',
      'align-items:center;gap:.6rem;}',
    '.sh-more > button:hover{color:#F0DCC0;}',
    '.sh-more > button span{transition:transform .35s ease;flex:none;}',
    '.sh-more.open > button span{transform:rotate(180deg);}',
    '.sh-more .body{max-height:0;overflow:hidden;transition:max-height .45s cubic-bezier(.2,.7,.24,1);}',
    '.sh-more.open .body{max-height:340px;}',
    '.sh-more .body-in{padding:0 1.15rem 1rem;}',
    '.sh-more .body-in div{display:flex;justify-content:space-between;gap:.8rem;padding:.55rem 0;',
      'font-size:.82rem;color:#FFF1E2;min-width:0;border-bottom:1px dashed #111735;}',
    '.sh-more .body-in div:last-child{border-bottom:none;}',
    '.sh-more .body-in b{font-weight:400;color:#5F678E;font-family:var(--f-mono,monospace);',
      'font-size:.56rem;letter-spacing:.14em;text-transform:uppercase;flex:none;}',
    '.sh-more .body-in span{text-align:right;overflow-wrap:anywhere;}',

    /* actions — three separate boxes */
    '.sh-acts{padding:.75rem .8rem;display:flex;gap:.55rem;flex-wrap:wrap;align-items:stretch;}',
    '.sh-qty{display:flex;align-items:center;flex:none;border:1px solid #1A2142;',
      'border-radius:12px;background:rgba(255,255,255,.03);overflow:hidden;}',
    '.sh-qty button{background:none;border:none;color:#8E96B8;cursor:pointer;font-size:1rem;',
      'width:38px;height:46px;transition:color .2s;}',
    '.sh-qty button:hover{color:#F0DCC0;}',
    '.sh-qty span{font-family:var(--f-mono,monospace);width:28px;text-align:center;font-size:.8rem;}',
    '.sh-buy{flex:1 1 150px;min-width:0;min-height:46px;border:none;border-radius:12px;',
      'padding:.7rem 1.1rem;cursor:pointer;background:linear-gradient(180deg,#F0DCC0,#E6CBA8);',
      'color:#080C1F;font-family:var(--f-body,system-ui),sans-serif;font-size:.88rem;font-weight:700;',
      'display:flex;align-items:center;justify-content:center;gap:.4em;',
      'transition:transform .25s,box-shadow .25s;}',
    '.sh-buy:hover{transform:translateY(-2px);box-shadow:0 14px 30px -14px rgba(201,161,95,.6);}',
    '.sh-bag{flex:0 1 130px;min-height:46px;border:1px solid #1A2142;background:rgba(255,255,255,.03);',
      'border-radius:12px;padding:.7rem .9rem;cursor:pointer;color:#FFF1E2;',
      'font-family:var(--f-body,system-ui),sans-serif;font-size:.84rem;white-space:nowrap;',
      'display:flex;align-items:center;justify-content:center;transition:all .25s;}',
    '.sh-bag:hover{border-color:#E6CBA8;color:#F0DCC0;}',

    '.sh-x{position:fixed;top:16px;right:16px;z-index:9002;width:38px;height:38px;border-radius:11px;',
      'border:1px solid rgba(230,203,168,.22);cursor:pointer;background:rgba(10,15,38,.7);color:#FFF1E2;',
      'font-size:.95rem;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transition:all .25s;}',
    '.sh-x:hover{background:#E6CBA8;color:#050818;border-color:#E6CBA8;}',

    '.sh-zoom{position:fixed;inset:0;z-index:9500;background:rgba(3,5,16,.94);display:flex;',
      'align-items:center;justify-content:center;padding:1.5rem;cursor:zoom-out;opacity:0;transition:opacity .3s ease;',
      'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);}',
    '.sh-zoom.on{opacity:1;}',
    '.sh-zoom img{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;}',

    /* ══ MOBILE — every block keeps its own space ══ */
    '@media (max-width:640px){',
      '.sh{width:93vw;max-height:86vh;padding:.25rem;gap:.55rem;}',
      '.card-f{border-radius:14px;}',
      '.sh-hero{padding:.4rem;}',
      '.sh-hero img{max-height:32vh;}',
      '.sh-thumbs{padding:.4rem;gap:.35rem;}',
      '.sh-t{width:44px;height:44px;border-radius:7px;}',
      '.sh-info{padding:.9rem .95rem;gap:.75rem;}',
      '.sh-seller{font-size:.54rem;letter-spacing:.24em;}',
      '.sh-name{font-size:1.08rem;}',
      '.sh-pricebox{padding-left:.85rem;}',
      '.sh-price{font-size:1.4rem;}',
      '.sh-desc{font-size:.84rem;}',
      '.sh-more > button{padding:.8rem .95rem;}',
      '.sh-more .body-in{padding:0 .95rem .85rem;}',
      /* quantity + buy share a row, bag goes full width beneath */
      '.sh-acts{padding:.6rem;gap:.5rem;}',
      '.sh-qty{order:1;}',
      '.sh-buy{order:2;flex:1 1 auto;}',
      '.sh-bag{order:3;flex:1 1 100%;}',
      '.sh-x{top:10px;right:10px;width:34px;height:34px;}',
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

    sheet.innerHTML =
      '<button class="sh-x" aria-label="Close">✕</button>' +

      '<div class="sh-col-a">' +
        '<div class="card-f sh-hero" style="--d:.02s"><div class="ph" id="shStage">' +
          '<img id="shHero" src="'+imgs[0]+'" alt="'+p.name+'" /></div></div>' +
        (slides.length > 1
          ? '<div class="card-f sh-thumbs" style="--d:.07s">' +
              slides.map(function(sl,i){
                return '<button class="sh-t'+(i===0?' on':'')+(sl.type==='video'?' vid':'')+'" data-i="'+i+'">' +
                       '<img src="'+(sl.type==='video' ? (sl.poster||'') : sl.src)+'" alt="" /></button>';
              }).join('') +
            '</div>'
          : '') +
      '</div>' +

      '<div class="sh-col-b">' +

        '<div class="card-f sh-info" style="--d:.12s">' +
          '<div class="sh-seller">The AIM · Verified</div>' +
          ((p.sku || badgeText)
            ? '<div class="sh-skurow">' +
                (p.sku ? '<span class="sh-sku">SKU '+p.sku+'</span>' : '') +
                (badgeText ? '<span class="sh-badge">'+badgeText+'</span>' : '') +
              '</div>'
            : '') +
          '<h2 class="sh-name">'+p.name+'</h2>' +
          (p.short ? '<p class="sh-tagline">'+p.short+'</p>' : '') +
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
          '<p class="sh-desc">'+(p.desc||'')+'</p>' +
        '</div>' +

        '<div class="card-f sh-more" id="shMore" style="--d:.17s">' +
          '<button type="button">See full details<span>⌄</span></button>' +
          '<div class="body"><div class="body-in">' +
            '<div><b>Category</b><span>'+(p.category||'—')+'</span></div>' +
            '<div><b>Product code</b><span>'+(p.sku||'—')+'</span></div>' +
            (p.stock != null ? '<div><b>Availability</b><span>'+(p.stock>0?'In stock':'Sold out')+'</span></div>' : '') +
            '<div><b>Delivery</b><span>1–2 days, pan-India</span></div>' +
            '<div><b>Returns</b><span>7 days</span></div>' +
          '</div></div>' +
        '</div>' +

        '<div class="card-f sh-acts" style="--d:.22s">' +
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
    var stage = sheet.querySelector('#shStage');
    function showSlide(i){
      var sl = slides[i];
      if(!sl) return;
      if(sl.type === 'video' && window.AscentraVideo){
        stage.innerHTML = AscentraVideo.embedHTML(sl.src);
      } else {
        stage.innerHTML = '<img id="shHero" src="'+sl.src+'" alt="'+p.name+'" />';
      }
    }
    sheet.querySelectorAll('.sh-t').forEach(function(t){
      t.addEventListener('click', function(){
        sheet.querySelectorAll('.sh-t').forEach(function(z){ z.classList.remove('on'); });
        t.classList.add('on');
        showSlide(+t.dataset.i);
      });
    });

    /* tap the main image → full-screen zoom */
    sheet.querySelector('.sh-hero').addEventListener('click', function(){
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

    /* see full details — expands in place */
    var more = sheet.querySelector('#shMore');
    more.querySelector('button').addEventListener('click', function(){
      more.classList.toggle('open');
      this.firstChild.textContent = more.classList.contains('open') ? 'Hide details' : 'See full details';
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

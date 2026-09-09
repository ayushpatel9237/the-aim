/* ═══════════════════════════════════════════════════════════
   THE AIM — PRODUCT SHEET (iPhone Magnetic Glassy Modal)
   Image itself is the box (iOS App Icon squircle aesthetic).
   ═══════════════════════════════════════════════════════════ */
(function(){
  if(typeof PRODUCTS === 'undefined') return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent = [
    /* ── overlay backdrop: pure blur of the page with NO color layer ── */
    '.sh-scrim{position:fixed;inset:0;z-index:9000;',
      'backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);',
      'opacity:0;transition:opacity .35s cubic-bezier(.16,1,.3,1);}',
    '.sh-scrim.on{opacity:1;}',

    /* ── the scrollable modal container ── */
    '.sh{position:fixed;inset:0;z-index:9001;overflow-y:auto;overflow-x:hidden;',
      'padding:max(3vh,1.2rem) 1rem calc(3.5rem + env(safe-area-inset-bottom));scrollbar-width:none;',
      'display:flex;justify-content:center;align-items:flex-start;',
      '-webkit-overflow-scrolling:touch;}',
    '.sh::-webkit-scrollbar{display:none;}',

    /* ── the card with iOS spring scale pop ── */
    '.sh-card{position:relative;max-width:520px;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:1rem;',
      'transform:scale(0.88) translateY(24px);opacity:0;',
      'transition:transform .45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity .3s ease;}',
    '.sh.on .sh-card{transform:scale(1) translateY(0);opacity:1;}',

    /* ── MEDIA TILE: Image itself is the squircle box (No layer behind it) ── */
    '.sh-media-group{display:flex;flex-direction:column;gap:.75rem;}',
    '.sh-hero-box{position:relative;width:100%;aspect-ratio:1/1;border-radius:32px;overflow:hidden;',
      'background:transparent;cursor:zoom-in;',
      'box-shadow:0 20px 48px -12px rgba(0,7,45,.25), inset 0 1px 1px rgba(255,255,255,.9);',
      'border:1px solid rgba(255,255,255,.6);}',
    '.sh-hero-box img{width:100%;height:100%;object-fit:cover;display:block;transition:opacity .25s;}',
    '.sh-hero-box img.fading{opacity:0;}',
    '.sh-hero-box video{width:100%;height:100%;object-fit:cover;display:block;}',

    /* Floating controls directly on top of the image */
    '.sh-float-counter{position:absolute;top:14px;left:14px;z-index:5;',
      'background:rgba(0,7,45,.5);backdrop-filter:blur(20px) saturate(180%);',
      '-webkit-backdrop-filter:blur(20px) saturate(180%);',
      'color:#FFFFFF;border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:5px 12px;',
      'font-family:var(--f-mono,monospace);font-size:.62rem;font-weight:600;letter-spacing:.08em;',
      'box-shadow:0 4px 14px rgba(0,0,0,.25);}',
    '.sh-float-close{position:absolute;top:14px;right:14px;z-index:5;',
      'width:36px;height:36px;border-radius:50%;cursor:pointer;',
      'background:rgba(0,7,45,.5);backdrop-filter:blur(20px) saturate(180%);',
      '-webkit-backdrop-filter:blur(20px) saturate(180%);',
      'color:#FFFFFF;border:1px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;',
      'font-size:.95rem;box-shadow:0 4px 14px rgba(0,0,0,.25);transition:all .2s;}',
    '.sh-float-close:hover{background:rgba(0,7,45,.8);transform:scale(1.08);}',

    '.sh-float-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:4;',
      'width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.88);',
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
      'border:1px solid rgba(255,255,255,.9);color:var(--ink,#00072D);',
      'display:flex;align-items:center;justify-content:center;font-family:var(--f-mono,monospace);',
      'font-size:.95rem;cursor:pointer;box-shadow:0 4px 14px rgba(0,7,45,.15);transition:all .2s;}',
    '.sh-float-nav:hover{background:#FFFFFF;transform:translateY(-50%) scale(1.08);}',
    '.sh-float-nav.pv{left:12px;} .sh-float-nav.nx{right:12px;}',

    /* thumbnails — smooth borderless squircle icons */
    '.sh-thumbs{display:flex;gap:.65rem;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:none;}',
    '.sh-thumbs::-webkit-scrollbar{display:none;}',
    '.sh-th{flex:0 0 66px;height:66px;border-radius:18px;overflow:hidden;cursor:pointer;',
      'border:2px solid transparent;background:transparent;position:relative;opacity:.7;',
      'box-shadow:0 4px 12px rgba(0,7,45,.08);transition:all .2s;padding:0;}',
    '.sh-th:hover{opacity:1;transform:translateY(-2px);}',
    '.sh-th.on{opacity:1;border-color:var(--ink,#00072D);box-shadow:0 0 0 2px var(--ink,#00072D), 0 8px 18px rgba(0,7,45,.2);transform:scale(1.04);}',
    '.sh-th img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.sh-th .th-lbl{position:absolute;bottom:3px;right:3px;font-family:var(--f-mono,monospace);',
      'font-size:.45rem;font-weight:700;background:rgba(0,7,45,.65);color:#fff;padding:1px 4px;border-radius:4px;}',
    '.sh-th.vid::after{content:"▶";position:absolute;inset:0;display:flex;align-items:center;',
      'justify-content:center;background:rgba(0,7,45,.45);color:#fff;font-size:.85rem;}',

    /* ── Info Box & other modules ── */
    '.sh-box{position:relative;background:rgba(255,255,255,.82);',
      'backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);',
      'border:1px solid rgba(255,255,255,.9);border-radius:26px;',
      'padding:clamp(1.2rem, 3vw, 1.5rem);',
      'box-shadow:0 12px 36px -12px rgba(0,7,45,.12), inset 0 1px 0 #FFFFFF;}',

    '.sh-verified{display:flex;align-items:center;gap:.45rem;font-family:var(--f-mono,monospace);',
      'font-size:.64rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#5A6072);font-weight:600;}',
    '.sh-vchk{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;',
      'border-radius:50%;background:var(--cobalt,#1E3A8A);color:#FFFFFF;font-size:9px;font-weight:700;}',
    '.sh-title{font-family:var(--f-sans,sans-serif);font-weight:800;font-size:clamp(1.35rem,3.2vw,1.75rem);',
      'color:var(--ink,#00072D);letter-spacing:-.02em;line-height:1.25;margin:.45rem 0 .65rem;}',

    /* vertical price bar */
    '.sh-price-callout{display:flex;align-items:flex-start;gap:.85rem;',
      'border-left:3.5px solid var(--ink,#00072D);padding-left:.85rem;margin:.5rem 0 .7rem;}',
    '.sh-price-val{font-family:var(--f-mono,monospace);font-size:clamp(1.7rem,3.8vw,2.1rem);',
      'font-weight:700;color:var(--ink,#00072D);line-height:1;}',
    '.sh-price-text{font-size:.72rem;color:var(--muted,#5A6072);line-height:1.35;padding-top:2px;}',
    '.sh-price-text b{color:var(--live,#1F9268);font-weight:600;}',

    '.sh-instock{display:flex;align-items:center;gap:.4rem;font-family:var(--f-mono,monospace);',
      'font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--live,#1F9268);font-weight:600;}',

    /* ── Description Box ── */
    '.sh-desc-text{color:var(--ink,#00072D);font-size:.86rem;line-height:1.65;margin:0;}',

    /* ── Details Accordion Box ── */
    '.sh-accordion{padding:0 !important;overflow:hidden;}',
    '.sh-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;',
      'padding:1.1rem 1.4rem;font-family:var(--f-mono,monospace);font-size:.7rem;letter-spacing:.12em;',
      'text-transform:uppercase;color:var(--ink,#00072D);font-weight:700;cursor:pointer;background:none;border:none;}',
    '.sh-acc-btn .chev{transition:transform .25s;font-size:.65rem;}',
    '.sh-acc-btn.open .chev{transform:rotate(180deg);}',
    '.sh-acc-content{display:none;padding:0 1.4rem 1.1rem;border-top:1px solid var(--line,#E4E4D8);}',
    '.sh-acc-content.open{display:block;}',
    '.sh-spec-row{display:flex;justify-content:space-between;gap:1rem;font-size:.78rem;',
      'padding:.45rem 0;border-bottom:1px solid rgba(0,7,45,.06);}',
    '.sh-spec-row:last-child{border-bottom:none;}',
    '.sh-spec-k{font-family:var(--f-mono,monospace);font-size:.62rem;letter-spacing:.08em;',
      'color:var(--muted,#5A6072);text-transform:uppercase;}',
    '.sh-spec-v{color:var(--ink,#00072D);font-weight:500;}',

    /* ── Actions Row ── */
    '.sh-actions{display:flex;gap:.7rem;align-items:stretch;}',
    '.sh-qty-pill{display:flex;align-items:center;flex:none;overflow:hidden;',
      'background:rgba(255,255,255,.9);border:1px solid var(--line,#E4E4D8);border-radius:999px;',
      'box-shadow:0 2px 8px rgba(0,7,45,.06);}',
    '.sh-qty-pill button{width:40px;height:48px;font-size:1.1rem;color:var(--ink,#00072D);',
      'background:transparent;border:none;cursor:pointer;transition:background .15s;}',
    '.sh-qty-pill button:hover{background:rgba(0,7,45,.06);}',
    '.sh-qty-pill span{min-width:26px;text-align:center;font-family:var(--f-mono,monospace);',
      'font-weight:700;color:var(--ink,#00072D);font-size:.85rem;}',
    '.sh-btn-buy{flex:1.4;min-height:48px;border-radius:999px;background:var(--ink,#00072D);',
      'color:#FFFFFF;border:1px solid var(--ink,#00072D);font-family:var(--f-mono,monospace);',
      'font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;cursor:pointer;',
      'box-shadow:0 10px 24px -6px rgba(0,7,45,.35);transition:all .2s;}',
    '.sh-btn-buy:hover{background:var(--ink-soft,#2A3358);transform:translateY(-1px);}',
    '.sh-btn-bag{flex:1;min-height:48px;border-radius:999px;background:rgba(255,255,255,.85);',
      'color:var(--ink,#00072D);border:1px solid var(--line,#E4E4D8);font-family:var(--f-mono,monospace);',
      'font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;cursor:pointer;',
      'box-shadow:0 2px 8px rgba(0,7,45,.06);transition:all .2s;}',
    '.sh-btn-bag:hover{background:#FFFFFF;border-color:var(--ink,#00072D);}',

    /* trust badges */
    '.sh-trust{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-top:.4rem;',
      'font-family:var(--f-mono,monospace);font-size:.62rem;color:var(--muted,#5A6072);}',
    '.sh-trust li{display:flex;align-items:center;gap:.4rem;}',
    '.sh-trust li span{color:var(--live,#1F9268);font-weight:700;}',

    /* zoom */
    '.sh-zoom{position:fixed;inset:0;z-index:9500;background:rgba(0,7,45,.88);display:flex;',
      'align-items:center;justify-content:center;padding:1.5rem;cursor:zoom-out;opacity:0;',
      'transition:opacity .3s ease;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}',
    '.sh-zoom.on{opacity:1;}',
    '.sh-zoom img{max-width:100%;max-height:100%;object-fit:contain;border-radius:14px;}',

    'body.sh-open{overflow:hidden;}'
  ].join('');
  document.head.appendChild(css);

  var scrim, sheet, esc;

  function cart(){ return window.AscentraCart || window.Cart || null; }
  function money(n){ return '₹' + Number(n).toLocaleString('en-IN'); }

  function close(){
    if(!sheet) return;
    sheet.classList.remove('on'); scrim.classList.remove('on');
    document.body.classList.remove('sh-open');
    document.removeEventListener('keydown', esc);
    var s = sheet, c = scrim; sheet = scrim = null;
    setTimeout(function(){ if(s) s.remove(); if(c) c.remove(); }, 380);
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

    /* slides */
    var slides = [];
    if(p.video) slides.push({ type:'video', src:p.video, poster:imgs[0] });
    imgs.forEach(function(src){ slides.push({ type:'img', src:src }); });

    var stockTxt = 'In stock · ships in 1–2 days';
    if(p.stock != null && p.stock <= 0) stockTxt = 'Sold out';
    else if(p.stock != null && p.stock <= 5) stockTxt = 'Only ' + p.stock + ' left';

    var thumbsHtml = slides.map(function(sl, i){
      var lbl = sl.type==='video' ? 'VIDEO' : (i===0 ? 'HERO' : String(i).padStart(2,'0'));
      return '<button class="sh-th'+(i===0?' on':'')+(sl.type==='video'?' vid':'')+'" data-i="'+i+'" aria-label="Slide '+(i+1)+'">' +
        '<img src="'+(sl.type==='video' ? (sl.poster||'') : sl.src)+'" alt="" />' +
        '<span class="th-lbl">'+lbl+'</span>' +
      '</button>';
    }).join('');

    sheet.innerHTML =
      '<div class="sh-card">' +

        /* CARD 1: IMAGE AS THE BOX ITSELF (iOS ICON SQUIRCLE) */
        '<div class="sh-media-group">' +
          '<div class="sh-hero-box" id="shStageWrap">' +
            '<span class="sh-float-counter" id="shCounter">1 / '+slides.length+'</span>' +
            '<button class="sh-float-close" id="shClose" aria-label="Close modal">✕</button>' +
            '<button class="sh-float-nav pv" id="shPrev" aria-label="Previous">←</button>' +
            '<button class="sh-float-nav nx" id="shNext" aria-label="Next">→</button>' +
            '<div id="shStage" style="width:100%;height:100%"></div>' +
          '</div>' +
          (slides.length > 1 ? '<div class="sh-thumbs" id="shThumbs">'+thumbsHtml+'</div>' : '') +
        '</div>' +

        /* CARD 2: INFO PANEL */
        '<div class="sh-box">' +
          '<div class="sh-verified">The AIM <span class="sh-vchk">✓</span> · '+(p.sku ? 'SKU '+p.sku : 'Verified')+'</div>' +
          '<h2 class="sh-title">'+p.name+'</h2>' +
          '<div class="sh-price-callout">' +
            '<div class="sh-price-val">'+money(p.price)+'</div>' +
            '<div class="sh-price-text">' +
              '<div><b>✓ Inclusive of all taxes</b></div>' +
              '<div>Free delivery across India</div>' +
            '</div>' +
          '</div>' +
          '<div class="sh-instock">✓ '+stockTxt+'</div>' +
        '</div>' +

        /* CARD 3: DESCRIPTION PANEL */
        '<div class="sh-box">' +
          '<p class="sh-desc-text">'+p.desc+'</p>' +
        '</div>' +

        /* CARD 4: DETAILS ACCORDION */
        '<div class="sh-box sh-accordion">' +
          '<button class="sh-acc-btn" id="shAccBtn">' +
            '<span>Full details</span>' +
            '<span class="chev">▼</span>' +
          '</button>' +
          '<div class="sh-acc-content" id="shAccContent">' +
            '<div class="sh-spec-row"><span class="sh-spec-k">Category</span><span class="sh-spec-v">'+(p.category||'—')+'</span></div>' +
            '<div class="sh-spec-row"><span class="sh-spec-k">Product code</span><span class="sh-spec-v">'+(p.sku||'—')+'</span></div>' +
            (p.stock != null ? '<div class="sh-spec-row"><span class="sh-spec-k">Availability</span><span class="sh-spec-v">'+(p.stock>0?'In stock':'Sold out')+'</span></div>' : '') +
            '<div class="sh-spec-row"><span class="sh-spec-k">Delivery</span><span class="sh-spec-v">1–2 days, pan-India</span></div>' +
            '<div class="sh-spec-row"><span class="sh-spec-k">Returns</span><span class="sh-spec-v">7 days · damaged or faulty</span></div>' +
          '</div>' +
        '</div>' +

        /* CARD 5: ACTIONS & TRUST */
        '<div style="display:flex;flex-direction:column;gap:.9rem">' +
          '<div class="sh-actions">' +
            '<div class="sh-qty-pill">' +
              '<button id="shMinus" aria-label="Decrease quantity">−</button>' +
              '<span id="shQ">1</span>' +
              '<button id="shPlus" aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button class="sh-btn-buy" id="shBuy">Buy now</button>' +
            '<button class="sh-btn-bag" id="shBag">Add to bag</button>' +
          '</div>' +
          '<ul class="sh-trust">' +
            '<li><span>◈</span> Hand-picked item</li>' +
            '<li><span>▶</span> Filmed in real life</li>' +
            '<li><span>⇆</span> 7-day easy returns</li>' +
            '<li><span>⚑</span> Ships pan-India</li>' +
          '</ul>' +
        '</div>' +

      '</div>';

    document.body.appendChild(sheet);
    document.body.classList.add('sh-open');

    sheet.addEventListener('click', function(e){
      if(e.target === sheet) close();
    });

    requestAnimationFrame(function(){
      scrim.classList.add('on');
      sheet.classList.add('on');
    });

    /* gallery slide navigation */
    var stage = sheet.querySelector('#shStage');
    var counter = sheet.querySelector('#shCounter');
    var curIdx = 0;

    function renderSlide(i){
      curIdx = (i + slides.length) % slides.length;
      var sl = slides[curIdx];
      if(!sl) return;
      if(sl.type === 'video' && window.AscentraVideo){
        stage.innerHTML = AscentraVideo.embedHTML(sl.src);
        counter.textContent = 'VIDEO';
      } else {
        stage.innerHTML = '<img src="'+sl.src+'" alt="'+p.name+'" />';
        counter.textContent = (curIdx + 1) + ' / ' + slides.length;
      }
      sheet.querySelectorAll('.sh-th').forEach(function(th, k){
        th.classList.toggle('on', k === curIdx);
      });
    }

    renderSlide(0);

    sheet.querySelectorAll('.sh-th').forEach(function(th){
      th.addEventListener('click', function(){ renderSlide(+th.dataset.i); });
    });
    sheet.querySelector('#shPrev').addEventListener('click', function(e){ e.stopPropagation(); renderSlide(curIdx - 1); });
    sheet.querySelector('#shNext').addEventListener('click', function(e){ e.stopPropagation(); renderSlide(curIdx + 1); });
    sheet.querySelector('#shClose').addEventListener('click', close);

    /* zoom photo on click (if not video) */
    sheet.querySelector('#shStageWrap').addEventListener('click', function(e){
      if(e.target.closest('.sh-float-nav, .sh-float-close, .sh-float-counter')) return;
      var img = stage.querySelector('img');
      if(!img) return;
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

    /* accordion toggle */
    var accBtn = sheet.querySelector('#shAccBtn');
    var accContent = sheet.querySelector('#shAccContent');
    accBtn.addEventListener('click', function(){
      var isOpen = accContent.classList.toggle('open');
      accBtn.classList.toggle('open', isOpen);
    });

    /* quantity */
    var q = 1, qEl = sheet.querySelector('#shQ');
    sheet.querySelector('#shPlus').addEventListener('click', function(){ q = Math.min(10, q + 1); qEl.textContent = q; });
    sheet.querySelector('#shMinus').addEventListener('click', function(){ q = Math.max(1, q - 1); qEl.textContent = q; });

    /* add to bag & buy now */
    sheet.querySelector('#shBag').addEventListener('click', function(){
      var C = cart();
      if(!C){ this.textContent = 'Unavailable'; return; }
      C.add(p.id, q);
      this.textContent = 'Added ✓';
      var self = this; setTimeout(function(){ self.textContent = 'Add to bag'; }, 1400);
    });

    sheet.querySelector('#shBuy').addEventListener('click', function(){
      var C = cart();
      if(!C){ this.textContent = 'Unavailable'; return; }
      C.add(p.id, q);
      if(C.count && C.count() > 0){ window.location.href = 'checkout.html'; }
      else { this.textContent = 'Try again'; }
    });

    esc = function(e){ if(e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
  }

  window.AscentraSheet = { open: open, close: close };

  /* intercept product clicks */
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

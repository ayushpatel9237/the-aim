/* ═══════════════════════════════════════════════════════════
   THE AIM — PRODUCT SHEET (iOS Home Screen / Widget Aesthetic)
   Each box is an independent floating widget with its own space.
   Dead-center in viewport, floating directly on blurred scrim.
   ═══════════════════════════════════════════════════════════ */
(function(){
  if(typeof PRODUCTS === 'undefined') return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent = [
    /* ── overlay backdrop: pure deep blur of the page (iOS Wallpaper blur) ── */
    '.sh-scrim{position:fixed;inset:0;z-index:9000;',
      'background:rgba(0,7,45,.45);backdrop-filter:blur(32px) saturate(180%);',
      '-webkit-backdrop-filter:blur(32px) saturate(180%);',
      'opacity:0;transition:opacity .35s cubic-bezier(.16,1,.3,1);}',
    '.sh-scrim.on{opacity:1;}',

    /* ── the scrollable modal container: 100vw, dead-center ── */
    '.sh{position:fixed !important;inset:0 !important;',
      'width:100vw !important;max-width:100vw !important;height:100vh !important;max-height:100vh !important;',
      'z-index:9001 !important;overflow-y:auto !important;overflow-x:hidden !important;',
      'padding:max(3.5vh,20px) 16px calc(8rem + env(safe-area-inset-bottom)) 16px !important;',
      'scrollbar-width:none;display:flex !important;justify-content:center !important;align-items:flex-start !important;',
      'box-sizing:border-box !important;margin:0 !important;background:transparent !important;border:none !important;',
      '-webkit-overflow-scrolling:touch !important;}',
    '.sh::-webkit-scrollbar{display:none;}',

    /* ── the centered card stack: NO background layer, each widget floats independently ── */
    '.sh-card{position:relative !important;max-width:360px !important;width:100% !important;margin:0 auto !important;',
      'display:flex !important;flex-direction:column !important;gap:16px !important;align-items:center !important;',
      'background:transparent !important;border:none !important;box-shadow:none !important;padding:0 !important;',
      'box-sizing:border-box !important;transform:scale(0.92) translateY(24px);opacity:0;',
      'transition:transform .4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity .3s ease;}',
    '.sh.on .sh-card{transform:scale(1) translateY(0) !important;opacity:1 !important;}',
    '@media (min-width:640px){.sh-card{max-width:410px !important;}}',
    '@media (max-width:375px){.sh-card{max-width:330px !important;gap:13px !important;}.sh{padding-left:12px !important;padding-right:12px !important;}}',

    /* ── WIDGET 1: STANDALONE SQUIRCLE IMAGE WIDGET (Like Photos widget in Image 3) ── */
    '.sh-hero-box{position:relative !important;width:100% !important;aspect-ratio:1/1 !important;border-radius:28px !important;overflow:hidden !important;',
      'background:#FFFFFF !important;cursor:zoom-in;box-sizing:border-box !important;',
      'box-shadow:0 20px 48px -12px rgba(0,7,45,.35), 0 4px 14px rgba(0,7,45,.1) !important;',
      'border:1.5px solid rgba(255,255,255,.8) !important;touch-action:pan-y;}',
    '.sh-hero-box img{width:100% !important;height:100% !important;object-fit:cover !important;display:block !important;border-radius:inherit !important;transition:opacity .25s;}',
    '.sh-hero-box img.fading{opacity:0;}',
    '.sh-hero-box video{width:100% !important;height:100% !important;object-fit:cover !important;display:block !important;border-radius:inherit !important;}',

    /* Floating minimalist controls inside the image widget */
    '.sh-float-counter{position:absolute;top:12px;left:12px;z-index:5;',
      'background:rgba(0,7,45,.5);backdrop-filter:blur(16px) saturate(180%);',
      '-webkit-backdrop-filter:blur(16px) saturate(180%);',
      'color:#FFFFFF;border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:4px 11px;',
      'font-family:var(--f-mono,monospace);font-size:.56rem;font-weight:700;letter-spacing:.08em;',
      'box-shadow:0 4px 12px rgba(0,0,0,.25);}',
    '.sh-float-close{position:absolute;top:12px;right:12px;z-index:5;',
      'width:32px;height:32px;border-radius:50%;cursor:pointer;',
      'background:rgba(0,7,45,.5);backdrop-filter:blur(16px) saturate(180%);',
      '-webkit-backdrop-filter:blur(16px) saturate(180%);',
      'color:#FFFFFF;border:1px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;',
      'font-size:.85rem;box-shadow:0 4px 12px rgba(0,0,0,.25);transition:all .2s;}',
    '.sh-float-close:hover{background:rgba(0,7,45,.8);transform:scale(1.08);}',

    /* ── WIDGET 2: STANDALONE FLOATING APP-ICON THUMBNAILS (Image 2 aesthetic) ── */
    '.sh-thumbs{display:flex !important;gap:10px !important;justify-content:center !important;align-items:center !important;',
      'overflow-x:auto !important;padding:2px 4px 6px !important;scrollbar-width:none !important;width:100% !important;box-sizing:border-box !important;margin:0 !important;}',
    '.sh-thumbs::-webkit-scrollbar{display:none;}',
    '.sh-th{flex:0 0 58px !important;width:58px !important;height:58px !important;border-radius:17px !important;overflow:hidden !important;',
      'cursor:pointer !important;padding:0 !important;background:#FFFFFF !important;',
      'border:2px solid transparent !important;position:relative !important;opacity:.82 !important;',
      'box-shadow:0 6px 16px -4px rgba(0,7,45,.22), 0 2px 6px rgba(0,7,45,.08) !important;transition:all .2s ease !important;}',
    '.sh-th:hover{opacity:1 !important;transform:translateY(-2px) !important;}',
    '.sh-th.on{opacity:1 !important;border-color:var(--ink,#00072D) !important;box-shadow:0 0 0 2px var(--ink,#00072D), 0 10px 24px -4px rgba(0,7,45,.35) !important;transform:scale(1.06) !important;}',
    '.sh-th img{width:100% !important;height:100% !important;object-fit:cover !important;display:block !important;}',
    '.sh-th .th-lbl{position:absolute;bottom:3px;right:3px;font-family:var(--f-mono,monospace);',
      'font-size:.42rem;font-weight:700;background:rgba(0,7,45,.7);color:#fff;padding:1px 4px;border-radius:4px;}',
    '.sh-th.vid::after{content:"▶";position:absolute;inset:0;display:flex;align-items:center;',
      'justify-content:center;background:rgba(0,7,45,.4);color:#fff;font-size:.85rem;}',

    /* ── WIDGET 3, 4, 5: STANDALONE FLOATING iOS GLASS BOXES (Like Spotify / Apple widgets) ── */
    '.sh-box{position:relative !important;width:100% !important;box-sizing:border-box !important;',
      'background:rgba(255,255,255,.92) !important;backdrop-filter:blur(24px) saturate(180%) !important;',
      '-webkit-backdrop-filter:blur(24px) saturate(180%) !important;',
      'border:1.5px solid rgba(255,255,255,.95) !important;border-radius:24px !important;',
      'padding:1.15rem 1.25rem !important;',
      'box-shadow:0 14px 34px -10px rgba(0,7,45,.18), 0 2px 8px rgba(0,7,45,.04), inset 0 1px 0 #FFFFFF !important;margin:0 !important;}',

    '.sh-verified{display:flex;align-items:center;gap:.45rem;font-family:var(--f-mono,monospace);',
      'font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#5A6072);font-weight:600;}',
    '.sh-vchk{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;',
      'border-radius:50%;background:var(--cobalt,#1E3A8A);color:#FFFFFF;font-size:9px;font-weight:700;}',
    '.sh-title{font-family:var(--f-sans,sans-serif);font-weight:800;font-size:1.28rem;',
      'color:var(--ink,#00072D);letter-spacing:-.02em;line-height:1.25;margin:.4rem 0 .65rem;}',

    /* vertical price bar */
    '.sh-price-callout{display:flex;align-items:flex-start;gap:.85rem;',
      'border-left:3.5px solid var(--ink,#00072D);padding-left:.85rem;margin:.5rem 0 .7rem;}',
    '.sh-price-val{font-family:var(--f-mono,monospace);font-size:1.85rem;',
      'font-weight:700;color:var(--ink,#00072D);line-height:1;}',
    '.sh-price-text{font-size:.72rem;color:var(--muted,#5A6072);line-height:1.35;padding-top:2px;}',
    '.sh-price-text b{color:var(--live,#1F9268);font-weight:600;}',
    '.sh-instock{display:flex;align-items:center;gap:.4rem;font-family:var(--f-mono,monospace);',
      'font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--live,#1F9268);font-weight:600;}',

    /* Description Widget */
    '.sh-desc-box{border-radius:20px !important;padding:1rem 1.25rem !important;}',
    '.sh-desc-text{color:var(--ink,#00072D);font-size:.85rem;line-height:1.62;margin:0;}',

    /* Details Accordion Widget */
    '.sh-accordion{padding:0 !important;overflow:hidden !important;border-radius:20px !important;}',
    '.sh-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;',
      'padding:1.05rem 1.25rem;font-family:var(--f-mono,monospace);font-size:.68rem;letter-spacing:.12em;',
      'text-transform:uppercase;color:var(--ink,#00072D);font-weight:700;cursor:pointer;background:none;border:none;}',
    '.sh-acc-btn .chev{transition:transform .25s;font-size:.65rem;}',
    '.sh-acc-btn.open .chev{transform:rotate(180deg);}',
    '.sh-acc-content{display:none;padding:0 1.25rem 1.05rem;border-top:1px solid var(--line,#E4E4D8);}',
    '.sh-acc-content.open{display:block;}',
    '.sh-spec-row{display:flex;justify-content:space-between;gap:1rem;font-size:.78rem;',
      'padding:.45rem 0;border-bottom:1px solid rgba(0,7,45,.06);}',
    '.sh-spec-row:last-child{border-bottom:none;}',
    '.sh-spec-k{font-family:var(--f-mono,monospace);font-size:.62rem;letter-spacing:.08em;',
      'color:var(--muted,#5A6072);text-transform:uppercase;}',
    '.sh-spec-v{color:var(--ink,#00072D);font-weight:500;}',

    /* ── WIDGET 6: STANDALONE ACTIONS & TRUST WIDGET ── */
    '.sh-action-widget{display:flex !important;flex-direction:column !important;gap:.85rem !important;',
      'width:100% !important;box-sizing:border-box !important;}',
    '.sh-actions{display:flex;gap:.7rem;align-items:stretch;width:100%;}',
    '.sh-qty-pill{display:flex;align-items:center;flex:none;overflow:hidden;',
      'background:rgba(255,255,255,.95);border:1px solid var(--line,#E4E4D8);border-radius:999px;',
      'box-shadow:0 4px 14px rgba(0,7,45,.08);}',
    '.sh-qty-pill button{width:38px;height:46px;font-size:1.1rem;color:var(--ink,#00072D);',
      'background:transparent;border:none;cursor:pointer;transition:background .15s;}',
    '.sh-qty-pill button:hover{background:rgba(0,7,45,.06);}',
    '.sh-qty-pill span{min-width:24px;text-align:center;font-family:var(--f-mono,monospace);',
      'font-weight:700;color:var(--ink,#00072D);font-size:.85rem;}',
    '.sh-btn-buy{flex:1.4;min-height:46px;border-radius:999px;background:var(--ink,#00072D);',
      'color:#FFFFFF;border:1px solid var(--ink,#00072D);font-family:var(--f-mono,monospace);',
      'font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;cursor:pointer;',
      'box-shadow:0 12px 26px -6px rgba(0,7,45,.38);transition:all .2s;}',
    '.sh-btn-buy:hover{background:var(--ink-soft,#2A3358);transform:translateY(-1px);}',
    '.sh-btn-bag{flex:1;min-height:46px;border-radius:999px;background:rgba(255,255,255,.92);',
      'color:var(--ink,#00072D);border:1px solid var(--line,#E4E4D8);font-family:var(--f-mono,monospace);',
      'font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;cursor:pointer;',
      'box-shadow:0 4px 14px rgba(0,7,45,.08);transition:all .2s;}',
    '.sh-btn-bag:hover{background:#FFFFFF;border-color:var(--ink,#00072D);}',

    /* trust badges */
    '.sh-trust{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:.55rem;margin-top:.2rem;',
      'font-family:var(--f-mono,monospace);font-size:.62rem;color:var(--muted,#5A6072);}',
    '.sh-trust li{display:flex;align-items:center;gap:.4rem;background:rgba(255,255,255,.65);backdrop-filter:blur(12px);',
      'padding:.45rem .65rem;border-radius:12px;border:1px solid rgba(255,255,255,.8);box-shadow:0 2px 8px rgba(0,7,45,.04);}',
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

        /* WIDGET 1: STANDALONE SQUIRCLE IMAGE WIDGET (Like Photos widget in Image 3) */
        '<div class="sh-hero-box" id="shStageWrap">' +
          '<span class="sh-float-counter" id="shCounter">1 / '+slides.length+'</span>' +
          '<button class="sh-float-close" id="shClose" aria-label="Close modal">✕</button>' +
          '<div id="shStage" style="width:100%;height:100%"></div>' +
        '</div>' +

        /* WIDGET 2: STANDALONE FLOATING APP-ICON THUMBNAILS (Image 2 aesthetic) */
        (slides.length > 1 ? '<div class="sh-thumbs" id="shThumbs">'+thumbsHtml+'</div>' : '') +

        /* WIDGET 3: STANDALONE TITLE & PRICE WIDGET (Like Spotify widget in Image 2) */
        '<div class="sh-box sh-info-box">' +
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

        /* WIDGET 4: STANDALONE DESCRIPTION WIDGET */
        '<div class="sh-box sh-desc-box">' +
          '<p class="sh-desc-text">'+p.desc+'</p>' +
        '</div>' +

        /* WIDGET 5: STANDALONE DETAILS ACCORDION WIDGET */
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

        /* WIDGET 6: STANDALONE ACTIONS & TRUST WIDGET */
        '<div class="sh-action-widget">' +
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
            '<li><span>◈</span> Hand-picked</li>' +
            '<li><span>▶</span> Filmed in real life</li>' +
            '<li><span>⇆</span> 7-day returns</li>' +
            '<li><span>⚑</span> Pan-India ship</li>' +
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
    sheet.querySelector('#shClose').addEventListener('click', close);

    /* touch swipe on hero image box */
    var touchStartX = 0;
    var stageWrap = sheet.querySelector('#shStageWrap');
    if(stageWrap){
      stageWrap.addEventListener('touchstart', function(e){
        if(e.touches && e.touches.length === 1){
          touchStartX = e.touches[0].clientX;
        }
      }, {passive: true});
      stageWrap.addEventListener('touchend', function(e){
        if(e.changedTouches && e.changedTouches.length === 1){
          var diffX = e.changedTouches[0].clientX - touchStartX;
          if(Math.abs(diffX) > 40){
            if(diffX < 0){ renderSlide(curIdx + 1); }
            else { renderSlide(curIdx - 1); }
          }
        }
      }, {passive: true});
    }

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

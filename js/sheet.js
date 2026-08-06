/* ═══════════════════════════════════════════════════════════
   THE AIM — PRODUCT SHEET

   Tapping any product opens it as a panel over the page — the
   background stays exactly where it was, blurred behind. Inside:
   the big photo, small thumbnails under it, then the name, price,
   details and buy options. Closing returns you to the same spot.

   No page reload, so it feels instant and continuous — the same
   feeling as opening something on iOS.
═══════════════════════════════════════════════════════════ */
(function(){
  if(typeof PRODUCTS === 'undefined') return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent = [
    /* scrim: lighter blur so the page behind is still readable through the glass */
    '.sh-scrim{position:fixed;inset:0;z-index:9000;background:rgba(3,5,16,.55);',
      'backdrop-filter:blur(30px) saturate(140%);-webkit-backdrop-filter:blur(30px) saturate(140%);',
      'opacity:0;transition:opacity .4s ease;}',
    '.sh-scrim.on{opacity:1;}',
    '.sh{position:fixed;z-index:9001;left:50%;top:50%;width:min(960px,92vw);max-height:90vh;',
      'transform:translate(-50%,-50%);overflow-y:auto;overflow-x:hidden;padding:.35rem;',
      'display:grid;grid-template-columns:1fr;gap:.6rem;align-content:start;scrollbar-width:none;}',
    '.sh::-webkit-scrollbar{display:none;}',
    '@media (min-width:900px){.sh{grid-template-columns:1.05fr .95fr;align-items:start;}',
      '.sh-col-a,.sh-col-b{display:grid;gap:.6rem;align-content:start;min-width:0;}}',
    /* ══ TRUE GLASS — translucent, background shows through ══ */
    '.card-f{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.20);border-radius:14px;',
      'box-shadow:0 18px 50px -20px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.22);',
      'backdrop-filter:blur(34px) saturate(180%);-webkit-backdrop-filter:blur(34px) saturate(180%);',
      'color:#F5F1E8;min-width:0;overflow:hidden;',
      'opacity:0;transform:translateY(14px) scale(.985);',
      'transition:opacity .5s ease var(--d,0s), transform .55s cubic-bezier(.2,.7,.24,1) var(--d,0s);}',
    '.sh.on .card-f{opacity:1;transform:none;}',
    /* hero: image sits on white so products read, card stays glass */
    '.sh-hero{padding:0;cursor:zoom-in;border-radius:14px;overflow:hidden;}',
    '.sh-hero .ph{width:100%;background:transparent;border-radius:12px;overflow:hidden;',
      'display:flex;align-items:center;justify-content:center;}',
    '.sh-hero img{width:100%;height:auto;max-height:56vh;object-fit:contain;display:block;border-radius:14px;}',
    '.sh-thumbs{padding:.4rem;display:flex;gap:.35rem;overflow-x:auto;scrollbar-width:none;}',
    '.sh-thumbs::-webkit-scrollbar{display:none;}',
    '.sh-t{flex:none;width:54px;height:54px;border-radius:8px;overflow:hidden;cursor:pointer;',
      'background:rgba(255,255,255,.9);border:1.5px solid transparent;opacity:.55;',
      'transition:opacity .25s,border-color .25s,transform .25s;display:flex;align-items:center;justify-content:center;padding:2px;}',
    '.sh-t:hover{transform:translateY(-2px);}',
    '.sh-t img{width:100%;height:100%;object-fit:contain;display:block;}',
    '.sh-t.on{opacity:1;border-color:rgba(255,255,255,.85);}',
    '.sh-t.vid{position:relative;}',
    '.sh-t.vid::after{content:"▶";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
      'background:rgba(5,8,24,.45);color:#fff;font-size:.65rem;}',
    /* text — light on glass, never overflowing */
    '.sh-info{padding:.95rem 1rem;}',
    '.sh-cat{font-family:var(--f-mono,monospace);font-size:.5rem;letter-spacing:.24em;text-transform:uppercase;color:rgba(245,241,232,.62);margin-bottom:.4rem;}',
    '.sh-name{font-family:var(--f-display,serif);font-weight:400;font-size:clamp(1.1rem,2.4vw,1.55rem);',
      'line-height:1.15;margin:0 0 .35rem;color:#FFF;letter-spacing:-.012em;',
      'overflow-wrap:anywhere;word-break:break-word;hyphens:auto;}',
    '.sh-price{font-family:var(--f-display,serif);font-size:1.35rem;color:#F2E2C4;margin:0 0 .2rem;}',
    '.sh-stock{font-family:var(--f-mono,monospace);font-size:.5rem;letter-spacing:.16em;text-transform:uppercase;color:#8FE0B8;margin-bottom:.6rem;}',
    '.sh-desc{color:rgba(245,241,232,.78);line-height:1.6;font-size:.83rem;margin:0;overflow-wrap:anywhere;}',
    /* see more details */
    '.sh-more{padding:0;}',
    '.sh-more > button{width:100%;text-align:left;background:none;border:none;cursor:pointer;padding:.8rem 1rem;',
      'font-family:var(--f-mono,monospace);font-size:.52rem;letter-spacing:.18em;text-transform:uppercase;color:#F5F1E8;',
      'display:flex;justify-content:space-between;align-items:center;gap:.6rem;}',
    '.sh-more > button span{transition:transform .35s ease;flex:none;}',
    '.sh-more.open > button span{transform:rotate(180deg);}',
    '.sh-more .body{max-height:0;overflow:hidden;transition:max-height .45s cubic-bezier(.2,.7,.24,1);}',
    '.sh-more.open .body{max-height:320px;}',
    '.sh-more .body-in{padding:0 1rem .9rem;}',
    '.sh-more .body-in div{display:flex;justify-content:space-between;gap:.8rem;padding:.38rem 0;font-size:.8rem;color:#F5F1E8;min-width:0;}',
    '.sh-more .body-in div + div{border-top:1px solid rgba(255,255,255,.12);}',
    '.sh-more .body-in b{font-weight:400;color:rgba(245,241,232,.55);font-family:var(--f-mono,monospace);font-size:.5rem;letter-spacing:.16em;text-transform:uppercase;flex:none;}',
    '.sh-more .body-in span{text-align:right;overflow-wrap:anywhere;}',
    /* actions */
    '.sh-acts{padding:.7rem .8rem;display:flex;gap:.45rem;flex-wrap:wrap;align-items:center;}',
    '.sh-qty{display:flex;align-items:center;gap:.2rem;border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:.2rem .3rem;flex:none;}',
    '.sh-qty button{background:none;border:none;color:#F5F1E8;cursor:pointer;font-size:1rem;width:26px;height:26px;border-radius:6px;}',
    '.sh-qty button:hover{background:rgba(255,255,255,.14);}',
    '.sh-buy{flex:1 1 120px;min-width:0;border:none;border-radius:8px;padding:.8rem 1rem;cursor:pointer;',
      'background:rgba(255,255,255,.92);color:#050818;font-family:var(--f-mono,monospace);font-size:.56rem;',
      'letter-spacing:.16em;text-transform:uppercase;font-weight:700;transition:transform .25s,background .25s;}',
    '.sh-buy:hover{transform:translateY(-2px);background:#fff;}',
    '.sh-bag{flex:0 1 auto;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.06);border-radius:8px;',
      'padding:.8rem .9rem;cursor:pointer;color:#F5F1E8;font-family:var(--f-mono,monospace);font-size:.54rem;',
      'letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;}',
    '.sh-bag:hover{background:rgba(255,255,255,.16);}',
    '.sh-x{position:fixed;top:16px;right:16px;z-index:9002;width:36px;height:36px;border-radius:10px;',
      'border:1px solid rgba(255,255,255,.22);cursor:pointer;background:rgba(255,255,255,.12);color:#F5F1E8;',
      'font-size:.95rem;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transition:background .25s,color .25s;}',
    '.sh-x:hover{background:rgba(255,255,255,.9);color:#050818;}',
    '.sh-zoom{position:fixed;inset:0;z-index:9500;background:rgba(3,5,16,.94);display:flex;',
      'align-items:center;justify-content:center;padding:1.5rem;cursor:zoom-out;opacity:0;transition:opacity .3s ease;',
      'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);}',
    '.sh-zoom.on{opacity:1;}',
    '.sh-zoom img{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;}',
    /* ══ MOBILE: smaller, never overlapping ══ */
    '@media (max-width:640px){',
      '.sh{width:92vw;max-height:84vh;padding:.25rem;gap:.45rem;border-radius:16px;}',
      '.sh-hero img{max-height:30vh;}',
      '.sh-t{width:40px;height:40px;border-radius:7px;}',
      '.sh-info{padding:.7rem .8rem;}',
      '.sh-name{font-size:1rem;line-height:1.2;}',
      '.sh-price{font-size:1.05rem;}',
      '.sh-acts{padding:.6rem;gap:.4rem;}',
      '.sh-buy{flex:1 1 100%;order:2;}',
      '.sh-bag{flex:1 1 100%;order:3;text-align:center;}',
      '.sh-qty{order:1;}',
      '.sh-x{top:10px;right:10px;width:32px;height:32px;}',
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
          '<div class="sh-cat">'+(p.category||'')+'</div>' +
          '<h2 class="sh-name">'+p.name+'</h2>' +
          '<div class="sh-price">'+money(p.price)+'</div>' +
          '<div class="sh-stock">'+(p.stock != null && p.stock <= 0 ? 'Sold out'
              : (p.stock != null && p.stock <= 5 ? 'Only '+p.stock+' left'
              : 'In stock · ships in 1–2 days'))+'</div>' +
          '<p class="sh-desc">'+(p.desc||'')+'</p>' +
        '</div>' +
        '<div class="card-f sh-more" id="shMore" style="--d:.17s">' +
          '<button type="button">See more details<span>⌄</span></button>' +
          '<div class="body"><div class="body-in">' +
            '<div><b>Category</b><span>'+(p.category||'—')+'</span></div>' +
            '<div><b>Product code</b><span>'+(p.sku||'—')+'</span></div>' +
            (p.stock != null ? '<div><b>Availability</b><span>'+(p.stock>0?'In stock':'Sold out')+'</span></div>' : '') +
            '<div><b>Delivery</b><span>1–2 days, pan-India</span></div>' +
            '<div><b>Returns</b><span>7 days</span></div>' +
          '</div></div>' +
        '</div>' +
        '<div class="card-f sh-acts" style="--d:.22s">' +
          '<div class="sh-qty"><button data-q="-1">−</button><span id="shQ">1</span><button data-q="1">+</button></div>' +
          '<button class="sh-buy" id="shBuy">Buy now</button>' +
          '<button class="sh-bag" id="shBag">Add to bag</button>' +
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

    /* see more details — expands in place */
    var more = sheet.querySelector('#shMore');
    more.querySelector('button').addEventListener('click', function(){
      more.classList.toggle('open');
      this.firstChild.textContent = more.classList.contains('open') ? 'Hide details' : 'See more details';
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
      var self = this; setTimeout(function(){ self.textContent = 'Add to bag'; }, 1400);
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

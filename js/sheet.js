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
    '.sh-scrim{position:fixed;inset:0;z-index:9000;background:rgba(7,11,33,.62);',
      'backdrop-filter:blur(22px) saturate(120%);-webkit-backdrop-filter:blur(22px) saturate(120%);',
      'opacity:0;transition:opacity .38s ease;}',
    '.sh-scrim.on{opacity:1;}',
    '.sh{position:fixed;z-index:9001;left:50%;top:50%;width:min(920px,94vw);max-height:92vh;',
      'transform:translate(-50%,-50%) scale(.94);opacity:0;overflow:hidden auto;',
      'background:#0C1233;border:1px solid rgba(230,203,168,.16);border-radius:22px;',
      'box-shadow:0 40px 120px -30px rgba(0,0,0,.8);',
      'transition:transform .46s cubic-bezier(.2,.7,.24,1), opacity .34s ease;}',
    '.sh.on{transform:translate(-50%,-50%) scale(1);opacity:1;}',
    '.sh-x{position:absolute;top:14px;right:14px;z-index:3;width:34px;height:34px;border-radius:50%;',
      'border:none;cursor:pointer;background:rgba(10,15,44,.7);color:#FFF1E2;font-size:1rem;',
      'backdrop-filter:blur(8px);}',
    '.sh-x:hover{background:#E6CBA8;color:#0A0F2C;}',
    '.sh-in{padding:clamp(1.1rem,3vw,2rem);}',
    '.sh-hero{width:100%;aspect-ratio:1/1;border-radius:16px;overflow:hidden;background:#FFF1E2;}',
    '.sh-hero img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.sh-thumbs{display:flex;gap:.55rem;margin-top:.7rem;overflow-x:auto;padding-bottom:.2rem;}',
    '.sh-t{flex:none;width:62px;height:62px;border-radius:10px;overflow:hidden;cursor:pointer;',
      'border:1px solid transparent;opacity:.55;transition:opacity .25s,border-color .25s;background:#FFF1E2;}',
    '.sh-t img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.sh-t.on{opacity:1;border-color:#E6CBA8;}',
    '.sh-cat{font-family:var(--f-mono,monospace);font-size:.56rem;letter-spacing:.22em;text-transform:uppercase;color:#9AA0C4;margin:1.4rem 0 .5rem;}',
    '.sh-name{font-family:var(--f-display,serif);font-weight:300;font-size:clamp(1.5rem,3.4vw,2.1rem);line-height:1.15;margin:0 0 .6rem;color:#FFF1E2;}',
    '.sh-price{font-family:var(--f-display,serif);font-size:1.7rem;color:#E6CBA8;margin:0 0 .3rem;}',
    '.sh-stock{font-family:var(--f-mono,monospace);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:#7FC7A6;margin-bottom:1rem;}',
    '.sh-desc{color:#9AA0C4;line-height:1.75;font-size:.92rem;margin:0 0 1.2rem;}',
    '.sh-facts{border-top:1px solid rgba(230,203,168,.12);padding-top:.9rem;margin-bottom:1.3rem;}',
    '.sh-facts div{display:flex;justify-content:space-between;gap:1rem;padding:.45rem 0;font-size:.85rem;color:#FFF1E2;}',
    '.sh-facts b{font-weight:400;color:#6B72A0;font-family:var(--f-mono,monospace);font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;}',
    '.sh-acts{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;}',
    '.sh-qty{display:flex;align-items:center;gap:.4rem;border:1px solid rgba(230,203,168,.22);border-radius:999px;padding:.3rem .5rem;}',
    '.sh-qty button{background:none;border:none;color:#FFF1E2;cursor:pointer;font-size:1rem;width:28px;height:28px;}',
    '.sh-buy{flex:1;min-width:150px;border:none;border-radius:999px;padding:.95rem 1.6rem;cursor:pointer;',
      'background:#E6CBA8;color:#0A0F2C;font-family:var(--f-mono,monospace);font-size:.64rem;',
      'letter-spacing:.16em;text-transform:uppercase;font-weight:700;transition:background .25s;}',
    '.sh-buy:hover{background:#FFF1E2;}',
    '.sh-bag{border:1px solid rgba(230,203,168,.3);background:none;border-radius:999px;padding:.95rem 1.4rem;',
      'cursor:pointer;color:#FFF1E2;font-family:var(--f-mono,monospace);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;}',
    '.sh-bag:hover{border-color:#E6CBA8;color:#E6CBA8;}',
    '.sh-full{display:block;text-align:center;margin-top:1rem;color:#6B72A0;font-family:var(--f-mono,monospace);',
      'font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;text-decoration:none;}',
    '.sh-full:hover{color:#E6CBA8;}',
    /* desktop: photo left, details right */
    '@media (min-width:820px){.sh-in{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start;}',
      '.sh-cat{margin-top:0;}}',
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
    sheet.innerHTML =
      '<button class="sh-x" aria-label="Close">✕</button>' +
      '<div class="sh-in">' +
        '<div>' +
          '<div class="sh-hero"><img id="shHero" src="'+imgs[0]+'" alt="'+p.name+'" /></div>' +
          '<div class="sh-thumbs">' +
            imgs.map(function(src,i){
              return '<button class="sh-t'+(i===0?' on':'')+'" data-i="'+i+'"><img src="'+src+'" alt="" /></button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="sh-cat">'+(p.category||'')+'</div>' +
          '<h2 class="sh-name">'+p.name+'</h2>' +
          '<div class="sh-price">'+money(p.price)+'</div>' +
          '<div class="sh-stock">'+(p.stock != null && p.stock <= 0 ? 'Sold out'
              : (p.stock != null && p.stock <= 5 ? 'Only '+p.stock+' left'
              : 'In stock · ships in 1–2 days'))+'</div>' +
          '<p class="sh-desc">'+(p.desc||'')+'</p>' +
          '<div class="sh-facts">' +
            '<div><b>Category</b><span>'+(p.category||'—')+'</span></div>' +
            '<div><b>Product code</b><span>'+(p.sku||'—')+'</span></div>' +
          '</div>' +
          '<div class="sh-acts">' +
            '<div class="sh-qty"><button data-q="-1">−</button><span id="shQ">1</span><button data-q="1">+</button></div>' +
            '<button class="sh-buy" id="shBuy">Buy now</button>' +
            '<button class="sh-bag" id="shBag">Add to bag</button>' +
          '</div>' +
          '<a class="sh-full" href="product.html?id='+p.id+'">Open full page →</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(sheet);
    document.body.classList.add('sh-open');

    requestAnimationFrame(function(){
      scrim.classList.add('on');
      sheet.classList.add('on');
    });

    /* gallery */
    var hero = sheet.querySelector('#shHero');
    sheet.querySelectorAll('.sh-t').forEach(function(t){
      t.addEventListener('click', function(){
        sheet.querySelectorAll('.sh-t').forEach(function(z){ z.classList.remove('on'); });
        t.classList.add('on');
        hero.style.opacity = '0';
        setTimeout(function(){ hero.src = imgs[+t.dataset.i]; hero.style.opacity = '1'; }, 130);
      });
    });
    hero.style.transition = 'opacity .26s ease';

    /* quantity + actions */
    var q = 1, qEl = sheet.querySelector('#shQ');
    sheet.querySelectorAll('[data-q]').forEach(function(b){
      b.addEventListener('click', function(){
        q = Math.max(1, Math.min(10, q + (+b.dataset.q)));
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

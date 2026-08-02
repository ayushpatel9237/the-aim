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
    '.sh-scrim{position:fixed;inset:0;z-index:9000;background:rgba(3,5,16,.72);',
      'backdrop-filter:blur(26px) saturate(115%);-webkit-backdrop-filter:blur(26px) saturate(115%);',
      'opacity:0;transition:opacity .4s ease;}',
    '.sh-scrim.on{opacity:1;}',
    /* the stage holds separate floating cards — no outer panel */
    '.sh{position:fixed;z-index:9001;left:50%;top:50%;width:min(1000px,94vw);max-height:92vh;',
      'transform:translate(-50%,-50%);overflow:hidden auto;padding:.5rem;',
      'display:grid;grid-template-columns:1fr;gap:.9rem;align-content:start;}',
    '@media (min-width:900px){.sh{grid-template-columns:1.02fr .98fr;align-items:start;}',
      '.sh-col-a{display:grid;gap:.9rem;}.sh-col-b{display:grid;gap:.9rem;}}',
    /* every card floats on its own */
    '.card-f{background:rgba(13,19,48,.72);border:1px solid rgba(230,203,168,.14);border-radius:20px;',
      'box-shadow:0 26px 70px -24px rgba(0,0,0,.85), 0 2px 0 rgba(255,241,226,.04) inset;',
      'backdrop-filter:blur(18px) saturate(130%);-webkit-backdrop-filter:blur(18px) saturate(130%);',
      'opacity:0;transform:translateY(18px) scale(.97);',
      'transition:opacity .5s ease var(--d,0s), transform .55s cubic-bezier(.2,.7,.24,1) var(--d,0s);}',
    '.sh.on .card-f{opacity:1;transform:none;}',
    /* hero photo card */
    '.sh-hero{padding:.6rem;}',
    '.sh-hero .ph{width:100%;aspect-ratio:1/1;border-radius:15px;overflow:hidden;background:#FFF1E2;}',
    '.sh-hero img{width:100%;height:100%;object-fit:cover;display:block;transition:opacity .26s ease;}',
    /* thumbnail card — scrolls on X */
    '.sh-thumbs{padding:.6rem;display:flex;gap:.5rem;overflow-x:auto;scrollbar-width:none;}',
    '.sh-thumbs::-webkit-scrollbar{display:none;}',
    '.sh-t{flex:none;width:64px;height:64px;border-radius:12px;overflow:hidden;cursor:pointer;',
      'border:1px solid transparent;opacity:.5;transition:opacity .25s,border-color .25s,transform .25s;background:#FFF1E2;}',
    '.sh-t:hover{transform:translateY(-2px);}',
    '.sh-t img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.sh-t.on{opacity:1;border-color:#E6CBA8;}',
    /* text card */
    '.sh-info{padding:1.4rem;}',
    '.sh-cat{font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:.24em;text-transform:uppercase;color:#8E96B8;margin-bottom:.6rem;}',
    '.sh-name{font-family:var(--f-display,serif);font-weight:300;font-size:clamp(1.4rem,3vw,1.95rem);line-height:1.12;margin:0 0 .5rem;color:#FFF1E2;letter-spacing:-.015em;}',
    '.sh-price{font-family:var(--f-display,serif);font-size:1.6rem;color:#E6CBA8;margin:0 0 .35rem;}',
    '.sh-stock{font-family:var(--f-mono,monospace);font-size:.56rem;letter-spacing:.16em;text-transform:uppercase;color:#7FC7A6;margin-bottom:1rem;}',
    '.sh-desc{color:#8E96B8;line-height:1.72;font-size:.9rem;margin:0;}',
    /* facts card */
    '.sh-facts{padding:1.1rem 1.4rem;}',
    '.sh-facts div{display:flex;justify-content:space-between;gap:1rem;padding:.42rem 0;font-size:.85rem;color:#FFF1E2;}',
    '.sh-facts div + div{border-top:1px solid rgba(230,203,168,.09);}',
    '.sh-facts b{font-weight:400;color:#5F678E;font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:.16em;text-transform:uppercase;}',
    /* action card */
    '.sh-acts{padding:1rem 1.2rem;display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;}',
    '.sh-qty{display:flex;align-items:center;gap:.3rem;border:1px solid rgba(230,203,168,.2);border-radius:999px;padding:.28rem .45rem;}',
    '.sh-qty button{background:none;border:none;color:#FFF1E2;cursor:pointer;font-size:1rem;width:28px;height:28px;border-radius:50%;transition:background .2s;}',
    '.sh-qty button:hover{background:rgba(230,203,168,.14);}',
    '.sh-buy{flex:1;min-width:140px;border:none;border-radius:999px;padding:.9rem 1.5rem;cursor:pointer;',
      'background:#E6CBA8;color:#050818;font-family:var(--f-mono,monospace);font-size:.62rem;',
      'letter-spacing:.18em;text-transform:uppercase;font-weight:700;transition:transform .25s,box-shadow .25s;}',
    '.sh-buy:hover{transform:translateY(-2px);box-shadow:0 12px 30px -12px rgba(230,203,168,.5);}',
    '.sh-bag{border:1px solid rgba(230,203,168,.28);background:none;border-radius:999px;padding:.9rem 1.3rem;',
      'cursor:pointer;color:#FFF1E2;font-family:var(--f-mono,monospace);font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;transition:border-color .25s,color .25s;}',
    '.sh-bag:hover{border-color:#E6CBA8;color:#E6CBA8;}',
    '.sh-x{position:fixed;top:20px;right:20px;z-index:9002;width:38px;height:38px;border-radius:50%;',
      'border:1px solid rgba(230,203,168,.2);cursor:pointer;background:rgba(13,19,48,.7);color:#FFF1E2;',
      'font-size:1rem;backdrop-filter:blur(10px);transition:background .25s,color .25s;}',
    '.sh-x:hover{background:#E6CBA8;color:#050818;}',
    '.sh-full{display:block;text-align:center;padding:.7rem;color:#5F678E;font-family:var(--f-mono,monospace);',
      'font-size:.55rem;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;}',
    '.sh-full:hover{color:#E6CBA8;}',
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
      '<div class="sh-col-a">' +
        '<div class="card-f sh-hero" style="--d:.02s"><div class="ph">' +
          '<img id="shHero" src="'+imgs[0]+'" alt="'+p.name+'" /></div></div>' +
        (imgs.length > 1
          ? '<div class="card-f sh-thumbs" style="--d:.08s">' +
              imgs.map(function(src,i){
                return '<button class="sh-t'+(i===0?' on':'')+'" data-i="'+i+'"><img src="'+src+'" alt="" /></button>';
              }).join('') +
            '</div>'
          : '') +
      '</div>' +
      '<div class="sh-col-b">' +
        '<div class="card-f sh-info" style="--d:.14s">' +
          '<div class="sh-cat">'+(p.category||'')+'</div>' +
          '<h2 class="sh-name">'+p.name+'</h2>' +
          '<div class="sh-price">'+money(p.price)+'</div>' +
          '<div class="sh-stock">'+(p.stock != null && p.stock <= 0 ? 'Sold out'
              : (p.stock != null && p.stock <= 5 ? 'Only '+p.stock+' left'
              : 'In stock · ships in 1–2 days'))+'</div>' +
          '<p class="sh-desc">'+(p.desc||'')+'</p>' +
        '</div>' +
        '<div class="card-f sh-facts" style="--d:.2s">' +
          '<div><b>Category</b><span>'+(p.category||'—')+'</span></div>' +
          '<div><b>Product code</b><span>'+(p.sku||'—')+'</span></div>' +
        '</div>' +
        '<div class="card-f sh-acts" style="--d:.26s">' +
          '<div class="sh-qty"><button data-q="-1">−</button><span id="shQ">1</span><button data-q="1">+</button></div>' +
          '<button class="sh-buy" id="shBuy">Buy now</button>' +
          '<button class="sh-bag" id="shBag">Add to bag</button>' +
        '</div>' +
        '<a class="sh-full" href="product.html?id='+p.id+'">Open full page →</a>' +
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

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
    '.sh-scrim{position:fixed;inset:0;z-index:9000;background:rgba(3,5,16,.78);',
      'backdrop-filter:blur(28px) saturate(115%);-webkit-backdrop-filter:blur(28px) saturate(115%);',
      'opacity:0;transition:opacity .4s ease;}',
    '.sh-scrim.on{opacity:1;}',
    '.sh{position:fixed;z-index:9001;left:50%;top:50%;width:min(1020px,94vw);max-height:92vh;',
      'transform:translate(-50%,-50%);overflow:hidden auto;padding:.4rem;',
      'display:grid;grid-template-columns:1fr;gap:.7rem;align-content:start;scrollbar-width:none;}',
    '.sh::-webkit-scrollbar{display:none;}',
    '@media (min-width:900px){.sh{grid-template-columns:1.05fr .95fr;align-items:start;}',
      '.sh-col-a,.sh-col-b{display:grid;gap:.7rem;align-content:start;}}',
    /* LIGHT glass cards, sharp edges */
    '.card-f{background:rgba(242,237,227,.94);border:1px solid rgba(255,255,255,.7);border-radius:10px;',
      'box-shadow:0 24px 60px -22px rgba(0,0,0,.78);',
      'backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);',
      'color:#0A0F26;opacity:0;transform:translateY(16px) scale(.98);',
      'transition:opacity .5s ease var(--d,0s), transform .55s cubic-bezier(.2,.7,.24,1) var(--d,0s);}',
    '.sh.on .card-f{opacity:1;transform:none;}',
    /* hero: full image always visible, grid adapts */
    '.sh-hero{padding:.45rem;cursor:zoom-in;}',
    '.sh-hero .ph{width:100%;background:#fff;border-radius:7px;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:240px;}',
    '.sh-hero img{width:100%;height:auto;max-height:60vh;object-fit:contain;display:block;transition:opacity .26s ease;}',
    /* thumbnails scroll on X, full image shown */
    '.sh-thumbs{padding:.45rem;display:flex;gap:.4rem;overflow-x:auto;scrollbar-width:none;}',
    '.sh-thumbs::-webkit-scrollbar{display:none;}',
    '.sh-t{flex:none;width:60px;height:60px;border-radius:7px;overflow:hidden;cursor:pointer;background:#fff;',
      'border:1.5px solid transparent;opacity:.55;transition:opacity .25s,border-color .25s,transform .25s;',
      'display:flex;align-items:center;justify-content:center;padding:2px;}',
    '.sh-t:hover{transform:translateY(-2px);}',
    '.sh-t img{width:100%;height:100%;object-fit:contain;display:block;}',
    '.sh-t.on{opacity:1;border-color:#0A0F26;}',
    '.sh-t.vid{position:relative;}',
    '.sh-t.vid::after{content:"▶";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
      'background:rgba(10,15,38,.45);color:#fff;font-size:.7rem;}',
    /* text cards — compact, sharp */
    '.sh-info{padding:1rem 1.1rem;}',
    '.sh-cat{font-family:var(--f-mono,monospace);font-size:.52rem;letter-spacing:.24em;text-transform:uppercase;color:#5F678E;margin-bottom:.45rem;}',
    '.sh-name{font-family:var(--f-display,serif);font-weight:400;font-size:clamp(1.25rem,2.6vw,1.7rem);line-height:1.12;margin:0 0 .4rem;color:#0A0F26;letter-spacing:-.015em;}',
    '.sh-price{font-family:var(--f-display,serif);font-size:1.45rem;color:#0A0F26;margin:0 0 .25rem;}',
    '.sh-stock{font-family:var(--f-mono,monospace);font-size:.53rem;letter-spacing:.16em;text-transform:uppercase;color:#2E7D5B;margin-bottom:.7rem;}',
    '.sh-desc{color:#3A4160;line-height:1.65;font-size:.86rem;margin:0;}',
    /* see more details — expands in place */
    '.sh-more{padding:0;overflow:hidden;}',
    '.sh-more > button{width:100%;text-align:left;background:none;border:none;cursor:pointer;padding:.85rem 1.1rem;',
      'font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:.18em;text-transform:uppercase;color:#0A0F26;',
      'display:flex;justify-content:space-between;align-items:center;}',
    '.sh-more > button span{transition:transform .35s ease;}',
    '.sh-more.open > button span{transform:rotate(180deg);}',
    '.sh-more .body{max-height:0;transition:max-height .45s cubic-bezier(.2,.7,.24,1);}',
    '.sh-more.open .body{max-height:300px;}',
    '.sh-more .body-in{padding:0 1.1rem 1rem;}',
    '.sh-more .body-in div{display:flex;justify-content:space-between;gap:1rem;padding:.4rem 0;font-size:.83rem;color:#0A0F26;}',
    '.sh-more .body-in div + div{border-top:1px solid rgba(10,15,38,.1);}',
    '.sh-more .body-in b{font-weight:400;color:#5F678E;font-family:var(--f-mono,monospace);font-size:.52rem;letter-spacing:.16em;text-transform:uppercase;}',
    /* actions */
    '.sh-acts{padding:.8rem .9rem;display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;}',
    '.sh-qty{display:flex;align-items:center;gap:.25rem;border:1px solid rgba(10,15,38,.2);border-radius:7px;padding:.22rem .35rem;}',
    '.sh-qty button{background:none;border:none;color:#0A0F26;cursor:pointer;font-size:1rem;width:26px;height:26px;border-radius:5px;}',
    '.sh-qty button:hover{background:rgba(10,15,38,.08);}',
    '.sh-buy{flex:1;min-width:130px;border:none;border-radius:7px;padding:.85rem 1.3rem;cursor:pointer;',
      'background:#0A0F26;color:#F2EDE3;font-family:var(--f-mono,monospace);font-size:.6rem;',
      'letter-spacing:.18em;text-transform:uppercase;font-weight:700;transition:transform .25s,background .25s;}',
    '.sh-buy:hover{transform:translateY(-2px);background:#161E4C;}',
    '.sh-bag{border:1px solid rgba(10,15,38,.28);background:none;border-radius:7px;padding:.85rem 1.1rem;',
      'cursor:pointer;color:#0A0F26;font-family:var(--f-mono,monospace);font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;}',
    '.sh-bag:hover{background:rgba(10,15,38,.07);}',
    '.sh-x{position:fixed;top:18px;right:18px;z-index:9002;width:38px;height:38px;border-radius:8px;',
      'border:1px solid rgba(242,237,227,.25);cursor:pointer;background:rgba(10,15,38,.75);color:#F2EDE3;',
      'font-size:1rem;backdrop-filter:blur(10px);transition:background .25s,color .25s;}',
    '.sh-x:hover{background:#F2EDE3;color:#0A0F26;}',
    /* full-screen zoom when the hero is tapped */
    '.sh-zoom{position:fixed;inset:0;z-index:9500;background:rgba(3,5,16,.96);display:flex;',
      'align-items:center;justify-content:center;padding:2rem;cursor:zoom-out;opacity:0;transition:opacity .3s ease;}',
    '.sh-zoom.on{opacity:1;}',
    '.sh-zoom img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;}',
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

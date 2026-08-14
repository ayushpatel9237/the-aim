/* ═══════════════════════════════════════════════════════════
   THE AIM — PRODUCT SHEET

   Ported from the Ascentra popup-card so both sites read the
   same. The image tile is the only glass box; the thumbnail
   strip floats free below it, and the info and actions are bare
   text held apart by spacing. Natural page scroll, no reload.
═══════════════════════════════════════════════════════════ */
(function(){
  if(typeof PRODUCTS === 'undefined') return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent = [
    /* ── overlay ── */
    '.sh-scrim{position:fixed;inset:0;z-index:9000;background:rgba(6,7,16,.93);',
      'backdrop-filter:blur(34px) brightness(.32) saturate(115%);',
      '-webkit-backdrop-filter:blur(34px) brightness(.32) saturate(115%);',
      'opacity:0;transition:opacity .35s ease;}',
    '.sh-scrim.on{opacity:1;}',

    /* ── the card: no box at all, just a column ── */
    '.sh{position:fixed;inset:0;z-index:9001;overflow-y:auto;overflow-x:hidden;',
      'padding:max(3vh,1rem) 1rem 3rem;scrollbar-width:none;',
      'opacity:0;transition:opacity .3s ease;}',
    '.sh.on{opacity:1;}',
    '.sh::-webkit-scrollbar{display:none;}',
    '.sh-card{position:relative;max-width:420px;width:100%;margin:0 auto;display:flex;flex-direction:column;',
      'transform:translateY(26px) scale(.93);',
      'transition:transform .35s cubic-bezier(.34,1.56,.64,1);}',
    '.sh.on .sh-card{transform:none;}',

    /* ── IMAGE TILE — the one glass frame ── */
    '.sh-tile{',
      'background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.01) 18%),',
        'linear-gradient(168deg,rgba(36,36,62,.58),rgba(10,10,22,.72));',
      'backdrop-filter:blur(40px) saturate(175%);-webkit-backdrop-filter:blur(40px) saturate(175%);',
      'border:0.5px solid rgba(255,255,255,.09);border-radius:24px;',
      'box-shadow:0 18px 50px rgba(0,0,0,.48),inset 0 1.5px 0 rgba(255,255,255,.3);',
      'padding:.6rem .6rem .55rem;}',

    '.sh-hero{position:relative;width:100%;border-radius:17px;overflow:hidden;padding:9%;',
      'background:#07070d;border:0.5px solid rgba(255,255,255,.05);',
      'box-shadow:inset 0 1.5px 0 rgba(255,255,255,.18),inset 0 0 0 1px rgba(255,255,255,.03);',
      'cursor:zoom-in;}',
    /* top sheen + vignette over everything */
    '.sh-hero::after{content:"";position:absolute;inset:0;z-index:3;pointer-events:none;border-radius:inherit;',
      'background:linear-gradient(180deg,rgba(255,255,255,.06),transparent 16%),',
        'radial-gradient(125% 85% at 50% 42%,transparent 56%,rgba(0,0,0,.42) 100%);}',
    /* height comes from the photo, so the frame fits every shape */
    '.sh-stage{position:relative;z-index:1;width:100%;display:flex;',
      'align-items:center;justify-content:center;}',
    '.sh-stage img{width:100%;height:auto;max-height:54vh;object-fit:contain;display:block;',
      'border-radius:6px;filter:drop-shadow(0 18px 24px rgba(0,0,0,.5));',
      'transition:transform .6s cubic-bezier(.2,.7,.3,1);}',
    '.sh-hero:hover .sh-stage img{transform:scale(1.02);}',
    '.sh-stage iframe,.sh-stage video{width:100%;aspect-ratio:16/9;height:auto;',
      'border:none;border-radius:6px;}',

    /* editorial corner ticks */
    '.sh-tick{position:absolute;width:14px;height:14px;border:1.5px solid rgba(216,195,160,.62);',
      'z-index:4;pointer-events:none;}',
    '.sh-tick.tl{top:11px;left:11px;border-right:0;border-bottom:0;}',
    '.sh-tick.tr{top:11px;right:11px;border-left:0;border-bottom:0;}',
    '.sh-tick.bl{bottom:11px;left:11px;border-right:0;border-top:0;}',
    '.sh-tick.br{bottom:11px;right:11px;border-left:0;border-top:0;}',

    /* ← main photo chip */
    '.sh-main{position:absolute;bottom:.75rem;left:.75rem;z-index:5;cursor:pointer;',
      'background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,.04));',
      'backdrop-filter:blur(18px) saturate(160%);-webkit-backdrop-filter:blur(18px) saturate(160%);',
      'border:1px solid rgba(255,255,255,.2);box-shadow:inset 0 1px 0 rgba(255,255,255,.45);',
      'border-radius:8px;color:#D8C3A0;font-family:var(--f-mono,monospace);font-size:.5rem;',
      'letter-spacing:1px;text-transform:uppercase;padding:5px 10px;display:none;align-items:center;gap:4px;',
      'transition:.15s;}',
    '.sh-main.on{display:inline-flex;}',
    '.sh-main:hover{background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,.1));',
      'border-color:rgba(255,255,255,.35);}',

    /* ── THUMBNAILS — outside the box, each its own glass tile ── */
    '.sh-thumbs-wrap{margin-top:.55rem;padding:0 .1rem;}',
    '.sh-thumbs{display:flex;gap:.5rem;overflow-x:auto;padding:3px;scrollbar-width:none;}',
    '.sh-thumbs::-webkit-scrollbar{display:none;}',
    '.sh-t{width:68px;height:68px;flex:0 0 68px;border-radius:12px;overflow:hidden;cursor:pointer;',
      'background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));',
      'backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%);',
      'border:0.5px solid rgba(255,255,255,.12);',
      'box-shadow:0 4px 16px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.22);',
      'transition:transform .15s,border-color .18s,box-shadow .18s;padding:0;position:relative;}',
    '.sh-t img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.sh-t:hover{transform:scale(1.06);border-color:rgba(255,255,255,.22);}',
    '.sh-t.on{border:1px solid #D8C3A0;',
      'box-shadow:0 4px 18px rgba(216,195,160,.22),0 0 0 1px rgba(216,195,160,.2),',
        'inset 0 1px 0 rgba(255,255,255,.3);}',
    '.sh-t.vid::after{content:"▶";position:absolute;inset:0;display:flex;align-items:center;',
      'justify-content:center;background:rgba(6,6,12,.45);color:#fff;font-size:.8rem;}',

    /* ── INFO — floating text, no box ── */
    '.sh-info{padding:1.3rem .1rem 0;}',
    '.sh-eyebrow{font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:2px;',
      'text-transform:uppercase;color:#D8C3A0;opacity:.8;margin-bottom:.5rem;}',
    '.sh-meta{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.5rem;}',
    '.sh-sku{font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:2px;',
      'text-transform:uppercase;color:#6E6C78;}',
    '.sh-chip{display:inline-flex;align-items:center;gap:3px;color:#5DCAA5;',
      'background:linear-gradient(180deg,rgba(93,202,165,.24),rgba(93,202,165,.06));',
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
      'border:1px solid rgba(93,202,165,.32);box-shadow:inset 0 1px 0 rgba(255,255,255,.32);',
      'font-family:var(--f-mono,monospace);font-size:.56rem;padding:2px 8px;border-radius:6px;}',
    '.sh-name{font-family:var(--f-body,system-ui),sans-serif;font-weight:700;font-size:1.3rem;',
      'color:#F4F2EC;text-align:left;line-height:1.24;letter-spacing:-.3px;margin:.36rem 0 .85rem;}',

    /* price — gold left bar, no box */
    '.sh-price-strip{border-left:2px solid rgba(216,195,160,.55);padding-left:.85rem;margin:.15rem 0 .8rem;}',
    '.sh-price-row{display:flex;align-items:baseline;gap:.6rem;flex-wrap:wrap;margin:0 0 .25rem;}',
    '.sh-price{font-family:var(--f-body,system-ui),sans-serif;font-size:1.6rem;font-weight:700;',
      'color:#D8C3A0;line-height:1;letter-spacing:-.5px;}',
    '.sh-mrp{font-family:var(--f-mono,monospace);font-size:.62rem;color:#6E6C78;}',
    '.sh-mrp s{text-decoration:line-through;}',
    '.sh-mrp b{color:#5DCAA5;font-weight:700;}',
    '.sh-tax{font-size:.6rem;color:#F4F2EC;opacity:.45;margin-top:.25rem;',
      'display:flex;align-items:center;gap:.3rem;}',

    '.sh-stock{font-family:var(--f-mono,monospace);font-size:.58rem;letter-spacing:1.4px;',
      'text-transform:uppercase;color:#7FBFA0;margin:-.5rem 0 .1rem;}',
    '.sh-desc{color:rgba(244,242,236,.52);font-size:.74rem;line-height:1.7;',
      'text-align:left;margin:.2rem 0 .85rem;}',

    /* see full details — gold text link */
    '.sh-more-btn{background:none;border:none;box-shadow:none;cursor:pointer;',
      'color:rgba(216,195,160,.66);font-family:var(--f-mono,monospace);font-size:.6rem;',
      'letter-spacing:1.2px;text-transform:uppercase;padding:.15rem 0;border-radius:0;',
      'text-decoration:underline;text-underline-offset:3px;width:auto;',
      'display:inline-flex;align-items:center;gap:.5rem;justify-content:flex-start;}',
    '.sh-more-btn:hover{color:#D8C3A0;}',
    '.sh-chev{font-size:.55rem;transition:transform .25s;}',
    '.sh-more-btn.open .sh-chev{transform:rotate(180deg);}',
    '.sh-more{max-height:0;overflow:hidden;transition:max-height .4s ease;}',
    '.sh-more.open{max-height:680px;}',
    '.sh-more-in{padding:.1rem 0 .7rem;}',
    '.sh-more-in h5{font-family:var(--f-mono,monospace);font-size:.56rem;letter-spacing:2.5px;',
      'text-transform:uppercase;color:rgba(216,195,160,.7);margin:.6rem 0 .5rem;font-weight:400;}',
    '.sh-spec{display:flex;justify-content:space-between;gap:1rem;font-size:.7rem;',
      'padding:.46rem 0;border-bottom:1px solid rgba(255,255,255,.055);}',
    '.sh-spec-k{font-family:var(--f-mono,monospace);font-size:.62rem;letter-spacing:.5px;',
      'color:#6E6C78;text-transform:uppercase;}',
    '.sh-spec-v{color:#F4F2EC;text-align:right;}',

    /* ── ACTIONS — float free below the text ── */
    '.sh-acts{padding:.85rem 0 0;}',
    '.sh-act-row{display:flex;gap:.5rem;align-items:stretch;}',
    '.sh-qty{display:flex;align-items:center;flex:0 0 auto;overflow:hidden;',
      'background:rgba(255,255,255,.06);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      'border:0.5px solid rgba(255,255,255,.11);border-radius:50px;',
      'box-shadow:inset 0 1px 0 rgba(255,255,255,.16);}',
    '.sh-qty button{background:transparent;border:none;color:#D8C3A0;width:32px;align-self:stretch;',
      'font-size:1.05rem;cursor:pointer;transition:background .15s;}',
    '.sh-qty button:hover{background:rgba(216,195,160,.12);}',
    '.sh-qty span{min-width:24px;text-align:center;color:#F4F2EC;',
      'font-family:var(--f-mono,monospace);font-size:.82rem;}',
    '.sh-btns{display:flex;gap:.5rem;flex:1;}',
    /* primary CTA — gold with a light sweep */
    '.sh-buy{position:relative;overflow:hidden;flex:1.4;cursor:pointer;',
      'background:linear-gradient(180deg,#FFFFFF,#EFECE4);',
      'color:#0A0F26;border:0.5px solid rgba(255,255,255,.8);border-radius:13px;',
      'box-shadow:inset 0 1px 0 rgba(255,255,255,1),0 6px 20px rgba(255,255,255,.16);',
      'padding:.72rem;font-family:var(--f-body,system-ui),sans-serif;font-size:.76rem;',
      'font-weight:700;letter-spacing:.3px;transition:transform .12s;}',
    '.sh-buy::before{content:"";position:absolute;top:0;left:-65%;width:48%;height:100%;',
      'background:linear-gradient(105deg,transparent,rgba(10,15,38,.07),transparent);',
      'transform:skewX(-18deg);transition:left .7s cubic-bezier(.25,.8,.3,1);pointer-events:none;}',
    '.sh-buy:hover{transform:translateY(-1px);}',
    '.sh-buy:hover::before{left:135%;}',
    '.sh-bag{flex:1;cursor:pointer;background:rgba(255,255,255,.04);',
      'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      'border:0.5px solid rgba(255,255,255,.11);border-radius:13px;',
      'color:rgba(244,242,236,.72);box-shadow:inset 0 1px 0 rgba(255,255,255,.14);',
      'padding:.7rem;font-family:var(--f-body,system-ui),sans-serif;font-size:.74rem;',
      'transition:background .18s,border-color .18s,color .18s;}',
    '.sh-bag:hover{border-color:rgba(216,195,160,.32);color:#D8C3A0;}',

    /* ── close ── */
    '.sh-x{position:absolute;top:.75rem;right:.75rem;z-index:9002;',
      'width:31px;height:31px;border-radius:50%;cursor:pointer;',
      'background:rgba(8,8,18,.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
      'border:0.5px solid rgba(255,255,255,.15);color:rgba(244,242,236,.85);font-size:.78rem;',
      'display:flex;align-items:center;justify-content:center;transition:.18s;}',
    '.sh-x:hover{background:rgba(6,6,12,.9);color:#F4F2EC;border-color:rgba(216,195,160,.45);}',

    /* ── zoom ── */
    '.sh-zoom{position:fixed;inset:0;z-index:9500;background:rgba(3,3,8,.94);display:flex;',
      'align-items:center;justify-content:center;padding:1.5rem;cursor:zoom-out;opacity:0;',
      'transition:opacity .3s ease;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);}',
    '.sh-zoom.on{opacity:1;}',
    '.sh-zoom img{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;}',

    /* graceful fallback where backdrop-filter is unsupported */
    '@supports not ((backdrop-filter:blur(2px)) or (-webkit-backdrop-filter:blur(2px))){',
      '.sh-scrim{background:rgba(3,3,8,.92);}',
      '.sh-tile{background:linear-gradient(168deg,rgba(30,30,52,.97),rgba(12,12,26,.98));}',
      '.sh-t,.sh-qty,.sh-bag,.sh-x{background:rgba(40,40,64,.9);}',
    '}',

    '@media (max-width:560px){',
      '.sh{padding:max(2vh,.7rem) .6rem calc(3.5rem + env(safe-area-inset-bottom));}',
      '.sh-card{max-width:100%;}',
      '.sh-t{width:68px;height:68px;flex:0 0 68px;}',
      '.sh-info{padding:1.4rem .15rem 0;}',
      '.sh-eyebrow{font-size:.62rem;letter-spacing:2.4px;}',
      '.sh-sku{font-size:.62rem;}',
      '.sh-chip{font-size:.62rem;padding:3px 10px;}',
      '.sh-name{font-size:1.5rem;line-height:1.2;margin:.5rem 0 .9rem;}',
      '.sh-price{font-size:1.9rem;}',
      '.sh-mrp{font-size:.68rem;}',
      '.sh-tax{font-size:.66rem;}',
      '.sh-desc{font-size:.82rem;line-height:1.75;}',
      '.sh-more-btn{font-size:.65rem;}',
      '.sh-spec,.sh-spec-v{font-size:.78rem;}',
      '.sh-buy,.sh-bag{font-size:.9rem;padding:.9rem .6rem;}',
      '.sh-qty button{width:38px;font-size:1.2rem;}',
      '.sh-qty span{font-size:.9rem;}',
      '.sh-x{top:.65rem;right:.65rem;width:34px;height:34px;}',
      '.sh-tile{padding:.5rem;border-radius:20px;}',
      '.sh-hero{border-radius:14px;padding:8%;}',
      '.sh-thumbs{gap:.35rem;padding:2px;}',
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

    /* video (if any) becomes the first slide */
    var slides = [];
    if(p.video) slides.push({ type:'video', src:p.video, poster:imgs[0] });
    imgs.forEach(function(src){ slides.push({ type:'img', src:src }); });

    var badgeText = p.badge || (p.isNew ? 'New' : '');
    var offPct = (p.mrp && p.mrp > p.price) ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    var stockTxt = 'In stock · ships in 1–2 days';
    if(p.stock != null && p.stock <= 0) stockTxt = 'Sold out';
    else if(p.stock != null && p.stock <= 5) stockTxt = 'Only ' + p.stock + ' left';

    /* the tagline only prints when it says something the
       description doesn't — otherwise the same line appears twice */
    var tagline = '';
    if(p.short){
      var a = p.short.trim(), b = (p.desc||'').trim();
      var norm = function(t){ return t.toLowerCase().replace(/[\s\u2026.]+$/,''); };
      /* skip it when the description already opens with the same words —
         short is often just a truncated version of desc */
      if(!b || (norm(b).indexOf(norm(a)) !== 0 && norm(a) !== norm(b))) tagline = p.short;
    }

    sheet.innerHTML =
      '<div class="sh-card">' +
        '<button class="sh-x" aria-label="Close">✕</button>' +

        /* IMAGE TILE — the one glass frame */
        '<div class="sh-tile">' +
          '<div class="sh-hero" id="shHero">' +
            '<div class="sh-stage" id="shStage">' +
              '<img src="'+slides[0].src+'" alt="'+p.name+'" />' +
            '</div>' +
            '<span class="sh-tick tl"></span><span class="sh-tick tr"></span>' +
            '<span class="sh-tick bl"></span><span class="sh-tick br"></span>' +
            '<button class="sh-main" id="shMainBtn">← Main photo</button>' +
          '</div>' +
        '</div>' +

        /* THUMBNAILS — outside the box, floating free */
        (slides.length > 1
          ? '<div class="sh-thumbs-wrap"><div class="sh-thumbs">' +
              slides.map(function(sl,i){
                return '<button class="sh-t'+(i===0?' on':'')+(sl.type==='video'?' vid':'')+'" data-i="'+i+'">' +
                       '<img src="'+(sl.type==='video' ? (sl.poster||'') : sl.src)+'" alt="" /></button>';
              }).join('') +
            '</div></div>'
          : '') +

        /* INFO — pure floating text */
        '<div class="sh-info">' +
          '<div class="sh-eyebrow">The AIM · Verified</div>' +
          '<div class="sh-meta">' +
            (p.sku ? '<span class="sh-sku">SKU '+p.sku+'</span>' : '') +
            (badgeText ? '<span class="sh-chip">'+badgeText+'</span>' : '') +
          '</div>' +
          '<div class="sh-name">'+p.name+'</div>' +

          '<div class="sh-price-strip">' +
            '<div class="sh-price-row">' +
              '<div class="sh-price">'+money(p.price)+'</div>' +
              (offPct
                ? '<div class="sh-mrp">M.R.P. <s>'+money(p.mrp)+'</s> · <b>'+offPct+'% off</b></div>'
                : '') +
            '</div>' +
            '<div class="sh-tax">✓ Inclusive of all taxes · Free delivery above ₹499</div>' +
          '</div>' +
          '<div class="sh-stock">'+stockTxt+'</div>' +

          (tagline ? '<div class="sh-desc">'+tagline+'</div>' : '') +
          (p.desc ? '<div class="sh-desc">'+p.desc+'</div>' : '') +

          '<button class="sh-more-btn" id="shMoreBtn">' +
            '<span id="shMoreLabel">See full details</span>' +
            '<span class="sh-chev">▼</span>' +
          '</button>' +
          '<div class="sh-more" id="shMore"><div class="sh-more-in">' +
            '<h5>Specifications</h5>' +
            '<div class="sh-spec"><span class="sh-spec-k">Category</span><span class="sh-spec-v">'+(p.category||'—')+'</span></div>' +
            '<div class="sh-spec"><span class="sh-spec-k">Product code</span><span class="sh-spec-v">'+(p.sku||'—')+'</span></div>' +
            (p.stock != null ? '<div class="sh-spec"><span class="sh-spec-k">Availability</span><span class="sh-spec-v">'+(p.stock>0?'In stock':'Sold out')+'</span></div>' : '') +
            '<div class="sh-spec"><span class="sh-spec-k">Delivery</span><span class="sh-spec-v">1–2 days, pan-India</span></div>' +
            '<div class="sh-spec"><span class="sh-spec-k">Returns</span><span class="sh-spec-v">7 days</span></div>' +
          '</div></div>' +
        '</div>' +

        /* ACTIONS */
        '<div class="sh-acts"><div class="sh-act-row">' +
          '<div class="sh-qty">' +
            '<button data-q="-1" aria-label="Decrease quantity">−</button>' +
            '<span id="shQ">1</span>' +
            '<button data-q="1" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<div class="sh-btns">' +
            '<button class="sh-buy" id="shBuy">⚡ Buy Now</button>' +
            '<button class="sh-bag" id="shBag">+ Cart</button>' +
          '</div>' +
        '</div></div>' +

      '</div>';

    document.body.appendChild(sheet);
    document.body.classList.add('sh-open');

    /* clicking the backdrop (not the card) closes */
    sheet.addEventListener('click', function(e){
      if(e.target === sheet) close();
    });

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

    /* tap the photo → full-screen zoom */
    sheet.querySelector('#shHero').addEventListener('click', function(e){
      if(e.target.closest('.sh-main')) return;
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
    var more     = sheet.querySelector('#shMore');
    var moreBtn  = sheet.querySelector('#shMoreBtn');
    var moreLbl  = sheet.querySelector('#shMoreLabel');
    moreBtn.addEventListener('click', function(){
      var isOpen = more.classList.toggle('open');
      moreBtn.classList.toggle('open', isOpen);
      moreLbl.textContent = isOpen ? 'Hide details' : 'See full details';
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
      var self = this; setTimeout(function(){ self.textContent = '+ Cart'; }, 1400);
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

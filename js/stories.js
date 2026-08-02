/* ═══════════════════════════════════════════════════════════
   THE AIM — STORY VIEWER

   Tapping a clip in "Watch before you buy" opens it full-screen,
   the way Instagram stories work: progress bars along the top,
   tap the right side for the next clip, the left side to go back,
   swipe down or press Escape to close.
═══════════════════════════════════════════════════════════ */
(function(){
  var css = document.createElement('style');
  css.textContent = [
    '.st-wrap{position:fixed;inset:0;z-index:9500;background:#070B21;opacity:0;',
      'transition:opacity .3s ease;display:flex;align-items:center;justify-content:center;}',
    '.st-wrap.on{opacity:1;}',
    '.st-stage{position:relative;width:min(430px,100vw);height:100%;max-height:100vh;',
      'background:#0A0F2C;overflow:hidden;display:flex;align-items:center;justify-content:center;}',
    '.st-stage img,.st-stage video,.st-stage iframe{width:100%;height:100%;object-fit:cover;border:0;display:block;}',
    '.st-bars{position:absolute;top:10px;left:10px;right:10px;z-index:4;display:flex;gap:4px;}',
    '.st-bar{flex:1;height:2.5px;border-radius:2px;background:rgba(255,241,226,.28);overflow:hidden;}',
    '.st-bar i{display:block;height:100%;width:0;background:#E6CBA8;}',
    '.st-bar.done i{width:100%;}',
    '.st-bar.now i{animation:stfill 6s linear forwards;}',
    '@keyframes stfill{from{width:0}to{width:100%}}',
    '.st-head{position:absolute;top:26px;left:14px;right:14px;z-index:4;display:flex;align-items:center;gap:.7rem;}',
    '.st-title{flex:1;font-size:.82rem;color:#FFF1E2;text-shadow:0 1px 8px rgba(0,0,0,.6);}',
    '.st-x{background:rgba(10,15,44,.55);border:none;color:#FFF1E2;width:32px;height:32px;',
      'border-radius:50%;cursor:pointer;font-size:.95rem;backdrop-filter:blur(6px);}',
    '.st-nav{position:absolute;inset:0;z-index:3;display:flex;}',
    '.st-nav button{flex:1;background:none;border:none;cursor:pointer;}',
    '.st-foot{position:absolute;left:0;right:0;bottom:0;z-index:4;padding:1.4rem 1.1rem;',
      'background:linear-gradient(to top,rgba(7,11,33,.92),transparent);}',
    '.st-name{font-family:var(--f-display,serif);font-size:1.15rem;color:#FFF1E2;margin-bottom:.7rem;}',
    '.st-shop{display:inline-block;background:#E6CBA8;color:#0A0F2C;border:none;border-radius:999px;',
      'padding:.7rem 1.5rem;cursor:pointer;font-family:var(--f-mono,monospace);font-size:.6rem;',
      'letter-spacing:.16em;text-transform:uppercase;font-weight:700;text-decoration:none;}',
    'body.st-open{overflow:hidden;}'
  ].join('');
  document.head.appendChild(css);

  var wrap, idx = 0, items = [], onKey;

  function render(){
    var it = items[idx];
    if(!it){ close(); return; }
    var media = it.video && window.AscentraVideo
      ? AscentraVideo.embedHTML(it.video)
      : '<img src="'+(it.poster || it.img || '')+'" alt="'+(it.name||'')+'" />';

    wrap.querySelector('.st-stage').innerHTML =
      '<div class="st-bars">' + items.map(function(_,i){
        return '<div class="st-bar'+(i<idx?' done':i===idx?' now':'')+'"><i></i></div>';
      }).join('') + '</div>' +
      '<div class="st-head"><span class="st-title">THE AIM</span>' +
        '<button class="st-x" aria-label="Close">✕</button></div>' +
      media +
      '<div class="st-nav"><button aria-label="Previous"></button><button aria-label="Next"></button></div>' +
      '<div class="st-foot"><div class="st-name">'+(it.name||'')+'</div>' +
        (it.shop ? '<a class="st-shop" href="product.html?id='+it.shop+'">Shop this →</a>' : '') +
      '</div>';

    wrap.querySelector('.st-x').addEventListener('click', close);
    var nav = wrap.querySelectorAll('.st-nav button');
    nav[0].addEventListener('click', function(){ go(-1); });
    nav[1].addEventListener('click', function(){ go(1); });
  }

  function go(d){ idx += d; if(idx < 0) idx = 0; if(idx >= items.length){ close(); return; } render(); }

  function close(){
    if(!wrap) return;
    wrap.classList.remove('on');
    document.body.classList.remove('st-open');
    document.removeEventListener('keydown', onKey);
    var w = wrap; wrap = null;
    setTimeout(function(){ if(w) w.remove(); }, 320);
  }

  function open(list, start){
    if(wrap) return;
    items = list; idx = start || 0;
    wrap = document.createElement('div');
    wrap.className = 'st-wrap';
    wrap.innerHTML = '<div class="st-stage"></div>';
    document.body.appendChild(wrap);
    document.body.classList.add('st-open');
    render();
    requestAnimationFrame(function(){ wrap.classList.add('on'); });

    onKey = function(e){
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowRight') go(1);
      if(e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);

    /* swipe down to dismiss */
    var y0 = null;
    wrap.addEventListener('touchstart', function(e){ y0 = e.touches[0].clientY; }, {passive:true});
    wrap.addEventListener('touchend', function(e){
      if(y0 !== null && e.changedTouches[0].clientY - y0 > 80) close();
      y0 = null;
    }, {passive:true});
  }

  window.AimStories = { open: open };

  /* hook the homepage feed cards */
  document.addEventListener('click', function(e){
    var card = e.target.closest && e.target.closest('[data-story]');
    if(!card) return;
    if(e.target.closest('a')) return;              // let "Shop this" links work
    e.preventDefault();
    if(typeof FEED !== 'undefined') open(FEED, +card.dataset.story || 0);
  });
})();

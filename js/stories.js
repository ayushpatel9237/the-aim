/* ═══════════════════════════════════════════════════════════
   THE AIM — STORIES

   The homepage rail: circular covers you tap to open a full-screen
   player, exactly the gesture everyone already knows from Instagram.
   Progress bars along the top, tap right to advance, tap left to go
   back, swipe down to close, "Shop this" at the bottom.

   Why stories rather than a grid of thumbnails: a grid asks the
   customer to choose. A story asks them to watch one thing, then
   hands them the next. For product video that is the difference
   between one view and six.

   Reads from the `video_feed` view. Falls back to whatever
   js/feed.js already rendered if the backend is unreachable, so the
   homepage never ends up with an empty hole where a section was.
═══════════════════════════════════════════════════════════ */
(function(){
  var A = window.Ascentra;
  var mount = document.getElementById('feed');
  if(!mount) return;

  var SEEN_KEY = 'aim_seen_stories';
  var IMG_MS   = 6000;          // how long a poster-only story holds
  var EMBED_MS = 20000;         // Instagram/YouTube: we cannot read duration

  function seen(){ try{ return JSON.parse(localStorage.getItem(SEEN_KEY)) || {}; }catch(e){ return {}; } }
  function markSeen(id){
    try{ var s = seen(); s[id] = Date.now(); localStorage.setItem(SEEN_KEY, JSON.stringify(s)); }catch(e){}
  }
  function money(n){ return '\u20b9' + Number(n||0).toLocaleString('en-IN'); }
  function esc(t){ return String(t==null?'':t).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ── styling ─────────────────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    /* the rail */
    '.st-rail{display:flex;gap:1.1rem;overflow-x:auto;padding:.4rem .2rem 1rem;',
      'scrollbar-width:none;-webkit-overflow-scrolling:touch;}',
    '.st-rail::-webkit-scrollbar{display:none;}',
    '.st-item{flex:0 0 auto;width:86px;background:none;border:none;padding:0;cursor:pointer;',
      'display:flex;flex-direction:column;align-items:center;gap:.55rem;}',
    '.st-ring{width:82px;height:82px;border-radius:50%;padding:2.5px;',
      'background:linear-gradient(140deg,#F0DCC0,#D8C3A0 40%,#A98F6B);',
      'transition:transform .25s cubic-bezier(.34,1.4,.64,1);}',
    '.st-item:hover .st-ring{transform:scale(1.05);}',
    '.st-item.seen .st-ring{background:#2A2F4A;}',
    '.st-cover{width:100%;height:100%;border-radius:50%;overflow:hidden;',
      'border:2.5px solid #050818;background:#0A0F26;display:block;}',
    '.st-cover img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.st-name{font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:.06em;',
      'color:var(--muted,#8E96B8);text-align:center;line-height:1.35;max-width:86px;',
      'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
    '.st-item.seen .st-name{color:var(--faint,#5F678E);}',

    /* the viewer */
    '.st-view{position:fixed;inset:0;z-index:9600;background:#05060F;display:flex;',
      'align-items:center;justify-content:center;opacity:0;transition:opacity .28s ease;}',
    '.st-view.on{opacity:1;}',
    '.st-stage{position:relative;width:min(440px,100vw);height:100%;max-height:100vh;',
      'background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center;',
      'transform:scale(.94);transition:transform .3s cubic-bezier(.2,.8,.3,1);}',
    '.st-view.on .st-stage{transform:none;}',
    '@media(min-width:640px){.st-stage{height:min(92vh,860px);border-radius:18px;}}',
    '.st-stage video,.st-stage iframe{width:100%;height:100%;object-fit:cover;border:0;display:block;background:#000;}',
    '.st-stage .st-poster{width:100%;height:100%;object-fit:cover;display:block;}',

    /* progress bars */
    '.st-bars{position:absolute;top:0;left:0;right:0;z-index:6;display:flex;gap:3px;padding:.7rem .7rem 0;}',
    '.st-bar{flex:1;height:2.5px;border-radius:2px;background:rgba(255,255,255,.28);overflow:hidden;}',
    '.st-bar i{display:block;height:100%;width:0;background:#fff;border-radius:2px;}',
    '.st-bar.done i{width:100%;}',

    /* top row */
    '.st-top{position:absolute;top:1.5rem;left:0;right:0;z-index:6;display:flex;align-items:center;',
      'gap:.7rem;padding:.5rem .9rem;',
      'background:linear-gradient(180deg,rgba(0,0,0,.55),transparent);}',
    '.st-av{width:32px;height:32px;border-radius:50%;overflow:hidden;flex:none;border:1px solid rgba(255,255,255,.4);}',
    '.st-av img{width:100%;height:100%;object-fit:cover;}',
    '.st-who{min-width:0;flex:1;}',
    '.st-who b{display:block;font-size:.8rem;color:#fff;font-weight:500;line-height:1.2;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.st-who span{display:block;font-family:var(--f-mono,monospace);font-size:.55rem;',
      'color:rgba(255,255,255,.62);margin-top:.1rem;}',
    '.st-x{background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;',
      'padding:.2rem .4rem;line-height:1;opacity:.85;}',
    '.st-x:hover{opacity:1;}',

    /* tap zones */
    '.st-tap{position:absolute;top:0;bottom:0;width:32%;z-index:4;background:none;border:none;',
      'cursor:pointer;-webkit-tap-highlight-color:transparent;}',
    '.st-tap.prev{left:0;} .st-tap.next{right:0;width:68%;}',

    /* bottom */
    '.st-foot{position:absolute;left:0;right:0;bottom:0;z-index:6;padding:2.4rem .9rem 1.1rem;',
      'background:linear-gradient(0deg,rgba(0,0,0,.82),transparent);}',
    '.st-cap{color:#fff;font-size:.88rem;line-height:1.45;margin-bottom:.85rem;',
      'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
    '.st-buy{display:flex;align-items:center;gap:.8rem;text-decoration:none;',
      'background:rgba(255,255,255,.12);backdrop-filter:blur(18px) saturate(160%);',
      '-webkit-backdrop-filter:blur(18px) saturate(160%);',
      'border:1px solid rgba(255,255,255,.22);border-radius:14px;padding:.6rem .7rem;',
      'transition:background .25s;}',
    '.st-buy:hover{background:rgba(255,255,255,.2);}',
    '.st-buy .th{width:42px;height:42px;border-radius:9px;overflow:hidden;flex:none;background:#FFF1E2;}',
    '.st-buy .th img{width:100%;height:100%;object-fit:cover;}',
    '.st-buy .nm{flex:1;min-width:0;}',
    '.st-buy .nm b{display:block;color:#fff;font-size:.84rem;font-weight:500;line-height:1.25;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.st-buy .nm span{display:block;font-family:var(--f-mono,monospace);font-size:.7rem;',
      'color:#F0DCC0;margin-top:.15rem;}',
    '.st-buy .go{font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:.14em;',
      'text-transform:uppercase;color:#fff;white-space:nowrap;}',

    /* like */
    '.st-like{position:absolute;right:.9rem;bottom:7.4rem;z-index:6;background:none;border:none;',
      'cursor:pointer;font-size:1.5rem;line-height:1;color:rgba(255,255,255,.9);',
      'transition:transform .2s cubic-bezier(.34,1.6,.64,1);text-shadow:0 2px 12px rgba(0,0,0,.5);}',
    '.st-like:hover{transform:scale(1.12);}',
    '.st-like.on{color:#FF4D6D;transform:scale(1.15);}',
    '.st-like small{display:block;font-family:var(--f-mono,monospace);font-size:.5rem;',
      'color:rgba(255,255,255,.75);margin-top:.15rem;}',

    '@media (prefers-reduced-motion:reduce){',
      '.st-ring,.st-stage,.st-like{transition:none;}',
    '}',
    'body.st-open{overflow:hidden;}'
  ].join('');
  document.head.appendChild(css);

  /* ── device id, so a guest can like without an account ──── */
  function deviceId(){
    try{
      var k = 'aim_device';
      var v = localStorage.getItem(k);
      if(!v){
        v = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,10);
        localStorage.setItem(k, v);
      }
      return v;
    }catch(e){ return 'd0000000000000'; }
  }

  /* ── load ────────────────────────────────────────────────── */
  var STORIES = [];

  function load(){
    if(!A || !A.configured || !A.configured() || !A.raw) return;   // keep feed.js output
    A.raw.from('video_feed').select('*')
      .then(function(res){
        var rows = (res.data || []).filter(function(v){ return v.show_story !== false; });
        if(!rows.length) return;                                    // nothing live yet
        STORIES = rows;
        renderRail();
      })
      .catch(function(){ /* silent — the static feed stays */ });
  }

  /* ── the rail ────────────────────────────────────────────── */
  function renderRail(){
    var s = seen();
    mount.className = 'st-rail';
    mount.innerHTML = STORIES.map(function(v, i){
      var cover = v.poster_url || '';
      return '<button class="st-item'+(s[v.id]?' seen':'')+'" data-i="'+i+'" ' +
             'aria-label="Watch '+esc(v.product_name)+'">' +
               '<span class="st-ring"><span class="st-cover">' +
                 (cover ? '<img src="'+esc(cover)+'" alt="" loading="lazy" />' : '') +
               '</span></span>' +
               '<span class="st-name">'+esc(v.product_name || '')+'</span>' +
             '</button>';
    }).join('');

    mount.querySelectorAll('.st-item').forEach(function(b){
      b.addEventListener('click', function(){ open(+b.dataset.i); });
    });

    /* the arrows around the rail still work */
    var prev = document.getElementById('feedPrev');
    var next = document.getElementById('feedNext');
    if(prev && next){
      var step = function(dir){ mount.scrollBy({ left: dir*300, behavior:'smooth' }); };
      prev.onclick = function(){ step(-1); };
      next.onclick = function(){ step(1); };
    }
  }

  /* ── the viewer ──────────────────────────────────────────── */
  var view = null, idx = 0, timer = null, startY = 0;

  function open(i){
    if(view) return;
    idx = i;
    view = document.createElement('div');
    view.className = 'st-view';
    document.body.appendChild(view);
    document.body.classList.add('st-open');
    /* guard: a fast close before this frame fires would leave view null */
    requestAnimationFrame(function(){ if(view) view.classList.add('on'); });

    document.addEventListener('keydown', onKey);
    view.addEventListener('touchstart', function(e){ startY = e.touches[0].clientY; }, {passive:true});
    view.addEventListener('touchend', function(e){
      var dy = e.changedTouches[0].clientY - startY;
      if(dy > 90) close();                        // swipe down to dismiss
    }, {passive:true});

    show();
  }

  function close(){
    if(!view) return;
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
    view.classList.remove('on');
    var v = view; view = null;
    document.body.classList.remove('st-open');
    setTimeout(function(){ if(v) v.remove(); renderRail(); }, 280);
  }

  function onKey(e){
    if(e.key === 'Escape')     close();
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft')  prev();
  }

  function next(){ if(idx < STORIES.length - 1){ idx++; show(); } else close(); }
  function prev(){ if(idx > 0){ idx--; show(); } }

  function show(){
    if(!view) return;
    clearTimeout(timer);
    var v = STORIES[idx];
    markSeen(v.id);

    /* count the view, but never let it hold anything up */
    try{ if(A && A.raw) A.raw.rpc('bump_video_view', { p_video_id: v.id }).then(function(){}, function(){}); }catch(e){}

    var kind = window.AscentraVideo ? AscentraVideo.kind(v.video_url) : 'file';
    var isFile = kind === 'file';

    var media = !v.video_url
      ? '<img class="st-poster" src="'+esc(v.poster_url||'')+'" alt="" />'
      : isFile
        ? '<video src="'+esc(v.video_url)+'" autoplay playsinline muted ' +
          (v.poster_url ? 'poster="'+esc(v.poster_url)+'" ' : '') + 'id="stVid"></video>'
        : (window.AscentraVideo ? AscentraVideo.embedHTML(v.video_url) : '');

    view.innerHTML =
      '<div class="st-stage">' +
        media +
        '<div class="st-bars">' +
          STORIES.map(function(_, i){
            return '<span class="st-bar'+(i<idx?' done':'')+'"><i'+(i===idx?' id="stFill"':'')+'></i></span>';
          }).join('') +
        '</div>' +
        '<div class="st-top">' +
          '<span class="st-av">' + (v.poster_url ? '<img src="'+esc(v.poster_url)+'" alt="" />' : '') + '</span>' +
          '<span class="st-who"><b>'+esc(v.curator_name || 'THE AIM')+'</b>' +
            '<span>'+(v.views ? v.views + ' views' : 'New')+'</span></span>' +
          '<button class="st-x" aria-label="Close">\u2715</button>' +
        '</div>' +
        '<button class="st-tap prev" aria-label="Previous"></button>' +
        '<button class="st-tap next" aria-label="Next"></button>' +
        '<button class="st-like" id="stLike" aria-label="Like">\u2661<small>'+(v.likes||0)+'</small></button>' +
        '<div class="st-foot">' +
          (v.caption ? '<div class="st-cap">'+esc(v.caption)+'</div>' : '') +
          '<a class="st-buy" href="product.html?id='+encodeURIComponent(v.product_id)+'">' +
            '<span class="th">'+(v.poster_url?'<img src="'+esc(v.poster_url)+'" alt="" />':'')+'</span>' +
            '<span class="nm"><b>'+esc(v.product_name||'')+'</b>' +
              '<span>'+money(v.product_price)+'</span></span>' +
            '<span class="go">Shop this \u2192</span>' +
          '</a>' +
        '</div>' +
      '</div>';

    view.querySelector('.st-x').addEventListener('click', close);
    view.querySelector('.st-tap.prev').addEventListener('click', prev);
    view.querySelector('.st-tap.next').addEventListener('click', next);
    view.querySelector('#stLike').addEventListener('click', function(e){
      e.stopPropagation(); like(v, this);
    });

    /* progress + auto-advance */
    var fill = view.querySelector('#stFill');
    var vid  = view.querySelector('#stVid');

    if(vid){
      vid.addEventListener('timeupdate', function(){
        if(vid.duration) fill.style.width = (vid.currentTime / vid.duration * 100) + '%';
      });
      vid.addEventListener('ended', next);
      vid.play().catch(function(){ /* autoplay blocked — the customer can tap */ });
    } else {
      var ms = v.video_url ? EMBED_MS : IMG_MS;
      var t0 = Date.now();
      (function tick(){
        if(!view) return;
        var pct = Math.min(100, (Date.now() - t0) / ms * 100);
        if(fill) fill.style.width = pct + '%';
        if(pct >= 100) return next();
        timer = setTimeout(tick, 60);
      })();
    }
  }

  /* ── likes ───────────────────────────────────────────────── */
  function like(v, btn){
    if(!A || !A.raw) return;
    var on = btn.classList.toggle('on');
    var small = btn.querySelector('small');
    var n = Number(small.textContent||0) + (on ? 1 : -1);
    small.textContent = Math.max(0, n);
    btn.firstChild.nodeValue = on ? '\u2665' : '\u2661';
    v.likes = Math.max(0, n);

    var row = { video_id: v.id, voter: deviceId() };
    if(on) A.raw.from('video_likes').insert(row).then(function(){}, function(){});
    else   A.raw.from('video_likes').delete().eq('video_id', v.id).eq('voter', row.voter).then(function(){}, function(){});
  }

  load();
})();

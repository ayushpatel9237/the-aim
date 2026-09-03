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

  /* The poster is the video's cover frame, which often is not a clean
     shot of the product. products-data.js is already loaded on this
     page, so take the real product photo from there when we can. */
  /* Stock for the ring. products-data.js is on the page and
     live-products.js has already merged the database values into it,
     so this is the real number, not a guess. */
  function stockOf(id){
    try{
      if(typeof PRODUCTS !== 'undefined'){
        var p = PRODUCTS.filter(function(x){ return x.id === id; })[0];
        if(p && p.stock != null){
          var left = Number(p.stock);
          var full = Math.max(10, left);           // 10 is a full ring
          return { left: left, pct: Math.max(6, Math.min(100, left / full * 100)) };
        }
      }
    }catch(e){}
    return { left: null, pct: 100 };
  }

  function productThumb(id, fallback){
    try{
      if(typeof PRODUCTS !== 'undefined'){
        var p = PRODUCTS.filter(function(x){ return x.id === id; })[0];
        if(p) return p.thumb || p.hero || (p.gallery && p.gallery[0]) || fallback || '';
      }
    }catch(e){}
    return fallback || '';
  }
  function esc(t){ return String(t==null?'':t).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* A filename with a space — "Docking Station Stand.MP4" — must be
     percent-encoded before it goes in a src, or the browser requests a
     path that does not exist and you get a black screen. Encode each
     path segment, never the slashes, and leave full URLs alone since
     those are already encoded. */
  function safeUrl(u){
    if(!u) return '';
    if(/^https?:\/\//i.test(u) || /^data:/i.test(u)) return u;
    return u.split('/').map(function(part){
      try{ return encodeURIComponent(decodeURIComponent(part)); }
      catch(e){ return encodeURIComponent(part); }
    }).join('/');
  }

  /* ── styling ─────────────────────────────────────────────── */
  /* ── rail styles: these live in the page ── */
  var css = document.createElement('style');
  css.textContent = [
    /* the rail */
    '.st-rail{display:flex;gap:1.1rem;overflow-x:auto;padding:.4rem .2rem 1rem;',
      'scrollbar-width:none;-webkit-overflow-scrolling:touch;}',
    '.st-rail::-webkit-scrollbar{display:none;}',
    '.st-item{flex:0 0 auto;width:86px;background:none;border:none;padding:0;cursor:pointer;',
      'display:flex;flex-direction:column;align-items:center;gap:.55rem;}',
    /* The ring is not decoration. It depletes as stock sells, so the
       circle itself tells you how much is left — real scarcity from
       your own inventory, not a fake countdown. Only possible because
       we own the whole stack. */
    '.st-ring{width:82px;height:82px;border-radius:50%;padding:2.5px;position:relative;',
      'background:conic-gradient(#F0DCC0 var(--stock,100%), rgba(255,255,255,.10) 0);',
      'transition:transform .25s cubic-bezier(.34,1.4,.64,1);}',
    '.st-item:hover .st-ring{transform:scale(1.06);}',
    '.st-item.low .st-ring{background:conic-gradient(#E08A7A var(--stock,20%), rgba(255,255,255,.10) 0);}',
    '.st-badge{position:absolute;inset:auto 0 -2px 0;margin:0 auto;width:max-content;',
      'font-family:var(--f-mono,monospace);font-size:.44rem;letter-spacing:.1em;',
      'text-transform:uppercase;padding:.16em .5em;border-radius:999px;',
      'background:#050818;border:1px solid rgba(230,203,168,.5);color:#F0DCC0;}',
    '.st-item.low .st-badge{border-color:rgba(224,138,122,.6);color:#E08A7A;}',
    '.st-item.seen .st-ring{background:#2A2F4A;}',
    '.st-cover{width:100%;height:100%;border-radius:50%;overflow:hidden;',
      'border:2.5px solid #050818;background:#0A0F26;display:block;}',
    '.st-cover img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.st-name{font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:.06em;',
      'color:var(--muted,#8E96B8);text-align:center;line-height:1.35;max-width:86px;',
      'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
    '.st-item.seen .st-name{color:var(--faint,#5F678E);}',
    'body.st-open{overflow:hidden;}'
  ].join('');
  document.head.appendChild(css);

  /* ── viewer styles: these live inside a shadow root ──
     Twice a stylesheet elsewhere in the site reached into this overlay
     and drew shapes I never asked for. A shadow root ends that
     argument: page CSS cannot cross into it, so the viewer renders
     identically whatever the rest of the site does. */
  var VIEW_CSS = [
    ':host{all:initial;}',
    '*{box-sizing:border-box;margin:0;padding:0;font-family:'
      + '"Space Grotesk",system-ui,-apple-system,sans-serif;}',
    'button{font:inherit;cursor:pointer;background:none;border:none;color:inherit;}',
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
    /* explicit sizing and radius: a page stylesheet applying a radius to
       spans was turning these thin bars into large ovals */
    '.st-bars{position:absolute;top:0;left:0;right:0;z-index:7;display:flex;gap:4px;',
      'padding:.85rem .85rem 0;height:auto;}',
    '.st-bar{flex:1 1 0;height:3px!important;min-height:3px;max-height:3px;',
      'border-radius:3px!important;background:rgba(255,255,255,.22)!important;overflow:hidden;',
      'display:block!important;padding:0!important;margin:0!important;border:none!important;}',
    '.st-bar i{display:block!important;height:100%;width:0;background:#F0DCC0!important;',
      'border-radius:3px!important;padding:0!important;margin:0!important;}',
    '.st-bar.done i{background:rgba(240,220,192,.55)!important;}',
    '.st-bar.done i{width:100%;}',

    /* top row */
    '.st-top{position:absolute;top:1.7rem;left:0;right:0;z-index:6;display:flex;align-items:center;',
      'gap:.7rem;padding:.55rem .9rem 1.2rem;',
      'background-image:linear-gradient(180deg,rgba(0,0,0,.55),transparent)!important;}',
    '.st-who{min-width:0;flex:1;}',
    '.st-who b{display:block;font-family:Fraunces,Georgia,serif;font-size:.82rem;color:#fff;',
      'font-weight:400;letter-spacing:.22em;text-transform:uppercase;line-height:1.2;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.st-who span{display:block;font-family:var(--f-mono,monospace);font-size:.5rem;',
      'letter-spacing:.16em;text-transform:uppercase;color:rgba(240,220,192,.6);margin-top:.22rem;}',
    '.st-who span b{display:inline;font-family:var(--f-mono,monospace);font-size:inherit;',
      'letter-spacing:inherit;color:rgba(255,255,255,.85);}',
    '.st-x{background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;',
      'padding:.2rem .4rem;line-height:1;opacity:.85;}',
    '.st-x:hover{opacity:1;}',

    /* tap zones */
    '.st-tap{position:absolute;top:0;bottom:0;width:32%;z-index:4;background:none;border:none;',
      'cursor:pointer;-webkit-tap-highlight-color:transparent;}',
    '.st-tap.prev{left:0;} .st-tap.next{right:0;width:68%;}',

    /* bottom */
    '.st-foot{position:absolute;left:0;right:0;bottom:0;z-index:6;padding:2.4rem .9rem 1.1rem;',
      'background-image:linear-gradient(0deg,rgba(0,0,0,.85),transparent)!important;}',
    '.st-cap{color:#fff;font-size:1rem;line-height:1.4;margin-bottom:.85rem;',
      'font-family:Fraunces,Georgia,serif;font-weight:300;letter-spacing:-.01em;',
      'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
    '.st-buy{display:flex;width:100%;text-align:left;align-items:center;gap:.8rem;text-decoration:none;',
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
      'color:#F0DCC0;margin-top:.25rem;padding-top:.25rem;',
      /* the same gold rule that sits above prices on the product page,
         so the two surfaces read as one shop rather than two designs */
      'border-top:1px solid rgba(230,203,168,.28);display:inline-block;}',
    '.st-buy .go{font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:.14em;',
      'text-transform:uppercase;color:#fff;white-space:nowrap;}',

    /* playback controls — only for real video files, since we cannot
       scrub an Instagram or YouTube embed */
    /* One button, centred, the shape everyone recognises from a player.
       It fades away while the video runs and returns on tap or pause,
       so nothing sits on top of the product for longer than it needs to. */
    '.st-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(.9);',
      'z-index:7;width:72px;height:72px;border-radius:50%;border:none;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;',
      'background:rgba(240,220,192,.86)!important;color:#050818;',
      'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      'box-shadow:0 12px 40px -10px rgba(0,0,0,.65)!important;',
      'opacity:0;pointer-events:none;',
      'transition:opacity .3s ease,transform .3s cubic-bezier(.34,1.5,.64,1);}',
    '.st-play.show{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1);}',
    '.st-play:hover{background:#F0DCC0!important;}',
    '.st-play svg{width:26px;height:26px;display:block;margin-left:2px;}',
    '.st-play.playing svg{margin-left:0;}',

    '.st-low{display:inline-block;font-family:var(--f-mono,monospace);font-size:.5rem;',
      'letter-spacing:.18em;text-transform:uppercase;color:#E08A7A;',
      'border:1px solid rgba(224,138,122,.45);border-radius:999px;',
      'padding:.25em .7em;margin-bottom:.7rem;}',

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
    '}'
  ].join('');

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
      var st    = stockOf(v.product_id);
      var pct   = st.pct;
      var low   = st.left != null && st.left > 0 && st.left <= 3;
      return '<button class="st-item'+(s[v.id]?' seen':'')+(low?' low':'')+'" data-i="'+i+'" ' +
             'style="--stock:'+pct+'%" ' +
             'aria-label="Watch '+esc(v.product_name)+'">' +
               '<span class="st-ring"><span class="st-cover">' +
                 (cover ? '<img src="'+esc(safeUrl(cover))+'" alt="" loading="lazy" />' : '') +
               '</span>' +
               (low ? '<span class="st-badge">'+st.left+' left</span>' : '') +
               '</span>' +
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
  var view = null, host = null, shadow = null, idx = 0, timer = null;
  var startX = 0, startY = 0, startT = 0, held = false, holdTimer = null;

  function open(i){
    if(view) return;
    idx = i;
    /* host stays in the page; everything visible lives in the shadow
       root, out of reach of the site's stylesheets */
    host = document.createElement('div');
    host.setAttribute('data-aim-stories', '');
    host.style.cssText = 'position:fixed;inset:0;z-index:9600;';
    shadow = host.attachShadow ? host.attachShadow({ mode:'open' }) : null;

    if(shadow){
      var st = document.createElement('style');
      st.textContent = VIEW_CSS;
      shadow.appendChild(st);
      view = document.createElement('div');
      view.className = 'st-view';
      shadow.appendChild(view);
    } else {
      /* very old browser: fall back to the page, styles and all */
      var st2 = document.createElement('style');
      st2.textContent = VIEW_CSS;
      document.head.appendChild(st2);
      view = document.createElement('div');
      view.className = 'st-view';
      host.appendChild(view);
    }
    document.body.appendChild(host);
    document.body.classList.add('st-open');
    /* guard: a fast close before this frame fires would leave view null */
    requestAnimationFrame(function(){ if(view) view.classList.add('on'); });

    document.addEventListener('keydown', onKey);

    /* Gestures, the ones people already expect from a story:
         swipe left/right  → next / previous
         swipe down        → close
         press and hold    → pause, so you can actually read the screen */
    view.addEventListener('touchstart', function(e){
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startT = Date.now();
      held = false;
      holdTimer = setTimeout(function(){ held = true; pause(true); }, 260);
    }, {passive:true});

    view.addEventListener('touchmove', function(e){
      /* a real drag is not a hold */
      var dx = Math.abs(e.touches[0].clientX - startX);
      var dy = Math.abs(e.touches[0].clientY - startY);
      if(dx > 12 || dy > 12) clearTimeout(holdTimer);
    }, {passive:true});

    view.addEventListener('touchend', function(e){
      clearTimeout(holdTimer);
      if(held){ held = false; pause(false); return; }   // it was a hold, not a swipe

      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      var quick = Date.now() - startT < 600;

      if(dy > 90 && Math.abs(dy) > Math.abs(dx)) return close();          // down
      if(quick && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)){
        return dx < 0 ? next() : prev();                                  // left / right
      }
    }, {passive:true});

    show();
  }

  function close(){
    if(!view) return;
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
    view.classList.remove('on');
    var h = host; view = null; host = null; shadow = null;
    document.body.classList.remove('st-open');
    setTimeout(function(){ if(h) h.remove(); renderRail(); }, 280);
  }

  /* after a hold, the browser still fires a click — swallow it so the
     story does not jump forward the moment you let go */
  function swallowIfHeld(e){ if(held){ e.stopPropagation(); e.preventDefault(); } }

  function onKey(e){
    if(e.key === 'Escape')     close();
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft')  prev();
  }

  /* pause both kinds of story: a real <video>, and the timer that
     drives poster-only and embedded ones */
  var paused = false, pausedAt = 0;
  function pause(on){
    if(!view) return;
    paused = on;
    var vid = view.querySelector('#stVid');
    if(vid){ on ? vid.pause() : vid.play().catch(function(){}); }
    if(on){ clearTimeout(timer); pausedAt = Date.now(); }
    var stage = view.querySelector('.st-stage');
    if(stage) stage.style.opacity = on ? '.82' : '1';
  }

  function next(){ if(idx < STORIES.length - 1){ idx++; show(); } else close(); }
  function prev(){ if(idx > 0){ idx--; show(); } }

  function show(){
    if(!view) return;
    clearTimeout(timer);
    paused = false;
    var v = STORIES[idx];
    markSeen(v.id);

    /* count the view, but never let it hold anything up */
    try{ if(A && A.raw) A.raw.rpc('bump_video_view', { p_video_id: v.id }).then(function(){}, function(){}); }catch(e){}

    var kind = window.AscentraVideo ? AscentraVideo.kind(v.video_url) : 'file';
    var isFile = kind === 'file';

    var media = !v.video_url
      ? '<img class="st-poster" src="'+esc(safeUrl(v.poster_url||''))+'" alt="" />'
      : isFile
        ? '<video src="'+esc(safeUrl(v.video_url))+'" autoplay playsinline muted ' +
          (v.poster_url ? 'poster="'+esc(safeUrl(v.poster_url))+'" ' : '') + 'id="stVid"></video>'
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
          '<span class="st-who"><b>'+esc(v.curator_name || 'THE AIM')+'</b>' +
            '<span>' + (idx+1) + ' / ' + STORIES.length +
              (v.views > 2 ? ' \u00b7 <b>'+v.views+'</b> watched' : ' \u00b7 New') +
            '</span></span>' +
          '<button class="st-x" aria-label="Close">\u2715</button>' +
        '</div>' +
        '<button class="st-tap prev" aria-label="Previous"></button>' +
        '<button class="st-tap next" aria-label="Next"></button>' +
        (isFile
          ? '<button class="st-play" id="stPlay" aria-label="Play or pause"></button>'
          : '') +
        '<button class="st-like" id="stLike" aria-label="Like">\u2661<small>'+(v.likes||0)+'</small></button>' +
        '<div class="st-foot">' +
          (function(){
            var st = stockOf(v.product_id);
            if(st.left != null && st.left > 0 && st.left <= 3)
              return '<div class="st-low">Only '+st.left+' left</div>';
            return '';
          })() +
          (v.caption ? '<div class="st-cap">'+esc(v.caption)+'</div>' : '') +
          '<button class="st-buy" type="button" data-go="product.html?id='+encodeURIComponent(v.product_id)+'">' +
            (function(){
              var th = productThumb(v.product_id, v.poster_url);
              return '<span class="th">' + (th ? '<img src="'+esc(safeUrl(th))+'" alt="" />' : '') + '</span>';
            })() +
            '<span class="nm"><b>'+esc(v.product_name||'')+'</b>' +
              '<span>'+money(v.product_price)+'</span></span>' +
            '<span class="go">Shop this \u2192</span>' +
          '</button>' +
        '</div>' +
      '</div>';

    view.querySelector('.st-x').addEventListener('click', close);

    /* Close the viewer, then navigate. It is a button rather than a
       link on purpose: transitions.js intercepts link clicks to run its
       page animation, which left this overlay sitting on top of the
       product page. Nothing intercepts a button. */
    var buy = view.querySelector('.st-buy');
    if(buy) buy.addEventListener('click', function(e){
      e.stopPropagation();
      var to = buy.getAttribute('data-go');
      close();
      /* sheet.js watches for clicks on product.html links and opens the
         quick-view popup — the same one the shop grid uses. Firing a
         real link after the story has closed gets that popup, so both
         routes into a product look identical. If sheet.js is not on the
         page the click just navigates, which is the right fallback. */
      setTimeout(function(){
        var a = document.createElement('a');
        a.href = to;
        a.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(a);
        a.click();
        setTimeout(function(){ a.remove(); }, 50);
      }, 220);
    });
    view.querySelector('.st-tap.prev').addEventListener('click', prev);
    view.querySelector('.st-tap.next').addEventListener('click', next);

    /* desktop equivalent of press-and-hold */
    ['.st-tap.prev','.st-tap.next'].forEach(function(sel){
      var z = view.querySelector(sel);
      z.addEventListener('mousedown', function(){ holdTimer = setTimeout(function(){ held = true; pause(true); }, 260); });
      z.addEventListener('mouseup',   function(){ clearTimeout(holdTimer); if(held){ held = false; pause(false); } });
      z.addEventListener('mouseleave',function(){ clearTimeout(holdTimer); if(held){ held = false; pause(false); } });
    });
    view.querySelector('#stLike').addEventListener('click', function(e){
      e.stopPropagation(); like(v, this);
    });

    /* progress + auto-advance */
    var fill = view.querySelector('#stFill');
    var vid  = view.querySelector('#stVid');

    if(vid){
      var play = view.querySelector('#stPlay');
      var PLAY_ICON  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      var PAUSE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';

      function setIcon(playing){
        if(!play) return;
        play.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
        play.classList.toggle('playing', playing);
      }
      function flash(ms){
        if(!play) return;
        play.classList.add('show');
        clearTimeout(play._h);
        if(ms) play._h = setTimeout(function(){
          if(!vid.paused) play.classList.remove('show');
        }, ms);
      }
      setIcon(true);

      vid.addEventListener('timeupdate', function(){
        if(vid.duration) fill.style.width = (vid.currentTime / vid.duration * 100) + '%';
      });
      vid.addEventListener('ended', next);

      if(play) play.addEventListener('click', function(e){
        e.stopPropagation();                   // never advance the story
        if(vid.paused){ vid.play().catch(function(){}); setIcon(true);  paused = false; flash(900); }
        else          { vid.pause();                    setIcon(false); paused = true;  flash(0);   }
      });

      /* tapping the video brings the button back for a moment */
      var stage = view.querySelector('.st-stage');
      if(stage) stage.addEventListener('click', function(){ flash(1600); });

      vid.play().catch(function(){
        /* autoplay blocked — leave the button showing so there is a way in */
        setIcon(false); paused = true; flash(0);
      });
    } else {
      var ms = v.video_url ? EMBED_MS : IMG_MS;
      var t0 = Date.now(), elapsed = 0;
      (function tick(){
        if(!view) return;
        if(paused){ timer = setTimeout(tick, 120); return; }   // held: hold the bar too
        elapsed += 60;
        var pct = Math.min(100, elapsed / ms * 100);
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

/* ════════════════════════════════════════════════════════════════
   THE AIM — SCROLL-DRIVEN DEPTH-OF-FIELD REVEAL  v3
   ─────────────────────────────────────────────────────────────
   HOW IT WORKS:
   The viewport is split into 3 vertical zones:
     • CLEAR ZONE  (big centre area) → everything crystal sharp
     • SOFT ZONE   (gentle gradient)  → light blur fading in
     • EDGE ZONE   (extreme top/btm)  → full blur, faded out

   Elements smoothly transition between zones as you scroll,
   like a camera pulling focus. Content you're reading is
   ALWAYS sharp — blur only touches stuff leaving the screen.

   Separate tuning for mobile (bigger clear zone, less blur,
   no transform effects to avoid momentum-scroll jank).
   ════════════════════════════════════════════════════════════════ */
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. DEPTH-OF-FIELD ENGINE ── */
  if(!reduceMotion){

    var isMobile = window.innerWidth < 768;

    /* ─── Tuning: Desktop vs Mobile ─── */
    var CFG = isMobile ? {
      clearZone : 0.65,   /* 65% of viewport is crystal sharp */
      softZone  : 0.16,   /* gentle blur only at extreme edges */
      maxBlur   : 3.5     /* subtle natural optical blur */
    } : {
      clearZone : 0.55,   /* 55% of viewport is crystal sharp */
      softZone  : 0.20,   /* gentle gradient on edges */
      maxBlur   : 4.5     /* subtle natural optical blur */
    };

    var items = [];
    var tracked = new WeakSet();
    var vh = window.innerHeight;
    var raf = 0;

    window.addEventListener('resize', function(){
      vh = window.innerHeight;
      isMobile = window.innerWidth < 768;
    }, {passive:true});

    /* Only target leaf-level visual cards for depth-of-field */
    var SEL = '.pcase, .shelf-card';

    function collect(){
      var els = document.querySelectorAll(SEL);
      for(var i = 0; i < els.length; i++){
        var el = els[i];
        if(tracked.has(el)) continue;
        tracked.add(el);
        el.classList.add('dof-item');
        el._entered = false;
        items.push(el);
      }
    }

    /* Core: compute how far an element is from the clear zone
       Returns 0 (sharp) to 1 (fully blurred) */
    function depth(rect){
      var mid = rect.top + rect.height * 0.5;
      var clearHalf = vh * CFG.clearZone * 0.5;
      var clearTop  = vh * 0.5 - clearHalf;
      var clearBtm  = vh * 0.5 + clearHalf;
      var softPx    = vh * CFG.softZone;

      if(mid >= clearTop && mid <= clearBtm) return 0; /* inside clear zone */
      var dist = mid < clearTop ? (clearTop - mid) : (mid - clearBtm);
      return Math.min(1, dist / softPx);
    }

    /* 2-tier eased curve: soft inner blur → hard outer blur
       Uses smoothstep for a natural gradient that doesn't jump */
    function ease(t){
      /* smoothstep: 3t² - 2t³ */
      return t * t * (3 - 2 * t);
    }

    function tick(){
      for(var i = 0; i < items.length; i++){
        var el = items[i];
        var rect = el.getBoundingClientRect();

        /* Skip far off-screen elements */
        if(rect.bottom < -50 || rect.top > vh + 50){
          if(el._entered){
            el.style.setProperty('--dof-blur', CFG.maxBlur + 'px');
          }
          continue;
        }

        var d = depth(rect);
        var e = ease(d);

        /* Set ONLY optical focal blur - NO opacity, NO transform shifts */
        el.style.setProperty('--dof-blur', (e * CFG.maxBlur).toFixed(1) + 'px');

        /* First-time entrance: slower smooth transition */
        if(!el._entered && d < 0.5){
          el._entered = true;
          el.classList.add('dof-enter');
          (function(target){
            setTimeout(function(){ target.classList.remove('dof-enter'); }, 700);
          })(el);
        }
      }
      raf = 0;
    }

    function requestTick(){
      if(!raf) raf = requestAnimationFrame(tick);
    }

    function init(){
      collect();
      tick(); /* immediate first paint */
      window.addEventListener('scroll', requestTick, {passive:true});

      /* Editorial Text Reveal Observer */
      if('IntersectionObserver' in window){
        var textObs = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting){
              entry.target.classList.add('in');
              textObs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -25px 0px' });

        var textTargets = document.querySelectorAll('.sec-head, .feed-head, .cur-head, .text-reveal, .proof-item, .hero-sub');
        textTargets.forEach(function(el){ textObs.observe(el); });
      }

      /* MutationObserver for dynamically rendered cards */
      if('MutationObserver' in window){
        var mo = new MutationObserver(function(){
          collect();
          requestTick();
        });
        var watchList = document.querySelectorAll('#arrivals, #productGrid, .shelf, .grid, .feed-rail');
        for(var i = 0; i < watchList.length; i++){
          mo.observe(watchList[i], {childList:true});
        }
      }

      /* Hook into renderSelection (index.html category filters) */
      if(typeof window.renderSelection === 'function'){
        var orig = window.renderSelection;
        window.renderSelection = function(){
          var r = orig.apply(this, arguments);
          setTimeout(function(){ collect(); requestTick(); }, 25);
          return r;
        };
      }
    }

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

    /* ── 2. 3D POINTER TILT (desktop only, ONLY on legacy media wells without cube.js) ── */
    if(!isMobile && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      document.addEventListener('pointermove', function(ev){
        var card = ev.target.closest('.pcase');
        if(!card) return;
        var pimg = card.querySelector('.pimg');
        if(!pimg || pimg.classList.contains('aim-cube')) return;
        var r = pimg.getBoundingClientRect();
        var rx = ((ev.clientY - r.top - r.height*0.5) / (r.height*0.5) * -4).toFixed(2);
        var ry = ((ev.clientX - r.left - r.width*0.5) / (r.width*0.5) * 4).toFixed(2);
        pimg.style.transform = 'perspective(1000px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-10px) scale(1.025)';
      });
      document.addEventListener('pointerout', function(ev){
        var card = ev.target.closest('.pcase');
        if(card){
          var pimg = card.querySelector('.pimg');
          if(pimg && !pimg.classList.contains('aim-cube')) pimg.style.transform = '';
        }
      });
    }
  }

  /* ── 3. GOLD DUST MOTES ── */
  if(!reduceMotion){
    var c = document.createElement('canvas');
    c.setAttribute('aria-hidden','true');
    c.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;mix-blend-mode:screen;';
    if(document.body) document.body.prepend(c);
    var ctx = c.getContext('2d'), W, H;
    function size(){ W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
    size(); window.addEventListener('resize', size);

    var N = window.innerWidth < 700 ? 14 : 32, P = [];
    for(var i = 0; i < N; i++) P.push({
      x: Math.random(), y: Math.random(),
      r: Math.random()*1.3 + .4,
      s: Math.random()*.00032 + .00012,
      w: Math.random()*.0004 - .0002,
      ph: Math.random()*6.28,
      a: Math.random()*.45 + .2
    });
    function draw(t){
      ctx.clearRect(0,0,W,H);
      for(var i = 0; i < P.length; i++){
        var p = P[i];
        p.y -= p.s; p.x += p.w * Math.sin(t*.0004 + p.ph);
        if(p.y < -.02){ p.y = 1.02; p.x = Math.random(); }
        var tw = .5 + .5 * Math.sin(t*.0012 + p.ph);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(231,200,120,' + (p.a * tw * .8).toFixed(3) + ')';
        ctx.arc(p.x*W, p.y*H, p.r, 0, 6.283);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    /* ── 4. CURSOR EMBER (desktop) ── */
    if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      var g = document.createElement('div');
      g.setAttribute('aria-hidden','true');
      g.style.cssText =
        'position:fixed;width:540px;height:540px;border-radius:50%;pointer-events:none;' +
        'z-index:1;mix-blend-mode:screen;transform:translate(-50%,-50%);opacity:0;' +
        'transition:opacity .6s ease;left:50%;top:40%;' +
        'background:radial-gradient(circle, rgba(201,161,95,.09), rgba(201,161,95,.035) 42%, transparent 70%);';
      if(document.body) document.body.appendChild(g);
      var x = W/2, y = H/2, tx = x, ty = y;
      window.addEventListener('pointermove', function(e){
        tx = e.clientX; ty = e.clientY; g.style.opacity = 1;
      }, {passive:true});
      (function follow(){
        x += (tx-x)*.08; y += (ty-y)*.08;
        g.style.left = x+'px'; g.style.top = y+'px';
        requestAnimationFrame(follow);
      })();
    }
  }
})();


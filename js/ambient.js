/* ════════════════════════════════════════════════════════════════
   THE AIM — SCROLL-DRIVEN DEPTH-OF-FIELD REVEAL
   Each element starts blurred at the viewport edges and smoothly
   sharpens into crystal focus as it scrolls toward the center.
   Like a camera pull-focus / Apple launch reveal.
   + Gold dust motes + cursor ember (unchanged)
   ════════════════════════════════════════════════════════════════ */
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. CONTINUOUS SCROLL-DRIVEN DEPTH-OF-FIELD ── */
  if(!reduceMotion){

    /* Tuning knobs */
    var MAX_BLUR    = 7;     /* px – blur when fully at the edge */
    var MIN_OPACITY = 0.35;  /* opacity when fully at the edge */
    var MAX_LIFT    = 18;    /* px – vertical offset at the edge */
    var MIN_SCALE   = 0.96;  /* scale when fully at the edge */
    var SWEET_ZONE  = 0.35;  /* fraction of viewport height that is the "sharp" zone (center) */
    var FADE_ZONE   = 0.30;  /* fraction of viewport height of the gradient on each side */

    var dofItems = [];
    var seen = new WeakSet();
    var vh = window.innerHeight;
    var ticking = false;

    window.addEventListener('resize', function(){ vh = window.innerHeight; }, {passive:true});

    /* Collect all elements that should participate in depth-of-field */
    function collectDofItems(){
      var selectors = '.pcase, .shelf-card, .reveal, .sec-head, .hero, .stage, .proof-strip, .footer-wrap, section, .foot';
      var els = document.querySelectorAll(selectors);
      els.forEach(function(el){
        if(!seen.has(el)){
          seen.add(el);
          el.classList.add('dof-item');
          /* Mark as needing first-entrance spring animation */
          el._dofFirstSeen = false;
          dofItems.push(el);
        }
      });
    }

    /* The core depth-of-field calculation:
       Returns 0 (fully sharp, center) to 1 (fully blurred, edge) */
    function calcDepth(el){
      var rect = el.getBoundingClientRect();
      /* Use the vertical center of the element */
      var elCenter = rect.top + rect.height * 0.5;

      /* Viewport zones (from top):
         [0 .. fadeEnd]           = fade zone (blur → sharp)
         [fadeEnd .. sweetEnd]    = sweet zone (fully sharp)
         [sweetEnd .. sweetEnd+fadeZone] = fade zone (sharp → blur)
         [beyond]                = fully blurred                    */
      var sweetStart = vh * (0.5 - SWEET_ZONE * 0.5);
      var sweetEnd   = vh * (0.5 + SWEET_ZONE * 0.5);
      var fadeSize   = vh * FADE_ZONE;

      var depth;
      if(elCenter >= sweetStart && elCenter <= sweetEnd){
        /* Inside the sweet zone: crystal clear */
        depth = 0;
      } else if(elCenter < sweetStart){
        /* Above sweet zone: fading out toward top */
        depth = Math.min(1, (sweetStart - elCenter) / fadeSize);
      } else {
        /* Below sweet zone: fading out toward bottom */
        depth = Math.min(1, (elCenter - sweetEnd) / fadeSize);
      }
      return depth;
    }

    /* Apply depth-of-field CSS custom properties per element */
    function applyDof(){
      for(var i = 0; i < dofItems.length; i++){
        var el = dofItems[i];
        var rect = el.getBoundingClientRect();

        /* Skip elements completely off-screen (above or below) */
        if(rect.bottom < -100 || rect.top > vh + 100) continue;

        var d = calcDepth(el);

        /* Smooth easing curve for more natural feel */
        var eased = d * d; /* quadratic easing: slow start, faster at edges */

        var blur  = (eased * MAX_BLUR).toFixed(1);
        var opa   = (1 - eased * (1 - MIN_OPACITY)).toFixed(3);
        var lift  = (eased * MAX_LIFT).toFixed(1);
        var scale = (1 - eased * (1 - MIN_SCALE)).toFixed(4);

        el.style.setProperty('--dof-blur', blur + 'px');
        el.style.setProperty('--dof-opa', opa);
        el.style.setProperty('--dof-y', lift + 'px');
        el.style.setProperty('--dof-scale', scale);

        /* First-time entrance: use the slower spring transition */
        if(!el._dofFirstSeen && d < 0.6){
          el._dofFirstSeen = true;
          el.classList.add('dof-entrance');
          setTimeout(function(target){
            return function(){ target.classList.remove('dof-entrance'); };
          }(el), 800);
        }
      }
      ticking = false;
    }

    function onScroll(){
      if(!ticking){
        requestAnimationFrame(applyDof);
        ticking = true;
      }
    }

    function init(){
      collectDofItems();
      applyDof(); /* apply immediately on load */
      window.addEventListener('scroll', onScroll, {passive:true});

      /* MutationObserver: auto-collect new cards from dynamic rendering */
      try {
        var mo = new MutationObserver(function(){
          collectDofItems();
          onScroll();
        });
        var containers = document.querySelectorAll('#arrivals, #productGrid, .shelf, .grid, .feed-rail');
        containers.forEach(function(c){
          mo.observe(c, { childList: true });
        });
      } catch(e){}

      /* Also hook into renderSelection if it exists (index.html category filters) */
      var origRender = window.renderSelection;
      if(typeof origRender === 'function'){
        window.renderSelection = function(){
          var res = origRender.apply(this, arguments);
          setTimeout(function(){ collectDofItems(); onScroll(); }, 30);
          return res;
        };
      }
    }

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

    /* ── 2. INTERACTIVE 3D POINTER TILT (DESKTOP) ── */
    if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      document.addEventListener('pointermove', function(e){
        var card = e.target.closest('.pcase');
        if(!card) return;
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width * 0.5;
        var cy = rect.height * 0.5;
        var rx = ((y - cy) / cy * -4).toFixed(2);
        var ry = ((x - cx) / cx * 4).toFixed(2);
        card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-5px) scale(1.02)';
      });
      document.addEventListener('pointerout', function(e){
        var card = e.target.closest('.pcase');
        if(card) card.style.transform = '';
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

    /* ── 4. CURSOR EMBER (DESKTOP) ── */
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

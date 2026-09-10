/* ════════════════════════════════════════════════════════════════
   THE AIM — AMBIENT LIFE & APPLE 3D SCROLL DEPTH SYSTEM
   - Dynamic top & bottom edge blur vignettes (folding screen depth)
   - 3D spring bounce & depth-of-field reveal on scroll
   - Inertial scroll physics & interactive 3D pointer tilt
   - Gold dust motes + warm cursor ember
   ════════════════════════════════════════════════════════════════ */
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. DYNAMIC APPLE TOP & BOTTOM EDGE BLUR VIGNETTES ── */
  function injectEdgeBlurs(){
    if(!document.body) return;
    if(!document.querySelector('.ios-edge-blur-top')){
      var topBlur = document.createElement('div');
      topBlur.className = 'ios-edge-blur-top';
      topBlur.setAttribute('aria-hidden', 'true');
      document.body.appendChild(topBlur);
    }
    if(!document.querySelector('.ios-edge-blur-bottom')){
      var btmBlur = document.createElement('div');
      btmBlur.className = 'ios-edge-blur-bottom';
      btmBlur.setAttribute('aria-hidden', 'true');
      document.body.appendChild(btmBlur);
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectEdgeBlurs);
  } else {
    injectEdgeBlurs();
  }

  /* ── 2. 3D SPRING BOUNCE & DEPTH-OF-FIELD REVEAL OBSERVER ── */
  if(!reduceMotion){
    var cardObserver = null;
    function init3DReveal(){
      if('IntersectionObserver' in window){
        cardObserver = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting){
              entry.target.classList.add('in');
              cardObserver.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: '0px 0px -30px 0px',
          threshold: 0.08
        });

        // Observe existing cards and newly rendered cards
        observeCards();

        // Stagger grid cards for natural wave bounce
        var gridCards = document.querySelectorAll('#arrivals .pcase, .shelf .pcase, .grid .pcase');
        gridCards.forEach(function(c, i){
          c.style.transitionDelay = ((i % 4) * 65) + 'ms';
        });
      }
    }

    function observeCards(){
      if(!cardObserver) return;
      var targets = document.querySelectorAll('.pcase:not(.in), .shelf-card:not(.in), .ios-3d-jump:not(.in), .reveal:not(.in)');
      targets.forEach(function(el){
        el.classList.add('ios-3d-jump');
        cardObserver.observe(el);
      });
    }

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init3DReveal);
    } else {
      init3DReveal();
    }

    // Modern MutationObserver to auto-observe cards on dynamic filter/sort updates
    try {
      var gridMutObserver = new MutationObserver(function(){
        setTimeout(observeCards, 20);
      });
      document.addEventListener('DOMContentLoaded', function(){
        var containers = document.querySelectorAll('#arrivals, #productGrid, .shelf, .grid, .feed-rail');
        containers.forEach(function(c){
          gridMutObserver.observe(c, { childList: true });
        });
      });
    } catch(e){}

    // Re-observe if dynamic filtering happens (e.g. category pill clicks)
    var origRender = window.renderSelection;
    if(typeof origRender === 'function'){
      window.renderSelection = function(){
        var res = origRender.apply(this, arguments);
        setTimeout(observeCards, 40);
        return res;
      };
    }


    /* ── 3. SCROLL VELOCITY 3D INERTIAL PHYSICS (JUMP / BOUNCE) ── */
    var lastScrollY = window.scrollY || window.pageYOffset;
    var scrollVelocity = 0;
    var isScrollingTimer = null;
    var ticking = false;

    function applyScrollPhysics(){
      var currentScrollY = window.scrollY || window.pageYOffset;
      var delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if(Math.abs(delta) < 150){
        scrollVelocity += (delta - scrollVelocity) * 0.35;
      }

      var clampVelocity = Math.max(-28, Math.min(28, scrollVelocity));
      var tiltDeg = (clampVelocity * 0.08).toFixed(2);
      var liftPx = (-clampVelocity * 0.14).toFixed(1);

      document.documentElement.style.setProperty('--scroll-tilt', tiltDeg + 'deg');
      document.documentElement.style.setProperty('--scroll-lift', liftPx + 'px');

      var visibleCards = document.querySelectorAll('.pcase.in');
      visibleCards.forEach(function(card){
        card.classList.add('ios-scroll-inertia');
      });

      clearTimeout(isScrollingTimer);
      isScrollingTimer = setTimeout(function(){
        document.documentElement.style.setProperty('--scroll-tilt', '0deg');
        document.documentElement.style.setProperty('--scroll-lift', '0px');
        scrollVelocity = 0;
      }, 90);

      ticking = false;
    }

    window.addEventListener('scroll', function(){
      if(!ticking){
        window.requestAnimationFrame(applyScrollPhysics);
        ticking = true;
      }
    }, {passive:true});

    /* ── 4. INTERACTIVE 3D POINTER TILT (DESKTOP) ── */
    if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      document.addEventListener('pointermove', function(e){
        var card = e.target.closest('.pcase');
        if(!card) return;
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY * -4.5).toFixed(2);
        var rotateY = ((x - centerX) / centerX * 4.5).toFixed(2);

        card.style.transform = 'perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px) scale(1.025)';
      });

      document.addEventListener('pointerout', function(e){
        var card = e.target.closest('.pcase');
        if(card){
          card.style.transform = '';
        }
      });
    }
  }

  /* ── 5. GOLD DUST MOTES ── */
  if(!reduceMotion){
    var c = document.createElement('canvas');
    c.setAttribute('aria-hidden','true');
    c.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;mix-blend-mode:screen;';
    if(document.body) document.body.prepend(c);
    var ctx = c.getContext('2d'), W, H;
    function size(){ W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
    size(); window.addEventListener('resize', size);

    var N = window.innerWidth < 700 ? 14 : 32, P = [];
    for (var i = 0; i < N; i++) P.push({
      x: Math.random(), y: Math.random(),
      r: Math.random()*1.3 + .4,
      s: Math.random()*.00032 + .00012,
      w: Math.random()*.0004 - .0002,
      ph: Math.random()*6.28,
      a: Math.random()*.45 + .2
    });
    function draw(t){
      ctx.clearRect(0,0,W,H);
      for (var i = 0; i < P.length; i++){
        var p = P[i];
        p.y -= p.s; p.x += p.w * Math.sin(t*.0004 + p.ph);
        if (p.y < -.02){ p.y = 1.02; p.x = Math.random(); }
        var tw = .5 + .5 * Math.sin(t*.0012 + p.ph);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(231,200,120,' + (p.a * tw * .8).toFixed(3) + ')';
        ctx.arc(p.x*W, p.y*H, p.r, 0, 6.283);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    /* ── 6. CURSOR EMBER (DESKTOP) ── */
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches){
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


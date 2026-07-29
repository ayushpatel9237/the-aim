/* The AIM ambient life — gold dust in the air + a warm ember that
   follows the cursor. Respects reduced motion. */
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── gold dust motes ── */
  var c = document.createElement('canvas');
  c.setAttribute('aria-hidden','true');
  c.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;mix-blend-mode:screen;';
  document.body.prepend(c);
  var ctx = c.getContext('2d'), W, H;
  function size(){ W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  size(); window.addEventListener('resize', size);

  var N = window.innerWidth < 700 ? 16 : 36, P = [];
  for (var i = 0; i < N; i++) P.push({
    x: Math.random(), y: Math.random(),
    r: Math.random()*1.4 + .4,
    s: Math.random()*.00035 + .00012,   // drift speed (upward)
    w: Math.random()*.0004 - .0002,     // sideways sway
    ph: Math.random()*6.28,
    a: Math.random()*.5 + .22
  });
  function draw(t){
    ctx.clearRect(0,0,W,H);
    for (var i = 0; i < P.length; i++){
      var p = P[i];
      p.y -= p.s; p.x += p.w * Math.sin(t*.0004 + p.ph);
      if (p.y < -.02){ p.y = 1.02; p.x = Math.random(); }
      var tw = .5 + .5 * Math.sin(t*.0012 + p.ph);
      ctx.beginPath();
      ctx.fillStyle = 'rgba(231,200,120,' + (p.a * tw * .85).toFixed(3) + ')';
      ctx.arc(p.x*W, p.y*H, p.r, 0, 6.283);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  /* ── cursor ember (desktop only) ── */
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    var g = document.createElement('div');
    g.setAttribute('aria-hidden','true');
    g.style.cssText =
      'position:fixed;width:540px;height:540px;border-radius:50%;pointer-events:none;' +
      'z-index:1;mix-blend-mode:screen;transform:translate(-50%,-50%);opacity:0;' +
      'transition:opacity .6s ease;left:50%;top:40%;' +
      'background:radial-gradient(circle, rgba(201,161,95,.09), rgba(201,161,95,.035) 42%, transparent 70%);';
    document.body.appendChild(g);
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
})();

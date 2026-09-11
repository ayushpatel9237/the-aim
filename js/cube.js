/* ═══════════════════════════════════════════════════════════════
   THE AIM — LIQUID GLASS 3D CUBE ENGINE
   Auto-upgrades flat .pimg media wells into unified optical
   glass cubes with cursor-reactive specular highlights and
   seamless 1-piece 3D physics.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // Glass profile settings based on <html data-glass="subtle|balanced|bold">
  function getProfile(){
    var mode = (document.documentElement.getAttribute('data-glass') || 'balanced').toLowerCase();
    if(mode === 'subtle'){
      return { maxTilt: 4.0, lift: 6, scale: 1.015 };
    }
    if(mode === 'bold'){
      return { maxTilt: 9.0, lift: 10, scale: 1.03 };
    }
    // Default: balanced
    return { maxTilt: 6.5, lift: 8, scale: 1.022 };
  }

  // Upgrade a single .pimg element into an .aim-cube
  function upgradePimg(pimg){
    if(!pimg || pimg.dataset.cubeInit === 'true') return;

    // Check if it has media (img or video)
    var mediaEl = pimg.querySelector('img, video');
    if(!mediaEl) return; // defensive: wait until media is present

    pimg.dataset.cubeInit = 'true';
    pimg.classList.add('aim-cube');

    // Extract badges or overlays to preserve them above the cube
    var badges = Array.prototype.slice.call(pimg.querySelectorAll('.vbadge, .sku'));

    // Create shadow element
    var shadow = document.createElement('div');
    shadow.className = 'aim-cube__shadow';

    // Create cube 3D body
    var cube = document.createElement('div');
    cube.className = 'aim-cube__cube';

    // Create media container (flush, 1-piece with glass)
    var mediaContainer = document.createElement('div');
    mediaContainer.className = 'aim-cube__media';

    // Move media inside media container
    mediaContainer.appendChild(mediaEl);

    // Create optical glass front face
    var front = document.createElement('div');
    front.className = 'aim-cube__front';

    cube.appendChild(mediaContainer);
    cube.appendChild(front);

    // Clear and assemble pimg
    pimg.innerHTML = '';
    // Append badges back if any
    badges.forEach(function(b){ pimg.appendChild(b); });
    pimg.appendChild(shadow);
    pimg.appendChild(cube);

    // Attach mouse / pointer interaction if not reduced motion & has fine pointer
    if(!isReduced && hasFinePointer){
      bindInteraction(pimg, cube, shadow);
    }
  }

  function bindInteraction(pimg, cube, shadow){
    var card = pimg.closest('.pcase') || pimg;
    var rafId = null;
    var targetRx = 0, targetRy = 0, targetLift = 0;
    var currentRx = 0, currentRy = 0, currentLift = 0;
    var isHovered = false;

    function renderLoop(){
      if(!isHovered && Math.abs(currentRx) < 0.05 && Math.abs(currentRy) < 0.05 && Math.abs(currentLift) < 0.05){
        cube.style.transform = '';
        if(shadow) shadow.style.transform = '';
        cube.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1)';
        if(shadow) shadow.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1)';
        rafId = null;
        return;
      }

      // Smooth lerp (friction = 0.18)
      currentRx += (targetRx - currentRx) * 0.18;
      currentRy += (targetRy - currentRy) * 0.18;
      currentLift += (targetLift - currentLift) * 0.18;

      var profile = getProfile();

      // 3D rotation + hover lift — image and glass move together as ONE solid piece
      cube.style.transform = 'translateY(' + (-currentLift * profile.lift) + 'px) translateZ(' + (currentLift * 12) + 'px) rotateX(' + currentRx.toFixed(2) + 'deg) rotateY(' + currentRy.toFixed(2) + 'deg) scale(' + (1 + currentLift * (profile.scale - 1)) + ')';

      if(shadow){
        shadow.style.transform = 'translateY(' + (currentLift * 6) + 'px) scale(' + (1 + currentLift * 0.03) + ')';
      }

      rafId = requestAnimationFrame(renderLoop);
    }

    card.addEventListener('pointerenter', function(e){
      isHovered = true;
      targetLift = 1;
      cube.style.transition = 'none';
      if(shadow) shadow.style.transition = 'none';
      pimg.style.setProperty('--glow', '1');
      if(!rafId) rafId = requestAnimationFrame(renderLoop);
    });

    card.addEventListener('pointermove', function(e){
      var r = pimg.getBoundingClientRect();
      if(r.width === 0 || r.height === 0) return;

      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;

      // Clamped normalized coords from -1 to 1
      var nx = Math.max(-1, Math.min(1, (x - 0.5) * 2));
      var ny = Math.max(-1, Math.min(1, (y - 0.5) * 2));

      var profile = getProfile();
      targetRx = -ny * profile.maxTilt;
      targetRy = nx * profile.maxTilt;

      // Specular highlight tracks cursor across glass face (5% to 95%)
      var sx = Math.max(5, Math.min(95, Math.round(x * 100)));
      var sy = Math.max(5, Math.min(95, Math.round(y * 100)));
      pimg.style.setProperty('--sx', sx + '%');
      pimg.style.setProperty('--sy', sy + '%');

      if(!rafId) rafId = requestAnimationFrame(renderLoop);
    });

    card.addEventListener('pointerleave', function(){
      isHovered = false;
      targetRx = 0;
      targetRy = 0;
      targetLift = 0;
      pimg.style.setProperty('--glow', '0');
      pimg.style.setProperty('--sx', '30%');
      pimg.style.setProperty('--sy', '20%');
      if(!rafId) rafId = requestAnimationFrame(renderLoop);
    });
  }

  // Scan and upgrade all .pimg elements
  function upgradeAll(){
    var list = document.querySelectorAll('.pimg:not([data-cube-init="true"])');
    for(var i=0; i<list.length; i++){
      upgradePimg(list[i]);
    }
  }

  // Init on DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', upgradeAll);
  } else {
    upgradeAll();
  }

  // Safety fallback after page fully loads
  window.addEventListener('load', upgradeAll);

  // Auto-upgrade when dynamic catalog changes occur (shop filters, live products, arrivals)
  document.addEventListener('products:updated', function(){
    setTimeout(upgradeAll, 20);
  });

  // Observe DOM for newly inserted product cards
  var observer = new MutationObserver(function(mutations){
    var shouldUpgrade = false;
    for(var i=0; i<mutations.length; i++){
      var m = mutations[i];
      if(m.addedNodes && m.addedNodes.length > 0){
        for(var j=0; j<m.addedNodes.length; j++){
          var node = m.addedNodes[j];
          if(node.nodeType === 1){ // ELEMENT_NODE
            if(node.classList && (node.classList.contains('pcase') || node.classList.contains('pimg') || node.querySelector('.pimg'))){
              shouldUpgrade = true;
              break;
            }
          }
        }
      }
      if(shouldUpgrade) break;
    }
    if(shouldUpgrade) upgradeAll();
  });

  if(document.body){
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function(){
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Expose global for manual refresh if needed
  window.upgradeCubes = upgradeAll;
})();

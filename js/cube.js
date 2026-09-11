/* ═══════════════════════════════════════════════════════════════
   THE AIM — LIQUID GLASS 3D CUBE ENGINE
   Auto-upgrades flat .pimg media wells into recessed 3D liquid
   glass cubes with cursor-reactive specular highlights, depth
   recess parallax, and dynamic ambient bounce.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // Glass profile settings based on <html data-glass="subtle|balanced|bold">
  function getProfile(){
    var mode = (document.documentElement.getAttribute('data-glass') || 'balanced').toLowerCase();
    if(mode === 'subtle'){
      return { maxTilt: 4.5, recess: -28, scale: 1.12, parallax: 3.5 };
    }
    if(mode === 'bold'){
      return { maxTilt: 10.5, recess: -52, scale: 1.20, parallax: 8.0 };
    }
    // Default: balanced
    return { maxTilt: 7.5, recess: -42, scale: 1.16, parallax: 6.0 };
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

    // Create media recess container
    var mediaContainer = document.createElement('div');
    mediaContainer.className = 'aim-cube__media';

    // Move media inside media container
    mediaContainer.appendChild(mediaEl);

    // Create glass front face
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
      bindInteraction(pimg, cube, mediaContainer, front);
    }
  }

  function bindInteraction(pimg, cube, media, front){
    var card = pimg.closest('.pcase') || pimg;
    var rafId = null;
    var targetRx = 0, targetRy = 0, targetLift = 0;
    var targetPx = 0, targetPy = 0;
    var currentRx = 0, currentRy = 0, currentLift = 0;
    var currentPx = 0, currentPy = 0;
    var isHovered = false;

    function renderLoop(){
      if(!isHovered && Math.abs(currentRx) < 0.05 && Math.abs(currentRy) < 0.05 && Math.abs(currentLift) < 0.05){
        cube.style.transform = '';
        var profile = getProfile();
        media.style.transform = 'translateZ(' + profile.recess + 'px) scale(' + profile.scale + ')';
        cube.style.transition = 'transform .45s cubic-bezier(.2,.8,.3,1)';
        media.style.transition = 'transform .45s cubic-bezier(.2,.8,.3,1)';
        rafId = null;
        return;
      }

      // Smooth lerp (friction = 0.18)
      currentRx += (targetRx - currentRx) * 0.18;
      currentRy += (targetRy - currentRy) * 0.18;
      currentLift += (targetLift - currentLift) * 0.18;
      currentPx += (targetPx - currentPx) * 0.18;
      currentPy += (targetPy - currentPy) * 0.18;

      var profile = getProfile();

      // 3D rotation + hover lift
      cube.style.transform = 'translateY(' + (-currentLift * 8) + 'px) translateZ(' + (currentLift * 14) + 'px) rotateX(' + currentRx.toFixed(2) + 'deg) rotateY(' + currentRy.toFixed(2) + 'deg) scale(' + (1 + currentLift * 0.02) + ')';

      // Parallax media opposite to cursor motion while remaining recessed
      media.style.transform = 'translateZ(' + profile.recess + 'px) translateX(' + (-currentPx * profile.parallax).toFixed(2) + 'px) translateY(' + (-currentPy * profile.parallax).toFixed(2) + 'px) scale(' + profile.scale + ')';

      rafId = requestAnimationFrame(renderLoop);
    }

    card.addEventListener('pointerenter', function(e){
      isHovered = true;
      targetLift = 1;
      cube.style.transition = 'none';
      media.style.transition = 'none';
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
      targetPx = nx;
      targetPy = ny;

      // Specular highlight tracks cursor across glass face (0% to 100%)
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
      targetPx = 0;
      targetPy = 0;
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

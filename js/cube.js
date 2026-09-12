/* ═══════════════════════════════════════════════════════════════
   THE AIM — REAL SHOWCASE SHELF ENGINE
   Auto-upgrades product cards into boutique display shelves
   where the product sits proudly on a physical shelf plinth,
   with realistic contact shadows and glare-free photography.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // Shelf profile settings based on <html data-glass="subtle|balanced|bold">
  function getProfile(){
    var mode = (document.documentElement.getAttribute('data-glass') || 'balanced').toLowerCase();
    if(mode === 'subtle'){
      return { maxTilt: 3.5, lift: 5, scale: 1.015 };
    }
    if(mode === 'bold'){
      return { maxTilt: 7.5, lift: 9, scale: 1.025 };
    }
    // Default: balanced
    return { maxTilt: 5.0, lift: 7, scale: 1.020 };
  }

  // Upgrade a single .pimg element into an .aim-cube showcase shelf
  function upgradePimg(pimg){
    if(!pimg || pimg.dataset.cubeInit === 'true') return;

    // Check if it has media (img or video)
    var mediaEl = pimg.querySelector('img, video');
    if(!mediaEl) return; // defensive: wait until media is present

    pimg.dataset.cubeInit = 'true';
    pimg.classList.add('aim-cube');

    // Extract badges or overlays to preserve them above the showcase
    var badges = Array.prototype.slice.call(pimg.querySelectorAll('.vbadge, .sku'));

    // 1. Ambient Floor shadow underneath the whole shelf
    var floorShadow = document.createElement('div');
    floorShadow.className = 'aim-cube__shadow';

    // 2. The 3D body container (Product + Shelf move as ONE)
    var cube = document.createElement('div');
    cube.className = 'aim-cube__cube';

    // 3. Clean product media container (NO light effect / glare)
    var mediaContainer = document.createElement('div');
    mediaContainer.className = 'aim-cube__media';
    mediaContainer.appendChild(mediaEl);

    // 4. Contact shadow directly under the product, grounding it on the shelf
    var contactShadow = document.createElement('div');
    contactShadow.className = 'aim-cube__contact-shadow';

    // 5. The Real Display Shelf Underneath
    var shelf = document.createElement('div');
    shelf.className = 'aim-cube__shelf';

    var shelfDeck = document.createElement('div');
    shelfDeck.className = 'aim-cube__shelf-deck';

    var shelfLip = document.createElement('div');
    shelfLip.className = 'aim-cube__shelf-lip';

    shelf.appendChild(shelfDeck);
    shelf.appendChild(shelfLip);

    // Assemble the 3D product unit (product floats above shelf on hover)
    cube.appendChild(mediaContainer);

    // Shelf stays 100% unmovable and permanently anchored to the base
    shelf.appendChild(contactShadow);

    // Clear and assemble pimg (floor shadow -> stationary shelf -> floating product cube)
    pimg.innerHTML = '';
    badges.forEach(function(b){ pimg.appendChild(b); });
    pimg.appendChild(floorShadow);
    pimg.appendChild(shelf);
    pimg.appendChild(cube);

    // Attach smooth pointer interaction if fine pointer & motion allowed
    if(!isReduced && hasFinePointer){
      bindInteraction(pimg, cube, floorShadow);
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
        cube.style.transition = 'transform .42s cubic-bezier(.16,1,.3,1)';
        if(shadow) shadow.style.transition = 'transform .42s cubic-bezier(.16,1,.3,1)';
        rafId = null;
        return;
      }

      // Smooth lerp (friction = 0.18)
      currentRx += (targetRx - currentRx) * 0.18;
      currentRy += (targetRy - currentRy) * 0.18;
      currentLift += (targetLift - currentLift) * 0.18;

      var profile = getProfile();

      // Product and shelf elevate and tilt together in 3D
      cube.style.transform = 'translateY(' + (-currentLift * profile.lift) + 'px) translateZ(' + (currentLift * 10) + 'px) rotateX(' + currentRx.toFixed(2) + 'deg) rotateY(' + currentRy.toFixed(2) + 'deg) scale(' + (1 + currentLift * (profile.scale - 1)) + ')';

      if(shadow){
        shadow.style.transform = 'translateY(' + (currentLift * 4) + 'px) scale(' + (1 + currentLift * 0.04) + ')';
      }

      rafId = requestAnimationFrame(renderLoop);
    }

    card.addEventListener('pointerenter', function(){
      isHovered = true;
      targetLift = 1;
      cube.style.transition = 'none';
      if(shadow) shadow.style.transition = 'none';
      if(!rafId) rafId = requestAnimationFrame(renderLoop);
    });

    card.addEventListener('pointermove', function(e){
      var r = pimg.getBoundingClientRect();
      if(r.width === 0 || r.height === 0) return;

      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;

      // Clamped normalized coords (-1 to 1)
      var nx = Math.max(-1, Math.min(1, (x - 0.5) * 2));
      var ny = Math.max(-1, Math.min(1, (y - 0.5) * 2));

      var profile = getProfile();
      targetRx = -ny * profile.maxTilt;
      targetRy = nx * profile.maxTilt;

      if(!rafId) rafId = requestAnimationFrame(renderLoop);
    });

    card.addEventListener('pointerleave', function(){
      isHovered = false;
      targetRx = 0;
      targetRy = 0;
      targetLift = 0;
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

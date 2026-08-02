/* ═══════════════════════════════════════════════════════════
   THE AIM — EXPAND TRANSITION

   When you tap a product card, the card's own image lifts off the
   grid and grows toward the centre of the screen before the product
   page loads — the same feeling as opening an app icon on iOS.
   On arrival, the product photo settles in from that same scale.

   Technique: FLIP (First, Last, Invert, Play) using a cloned image,
   so it is smooth on phones and never blocks the click.
═══════════════════════════════════════════════════════════ */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'aim_expand_from';

  var css = document.createElement('style');
  css.textContent =
    '.xp-ghost{position:fixed;z-index:9999;margin:0;border-radius:14px;object-fit:cover;' +
      'will-change:transform,opacity;pointer-events:none;' +
      'transition:transform .52s cubic-bezier(.22,.68,.24,1), opacity .52s ease, border-radius .52s ease;}' +
    '.xp-veil{position:fixed;inset:0;z-index:9998;background:var(--ink,#050818);opacity:0;' +
      'pointer-events:none;transition:opacity .42s ease;}' +
    '.xp-veil.on{opacity:1;}';
  document.head.appendChild(css);

  /* ── leaving: grow the tapped card image toward the centre ── */
  document.addEventListener('click', function(e){
    if(reduce) return;
    var a = e.target.closest && e.target.closest('a[href*="product.html"]');
    if(!a) return;
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    var img = a.querySelector('img');
    if(!img) return;

    e.preventDefault();
    e.stopImmediatePropagation();          // take priority over the plain fade

    var r = img.getBoundingClientRect();
    try{ sessionStorage.setItem(KEY, JSON.stringify({ src:img.currentSrc||img.src })); }catch(err){}

    var veil = document.createElement('div');
    veil.className = 'xp-veil';
    document.body.appendChild(veil);

    var ghost = img.cloneNode(true);
    ghost.className = 'xp-ghost';
    ghost.style.left = r.left + 'px';
    ghost.style.top = r.top + 'px';
    ghost.style.width = r.width + 'px';
    ghost.style.height = r.height + 'px';
    document.body.appendChild(ghost);

    /* target: a comfortable square near the top-centre, like the product viewer */
    var tw = Math.min(window.innerWidth * 0.62, 520);
    var tx = (window.innerWidth - tw) / 2 - r.left;
    var ty = Math.max(64, window.innerHeight * 0.10) - r.top;
    var scale = tw / r.width;

    requestAnimationFrame(function(){
      veil.classList.add('on');
      ghost.style.transformOrigin = 'top left';
      ghost.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
      ghost.style.borderRadius = '18px';
    });

    setTimeout(function(){ window.location.href = a.href; }, 430);
  }, true);   /* capture phase: runs before the generic page-fade handler */

  /* ── arriving on the product page: settle the photo in ── */
  if(/product\.html/i.test(location.pathname)){
    var from = null;
    try{ from = JSON.parse(sessionStorage.getItem(KEY)); sessionStorage.removeItem(KEY); }catch(err){}
    if(from && !reduce){
      document.addEventListener('DOMContentLoaded', function(){
        var main = document.getElementById('mainImg');
        if(!main) return;
        main.style.transform = 'scale(1.06)';
        main.style.opacity = '0';
        requestAnimationFrame(function(){
          main.style.transition = 'transform .6s cubic-bezier(.22,.68,.24,1), opacity .5s ease';
          main.style.transform = 'none';
          main.style.opacity = '1';
        });
      });
    }
  }
})();

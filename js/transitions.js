/* ═══════════════════════════════════════════════════════════
   THE AIM — PAGE TRANSITIONS  (dive-in upgrade)

   The site should feel like you DIVE INTO each page, not flip to
   a flat new sheet. On arrival the page rushes up toward you out
   of a soft blur into focus; when you leave, it surges forward
   and blurs away, so the next page opens from inside the motion.
   Sections still rise-stagger in. Respects "reduce motion".
═══════════════════════════════════════════════════════════ */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── inject the styles once ── */
  var css = document.createElement('style');
  css.textContent =
    /* start state: sitting back, out of focus — we're about to dive in */
    'body{opacity:0;transform:scale(.965);filter:blur(6px);transform-origin:50% 42%;}' +
    'body.tin{opacity:1;transform:none;filter:none;' +
      'transition:opacity .5s ease, transform .55s cubic-bezier(.2,.7,.3,1), filter .5s ease;}' +
    /* leaving: surge forward THROUGH the page and blur out */
    'body.tout{opacity:0;transform:scale(1.04);filter:blur(10px);' +
      'transition:opacity .3s ease, transform .3s cubic-bezier(.4,0,.9,.4), filter .3s ease;}' +
    '@media (prefers-reduced-motion: reduce){' +
      'body,body.tin,body.tout{opacity:1!important;transform:none!important;filter:none!important;transition:none!important;}}' +
    /* content rises in on first paint, staggered */
    '.rise{opacity:0;transform:translateY(14px);}' +
    'body.tin .rise{opacity:1;transform:none;' +
      'transition:opacity .6s ease var(--d,0s), transform .6s cubic-bezier(.2,.7,.3,1) var(--d,0s);}';
  document.head.appendChild(css);

  function reveal(){
    document.body.classList.add('tin');
    var items = document.querySelectorAll('.rise');
    for(var i=0;i<items.length;i++){
      items[i].style.setProperty('--d', Math.min(i*0.06, 0.4) + 's');
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', reveal);
  } else { reveal(); }
  window.addEventListener('load', reveal);          /* safety: never leave the page hidden */
  setTimeout(reveal, 700);

  /* ── dive out before navigating to another page on this site ── */
  document.addEventListener('click', function(e){
    if(reduce) return;
    var a = e.target.closest && e.target.closest('a');
    if(!a) return;
    var href = a.getAttribute('href');
    if(!href || href.charAt(0) === '#') return;
    if(a.target === '_blank' || a.hasAttribute('download')) return;
    if(/^(https?:)?\/\//i.test(href) && a.hostname !== location.hostname) return;   // external
    if(/^(mailto:|tel:)/i.test(href)) return;
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    document.body.classList.add('tout');
    setTimeout(function(){ window.location.href = href; }, 290);   // matches .tout duration
  });

  /* coming back via the browser Back button should not land on a faded page */
  window.addEventListener('pageshow', function(ev){
    if(ev.persisted){ document.body.classList.remove('tout'); reveal(); }
  });
})();

/* header only gains its tint once you scroll — at rest it melts into the page */
(function(){
  var h = document.querySelector('header');
  if(!h) return;
  function onScroll(){ h.classList.toggle('stuck', window.scrollY > 12); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
})();

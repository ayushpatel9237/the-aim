/* ═══════════════════════════════════════════════════════════
   THE AIM — PAGE TRANSITIONS

   Makes the site feel like ONE space you step through, rather
   than separate pages that blink. On arrival the content rises
   and fades in; when you click an internal link the current page
   eases out first, then navigates.

   Respects "reduce motion" accessibility settings.
═══════════════════════════════════════════════════════════ */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── inject the styles once ── */
  var css = document.createElement('style');
  css.textContent =
    'body{opacity:0;}' +
    'body.tin{opacity:1;transition:opacity .42s ease, transform .42s cubic-bezier(.2,.7,.3,1);}' +
    'body.tout{opacity:0;transform:translateY(-6px);transition:opacity .26s ease, transform .26s ease;}' +
    '@media (prefers-reduced-motion: reduce){body,body.tin,body.tout{opacity:1!important;transform:none!important;transition:none!important;}}' +
    /* content rises in on first paint */
    '.rise{opacity:0;transform:translateY(14px);}' +
    'body.tin .rise{opacity:1;transform:none;transition:opacity .6s ease var(--d,0s), transform .6s cubic-bezier(.2,.7,.3,1) var(--d,0s);}';
  document.head.appendChild(css);

  function reveal(){
    document.body.classList.add('tin');
    /* stagger any .rise elements so sections arrive one after another */
    var items = document.querySelectorAll('.rise');
    for(var i=0;i<items.length;i++){
      items[i].style.setProperty('--d', Math.min(i*0.06, 0.4) + 's');
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', reveal);
  } else { reveal(); }
  /* safety: never leave the page invisible */
  window.addEventListener('load', reveal);
  setTimeout(reveal, 700);

  /* ── ease out before navigating to another page on this site ── */
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
    setTimeout(function(){ window.location.href = href; }, 240);
  });

  /* coming back via the browser Back button should not land on a faded page */
  window.addEventListener('pageshow', function(ev){
    if(ev.persisted){ document.body.classList.remove('tout'); reveal(); }
  });
})();

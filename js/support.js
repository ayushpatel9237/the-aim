/* ═══════════════════════════════════════════════════════════
   THE AIM — WHATSAPP SUPPORT

   Indian shoppers message before they buy. A visible way to ask
   a question removes the biggest silent objection: "what if
   something goes wrong and nobody answers?"

   Set your number in js/config.js:
     window.ASCENTRA_CONFIG.WHATSAPP = '919876543210'
   (country code, no + and no spaces). If it isn't set, the
   button simply doesn't appear.
═══════════════════════════════════════════════════════════ */
(function(){
  var cfg = window.ASCENTRA_CONFIG || {};
  var num = (cfg.WHATSAPP || '').replace(/\D/g, '');
  if(!num) return;                       // not configured → no button

  /* a message that already says what page they were on */
  var ctx = document.title.replace(/ — The AIM.*/i, '').trim();
  var msg = encodeURIComponent('Hi! I have a question about ' + (ctx || 'your products') + '.');

  var css = document.createElement('style');
  css.textContent = [
    '.wa{position:fixed;right:16px;bottom:16px;z-index:8500;display:flex;align-items:center;gap:.55rem;',
      'padding:.7rem .95rem;border-radius:999px;text-decoration:none;',
      'background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.20);',
      'backdrop-filter:blur(24px) saturate(170%);-webkit-backdrop-filter:blur(24px) saturate(170%);',
      'box-shadow:0 14px 36px -14px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.22);',
      'color:#F2EDE3;font-family:var(--f-mono,monospace);font-size:.56rem;letter-spacing:.16em;',
      'text-transform:uppercase;transition:transform .3s cubic-bezier(.2,.7,.24,1),background .3s ease;}',
    '.wa:hover{transform:translateY(-3px);background:rgba(255,255,255,.18);}',
    '.wa svg{flex:none;}',
    '@media (max-width:640px){.wa{right:12px;bottom:12px;padding:.65rem;}',
      '.wa span{display:none;}}',
    /* never cover the product page buy bar */
    '@media (max-width:820px){body:has(.buybar) .wa{bottom:74px;}}'
  ].join('');
  document.head.appendChild(css);

  var a = document.createElement('a');
  a.className = 'wa';
  a.href = 'https://wa.me/' + num + '?text=' + msg;
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Ask us on WhatsApp');
  a.innerHTML =
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">' +
    '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/>' +
    '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.23 8.23 0 0 1 .01 16.47z"/></svg>' +
    '<span>Ask us</span>';
  document.body.appendChild(a);
})();

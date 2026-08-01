/* ═══════════════════════════════════════════════════════════
   THE AIM — REFERRAL TRACKING  (secure)

   Captures ?ref=CODE when a visitor arrives via a curator's link
   and remembers it for 30 days.

   SECURITY: this file NEVER writes to the database. A browser
   cannot create sales or commission — that would let anyone pay
   themselves. The code is simply attached to the order, and the
   server (verify-payment Edge Function) credits the curator only
   after a real, cryptographically verified payment.
═══════════════════════════════════════════════════════════ */
(function(){
  var RKEY = 'ascentra_ref';
  var DAYS = 30;

  /* capture ?ref= on arrival */
  try{
    var ref = new URLSearchParams(location.search).get('ref');
    if(ref){
      var clean = String(ref).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
      if(clean) localStorage.setItem(RKEY, JSON.stringify({ code: clean, at: Date.now() }));
    }
  }catch(e){}

  /* read the active referral code (or null) — used by checkout */
  window.ascentraActiveRef = function(){
    try{
      var r = JSON.parse(localStorage.getItem(RKEY));
      if(!r || !r.code) return null;
      if(Date.now() - r.at > DAYS*24*3600*1000){ localStorage.removeItem(RKEY); return null; }
      return r.code;
    }catch(e){ return null; }
  };

  window.ascentraClearRef = function(){
    try{ localStorage.removeItem(RKEY); }catch(e){}
  };
})();

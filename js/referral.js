/* ═══════════════════════════════════════════════════════════
   ASCENTRA — REFERRAL TRACKING
   When a visitor arrives via ?ref=CODE (a curator's link), remember
   it. After an order is placed, credit that curator with commission.
   Loads on the storefront pages (needs config.js + ascentra-db.js).
═══════════════════════════════════════════════════════════ */
(function(){
  var RKEY = 'ascentra_ref';

  /* 1. capture ?ref= on arrival, keep for 30 days */
  try{
    var ref = new URLSearchParams(location.search).get('ref');
    if(ref){
      localStorage.setItem(RKEY, JSON.stringify({ code: ref.toUpperCase(), at: Date.now() }));
    }
  }catch(e){}

  function activeRef(){
    try{
      var r = JSON.parse(localStorage.getItem(RKEY));
      if(!r) return null;
      if(Date.now() - r.at > 30*24*3600*1000){ localStorage.removeItem(RKEY); return null; }
      return r.code;
    }catch(e){ return null; }
  }

  /* 2. expose a hook checkout.js calls after an order is placed */
  window.ascentraSaveOrder = async function(order){
    var code = activeRef();
    if(!code) return;                       // no curator involved
    var A = window.Ascentra;
    if(!A || !A.configured() || !A.raw) return;

    try{
      // find the active curator by code
      var { data: cur } = await A.raw
        .from('curators').select('id, commission_pct')
        .eq('ref_code', code).eq('status','active').maybeSingle();
      if(!cur) return;

      var commission = Math.round(order.total * (cur.commission_pct/100));
      await A.raw.from('curator_sales').insert({
        curator_id: cur.id,
        order_id: order.id,
        order_total: order.total,
        commission: commission,
        status: 'confirmed'
      });
      // one sale per code per order — clear so refresh doesn't double count
      localStorage.removeItem(RKEY);
    }catch(e){ /* silent — never block the customer's order */ }
  };
})();

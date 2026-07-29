/* ═══════════════════════════════════════════════════════════
   ASCENTRA — SUPABASE CLIENT + CURATOR HELPERS
   Loads the Supabase library, connects using config.js, and
   exposes simple functions the curator + admin pages use.
═══════════════════════════════════════════════════════════ */
window.Ascentra = (function(){
  var cfg = window.ASCENTRA_CONFIG || {};
  var ready = cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf('PASTE_') === -1;
  var sb = ready && window.supabase
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON)
    : null;

  function configured(){ return !!sb; }

  /* ── auth ── */
  async function currentUser(){
    if(!sb) return null;
    var { data } = await sb.auth.getUser();
    return data ? data.user : null;
  }
  async function signUp(email, password){
    return sb.auth.signUp({ email: email, password: password });
  }
  async function signIn(email, password){
    return sb.auth.signInWithPassword({ email: email, password: password });
  }
  async function signOut(){ return sb.auth.signOut(); }
  function onAuth(cb){ if(sb) sb.auth.onAuthStateChange(function(_e, s){ cb(s ? s.user : null); }); }

  /* ── curator profile ── */
  async function myCurator(){
    var u = await currentUser(); if(!u) return null;
    var { data } = await sb.from('curators').select('*').eq('user_id', u.id).maybeSingle();
    return data;
  }
  async function applyAsCurator(fields){
    var u = await currentUser(); if(!u) throw new Error('not signed in');
    var code = (fields.name || 'AIM').replace(/[^a-zA-Z]/g,'').slice(0,6).toUpperCase() +
               Math.floor(10 + Math.random()*89);
    return sb.from('curators').insert({
      user_id: u.id, name: fields.name, email: u.email,
      instagram: fields.instagram || null, ref_code: code, status: 'pending'
    }).select().maybeSingle();
  }
  async function mySales(curatorId){
    var { data } = await sb.from('curator_sales').select('*')
      .eq('curator_id', curatorId).order('created_at', { ascending:false });
    return data || [];
  }
  async function myPayouts(curatorId){
    var { data } = await sb.from('curator_payouts').select('*')
      .eq('curator_id', curatorId).order('requested_at', { ascending:false });
    return data || [];
  }
  async function requestPayout(curatorId, amount, method){
    return sb.from('curator_payouts').insert({
      curator_id: curatorId, amount: amount, method: method, status: 'requested'
    });
  }

  /* ── admin ── */
  async function allCurators(){ var {data}=await sb.from('curators').select('*').order('created_at',{ascending:false}); return data||[]; }
  async function allPayouts(){ var {data}=await sb.from('curator_payouts').select('*, curators(name,ref_code)').order('requested_at',{ascending:false}); return data||[]; }
  async function setCuratorStatus(id, status){ return sb.from('curators').update({status:status}).eq('id',id); }
  async function markPayoutPaid(id){ return sb.from('curator_payouts').update({status:'paid', paid_at:new Date().toISOString()}).eq('id',id); }


  /* ── admin: products ── */
  async function allProducts(){
    var { data } = await sb.from('products').select('*').order('id');
    return data || [];
  }
  async function saveProduct(p){
    return sb.from('products').upsert(p).select();
  }
  async function deleteProduct(id){ return sb.from('products').delete().eq('id', id); }

  /* ── admin: orders ── */
  async function allOrders(){
    var { data } = await sb.from('orders').select('*').order('created_at', { ascending:false });
    return data || [];
  }
  async function setOrderStatus(id, status){ return sb.from('orders').update({ status:status }).eq('id', id); }

  /* ── admin: set curator commission ── */
  async function setCommission(id, pct){ return sb.from('curators').update({ commission_pct:pct }).eq('id', id); }

  return {
    configured: configured, raw: sb,
    currentUser: currentUser, signUp: signUp, signIn: signIn, signOut: signOut, onAuth: onAuth,
    myCurator: myCurator, applyAsCurator: applyAsCurator, mySales: mySales,
    myPayouts: myPayouts, requestPayout: requestPayout,
    allCurators: allCurators, allPayouts: allPayouts,
    setCuratorStatus: setCuratorStatus, markPayoutPaid: markPayoutPaid,
    allProducts: allProducts, saveProduct: saveProduct, deleteProduct: deleteProduct,
    allOrders: allOrders, setOrderStatus: setOrderStatus, setCommission: setCommission
  };
})();

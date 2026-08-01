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
  async function setCuratorStatus(id, status){
    if(!(await isAdmin())) throw new Error('Admins only');
    if(['pending','active','suspended','rejected'].indexOf(status) === -1) throw new Error('Invalid status');
    return sb.from('curators').update({status:status}).eq('id',id);
  }
  async function markPayoutPaid(id){
    if(!(await isAdmin())) throw new Error('Admins only');
    return sb.from('curator_payouts').update({status:'paid', paid_at:new Date().toISOString()}).eq('id',id);
  }


  /* ── admin: products ── */
  async function allProducts(){
    var { data } = await sb.from('products').select('*').order('id');
    return data || [];
  }
  async function saveProduct(p){
    if(!(await isAdmin())) throw new Error('Admins only');
    if(!p.id || !p.name || !(Number(p.price) > 0)) throw new Error('Invalid product');
    return sb.from('products').upsert(p).select();
  }
  async function deleteProduct(id){
    if(!(await isAdmin())) throw new Error('Admins only');
    return sb.from('products').delete().eq('id', id);
  }

  /* ── admin: upload a product image to storage, return its public URL ── */
  async function uploadImage(file){
    if(!(await isAdmin())) throw new Error('Admins only');
    if(!/^image\//.test(file.type)) throw new Error('Only image files allowed');
    if(file.size > 5*1024*1024) throw new Error('Image must be under 5MB');
    var ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    var path = 'p_' + Date.now() + '_' + Math.floor(Math.random()*9999) + '.' + ext;
    var up = await sb.storage.from('product-images').upload(path, file, { upsert:false });
    if(up.error) throw up.error;
    var pub = sb.storage.from('product-images').getPublicUrl(path);
    return pub.data.publicUrl;
  }

  /* ── admin: orders ──
     Note: these are additionally protected by database policies —
     a non-admin calling them is rejected by the server regardless. */
  async function isAdmin(){
    var u = await currentUser();
    return !!(u && u.app_metadata && u.app_metadata.role === 'admin');
  }
  async function allOrders(){
    var { data } = await sb.from('orders').select('*').order('created_at', { ascending:false });
    return data || [];
  }
  async function setOrderStatus(id, status){
    if(!(await isAdmin())) throw new Error('Admins only');
    var allowed = ['pending_payment','paid','confirmed','shipped','delivered','cancelled','refunded'];
    if(allowed.indexOf(status) === -1) throw new Error('Invalid status');
    return sb.from('orders').update({ status:status }).eq('id', id);
  }

  /* ── admin: set curator commission ── */
  async function setCommission(id, pct){ return sb.from('curators').update({ commission_pct:pct }).eq('id', id); }

  return {
    configured: configured, raw: sb, isAdmin: isAdmin,
    currentUser: currentUser, signUp: signUp, signIn: signIn, signOut: signOut, onAuth: onAuth,
    myCurator: myCurator, applyAsCurator: applyAsCurator, mySales: mySales,
    myPayouts: myPayouts, requestPayout: requestPayout,
    allCurators: allCurators, allPayouts: allPayouts,
    setCuratorStatus: setCuratorStatus, markPayoutPaid: markPayoutPaid,
    allProducts: allProducts, saveProduct: saveProduct, deleteProduct: deleteProduct, uploadImage: uploadImage,
    allOrders: allOrders, setOrderStatus: setOrderStatus, setCommission: setCommission
  };
})();

/* ═══════════════════════════════════════════════════════════
   THE AIM — LIVE PRODUCT SYNC

   The shop ships with products-data.js (fast, always works, even
   offline). This script then asks the database for the live version and
   merges anything the admin has changed — price, stock, name,
   description, images, video, status.

   Result: what you edit in the admin control centre appears on the
   storefront, without the shop breaking if the database is slow or
   unreachable.

   SECURITY: read-only. The browser can only SELECT active products.
   All writes are admin-only, enforced by database policies.
═══════════════════════════════════════════════════════════ */
(function(){
  if(typeof PRODUCTS === 'undefined') return;
  var A = window.Ascentra;
  if(!A || !A.configured || !A.configured() || !A.raw) return;   // no backend → keep static data

  A.raw.from('products').select('*').eq('active', true)
    .then(function(res){
      var rows = res.data;
      if(!rows || !rows.length) return;

      var byId = {};
      rows.forEach(function(r){ byId[r.id] = r; });

      // merge DB values over the static entries
      PRODUCTS.forEach(function(p){
        var r = byId[p.id];
        if(!r) return;
        if(r.name)        p.name  = r.name;
        if(r.price != null) p.price = Number(r.price);
        if(r.mrp   != null) p.mrp   = Number(r.mrp);
        if(r.description) p.desc  = r.description;
        if(r.short_desc)  p.short = r.short_desc;
        if(r.category)    p.category = r.category;
        if(r.video)       p.video = r.video;
        if(r.stock != null) p.stock = Number(r.stock);
        if(r.images && r.images.length){
          p.gallery = r.images.slice();
          p.hero    = r.images[0];
          p.thumb   = r.images[0];
        }
        delete byId[p.id];        // mark as handled
      });

      // any product that exists ONLY in the database (added via admin)
      Object.keys(byId).forEach(function(id){
        var r = byId[id];
        var imgs = (r.images && r.images.length) ? r.images : [];
        PRODUCTS.push({
          id: r.id, sku: 'AIM-' + String(r.id).slice(0,6).toUpperCase(),
          name: r.name, category: r.category || 'Gadgets',
          price: Number(r.price), desc: r.description || r.short_desc || '',
          hero: imgs[0] || '', gallery: imgs, thumb: imgs[0] || '',
          video: r.video || '', stock: r.stock
        });
      });

      // let the page know fresh data arrived
      document.dispatchEvent(new CustomEvent('products:updated'));
    })
    .catch(function(){ /* silent — the shop still works on static data */ });
})();

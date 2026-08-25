/* ═══════════════════════════════════════════════════════════
   THE AIM — ADMIN · OPERATIONS

   Everything you have been doing in the SQL Editor and Terminal,
   moved onto a page: health checks, bulk stock, order cleanup and
   integrity scans.

   It adds one nav item to the existing Control Centre and leaves
   the rest of admin.html untouched.

   What it deliberately does NOT pretend to do: deploying edge
   functions, setting secrets, rotating keys and running arbitrary
   SQL all need the CLI or the Supabase dashboard. Those are listed
   on the page as instructions rather than faked as buttons.
═══════════════════════════════════════════════════════════ */
(function(){
  var A = window.Ascentra;
  if(!A || !A.raw) return;                       // admin not signed in yet
  var sb = A.raw;

  /* ── styling, scoped to this page ─────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    '.ops-grid{display:grid;grid-template-columns:1fr;gap:1rem;}',
    '@media(min-width:900px){.ops-grid{grid-template-columns:1fr 1fr;}}',
    '.ops-check{display:flex;align-items:flex-start;gap:.8rem;padding:.85rem 0;',
      'border-bottom:1px solid var(--line-soft,#111735);}',
    '.ops-check:last-child{border-bottom:none;}',
    '.ops-dot{width:9px;height:9px;border-radius:50%;flex:none;margin-top:.45rem;',
      'background:#5F678E;transition:background .3s;}',
    '.ops-dot.ok{background:#5FA88C;box-shadow:0 0 8px rgba(95,168,140,.5);}',
    '.ops-dot.warn{background:#E6CBA8;box-shadow:0 0 8px rgba(230,203,168,.45);}',
    '.ops-dot.bad{background:#E08A7A;box-shadow:0 0 8px rgba(224,138,122,.5);}',
    '.ops-dot.run{background:#5F678E;animation:opsPulse 1s infinite;}',
    '@keyframes opsPulse{0%,100%{opacity:.3}50%{opacity:1}}',
    '.ops-ck-name{font-size:.88rem;color:var(--text,#FFF1E2);}',
    '.ops-ck-note{font-size:.74rem;color:var(--muted,#8E96B8);margin-top:.2rem;line-height:1.5;}',
    '.ops-ck-note code{font-family:var(--f-mono,monospace);font-size:.7rem;',
      'background:rgba(255,255,255,.05);padding:.1em .45em;border-radius:4px;color:#E6CBA8;}',
    '.ops-row{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;margin-bottom:.9rem;}',
    '.ops-row input,.ops-row select{background:var(--ink-3,#131315);border:1px solid var(--line-1,#2A2A2E);',
      'border-radius:8px;color:var(--text,#F4F4F5);padding:.6rem .9rem;font-size:.85rem;outline:none;}',
    '.ops-row input:focus,.ops-row select:focus{border-color:var(--gold,#E6CBA8);}',
    '.ops-row label{font-family:var(--f-mono,monospace);font-size:.62rem;letter-spacing:.12em;',
      'text-transform:uppercase;color:var(--muted,#8E96B8);}',
    '.ops-btn{background:var(--gold,#E6CBA8);color:#050818;border:none;border-radius:8px;',
      'padding:.65rem 1.2rem;font-family:var(--f-mono,monospace);font-size:.64rem;letter-spacing:.12em;',
      'text-transform:uppercase;font-weight:700;cursor:pointer;transition:transform .15s,opacity .2s;}',
    '.ops-btn:hover{transform:translateY(-1px);} .ops-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;}',
    '.ops-btn.ghost{background:none;border:1px solid var(--line-1,#2A2A2E);color:var(--text,#F4F4F5);}',
    '.ops-btn.ghost:hover{border-color:var(--gold,#E6CBA8);color:var(--gold,#E6CBA8);}',
    '.ops-btn.danger{background:none;border:1px solid rgba(224,138,122,.45);color:#E08A7A;}',
    '.ops-btn.danger:hover{background:rgba(224,138,122,.12);}',
    '.ops-msg{font-size:.8rem;margin-top:.7rem;min-height:1.2em;}',
    '.ops-msg.ok{color:#5FA88C;} .ops-msg.bad{color:#E08A7A;} .ops-msg.info{color:var(--muted,#8E96B8);}',
    '.ops-danger{border:1px solid rgba(224,138,122,.28)!important;}',
    '.ops-danger .card-title{color:#E08A7A!important;}',
    '.ops-find{padding:.7rem 0;border-bottom:1px solid var(--line-soft,#111735);font-size:.82rem;}',
    '.ops-find:last-child{border-bottom:none;}',
    '.ops-find b{color:#E6CBA8;font-weight:400;font-family:var(--f-mono,monospace);font-size:.75rem;}',
    '.ops-find .fix{display:block;color:var(--muted,#8E96B8);font-size:.74rem;margin-top:.25rem;}',
    '.ops-log{font-family:var(--f-mono,monospace);font-size:.68rem;line-height:1.9;color:var(--muted,#8E96B8);',
      'max-height:240px;overflow-y:auto;}',
    '.ops-log b{color:#5FA88C;font-weight:400;} .ops-log i{color:#E08A7A;font-style:normal;}',
    '.ops-log s{color:#5F678E;text-decoration:none;}',
    '.ops-manual{font-size:.8rem;color:var(--muted,#8E96B8);line-height:1.8;}',
    '.ops-ready{display:flex;align-items:flex-start;gap:.75rem;padding:.7rem 0;',
      'border-bottom:1px solid var(--line-soft,#111735);}',
    '.ops-ready:last-child{border-bottom:none;}',
    '.ops-ready .bx{width:17px;height:17px;flex:none;border-radius:5px;margin-top:.15rem;',
      'border:1px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;',
      'font-size:.6rem;color:#050818;}',
    '.ops-ready .bx.done{background:#5FA88C;border-color:#5FA88C;}',
    '.ops-ready .bx.warn{background:#E6CBA8;border-color:#E6CBA8;}',
    '.ops-ready .rt{font-size:.86rem;color:var(--text,#FFF1E2);}',
    '.ops-ready .rn{font-size:.74rem;color:var(--muted,#8E96B8);margin-top:.15rem;line-height:1.55;}',
    '.ops-ready.blocked .rt{color:#E08A7A;}',
    '.ops-manual code{display:block;font-family:var(--f-mono,monospace);font-size:.72rem;',
      'background:rgba(255,255,255,.04);border:1px solid var(--line-soft,#111735);border-radius:7px;',
      'padding:.6rem .8rem;margin:.4rem 0 .9rem;color:#E6CBA8;overflow-x:auto;white-space:pre;}'
  ].join('');
  document.head.appendChild(css);

  /* ── helpers ──────────────────────────────────────────────── */
  function el(id){ return document.getElementById(id); }
  function say(id, text, kind){
    var m = el(id); if(!m) return;
    m.textContent = text; m.className = 'ops-msg ' + (kind||'info');
  }
  function log(msg, kind){
    var l = el('opsLog'); if(!l) return;
    var t = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    var tag = kind==='ok' ? 'b' : kind==='bad' ? 'i' : 's';
    l.innerHTML = '<div><s>'+t+'</s> <'+tag+'>'+msg+'</'+tag+'></div>' + l.innerHTML;
  }
  function setCheck(id, state, note){
    var d = el('dot-'+id), n = el('note-'+id);
    if(d) d.className = 'ops-dot ' + state;
    if(n && note != null) n.innerHTML = note;
  }

  /* ══════════════════════════════════════════════════════════
     HEALTH CHECKS
     ══════════════════════════════════════════════════════════ */
  async function runHealth(){
    var btn = el('opsHealthBtn');
    if(btn){ btn.disabled = true; btn.textContent = 'Checking…'; }
    ['db','fnCreate','fnVerify','rpcStock','stockSane','payMode'].forEach(function(k){
      setCheck(k,'run','Checking…');
    });

    /* 1 ── database reachable */
    var products = [];
    try{
      var r = await sb.from('products').select('id,name,stock,price,mrp,active,category').limit(500);
      if(r.error) throw r.error;
      products = r.data || [];
      setCheck('db','ok', products.length + ' products readable.');
    }catch(e){
      setCheck('db','bad','Cannot read products: ' + (e.message||e));
      log('database unreachable', 'bad');
    }

    /* 2 ── create-order deployed?
       An empty body is rejected by the function before it writes
       anything, so this proves deployment without creating an order. */
    try{
      var c = await sb.functions.invoke('create-order', { body:{ probe:true } });
      if(c.error && /not found|failed to send|fetch/i.test(c.error.message||'')){
        setCheck('fnCreate','bad','Not deployed. Run <code>supabase functions deploy create-order --no-verify-jwt</code>');
      } else {
        setCheck('fnCreate','ok','Deployed and responding.');
      }
    }catch(e){
      setCheck('fnCreate','bad','Not reachable: ' + (e.message||e));
    }

    /* 3 ── verify-payment deployed? */
    try{
      var v = await sb.functions.invoke('verify-payment', { body:{ probe:true } });
      if(v.error && /not found|failed to send|fetch/i.test(v.error.message||'')){
        setCheck('fnVerify','bad','Not deployed. Run <code>supabase functions deploy verify-payment --no-verify-jwt</code>');
      } else {
        setCheck('fnVerify','ok','Deployed and responding.');
      }
    }catch(e){
      setCheck('fnVerify','bad','Not reachable: ' + (e.message||e));
    }

    /* 4 ── decrement_stock RPC exists?
       Called with qty 0 so it is a genuine no-op. */
    try{
      var pid = products.length ? products[0].id : '__none__';
      var s = await sb.rpc('decrement_stock', { pid: pid, qty: 0 });
      if(s.error && /could not find|does not exist|schema cache/i.test(s.error.message||'')){
        setCheck('rpcStock','bad','Missing — stock will never decrease and you will oversell.');
      } else {
        setCheck('rpcStock','ok','Exists. Stock drops on every verified payment.');
      }
    }catch(e){
      setCheck('rpcStock','warn','Could not confirm: ' + (e.message||e));
    }

    /* 5 ── does any live product have no stock? */
    try{
      var live = products.filter(function(p){ return p.active !== false; });
      var out  = live.filter(function(p){ return Number(p.stock||0) <= 0; });
      var low  = live.filter(function(p){ return Number(p.stock||0) > 0 && Number(p.stock) <= 3; });
      if(out.length)      setCheck('stockSane','warn', out.length+' live product'+(out.length>1?'s are':' is')+' out of stock: '+out.slice(0,4).map(function(p){return p.name;}).join(', ')+(out.length>4?'…':''));
      else if(low.length) setCheck('stockSane','warn', low.length+' product'+(low.length>1?'s':'')+' running low (3 or fewer).');
      else                setCheck('stockSane','ok','Every live product has stock.');
    }catch(e){ setCheck('stockSane','warn','—'); }

    /* 6 ── test vs live payments, inferred from real orders */
    try{
      var o = await sb.from('orders').select('razorpay_order_id,status,created_at')
                      .not('razorpay_order_id','is',null)
                      .order('created_at',{ascending:false}).limit(1);
      if(o.error) throw o.error;
      if(!o.data || !o.data.length){
        setCheck('payMode','warn','No online orders yet — mode unknown until the first one.');
      } else {
        setCheck('payMode','warn','Cannot read secrets from a browser. Confirm with <code>supabase secrets list</code> — test keys start <code>rzp_test_</code>.');
      }
    }catch(e){ setCheck('payMode','warn','—'); }

    if(btn){ btn.disabled = false; btn.textContent = 'Run checks'; }
    log('health checks finished', 'ok');
  }

  /* ══════════════════════════════════════════════════════════
     BULK STOCK
     ══════════════════════════════════════════════════════════ */
  async function applyStock(){
    var qty   = parseInt(el('opsStockQty').value, 10);
    var scope = el('opsStockScope').value;
    if(isNaN(qty) || qty < 0){ say('opsStockMsg','Enter a stock number of 0 or more.','bad'); return; }

    var label = scope==='__all__' ? 'every product' : 'products in ' + scope;
    if(!confirm('Set stock to ' + qty + ' for ' + label + '?')) return;

    var b = el('opsStockBtn'); b.disabled = true; b.textContent = 'Saving…';
    try{
      var q = sb.from('products').update({ stock: qty });
      q = (scope==='__all__') ? q.neq('id','__never__') : q.eq('category', scope);
      var r = await q.select('id');
      if(r.error) throw r.error;
      var n = (r.data||[]).length;
      say('opsStockMsg', n + ' product' + (n===1?'':'s') + ' set to ' + qty + '.', 'ok');
      log('stock set to '+qty+' for '+n+' products', 'ok');
      loadStockTable();
    }catch(e){
      say('opsStockMsg','Failed: ' + (e.message||e), 'bad');
      log('stock update failed: '+(e.message||e), 'bad');
    }
    b.disabled = false; b.textContent = 'Apply';
  }

  async function loadStockTable(){
    var wrap = el('opsStockWrap'); if(!wrap) return;
    try{
      var r = await sb.from('products').select('id,name,stock,category,active').order('stock',{ascending:true}).limit(200);
      if(r.error) throw r.error;
      var rows = r.data || [];
      if(!rows.length){ wrap.innerHTML = '<div class="empty-note">No products.</div>'; return; }

      /* fill the category dropdown from real data */
      var sel = el('opsStockScope');
      if(sel && sel.options.length <= 1){
        var cats = rows.map(function(p){ return p.category; })
                       .filter(function(c,i,a){ return c && a.indexOf(c)===i; }).sort();
        cats.forEach(function(c){
          var o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o);
        });
      }

      wrap.innerHTML = rows.slice(0,12).map(function(p){
        var s = Number(p.stock||0);
        var col = s<=0 ? '#E08A7A' : s<=3 ? '#E6CBA8' : '#5FA88C';
        return '<div class="ops-find"><b style="color:'+col+'">'+s+'</b> &nbsp;'+
               (p.name||p.id)+
               '<span class="fix">'+(p.category||'—')+' · '+(p.active===false?'hidden':'live')+
               ' &nbsp;<button class="ops-btn ghost" style="padding:.3rem .7rem;font-size:.55rem" data-setstock="'+p.id+'">Set…</button></span></div>';
      }).join('') + (rows.length>12 ? '<div class="empty-note" style="margin-top:.6rem">Showing the 12 lowest of '+rows.length+'.</div>' : '');

      wrap.querySelectorAll('[data-setstock]').forEach(function(b){
        b.addEventListener('click', async function(){
          var id = b.dataset.setstock;
          var v = prompt('New stock for ' + id + ':');
          if(v === null) return;
          var n = parseInt(v,10);
          if(isNaN(n) || n < 0){ alert('Enter 0 or more.'); return; }
          var u = await sb.from('products').update({ stock:n }).eq('id', id);
          if(u.error){ alert('Failed: ' + u.error.message); return; }
          log('stock for '+id+' set to '+n, 'ok');
          loadStockTable();
        });
      });
    }catch(e){
      wrap.innerHTML = '<div class="empty-note">Could not load: ' + (e.message||e) + '</div>';
    }
  }

  /* ══════════════════════════════════════════════════════════
     INTEGRITY SCAN — the quiet problems that cost money
     ══════════════════════════════════════════════════════════ */
  async function runScan(){
    var wrap = el('opsScanWrap');
    var b = el('opsScanBtn'); b.disabled = true; b.textContent = 'Scanning…';
    wrap.innerHTML = '<div class="empty-note">Scanning…</div>';
    var found = [];

    try{
      var pr = await sb.from('products').select('*').limit(500);
      var or = await sb.from('orders').select('*').order('created_at',{ascending:false}).limit(500);
      var products = (pr.data)||[], orders = (or.data)||[];

      /* price above MRP — the discount would render as negative */
      products.filter(function(p){ return p.mrp && Number(p.mrp) < Number(p.price); })
        .forEach(function(p){ found.push(['Price is higher than MRP', p.name||p.id,
          'The "% off" badge will show a negative number. Raise the MRP or lower the price.']); });

      /* live but no image */
      products.filter(function(p){
        var imgs = p.images;
        if(typeof imgs === 'string'){ try{ imgs = JSON.parse(imgs); }catch(e){ imgs = []; } }
        var n = Array.isArray(imgs) ? imgs.length : 0;
        return p.active !== false && !n && !p.hero && !p.thumb;
      }).forEach(function(p){ found.push(['Live product has no image', p.name||p.id,
          'It will show as a blank tile in the shop.']); });

      /* paid but no payment id — verification may not have completed */
      orders.filter(function(o){ return o.status==='paid' && !o.razorpay_payment_id; })
        .forEach(function(o){ found.push(['Paid order with no payment id', o.id,
          'verify-payment may not have finished. Check it against your Razorpay dashboard before shipping.']); });

      /* possible double payments — same total, same hour */
      var seen = {};
      orders.filter(function(o){ return o.status==='paid'; }).forEach(function(o){
        var key = String(o.total) + '|' + String(o.created_at||'').slice(0,13);
        if(seen[key]){
          found.push(['Possible duplicate payment', o.id + ' and ' + seen[key],
            'Same amount within the same hour. If the customer paid twice, refund one in Razorpay.']);
        } else seen[key] = o.id;
      });

      /* orders referencing products that no longer exist */
      var ids = {}; products.forEach(function(p){ ids[p.id] = 1; });
      orders.forEach(function(o){
        var its = o.items;
        if(typeof its === 'string'){ try{ its = JSON.parse(its); }catch(e){ its = []; } }
        (Array.isArray(its)?its:[]).forEach(function(i){
          if(i && i.id && !ids[i.id]){
            found.push(['Order references a deleted product', o.id + ' → ' + i.id,
              'The confirmation page and admin will show a blank image. Prefer setting stock to 0 over deleting.']);
          }
        });
      });

      /* stuck in limbo */
      orders.filter(function(o){ return o.status==='pending' || o.status==='created'; })
        .forEach(function(o){ found.push(['Order never completed', o.id,
          'Customer started checkout and did not pay. Safe to delete.']); });

      if(!found.length){
        wrap.innerHTML = '<div class="ops-find" style="color:#5FA88C">Nothing to fix. Products and orders are consistent.</div>';
        log('integrity scan: clean', 'ok');
      } else {
        var uniq = [], keys = {};
        found.forEach(function(f){ var k=f[0]+f[1]; if(!keys[k]){ keys[k]=1; uniq.push(f); } });
        wrap.innerHTML = uniq.map(function(f){
          return '<div class="ops-find"><b>'+f[0]+'</b> — '+f[1]+'<span class="fix">'+f[2]+'</span></div>';
        }).join('');
        log('integrity scan: '+uniq.length+' issue'+(uniq.length>1?'s':'')+' found', 'bad');
      }
    }catch(e){
      wrap.innerHTML = '<div class="empty-note">Scan failed: ' + (e.message||e) + '</div>';
    }
    b.disabled = false; b.textContent = 'Run scan';
  }

  /* ══════════════════════════════════════════════════════════
     ORDER CLEANUP
     ══════════════════════════════════════════════════════════ */
  async function countOrders(){
    try{
      var r = await sb.from('orders').select('id,status,created_at,total');
      if(r.error) throw r.error;
      var o = r.data||[];
      var paid = o.filter(function(x){ return ['paid','confirmed','shipped','delivered'].indexOf(x.status)>-1; });
      var rev  = paid.reduce(function(s,x){ return s + Number(x.total||0); }, 0);
      el('opsOrdCount').innerHTML =
        '<div class="ops-find"><b>'+o.length+'</b> orders in the table'+
        '<span class="fix">'+paid.length+' paid · \u20b9'+rev.toLocaleString('en-IN')+' total value</span></div>';
    }catch(e){
      el('opsOrdCount').innerHTML = '<div class="empty-note">'+(e.message||e)+'</div>';
    }
  }

  async function wipeOrders(mode){
    var label = mode==='all' ? 'ALL orders' :
                mode==='today' ? "today's orders" : 'unpaid / abandoned orders';

    if(!confirm('Delete ' + label + '?\n\nThis cannot be undone.')) return;
    if(mode==='all'){
      var typed = prompt('This deletes every order, including real customer orders.\n\nType DELETE to confirm:');
      if(typed !== 'DELETE'){ say('opsOrdMsg','Cancelled.','info'); return; }
    }

    try{
      var q = sb.from('orders').delete();
      if(mode==='all')          q = q.neq('id','__never__');
      else if(mode==='today')   q = q.gte('created_at', new Date().toISOString().slice(0,10));
      else                      q = q.in('status', ['pending','created','demo_unpaid','failed']);
      var r = await q.select('id');
      if(r.error) throw r.error;
      var n = (r.data||[]).length;
      say('opsOrdMsg', n + ' order' + (n===1?'':'s') + ' deleted.', 'ok');
      log('deleted '+n+' orders ('+mode+')', 'ok');
      countOrders();
    }catch(e){
      say('opsOrdMsg','Failed: ' + (e.message||e), 'bad');
      log('order delete failed: '+(e.message||e), 'bad');
    }
  }


  /* ══════════════════════════════════════════════════════════
     BACKUP
     Losing the orders table is more likely than being hacked, and
     there is no undo. This pulls everything into a file on your
     Mac. Do it weekly; keep the file somewhere that is not this
     laptop.
     ══════════════════════════════════════════════════════════ */
  function download(name, text, type){
    var blob = new Blob([text], { type: type || 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 500);
  }

  function stamp(){
    var d = new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth()+1).padStart(2,'0') + '-' +
           String(d.getDate()).padStart(2,'0');
  }

  /* orders as CSV — one row per order, readable in Excel */
  function ordersCsv(rows){
    var head = ['order_id','date','status','payment','total','name','phone','email',
                'address','city','state','pincode','items','razorpay_payment_id'];
    var esc = function(v){
      v = (v == null) ? '' : String(v);
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : v;
    };
    var lines = [head.join(',')];
    rows.forEach(function(o){
      var c = o.customer || {};
      if(typeof c === 'string'){ try{ c = JSON.parse(c); }catch(e){ c = {}; } }
      var its = o.items;
      if(typeof its === 'string'){ try{ its = JSON.parse(its); }catch(e){ its = []; } }
      var itemText = (Array.isArray(its)?its:[])
        .map(function(i){ return (i.qty||1) + 'x ' + (i.name||i.id); }).join(' | ');
      lines.push([
        o.id, o.created_at, o.status, o.payment, o.total,
        c.name, c.phone, c.email, c.address, c.city, c.state, c.pincode,
        itemText, o.razorpay_payment_id
      ].map(esc).join(','));
    });
    return lines.join('\n');
  }

  async function backup(what){
    var b = el('opsBackupBtn'); if(b){ b.disabled = true; b.textContent = 'Exporting…'; }
    try{
      var tables = (what === 'all')
        ? ['orders','products','curators','curator_sales','curator_payouts','feed_items','upcoming_items']
        : ['orders'];
      var out = { exported_at: new Date().toISOString(), site: 'THE AIM', tables: {} };
      var counts = [];

      for(var i=0; i<tables.length; i++){
        var t = tables[i];
        var r = await sb.from(t).select('*');
        if(r.error){ counts.push(t + ': ' + r.error.message); continue; }
        out.tables[t] = r.data || [];
        counts.push(t + ': ' + (r.data||[]).length);
      }

      download('theaim-backup-' + stamp() + '.json', JSON.stringify(out, null, 2));

      /* orders also as CSV, because a JSON file is no use in a hurry */
      if(out.tables.orders && out.tables.orders.length){
        download('theaim-orders-' + stamp() + '.csv', ordersCsv(out.tables.orders), 'text/csv');
      }

      say('opsBackupMsg', 'Downloaded — ' + counts.join(', '), 'ok');
      log('backup exported (' + counts.join(', ') + ')', 'ok');
      try{ localStorage.setItem('aim_last_backup', new Date().toISOString()); }catch(e){}
      showLastBackup();
    }catch(e){
      say('opsBackupMsg', 'Export failed: ' + (e.message||e), 'bad');
    }
    if(b){ b.disabled = false; b.textContent = 'Download backup'; }
  }

  function showLastBackup(){
    var n = el('opsLastBackup'); if(!n) return;
    var t = null;
    try{ t = localStorage.getItem('aim_last_backup'); }catch(e){}
    if(!t){ n.innerHTML = '<b style="color:#E08A7A">Never backed up.</b> If the database went today, everything would be gone.'; return; }
    var days = Math.floor((Date.now() - new Date(t)) / 86400000);
    var col  = days > 14 ? '#E08A7A' : days > 7 ? '#E6CBA8' : '#5FA88C';
    n.innerHTML = 'Last backup: <b style="color:'+col+'">' +
      (days === 0 ? 'today' : days + ' day' + (days>1?'s':'') + ' ago') + '</b>' +
      (days > 7 ? ' — worth doing another.' : '');
  }


  /* ══════════════════════════════════════════════════════════
     LAUNCH READINESS
     Not a list you tick yourself — it looks at the live site and
     database and works out what is genuinely still missing.
     ══════════════════════════════════════════════════════════ */
  async function runReady(){
    var wrap = el('opsReadyWrap');
    var b = el('opsReadyBtn'); if(b){ b.disabled = true; b.textContent = 'Checking…'; }
    wrap.innerHTML = '<div class="empty-note">Checking…</div>';

    var rows = [];
    var add = function(state, title, note, blocking){
      rows.push({ state:state, title:title, note:note, blocking:!!blocking });
    };

    try{
      var pr = await sb.from('products').select('id,name,active,stock,price,mrp,images');
      var or = await sb.from('orders').select('id,status,total,created_at,razorpay_payment_id');
      var products = pr.data || [], orders = or.data || [];

      /* ── can you actually take money? ── */
      var paid = orders.filter(function(o){ return o.status==='paid'; });
      if(paid.length){
        add('done','Payments verified end to end',
            paid.length + ' paid order' + (paid.length>1?'s have':' has') +
            ' completed, signature-checked on the server.');
      } else {
        add('warn','No completed online payment yet',
            'Place one test order with a Razorpay test card to prove the whole path works.');
      }

      add('warn','Razorpay live keys',
          'Cannot be read from a browser. If you are still on test keys, no real money moves. ' +
          'Check with <code>supabase secrets list</code>, and switch once KYC clears.', true);

      /* ── is there anything to sell? ── */
      var live = products.filter(function(p){ return p.active !== false; });
      var sellable = live.filter(function(p){ return Number(p.stock||0) > 0; });
      if(!live.length)          add('warn','No live products','Nothing is visible in the shop.', true);
      else if(!sellable.length) add('warn','Everything is out of stock',
                                    live.length + ' live products, all at zero stock. Nobody can buy.', true);
      else                      add('done','Products ready to sell',
                                    sellable.length + ' of ' + live.length + ' live products have stock.');

      /* ── would a customer get a receipt? ── */
      add('warn','Order confirmation emails',
          'The code is written and waiting. Until you set the two secrets below, a paying customer ' +
          'gets no receipt at all — they just have to trust the confirmation page.');

      /* ── could you survive losing the database? ── */
      var lb = null; try{ lb = localStorage.getItem('aim_last_backup'); }catch(e){}
      if(!lb) add('warn','No backup taken',
                  orders.length + ' orders in the database and no copy anywhere else.', true);
      else {
        var d = Math.floor((Date.now()-new Date(lb))/86400000);
        add(d>7?'warn':'done','Backup', d===0?'Taken today.':'Last taken '+d+' days ago.');
      }

      /* ── data problems that surface as customer complaints ── */
      var noImg  = live.filter(function(p){
        var i=p.images; if(typeof i==='string'){ try{ i=JSON.parse(i); }catch(e){ i=[]; } }
        return !(Array.isArray(i)&&i.length);
      });
      var badMrp = products.filter(function(p){ return p.mrp && Number(p.mrp) < Number(p.price); });
      if(noImg.length)  add('warn','Live products with no image',
                            noImg.length + ' will show as blank tiles: ' +
                            noImg.slice(0,3).map(function(p){return p.name;}).join(', '));
      if(badMrp.length) add('warn','Price above MRP',
                            badMrp.length + ' product' + (badMrp.length>1?'s':'') +
                            ' would show a negative discount.');
      if(!noImg.length && !badMrp.length) add('done','Product data is clean','No missing images, no negative discounts.');

      /* ── the things only you can confirm ── */
      add('warn','GST registration',
          'Required for e-commerce sellers in most cases. Your GSTIN also needs adding to terms.html.', true);
      add('warn','Legal pages carry real details',
          'Contact, Terms, Privacy, Shipping and Returns should show your business name, address and phone. ' +
          'Open one and check it is not still template text.');

      wrap.innerHTML = rows.map(function(r){
        var mark = r.state==='done' ? '✓' : '!';
        return '<div class="ops-ready'+(r.blocking&&r.state!=='done'?' blocked':'')+'">' +
               '<span class="bx '+(r.state==='done'?'done':'warn')+'">'+mark+'</span>' +
               '<div><div class="rt">'+r.title+'</div><div class="rn">'+r.note+'</div></div></div>';
      }).join('');

      var left = rows.filter(function(r){ return r.state!=='done'; }).length;
      log('launch check: ' + left + ' item' + (left===1?'':'s') + ' outstanding', left?'bad':'ok');
    }catch(e){
      wrap.innerHTML = '<div class="empty-note">Check failed: ' + (e.message||e) + '</div>';
    }
    if(b){ b.disabled=false; b.textContent='Re-check'; }
  }

  /* ══════════════════════════════════════════════════════════
     BUILD THE PAGE
     ══════════════════════════════════════════════════════════ */
  function checkRow(id, name){
    return '<div class="ops-check"><span class="ops-dot" id="dot-'+id+'"></span>' +
           '<div><div class="ops-ck-name">'+name+'</div>' +
           '<div class="ops-ck-note" id="note-'+id+'">Not checked yet.</div></div></div>';
  }

  function build(){
    var content = document.querySelector('.content');
    var sidebar = document.getElementById('sidebar');
    if(!content || !sidebar || document.getElementById('v-ops')) return false;

    /* nav item, under a section of its own */
    var sec = document.createElement('div');
    sec.className = 'sb-section'; sec.textContent = 'System';
    var btn = document.createElement('button');
    btn.className = 'nav-item'; btn.dataset.t = 'ops';
    btn.innerHTML = '<span class="ic">⚙</span>Operations';
    var bottom = sidebar.querySelector('.sb-bottom');
    if(bottom){ sidebar.insertBefore(sec, bottom); sidebar.insertBefore(btn, bottom); }
    else { sidebar.appendChild(sec); sidebar.appendChild(btn); }

    /* page */
    var v = document.createElement('div');
    v.className = 'page-v'; v.id = 'v-ops';
    v.innerHTML =
      '<div class="card"><div class="card-header"><span class="card-title">System health</span>' +
        '<button class="ops-btn" id="opsHealthBtn">Run checks</button></div>' +
        checkRow('db','Database connection') +
        checkRow('fnCreate','create-order function') +
        checkRow('fnVerify','verify-payment function') +
        checkRow('rpcStock','decrement_stock (stock drops on payment)') +
        checkRow('stockSane','Stock levels') +
        checkRow('payMode','Payment mode') +
      '</div>' +

      '<div class="ops-grid">' +
        '<div class="card"><div class="card-header"><span class="card-title">Bulk stock</span></div>' +
          '<div class="ops-row">' +
            '<label>Set stock to</label>' +
            '<input id="opsStockQty" type="number" value="10" min="0" style="width:90px" />' +
            '<label>for</label>' +
            '<select id="opsStockScope"><option value="__all__">every product</option></select>' +
            '<button class="ops-btn" id="opsStockBtn">Apply</button>' +
          '</div>' +
          '<div class="ops-msg" id="opsStockMsg"></div>' +
          '<div style="margin-top:.6rem" id="opsStockWrap"><div class="empty-note">Loading…</div></div>' +
        '</div>' +

        '<div class="card"><div class="card-header"><span class="card-title">Health of your data</span>' +
          '<button class="ops-btn ghost" id="opsScanBtn">Run scan</button></div>' +
          '<div id="opsScanWrap"><div class="empty-note">Checks for negative discounts, imageless products, ' +
          'paid orders missing a payment id, possible double payments and orders pointing at deleted products.</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="card"><div class="card-header"><span class="card-title">Ready to launch?</span>' +
        '<button class="ops-btn" id="opsReadyBtn">Re-check</button></div>' +
        '<div id="opsReadyWrap"><div class="empty-note">Checking…</div></div>' +
      '</div>' +

      '<div class="ops-grid">' +
        '<div class="card"><div class="card-header"><span class="card-title">Backup</span>' +
          '<button class="ops-btn" id="opsBackupBtn">Download backup</button></div>' +
          '<div class="ops-ck-note" id="opsLastBackup">—</div>' +
          '<div class="ops-row" style="margin-top:.9rem">' +
            '<button class="ops-btn ghost" id="opsBackupOrders">Orders only</button>' +
            '<button class="ops-btn ghost" id="opsBackupAll">Everything</button>' +
          '</div>' +
          '<div class="ops-msg" id="opsBackupMsg"></div>' +
          '<div class="ops-ck-note" style="margin-top:.6rem">Downloads a JSON file of your tables plus ' +
          'a CSV of orders you can open in Excel. Keep a copy somewhere other than this laptop.</div>' +
        '</div>' +

        '<div class="card"><div class="card-header"><span class="card-title">Activity</span></div>' +
          '<div class="ops-log" id="opsLog"><div><s>—</s> <s>nothing yet this session</s></div></div>' +
        '</div>' +
      '</div>' +

      '<div class="card ops-danger"><div class="card-header"><span class="card-title">Order cleanup</span></div>' +
        '<div id="opsOrdCount"><div class="empty-note">Loading…</div></div>' +
        '<div class="ops-row" style="margin-top:1rem">' +
          '<button class="ops-btn ghost" id="opsWipeAband">Delete unpaid / abandoned</button>' +
          '<button class="ops-btn danger" id="opsWipeToday">Delete today\'s orders</button>' +
          '<button class="ops-btn danger" id="opsWipeAll">Delete ALL orders</button>' +
        '</div>' +
        '<div class="ops-msg" id="opsOrdMsg"></div>' +
        '<div class="ops-ck-note" style="margin-top:.5rem">Deleting orders does not restore stock — set that back yourself above.</div>' +
      '</div>' +

      '<div class="ops-grid">' +
        '<div class="card"><div class="card-header"><span class="card-title">Needs the Terminal</span></div>' +
          '<div class="ops-manual">' +
            'These cannot be done from a browser — they need the CLI or the Supabase dashboard.' +
            '<code>supabase functions deploy create-order --no-verify-jwt\nsupabase functions deploy verify-payment --no-verify-jwt</code>' +
            'Going live with real payments, once Razorpay KYC clears:' +
            '<code>supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxx\nsupabase secrets set RAZORPAY_KEY_SECRET=xxxx</code>' +
            'Switching on order emails — the code is already written and waiting:' +
            '<code>supabase secrets set RESEND_API_KEY=re_xxxx\nsupabase secrets set ADMIN_EMAIL=theaim.9237@gmail.com</code>' +
            'A weekly backup, kept off this laptop, is the cheapest insurance you will ever buy.' +
          '</div>' +
        '</div>' +
      '</div>';
    content.appendChild(v);

    /* nav switching — mirrors what admin.html does for its own items */
    btn.addEventListener('click', function(){
      document.querySelectorAll('.nav-item').forEach(function(z){ z.classList.remove('on'); });
      document.querySelectorAll('.page-v').forEach(function(z){ z.classList.remove('on'); });
      btn.classList.add('on');
      v.classList.add('on');
      var t = document.getElementById('pgTitle'), s = document.getElementById('pgSub');
      if(t) t.textContent = 'Operations';
      if(s) s.textContent = 'Health, stock and cleanup — without the SQL editor';
      sidebar.classList.remove('open');
      window.scrollTo({top:0});
      if(!v.dataset.loaded){
        v.dataset.loaded = '1';
        runHealth(); loadStockTable(); countOrders(); runReady(); showLastBackup();
      }
    });

    /* wire the controls */
    el('opsHealthBtn').addEventListener('click', runHealth);
    el('opsStockBtn').addEventListener('click', applyStock);
    el('opsScanBtn').addEventListener('click', runScan);
    el('opsWipeAband').addEventListener('click', function(){ wipeOrders('abandoned'); });
    el('opsWipeToday').addEventListener('click', function(){ wipeOrders('today'); });
    el('opsWipeAll').addEventListener('click', function(){ wipeOrders('all'); });
    el('opsReadyBtn').addEventListener('click', runReady);
    el('opsBackupBtn').addEventListener('click', function(){ backup('all'); });
    el('opsBackupOrders').addEventListener('click', function(){ backup('orders'); });
    el('opsBackupAll').addEventListener('click', function(){ backup('all'); });

    return true;
  }

  /* the admin builds its shell asynchronously after sign-in, so wait for it */
  var tries = 0;
  var timer = setInterval(function(){
    if(build() || ++tries > 100) clearInterval(timer);
  }, 200);
})();

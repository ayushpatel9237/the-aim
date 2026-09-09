/* ═══════════════════════════════════════════════════════════
   THE AIM — CUSTOMER ACCOUNT  (optional, never required)

   Signing in is a convenience, not a gate. Anyone can browse and
   buy as a guest exactly as before. If someone does sign in with
   Google they get:
     · their orders listed automatically, no phone number to type
     · their watchlist saved to their account, so it follows them
       to a new phone
     · their delivery details remembered for next time

   Nothing here blocks a purchase. If the backend is unreachable,
   the site behaves exactly as it does for a guest.
═══════════════════════════════════════════════════════════ */
(function(){
  var A = window.Ascentra;
  var WKEY = 'ascentra_watch_v1';
  var user = null;

  function live(){ return A && A.configured && A.configured() && A.raw; }

  /* ── who is signed in ── */
  async function me(){
    if(!live()) return null;
    try{ user = await A.currentUser(); }catch(e){ user = null; }
    return user;
  }

  async function signIn(){
    if(!live()) return;
    var redirectUrl = (window.location.origin || '') + '/account.html';
    A.raw.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl }
    });
  }
  async function signOut(){
    if(!live()) return;
    await A.signOut();
    location.reload();
  }

  /* ── watchlist: local for guests, synced for signed-in ── */
  /* poll.js writes {id:true}; this file works in arrays. Accept both. */
  function asIds(raw){
    if(Array.isArray(raw)) return raw.map(String);
    if(raw && typeof raw === 'object') return Object.keys(raw).filter(function(k){ return raw[k]; });
    return [];
  }
  function localWatch(){ try{ return asIds(JSON.parse(localStorage.getItem(WKEY))); }catch(e){ return []; } }
  function saveLocal(a){ try{ localStorage.setItem(WKEY, JSON.stringify(a)); }catch(e){} }

  async function pullWatch(){
    if(!user || !live()) return localWatch();
    try{
      var r = await A.raw.from('customer_watchlist').select('item_id').eq('user_id', user.id);
      var remote = (r.data || []).map(function(x){ return String(x.item_id); });
      /* merge whatever they saved as a guest into their account */
      var merged = Array.from(new Set(remote.concat(localWatch())));
      if(merged.length > remote.length) await pushWatch(merged);
      saveLocal(merged);
      return merged;
    }catch(e){ return localWatch(); }
  }
  async function pushWatch(ids){
    saveLocal(ids);
    if(!user || !live()) return;
    try{
      await A.raw.from('customer_watchlist').delete().eq('user_id', user.id);
      if(ids.length){
        await A.raw.from('customer_watchlist').insert(
          ids.map(function(id){ return { user_id:user.id, item_id:id }; }));
      }
    }catch(e){ /* local copy still holds */ }
  }

  /* ── orders for the signed-in customer, by their email ── */
  async function myOrders(){
    if(!user || !live()) return [];
    try{
      var r = await A.raw.rpc('my_orders_by_email', { p_email: user.email });
      return r.data || [];
    }catch(e){ return []; }
  }

  /* ── the little account control in the header ── */
  function mountHeader(){
    var slot = document.querySelector('[data-account]');
    if(!slot) return;
    if(user){
      var initial = (user.email || '?').charAt(0).toUpperCase();
      var emailText = user.email || '';
      slot.innerHTML =
        '<div class="acct">' +
          '<button class="acct-btn" id="acctBtn" aria-label="Account menu" title="' + emailText + '">' + initial + '</button>' +
          '<div class="acct-menu" id="acctMenu">' +
            '<div class="acct-head">' +
              '<div class="acct-avatar">' + initial + '</div>' +
              '<div class="acct-user-info">' +
                '<span class="acct-em">' + emailText + '</span>' +
                '<span class="acct-tag">Verified Customer</span>' +
              '</div>' +
            '</div>' +
            '<div class="acct-links">' +
              '<a href="account.html" class="acct-link">' +
                '<span class="acct-link-title">My Account</span>' +
                '<span class="acct-link-sub">Profile, details & saved address</span>' +
              '</a>' +
              '<a href="track.html" class="acct-link">' +
                '<span class="acct-link-title">My Orders</span>' +
                '<span class="acct-link-sub">Track delivery & order history</span>' +
              '</a>' +
              '<a href="watchlist.html" class="acct-link">' +
                '<span class="acct-link-title">Saved Watchlist</span>' +
                '<span class="acct-link-sub">Items you have pinned to keep</span>' +
              '</a>' +
            '</div>' +
            '<div class="acct-foot">' +
              '<button class="acct-out-btn" id="acctOut">Sign Out</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      var btn = document.getElementById('acctBtn'), menu = document.getElementById('acctMenu');
      btn.addEventListener('click', function(e){ e.stopPropagation(); menu.classList.toggle('on'); });
      document.addEventListener('click', function(){ menu.classList.remove('on'); });
      document.getElementById('acctOut').addEventListener('click', signOut);
    } else {
      slot.innerHTML = '<button class="acct-in" id="acctIn">Sign in</button>';
      document.getElementById('acctIn').addEventListener('click', signIn);
    }
  }

  var css = document.createElement('style');
  css.textContent = [
    '.acct{position:relative;display:inline-flex;}',
    '.acct-btn{width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,.95);',
      'background:var(--ink,#00072D);color:#FFFFFF;cursor:pointer;display:inline-flex;align-items:center;',
      'justify-content:center;font-family:var(--f-sans,sans-serif);font-size:.84rem;font-weight:800;',
      'box-shadow:0 4px 12px rgba(0,7,45,.2);transition:transform .2s ease,box-shadow .2s ease;}',
    '.acct-btn:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,7,45,.3);}',
    '.acct-menu{position:absolute;left:-8px;top:calc(100% + 10px);width:260px;padding:.75rem;',
      'background:rgba(255,255,255,.94);border:1px solid rgba(0,7,45,.10);border-radius:20px;',
      'backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);',
      'box-shadow:0 24px 50px -12px rgba(0,7,45,.2), 0 4px 16px rgba(0,7,45,.06);',
      'opacity:0;visibility:hidden;transform:translateY(-8px) scale(0.96);',
      'transition:opacity .25s ease,transform .25s cubic-bezier(0.34,1.5,0.64,1),visibility .25s;z-index:9999;}',
    '.acct-menu.on{opacity:1;visibility:visible;transform:none;}',
    '@media(max-width:600px){.acct-menu{left:-16px;width:250px;}}',
    '.acct-head{display:flex;align-items:center;gap:.7rem;padding:.5rem .5rem .75rem;',
      'border-bottom:1px solid var(--line,#E4E4D8);margin-bottom:.45rem;}',
    '.acct-avatar{width:32px;height:32px;border-radius:50%;background:var(--ink,#00072D);color:#FFFFFF;',
      'display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.78rem;flex:none;}',
    '.acct-user-info{min-width:0;flex:1;}',
    '.acct-em{display:block;font-family:var(--f-mono,monospace);font-size:.65rem;font-weight:700;',
      'color:var(--ink,#00072D);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;}',
    '.acct-tag{display:inline-block;font-family:var(--f-mono,monospace);font-size:.52rem;',
      'letter-spacing:.08em;text-transform:uppercase;color:var(--live,#1F9268);font-weight:700;margin-top:2px;}',
    '.acct-links{display:flex;flex-direction:column;gap:3px;}',
    '.acct-link{display:block;padding:.55rem .65rem;border-radius:12px;text-decoration:none;',
      'transition:background .2s,transform .2s;}',
    '.acct-link:hover{background:rgba(0,7,45,.05);transform:translateX(2px);}',
    '.acct-link-title{display:block;font-family:var(--f-sans,sans-serif);font-size:.78rem;font-weight:700;',
      'color:var(--ink,#00072D);line-height:1.2;}',
    '.acct-link-sub{display:block;font-size:.64rem;color:var(--muted,#5A6072);margin-top:2px;}',
    '.acct-foot{border-top:1px solid var(--line,#E4E4D8);margin-top:.45rem;padding-top:.45rem;}',
    '.acct-out-btn{width:100%;text-align:left;padding:.55rem .65rem;background:none;border:none;',
      'cursor:pointer;border-radius:12px;font-family:var(--f-mono,monospace);font-size:.64rem;',
      'letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:#DC2626;transition:background .2s;}',
    '.acct-out-btn:hover{background:rgba(220,38,38,.08);}',
    '.acct-in{background:rgba(255,255,255,.85);border:1px solid var(--line,#E4E4D8);border-radius:999px;',
      'padding:.48rem 1.1rem;cursor:pointer;color:var(--ink,#00072D);font-family:var(--f-mono,monospace);',
      'font-size:.64rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;',
      'box-shadow:var(--sh-chip, 0 2px 8px rgba(0,7,45,.06));transition:all .2s;}',
    '.acct-in:hover{background:#FFFFFF;border-color:var(--ink,#00072D);}',
    '@media (max-width:640px){.acct-in{padding:.4rem .8rem;font-size:.56rem;}}'
  ].join('');
  document.head.appendChild(css);

  window.AimAccount = {
    me: me, signIn: signIn, signOut: signOut,
    user: function(){ return user; },
    pullWatch: pullWatch, pushWatch: pushWatch, myOrders: myOrders
  };

  me().then(function(){
    mountHeader();
    if(user) pullWatch();
    document.dispatchEvent(new CustomEvent('account:ready', { detail:{ user:user } }));
  });
})();

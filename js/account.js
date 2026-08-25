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
    A.raw.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.href.split('#')[0] }
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
      slot.innerHTML =
        '<div class="acct"><button class="acct-btn" id="acctBtn" aria-label="Account">' + initial + '</button>' +
        '<div class="acct-menu" id="acctMenu">' +
          '<span class="acct-em">' + (user.email || '') + '</span>' +
          '<a href="account.html">My account</a>' +
          '<a href="track.html">My orders</a>' +
          '<a href="watchlist.html">Watchlist</a>' +
          '<button id="acctOut">Sign out</button>' +
        '</div></div>';
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
    '.acct{position:relative;}',
    '.acct-btn{width:32px;height:32px;border-radius:50%;border:1px solid rgba(230,203,168,.35);',
      'background:rgba(255,255,255,.08);color:var(--text,#F2EDE3);cursor:pointer;',
      'font-family:var(--f-mono,monospace);font-size:.72rem;font-weight:700;}',
    '.acct-btn:hover{background:var(--gold,#E6CBA8);color:#050818;}',
    '.acct-menu{position:absolute;right:0;top:calc(100% + .5rem);min-width:186px;padding:.5rem;',
      'background:rgba(13,19,48,.92);border:1px solid rgba(255,255,255,.16);border-radius:12px;',
      'backdrop-filter:blur(26px) saturate(160%);-webkit-backdrop-filter:blur(26px) saturate(160%);',
      'box-shadow:0 20px 50px -20px rgba(0,0,0,.8);opacity:0;visibility:hidden;transform:translateY(-6px);',
      'transition:opacity .25s ease,transform .25s ease,visibility .25s;z-index:200;}',
    '.acct-menu.on{opacity:1;visibility:visible;transform:none;}',
    '.acct-em{display:block;padding:.45rem .6rem .6rem;font-family:var(--f-mono,monospace);font-size:.55rem;',
      'letter-spacing:.06em;color:rgba(242,237,227,.55);border-bottom:1px solid rgba(255,255,255,.12);',
      'margin-bottom:.35rem;overflow:hidden;text-overflow:ellipsis;}',
    '.acct-menu a,.acct-menu button{display:block;width:100%;text-align:left;padding:.55rem .6rem;',
      'background:none;border:none;cursor:pointer;border-radius:7px;text-decoration:none;',
      'font-family:var(--f-mono,monospace);font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;',
      'color:var(--text,#F2EDE3);}',
    '.acct-menu a:hover,.acct-menu button:hover{background:rgba(255,255,255,.10);color:var(--gold-hi,#F0DCC0);}',
    '.acct-in{background:none;border:1px solid rgba(230,203,168,.35);border-radius:999px;',
      'padding:.45rem 1rem;cursor:pointer;color:var(--text,#F2EDE3);',
      'font-family:var(--f-mono,monospace);font-size:.55rem;letter-spacing:.16em;text-transform:uppercase;}',
    '.acct-in:hover{border-color:var(--gold,#E6CBA8);color:var(--gold-hi,#F0DCC0);}',
    '@media (max-width:640px){.acct-in{padding:.4rem .75rem;font-size:.5rem;}}'
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

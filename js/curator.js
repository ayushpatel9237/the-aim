/* ═══════════════════════════════════════════════════════════
   ASCENTRA — CURATOR PORTAL logic
═══════════════════════════════════════════════════════════ */
(function(){
  var page = document.getElementById('page');
  var navRight = document.getElementById('navRight');
  var A = window.Ascentra;
  var fmt = function(n){ return '₹' + Number(n||0).toLocaleString('en-IN'); };

  /* not connected yet? show the owner what to do */
  if(!A || !A.configured()){
    page.innerHTML =
      '<div class="not-setup"><h2>Curator portal not connected yet</h2>' +
      '<p style="color:var(--muted);margin-top:.8rem">The database keys are missing. To switch this on:</p>' +
      '<ol>' +
        '<li>Create a free project at <b>supabase.com</b></li>' +
        '<li>SQL Editor → paste <code>curator-schema.sql</code> → Run</li>' +
        '<li>Project Settings → API → copy your <b>URL</b> + <b>anon key</b></li>' +
        '<li>Paste them into <code>js/config.js</code></li>' +
        '<li>Re-deploy — this page goes live</li>' +
      '</ol></div>';
    return;
  }

  var authMode = 'in'; // 'in' | 'up'

  /* ── router: decide what to show based on auth + curator status ── */
  async function route(){
    var user = await A.currentUser();
    if(!user){ renderAuth(); return; }

    var cur = await A.myCurator();
    if(!cur){ renderApply(user); return; }

    if(cur.status === 'pending')   { renderStatus('⏳','Application received','We\'re reviewing your application. You\'ll get dashboard access once approved.'); setNavSignOut(); return; }
    if(cur.status === 'rejected')  { renderStatus('—','Not approved','This application wasn\'t approved. Contact us if you think this is a mistake.'); setNavSignOut(); return; }
    if(cur.status === 'suspended') { renderStatus('⏸','Account paused','Your curator account is currently paused. Reach out to us for details.'); setNavSignOut(); return; }

    renderDashboard(cur);          // status === 'active'
    setNavSignOut();
  }

  function setNavSignOut(){
    navRight.innerHTML = '<a href="index.html">← Store</a><button id="signOut">Sign out</button>';
    document.getElementById('signOut').addEventListener('click', async function(){
      await A.signOut(); location.reload();
    });
  }

  /* ── AUTH (login / signup) ── */
  function renderAuth(){
    page.innerHTML =
      '<div style="text-align:center"><span class="eyebrow">Curator Portal</span>' +
      '<h1>Promote. <em>Earn.</em></h1>' +
      '<p class="sub" style="margin-left:auto;margin-right:auto">Share The AIM products with your audience and earn commission on every sale you bring in.</p></div>' +
      '<div class="auth-card">' +
        '<div class="tabs"><button class="tab '+(authMode==='in'?'on':'')+'" data-m="in">Log in</button>' +
        '<button class="tab '+(authMode==='up'?'on':'')+'" data-m="up">Sign up</button></div>' +
        '<div class="field"><label>Email</label><input id="a-email" type="email" placeholder="you@email.com" autocomplete="email" /></div>' +
        '<div class="field"><label>Password</label><input id="a-pass" type="password" placeholder="••••••••" autocomplete="'+(authMode==='up'?'new-password':'current-password')+'" /></div>' +
        '<button class="primary-btn" id="a-go">'+(authMode==='in'?'Log in':'Create account')+'</button>' +
        '<div class="or-divider"><span>or</span></div>' +
        '<button class="google-btn" id="a-google">' +
          '<svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z"/></svg>' +
          'Continue with Google</button>' +
        '<div class="msg" id="a-msg"></div>' +
      '</div>';

    document.querySelectorAll('.tab').forEach(function(t){
      t.addEventListener('click', function(){ authMode = t.dataset.m; renderAuth(); });
    });
    document.getElementById('a-go').addEventListener('click', doAuth);
    document.getElementById('a-google').addEventListener('click', function(){
      A.raw.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: location.href.split('#')[0] }
      });
    });
    document.getElementById('a-pass').addEventListener('keydown', function(e){ if(e.key==='Enter') doAuth(); });
  }

  async function doAuth(){
    var email = document.getElementById('a-email').value.trim();
    var pass  = document.getElementById('a-pass').value;
    var msg   = document.getElementById('a-msg');
    var btn   = document.getElementById('a-go');
    if(!email || pass.length < 6){ msg.className='msg err'; msg.textContent='Enter email and a 6+ char password.'; return; }
    btn.disabled = true; btn.textContent = '…';
    try{
      var res = authMode === 'up' ? await A.signUp(email, pass) : await A.signIn(email, pass);
      if(res.error) throw res.error;
      if(authMode === 'up' && !res.data.session){
        msg.className='msg ok'; msg.textContent='Check your email to confirm, then log in.';
        btn.disabled=false; btn.textContent='Create account'; return;
      }
      route();
    }catch(err){
      msg.className='msg err'; msg.textContent = err.message || 'Something went wrong.';
      btn.disabled=false; btn.textContent = authMode==='in'?'Log in':'Create account';
    }
  }

  /* ── APPLY (signed in, no curator profile yet) ── */
  function renderApply(user){
    page.innerHTML =
      '<div style="text-align:center"><span class="eyebrow">One step left</span>' +
      '<h1>Apply to <em>curate</em></h1>' +
      '<p class="sub" style="margin-left:auto;margin-right:auto">Tell us who you are. Once approved, you get your own link, coupon code, and dashboard.</p></div>' +
      '<div class="auth-card">' +
        '<div class="field"><label>Your name</label><input id="ap-name" placeholder="Full name" /></div>' +
        '<div class="field"><label>Instagram / channel (optional)</label><input id="ap-ig" placeholder="@yourhandle" /></div>' +
        '<button class="primary-btn" id="ap-go">Submit application</button>' +
        '<div class="msg" id="ap-msg"></div>' +
      '</div>';
    setNavSignOut();
    document.getElementById('ap-go').addEventListener('click', async function(){
      var name = document.getElementById('ap-name').value.trim();
      var msg = document.getElementById('ap-msg'); var btn = this;
      if(name.length < 2){ msg.className='msg err'; msg.textContent='Enter your name.'; return; }
      btn.disabled=true; btn.textContent='…';
      try{
        var res = await A.applyAsCurator({ name:name, instagram:document.getElementById('ap-ig').value.trim() });
        if(res.error) throw res.error;
        route();
      }catch(err){ msg.className='msg err'; msg.textContent=err.message||'Could not submit.'; btn.disabled=false; btn.textContent='Submit application'; }
    });
  }

  /* ── STATUS screens (pending / rejected / suspended) ── */
  function renderStatus(icon, title, text){
    page.innerHTML =
      '<div class="status-banner"><div class="icon">'+icon+'</div><h2>'+title+'</h2><p>'+text+'</p></div>';
  }

  /* ── DASHBOARD (active curator) ── */
  async function renderDashboard(cur){
    var site = location.origin + location.pathname.replace(/curator\.html$/, '');
    var refLink = site + 'index.html?ref=' + cur.ref_code;
    var available = cur.total_earned; // (minus already-paid — simplified; admin tracks payouts)

    var hour = new Date().getHours();
    var greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    var tier = cur.total_sales >= 100 ? 'Elite' : cur.total_sales >= 21 ? 'Pro Partner' : 'Starter';
    var nextAt = cur.total_sales >= 100 ? null : cur.total_sales >= 21 ? 100 : 21;
    var toNext = nextAt ? (nextAt - cur.total_sales) : 0;

    page.innerHTML =
      '<div class="dash-head">' +
        '<div><span class="eyebrow">'+greet+'</span>' +
        '<h1>'+cur.name.split(' ')[0]+'\'s <em>dashboard</em></h1>' +
        '<p class="sub">'+(nextAt ? toNext+' more sales to reach '+(nextAt===21?'Pro Partner':'Elite') : 'You\'ve reached the top tier.')+'</p></div>' +
        '<div class="tier-badge"><span class="t">'+tier+'</span><span class="s">Your tier</span></div>' +
      '</div>' +
      '<div class="stats">' +
        '<div class="stat"><div class="l">Status</div><div class="v" style="font-size:1.15rem;color:var(--live)">● Active</div></div>' +
        '<div class="stat"><div class="l">Sales brought</div><div class="v">'+cur.total_sales+'</div></div>' +
        '<div class="stat"><div class="l">Total earned</div><div class="v">'+fmt(cur.total_earned)+'</div></div>' +
        '<div class="stat"><div class="l">Commission</div><div class="v">'+cur.commission_pct+'<small>%</small></div></div>' +
      '</div>' +
      '<div class="how-card"><div class="how-t">How you earn</div><div class="how-steps">' +
        '<div class="how-s"><b>1</b> Share your link or code with your audience</div>' +
        '<div class="how-s"><b>2</b> They shop at THE AIM through it</div>' +
        '<div class="how-s"><b>3</b> You earn '+cur.commission_pct+'% of every sale, automatically</div>' +
        '<div class="how-s"><b>4</b> Request a payout any time</div>' +
      '</div></div>' +

      '<div class="panel"><h2>Your link & code</h2><div class="share">' +
        '<div class="share-box"><div class="k">Share this link</div><div class="val" id="refLink">'+refLink+'</div>' +
          '<button class="copy-btn" data-copy="refLink">Copy link</button></div>' +
        '<div class="share-box"><div class="k">Your coupon code</div><div class="val" id="refCode">'+cur.ref_code+'</div>' +
          '<button class="copy-btn" data-copy="refCode">Copy code</button></div>' +
      '</div></div>' +

      '<div class="panel"><h2>Your sales</h2><div id="salesWrap"><div class="empty-note">Loading…</div></div></div>' +

      '<div class="panel"><h2>Payouts</h2>' +
        '<div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-bottom:1.2rem">' +
          '<div style="font-family:var(--f-mono);font-size:.8rem;color:var(--muted)">Available: <b style="color:var(--gold-hi)">'+fmt(available)+'</b></div>' +
          '<button class="copy-btn" id="reqPayout" style="border-color:var(--gold);color:var(--gold-hi)">Request payout</button>' +
        '</div>' +
        '<div id="payoutsWrap"><div class="empty-note">Loading…</div></div>' +
      '</div>';

    /* copy buttons */
    document.querySelectorAll('[data-copy]').forEach(function(b){
      b.addEventListener('click', function(){
        var txt = document.getElementById(b.dataset.copy).textContent;
        navigator.clipboard.writeText(txt).then(function(){ b.textContent='Copied ✓'; setTimeout(function(){ b.textContent = b.dataset.copy==='refLink'?'Copy link':'Copy code'; }, 1500); });
      });
    });

    /* sales table */
    var sales = await A.mySales(cur.id);
    document.getElementById('salesWrap').innerHTML = sales.length
      ? '<table><thead><tr><th>Order</th><th>Date</th><th>Order total</th><th>You earned</th></tr></thead><tbody>' +
        sales.map(function(s){ return '<tr><td class="mono">'+s.order_id+'</td>' +
          '<td class="mono">'+new Date(s.created_at).toLocaleDateString('en-IN')+'</td>' +
          '<td class="mono">'+fmt(s.order_total)+'</td>' +
          '<td class="mono" style="color:var(--gold-hi)">'+fmt(s.commission)+'</td></tr>'; }).join('') +
        '</tbody></table>'
      : '<div class="empty-state"><div class="ico">◈</div><p>No sales yet — share your link to start earning</p></div>';

    /* payouts table */
    async function loadPayouts(){
      var ps = await A.myPayouts(cur.id);
      document.getElementById('payoutsWrap').innerHTML = ps.length
        ? '<table><thead><tr><th>Requested</th><th>Amount</th><th>Status</th></tr></thead><tbody>' +
          ps.map(function(p){ var pill = p.status==='paid'?'<span class="pill pill-live">✓ Paid</span>':'<span class="pill pill-wait">⏳ '+p.status+'</span>';
            return '<tr><td class="mono">'+new Date(p.requested_at).toLocaleDateString('en-IN')+'</td>' +
            '<td class="mono">'+fmt(p.amount)+'</td><td>'+pill+'</td></tr>'; }).join('') +
          '</tbody></table>'
        : '<div class="empty-state"><div class="ico">◇</div><p>No payout requests yet</p></div>';
    }
    loadPayouts();

    document.getElementById('reqPayout').addEventListener('click', async function(){
      if(available <= 0){ alert('Nothing available to withdraw yet.'); return; }
      var method = prompt('Enter your UPI ID or bank details for this payout of ' + fmt(available) + ':');
      if(!method) return;
      var res = await A.requestPayout(cur.id, available, method);
      if(res.error){ alert('Could not request: ' + res.error.message); return; }
      alert('Payout requested ✓ — we\'ll process it soon.');
      loadPayouts();
    });
  }

  route();
})();

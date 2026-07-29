/* ═══════════════════════════════════════════════════════════
   THE AIM — DROPPING NEXT (poll + watchlist)
   Customers vote "I want this" and heart items to a watchlist.
   Stored locally for now (survives refresh); when we add a backend
   these same calls point at the database instead — the UI won't change.
   Requires: js/upcoming-data.js
═══════════════════════════════════════════════════════════ */
(function(){
  if(typeof UPCOMING === 'undefined') return;

  var VKEY = 'ascentra_votes_v1';   // which items THIS visitor voted for
  var WKEY = 'ascentra_watch_v1';   // this visitor's watchlist
  var CKEY = 'ascentra_votecount_v1'; // simulated running totals (backend later)

  function load(k, def){ try{ return JSON.parse(localStorage.getItem(k)) || def; }catch(e){ return def; } }
  function save(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }

  var myVotes = load(VKEY, {});     // { id: true }
  var myWatch = load(WKEY, {});     // { id: true }
  // seed baseline counts once so the bars aren't empty on a fresh browser
  var counts  = load(CKEY, null);
  if(!counts){
    counts = {};
    var seed = [47, 31, 58, 22, 39, 26];
    UPCOMING.forEach(function(u,i){ counts[u.id] = seed[i % seed.length]; });
    save(CKEY, counts);
  }

  window.AscentraWatch = {
    count: function(){ return Object.keys(myWatch).length; },
    list:  function(){ return Object.keys(myWatch); }
  };

  var mount = document.getElementById('upcoming');
  if(!mount) return;

  function totalVotes(){
    return UPCOMING.reduce(function(s,u){ return s + (counts[u.id]||0); }, 0) || 1;
  }

  function render(){
    var tv = totalVotes();
    mount.innerHTML = UPCOMING.map(function(u){
      var c = counts[u.id] || 0;
      var pct = Math.round(c / tv * 100);
      var voted = !!myVotes[u.id];
      var watched = !!myWatch[u.id];
      return '<div class="up-card" data-id="'+u.id+'">' +
        '<div class="up-img">' +
          '<img src="'+u.img+'" alt="'+u.name+'" loading="lazy" />' +
          '<button class="up-heart'+(watched?' on':'')+'" data-watch aria-label="Save to watchlist" aria-pressed="'+watched+'">'+
            (watched?'♥':'♡')+'</button>' +
        '</div>' +
        '<div class="up-body">' +
          '<span class="up-cat">'+u.category+'</span>' +
          '<span class="up-nm">'+u.name+'</span>' +
          '<span class="up-teaser">'+u.teaser+'</span>' +
          '<div class="up-barwrap"><div class="up-bar" style="width:'+pct+'%"></div></div>' +
          '<div class="up-stat">' +
            '<span class="up-pct">'+pct+'% want it</span>' +
            '<button class="up-vote'+(voted?' voted':'')+'" data-vote>'+
              (voted ? '✓ Voted' : 'I want this')+'</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    // header watchlist badge
    document.querySelectorAll('[data-watch-count]').forEach(function(el){
      var n = AscentraWatch.count();
      el.textContent = n; el.classList.toggle('has', n>0);
    });
  }

  mount.addEventListener('click', function(e){
    var card = e.target.closest('.up-card'); if(!card) return;
    var id = card.dataset.id;

    if(e.target.closest('[data-vote]')){
      if(myVotes[id]){                       // toggle off
        myVotes[id] = false; delete myVotes[id];
        counts[id] = Math.max(0, (counts[id]||1) - 1);
      } else {
        myVotes[id] = true;
        counts[id] = (counts[id]||0) + 1;
      }
      save(VKEY, myVotes); save(CKEY, counts);
      render();
    }
    if(e.target.closest('[data-watch]')){
      if(myWatch[id]){ delete myWatch[id]; }
      else { myWatch[id] = true; toastW(card.querySelector('.up-nm').textContent + ' added to your watchlist'); }
      save(WKEY, myWatch);
      render();
    }
  });

  /* tiny toast (reuses cart toast if present, else makes its own) */
  function toastW(msg){
    var t = document.querySelector('.cart-toast');
    if(!t){
      t = document.createElement('div'); t.className = 'cart-toast'; document.body.appendChild(t);
    }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._wt); t._wt = setTimeout(function(){ t.classList.remove('show'); }, 2400);
  }

  render();
})();

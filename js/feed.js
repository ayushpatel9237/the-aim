/* ═══════════════════════════════════════════════════════════
   THE AIM — THE FEED (Things That You are gone USE)
   14 products filmed in full. Real MP4s and poster frames.
   ═══════════════════════════════════════════════════════════ */
const FEED = [
  {
    video: "videos/Butterfly Phone Stand.MP4",
    poster: "poster-image/22_butterfly_phone_stand_04.thumb.webp",
    name: "Butterfly Phone Stand",
    price: "₹499",
    stock: "In stock",
    shop: "22_butterfly_phone_stand"
  },
  {
    video: "videos/Magnetic Pocket Phone Stand.MP4",
    poster: "poster-image/11_magnetic_pocket_phone_stand_hero.webp",
    name: "Magnetic Pocket Phone Stand",
    price: "₹499",
    stock: "In stock",
    shop: "11_magnetic_pocket_phone_stand"
  },
  {
    video: "videos/Type-C Docking Station Stand.MP4",
    poster: "poster-image/12_typec_docking_station_stand_01.webp",
    name: "Type-C Docking Station Stand",
    price: "₹1,499",
    stock: "In stock",
    shop: "12_typec_docking_station_stand"
  },
  {
    video: "videos/Wooden Coaster Set.MP4",
    poster: "poster-image/13_wooden_coaster_set_02.thumb.webp",
    name: "Wooden Coaster Set",
    price: "₹399",
    stock: "In stock",
    shop: "13_wooden_coaster_set"
  },
  {
    video: "videos/Gift Pack Cable Storage Box.MP4",
    poster: "poster-image/14_gift_pack_cable_storage_box_03.thumb.webp",
    name: "Gift Pack Cable Storage Box",
    price: "₹599",
    stock: "In stock",
    shop: "14_gift_pack_cable_storage_box"
  },
  {
    video: "videos/AI Face-Tracking Selfie Stick.MP4",
    poster: "poster-image/21_ai_face_tracking_selfie_stick_03.thumb.webp",
    name: "AI Face-Tracking Selfie Stick",
    price: "₹1,499",
    stock: "3 left",
    isLow: true,
    shop: "21_ai_face_tracking_selfie_stick"
  },
  {
    video: "videos/Foldable Bluetooth Keyboard.MP4",
    poster: "poster-image/26_foldable_bluetooth_keyboard_02.thumb.webp",
    name: "Foldable Bluetooth Keyboard",
    price: "₹1,799",
    stock: "In stock",
    shop: "26_foldable_bluetooth_keyboard"
  },
  {
    video: "videos/Magnetic Multi-Device Holder.MP4",
    poster: "poster-image/magnetic_multi_device_holder_04.thumb.webp",
    name: "Magnetic Multi-Device Holder",
    price: "₹799",
    stock: "In stock",
    shop: "19_magnetic_multi_device_holder"
  },
  {
    video: "videos/Photography Fill Light Stand.MP4",
    poster: "poster-image/27_photography_fill_light_stand_hero.thumb.webp",
    name: "Photography Fill Light Stand",
    price: "₹1,299",
    stock: "In stock",
    shop: "27_photography_fill_light_stand"
  },
  {
    video: "videos/AI Face-Tracking Phone Bracket.MP4",
    poster: "poster-image/28_ai_face_tracking_phone_bracket_hero.webp",
    name: "AI Face-Tracking Phone Bracket",
    price: "₹1,699",
    stock: "In stock",
    shop: "28_ai_face_tracking_phone_bracket"
  },
  {
    video: "videos/Flexible Deformable Device Stand.MP4",
    poster: "poster-image/flexible_deformable_device_stand_04.webp",
    name: "Flexible Deformable Device Stand",
    price: "₹599",
    stock: "In stock",
    shop: "06_flexible_deformable_device_stand"
  },
  {
    video: "videos/240W Folding Stand Cable.MP4",
    poster: "poster-image/240w_folding_stand_data_cable_03.thumb.webp",
    name: "240W Folding Stand Cable",
    price: "₹499",
    stock: "In stock",
    shop: "08_240w_folding_stand_data_cable"
  },
  {
    video: "videos/Large Capacity Travel Tote Bag.MP4",
    poster: "poster-image/large_capacity_travel_tote_bag_02.thumb.webp",
    name: "Large Capacity Travel Tote Bag",
    price: "₹899",
    stock: "In stock",
    shop: "18_large_capacity_travel_tote_bag"
  },
  {
    video: "videos/Nail Art Steel Plates.MP4",
    poster: "poster-image/23_nail_art_steel_plates_hero.thumb.webp",
    name: "Nail Art Steel Plates",
    price: "₹349",
    stock: "In stock",
    shop: "23_nail_art_steel_plates"
  }
];

(function(){
  var mount = document.getElementById('feed');
  if(!mount) return;

  // 1. Render clean square poster cards (no text, no badges, identical to opening featured films)
  function render(){
    mount.innerHTML = FEED.map(function(f, i){
      return '<div class="reel" data-i="'+i+'" role="button" tabindex="0" aria-label="Watch '+f.name+' film">' +
        '<img class="poster" src="'+f.poster+'" alt="'+f.name+'" loading="lazy" />' +
      '</div>';
    }).join('');
  }
  render();

  // 2. Full-screen Story Viewer Overlay
  var stView = document.getElementById('stView');
  if(!stView){
    stView = document.createElement('div');
    stView.id = 'stView';
    stView.className = 'st-view';
    document.body.appendChild(stView);
  }

  var curIdx = 0;
  var isMuted = false;
  var held = false;
  var holdTimer = null;
  var startX = 0;
  var startY = 0;
  var startT = 0;
  var currentVid = null;

  function openStory(index){
    curIdx = Math.max(0, Math.min(FEED.length - 1, index));
    document.body.classList.add('st-open');
    document.addEventListener('keydown', onKeyDown);
    renderStory();
    requestAnimationFrame(function(){
      stView.classList.add('on');
    });
  }

  function closeStory(){
    clearTimeout(holdTimer);
    document.removeEventListener('keydown', onKeyDown);
    stView.classList.remove('on');
    document.body.classList.remove('st-open');
    if(currentVid){
      currentVid.pause();
      currentVid.src = '';
      currentVid = null;
    }
    setTimeout(function(){
      if(!stView.classList.contains('on')){
        stView.innerHTML = '';
      }
    }, 320);
  }

  function nextStory(){
    if(curIdx < FEED.length - 1){
      curIdx++;
      renderStory();
    } else {
      closeStory();
    }
  }

  function prevStory(){
    if(curIdx > 0){
      curIdx--;
      renderStory();
    }
  }

  function onKeyDown(e){
    if(e.key === 'Escape') closeStory();
    else if(e.key === 'ArrowRight') nextStory();
    else if(e.key === 'ArrowLeft') prevStory();
    else if(e.key === ' '){
      e.preventDefault();
      togglePlay();
    }
  }

  function togglePlay(){
    if(!currentVid) return;
    var playBtn = stView.querySelector('#stPlay');
    if(currentVid.paused){
      currentVid.play().catch(function(){});
      if(playBtn){
        playBtn.innerHTML = '▶';
        playBtn.classList.add('show');
        setTimeout(function(){ playBtn.classList.remove('show'); }, 600);
      }
    } else {
      currentVid.pause();
      if(playBtn){
        playBtn.innerHTML = '⏸';
        playBtn.classList.add('show');
      }
    }
  }

  function renderStory(){
    clearTimeout(holdTimer);
    var f = FEED[curIdx];
    if(!f) return;

    var p = (typeof PRODUCTS !== 'undefined') && PRODUCTS.find(function(x){ return x.id === f.shop; });
    var th = p ? (p.thumb || p.hero) : f.poster;
    var pr = p ? ('₹' + Number(p.price).toLocaleString('en-IN')) : f.price;
    var nm = p ? p.name : f.name;

    var topHTML = '<div class="st-top">' +
      '<div class="st-brand-row">' +
        '<span class="st-brand-title">THE AIM</span>' +
        '<span class="st-brand-pill">' + (curIdx + 1) + ' / ' + FEED.length + '</span>' +
      '</div>' +
      '<div class="st-top-actions">' +
        '<button class="st-mute" id="stMute" aria-label="Toggle sound">' + (isMuted ? '🔇' : '🔊') + '</button>' +
        '<button class="st-close" id="stClose" aria-label="Close">✕</button>' +
      '</div>' +
    '</div>';

    var videoSrc = encodeURI(f.video);
    var mediaHTML = '<video id="stVid" src="' + videoSrc + '" poster="' + f.poster + '" autoplay playsinline ' + (isMuted ? 'muted' : '') + ' preload="auto"></video>';

    var ctaHTML = '<div class="st-foot">' +
      '<div class="st-buy-card" id="stBuy">' +
        '<div class="st-th"><img src="' + th + '" alt="' + nm + '" /></div>' +
        '<div class="st-info">' +
          '<div class="st-name">' + nm + '</div>' +
          '<div class="st-price">' + pr + '</div>' +
        '</div>' +
        '<div class="st-cta">Shop now →</div>' +
      '</div>' +
    '</div>';

    stView.innerHTML = '<div class="st-stage" id="stStage">' +
      mediaHTML +
      topHTML +
      '<div class="st-seek-indicator seek-back" id="seekBack"><span>↺ 5s</span></div>' +
      '<div class="st-seek-indicator seek-fwd" id="seekFwd"><span>5s ↻</span></div>' +
      '<button class="st-play-btn" id="stPlay" aria-label="Play or pause">▶</button>' +
      ctaHTML +
    '</div>';

    var vid = stView.querySelector('#stVid');
    currentVid = vid;
    var muteBtn = stView.querySelector('#stMute');
    var closeBtn = stView.querySelector('#stClose');
    var buyBtn = stView.querySelector('#stBuy');
    var playBtn = stView.querySelector('#stPlay');
    var stage = stView.querySelector('#stStage');
    var seekBackEl = stView.querySelector('#seekBack');
    var seekFwdEl = stView.querySelector('#seekFwd');

    function flashSeek(el){
      if(!el) return;
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
      setTimeout(function(){ el.classList.remove('flash'); }, 600);
    }

    function seekBackward(){
      if(!vid) return;
      vid.currentTime = Math.max(0, vid.currentTime - 5);
      flashSeek(seekBackEl);
    }

    function seekForward(){
      if(!vid) return;
      vid.currentTime = Math.min(vid.duration || 999, vid.currentTime + 5);
      flashSeek(seekFwdEl);
    }

    // Autoplay handling
    if(vid){
      var playPromise = vid.play();
      if(playPromise !== undefined){
        playPromise.catch(function(){
          vid.muted = true;
          isMuted = true;
          if(muteBtn) muteBtn.textContent = '🔇';
          vid.play().catch(function(){});
        });
      }

      vid.addEventListener('ended', function(){
        nextStory();
      });
    }

    // Controls
    if(closeBtn) closeBtn.addEventListener('click', function(e){ e.stopPropagation(); closeStory(); });

    if(muteBtn) muteBtn.addEventListener('click', function(e){
      e.stopPropagation();
      isMuted = !isMuted;
      if(vid) vid.muted = isMuted;
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    if(playBtn) playBtn.addEventListener('click', function(e){
      e.stopPropagation();
      togglePlay();
    });

    if(buyBtn) buyBtn.addEventListener('click', function(e){
      e.stopPropagation();
      closeStory();
      setTimeout(function(){
        if(p && window.AscentraSheet && window.AscentraSheet.open){
          window.AscentraSheet.open(p);
        } else if(f.shop){
          window.location.href = 'product.html?id=' + f.shop;
        }
      }, 200);
    });

    // Tap to pause, 5s seek, and swipe gesture handlers
    if(stage){
      stage.addEventListener('touchstart', function(e){
        if(e.target.closest('.st-top-actions, .st-foot, .st-play-btn')) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startT = Date.now();
      }, {passive:true});

      stage.addEventListener('touchend', function(e){
        if(e.target.closest('.st-top-actions, .st-foot, .st-play-btn')) return;
        var endX = e.changedTouches[0].clientX;
        var endY = e.changedTouches[0].clientY;
        var dx = endX - startX;
        var dy = endY - startY;
        var elapsed = Date.now() - startT;

        // Swipe Down to dismiss
        if(dy > 80 && Math.abs(dy) > Math.abs(dx)){
          closeStory();
          return;
        }

        // Swipe Left/Right to change story
        if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && elapsed < 700){
          if(dx < 0) nextStory();
          else prevStory();
          return;
        }

        // Tap detected (minimal movement)
        if(Math.abs(dx) < 16 && Math.abs(dy) < 16 && elapsed < 450){
          var rect = stage.getBoundingClientRect();
          var relX = (endX - rect.left) / rect.width;

          if(relX < 0.32){
            seekBackward();
          } else if(relX > 0.68){
            seekForward();
          } else {
            togglePlay();
          }
        }
      }, {passive:true});

      // Desktop Click handling (Seek left/right or toggle play in center)
      stage.addEventListener('click', function(e){
        if(e.target.closest('.st-top-actions, .st-foot, .st-play-btn')) return;
        var rect = stage.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width;

        if(relX < 0.32){
          seekBackward();
        } else if(relX > 0.68){
          seekForward();
        } else {
          togglePlay();
        }
      });
    }

    // Click backdrop outside stage to close
    stView.onclick = function(e){
      if(e.target === stView) closeStory();
    };
  }

  // Tap reel card to open story
  mount.addEventListener('click', function(e){
    var reel = e.target.closest('.reel');
    if(!reel) return;
    var i = +reel.dataset.i;
    openStory(i);
  });

  mount.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){
      var reel = e.target.closest('.reel');
      if(!reel) return;
      e.preventDefault();
      var i = +reel.dataset.i;
      openStory(i);
    }
  });
})();

/* feed rail arrows */
(function(){
  var scroll = document.getElementById('feed');
  var prev = document.getElementById('feedPrev');
  var next = document.getElementById('feedNext');
  if(!scroll || !prev || !next) return;
  function step(dir){
    var card = scroll.querySelector('.reel');
    var amt = card ? card.offsetWidth + 18 : 240;
    scroll.scrollBy({ left: dir * amt * 1.5, behavior: 'smooth' });
  }
  prev.addEventListener('click', function(){ step(-1); });
  next.addEventListener('click', function(){ step(1); });
})();


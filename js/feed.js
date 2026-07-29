/* ═══════════════════════════════════════════════════════════
   THE AIM — THE FEED
   Your reels / product videos on the homepage. Each entry:
     video : Instagram / Facebook / YouTube link OR "videos/x.mp4"
     poster: a still image shown before play (use a product photo)
     name  : caption shown on the reel
     shop  : product id to link "Shop this →" (optional)
   Add/remove freely. Requires js/video.js and js/products-data.js.
═══════════════════════════════════════════════════════════ */
const FEED = [
  {
    video: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    poster: "images/products/22_butterfly_phone_stand_hero.thumb.webp",
    name: "Butterfly Phone Stand — in use",
    shop: "22_butterfly_phone_stand"
  },
  {
    video: "",
    poster: "images/products/01_starry_sky_moon_lamp_hero.thumb.webp",
    name: "Starry Sky Moon Lamp",
    shop: "01_starry_sky_moon_lamp"
  },
  {
    video: "",
    poster: "images/products/20_magnetic_neck_fan_hero.thumb.webp",
    name: "Magnetic Neck Fan",
    shop: "20_magnetic_neck_fan"
  },
  {
    video: "",
    poster: "images/products/21_ai_face_tracking_selfie_stick_hero.thumb.webp",
    name: "AI Face-Tracking Selfie Stick",
    shop: "21_ai_face_tracking_selfie_stick"
  },
  {
    video: "",
    poster: "images/products/26_foldable_bluetooth_keyboard_hero.thumb.webp",
    name: "Foldable Bluetooth Keyboard",
    shop: "26_foldable_bluetooth_keyboard"
  }
];

(function(){
  var mount = document.getElementById('feed');
  if(!mount || typeof FEED === 'undefined') return;

  mount.innerHTML = FEED.map(function(f, i){
    var shopBtn = f.shop
      ? '<a class="rbtn" href="product.html?id='+f.shop+'">Shop this →</a>' : '';
    var name = '<span class="rname">'+f.name+'</span>';
    return '<div class="reel" data-i="'+i+'">' +
      '<img class="poster" src="'+f.poster+'" alt="'+f.name+'" loading="lazy" />' +
      (f.video ? '<button class="rplay" data-play aria-label="Play video">▶</button>' : '') +
      '<div class="rshop">'+name+shopBtn+'</div>' +
    '</div>';
  }).join('');

  mount.addEventListener('click', function(e){
    var btn = e.target.closest('[data-play]'); if(!btn) return;
    var reel = e.target.closest('.reel');
    var f = FEED[+reel.dataset.i];
    if(!f.video) return;
    // swap poster + play button for the actual video
    reel.querySelector('.poster').remove();
    btn.remove();
    var holder = document.createElement('div');
    holder.style.cssText = 'position:absolute;inset:0;';
    holder.innerHTML = window.AscentraVideo
      ? AscentraVideo.embedHTML(f.video)
      : '<video src="'+f.video+'" controls autoplay playsinline style="width:100%;height:100%;object-fit:cover"></video>';
    reel.prepend(holder);
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
    var amt = card ? card.offsetWidth + 21 : 280;
    scroll.scrollBy({ left: dir*amt*1.2, behavior:'smooth' });
  }
  prev.addEventListener('click', function(){ step(-1); });
  next.addEventListener('click', function(){ step(1); });
})();

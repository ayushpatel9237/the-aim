/* ═══════════════════════════════════════════════════════════
   ASCENTRA VIDEO
   One helper that understands any video source you paste into a
   product's `video` field:

     Instagram :  "https://www.instagram.com/reel/ABC123/"
     Facebook  :  "https://www.facebook.com/.../videos/123456/"
     YouTube   :  "https://youtu.be/XYZ"  or  full watch?v= link
     Your file :  "videos/butterfly-stand.mp4"

   Add a video to any product in products-data.js like:
     "video": "https://www.instagram.com/reel/ABC123/"
   Leave it out and the product simply shows photos only.
═══════════════════════════════════════════════════════════ */
window.AscentraVideo = (function(){

  function kind(url){
    if(!url) return null;
    if(/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'file';
    if(/instagram\.com/i.test(url))         return 'instagram';
    if(/facebook\.com|fb\.watch/i.test(url))return 'facebook';
    if(/youtu\.be|youtube\.com/i.test(url)) return 'youtube';
    return 'file'; // assume a local/hosted file
  }

  function ytId(url){
    var m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  /* returns an HTML string that plays the video, sized to fill its box */
  function embedHTML(url){
    var k = kind(url);
    if(k === 'file'){
      return '<video src="'+url+'" controls playsinline preload="metadata" ' +
             'style="width:100%;height:100%;object-fit:cover;background:#000;"></video>';
    }
    if(k === 'youtube'){
      var id = ytId(url);
      if(id) return frame('https://www.youtube-nocookie.com/embed/'+id+'?rel=0&playsinline=1&autoplay=1&modestbranding=1');
    }
    if(k === 'instagram'){
      var clean = url.split('?')[0].replace(/\/$/,'');
      return frame(clean + '/embed');
    }
    if(k === 'facebook'){
      return frame('https://www.facebook.com/plugins/video.php?href=' +
                   encodeURIComponent(url) + '&show_text=false');
    }
    /* fallback: just open the link */
    return '<a href="'+url+'" target="_blank" rel="noopener" ' +
           'style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;background:#000;color:#F0DCC0;font-family:monospace;letter-spacing:.1em">▶ Watch video</a>';
  }

  function frame(src){
    return '<iframe src="'+src+'" allowfullscreen loading="lazy" ' +
           'allow="autoplay; encrypted-media; picture-in-picture" ' +
           'style="width:100%;height:100%;border:0;background:#000;"></iframe>';
  }

  return { kind:kind, embedHTML:embedHTML };
})();

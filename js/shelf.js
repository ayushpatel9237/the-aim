// Ascentra shelf card renderer (shared by shop.html and product.html)
function shelfFmt(n){ return '₹' + n.toLocaleString('en-IN'); }
function shelfCard(p){
  return '<a href="product.html?id='+p.id+'" class="pcase">' +
    '<div class="pimg">' +
      '<img src="'+(p.thumb||p.hero)+'" alt="'+p.name+'" loading="lazy" width="500" height="500" />' +
      (p.video ? '<span class="vbadge">▶ Video</span>' : '') +
    '</div>' +
    '<div class="ticket">' +
      '<span class="cat">'+p.category+'</span>' +
      '<span class="nm">'+p.name+'</span>' +
      '<span class="pr">'+shelfFmt(p.price)+'</span>' +
      '<span class="go">Buy now →</span>' +
    '</div>' +
    '</a>';
}

/* V3 « Volets » : MAISON 52 en grand, la video dans les lettres,
   puis le calque s'ouvre comme un store, depuis la ligne du titre du site : les lames se replient l'une apres l'autre
   vers les bords. Une ligne de lettres n'est jamais coupee entre deux lames : elle est effacee d'un seul trait net. */
H3.quandPret(function(){
  var c=H3.calque('clair'),intro=c.intro,mot=c.mot;
  mot.style.fontSize=H3.ajuste(mot,innerWidth*.88)+'px';
  /* D : repli d'une lame ; P : decalage d'une lame a la suivante, de la ligne vers les bords ;
     courbe : la fente s'ouvre tout de suite (pas de fil au depart) et la lame accelere jusqu'au bout (pas de fil a la fin) */
  var D=420,P=55,COURBE='cubic-bezier(.3,.24,.8,.5)',lames=[],tPret=0,tFin=0;
  if(!H3.reduit){
    var H=intro.clientHeight,bandes=encre(mot),t=encre(document.querySelector('#hero-ui h1'));
    var tA=Math.min.apply(0,t.map(function(d){return d[0]})),tB=Math.max.apply(0,t.map(function(d){return d[1]}));
    var h0=H/(innerWidth>860?6:8),m=Math.round(H*.008)+2,blocs=[];
    /* blocs de lettres (une ligne + une petite marge ; deux lignes qui se touchent ne font qu'un bloc) */
    bandes.map(function(d){return [Math.max(0,Math.round(d[0])-m),Math.min(H,Math.round(d[1])+m)]})
      .sort(function(x,y){return x[0]-y[0]}).forEach(function(d){var z=blocs[blocs.length-1];
        if(z&&d[0]<=z[1])z[1]=Math.max(z[1],d[1]);else blocs.push(d);});
    /* ligne d'ouverture = milieu du titre du site ; si elle tombe pres du bord d'un bloc de lettres, elle se cale dessus (le mot n'est pas barre) */
    var Y=Math.round(Math.min(Math.max((tA+tB)/2,H*.2),H*.8));
    blocs.forEach(function(d){if(Y>d[0]&&Y<d[1]&&Math.min(Y-d[0],d[1]-Y)<h0*.5)Y=(Y-d[0]<d[1]-Y)?d[0]:d[1];});
    intro.removeChild(mot);intro.classList.add('en-volets');
    [cote(Y,0),cote(Y,H)].forEach(function(cs){
      var r=0,s=cs[1]>cs[0]?1:-1;
      for(var i=0;i<cs.length-1;i++){
        var a=Math.min(cs[i],cs[i+1]),b=Math.max(cs[i],cs[i+1]),v=document.createElement('div');
        v.className='volet';v.style.top=a+'px';
        /* la derniere lame tient le bas de l'ecran (si la barre de Safari se replie, pas de jour en bas) */
        if(b===H)v.style.bottom='0';else v.style.height=(b-a)+'px';
        var p=document.createElement('div');p.className='plan';p.style.top=(-a)+'px';p.style.height=H+'px';
        p.appendChild(mot.cloneNode(true));v.appendChild(p);intro.appendChild(v);
        /* la lame se replie vers le bord de l'ecran (au-dessus de la ligne elle remonte, en dessous elle descend) ;
           mais si ses lettres sont surtout cote bord, elle se replie vers la ligne : ses lettres partent d'abord,
           il ne reste qu'une bande blanche (pas de demi-lettres qui flottent) */
        var mi=(a+b)/2,cB=0,cL=0;
        bandes.forEach(function(d){var u=Math.max(d[0],a),w=Math.min(d[1],b);if(w<=u)return;
          var x=Math.min(Math.max(mi,u),w);if(s<0){cB+=x-u;cL+=w-x;}else{cL+=x-u;cB+=w-x;}});
        var monte=(cB>1.5*cL)?s>0:s<0;
        /* si la lame finit sur des lettres (dernier tiers du repli), ce dernier morceau se dissout pendant qu'il se replie :
           pas de tranche de lettres nette qui flotte entre deux ouvertures */
        var e=(b-a)*.3,u=monte?a:b-e,w=monte?a+e:b,fond=bandes.some(function(d){return d[1]>u&&d[0]<w});
        lames.push({el:v,monte:monte,r:r,fond:fond});tFin=Math.max(tFin,r+D);
        /* le titre parait quand les lames autour de lui sont entierement repliees : il nait sur une image propre */
        if(b>tA-h0*.5&&a<tB+h0*.5)tPret=Math.max(tPret,r+D);
        r+=P;
      }
    });
  }
  H3.montre();
  setTimeout(function(){
    if(H3.reduit){intro.style.transition='opacity .45s ease';intro.style.opacity=0;
      setTimeout(H3.pret,300);setTimeout(function(){H3.fini(intro)},600);return;}
    lames.forEach(function(l){var ferme=l.monte?'inset(0 0 100% 0)':'inset(100% 0 0 0)';
      l.el.style.transition='clip-path '+D+'ms '+COURBE+' '+l.r+'ms,-webkit-clip-path '+D+'ms '+COURBE+' '+l.r+'ms'+
        (l.fond?',opacity '+Math.round(D*.4)+'ms cubic-bezier(.45,0,.55,1) '+(l.r+Math.round(D*.45))+'ms':'');
      l.el.style.webkitClipPath=ferme;l.el.style.clipPath=ferme;if(l.fond)l.el.style.opacity=0;});
    setTimeout(H3.pret,Math.round(tPret));
    setTimeout(function(){H3.fini(intro)},tFin+40);
  },1000);
  /* coupes de la ligne d'ouverture Y vers le bord : lames d'environ h0 ; une ligne de lettres n'est jamais coupee
     (sa lame va jusqu'au bout de la ligne) ; au-dela des lettres, le blanc qui reste est reparti en lames egales */
  function cote(Y,fin){
    var s=fin>Y?1:-1,cs=[Y],cur=Y,bord=Y,i,n;
    function dans(x){for(var j=0;j<blocs.length;j++)if(x>blocs[j][0]&&x<blocs[j][1])return blocs[j];return null;}
    while(cur!==fin){
      var nxt=Math.round(cur+s*h0),d=dans(nxt);
      if(s*(fin-nxt)<h0*.5)nxt=fin;
      else if(d){var loin=s>0?d[1]:d[0];nxt=s*(fin-loin)<h0*.5?fin:loin;}
      cs.push(nxt);cur=nxt;}
    blocs.forEach(function(d){if(d[1]>Math.min(Y,fin)&&d[0]<Math.max(Y,fin))bord=s>0?Math.max(bord,d[1]):Math.min(bord,d[0]);});
    for(i=0;i<cs.length&&s*(cs[i]-bord)<0;i++);
    if(i<cs.length-1){var a=cs[i];cs.length=i+1;n=Math.max(1,Math.round(Math.abs(fin-a)/h0));
      for(var k=1;k<=n;k++)cs.push(k===n?fin:Math.round(a+s*k*Math.abs(fin-a)/n));}
    return cs;}
  /* haut et bas de l'encre de chaque ligne (pas de la boite) : ligne de base mesuree + dessin des lettres */
  function encre(el){
    var em=el.querySelector('em'),cs=getComputedStyle(el),cx=document.createElement('canvas').getContext('2d'),out=[];
    function ligne(texte,parent,avant,taille){
      var s=document.createElement('span');s.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';
      parent.insertBefore(s,avant);var base=s.getBoundingClientRect().bottom;parent.removeChild(s);
      cx.font=cs.fontWeight+' '+taille+' '+cs.fontFamily;texte=texte.trim();
      if(getComputedStyle(parent).textTransform==='uppercase')texte=texte.toUpperCase();
      var q=cx.measureText(texte);
      if(q.actualBoundingBoxAscent)out.push([base-q.actualBoundingBoxAscent,base+q.actualBoundingBoxDescent]);}
    ligne(el.textContent.replace(em?em.textContent:'',''),el,em,cs.fontSize);
    if(em)ligne(em.textContent,em,null,getComputedStyle(em).fontSize);
    if(!out.length){var r=el.getBoundingClientRect();out.push([r.top,r.bottom]);}
    return out;}
});

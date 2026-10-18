/* V2 « Portes » : MAISON 52 en grand, la video dans les lettres, puis le calque se fend au milieu
   et s'ouvre comme une double porte (echo de la porte de la maison qui s'ouvre dans la video). */
H3.quandPret(function(){
  var c=H3.calque('clair'),g=c.intro,mot=c.mot,v=document.getElementById('hero-video');
  g.classList.add('v2p');
  mot.style.fontSize=H3.ajuste(mot,innerWidth*.88)+'px';
  var W=document.documentElement.clientWidth,r=window.devicePixelRatio||1,d=null,x=W/2;
  function clip(el,s){el.style.webkitClipPath=s;el.style.clipPath=s;}
  if(!H3.reduit){
    /* second battant : meme calque, coupe net pres du milieu, calee sur un pixel physique (pas de couture) */
    d=g.cloneNode(true);d.id='intro-d';document.body.appendChild(d);
    x=coupe(mot,W,r);clip(g,'inset(0 '+(W-x)+'px 0 0)');clip(d,'inset(0 0 0 '+x+'px)');
  }
  /* video sans image : les lettres seraient noires puis rempliraient d'un coup.
     voile noir sous le calque, efface en fondu des que la video a une image */
  var debut=Date.now(),tv=aImage(v)?0:-1,voile=null,parti=false,minuteur;
  if(tv<0){voile=document.createElement('div');voile.id='v2voile';document.body.appendChild(voile);
    ['loadeddata','canplay','playing'].forEach(function(e){v.addEventListener(e,arrive)});}
  H3.montre();
  /* pose : ~1 s de video dans les lettres ; si la video tarde on l'attend, 1,9 s au plus */
  minuteur=setTimeout(ouvre,1900);
  if(tv===0)planifie();
  function aImage(v){return !v||v.readyState>=2}
  function arrive(){if(tv>=0||!aImage(v))return;tv=Date.now()-debut;efface(voile,450);voile=null;planifie();}
  function planifie(){clearTimeout(minuteur);
    minuteur=setTimeout(ouvre,Math.max(0,Math.min(Math.max(1100,tv+1000),1900)-(Date.now()-debut)));}
  function efface(el,ms){if(!el)return;el.style.transition='opacity '+ms+'ms cubic-bezier(.23,1,.32,1)';el.style.opacity=0;
    setTimeout(function(){H3.fini(el)},ms+50);}
  function ouvre(){if(parti)return;parti=true;clearTimeout(minuteur);efface(voile,600);voile=null;
    /* reduire les animations : un seul calque, simple fondu */
    if(H3.reduit){g.style.transition='opacity .5s cubic-bezier(.45,0,.55,1)';g.style.opacity=0;
      setTimeout(H3.pret,300);setTimeout(function(){H3.fini(g)},560);return;}
    /* les battants sortent de l'ecran encore lances (course 1,2x) : pas d'eclats de lettres qui trainent au bord.
       un peu plus long sur grand ecran (plus de chemin) */
    var D=Math.round(1000+80*Math.min(1,Math.max(0,(W-390)/1050))),k=1.2;
    g.style.transition=d.style.transition='transform '+D+'ms cubic-bezier(.72,0,.28,1)';
    g.style.transform='translate3d('+(-k*x)+'px,0,0)';
    d.style.transform='translate3d('+(k*(W-x))+'px,0,0)';
    setTimeout(H3.pret,Math.round(D*.45));
    setTimeout(function(){H3.fini(g);H3.fini(d)},Math.round(D*.72));}
  /* lettres du mot : [gauche, droite] de l'encre, par ligne */
  function encre(mot){
    var ctx=document.createElement('canvas').getContext('2d'),L={},tw=document.createTreeWalker(mot,NodeFilter.SHOW_TEXT),n,i;
    while((n=tw.nextNode())){ctx.font='800 '+getComputedStyle(n.parentNode).fontSize+' Syne';
      for(i=0;i<n.nodeValue.length;i++){var ch=n.nodeValue.charAt(i);if(/\s/.test(ch))continue;
        var rg=document.createRange();rg.setStart(n,i);rg.setEnd(n,i+1);
        var b=rg.getBoundingClientRect(),m=ctx.measureText(ch.toUpperCase()),k=Math.round(b.top);
        (L[k]=L[k]||[]).push([b.left-m.actualBoundingBoxLeft,b.left+m.actualBoundingBoxRight]);}}
    return Object.keys(L).map(function(k){return L[k]});
  }
  /* ou fendre : pres du milieu, dans un blanc entre deux lettres ou au milieu d'une lettre, jamais un eclat de lettre */
  function coupe(mot,W,r){
    var L=encre(mot),mi=W/2,best=mi,bs=1e9,x;
    for(x=Math.ceil((mi-W*.045)*r)/r;x<=mi+W*.045;x+=1/r){var s=Math.abs(x-mi)/W*3;
      L.forEach(function(l){var dmin=1e9,dans=null;
        l.forEach(function(e){if(x>=e[0]&&x<=e[1])dans=e;dmin=Math.min(dmin,Math.abs(x-e[0]),Math.abs(x-e[1]));});
        if(dans){var f=(x-dans[0])/(dans[1]-dans[0]);s+=(f<.3||f>.7)?99:.25+Math.abs(f-.5);}
        else if(dmin<3)s+=(3-dmin)*.1;});
      if(s<bs){bs=s;best=x;}}
    return Math.round(best*r)/r;
  }
});

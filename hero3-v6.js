/* V6 « Iris » : MAISON 52 en grand, la video dans les lettres, puis la pupille du O se dilate
   et le cercle s'ouvre d'un seul geste, comme un diaphragme, jusqu'au plein ecran. */
(function(){
  /* centre et rayon du O dessine (encre reelle de la lettre, pas sa boite) */
  function geoO(mot){
    var w=document.createTreeWalker(mot,NodeFilter.SHOW_TEXT),n,i,g=mot.getBoundingClientRect();
    while((n=w.nextNode())){i=n.nodeValue.toUpperCase().indexOf('O');if(i>=0)break;}
    if(!n)return {x:g.left+g.width/2,y:g.top+g.height/2,r:g.height/4};
    var rg=document.createRange();rg.setStart(n,i);rg.setEnd(n,i+1);var a=rg.getBoundingClientRect();
    var o={x:a.left+a.width/2,y:a.top+a.height/2,r:Math.min(a.width,a.height)*.4};
    try{var cx=document.createElement('canvas').getContext('2d'),fs=parseFloat(getComputedStyle(mot).fontSize);
      cx.font='800 '+fs+'px Syne';var m=cx.measureText('O');
      if(m.actualBoundingBoxAscent&&m.fontBoundingBoxAscent){
        var base=a.top+m.fontBoundingBoxAscent;
        o.x=a.left+(m.actualBoundingBoxRight-m.actualBoundingBoxLeft)/2;
        o.y=base-(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2;
        o.r=Math.min(m.actualBoundingBoxLeft+m.actualBoundingBoxRight,m.actualBoundingBoxAscent+m.actualBoundingBoxDescent)/2;}
    }catch(e){}
    return o;
  }
  /* attend qu'une image de la video soit vraiment a l'ecran (sinon les lettres sont noires un instant),
     au plus tard 0,85 s apres l'ouverture de la page ; en attendant, le fond de chargement reste */
  function quandImage(fn){
    var v=document.getElementById('hero-video'),fait=false,go=function(){if(!fait){fait=true;fn();}};
    var reste=Math.max(0,850-performance.now());
    if(!v||!reste)return go();
    setTimeout(go,reste);
    if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(function(){requestAnimationFrame(go)});
    else if(v.readyState>=2)go();
    else v.addEventListener('playing',function(){requestAnimationFrame(go)},{once:true});
  }
  H3.quandPret(function(){
    var c=H3.calque('clair'),intro=c.intro,mot=c.mot,POSE=1050;
    mot.style.fontSize=H3.ajuste(mot,innerWidth*.88)+'px';
    /* la video monte dans les lettres : un fondu seul (garde aussi en mouvement reduit) */
    function entree(){
      if(mot.animate)mot.animate([{opacity:0},{opacity:1}],{duration:450,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'});
      H3.montre();
    }
    if(H3.reduit){
      /* reduire les animations : aucun mouvement, le calque s'efface en fondu */
      quandImage(function(){
        entree();
        setTimeout(function(){
          intro.style.transition='opacity .45s cubic-bezier(.23,1,.32,1)';intro.style.opacity=0;
          setTimeout(H3.pret,100);
          setTimeout(function(){H3.fini(intro)},550);
        },POSE);
      });
      return;
    }
    var o=geoO(mot),g=mot.getBoundingClientRect(),W=innerWidth,H=Math.max(innerHeight,document.documentElement.clientHeight);
    /* rB : le cercle a traverse l'ecran d'un bord a l'autre (ce n'est plus un hublot, c'est une bande) ;
       rC : coin le plus loin ; R : avec marge (barre Safari qui se replie) */
    var rB=Math.max(3*o.r,Math.min(Math.max(o.x,W-o.x),Math.max(o.y,H-o.y))),
        rC=Math.max(Math.hypot(o.x,o.y),Math.hypot(W-o.x,o.y),Math.hypot(o.x,H-o.y),Math.hypot(W-o.x,H-o.y)),R=rC+90;
    /* le disque est dessine assez grand (4 O) pour rester net une fois agrandi, sans devenir une couche geante */
    var rb=Math.min(4*o.r,rB),iris=document.createElement('div');iris.id='h3-iris';
    iris.style.left=(o.x-rb)+'px';iris.style.top=(o.y-rb)+'px';iris.style.width=iris.style.height=(2*rb)+'px';
    intro.appendChild(iris);
    mot.style.transformOrigin=((o.x-g.left)/g.width*100)+'% '+((o.y-g.top)/g.height*100)+'%';
    quandImage(function(){
      entree();
      setTimeout(function(){
        /* A : la pupille du O se dilate en accelerant (le creux du O s'allume)
           puis le cercle file a vitesse constante, sans jamais ralentir a l'ecran : il traverse l'ecran en ~0,1 s
           (le hublot ne dure que quelques images) et sort par les coins */
        var A=280,PB=100,v=(rB-o.r)/PB,L=(R-o.r)/v,T=A+L,tC=A+(rC-o.r)/v;
        /* pente de fin de A egale a la vitesse du cercle : pas d'a-coup a la jonction */
        var x2=Math.max(.5,1-.7/(v*A/o.r)),EA='cubic-bezier(.5,0,'+x2.toFixed(3)+',.3)';
        var fin=function(){H3.fini(intro)};
        if(iris.animate){
          iris.animate([
            {transform:'scale(0)',easing:EA},
            {transform:'scale('+(o.r/rb)+')',offset:A/T,easing:'linear'},
            {transform:'scale('+(R/rb)+')'}],{duration:T,fill:'forwards'});
          /* les lettres restantes s'ecartent du O : on traverse, on ne regarde pas par un hublot */
          mot.animate([{transform:'scale(1)'},{transform:'scale(1.1)'}],{duration:L,delay:A,easing:'linear',fill:'forwards'});
          /* les derniers coins s'effacent au lieu d'etre grignotes */
          var f=intro.animate([{opacity:1},{opacity:0}],{duration:60,delay:tC-60,easing:'linear',fill:'forwards'});
          f.onfinish=fin;
        }else{
          iris.style.transition='transform .45s cubic-bezier(.6,0,.9,.6)';iris.style.transform='scale('+(R/rb)+')';
          intro.style.transition='opacity .1s linear .35s';intro.style.opacity=0;
        }
        /* le titre du site se pose une fois le calque parti (le travail de mise en page ne tombe pas pendant l'iris) */
        setTimeout(H3.pret,tC);
        setTimeout(fin,T+200);
      },POSE);
    });
  });
})();

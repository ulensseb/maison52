/* Proposition 3 « Avec photo » : la grande table de la salle a manger, juste sous la phrase.
   Tout est calcule depuis la position de defilement, une fois par image (requestAnimationFrame) :
   la decoupe laterale se referme (clip-path) pendant que l'image recule (scale), la photo se pose,
   puis 01 glisse dessus avec son ombre. Rien d'autre que clip-path, transform et opacity. */
(function(){
PH.quandDom(function(){
  var st=document.getElementById('statement');if(!st||document.getElementById('p3-scene'))return;
  var scene=document.createElement('div');scene.id='p3-scene';
  scene.innerHTML='<div class="p3-collant"><figure class="p3-photo">'+
    '<img src="demo-sam.jpg" width="1600" height="1200" decoding="async" fetchpriority="low" alt="La salle à manger de la Maison 52 : une grande table en bois entourée de chaises blanches, une cheminée en marbre et un parquet en chevrons.">'+
    '</figure></div><div class="p3-ombre" aria-hidden="true"></div>';
  st.parentNode.insertBefore(scene,st.nextSibling);
  /* reduit : pas de mouvement lie au defilement, un seul fondu quand la photo arrive */
  if(PH.reduit){var f=scene.querySelector('.p3-photo');
    if(!('IntersectionObserver' in window)){f.classList.add('vu');return;}
    var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){f.classList.add('vu');io.disconnect();}},{threshold:.12});
    io.observe(f);return;}

  var col=scene.firstChild,fig=col.firstChild,img=fig.querySelector('img'),ombre=scene.querySelector('.p3-ombre');
  var h2=st.querySelector('h2'),H=0,m0=0,pin=0,s0=1.2,attente=0,der={};
  function borne(x){return x<0?0:x>1?1:x}
  /* entree et sortie douces (le debut et la pose ne donnent pas d'a-coup) */
  function doux(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function sin(x){return .5-Math.cos(Math.PI*x)/2}
  function mesure(){
    /* hauteur de la scene collante (100lvh) : stable quand la barre d'adresse de Safari bouge */
    H=col.offsetHeight||innerHeight;pin=scene.offsetHeight-H;s0=innerWidth>860?1.16:1.2;
    /* le retrait de depart = la marge du texte : la photo commence dans la colonne de la phrase */
    m0=h2?Math.max(0,Math.round(h2.getBoundingClientRect().left)):Math.round(innerWidth*.06);}
  function tick(){attente=0;
    var t=scene.getBoundingClientRect().top;
    /* 1. ouverture : tant que la phrase est lue, la photo reste dans sa colonne ; elle s'ouvre quand son haut
       passe la moitie de l'ecran et finit juste avant sa pose */
    var a=doux(borne((H*.55-t)/(H*.5)));
    /* 2. recul de l'image : de son entree a sa pose (s0 -> 1,03), puis une fin tres lente sous 01 (-> 1) */
    var e=sin(borne((H-t)/(H*.95)));
    /* 3. recouvrement par 01, pendant la pose */
    var q=borne(-t/(pin||1));
    var mm=m0*(1-a);if(mm<.3)mm=0;
    /* bord a bord : plus de decoupe du tout (moins de travail pour Safari pendant la pose) */
    var c=mm?'inset(0 '+mm.toFixed(1)+'px 0 '+mm.toFixed(1)+'px)':'none';
    var s='scale('+(1+(s0-1.03)*(1-e)+.03*(1-q*q)).toFixed(4)+')';
    /* pendant que 01 monte, la photo remonte un peu (au tiers de la vitesse) : la table reste en vue, la profondeur se lit */
    var y='translate3d(0,'+(-q*pin*.33).toFixed(1)+'px,0)';
    /* l'ombre de 01 apparait des qu'il entre, et s'efface avant qu'il n'atteigne le menu */
    var o=Math.min(borne(q/.22),borne((.94-q)/.2)).toFixed(3);
    /* on n'ecrit que ce qui a change */
    if(c!==der.c){der.c=c;fig.style.clipPath=c;fig.style.webkitClipPath=c;}
    if(y!==der.y){der.y=y;fig.style.transform=y;}
    if(s!==der.s){der.s=s;img.style.transform=s;}
    if(o!==der.o){der.o=o;ombre.style.opacity=o;}
  }
  function demande(){if(!attente)attente=requestAnimationFrame(tick)}
  function remesure(){mesure();der={};demande()}
  addEventListener('scroll',demande,{passive:true});
  addEventListener('resize',remesure);
  addEventListener('load',remesure);
  addEventListener('pageshow',remesure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(remesure);
  mesure();tick();
});
})();

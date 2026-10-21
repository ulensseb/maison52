/* Propositions 4 « Photos moyennes » et 5 « Photos basses » (la 5 charge ce fichier, avec html.bande-basse).
   Deux photos en bande sous leur texte : la table sous la phrase, la facade sous 01.
   Tout est calcule depuis la position de defilement, une fois par image (requestAnimationFrame) :
   la decoupe laterale se referme (clip-path) pendant que l'image recule (scale). Rien d'autre que
   clip-path et transform. Les positions sont mesurees au chargement et au redimensionnement seulement. */
(function(){
var R=document.documentElement;R.classList.add('bande');
PH.quandDom(function(){
  var st=document.getElementById('statement'),f1=document.getElementById('fp-1');
  if(!st||!f1||document.querySelector('.bd-bande'))return;
  var ancienne=f1.querySelector('.split-media img');
  /* une bande : figure > img */
  function bande(cls,src,w,h,alt,paresseux){
    var d=document.createElement('div');d.className='bd-bande '+cls;
    d.innerHTML='<figure class="bd-photo"><img src="'+src+'" width="'+w+'" height="'+h+'" decoding="async"'+
      (paresseux?' loading="lazy"':' fetchpriority="low"')+' alt=""></figure>';
    d.querySelector('img').alt=alt;return d;}
  /* 1. la table, juste sous la phrase (premiere image utile : pas de chargement differe) */
  var table=bande('bd-table','demo-sam.jpg',1600,1200,'La salle à manger de la Maison 52 : une grande table en bois entourée de chaises blanches, une cheminée en marbre et un parquet en chevrons.',false);
  st.parentNode.insertBefore(table,st.nextSibling);
  /* 2. 01 sur fond clair, la facade dessous (meme photo, meme texte alternatif que le site) */
  f1.classList.remove('photo-fond');f1.classList.add('bd-01');
  /* la photo de 01 d'aujourd'hui, partout (cadrage regle en CSS : balcon et porte dans la bande) */
  var facade=bande('bd-facade','m52-facade.jpg',1280,1600,ancienne&&ancienne.alt||'Façade de la Maison 52',true);
  f1.appendChild(facade);
  var figs=[table,facade].map(function(b){return b.firstChild});

  /* menu : 01 est clair maintenant -> menu fonce tant que 01 passe dessous (le site le croit sombre) */
  var nav=document.querySelector('nav'),navY=40,f1Haut=0,f1Bas=0,fonce=false;
  function menu(y){var v=y+navY>=f1Haut&&y+navY<f1Bas;if(v!==fonce){fonce=v;R.classList.toggle('bd-navfonce',v);}}

  /* reduit : pas de mouvement lie au defilement, un seul fondu quand chaque photo arrive */
  if(PH.reduit){
    figs.forEach(function(f){
      if(!('IntersectionObserver' in window)){f.classList.add('vu');return;}
      var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){f.classList.add('vu');io.disconnect();}},{threshold:.12});
      io.observe(f);});
  }

  /* hauteur d'ecran stable (100lvh) : ne bouge pas quand la barre d'adresse de Safari se replie */
  var sonde=document.createElement('div');sonde.setAttribute('aria-hidden','true');
  sonde.style.cssText='position:absolute;top:0;left:0;width:1px;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.appendChild(sonde);
  var H=0,m0=0,s0=1.2,attente=0,L=figs.map(function(f){return {f:f,img:f.querySelector('img'),haut:0,h:0,fin:0,der:{}}});
  var h2=st.querySelector('h2');
  function borne(x){return x<0?0:x>1?1:x}
  /* entree et sortie douces (le debut et la pose ne donnent pas d'a-coup) */
  function doux(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function sin(x){return .5-Math.cos(Math.PI*x)/2}
  function mesure(){
    var y=scrollY;H=sonde.offsetHeight||innerHeight;s0=innerWidth>860?1.16:1.2;
    /* le retrait de depart = la marge du texte : la photo commence dans la colonne de la phrase */
    m0=h2?Math.max(0,Math.round(h2.getBoundingClientRect().left)):Math.round(innerWidth*.06);
    L.forEach(function(p){var r=p.f.getBoundingClientRect();p.haut=r.top+y;p.h=r.height||1;
      /* la photo est ouverte bord a bord quand son milieu arrive a 42 % de l'ecran */
      p.fin=Math.min(H*.42-p.h/2,H*.6);});
    /* le menu repasse en clair des que le bas fondu de la facade (deja presque noir) passe dessous */
    var fh=getComputedStyle(figs[1],'::after').height||'',fondu=parseFloat(fh)||0;
    if(/%$/.test(fh))fondu=fondu/100*figs[1].offsetHeight;
    var r1=f1.getBoundingClientRect();f1Haut=r1.top+y;f1Bas=r1.bottom+y-fondu*.9;
    navY=nav?nav.getBoundingClientRect().height*.6:40;}
  function tick(){attente=0;var y=scrollY;menu(y);if(PH.reduit)return;
    L.forEach(function(p){
      var t=p.haut-y,der=p.der;
      /* hors de l'ecran : on laisse l'etat deja ecrit */
      if(t>H*1.2&&der.c)return;
      /* 1. ouverture : la photo entre dans sa colonne, s'ouvre en montant, bord a bord a 42 % de l'ecran */
      var a=doux(borne((H*.92-t)/(H*.92-p.fin)));
      /* 2. recul de l'image : de son entree a l'ouverture (s0 -> 1,03), puis tres lent jusqu'a sa sortie (-> 1) */
      var e=sin(borne((H-t)/(H-p.fin))),g=borne((p.fin-t)/(p.fin+p.h));
      var mm=m0*(1-a);if(mm<.3)mm=0;
      /* bord a bord : plus de decoupe du tout (moins de travail pour Safari) */
      var c=mm?'inset(0 '+mm.toFixed(1)+'px 0 '+mm.toFixed(1)+'px)':'none';
      var s='scale('+(1+(s0-1.03)*(1-e)+.03*(1-g)).toFixed(4)+')';
      if(c!==der.c){der.c=c;p.f.style.clipPath=c;p.f.style.webkitClipPath=c;}
      if(s!==der.s){der.s=s;p.img.style.transform=s;}
    });
  }
  function demande(){if(!attente)attente=requestAnimationFrame(tick)}
  function remesure(){mesure();L.forEach(function(p){p.der={}});demande()}
  addEventListener('scroll',demande,{passive:true});
  addEventListener('resize',remesure);
  addEventListener('load',remesure);
  addEventListener('pageshow',remesure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(remesure);
  /* la page change de hauteur (polices, images, sections plus bas) : on remesure, sans lecture a chaque image */
  if('ResizeObserver' in window){var ro=new ResizeObserver(function(){remesure()});ro.observe(document.body);}
  mesure();tick();
});
})();

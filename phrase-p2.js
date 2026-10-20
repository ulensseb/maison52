/* Proposition 2 « Mot à mot » : chaque mot de la phrase s'allume au rythme du doigt.
   Tout est calculé à chaque image (rAF) depuis la position de #statement : pas de seuils, pas de minuterie.
   En « Réduire les animations » : rien ne bouge, les mots s'allument l'un après l'autre (fondu) une fois la phrase à l'écran. */
(function(){
  if(!window.PH)return;
  var R=document.documentElement;
  PH.quandDom(function(){
    var st=document.getElementById('statement');if(!st)return;
    var h2=st.querySelector('h2'),p=st.querySelector('p');if(!h2)return;

    /* les mots : on reprend ceux découpés par le site (.w) ; sinon on les découpe nous-mêmes */
    var ws=[].slice.call(h2.querySelectorAll('.w'));
    if(!ws.length)ws=decoupe(h2);

    /* unités d'allumage : un mot (le point final rejoint « ressemble ») ; un calque encre posé dessus */
    var U=[],total=0;
    ws.forEach(function(w){
      var k=document.createElement('span');k.className='ph2-k';k.setAttribute('aria-hidden','true');
      k.textContent=w.textContent;w.appendChild(k);
      if(w.classList.contains('punct')&&U.length){U[U.length-1].ks.push(k);return;}
      var n=w.textContent.length;U.push({ks:[k],a:total,n:n,v:-1});total+=n+1;
    });

    /* le bloc qui reste au centre : filet + phrase + sous-phrase */
    var bloc=document.createElement('div');bloc.className='ph2-bloc';
    while(st.firstChild)bloc.appendChild(st.firstChild);st.appendChild(bloc);

    R.classList.add('ph2-js');
    if(PH.reduit){calme(bloc,h2,ws,U);return;}
    R.classList.add('ph2-pin');
    allume(st,bloc,h2,ws,p,U);
  });

  function decoupe(h2){
    var out=[];
    (function par(n){[].slice.call(n.childNodes).forEach(function(c){
      if(c.nodeType===1)return par(c);
      if(c.nodeType!==3)return;
      var f=document.createDocumentFragment();
      c.nodeValue.split(/(\s+)/).forEach(function(t){if(!t)return;
        if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return;}
        var s=document.createElement('span');s.className='w'+(/^[.,;:!?]+$/.test(t)?' punct':'');s.textContent=t;f.appendChild(s);out.push(s);});
      n.replaceChild(f,c);
    });})(h2);
    return out;
  }

  /* garde-fou : la phrase doit tenir en trois lignes (« te ressemble. » entier sur la dernière).
     Si la police rend un peu plus large que prévu, on la réduit légèrement plutôt que d'isoler « qui ». */
  function troisLignes(h2,ws){
    h2.style.removeProperty('font-size');
    for(var i=0;i<5;i++){
      var L={};ws.forEach(function(w){L[Math.round(w.offsetTop/8)]=1;});
      if(Object.keys(L).length<=3)return;
      h2.style.setProperty('font-size',(parseFloat(getComputedStyle(h2).fontSize)*.96).toFixed(1)+'px','important');
    }
  }

  /* l'allumage, lié au défilement. x = de combien le haut de #statement est passé au-dessus du haut de l'écran.
     Repères (en px, mesurés) : l'allumage commence quand la phrase est encore un quart d'écran sous sa place,
     elle est entièrement allumée aux 7/10 de l'épinglage, la sous-phrase arrive en même temps que les derniers mots. */
  var LARG=.34;  /* largeur du fondu d'un mot, en part de l'allumage : 2 à 3 mots s'allument en même temps */
  function allume(st,bloc,h2,ws,p,U){
    var sonde=document.createElement('div');sonde.className='ph2-sonde';document.body.appendChild(sonde);
    var nav=document.querySelector('nav');
    var M={},raf=0,ps=-1;
    /* centre de chaque mot ramené entre 0 (premier) et 1 (dernier) */
    var c0=U[0].a+U[0].n/2,c1=U[U.length-1].a+U[U.length-1].n/2;
    U.forEach(function(u){u.d=(u.a+u.n/2-c0)/(c1-c0)*(1-LARG);});
    function mesure(){
      troisLignes(h2,ws);
      var cs=getComputedStyle(st),svh=sonde.offsetHeight,hb=bloc.offsetHeight,hh=h2.offsetHeight,hn=nav?nav.offsetHeight:64;
      /* la phrase (pas le bloc) se pose au centre optique de l'écran (47 % de la hauteur sans la barre de Safari) ;
         la sous-phrase doit tenir dessous, et rien ne passe sous le menu */
      var T=Math.round(svh*.47-hh/2);
      T=Math.min(T,Math.round(svh*.95)-hb);
      T=Math.max(T,hn+12);if(T!==M.T){M.T=T;bloc.style.top=T+'px';}
      M.pt=parseFloat(cs.paddingTop);
      /* longueur de l'épinglage = la place libre sous le bloc dans #statement (le ::after) */
      M.P=Math.max(1,st.clientHeight-M.pt-parseFloat(cs.paddingBottom)-bloc.offsetHeight);
      M.xs=M.pt-M.T;                 /* début de l'épinglage */
      M.l0=M.xs-.24*svh;             /* début de l'allumage */
      M.l1=M.xs+.70*M.P;             /* phrase entièrement allumée */
      M.p0=M.xs+.58*M.P;M.p1=M.xs+.94*M.P;   /* sous-phrase */
    }
    function lisse(t){return t<=0?0:t>=1?1:t*t*(3-2*t);}
    function image(){
      raf=0;
      var x=-st.getBoundingClientRect().top;
      var g=(x-M.l0)/(M.l1-M.l0);
      U.forEach(function(u){
        var v=Math.round(lisse((g-u.d)/LARG)*1000)/1000;
        if(v===u.v)return;u.v=v;
        u.ks.forEach(function(k){k.style.opacity=v;});
      });
      if(p){var s=Math.round(lisse((x-M.p0)/(M.p1-M.p0))*1000)/1000;
        if(s!==ps){ps=s;p.style.opacity=s;p.style.transform=s>=1?'none':'translate3d(0,'+((1-s)*16).toFixed(1)+'px,0)';}}
    }
    function demande(){if(!raf)raf=requestAnimationFrame(image);}
    mesure();image();
    addEventListener('scroll',demande,{passive:true});
    /* tout est en svh : quand la barre de Safari se replie, les mesures ne bougent pas (pas de saut) */
    addEventListener('resize',function(){mesure();demande();});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){mesure();demande();});
    addEventListener('load',function(){mesure();demande();});
  }

  /* « Réduire les animations » : aucun mouvement. Quand la phrase est entière à l'écran,
     ses mots passent du gris à l'encre l'un après l'autre (fondu de couleur), puis la sous-phrase apparaît. */
  function calme(bloc,h2,ws,U){
    R.classList.add('ph2-calme');
    U.forEach(function(u,i){u.ks.forEach(function(k){k.style.transitionDelay=(i*.11).toFixed(2)+'s';});});
    troisLignes(h2,ws);
    addEventListener('resize',function(){troisLignes(h2,ws);});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){troisLignes(h2,ws);});
    /* départ : la phrase est visible aux 7/10 et son haut a passé les 72 % de l'écran */
    function vu(){var r=h2.getBoundingClientRect(),H=innerHeight,v=(Math.min(r.bottom,H)-Math.max(r.top,0))/r.height;
      if(r.top<H*.72&&v>=.7){bloc.classList.add('ph2-vu');removeEventListener('scroll',vu);}}
    addEventListener('scroll',vu,{passive:true});vu();
  }
})();

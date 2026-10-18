/* Maison 52 — page de test hero3 : variantes de l'ouverture B1 (« la video dans les lettres »).
   Charge dans <head> (synchrone). Lit ?h=N, pose html.h3.h3-vN, charge hero3-vN.css et hero3-vN.js.
   Outils pour les variantes : window.H3 = {
     actif, h, reduit,
     quandPret(fn)         -> fn() apres DOMContentLoaded + polices Syne chargees (1,2 s max)
     calque(mode)          -> {intro, mot} : calque plein ecran pose sur la video, avec « MAISON 52 » dedans.
                              mode 'clair' : fond --bg, lettres noires, mix-blend-mode:screen -> la video se voit DANS les lettres
                              mode 'sombre': fond noir, lettres blanches, mix-blend-mode:multiply -> idem sur fond noir
     ajuste(mot, largeur)  -> taille en px pour que le mot remplisse la largeur (mobile : MAISON puis un 52 geant)
     origineLettre(mot, c) -> [x%, y%] du centre de la lettre c dans le mot (pour transform-origin)
     montre()              -> cache le cache de depart (#loader) : a appeler quand le calque est en place
     pret()                -> lance l'apparition normale du titre, du sous-titre et du menu (body.m52-ready)
     fini(el)              -> retire un element
   } */
(function(){
  var q=new URLSearchParams(location.search),h=q.get('h')||'1',R=document.documentElement;
  var LISTE=[['0','Actuel'],['1','Plongée'],['2','Portes'],['3','Volets'],['4','Nuit'],['5','Relais'],['6','Iris']];
  var nom='';LISTE.forEach(function(o){if(o[0]===h)nom=o[1]});
  var actif=h!=='0'&&!!nom, reduit=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var V=(document.currentScript&&document.currentScript.src.split('v=')[1])||'1';
  /* tant que la variante n'a pas pose son calque, on garde le fond de l'ecran de chargement (sans le mot) : pas de flash */
  var st=document.createElement('style');
  st.textContent='html.h3 #loader .word,html.h3 #loader .bar{display:none !important}'+
    'html.h3-v4 #loader .lbg{background:#0E0E0D !important}'+
    '#h3bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:500;display:flex;align-items:center;gap:2px;padding:4px;border-radius:999px;background:rgba(20,20,20,.9);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 4px 18px rgba(0,0,0,.3);font:500 13px/1 -apple-system,Helvetica,Arial,sans-serif;max-width:calc(100vw - 16px)}'+
    '#h3bar a{color:#fff;padding:10px 11px;border-radius:999px;-webkit-tap-highlight-color:transparent;white-space:nowrap;text-decoration:none}'+
    '#h3bar a.on{background:#E26A3E}#h3bar .nom{color:#fff;opacity:.75;padding:0 8px 0 10px;white-space:nowrap}'+
    /* calque commun des variantes */
    '#intro{position:fixed;inset:0;z-index:150;display:flex;align-items:center;justify-content:center;padding:0 var(--pad);pointer-events:none}'+
    '#intro.calque-clair{background:var(--bg);mix-blend-mode:screen}#intro.calque-clair .mot,#intro.calque-clair .mot em{color:#000 !important}'+
    '#intro.calque-sombre{background:#000;mix-blend-mode:multiply}#intro.calque-sombre .mot,#intro.calque-sombre .mot em{color:#fff !important}'+
    '#intro .mot{font-family:"Syne",sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:-.02em;line-height:.82;text-align:center;white-space:nowrap;will-change:transform}'+
    '#intro .mot em{font-style:normal;font-weight:inherit !important;display:block;line-height:.78}'+
    '@media(min-width:861px){#intro .mot em{display:inline;font-size:1.3em}}'+
    '#h3avis{position:fixed;left:8px;right:8px;top:8px;z-index:501;background:#E26A3E;color:#fff;font:500 13px/1.35 -apple-system,Helvetica,Arial,sans-serif;padding:10px 12px;border-radius:10px}';
  document.head.appendChild(st);
  if(actif){
    R.classList.add('h3','h3-v'+h);
    var l=document.createElement('link');l.rel='stylesheet';l.href='hero3-v'+h+'.css?v='+V;document.head.appendChild(l);
    var s=document.createElement('script');s.src='hero3-v'+h+'.js?v='+V;s.async=false;document.head.appendChild(s);
  }
  function quandDom(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}
  function quandPret(fn){var fait=false,une=function(){if(!fait){fait=true;fn()}};
    quandDom(function(){
      var p=document.fonts?Promise.all([document.fonts.load("800 100px 'Syne'"),document.fonts.load("500 100px 'Syne'")]):Promise.resolve();
      p.then(une,une);setTimeout(une,1200);});}
  function ajuste(el,avail){el.style.fontSize='100px';var em=el.querySelector('em');if(em)em.style.fontSize='';
    var t=el.firstChild,r=document.createRange();
    if(innerWidth>860){r.selectNodeContents(el);return 100*avail/r.getBoundingClientRect().width*.99;}
    r.setStart(t,0);r.setEnd(t,t.nodeValue.replace(/\s+$/,'').length);var wM=r.getBoundingClientRect().width;
    if(em){r.selectNodeContents(em);var w5=r.getBoundingClientRect().width;em.style.fontSize=(wM/w5)+'em';}
    return 100*avail/wM*.99;}
  function origineLettre(el,c){var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),n,i;
    while((n=w.nextNode())){i=n.nodeValue.toUpperCase().indexOf(c.toUpperCase());if(i>=0)break;}
    if(!n)return [50,50];var r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);
    var a=r.getBoundingClientRect(),b=el.getBoundingClientRect();return [(a.left+a.width/2-b.left)/b.width*100,(a.top+a.height*.55-b.top)/b.height*100];}
  function calque(mode){var intro=document.createElement('div');intro.id='intro';intro.className='calque-'+(mode||'clair');
    var mot=document.createElement('div');mot.className='mot';mot.innerHTML=document.querySelector('#hero-ui h1').innerHTML;
    intro.appendChild(mot);document.body.appendChild(intro);return {intro:intro,mot:mot};}
  function montre(){var L=document.getElementById('loader');if(L)L.classList.add('done');}
  function pret(){document.body.classList.add('m52-ready');montre();}
  function fini(el){if(el&&el.parentNode)el.parentNode.removeChild(el);}
  window.H3={actif:actif,h:h,reduit:reduit,quandPret:quandPret,calque:calque,ajuste:ajuste,origineLettre:origineLettre,montre:montre,pret:pret,fini:fini};
  /* barre de choix + rejouer */
  quandDom(function(){
    var bar=document.createElement('div');bar.id='h3bar';
    var n=document.createElement('span');n.className='nom';n.textContent=nom||'Actuel';bar.appendChild(n);
    LISTE.forEach(function(o){var a=document.createElement('a');a.textContent=o[0]==='0'?'A':o[0];a.href='?h='+o[0]+'&v='+V+'.'+(+new Date()%100000);if(o[0]===h)a.className='on';bar.appendChild(a);});
    var r=document.createElement('a');r.textContent='↻';r.href='?h='+h+'&v='+V+'.'+(+new Date()%100000);r.setAttribute('aria-label','Rejouer');bar.appendChild(r);
    document.body.appendChild(bar);
    if(reduit&&actif){var av=document.createElement('div');av.id='h3avis';
      av.textContent='« Réduire les animations » est activé sur ce téléphone : tu ne vois qu\'un fondu. Coupe-le (Réglages › Accessibilité › Mouvement) pour voir l\'animation.';
      document.body.appendChild(av);setTimeout(function(){fini(av)},7000);}
  });
})();

/* Maison 52 — page de test : propositions pour la phrase « Vis avec un entourage qui te ressemble » (#statement).
   Charge dans <head> (synchrone). Lit ?p=N, pose html.ph.ph-pN, charge phrase-pN.css et phrase-pN.js.
   window.PH = { actif, p, reduit, quandDom(fn) } */
(function(){
  var q=new URLSearchParams(location.search),p=q.get('p')||'1',R=document.documentElement;
  var LISTE=[['0','Actuel'],['1','Sur la vidéo'],['2','Mot à mot'],['3','Avec photo'],['4','Photos moyennes'],['5','Photos basses']];
  var nom='';LISTE.forEach(function(o){if(o[0]===p)nom=o[1]});
  var actif=p!=='0'&&!!nom,reduit=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var V=(document.currentScript&&document.currentScript.src.split('v=')[1])||'1';
  /* on repart toujours du haut : on juge la phrase en descendant depuis la video */
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  var st=document.createElement('style');
  st.textContent='#phbar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:500;display:flex;align-items:center;gap:2px;padding:4px;border-radius:999px;background:rgba(20,20,20,.9);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 4px 18px rgba(0,0,0,.3);font:500 13px/1 -apple-system,Helvetica,Arial,sans-serif;max-width:calc(100vw - 16px)}'+
    '#phbar a{color:#fff;padding:10px 12px;border-radius:999px;-webkit-tap-highlight-color:transparent;white-space:nowrap;text-decoration:none}'+
    '#phbar a.on{background:#E26A3E}#phbar .nom{color:#fff;opacity:.75;padding:0 8px 0 10px;white-space:nowrap}'+
    '#phavis{position:fixed;left:8px;right:8px;top:8px;z-index:501;background:#E26A3E;color:#fff;font:500 13px/1.35 -apple-system,Helvetica,Arial,sans-serif;padding:10px 12px;border-radius:10px}';
  document.head.appendChild(st);
  if(actif){
    R.classList.add('ph','ph-p'+p);
    var l=document.createElement('link');l.rel='stylesheet';l.href='phrase-p'+p+'.css?v='+V;document.head.appendChild(l);
    var s=document.createElement('script');s.src='phrase-p'+p+'.js?v='+V;s.async=false;document.head.appendChild(s);
  }
  function quandDom(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}
  window.PH={actif:actif,p:p,reduit:reduit,quandDom:quandDom};
  quandDom(function(){
    scrollTo(0,0);
    var bar=document.createElement('div');bar.id='phbar';
    var n=document.createElement('span');n.className='nom';n.textContent=nom||'Actuel';bar.appendChild(n);
    LISTE.forEach(function(o){var a=document.createElement('a');a.textContent=o[0]==='0'?'A':o[0];a.href='?p='+o[0]+'&v='+V+'.'+(+new Date()%100000);if(o[0]===p)a.className='on';bar.appendChild(a);});
    document.body.appendChild(bar);
    if(reduit&&actif){var av=document.createElement('div');av.id='phavis';
      av.textContent='« Réduire les animations » est activé sur ce téléphone : les effets au défilement sont simplifiés. Coupe-le (Réglages › Accessibilité › Mouvement) pour voir la vraie version.';
      document.body.appendChild(av);setTimeout(function(){if(av.parentNode)av.parentNode.removeChild(av)},7000);}
  });
})();

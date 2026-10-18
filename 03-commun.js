/* Maison 52 — section 03 « Pour qui » : outils communs aux prototypes (personnages video).
   window.M52P = {
     persos : [{cle, nom, video, poster, repos, geste, centre}]  (ordre des 4 profils)
     reduit : true si « Reduire les animations »
     video(i)          -> <video> pret (muted, playsinline, poster, preload sur le 1er seulement)
     jouer(v)          -> lance la video depuis le debut puis la rejoue toutes les 2,5 s
     arreter(v)        -> pause
     siVisible(el, cb) -> IntersectionObserver : cb(true|false) quand el entre/sort (seuil 35 %)
   }
   Rappels : la video a un fond BLANC PUR. Pour le faire disparaitre, mettre
   mix-blend-mode:multiply sur un conteneur dont AUCUN ancetre n'a transform / opacity<1 /
   filter / isolation / will-change (sinon le melange se fait contre un fond blanc isole). */
(function(){
  var base='./img-pourqui/';
  var persos=[
    {cle:'fondateur',  nom:'fondatrice',  centre:.5},
    {cle:'independant',nom:'independant', centre:.493},
    {cle:'etudiant',   nom:'etudiant',    centre:.555},
    {cle:'transition', nom:'transition',  centre:.544}
  ].map(function(p){p.video=base+'video/'+p.nom+'.mp4';p.poster=base+'video/'+p.nom+'-poster.jpg';
    p.repos=base+'anim/repos-'+p.cle+'.webp';p.geste=base+'anim/geste-'+p.cle+'.webp';return p;});
  var reduit=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function video(i){var p=persos[i],v=document.createElement('video');
    v.muted=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');
    v.preload=i===0?'auto':'metadata';v.poster=p.poster;v.src=p.video;v.style.setProperty('--c',p.centre);return v;}
  function jouer(v){if(reduit||!v)return;clearTimeout(v._m52);
    var go=function(){try{v.currentTime=0}catch(e){}var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});};
    v.onended=function(){v._m52=setTimeout(go,2500)};go();}
  function arreter(v){if(!v)return;clearTimeout(v._m52);v.pause();}
  function siVisible(el,cb,seuil){if(!('IntersectionObserver' in window)){cb(true);return;}
    new IntersectionObserver(function(es){es.forEach(function(e){cb(e.isIntersecting)})},{threshold:seuil||.35}).observe(el);}
  window.M52P={persos:persos,reduit:reduit,video:video,jouer:jouer,arreter:arreter,siVisible:siVisible};
})();

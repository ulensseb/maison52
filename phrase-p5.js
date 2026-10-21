/* Proposition 5 « Photos basses » : la meme mise en page que la 4, avec des photos plus basses.
   Ce fichier pose seulement la classe de hauteur, puis charge le code et le style de la 4 (rien n'est duplique). */
(function(){
  var R=document.documentElement,h=document.head,moi=document.currentScript;
  var V=(moi&&moi.src.split('v=')[1])||'1';
  R.classList.add('bande','bande-basse');
  /* le style de la 4 passe avant celui de la 5 (la 5 ne fait que regler la hauteur) */
  var l=document.createElement('link');l.rel='stylesheet';l.href='phrase-p4.css?v='+V;
  h.insertBefore(l,h.querySelector('link[href^="phrase-p5.css"]'));
  var s=document.createElement('script');s.src='phrase-p4.js?v='+V;s.async=false;h.appendChild(s);
})();

/* V1 « Plongée » : B1 d'origine, remis sur la version en ligne. */
H3.quandPret(function(){
  var c=H3.calque('clair'),intro=c.intro,mot=c.mot;
  mot.style.fontSize=H3.ajuste(mot,innerWidth*.88)+'px';
  H3.montre();
  setTimeout(function(){
    if(H3.reduit){intro.style.transition='opacity .5s ease';intro.style.opacity=0;}
    else{var o=H3.origineLettre(mot,'I');mot.style.transformOrigin=o[0]+'% '+o[1]+'%';
      mot.style.transition='transform .9s cubic-bezier(.7,0,.84,0)';mot.style.transform='scale(45)';
      intro.style.transition='opacity .35s ease .6s';intro.style.opacity=0;}
    setTimeout(H3.pret,700);
    setTimeout(function(){H3.fini(intro)},1100);
  },1000);
});

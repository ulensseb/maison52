/* Bouton « Rejoindre » — proposition 3 : au toucher, la fleche glisse une fois (sort a droite, revient par la gauche).
   Sur telephone il n'y a pas de survol : on pose .b3-glisse au moment ou le doigt se pose, retiree a la fin. */
PH.quandDom(function(){
  var a=document.querySelector('nav .links a.cta');if(!a||PH.reduit)return;
  function glisse(){a.classList.remove('b3-glisse');void a.offsetWidth;a.classList.add('b3-glisse');}
  a.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')glisse();},{passive:true});
  a.addEventListener('animationend',function(){a.classList.remove('b3-glisse');});
});

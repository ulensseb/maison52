/* 03 Pour qui — « Scène » (v2) : une scène épinglée derrière le texte, un seul personnage à la fois.
   Mobile : la scène est DERRIÈRE ; la carte du profil lu monte par-dessus le bas du buste (fondu papier).
   Quand la carte suivante arrive sur la ligne de lecture, son personnage monte sur scène et la carte
   lue s'efface (elle couvrait la scène). Ordinateur : scène à droite, rien ne se chevauche.
   Robustesse iOS : aucune écriture de style à chaque image ; seules 1 ou 2 vidéos sont affichées
   (les autres en display:none, donc sans filtre ni mélange) ; ligne de lecture figée au resize,
   hystérésis de 40 px. Aucun texte n'est modifié : on déplace les 4 articles et on ajoute la scène. */
(function(){
  var S=document.getElementById('fp-3'),P=window.M52P;if(!S||!P)return;
  var list=S.querySelector('.personas'),arts=[].slice.call(S.querySelectorAll('.persona'));
  if(!list||arts.length!==4)return;
  var AR=[546/960,604/960,612/960,1228/960];
  function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}

  /* --- la scène : compteur [01]–[04] + barre en 4 traits + fenêtre de cadrage en buste --- */
  var wrap=el('div','sc-wrap'),stage=el('div','sc-stage'),top=el('div','sc-top'),view=el('div','sc-view');
  stage.setAttribute('aria-hidden','true');
  top.innerHTML='<span class="sc-cnt">[<span class="sc-roll"><span><i>01</i><i>02</i><i>03</i><i>04</i></span></span>]</span>'+
    '<span class="sc-bar"><i></i><i></i><i></i><i></i></span><span class="sc-tot">[04]</span>';
  var figs=[],vids=[];
  P.persos.forEach(function(p,i){var f=el('div','sc-fig sc-f'+i),v=P.video(i);
    v.style.setProperty('--ar',AR[i]);f.appendChild(v);view.appendChild(f);figs.push(f);vids.push(v);});
  stage.appendChild(top);stage.appendChild(view);
  list.parentNode.insertBefore(wrap,list);wrap.appendChild(stage);wrap.appendChild(list);
  list.className='sc-list';

  /* --- les profils : seulement les classes de la cascade (plus de numéro en double) --- */
  arts.forEach(function(a){a.className='sc-art';var k=0;
    [a.querySelector('.idx'),a.querySelector('h4'),a.querySelector('p')].concat([].slice.call(a.querySelectorAll('li')))
      .forEach(function(e){if(!e)return;e.classList.add('sc-c');e.style.setProperty('--i',k++);});});
  S.classList.add('sc-js');

  /* entrée en cascade, une seule fois, quand le profil arrive à l'écran */
  if(P.reduit||!('IntersectionObserver' in window))arts.forEach(function(a){a.classList.add('vu')});
  else{var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('vu');io.unobserve(e.target);}});},{threshold:.15});
    arts.forEach(function(a){io.observe(a)});}

  /* --- changement de personnage : l'entrant s'affiche puis monte, le sortant s'efface puis disparaît --- */
  var act=-1,vis=false,vu=false,tick=false,L=0,tOut=[],mq=matchMedia('(min-width:861px)');
  var roll=top.querySelector('.sc-roll > span'),bars=[].slice.call(top.querySelectorAll('.sc-bar i'));
  function jouerActif(){vids.forEach(function(v,i){if(i===act&&vis)P.jouer(v);else P.arreter(v);});}
  function activer(a){act=a;
    figs.forEach(function(f,i){
      if(i===a){clearTimeout(tOut[i]);f.classList.remove('out');
        if(!f.classList.contains('vis')){f.classList.add('vis');void f.offsetWidth;}
        f.classList.add('on');}
      else if(f.classList.contains('on')){f.classList.remove('on');f.classList.add('out');
        tOut[i]=setTimeout(function(){f.classList.remove('out','vis');},420);}});
    arts.forEach(function(x,i){x.classList.toggle('on',i===a);x.classList.toggle('lu',i<a);});
    roll.style.transform='translateY('+(-25*a)+'%)';
    bars.forEach(function(b,i){b.classList.toggle('on',i<=a)});
    var nx=vids[a+1];if(nx&&nx.preload!=='auto')nx.preload='auto';
    jouerActif();}

  /* --- ligne de lecture, figée au resize (jamais recalculée au défilement) ---
     Mobile : juste sous la scène. La carte lue ne s'efface que lorsqu'elle est passée sur la scène,
     et le titre suivant arrive en haut de la zone de lecture en même temps que son personnage.
     Ordinateur : la liste tient presque dans l'écran. Le 01 occupe la scène pendant l'arrivée de la
     section ; dès que la section touche le haut de l'écran, les 02, 03 et 04 se partagent la course
     de la scène épinglée, et le 04 est en place avant que la scène ne reparte. Positions relatives
     à la section : insensibles aux images qui se chargent plus haut dans la page. */
  var o0=0,seg=1,note=S.querySelector('.note');
  function mesurer(){
    if(mq.matches){var sT=S.getBoundingClientRect().top,T=parseFloat(getComputedStyle(stage).top)||0,
        fin=(note||list).getBoundingClientRect().bottom-sT-(T+stage.offsetHeight);
      seg=Math.max(80,(fin-30)/2.6);o0=30-seg;}
    else L=stage.offsetHeight+36;
    demander();}
  function maj(){tick=false;if(!vu)return;var a=act,i;
    if(mq.matches){var x=(-S.getBoundingClientRect().top-o0)/seg,d=24/seg;
      if(act<0)a=Math.floor(x);else if(Math.floor(x-d)>act)a=Math.floor(x-d);
      else if(Math.floor(x+d)<act)a=Math.floor(x+d);
      a=Math.max(0,Math.min(3,a));}
    /* mobile : hystérésis de 40 px (on avance à L-20, on recule à L+20) */
    else{a=0;for(i=1;i<4;i++){if(arts[i].getBoundingClientRect().top<L+(i<=act?20:-20))a=i;}}
    if(a!==act)activer(a);}
  function demander(){if(!tick){tick=true;requestAnimationFrame(maj);}}

  /* ordinateur : un clic sur un profil amène la page au milieu de sa part de course */
  arts.forEach(function(x,i){x.addEventListener('click',function(){if(!mq.matches||x.classList.contains('on'))return;
    scrollTo({top:scrollY+S.getBoundingClientRect().top+o0+(i+.5)*seg,behavior:P.reduit?'auto':'smooth'});});});
  addEventListener('scroll',demander,{passive:true});
  addEventListener('resize',mesurer);
  addEventListener('load',mesurer);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(mesurer);
  if(mq.addEventListener)mq.addEventListener('change',mesurer);
  /* le premier personnage ne monte sur scène qu'au moment où la scène devient visible */
  P.siVisible(stage,function(v){if(v===vis&&vu)return;vis=v;
    if(v&&!vu){vu=true;maj();}else jouerActif();},.2);
  mesurer();
})();

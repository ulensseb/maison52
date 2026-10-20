/* Proposition 1 « Sur la vidéo » : la phrase vient sur la vidéo d'ouverture, la section blanche disparaît.
   On construit une scène autour de la vidéo : elle reste en place environ un écran (position:sticky),
   « Maison 52 » monte et s'efface, la phrase arrive ligne par ligne, puis 01 glisse par-dessus.
   Défilement natif : seuls un léger recul et une ombre sont calculés à chaque image, depuis la position de 01. */
(function(){
  if(!window.PH||PH.p!=='1')return;
  PH.quandDom(function(){
    var hero=document.getElementById('hero'),ui=document.getElementById('hero-ui'),st=document.getElementById('statement'),
        fp1=document.getElementById('fp-1');
    if(!hero||!ui||!st||!fp1)return;
    var h2=st.querySelector('h2'),p=st.querySelector('p'),apres=fp1.closest('.snapwrap')||fp1;
    function bloc(id){var d=document.createElement('div');d.id=id;return d;}
    var scene=bloc('ph1-scene'),stage=bloc('ph1-stage'),plan=bloc('ph1-plan'),voile=bloc('ph1-voile'),
        phrase=bloc('ph1-phrase'),texte=bloc('ph1-texte'),sous=bloc('ph1-sous'),ombre=bloc('ph1-ombre');
    var b=false,epingle=null,raf=0;function demande(){if(!raf)raf=requestAnimationFrame(cadre);}
    voile.setAttribute('aria-hidden','true');ombre.setAttribute('aria-hidden','true');

    /* la scène prend la place de la vidéo ; la phrase (mêmes noeuds, même texte) passe sur la vidéo */
    hero.parentNode.insertBefore(scene,hero);
    scene.appendChild(stage);stage.appendChild(plan);
    plan.appendChild(hero);plan.appendChild(voile);plan.appendChild(ombre);plan.appendChild(ui);
    texte.appendChild(h2);sous.appendChild(p);texte.appendChild(sous);phrase.appendChild(texte);plan.appendChild(phrase);
    apres.classList.add('ph1-apres');
    /* déplacer la vidéo peut la mettre en pause sur certains navigateurs : on relance */
    var v=hero.querySelector('video');
    if(v&&v.paused&&v.getAttribute('src')){var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});}

    /* numéro de ligne de chaque mot (pour faire monter la phrase ligne par ligne)
       et bas de la phrase et de la petite phrase dans la scène (pour les effacer avant que 01 ne les recouvre) */
    var basH=0,basP=0;
    function lignes(){var haut=null,l=-1;
      [].forEach.call(h2.querySelectorAll('.w'),function(w){var t=w.offsetTop;
        if(haut===null||t>haut+4){l++;haut=t;}w.style.setProperty('--l',l);});
      basH=texte.offsetTop+h2.offsetTop+h2.offsetHeight;basP=texte.offsetTop+p.offsetTop+p.offsetHeight;demande();}
    lignes();
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(lignes);

    /* deux états : le titre (tout en haut) ou la phrase (dès qu'on descend un peu).
       Pendant l'ouverture « Relais » (ses calques sont encore là), on garde le titre : la phrase attend la fin */
    function etat(on){if(on===b)return;b=on;stage.classList.toggle('ph1-b',on);}
    function enOuverture(){return !!(document.getElementById('intro')||document.getElementById('relais5'));}

    function cadre(){raf=0;
      var y=scrollY,H=innerHeight;
      if(!b&&y>H*.03){if(enOuverture())setTimeout(demande,120);else etat(true);}
      else if(b&&y<H*.012)etat(false);
      /* « Réduire les animations » : la vidéo reste épinglée (simple défilement, 01 passe dessus)
         mais rien ne bouge en plus : ni zoom, ni recul, ni décalage ; seulement l'ombre et le fondu de la phrase */
      var m=PH.reduit?0:1;
      /* dès le premier pixel : la vidéo avance doucement (zoom lent) et la phrase monte un peu moins vite que la page.
         Quand 01 entre dans l'écran : la vidéo recule légèrement et s'assombrit (comme sous une feuille qui passe).
         Tout est compté dans la scène (f = haut de 01 par rapport à la scène) : une fois la vidéo libérée, plus rien ne bouge,
         la scène part d'un bloc (sinon la phrase revenait au-dessus de 01).
         Sortie : quand 01 approche, la petite phrase s'efface, puis la grande, avant d'atteindre le menu */
      var s0=stage.getBoundingClientRect().top,f=fp1.getBoundingClientRect().top-s0,
          ov=Math.max(0,Math.min(H,H-f)),d=-.18*ov*m,k=Math.min(1,y/H)*m,dp=-.08*H*k,
          g=f-d-dp-basP,oP=Math.max(0,Math.min(1,(g-H*.04)/(H*.08))),o=Math.max(0,Math.min(1,(g+H*.02)/(H*.08)));
      /* tant que la vidéo est épinglée, les calques de l'ouverture « Relais » restent avec elle (sinon, si on défile
         pendant l'ouverture, le papier blanc monte avec la page et laisse voir une bande de vidéo brute en bas) */
      var ep=s0>-1;if(ep!==epingle){epingle=ep;document.documentElement.classList.toggle('ph1-epingle',ep);}
      plan.style.transform=d<0?'translate3d(0,'+d.toFixed(1)+'px,0)':'';
      hero.style.transform=k>0?'scale('+(1+.06*k).toFixed(4)+')':'';
      ombre.style.opacity=(ov/H*.5).toFixed(3);
      phrase.style.transform=k>0?'translate3d(0,'+dp.toFixed(1)+'px,0)':'';
      phrase.style.opacity=o<1?o.toFixed(3):'';
      sous.style.opacity=oP<1?oP.toFixed(3):'';
    }
    addEventListener('scroll',demande,{passive:true});
    var att=0;addEventListener('resize',function(){demande();clearTimeout(att);att=setTimeout(lignes,150);});
    cadre();
  });
})();

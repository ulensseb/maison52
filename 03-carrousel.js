/* 03 « Pour qui » — proposition « carrousel », v2 (17/10).
   Rangee de quatre portraits en defilement NATIF (overflow-x + scroll-snap) : pas de transform ni de will-change,
   le multiply des videos se fait contre le fond opaque de la rangee. La position f (0 = premier profil) est lue
   dans scrollLeft et pilote tout le reste : voile des portraits, fondu enchaine du texte, filet de l'index.
   Les categories sortent des articles pour former l'index [01]-[04], toujours visible et tapable. */
(function(){
  var S=document.getElementById('fp-3'),P=window.M52P;if(!S||!P)return;
  var pile=S.querySelector('.personas'),arts=[].slice.call(pile.querySelectorAll('.persona'));
  var label=S.querySelector('.label'),h3=S.querySelector('h3'),note=S.querySelector('.note');
  var N=arts.length,reduit=P.reduit;if(!N)return;
  var LARG={fondatrice:546,independant:604,etudiant:612,transition:1228};   /* largeur des videos (hauteur 960) */
  function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h)e.innerHTML=h;return e;}
  function deux(n){return (n<10?'0':'')+n;}
  var FL='<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4"/></svg>';

  /* ---- structure : colonne (etiquette, titre, texte, commandes, note) + scene (rangee, index) ;
     sur telephone les deux s'effacent (display:contents) et l'ordre CSS empile tout ---- */
  S.classList.add('k3');
  var grille=el('div','k3-grid'),col=el('div','k3-col'),main=el('div','k3-main'),vp=el('div','k3-vp'),tabs=el('div','k3-tabs');
  label.parentNode.insertBefore(grille,label);
  var ctrl=el('div','k3-ctrl',
    '<div class="k3-cpt" aria-hidden="true"><span class="k3-roll"><b>01</b></span><span>/ '+deux(N)+'</span></div>'+
    '<div class="k3-fl"><button type="button" class="prec" aria-label="Profil précédent">'+FL+'</button>'+
    '<button type="button" class="suiv" aria-label="Profil suivant">'+FL+'</button></div>');
  col.appendChild(label);col.appendChild(h3);col.appendChild(pile);col.appendChild(ctrl);if(note)col.appendChild(note);
  main.appendChild(vp);main.appendChild(tabs);
  grille.appendChild(col);grille.appendChild(main);
  var roll=ctrl.querySelector('.k3-roll'),bPrec=ctrl.querySelector('.prec'),bSuiv=ctrl.querySelector('.suiv');
  vp.setAttribute('aria-hidden','true');                       /* decor : la navigation passe par l'index et les fleches */
  tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Les quatre profils');
  var pouce=el('i','k3-pouce');pouce.setAttribute('aria-hidden','true');tabs.appendChild(pouce);

  /* ---- un portrait par profil dans la rangee, la categorie (.idx) part dans l'index ---- */
  var slots=[],btns=[];
  arts.forEach(function(a,i){
    var p=P.persos[i],s=el('div','k3-s'),fig=el('div','k3-fig'),v=P.video(i);
    if(LARG[p.nom])v.style.aspectRatio=LARG[p.nom]+' / 960';
    fig.appendChild(v);s.appendChild(fig);vp.appendChild(s);s._v=v;slots.push(s);
    var b=el('button','k3-tab'),n=el('span','k3-n'),idx=a.querySelector('.idx');
    b.type='button';b.id='k3-tab'+i;b.setAttribute('role','tab');
    n.textContent='['+deux(i+1)+']';n.setAttribute('aria-hidden','true');
    b.appendChild(n);b.appendChild(document.createTextNode(' '));if(idx)b.appendChild(idx);
    tabs.appendChild(b);btns.push(b);
    a.id='k3-p'+i;a.setAttribute('role','tabpanel');a.setAttribute('aria-labelledby',b.id);b.setAttribute('aria-controls',a.id);
  });
  slots[N-1].classList.add('k3-der');
  var fin=el('div','k3-fin');vp.appendChild(fin);   /* place vide en fin de rangee : le 04 se pose lui aussi dans la case gauche */

  /* ---- etat : f = position lue dans le defilement, en nombre de profils ---- */
  var f=0,actif=-1,cible=0,tCible=0,step=1,PAR=0,TX=0,visible=false,vu=false,raf=0,larg=innerWidth;
  function mesurer(){var sw=slots[0].offsetWidth,mr=parseFloat(getComputedStyle(slots[0]).marginRight)||0,
      pl=parseFloat(getComputedStyle(vp).paddingLeft)||0,bureau=innerWidth>860;
    step=sw+mr||1;fin.style.width=Math.max(0,vp.clientWidth-pl-sw-mr)+'px';
    PAR=reduit?0:sw*(bureau?.05:.14);TX=reduit?0:(bureau?20:26);}
  function borne(i){return Math.max(0,Math.min(N-1,i));}
  function rendre(){var fc=borne(f);
    slots.forEach(function(s,i){var d=i-f,a=Math.abs(d);
      /* voile : 0 sur l'actif, 0,55 sur le suivant (visage lisible mais pali), plein au-dela et a la sortie */
      var o=d<0?Math.min(1,a*1.3):(a<=1?.55*a:Math.min(1,.55+(a-1)*1.5));
      s.style.setProperty('--o',o.toFixed(3));
      s._v.style.setProperty('--px',(-Math.max(-1,Math.min(1,d))*PAR).toFixed(1)+'px');});   /* le suivant avance son visage */
    arts.forEach(function(a,i){var d=Math.max(-1,Math.min(1,i-f));   /* le texte suit le doigt ; la bascule se fait en CSS */
      a.style.setProperty('--t',(1-Math.min(Math.abs(d),.5)*.8).toFixed(3));a.style.setProperty('--tx',(d*TX).toFixed(1)+'px');});
    tabs.style.setProperty('--f',fc.toFixed(4));
    var n=Math.round(fc);if(n!==actif)activer(n);}
  function activer(a){var av=actif;actif=a;
    slots.forEach(function(s,i){s.classList.toggle('on',i===a)});
    arts.forEach(function(x,i){x.classList.toggle('on',i===a)});
    btns.forEach(function(b,i){b.setAttribute('aria-selected',i===a?'true':'false');b.tabIndex=i===a?0:-1;});
    if(av>=0){var vv=slots[av]._v;P.arreter(vv);clearTimeout(vv._k3);   /* retour a la pose de repos une fois pali */
      vv._k3=setTimeout(function(){if(slots[actif]._v!==vv){try{vv.currentTime=0}catch(e){}}},500);}
    if(visible)P.jouer(slots[a]._v);
    compteur(a,av);bPrec.disabled=a===0;bSuiv.disabled=a===N-1;}
  /* compteur : le chiffre roule vers le haut (ou vers le bas quand on revient) */
  function compteur(a,av){var t=deux(a+1),vieux=roll.lastElementChild;if(vieux&&vieux.textContent===t)return;
    var nb=el('b');nb.textContent=t;var monte=av<0||a>av;
    if(reduit||!vieux){roll.innerHTML='';roll.appendChild(nb);return;}
    nb.className=monte?'bas':'haut';roll.appendChild(nb);nb.offsetWidth;
    nb.className='';vieux.className=monte?'haut':'bas';setTimeout(function(){if(vieux.parentNode)vieux.remove()},520);}

  /* ---- navigation : tout passe par le defilement natif (doigt, index, fleches, clic sur le suivant, clavier) ---- */
  function aller(i){cible=borne(i);tCible=performance.now();vp.scrollTo({left:cible*step,behavior:reduit?'auto':'smooth'});}
  vp.addEventListener('scroll',function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;f=vp.scrollLeft/step;
    if(performance.now()-tCible>700)cible=borne(Math.round(f));rendre();});},{passive:true});
  btns.forEach(function(b,i){b.addEventListener('click',function(){aller(i)})});
  slots.forEach(function(s,i){s.addEventListener('click',function(){if(i!==actif)aller(i)})});
  bPrec.addEventListener('click',function(){aller(cible-1)});
  bSuiv.addEventListener('click',function(){aller(cible+1)});
  tabs.addEventListener('keydown',function(e){var k=e.key,i=null;
    if(k==='ArrowRight')i=cible+1;else if(k==='ArrowLeft')i=cible-1;else if(k==='Home')i=0;else if(k==='End')i=N-1;
    if(i===null)return;e.preventDefault();i=borne(i);aller(i);btns[i].focus();});

  /* ---- souris (ordinateur) : on peut aussi attraper la rangee ; le doigt, lui, reste natif ---- */
  var prise=null,bouge=false;
  vp.addEventListener('pointerdown',function(e){if(prise||e.pointerType!=='mouse'||e.button>0)return;
    prise={x:e.clientX,s:vp.scrollLeft,id:e.pointerId,a:actif};bouge=false;});
  addEventListener('pointermove',function(e){if(!prise||e.pointerId!==prise.id)return;var dx=e.clientX-prise.x;
    if(!bouge){if(Math.abs(dx)<6)return;bouge=true;vp.classList.add('glisse');}
    vp.scrollLeft=prise.s-dx;});
  addEventListener('pointerup',function(e){if(!prise||e.pointerId!==prise.id)return;var dx=e.clientX-prise.x,a=prise.a;prise=null;
    if(!bouge)return;aller(Math.abs(dx)>40?a+(dx<0?1:-1):a);
    setTimeout(function(){vp.classList.remove('glisse')},650);});
  vp.addEventListener('click',function(e){if(bouge){e.preventDefault();e.stopPropagation();bouge=false;}},true);
  vp.addEventListener('dragstart',function(e){e.preventDefault()});

  /* ---- arrivee : cascade du texte une seule fois ; la video ne joue que si la scene est a l'ecran ---- */
  function reveler(){if(vu)return;vu=true;S.classList.add('k3-vu');setTimeout(function(){S.classList.add('k3-pret')},1100);}
  P.siVisible(vp,function(on){visible=on;var v=slots[actif]&&slots[actif]._v;
    if(on){P.jouer(v);reveler();}
    else P.arreter(v);},.35);
  /* arrivee par le bas (on remonte depuis la section suivante) : le texte entre avant la rangee, il se revele seul */
  P.siVisible(pile,function(on){if(on)reveler();},.15);
  /* seul un changement de largeur recalcule (la barre d'outils d'iOS qui apparait ne touche a rien) */
  addEventListener('resize',function(){if(innerWidth===larg)return;larg=innerWidth;mesurer();
    vp.scrollLeft=actif*step;f=actif;rendre();});
  mesurer();f=0;rendre();
})();

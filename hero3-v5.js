/* V5 « Relais » : Maison 52 en grand, la video dans les lettres, puis le mot retrecit
   jusqu'a la place exacte du titre du site et lui passe le relais (meme police, meme casse). */
(function(){
var COURBE='cubic-bezier(.7,0,.2,1)',DOUX='cubic-bezier(.4,0,.2,1)',BASCULE='cubic-bezier(.45,0,.55,1)';
H3.quandPret(function(){
  var h1=document.querySelector('#hero-ui h1'),em=h1.querySelector('em');
  var c=H3.calque('clair'),intro=c.intro,mot=c.mot;
  /* deux morceaux : chacun a un porteur (vertical) et un coeur (horizontal + echelle) */
  mot.innerHTML='<span class="r5 r5m"><span class="r5i">Maison</span></span><span class="r5sp"> </span>'+
    '<span class="r5 r5c"><span class="r5i">52</span></span>';
  copie(mot,h1,em);taille(mot);
  /* deux copies posees pile sur le mot, invisibles pendant la pose : les lettres blanches et leur trait d'ombre */
  var trait=double5('trait5',mot),blanc=double5('relais5',mot),parti=false;ombre5(trait,h1,em);
  H3.montre();
  /* si la police arrive apres coup (reseau lent), on recale les tailles tant que le mot est en pose */
  if(document.fonts)document.fonts.ready.then(function(){if(parti)return;
    [mot,trait.firstChild,blanc.firstChild].forEach(function(m){copie(m,h1,em);taille(m);});ombre5(trait,h1,em);});
  setTimeout(function(){parti=true;
    /* reduit : un seul fondu de 0,45 s, sans mouvement. Le mot fond d'abord dans le papier (pas de fantome geant
       sous le titre), le papier se leve, le titre apparait sur la seconde moitie */
    if(H3.reduit){H3.fini(trait);H3.fini(blanc);
      mot.style.transition='opacity .2s '+DOUX;mot.style.opacity=0;
      intro.style.transition='opacity .45s '+DOUX;intro.style.opacity=0;
      setTimeout(function(){titre5(h1)},150);setTimeout(function(){H3.fini(intro)},500);return;}
    relais(h1,em,intro,trait,blanc);
  },1050);
});
/* boite du texte d'un noeud texte (sans les marges de ligne) */
function plage5(t,debut,fin){var r=document.createRange();
  r.setStart(t,debut||0);r.setEnd(t,fin==null?t.nodeValue.length:fin);return r.getBoundingClientRect();}
/* boite d'un mot (« Maison », « 52 ») dans le vrai titre */
function plageMot(el,mot){var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),n,i;
  while((n=w.nextNode())){i=n.nodeValue.indexOf(mot);if(i>=0)return plage5(n,i,i+mot.length);}return el.getBoundingClientRect();}
function texte5(p){return p.querySelector('.r5i').firstChild;}
function double5(id,mot){var d=document.createElement('div');d.id=id;d.appendChild(mot.cloneNode(true));document.body.appendChild(d);return d;}
/* meme graisse et meme approche que le titre (l'approche en em, posee sur chaque morceau, suit sa taille) */
function copie(mot,h1,em){[['.r5m',h1],['.r5sp',h1],['.r5c',em]].forEach(function(x){var c=getComputedStyle(x[1]),p=mot.querySelector(x[0]);
  p.style.fontWeight=c.fontWeight;p.style.letterSpacing=(parseFloat(c.letterSpacing)/parseFloat(c.fontSize)||0)+'em';});}
/* mise en page de la pose : deux lignes (« Maison » puis un 52 geant) seulement sur un ecran etroit ET assez haut ;
   sinon une ligne (ordinateur, mais aussi telephone a l'horizontale, ou le 52 geant sortait de l'ecran) */
function deux5(){return innerWidth<=860&&innerHeight>=innerWidth*1.2;}
/* tailles : une ligne a 88 % de la largeur ; deux lignes : « Maison » puis un 52 geant de meme largeur */
function taille(mot){var m=mot.querySelector('.r5m'),n=mot.querySelector('.r5c'),dispo=innerWidth*.88,r;
  mot.classList.toggle('r5x',deux5());
  if(!deux5()){mot.style.fontSize='100px';r=document.createRange();r.selectNodeContents(mot);
    mot.style.fontSize=(100*dispo/r.getBoundingClientRect().width*.99)+'px';return;}
  m.style.fontSize=n.style.fontSize='100px';var wM=plage5(texte5(m)).width,w5=plage5(texte5(n)).width,f=100*dispo/wM*.99;
  /* plafond de hauteur : le mot entier tient dans 80 % de l'ecran (tablette, fenetre partagee) */
  var h=plage5(texte5(m)).height+plage5(texte5(n)).height*wM/w5;f=Math.min(f,100*innerHeight*.8/h);
  m.style.fontSize=f+'px';n.style.fontSize=(f*wM/w5)+'px';}
/* trait d'ombre sous les lettres blanches pendant le vol (serre, sans grand halo) : il les detache de la facade
   blanche. Divise par l'echelle pour arriver a la bonne finesse. Il s'efface quand le vrai titre et son halo
   apparaissent dessous. */
var TRAIT='0 1px 3px rgba(0,0,0,.5),0 3px 16px rgba(0,0,0,.22)';
function ombre5(trait,h1,em){
  [['.r5m',h1],['.r5c',em]].forEach(function(x){var p=trait.querySelector(x[0]),
    s=parseFloat(getComputedStyle(x[1]).fontSize)/parseFloat(getComputedStyle(p).fontSize);
    p.style.textShadow=TRAIT.replace(/(-?[\d.]+)px/g,function(m,v){return (v/s)+'px'});});}
/* le relais : chaque morceau va se poser sur son double dans le titre, le papier se leve, la copie blanche prend le relais.
   Pose en deux lignes : le 52 file d'abord dans sa case a droite, « Maison » descend ensuite (sinon ils se croisent). */
function relais(h1,em,intro,trait,blanc){
  /* [morceau, cible, reference de taille, duree horizontale+echelle, retard vertical, duree verticale] */
  var mobile=intro.querySelector('.mot').classList.contains('r5x'),FIN=mobile?1000:950,
    cibles=[['.r5m',plageMot(h1,'Maison'),h1].concat(mobile?[550,150,850]:[950,0,950]),
            ['.r5c',plageMot(em,'52'),em].concat(mobile?[700,0,700]:[950,0,950])];
  [intro,trait,blanc].forEach(function(calque){cibles.forEach(function(x){
    var p=calque.querySelector(x[0]),i=p.firstChild,b=i.getBoundingClientRect(),a=plage5(texte5(p)),t=x[1],
      s=parseFloat(getComputedStyle(x[2]).fontSize)/parseFloat(getComputedStyle(p).fontSize);
    i.style.transition='transform '+x[3]+'ms '+COURBE;
    i.style.transform='translateX('+(t.left-b.left-s*(a.left-b.left))+'px) scale('+s+')';
    p.style.transition='transform '+x[5]+'ms '+COURBE+' '+x[4]+'ms';
    p.style.transform='translateY('+(t.top-b.top-s*(a.top-b.top))+'px)';});});
  /* la video ne quitte jamais l'ecran : le papier se leve, et les lettres basculent de « video » a « blanc »
     en 0,16 s pile quand le papier est a mi-chemin (le seul instant ou mot et fond se valent dure 2 images).
     Le trait d'ombre ne vient qu'apres, sous des lettres deja blanches (avant, il dessinait un mot flou) */
  intro.style.transition='opacity .36s '+DOUX+' .12s';intro.style.opacity=0;
  blanc.style.transition='opacity .16s '+BASCULE+' .185s';blanc.style.opacity=1;
  trait.style.transition='opacity .25s '+DOUX+' .26s';trait.style.opacity=1;
  /* pose : le vrai titre apparait dessous avec son halo, le trait s'efface, puis on retire les copies */
  setTimeout(function(){titre5(h1);trait.style.transition='opacity .35s '+DOUX;trait.style.opacity=0;
    setTimeout(function(){H3.fini(blanc);H3.fini(trait);H3.fini(intro);},400);},FIN+40);}
/* le vrai titre arrive en fondu (0,35 s) puis retrouve exactement son style du site */
function titre5(h1){h1.style.transition='opacity .35s '+DOUX;H3.pret();
  setTimeout(function(){h1.style.transition='';},450);}
})();

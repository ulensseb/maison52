/* 03 Pour qui — proposition « editorial » v2 (s'appuie sur window.M52P de 03-commun.js).
   Chaque profil devient : .fig (buste video) / .tete ([01] + etiquette + titre) / .corps (texte + 2 coches).
   Aucun texte n'est modifie : les elements existants sont seulement deplaces ; [01] et les coches sont
   decoratifs (aria-hidden).
   - Cascade a 25 % de visibilite (rootMargin -10 % en bas).
   - Une seule video joue a la fois : sur ordinateur en relais 01 -> 04 a la fin de chaque geste
     (le survol choisit le profil) ; sur telephone, le profil le plus proche du centre de l'ecran.
   - Telephone : la montee du texte par-dessus le buste est en CSS (animation-timeline), pas en JS :
     elle suit le defilement sans decalage d'une image (pas de tremblement sur iPhone). */
(function(){
  var S=document.getElementById('fp-3'),P=window.M52P;
  if(!S||!P)return;
  var arts=[].slice.call(S.querySelectorAll('.persona'));
  if(!arts.length)return;
  S.classList.add('ed');
  var largeurs=[546,604,612,1228];          // largeur des videos (hauteur 960) : evite un saut avant chargement
  var ordi=matchMedia('(min-width:861px)');
  var CK='<svg class="ck" viewBox="0 0 16 16" aria-hidden="true" focusable="false">'+
         '<circle cx="8" cy="8" r="8"/><path d="M4.7 8.2l2.2 2.2 4.4-4.6"/></svg>';
  var vids=[],figs=[];
  function el(cl){var d=document.createElement('div');d.className=cl;return d;}

  arts.forEach(function(a,i){
    var idx=a.querySelector('.idx'),h4=a.querySelector('h4'),p=a.querySelector('p'),ul=a.querySelector('.points');
    /* buste : .fig (recadrage) > .enc (multiply + noir et blanc) > .cad (placement + rognage des bords) > video
       La video elle-meme ne recoit aucun effet (ni transform, ni filter, ni clip-path) : cas le plus sur sur iOS.
       04 en miroir : la veste lancee part vers le bord de l'ecran, jamais sur le texte. */
    var fig=el('fig'),enc=el('enc'),cad=el('cad');fig.setAttribute('aria-hidden','true');
    var v=P.video(i);v.setAttribute('disablepictureinpicture','');
    var miroir=i===3,c=P.persos[i].centre;
    cad.style.aspectRatio=largeurs[i]+' / 960';
    cad.style.setProperty('--c',miroir?(1-c).toFixed(3):c);
    if(miroir)a.classList.add('miroir');
    cad.appendChild(v);enc.appendChild(cad);fig.appendChild(enc);
    /* en-tete : [01] + etiquette, puis le titre */
    var tete=el('tete'),lab=el('lab'),no=document.createElement('span');
    no.className='no';no.setAttribute('aria-hidden','true');no.textContent='[0'+(i+1)+']';
    lab.appendChild(no);if(idx)lab.appendChild(idx);
    tete.appendChild(lab);if(h4)tete.appendChild(h4);
    /* texte et coches */
    var corps=el('corps');if(p)corps.appendChild(p);if(ul)corps.appendChild(ul);
    [].forEach.call(corps.querySelectorAll('.points li'),function(li){li.insertAdjacentHTML('afterbegin',CK);});
    a.appendChild(fig);a.appendChild(tete);a.appendChild(corps);
    /* ordre de la cascade : etiquette, titre, texte, point 1, point 2 (decalage 0,1 s) */
    [lab,h4,p].concat([].slice.call(corps.querySelectorAll('.points li'))).forEach(function(e,k){
      if(e)e.style.setProperty('--d',(.06+k*.1).toFixed(2)+'s');});
    vids.push(v);figs.push(fig);
  });

  /* ---------- cascade : quand un quart du profil est visible ---------- */
  if(P.reduit||!('IntersectionObserver' in window)){arts.forEach(function(a){a.classList.add('vu');});}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('vu');io.unobserve(e.target);}});},
      {threshold:.25,rootMargin:'0px 0px -10% 0px'});
    arts.forEach(function(a){io.observe(a);});
  }

  /* ---------- une seule video a la fois (les autres restent sur leur affiche ou leur derniere image) ---------- */
  var cur=-1,relais=null,voit=false;
  function lancer(i){
    clearTimeout(relais);
    if(cur>-1&&cur!==i)P.arreter(vids[cur]);
    cur=i;
    arts.forEach(function(a,k){a.classList.toggle('actif',k===i);});
    if(i<0)return;
    var v=vids[i];P.jouer(v);
    /* ordinateur : a la fin du geste, le profil suivant prend le relais */
    if(ordi.matches)v.onended=function(){
      relais=setTimeout(function(){if(voit&&ordi.matches)lancer((i+1)%arts.length);},700);};
  }
  /* ordinateur : la rangee entre a l'ecran -> relais a partir de 01 (apres la cascade) */
  P.siVisible(S.querySelector('.personas'),function(on){
    voit=on;if(!ordi.matches)return;
    clearTimeout(relais);
    if(on)relais=setTimeout(function(){lancer(cur<0?0:cur);},cur<0?650:150);
    else if(cur>-1)P.arreter(vids[cur]);
  },.3);
  /* ordinateur : le survol choisit le profil qui s'anime */
  arts.forEach(function(a,i){a.addEventListener('mouseenter',function(){if(ordi.matches&&voit&&i!==cur)lancer(i);});});

  /* telephone : la video du profil le plus proche du centre de l'ecran (lecture seule, aucune ecriture de style) */
  var raf=0;
  function choisir(){raf=0;if(ordi.matches)return;
    var vh=innerHeight,best=-1,bd=1e9;
    figs.forEach(function(f,i){var r=f.getBoundingClientRect(),c=r.top+r.height*.5,d=Math.abs(c-vh*.42);
      if(c>vh*.06&&c<vh*.94&&d<bd){bd=d;best=i;}});
    if(best!==cur)lancer(best);
  }
  addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(choisir);},{passive:true});
  ordi.addEventListener&&ordi.addEventListener('change',function(){lancer(-1);if(!ordi.matches)choisir();else if(voit)lancer(0);});
  choisir();

  /* typographie francaise : « ... » et l'espace avant : ; ? ! ne se coupent jamais en fin de ligne
     (le texte reste identique, il est seulement enveloppe dans un <span> insecable) */
  [].forEach.call(S.querySelectorAll('.persona p,.persona li,.note'),function(el){
    [].slice.call(el.childNodes).forEach(function(n){
      if(n.nodeType!==3||!/[«»:;?!]/.test(n.nodeValue))return;
      var re=/«\s[^»]{1,40}\s»|\S+\s[:;?!»]/g,s=n.nodeValue,f=document.createDocumentFragment(),k=0,m;
      while((m=re.exec(s))){f.appendChild(document.createTextNode(s.slice(k,m.index)));
        var sp=document.createElement('span');sp.className='nw';sp.textContent=m[0];f.appendChild(sp);k=m.index+m[0].length;}
      f.appendChild(document.createTextNode(s.slice(k)));el.replaceChild(f,n);
    });
  });
})();

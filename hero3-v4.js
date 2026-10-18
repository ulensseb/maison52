/* V4 « Nuit » : le mot sort du noir avec la video dedans, pousse lentement (travelling),
   puis le jour se leve : la facade apparait autour des lettres, les lettres grandissent
   et se fondent dans l'image, jusqu'a la video plein ecran. */
H3.quandPret(function(){
  var v=document.getElementById('hero-video'),parti=false;
  function go(){if(!parti){parti=true;lance();}}
  /* jamais des lettres noires sur du noir : on attend une image dans la video
     (affiche ou premiere image) sous le cache sombre ; si rien a 1,8 s du chargement,
     pas d'ouverture : le site arrive comme d'habitude */
  if(!v||v.readyState>=2)go();
  else{var im=new Image();im.onload=go;im.src=v.poster;if(im.complete&&im.naturalWidth)go();
    v.addEventListener('loadeddata',go);
    setTimeout(function(){if(!parti){parti=true;H3.pret();}},Math.max(300,1800-performance.now()));}

  function lance(){
    var c=H3.calque('sombre'),intro=c.intro,mot=c.mot;
    var t=H3.ajuste(mot,innerWidth*.86);mot.style.fontSize=t+'px';
    /* telephone a l'horizontale : le mot ne depasse jamais en hauteur */
    var hm=mot.getBoundingClientRect().height;if(hm>innerHeight*.8)mot.style.fontSize=(t*innerHeight*.8/hm)+'px';
    var voile=document.createElement('div');voile.id='v4voile';document.body.appendChild(voile);
    H3.montre();
    /* sans animations web : on montre, puis on retire */
    if(!mot.animate){H3.fini(voile);
      setTimeout(function(){H3.fini(intro);H3.pret();},1200);return;}
    /* pose de 1,35 s, raccourcie si le depart a tarde */
    var red=H3.reduit,POSE=Math.max(1100,Math.min(1350,1700-(performance.now()|0)));
    /* les lettres sortent de la nuit (le voile se dissipe) */
    voile.animate([{opacity:1},{opacity:0}],{duration:red?450:700,easing:'cubic-bezier(.3,.1,.3,1)',fill:'forwards'});
    setTimeout(function(){H3.fini(voile)},red?500:750);
    if(red){
      /* reduire les animations : uniquement des fondus (0,5 s au plus), aucun mouvement */
      intro.animate([{opacity:1},{opacity:0}],{delay:1250,duration:500,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});
      mot.animate([{opacity:1},{opacity:0}],{delay:1430,duration:170,easing:'cubic-bezier(.45,0,.55,1)',fill:'forwards'});
      setTimeout(H3.pret,1550);
      setTimeout(function(){H3.fini(intro)},1800);
      return;}
    /* travelling : 1 -> 1,08 en ligne droite, puis la camera accelere
       (croissance exponentielle, meme vitesse au raccord : aucun a-coup) */
    var L=900,D=POSE+L,a=Math.log(1.08)*L/POSE,b=Math.log(4/1.08)-a,k=[{transform:'scale(1)'}];
    for(var i=0;i<=16;i++){var u=i/16;
      k.push({transform:'scale('+(1.08*Math.exp(a*u+b*u*u*u)).toFixed(4)+')',offset:(POSE+u*L)/D});}
    mot.animate(k,{duration:D,fill:'forwards'});
    /* le jour se leve : la facade apparait autour des lettres encore pleines */
    intro.animate([{opacity:1},{opacity:0}],{delay:POSE,duration:L,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});
    /* puis les lettres se fondent dans l'image : aucun fantome qui traine */
    mot.animate([{opacity:1},{opacity:0}],{delay:POSE+.4*L,duration:.28*L,easing:'cubic-bezier(.45,0,.55,1)',fill:'forwards'});
    /* le titre du site arrive sur l'image nette */
    setTimeout(H3.pret,POSE+.6*L);
    setTimeout(function(){H3.fini(intro)},D+60);
  }
});

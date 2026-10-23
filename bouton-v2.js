/* Bouton « Rejoindre » — proposition 2 : met le mot du bouton dans un <span class="b2-mot">
   (le trait se pose sous le mot seulement). Le texte lui-meme ne change pas. */
PH.quandDom(function(){
  var a=document.querySelector('nav .links a.cta');
  if(!a||a.querySelector('.b2-mot'))return;
  var s=document.createElement('span');s.className='b2-mot';
  while(a.firstChild)s.appendChild(a.firstChild);
  a.appendChild(s);
});

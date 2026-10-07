/* Maison 52 - mise en scene 3D de la section « Pour qui » (v2, 2026-10-07).
   creerScene3D(conteneur) -> { montrer(i), arreter() }
   i = profil actif (0 fondateur, 1 independant, 2 etudiant, 3 en transition), -1 = hors section.
   Rendu : tons ACES, ombres douces, materiaux mats ; la fenetre de la piece du profil s'allume ;
   la camera change de cadrage avec un amorti critique ; la lumiere va du matin au soir. */
function creerScene3D(box) {
  var THREE = window.THREE;
  var reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = box.clientWidth, H = box.clientHeight;

  var ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  ren.setPixelRatio(Math.min(devicePixelRatio, 2));
  ren.setSize(W, H);
  ren.outputEncoding = THREE.sRGBEncoding;
  ren.toneMapping = THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure = 1.05;
  ren.shadowMap.enabled = true;
  ren.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(ren.domElement);

  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(28, W / H, 0.1, 100);

  var house = buildHouse(THREE, {
    wall: '#F3F1EC', wallShade: '#E2DFD8', roof: '#3B4045', plinth: '#8A8E90',
    frame: '#FBFBF9', glass: '#4E5660', glassOn: '#FFC27A', door: '#F1EEE8',
    cornice: '#A6AAAB', chimney: '#3B4045', sill: '#B4B8B9', iron: '#2A2826',
    bush: '#66704F', bush2: '#59623F', bush3: '#727B57'
  });
  scene.add(house);

  /* materiaux : Lambert -> Standard mat (couleurs converties pour la sortie sRGB) */
  var vitres = new Set(house.userData.winMats);
  house.traverse(function (o) {
    if (!o.isMesh) return;
    var m = o.material;
    if (m.map) { o.castShadow = false; o.receiveShadow = false; return; } /* ombre de contact */
    var c = m.color.clone().convertSRGBToLinear();
    var std;
    if (vitres.has(m)) {
      std = new THREE.MeshStandardMaterial({ color: new THREE.Color('#4E5660').convertSRGBToLinear(), roughness: 0.18, metalness: 0.35,
        emissive: new THREE.Color('#FFC27A').convertSRGBToLinear(), emissiveIntensity: 0 });
      std.userData.vitre = true;
    } else {
      std = new THREE.MeshStandardMaterial({ color: c, roughness: 0.88, metalness: 0, side: m.side });
    }
    o.material = std;
    o.castShadow = true; o.receiveShadow = true;
  });

  /* sol qui ne montre que les ombres : le fond reste celui de la page */
  var sol = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.16 }));
  sol.rotation.x = -Math.PI / 2; sol.position.y = 0.005; sol.receiveShadow = true;
  scene.add(sol);

  var ciel = new THREE.HemisphereLight(0xffffff, 0x8f8a80, 0.9);
  scene.add(ciel);
  var soleil = new THREE.DirectionalLight(0xffffff, 1.0);
  soleil.castShadow = true;
  soleil.shadow.mapSize.set(2048, 2048);
  soleil.shadow.camera.left = -7; soleil.shadow.camera.right = 7;
  soleil.shadow.camera.top = 7; soleil.shadow.camera.bottom = -7;
  soleil.shadow.camera.near = 1; soleil.shadow.camera.far = 40;
  soleil.shadow.bias = -0.0004; soleil.shadow.radius = 4;
  scene.add(soleil); scene.add(soleil.target);

  /* lueur chaude devant la fenetre allumee */
  var lueur = new THREE.PointLight(0xffb36b, 0, 4, 2);
  house.add(lueur);

  var b3 = new THREE.Box3().setFromObject(house), centre = b3.getCenter(new THREE.Vector3()), taille = b3.getSize(new THREE.Vector3());

  /* une fenetre par profil : la plus proche du point vise */
  var X = taille.x, Z = taille.z;
  var points = [
    new THREE.Vector3(-1.6, 1.4, 1.8),   /* fondateur : bureau du rez */
    new THREE.Vector3(1.6, 2.87, 1.8),   /* independant : chambre de l'etage */
    new THREE.Vector3(2.4, 2.87, 0.8),   /* etudiant : chambre sur le cote */
    new THREE.Vector3(0, 2.77, 1.8)      /* en transition : porte-fenetre du balcon */
  ];
  var verres = [];
  house.traverse(function (o) { if (o.isMesh && o.material.userData && o.material.userData.vitre) verres.push(o); });
  house.updateMatrixWorld(true);
  var choix = points.map(function (pt) {
    var best = null, bd = 1e9;
    verres.forEach(function (v) { var p = v.getWorldPosition(new THREE.Vector3()); var d = p.distanceTo(pt); if (d < bd) { bd = d; best = v; } });
    return best;
  });

  /* cadrages : azimut, elevation (degres), distance (x taille), point regarde */
  var CADRES = [
    { az: 22, el: 5, d: 1.05, cible: function () { return choix[0].getWorldPosition(new THREE.Vector3()).lerp(centre, 0.45); } },
    { az: -34, el: 15, d: 1.0, cible: function () { return choix[1].getWorldPosition(new THREE.Vector3()).lerp(centre, 0.45); } },
    { az: 78, el: 10, d: 1.05, cible: function () { return choix[2].getWorldPosition(new THREE.Vector3()).lerp(centre, 0.5); } },
    { az: 6, el: 36, d: 1.18, cible: function () { return choix[3].getWorldPosition(new THREE.Vector3()).lerp(centre, 0.55); } }
  ];
  var REPOS = { az: 28, el: 12, d: 1.3, cible: function () { return centre.clone(); } };

  /* lumiere : matin -> midi -> fin d'apres-midi -> soir */
  var LUMIERES = [
    { soleil: '#FFF0DC', i: 1.05, ciel: 0.95, dir: [-6, 7, 6], expo: 1.08, lueur: 1.2 },
    { soleil: '#FFFFFF', i: 1.15, ciel: 1.0, dir: [2, 9, 6], expo: 1.05, lueur: 1.2 },
    { soleil: '#FFC88C', i: 0.95, ciel: 0.75, dir: [8, 4.5, 5], expo: 1.0, lueur: 1.6 },
    { soleil: '#FF9A5C', i: 0.45, ciel: 0.42, dir: [7, 2.2, -4], expo: 0.95, lueur: 2.6 }
  ];

  var base = Math.max(taille.x, taille.y, taille.z) * (W < H ? 2.35 : 1.7);
  var etat = { az: REPOS.az, el: REPOS.el, d: REPOS.d, cible: REPOS.cible() };
  var vise = { az: REPOS.az, el: REPOS.el, d: REPOS.d, cible: REPOS.cible() };
  var lum = { r: 1, g: 1, b: 1, i: 1, ciel: 1, x: -6, y: 7, z: 6, expo: 1.05, lueur: 0 };
  var lumVise = Object.assign({}, lum);
  var allumee = null, glow = 0;

  function appliquerLumiere(L) {
    var c = new THREE.Color(L.soleil);
    lumVise = { r: c.r, g: c.g, b: c.b, i: L.i, ciel: L.ciel, x: L.dir[0], y: L.dir[1], z: L.dir[2], expo: L.expo, lueur: L.lueur };
  }
  appliquerLumiere(LUMIERES[0]);
  Object.assign(lum, lumVise);

  var actif = -2, visible = false;
  function montrer(i) {
    visible = i >= 0;
    box.classList.toggle('on', visible);
    if (i === actif || i < 0) { if (i < 0) actif = i; return; }
    actif = i;
    var c = CADRES[i];
    vise = { az: c.az, el: c.el, d: c.d, cible: c.cible() };
    appliquerLumiere(LUMIERES[i]);
    allumee = choix[i];
    verres.forEach(function (v) { v.userData.cible = v === allumee ? 1 : 0; });
    var p = allumee.getWorldPosition(new THREE.Vector3());
    var n = p.clone().sub(centre); n.y = 0; n.normalize();
    lueur.position.copy(p).addScaledVector(n, 0.6);   /* la maison n'est pas tournee : local = monde */
    if (reduit) { etat = { az: vise.az, el: vise.el, d: vise.d, cible: vise.cible.clone() }; Object.assign(lum, lumVise); }
  }

  var dernier = performance.now(), t0 = dernier, enMarche = true;
  function boucle(now) {
    if (!enMarche) return;
    requestAnimationFrame(boucle);
    var dt = Math.min(0.05, (now - dernier) / 1000); dernier = now;
    var a = reduit ? 1 : 1 - Math.exp(-dt * 3.2);          /* amorti critique */
    etat.az += (vise.az - etat.az) * a; etat.el += (vise.el - etat.el) * a; etat.d += (vise.d - etat.d) * a;
    etat.cible.lerp(vise.cible, a);
    ['r', 'g', 'b', 'i', 'ciel', 'x', 'y', 'z', 'expo', 'lueur'].forEach(function (k) { lum[k] += (lumVise[k] - lum[k]) * (reduit ? 1 : 1 - Math.exp(-dt * 2.2)); });
    var t = (now - t0) / 1000;
    var az = (etat.az + (reduit ? 0 : Math.sin(t * 0.35) * 2.2)) * Math.PI / 180, el = (etat.el + (reduit ? 0 : Math.sin(t * 0.27) * 0.8)) * Math.PI / 180;
    var R = base * etat.d;
    cam.position.set(etat.cible.x + R * Math.sin(az) * Math.cos(el), etat.cible.y + R * Math.sin(el), etat.cible.z + R * Math.cos(az) * Math.cos(el));
    cam.lookAt(etat.cible);
    soleil.color.setRGB(lum.r, lum.g, lum.b); soleil.intensity = lum.i; ciel.intensity = lum.ciel;
    soleil.position.set(centre.x + lum.x, lum.y, centre.z + lum.z); soleil.target.position.copy(centre);
    ren.toneMappingExposure = lum.expo;
    glow += ((allumee ? 1 : 0) - glow) * a;
    verres.forEach(function (v) { var c = v.userData.cible || 0; v.material.emissiveIntensity += (c * 2.8 - v.material.emissiveIntensity) * (reduit ? 1 : 1 - Math.exp(-dt * 2.5)); });
    lueur.intensity = glow * lum.lueur * (reduit ? 1 : 0.9 + Math.sin(t * 2.1) * 0.1);
    ren.render(scene, cam);
  }
  requestAnimationFrame(boucle);

  addEventListener('resize', function () {
    W = box.clientWidth; H = box.clientHeight; ren.setSize(W, H); cam.aspect = W / H; cam.updateProjectionMatrix();
    base = Math.max(taille.x, taille.y, taille.z) * (W < H ? 2.35 : 1.7);
  });
  return { montrer: montrer, arreter: function () { enMarche = false; } };
}

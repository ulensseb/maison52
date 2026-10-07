/* Maison 52 - modele 3D parametrique de la facade (buildHouse(THREE, palette) -> THREE.Group). */
function buildHouse(THREE, P) {
  const g = new THREE.Group();
  const M = (c, opt) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, opt || {}));
  const IRON = P.iron || '#2F2C29';

  // dimensions
  const W = 4.8, D = 3.6, H = 3.35;        // corps principal (2 niveaux)
  const PL = 0.45;                          // soubassement gris
  const RH = 1.15, OV = 0.12;               // toit
  const yRDC = PL + 0.95;                   // centre fenêtres rez
  const yET  = PL + 2.42;                   // centre fenêtres étage

  // soubassement
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(W + 0.14, PL, D + 0.14), M(P.plinth));
  plinth.position.y = PL / 2;
  g.add(plinth);

  // murs blancs
  const walls = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), M(P.wall));
  walls.position.y = PL + H / 2;
  g.add(walls);

  // deux bandeaux gris (niveau seuils rez et seuils étage, comme sur la façade réelle)
  [PL + 0.30, PL + 1.72].forEach(function(y, i){
    const band = new THREE.Mesh(new THREE.BoxGeometry(W + 0.08, i ? 0.1 : 0.08, D + 0.08), M(P.cornice));
    band.position.y = y;
    g.add(band);
  });

  // corniche + denticules
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(W + 0.22, 0.16, D + 0.22), M(P.cornice));
  cornice.position.y = PL + H + 0.08;
  g.add(cornice);
  function dentils(n, axis, fixed) {
    for (let i = 0; i < n; i++) {
      const t = -1 + 2 * (i / (n - 1));
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), M(P.cornice));
      if (axis === 'x') d.position.set(t * (W / 2 - 0.22), PL + H - 0.045, fixed);
      else d.position.set(fixed, PL + H - 0.045, t * (D / 2 - 0.22));
      g.add(d);
    }
  }
  dentils(13, 'x', D / 2 + 0.05); dentils(13, 'x', -(D / 2 + 0.05));
  dentils(9, 'z', W / 2 + 0.05); dentils(9, 'z', -(W / 2 + 0.05));

  // toit à croupes en ardoise
  const rw = W / 2 + OV, rd = D / 2 + OV, ridge = W * 0.3, ry0 = PL + H + 0.16, ry1 = ry0 + RH;
  const v = [
    [-rw, ry0, -rd], [rw, ry0, -rd], [rw, ry0, rd], [-rw, ry0, rd],
    [-ridge, ry1, 0], [ridge, ry1, 0]
  ];
  const faces = [[0, 1, 5], [0, 5, 4], [2, 3, 4], [2, 4, 5], [1, 2, 5], [3, 0, 4]];
  const pos = [];
  faces.forEach(f => f.forEach(i => pos.push(v[i][0], v[i][1], v[i][2])));
  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  roofGeo.computeVertexNormals();
  g.add(new THREE.Mesh(roofGeo, M(P.roof, { side: THREE.DoubleSide })));

  // cheminées : brique à droite, discrète à gauche
  const chR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.4), M(P.chimney));
  chR.position.set(ridge * 0.95, ry1 + 0.15, 0); g.add(chR);
  const chRcap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.48), M(P.cornice));
  chRcap.position.set(ridge * 0.95, ry1 + 0.78, 0); g.add(chRcap);
  const chL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.28), M(P.roof));
  chL.position.set(-ridge * 0.95, ry1 + 0.05, 0); g.add(chL);

  // fronton central au-dessus de la corniche, avec fenêtre cintrée
  const fronton = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.05, 0.3), M(P.wall));
  fronton.position.set(0, PL + H + 0.5, D / 2 - 0.13);
  g.add(fronton);
  const frCap = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.1, 0.4), M(P.cornice));
  frCap.position.set(0, PL + H + 1.06, D / 2 - 0.13);
  g.add(frCap);

  // fenêtre : encadrement gris, châssis blanc, vitrage, croisillons, seuil, crête décorative
  const winMats = [];
  function windowMesh(w, h, lit, deco) {
    const grp = new THREE.Group();
    const surround = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, h + 0.22, 0.05), M(P.sill));
    surround.position.z = -0.015;
    grp.add(surround);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), M(P.frame));
    grp.add(frame);
    const glassMat = M(lit ? '#000000' : P.glass, lit ? { emissive: P.glassOn, emissiveIntensity: 0.9 } : {});
    glassMat.userData.lit = lit;
    winMats.push(glassMat);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, h - 0.1, 0.04), glassMat);
    glass.position.z = 0.015;
    grp.add(glass);
    const mid = new THREE.Mesh(new THREE.BoxGeometry(0.035, h - 0.1, 0.05), M(P.frame));
    mid.position.z = 0.02; grp.add(mid);
    const trav = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, 0.035, 0.05), M(P.frame));
    trav.position.set(0, h * 0.18, 0.02); grp.add(trav);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.28, 0.07, 0.16), M(P.sill));
    sill.position.set(0, -h / 2 - 0.045, 0.05);
    grp.add(sill);
    if (deco) {
      const crest = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.07), M(P.sill));
      crest.position.set(0, h / 2 + 0.14, 0.01); grp.add(crest);
      const key = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.08), M(P.sill));
      key.position.set(0, h / 2 + 0.2, 0.005); grp.add(key);
      const apron = new THREE.Mesh(new THREE.BoxGeometry(w * 0.66, 0.16, 0.04), M(P.sill));
      apron.position.set(0, -h / 2 - 0.17, 0.01); grp.add(apron);
    }
    return grp;
  }

  // façade avant (z+) : 3 travées symétriques
  const bays = [-W / 3, 0, W / 3];
  const zF = D / 2 + 0.02;
  // rez : deux grandes fenêtres décorées, porte au centre
  [bays[0], bays[2]].forEach((x, i) => {
    const win = windowMesh(0.95, 1.35, i === 1, true);
    win.position.set(x, yRDC, zF);
    g.add(win);
  });
  // étage : deux fenêtres décorées + porte-fenêtre centrale avec balcon
  [bays[0], bays[2]].forEach((x, i) => {
    const win = windowMesh(0.9, 1.3, i === 0, true);
    win.position.set(x, yET, zF);
    g.add(win);
  });
  const french = windowMesh(0.85, 1.5, false, true);
  french.position.set(0, yET - 0.1, zF);
  g.add(french);

  // balcon en fer forgé sur socle de pierre
  const balcSlab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.34), M(P.cornice));
  balcSlab.position.set(0, yET - 0.94, D / 2 + 0.18);
  g.add(balcSlab);
  const railMat = M(IRON);
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.42, 0.022), railMat);
    b.position.set(-0.52 + i * 0.13, yET - 0.69, D / 2 + 0.33);
    g.add(b);
  }
  const railTop = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.035, 0.035), railMat);
  railTop.position.set(0, yET - 0.47, D / 2 + 0.33);
  g.add(railTop);
  [-1, 1].forEach(s => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.3), railMat);
    side.position.set(s * 0.55, yET - 0.47, D / 2 + 0.185);
    g.add(side);
  });

  // fenêtre cintrée du fronton
  const attic = windowMesh(0.42, 0.6, false, false);
  attic.position.set(0, PL + H + 0.45, D / 2 + 0.03);
  g.add(attic);
  const arch = new THREE.Mesh(new THREE.CircleGeometry(0.31, 14, 0, Math.PI), M(P.sill));
  arch.position.set(0, PL + H + 0.75, D / 2 + 0.035);
  g.add(arch);

  // porte : haute, blanche, imposte vitrée, encadrement gris, lanterne
  const doorH = 1.7;
  const doorGrp = new THREE.Group();
  const doorSurround = new THREE.Mesh(new THREE.BoxGeometry(1.18, doorH + 0.5, 0.07), M(P.sill));
  doorSurround.position.y = 0.18; doorGrp.add(doorSurround);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.92, doorH, 0.07), M(P.door));
  door.position.z = 0.02; doorGrp.add(door);
  /* 4 carreaux vitrés (même ambre que les fenêtres allumées) */
  const dgMat = M('#000000', { emissive: P.glassOn, emissiveIntensity: .9 });
  dgMat.userData.lit = true; winMats.push(dgMat);
  [[-0.21, 0.48], [0.21, 0.48], [-0.21, 0], [0.21, 0], [-0.21, -0.48], [0.21, -0.48]].forEach(c => {
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.02), dgMat);
    pane.position.set(c[0], c[1], 0.06); doorGrp.add(pane);
  });
  doorGrp.position.set(0, 0.14 + doorH / 2, D / 2 + 0.06);
  g.add(doorGrp);
  // perron : 3 marches
  [0, 1, 2].forEach(i => {
    const st = new THREE.Mesh(new THREE.BoxGeometry(1.5 - i * 0.14, 0.055, 0.8 - i * 0.2), M(P.plinth));
    st.position.set(0, 0.028 + i * 0.052, D / 2 + 0.5 - i * 0.12);
    g.add(st);
  });

  // pignons (x+/-) : 2 fenêtres par niveau, encadrement simple
  [-1, 1].forEach(sx => {
    [-D / 4.5, D / 4.5].forEach(z => {
      [[yRDC, 1.25], [yET, 1.2]].forEach((fy, fi) => {
        const win = windowMesh(0.8, fy[1], fi === 0, false);
        win.rotation.y = sx * Math.PI / 2;
        win.position.set(sx * (W / 2 + 0.02), fy[0], z);
        g.add(win);
      });
    });
  });

  // façade arrière : 3 travées, 2 niveaux
  bays.forEach((x) => {
    [yRDC, yET].forEach(fy => {
      const win = windowMesh(0.8, 1.2, false, false);
      win.rotation.y = Math.PI;
      win.position.set(x, fy, -(D / 2 + 0.02));
      g.add(win);
    });
  });

  // haies taillées + buissons (comme le jardinet de la vraie maison)
  const bushCols = [P.bush || '#5F6B3F', P.bush2 || '#515F38', P.bush3 || '#6B7847'];
  [-1, 1].forEach(s => {
    const hedge = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.55, 0.55), M(bushCols[0]));
    hedge.position.set(s * 1.45, 0.27, D / 2 + 0.85);
    g.add(hedge);
    const hedge2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1.0), M(bushCols[1]));
    hedge2.position.set(s * (W / 2 - 0.25), 0.25, D / 2 + 0.5);
    g.add(hedge2);
  });
  function bush(x, z, sc) {
    const grp = new THREE.Group();
    const n = 3 + Math.floor(sc * 2);
    for (let i = 0; i < n; i++) {
      const rr = (0.22 + 0.16 * ((i * 2654435761 % 97) / 97)) * sc;
      const b = new THREE.Mesh(new THREE.SphereGeometry(rr, 7, 5), M(bushCols[i % 3]));
      b.position.set(x + Math.sin(i * 2.4) * 0.3 * sc, rr * 0.55, z + Math.cos(i * 1.7) * 0.22 * sc);
      b.scale.y = 0.68;
      grp.add(b);
    }
    return grp;
  }
  const bx = W / 2 + 0.45, bz = D / 2 + 0.55;
  [[bx, D / 4, 1.0], [bx, -D / 4, 1.1], [-bx, D / 4, 1.05], [-bx, -D / 4, 0.9],
   [-W / 2 + 0.4, -bz, 1.1], [W / 2 - 0.4, -bz, 1.0]].forEach(c => g.add(bush(c[0], c[1], c[2])));

  // cibles caméra pour le zoom-fenêtres (positions locales au groupe)
  g.userData.targets = {
    frontTopCenter: { pos: [0, yET - 0.1, D / 2], n: [0, 0, 1] },
    frontTopLeft:   { pos: [-W / 3, yET, D / 2], n: [0, 0, 1] },
    sideRight:      { pos: [W / 2, yET, D / 4.5], n: [1, 0, 0] },
    sideLeft:       { pos: [-W / 2, yET, -D / 4.5], n: [-1, 0, 0] },
    backCenter:     { pos: [0, yET, -D / 2], n: [0, 0, -1] },
    door:           { pos: [0, PL + 1.0, D / 2], n: [0, 0, 1] }
  };

  // ombre de contact : ellipse douce sous la maison
  if (typeof document !== 'undefined') {
    const cnv = document.createElement('canvas'); cnv.width = cnv.height = 256;
    const ctx = cnv.getContext('2d');
    const grad = ctx.createRadialGradient(128,128,30,128,128,128);
    grad.addColorStop(0,'rgba(35,22,15,0.34)');
    grad.addColorStop(.55,'rgba(35,22,15,0.16)');
    grad.addColorStop(1,'rgba(35,22,15,0)');
    ctx.fillStyle = grad; ctx.fillRect(0,0,256,256);
    const tex = new THREE.CanvasTexture(cnv);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(W + 4.2, D + 3.6),
      new THREE.MeshBasicMaterial({map:tex, transparent:true, depthWrite:false}));
    sh.rotation.x = -Math.PI/2; sh.position.y = 0.012;
    g.add(sh);
  }

  g.userData.winMats = winMats;
  return g;
}

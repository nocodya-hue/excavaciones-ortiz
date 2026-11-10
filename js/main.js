// Transportes y Excavaciones Ortiz · interacciones (sin librerías)
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const suave = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const coma = (n, d = 2) => n.toFixed(d).replace('.', ',');
  // aleatorio con semilla (dibujos iguales en cada visita)
  let semilla = 7;
  const rnd = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };

  /* ── Cabecera ───────────────────────────────────────── */
  const cab = $('#cab');
  const alScroll = () => cab.classList.toggle('solida', scrollY > 40);
  addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  /* ── Revelado «mordida del cazo» ───────────────────── */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.dentado').forEach((el) => io.observe(el));

  /* ── El corte del terreno ──────────────────────────── */
  const lamina = $('#lamina');
  if (lamina) corte(lamina);

  function corte(svg) {
    const SUP = 300;      // rasante (y de la superficie)
    const M = 120;        // unidades por metro
    const HX0 = 300, HX1 = 640, TALUD = 0.12; // agujero: bordes arriba y pendiente de los taludes
    const B = { x: 268, y: 206 }, L1 = 318, L2 = 268; // giratoria: pivote de la pluma y longitudes

    // bordes ondulados de los estratos
    const borde = (base, a1, f1, a2, f2) => { const p = []; for (let x = -20; x <= 1020; x += 20) p.push([x, base + a1 * Math.sin(x / f1 + base) + a2 * Math.sin(x / f2 - base * .3)]); return p; };
    const bVeg = borde(337, 4, 70, 2, 23), bArc = borde(492, 9, 120, 3, 41), bRod = borde(696, 8, 95, 4, 33);
    const banda = (arr, abajo) => {
      const top = arr ? 'M' + arr.map((p) => p.join(' ')).join('L') : `M-20 ${SUP}L1020 ${SUP}`;
      const bot = abajo ? abajo.slice().reverse().map((p) => p.join(' ')).join('L') : '1020 980L-20 980';
      return `${top}L${bot}Z`;
    };
    const pts = (arr) => arr.map((p) => p.map((n) => +n.toFixed(1)).join(' ')).join('L');

    // texturas
    let tex = '';
    semilla = 11;
    for (let i = 0; i < 46; i++) { // raíces en la tierra vegetal
      const x = rnd() * 1000, y = SUP + 5 + rnd() * 16, l = 8 + rnd() * 16, c = (rnd() - .5) * 16;
      tex += `<path d="M${x.toFixed(0)} ${y.toFixed(0)}q${c.toFixed(0)} ${(l / 2).toFixed(0)} ${(c / 2).toFixed(0)} ${l.toFixed(0)}" stroke="#2c2219" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`;
    }
    for (let i = 0; i < 150; i++) { // gravas en la arcilla
      const x = rnd() * 1000, y = 350 + rnd() * 130, r = 2 + rnd() * 4.5;
      tex += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(1)}" ry="${(r * .7).toFixed(1)}" fill="${rnd() > .5 ? '#94502f' : '#c98258'}"/>`;
    }
    for (let i = 0; i < 16; i++) { // estratificación cruzada del rodeno
      const x = rnd() * 900, y = 515 + rnd() * 160, w = 80 + rnd() * 80, a = (rnd() - .5) * .45;
      for (let k = 0; k < 4; k++) tex += `<path d="M${x.toFixed(0)} ${(y + k * 8).toFixed(0)}l${w.toFixed(0)} ${(w * a).toFixed(0)}" stroke="#b25440" stroke-width="2" opacity=".55"/>`;
    }
    for (let i = 0; i < 26; i++) { // diaclasas en la caliza
      const x = rnd() * 1000, y = 712 + rnd() * 220;
      tex += `<path d="M${x.toFixed(0)} ${y.toFixed(0)}l${((rnd() - .5) * 60).toFixed(0)} ${(20 + rnd() * 40).toFixed(0)}l${((rnd() - .5) * 40).toFixed(0)} ${(10 + rnd() * 30).toFixed(0)}" stroke="#7c776c" stroke-width="2" fill="none"/>`;
    }

    // pinos de la Calderona (copa aplanada)
    const pino = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M-3 0c1-20 3-40 6-58l3 1c-2 18-3 38-2 57z"/><path d="M2-52c-6-6-12-12-22-12-6 0-12 4-24 4-8 0-10 8-2 11 10 3 24 1 34-1 6 0 10 0 14-2z"/><path d="M0-58c4-10 14-16 26-14 10 1 16 8 26 9 8 2 6 10-2 11-14 2-30 0-42-2-6 0-10-2-8-4z"/><path d="M-12-68c-4-8 4-16 16-16 12-1 20 6 26 10 4 4 0 8-8 8-12 1-26 2-34-2z"/></g>`;
    let pinos = '';
    [[150, 236, 2.3, '#a3ad9b'], [370, 228, 1.7, '#a3ad9b'], [600, 238, 2.6, '#909c88'], [790, 222, 1.9, '#a3ad9b'], [985, 250, 2.9, '#7e8b76'], [30, 262, 2.5, '#7e8b76']].forEach((p) => { pinos += pino(...p); });

    // matorral sobre la parcela (desaparece en el desbroce)
    let mat = '';
    semilla = 3;
    for (let i = 0; i < 9; i++) {
      const x = HX0 + 18 + i * 37 + rnd() * 8, s = .8 + rnd() * .5;
      mat += `<g transform="translate(${x.toFixed(0)} ${SUP})"><g class="mata" data-i="${i}"><g transform="scale(${s.toFixed(2)})"><circle cx="-8" cy="-10" r="12" fill="#5c6b43"/><circle cx="7" cy="-13" r="14" fill="#6f7f4f"/><circle cx="0" cy="-22" r="11" fill="#7d8c5a"/><path d="M-14 0q4-8 2-14M12 0q-2-10 4-16" stroke="#4b3a2a" stroke-width="2" fill="none"/></g></g></g>`;
    }

    // regla de profundidad
    let regla = `<line x1="44" y1="${SUP}" x2="44" y2="${SUP + 5 * M}" stroke="#101713" stroke-width="2"/>`;
    for (let m = 0; m <= 5; m += .5) {
      const y = SUP + m * M, ent = m % 1 === 0;
      regla += `<line x1="${ent ? 30 : 36}" y1="${y}" x2="44" y2="${y}" stroke="#101713" stroke-width="2"/>`;
      if (ent) regla += `<text x="24" y="${y + 6}" text-anchor="end" class="rg">${m === 0 ? '0' : '−' + m}</text>`;
    }

    const rotulos = [['Tierra vegetal', SUP + 27, '#ecebe5'], ['Arcilla roja', 430, '#3a1d10'], ['Rodeno', 610, '#f4d9cf'], ['Roca caliza', 860, '#2c2a25']]
      .map(([t, y, c]) => `<text x="985" y="${y}" text-anchor="end" class="rt" fill="${c}">${t}</text>`).join('');

    svg.innerHTML = `
      <defs>
        <clipPath id="c-hueco"><path id="hueco-clip"/></clipPath>
        <linearGradient id="g-hueco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c120c" stop-opacity=".25"/><stop offset="1" stop-color="#1c120c" stop-opacity=".62"/></linearGradient>
        <linearGradient id="g-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecebe5" stop-opacity="0"/><stop offset="1" stop-color="#dfe3d8"/></linearGradient>
        <style>.rg{font:600 22px Saira,system-ui,sans-serif;fill:#101713}.rt{font:700 21px Saira,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}</style>
      </defs>
      <rect x="-20" y="60" width="1040" height="${SUP - 60}" fill="url(#g-cielo)"/>
      <path d="M-20 ${SUP}V232C60 214 120 196 200 204S330 178 420 190 560 214 640 200 800 168 880 186 980 210 1020 206V${SUP}Z" fill="#cbd1c3"/>
      <path d="M-20 ${SUP}V262C80 250 160 242 260 252S420 236 520 246 700 262 800 250 940 238 1020 250V${SUP}Z" fill="#b5bdac"/>
      ${pinos}
      <g id="estratos">
        <path d="${banda(null, bVeg)}" fill="#4a3a2c"/>
        <path d="M${pts(bVeg)}L${pts(bArc.slice().reverse())}Z" fill="#b4613a"/>
        <path d="M${pts(bArc)}L${pts(bRod.slice().reverse())}Z" fill="#8f3a2b"/>
        <path d="M${pts(bRod)}L1020 980L-20 980Z" fill="#9c968a"/>
        ${tex}
      </g>
      <g clip-path="url(#c-hueco)">
        <use href="#estratos"/>
        <rect x="0" y="${SUP - 10}" width="1000" height="680" fill="url(#g-hueco)"/>
        <path id="suelo-hueco" fill="#5a2d1f" opacity=".85"/>

      </g>
      <g id="grietas" fill="none" stroke="#efe6d6" stroke-width="3" stroke-linecap="round" opacity="0">
          <path d="M420 ${SUP + 3.6 * M}l-14 34 10 30-8 26" pathLength="1"/><path d="M470 ${SUP + 3.6 * M}l8 40-12 28" pathLength="1"/>
          <path d="M520 ${SUP + 3.6 * M}l-6 24 16 30-10 30" pathLength="1"/>
        </g>
      <path id="hueco-borde" fill="none" stroke="#1c120c" stroke-opacity=".5" stroke-width="3" stroke-linejoin="round"/>
      <g id="barrenos" stroke="#101713" stroke-width="5" stroke-dasharray="10 8" opacity="0">
        <line x1="400" y1="${SUP + 3.6 * M}" x2="400" y2="${SUP + 3.6 * M + 80}"/><line x1="470" y1="${SUP + 3.6 * M}" x2="470" y2="${SUP + 3.6 * M + 96}"/><line x1="540" y1="${SUP + 3.6 * M}" x2="540" y2="${SUP + 3.6 * M + 72}"/>
      </g>
      ${rotulos}
      <g id="matas">${mat}</g>
      <g id="camion">
        <path id="carga" fill="#a85a36"/>
        <g fill="#b8402e"><path d="M652 206h228l-6 58H660z"/></g>
        <g stroke="#8e2f22" stroke-width="3"><line x1="690" y1="210" x2="692" y2="262"/><line x1="730" y1="210" x2="731" y2="262"/><line x1="770" y1="210" x2="770" y2="262"/><line x1="810" y1="210" x2="809" y2="262"/><line x1="850" y1="210" x2="848" y2="262"/></g>
        <rect x="842" y="196" width="40" height="12" rx="6" fill="#2c5d9e"/>
        <rect x="656" y="262" width="300" height="10" fill="#2b2b28"/>
        <path d="M884 174h70c10 0 16 6 18 16l6 82H884z" fill="#f4f4f0"/>
        <path d="M940 182h22c6 0 9 4 10 9l3 34h-35z" fill="#2b3a40"/>
        <rect x="884" y="252" width="94" height="10" fill="#d8d8d2"/>
        <g class="rueda"><circle cx="694" cy="278" r="22" fill="#1d1d1b"/><circle cx="694" cy="278" r="9" fill="#77736a"/></g>
        <g class="rueda"><circle cx="742" cy="278" r="22" fill="#1d1d1b"/><circle cx="742" cy="278" r="9" fill="#77736a"/></g>
        <g class="rueda"><circle cx="790" cy="278" r="22" fill="#1d1d1b"/><circle cx="790" cy="278" r="9" fill="#77736a"/></g>
        <g class="rueda"><circle cx="905" cy="278" r="22" fill="#1d1d1b"/><circle cx="905" cy="278" r="9" fill="#77736a"/></g>
        <g class="rueda"><circle cx="952" cy="278" r="22" fill="#1d1d1b"/><circle cx="952" cy="278" r="9" fill="#77736a"/></g>
      </g>
      <g id="giratoria">
        <rect x="62" y="252" width="34" height="26" fill="#c99a04"/>
        <rect x="88" y="240" width="176" height="22" fill="#2b2b28"/>
        <circle cx="124" cy="274" r="26" fill="#1d1d1b"/><circle cx="124" cy="274" r="10" fill="#77736a"/>
        <circle cx="230" cy="274" r="26" fill="#1d1d1b"/><circle cx="230" cy="274" r="10" fill="#77736a"/>
        <path d="M70 202h196v40H70z" fill="#f2b705"/>
        <path d="M64 206c0-6 4-10 10-10h34v46H64z" fill="#d9a404"/>
        <path d="M196 144h52c6 0 10 4 10 10v48h-62z" fill="#f2b705"/>
        <path d="M204 152h40v38h-40z" fill="#2b3a40" opacity=".9"/>
        <line id="cilindro" stroke="#bdb8aa" stroke-width="7" stroke-linecap="round"/>
        <line id="pluma" stroke="#e0a800" stroke-width="24" stroke-linecap="round"/>
        <line id="balancin" stroke="#f2b705" stroke-width="17" stroke-linecap="round"/>
        <circle id="codo" r="9" fill="#2b2b28"/>
        <g id="cazo"><path d="M-8-6L40-14 56 26C52 50 36 64 10 64L-6 52z" fill="#3a3a36"/><path d="M10 64l4 12 6-12 4 10 6-12 4 9 6-12" fill="#3a3a36"/><circle r="8" fill="#2b2b28"/></g>
        <circle cx="${B.x}" cy="${B.y}" r="9" fill="#2b2b28"/>
      </g>
      <g id="regla">${regla}</g>
      <g id="marca"><line id="marca-l" x1="50" x2="${HX0}" stroke="#f2b705" stroke-width="3" stroke-dasharray="8 6"/><path id="marca-t" fill="#f2b705"/></g>`;

    const q = (id) => svg.getElementById ? svg.getElementById(id) : svg.querySelector('#' + id);
    const huecoClip = q('hueco-clip'), huecoBorde = q('hueco-borde'), sueloHueco = q('suelo-hueco');
    const pluma = q('pluma'), balancin = q('balancin'), codo = q('codo'), cazo = q('cazo'), cilindro = q('cilindro');
    const camion = q('camion'), carga = q('carga'), grietas = q('grietas'), barrenos = q('barrenos');
    const marcaL = q('marca-l'), marcaT = q('marca-t');
    const matas = $$('.mata', svg);
    const lectura = $('#prof');
    const capas = $$('#capas .capa');

    const apilado = matchMedia('(max-width: 760px), (max-width: 1080px) and (orientation: portrait)');
    // estado suavizado para que la máquina no vaya a saltos
    const est = { s: 0 }, obj = { s: 0 };
    let vista = false, raf = 0;

    function medir() {
      // en el móvil la lámina tapa la mitad de arriba: la capa avanza mientras su título asoma por debajo
      const yc = innerHeight * (apilado.matches ? .9 : .55);
      let s = 0;
      for (let i = 0; i < capas.length; i++) {
        const r = capas[i].getBoundingClientRect();
        if (r.top <= yc) s = i + clamp((yc - r.top) / r.height, 0, 1);
      }
      obj.s = s;
      capas.forEach((c, i) => c.classList.toggle('activa', s >= i && s < i + 1 || (i === capas.length - 1 && s >= i)));
    }

    function pintar() {
      const s = est.s;
      const etapa = Math.floor(s), loc = s - etapa;
      const f = suave(0, .62, loc); // cada etapa llega a su cota hacia el centro de la tarjeta
      // profundidad
      const tramos = [0, 0, .3, 1.2, 3.0, 3.6, 3.6];
      const d = etapa >= 6 ? 3.6 : lerp(tramos[etapa], tramos[etapa + 1], etapa === 0 ? 0 : f);
      const Y = d * M, fondo = SUP + Y;
      const xl = HX0 + TALUD * Y, xr = HX1 - TALUD * Y;
      const dHueco = `M${HX0} ${SUP - 2}L${xl.toFixed(1)} ${fondo.toFixed(1)}L${xr.toFixed(1)} ${fondo.toFixed(1)}L${HX1} ${SUP - 2}Z`;
      huecoClip.setAttribute('d', d > 0 ? dHueco : 'M0 0Z');
      huecoBorde.setAttribute('d', d > 0 ? `M${HX0} ${SUP}L${xl.toFixed(1)} ${fondo.toFixed(1)}L${xr.toFixed(1)} ${fondo.toFixed(1)}L${HX1} ${SUP}` : '');
      sueloHueco.setAttribute('d', d > 0 ? `M${xl.toFixed(1)} ${(fondo - 14).toFixed(1)}L${xr.toFixed(1)} ${(fondo - 14).toFixed(1)}L${xr.toFixed(1)} ${fondo.toFixed(1)}L${xl.toFixed(1)} ${fondo.toFixed(1)}Z` : '');
      // marca amarilla de cota
      marcaL.setAttribute('y1', fondo); marcaL.setAttribute('y2', fondo);
      marcaT.setAttribute('d', `M46 ${fondo}l16 -10v20z`);
      lectura.textContent = d < .005 ? '±0,00' : '−' + coma(d);

      // desbroce: las matas se van con el cazo (de derecha a izquierda)
      const t0 = etapa === 0 ? suave(.05, .8, loc) : 1;
      matas.forEach((m, i) => {
        const k = clamp(t0 * 10 - (matas.length - 1 - i), 0, 1);
        m.style.opacity = 1 - k;
        m.style.transform = `translate(0, ${-k * 30}px) scale(${1 - k * .6})`;
        m.style.transformBox = 'fill-box'; m.style.transformOrigin = 'center bottom';
      });

      // roca: grietas y barrenos
      const t4 = etapa === 4 ? suave(.25, .85, loc) : etapa > 4 ? 1 : 0;
      grietas.setAttribute('opacity', t4 > 0 ? 1 : 0);
      grietas.querySelectorAll('path').forEach((p) => { p.style.strokeDasharray = '1'; p.style.strokeDashoffset = 1 - t4; });
      barrenos.setAttribute('opacity', (t4 * .9).toFixed(2));

      // carga del camión y salida
      const llenado = clamp((d - .1) / 3.5, 0, 1) * .85 + (etapa >= 1 ? .15 : t0 * .15);
      const h = 8 + llenado * 34;
      carga.setAttribute('d', `M658 208C690 ${208 - h * .7} 720 ${208 - h} 766 ${208 - h}S846 ${208 - h * .6} 876 208Z`);
      const t5 = etapa >= 5 ? suave(.18, .72, etapa >= 6 ? 1 : loc) : 0;
      camion.style.transform = `translateX(${(t5 * 640).toFixed(1)}px)`;
      camion.querySelectorAll('.rueda').forEach((r) => { r.style.transform = `rotate(${(t5 * 900).toFixed(0)}deg)`; r.style.transformBox = 'fill-box'; r.style.transformOrigin = 'center'; });

      // brazo: objetivo del cazo según la etapa
      let tx, ty, ang;
      if (etapa === 0) { tx = lerp(HX1 - 10, HX0 + 40, t0); ty = SUP - 34 - Math.sin(t0 * Math.PI * 3) * 10; ang = -20; }
      else if (etapa < 5) {
        const vaiven = Math.sin(s * 5.2);
        tx = (xl + xr) / 2 + vaiven * (xr - xl) * .28; ty = Math.max(fondo - 36, SUP - 30); ang = 10 + vaiven * 30;
      } else {
        const a = suave(0, .18, etapa >= 6 ? 1 : loc); // primero vacía en la bañera, luego recoge
        const r = suave(.3, .75, etapa >= 6 ? 1 : loc);
        tx = lerp(lerp((xl + xr) / 2, 760, a), 430, r); ty = lerp(lerp(fondo - 36, 120, a), 196, r); ang = lerp(lerp(10, 120, a), -30, r);
      }
      // cinemática inversa de dos tramos (codo hacia arriba)
      let dx = tx - B.x, dy = ty - B.y, dist = Math.hypot(dx, dy);
      dist = clamp(dist, Math.abs(L1 - L2) + 2, L1 + L2 - 2);
      const a0 = Math.atan2(dy, dx);
      const b0 = Math.acos(clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1));
      const ex = B.x + L1 * Math.cos(a0 - b0), ey = B.y + L1 * Math.sin(a0 - b0);
      const wx = B.x + dist * Math.cos(a0), wy = B.y + dist * Math.sin(a0);
      pluma.setAttribute('x1', B.x); pluma.setAttribute('y1', B.y); pluma.setAttribute('x2', ex.toFixed(1)); pluma.setAttribute('y2', ey.toFixed(1));
      balancin.setAttribute('x1', ex.toFixed(1)); balancin.setAttribute('y1', ey.toFixed(1)); balancin.setAttribute('x2', wx.toFixed(1)); balancin.setAttribute('y2', wy.toFixed(1));
      codo.setAttribute('cx', ex.toFixed(1)); codo.setAttribute('cy', ey.toFixed(1));
      cilindro.setAttribute('x1', 236); cilindro.setAttribute('y1', 226); cilindro.setAttribute('x2', lerp(B.x, ex, .55).toFixed(1)); cilindro.setAttribute('y2', lerp(B.y, ey, .55).toFixed(1));
      const angBal = Math.atan2(wy - ey, wx - ex) * 180 / Math.PI;
      cazo.setAttribute('transform', `translate(${wx.toFixed(1)} ${wy.toFixed(1)}) rotate(${(angBal - 70 + ang).toFixed(1)})`);
    }

    function bucle() {
      const dif = obj.s - est.s;
      est.s += reduce ? dif : dif * .14;
      pintar();
      raf = Math.abs(dif) > .0008 ? requestAnimationFrame(bucle) : 0;
    }
    const pedir = () => { medir(); if (!raf) raf = requestAnimationFrame(bucle); };
    new IntersectionObserver((es) => { vista = es[0].isIntersecting; if (vista) pedir(); }, { rootMargin: '200px 0px' }).observe($('#corte'));
    addEventListener('scroll', () => { if (vista) pedir(); }, { passive: true });
    addEventListener('resize', pedir);
    medir(); est.s = obj.s; pintar();
  }

  /* ── La flota: puntos sobre la foto ↔ lista ────────── */
  const lista = $('#flota-lista'), foto = $('#flota-foto');
  if (lista && foto) {
    const marcar = (p) => {
      const g = String(p || '').replace('b', '');
      $$('li', lista).forEach((li) => li.classList.toggle('activo', li.dataset.p === g));
      $$('.punto-f', foto).forEach((b) => b.classList.toggle('activo', b.dataset.p.replace('b', '') === g));
    };
    $$('li', lista).forEach((li) => { li.addEventListener('mouseenter', () => marcar(li.dataset.p)); });
    $$('.punto-f', foto).forEach((b) => {
      b.addEventListener('mouseenter', () => marcar(b.dataset.p));
      b.addEventListener('focus', () => marcar(b.dataset.p));
      b.addEventListener('click', () => marcar(b.dataset.p));
    });
    // se recorren solos mientras nadie toca
    let i = 0, tocado = false;
    ['pointerdown', 'mouseenter'].forEach((ev) => foto.addEventListener(ev, () => { tocado = true; }));
    lista.addEventListener('mouseenter', () => { tocado = true; });
    marcar('1');
    if (!reduce) setInterval(() => { if (!tocado && !document.hidden) { i = (i + 1) % 3; marcar(String(i + 1)); } }, 2600);
  }

  /* ── Calculadora de viajes ─────────────────────────── */
  const calc = $('#calc');
  if (calc) {
    const ESP = { tierra: 1.25, arcilla: 1.3, roca: 1.55, escombro: 1.4 }; // esponjamiento orientativo
    const NOM = { tierra: 'tierra', arcilla: 'arcilla', roca: 'roca', escombro: 'escombro' };
    const VIAJE = 15; // m³ sueltos por viaje de bañera (orientativo)
    const camionSVG = '<svg viewBox="0 0 40 22" aria-hidden="true"><path d="M1 3h25l-1.5 12H2.5z" fill="#f2b705"/><path d="M27 6h7c2 0 3 1 3.5 3l1.5 7H27z" fill="#ecebe5"/><circle cx="8" cy="18" r="3.4" fill="#ecebe5"/><circle cx="17" cy="18" r="3.4" fill="#ecebe5"/><circle cx="33" cy="18" r="3.4" fill="#ecebe5"/></svg>';
    const num = (n) => n.toLocaleString('es-ES', { maximumFractionDigits: n < 10 ? 1 : 0 });
    const vB = $('#v-banco'), vS = $('#v-suelto'), vV = $('#v-viajes'), flota = $('#v-flota'), waBtn = $('#v-wa');
    let antes = -1;
    const calcular = () => {
      const g = (n) => Math.max(0, parseFloat(String(calc.elements[n].value).replace(',', '.')) || 0);
      const l = g('l'), a = g('a'), p = g('p'), m = calc.elements.m.value;
      const banco = l * a * p, suelto = banco * ESP[m], viajes = suelto > 0 ? Math.ceil(suelto / VIAJE) : 0;
      vB.textContent = num(banco); vS.textContent = num(suelto); vV.textContent = viajes.toLocaleString('es-ES');
      if (viajes !== antes) {
        const n = Math.min(viajes, 30);
        flota.innerHTML = camionSVG.repeat(n) + (viajes > 30 ? `<span class="mas">+${viajes - 30}</span>` : '');
        $$('svg', flota).forEach((s, k) => { s.style.animationDelay = (k * 25) + 'ms'; });
        antes = viajes;
      }
      const msg = `Hola, os escribo desde la web. Quería presupuesto para excavar unos ${num(l)} × ${num(a)} m y ${num(p)} m de profundidad (${NOM[m]}). La calculadora dice unos ${num(banco)} m³ y ${viajes} viajes de bañera. ¿Me decís precio?`;
      waBtn.href = `https://wa.me/34606463590?text=${encodeURIComponent(msg)}`;
    };
    calc.addEventListener('input', calcular);
    calc.addEventListener('submit', (e) => e.preventDefault());
    calcular();
  }

  /* ── Formulario → WhatsApp ─────────────────────────── */
  const form = $('#form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = form.elements.nombre;
    if (!n.value.trim()) { n.classList.add('error'); n.focus(); return; }
    n.classList.remove('error');
    const v = (k) => form.elements[k].value.trim();
    const msg = `Hola, soy ${v('nombre')}. Quería presupuesto: ${v('trabajo')}${v('lugar') ? ' en ' + v('lugar') : ''}.${v('msg') ? '\n' + v('msg') : ''}`;
    open(`https://wa.me/34606463590?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  /* ── Mapa: curvas de nivel de la sierra (decorativas) ── */
  const curvas = $('#curvas');
  if (curvas) {
    const W = +curvas.dataset.w, H = +curvas.dataset.h;
    // relieve aproximado: la Calderona al norte y noroeste, el Picayo junto a Puçol, la llanura hacia el mar
    const alt = (x, y) => {
      const u = x / W, v = y / H;
      const g = (cu, cv, su, sv, h) => h * Math.exp(-(((u - cu) ** 2) / su + ((v - cv) ** 2) / sv));
      return g(.5, .02, .06, .012, 640) + g(.27, .12, .03, .02, 520) + g(.66, .06, .01, .01, 420) + g(.82, .42, .005, .007, 300)
        + g(.33, .55, .05, .05, 120) + 80 * (1 - v) - 60 * u
        + 26 * Math.sin(u * 23 + v * 7) * Math.cos(v * 19 - u * 5) + 12 * Math.sin(u * 47 - v * 31);
    };
    const N = 120, cw = W / N, rows = Math.ceil(H / cw);
    const grid = [];
    for (let j = 0; j <= rows; j++) { grid[j] = []; for (let i = 0; i <= N; i++) grid[j][i] = alt(i * cw, j * cw); }
    let html = '';
    for (let nivel = 50; nivel <= 700; nivel += 50) {
      let d = '';
      for (let j = 0; j < rows; j++) for (let i = 0; i < N; i++) {
        const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], e = grid[j + 1][i];
        const k = (a > nivel ? 8 : 0) | (b > nivel ? 4 : 0) | (c > nivel ? 2 : 0) | (e > nivel ? 1 : 0);
        if (k === 0 || k === 15) continue;
        const x = i * cw, y = j * cw;
        const T = [x + cw * (nivel - a) / (b - a), y], Rr = [x + cw, y + cw * (nivel - b) / (c - b)];
        const Bb = [x + cw * (nivel - e) / (c - e), y + cw], Ll = [x, y + cw * (nivel - a) / (e - a)];
        const seg = { 1: [Ll, Bb], 2: [Bb, Rr], 3: [Ll, Rr], 4: [T, Rr], 5: [Ll, T, Bb, Rr], 6: [T, Bb], 7: [Ll, T], 8: [Ll, T], 9: [T, Bb], 10: [T, Rr, Ll, Bb], 11: [T, Rr], 12: [Ll, Rr], 13: [Bb, Rr], 14: [Ll, Bb] }[k];
        for (let s = 0; s < seg.length; s += 2) d += `M${seg[s][0].toFixed(1)} ${seg[s][1].toFixed(1)}L${seg[s + 1][0].toFixed(1)} ${seg[s + 1][1].toFixed(1)}`;
      }
      if (d) html += `<path${nivel % 200 === 0 ? ' class="i"' : ''} d="${d}"/>`;
    }
    curvas.innerHTML = html;
  }
})();

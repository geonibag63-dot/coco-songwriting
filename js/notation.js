/* 악보 렌더링(VexFlow) + 재생 이벤트 변환 */
import { Engine, CHORDS } from './audio/engine.js';

const VF = () => window.Vex.Flow;
const FONT = "'Noto Sans KR', 'IBM Plex Sans KR', sans-serif";
const DUR_STEPS = { w: 16, h: 8, q: 4, '8': 2, '16': 1, '32': 0.5 };
const KEY_PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const KEYSIG_ACC = {
  C: {}, G: { f: 1 }, D: { f: 1, c: 1 }, A: { f: 1, c: 1, g: 1 }, E: { f: 1, c: 1, g: 1, d: 1 }, B: { f: 1, c: 1, g: 1, d: 1, a: 1 },
  F: { b: -1 }, Bb: { b: -1, e: -1 }, Eb: { b: -1, e: -1, a: -1 }, Ab: { b: -1, e: -1, a: -1, d: -1 },
  Am: {}, Em: { f: 1 }, Bm: { f: 1, c: 1 }, 'F#m': { f: 1, c: 1, g: 1 }, 'C#m': { f: 1, c: 1, g: 1, d: 1 }, Dm: { b: -1 }, Gm: { b: -1, e: -1 },
};

export function keyToMidi(key, keySig = 'C', explicitAcc = null) {
  const m = /^([a-g])([#bn]*)\/(\d)$/.exec(key.toLowerCase());
  if (!m) return 60;
  let pc = KEY_PC[m[1]], oct = +m[3];
  const written = m[2];
  let acc = 0;
  if (explicitAcc != null) acc = explicitAcc === '#' ? 1 : explicitAcc === 'b' ? -1 : explicitAcc === 'n' ? 0 : explicitAcc === '##' ? 2 : explicitAcc === 'bb' ? -2 : 0;
  else if (written) acc = (written.match(/#/g) || []).length - (written.match(/b/g) || []).length;
  else acc = (KEYSIG_ACC[keySig] || {})[m[1]] || 0;
  return (oct + 1) * 12 + pc + acc;
}

/* spec → 재생 이벤트 */
export function specToEvents(spec) {
  const events = [], chords = [];
  let pos = 0;
  spec.measures.forEach(m => {
    const barStart = pos;
    m.forEach(n => {
      let d = n.dur || 'w', rest = false, dotted = false;
      if (d.endsWith('r')) { rest = true; d = d.slice(0, -1); }
      if (d.endsWith('d')) { dotted = true; d = d.slice(0, -1); }
      let len = DUR_STEPS[d] ?? 4; if (dotted) len *= 1.5;
      if (!rest) {
        const midis = n.keys.map((k, idx) => keyToMidi(k, spec.key || 'C', n.acc ? n.acc[idx] : null));
        events.push({ step: pos, len, midis, ref: n });
      }
      if (n.above && CHORDS.parse(n.above)) chords.push({ step: pos, name: n.above, barStart });
      pos += len;
    });
  });
  // 코드 지속 길이: 다음 코드까지 (최대 한 마디)
  chords.forEach((c, i) => { const next = chords[i + 1]; c.len = Math.min(next ? next.step - c.step : 16, 16); });
  return { events, chords, total: pos };
}

/* 악보 그리기. 반환: {svg, notes:[{el, ref}]} */
export function drawStaff(container, spec) {
  const F = VF();
  container.innerHTML = '';
  const width = spec.width || 640;
  const hasB2 = spec.measures.flat().some(n => n.below2), hasB = spec.measures.flat().some(n => n.below);
  const top0 = spec.top ?? 40;
  const height = spec.height || (top0 + 80 + (hasB2 ? 70 : hasB ? 54 : 24));
  const r = new F.Renderer(container, F.Renderer.Backends.SVG);
  r.resize(width, height);
  const ctx = r.getContext();
  ctx.setFont(FONT, 11);
  const ms = spec.measures;
  const firstExtra = 66 + (spec.key ? 10 * (spec.keyCount || 0) : 0);
  const wts = spec.weights || ms.map(() => 1); const tot = wts.reduce((a, b) => a + b, 0);
  let x = 4; const drawn = [];
  ms.forEach((m, i) => {
    const w = (width - 8 - firstExtra) * wts[i] / tot + (i === 0 ? firstExtra : 0);
    const st = new F.Stave(x, top0, w);
    if (i === 0) { st.addClef(spec.clef || 'treble'); if (spec.key) st.addKeySignature(spec.key); if (spec.time) st.addTimeSignature(spec.time); }
    if (i === ms.length - 1) st.setEndBarType(F.Barline.type.END);
    st.setContext(ctx).draw();
    const notes = m.map(n => {
      const d = n.dur || 'w'; const dotted = d.indexOf('d') > 0;
      const sn = new F.StaveNote({ keys: n.keys, duration: d.replace('d', ''), clef: spec.clef || 'treble', auto_stem: true });
      if (dotted) F.Dot.buildAndAttach([sn], { all: true });
      if (n.acc) Object.entries(n.acc).forEach(([idx, a]) => sn.addModifier(new F.Accidental(a), +idx));
      if (n.keyColor) Object.entries(n.keyColor).forEach(([idx, c]) => sn.setKeyStyle(+idx, { fillStyle: c, strokeStyle: c }));
      if (n.color) sn.setStyle({ fillStyle: n.color, strokeStyle: n.color });
      return sn;
    });
    const voice = new F.Voice({ num_beats: spec.beats || 4, beat_value: 4 }).setMode(F.Voice.Mode.SOFT).addTickables(notes);
    new F.Formatter().joinVoices([voice]).format([voice], w - (i === 0 ? firstExtra - 10 : 20));
    voice.draw(ctx, st);
    const lab = (t, cx, y, size, weight, color) => { if (!t) return; ctx.save(); ctx.setFont(FONT, size, weight || ''); ctx.setFillStyle(color); const tw = ctx.measureText(t).width; ctx.fillText(t, cx - tw / 2, y); ctx.restore(); };
    notes.forEach((sn, k) => {
      const n = m[k];
      if ((n.dur || '').endsWith('r')) return;
      const cx = (sn.getNoteHeadBeginX() + sn.getNoteHeadEndX()) / 2;
      lab(n.above, cx, st.getYForLine(0) - (spec.aboveGap || 22), 13, 'bold', 'var(--staff-ink)');
      lab(n.below, cx, st.getYForLine(4) + (spec.belowGap || 40), 12, '', 'var(--accent-2)');
      lab(n.below2, cx, st.getYForLine(4) + (spec.belowGap || 40) + 16, 10.5, '', 'var(--ink-soft)');
      let el = null; try { el = sn.getSVGElement(); } catch (e) { el = null; }
      drawn.push({ el, ref: n });
    });
    x += w;
  });
  const svg = container.querySelector('svg');
  if (svg) { svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.removeAttribute('width'); svg.removeAttribute('height'); svg.style.width = '100%'; svg.style.maxWidth = width + 'px'; svg.style.height = 'auto'; }
  return { svg, notes: drawn };
}

/* 악보 재생: ▶ 버튼 하나로 재생/정지, 재생 중 음 하이라이트 */
const players = new Map();
export function attachPlayer(container, spec, drawn, opts = {}) {
  const { events, chords, total } = specToEvents(spec);
  const bar = document.createElement('div'); bar.className = 'staff-bar';
  const btn = document.createElement('button'); btn.className = 'staff-play'; btn.innerHTML = '<span class="ico">▶</span><span>들어보기</span>';
  const bpmLab = document.createElement('label'); bpmLab.className = 'staff-bpm';
  const bpm = spec.bpm || opts.bpm || 92;
  bpmLab.innerHTML = `<span>BPM</span><input type="range" min="50" max="160" value="${bpm}"><b>${bpm}</b>`;
  const acc = document.createElement('label'); acc.className = 'staff-acc';
  const hasChords = chords.length > 0;
  acc.innerHTML = `<input type="checkbox" ${hasChords ? 'checked' : 'disabled'}><span>코드 반주</span>`;
  bar.append(btn, bpmLab, acc);
  container.appendChild(bar);
  const inst = spec.inst || (events.every(e => e.midis.length === 1) ? 'lead' : 'piano');
  let seq = null;
  const paint = (i) => {
    drawn.forEach(d => d.el && d.el.classList.remove('now'));
    if (i < 0) return;
    events.forEach(e => { if (e.step <= i && i < e.step + e.len && e.ref) { const d = drawn.find(x => x.ref === e.ref); if (d && d.el) d.el.classList.add('now'); } });
  };
  const start = () => {
    stopAllPlayers();
    seq = new Engine.Sequencer({ bpm: +bpmLab.querySelector('input').value, steps: total, loop: false, onPaint: paint,
      onStep: (i, t, sd) => {
        events.forEach(e => { if (e.step === i) e.midis.forEach(m => Engine.note(inst, m, t, sd * e.len * 0.92, 1)); });
        if (acc.querySelector('input').checked) chords.forEach(c => { if (c.step === i) { Engine.chord('pad', CHORDS.voicing(c.name, 57), t, sd * c.len * 0.95, 0.6); const b = CHORDS.bassNote(c.name, 40); if (b != null) Engine.note('bass', b, t, sd * c.len * 0.9, 0.7); } });
      } });
    seq.origStop = seq.stop.bind(seq);
    seq.stop = () => { seq.origStop(); btn.classList.remove('on'); btn.querySelector('.ico').textContent = '▶'; players.delete(container); };
    seq.start(); btn.classList.add('on'); btn.querySelector('.ico').textContent = '■'; players.set(container, seq);
  };
  btn.addEventListener('click', () => { if (seq && seq.playing) seq.stop(); else start(); });
  // 음 하나씩 듣기: 음표를 누르면 그 음(화음)만 짧게 재생
  drawn.forEach(d => {
    if (!d.el) return;
    const ev = events.find(e => e.ref === d.ref); if (!ev) return;
    d.el.classList.add('tappable');
    d.el.addEventListener('click', () => {
      Engine.resume(); const t = Engine.now() + 0.02;
      ev.midis.forEach(m => Engine.note(inst, m, t, 0.55, 1));
      d.el.classList.add('tap'); setTimeout(() => d.el.classList.remove('tap'), 350);
    });
  });
  bpmLab.querySelector('input').addEventListener('input', e => { bpmLab.querySelector('b').textContent = e.target.value; if (seq) seq.bpm = +e.target.value; });
  return { start, stop: () => seq && seq.stop() };
}
export function stopAllPlayers() { players.forEach(s => s.stop()); players.clear(); }

/* 컨테이너에 spec을 그리고 플레이어까지 붙이기 */
export function mountStaff(container, spec, opts = {}) {
  const box = document.createElement('div'); box.className = 'staff-svg';
  container.appendChild(box);
  const drawn = drawStaff(box, spec);
  if (!opts.noPlayer) attachPlayer(container, spec, drawn.notes, opts);
  return drawn;
}

/* 코드 진행 편집기 — 마디에 코드를 넣고 루프 재생, 이조, 디그리·기능 표시, 저장·MIDI 내보내기 */
import { Engine, CHORDS } from '../audio/engine.js';
import { Store } from '../store.js';
import { buildMidi, downloadMidi, GM, GM_DRUM } from '../midi.js';
import * as T from '../theory.js';

const uid = () => 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* 한 마디 = {a: '코드', b: null|'코드'}  b가 있으면 반 마디씩 */
function emptyBars(n) { return Array.from({ length: n }, () => ({ a: null, b: null })); }

export function mountChordLab(root, workId) {
  const s = Store.settings();
  Engine.setKit(s.kit);

  let doc = loadDoc(workId);
  let seq = null, sel = 0, slot = 'a';

  function loadDoc(id) {
    const w = id ? Store.works().find(x => x.id === id && x.type === 'chords') : null;
    if (w) return JSON.parse(JSON.stringify(w));
    return { id: uid(), type: 'chords', name: '새 진행', key: 'A', minor: false, bpm: 96, drums: true, bassOn: true, inst: 'epiano',
      bars: [{ a: 'F#m', b: null }, { a: 'D', b: null }, { a: 'A', b: null }, { a: 'E', b: null }] };
  }

  root.innerHTML = `
  <div class="lab">
    <header class="lab-head">
      <div class="eyebrow">LAB · CHAPTER 3</div>
      <h1>코드 진행 편집기</h1>
      <p>마디를 누르고 아래 팔레트에서 코드를 고르세요. 키를 바꾸면 진행이 통째로 따라옵니다.</p>
    </header>

    <div class="transport">
      <button class="play" data-play><span class="ico">▶</span><span>재생</span></button>
      <label class="field"><span>BPM <b data-bpmv></b></span><input type="range" data-bpm min="50" max="180"></label>
      <label class="field small"><span>키</span><select data-key></select></label>
      <label class="field small"><span>조성</span><select data-mode><option value="maj">장조</option><option value="min">단조</option></select></label>
      <label class="field small"><span>코드 악기</span><select data-inst>${Object.entries(Engine.INSTRUMENTS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></label>
      <div class="toggles"><button class="toggle" data-t="drums">드럼</button><button class="toggle" data-t="bassOn">베이스</button></div>
    </div>

    <section class="panel">
      <div class="work-head">
        <input class="work-name" data-name maxlength="40">
        <div class="work-acts">
          <button class="btn small ghost" data-bars="-4">− 4마디</button>
          <button class="btn small ghost" data-bars="4">+ 4마디</button>
          <button class="btn small ghost" data-clear>비우기</button>
        </div>
      </div>
      <div class="barsrow" data-bars-row></div>
      <p class="small" data-analysis></p>
    </section>

    <section class="panel">
      <h3 class="ph">코드 고르기 <span class="small" data-target></span></h3>
      <div class="pal" data-pal-dia></div>
      <h4 class="pal-title">다이어토닉 밖 <span class="small">차용화음 · 세컨더리 도미넌트 (3.5~3.6)</span></h4>
      <div class="pal" data-pal-out></div>
      <div class="pal-acts">
        <button class="btn small ghost" data-split>반 마디로 나누기</button>
        <button class="btn small ghost" data-erase>이 마디 비우기</button>
      </div>
    </section>

    <section class="panel">
      <h3 class="ph">진행 사전에서 가져오기</h3>
      <div class="chips" data-presets></div>
    </section>

    <section class="panel">
      <h3 class="ph">내 진행</h3>
      <div class="work-list" data-works></div>
      <div class="pal-acts">
        <button class="btn small" data-save>저장</button>
        <button class="btn small ghost" data-new>새로 만들기</button>
        <button class="btn small ghost" data-midi>MIDI 내보내기</button>
        <button class="btn small ghost" data-tosong>곡 만들기로 보내기</button>
      </div>
      <p class="small" data-saved></p>
    </section>
  </div>`;

  const $ = q => root.querySelector(q);
  const $$ = q => [...root.querySelectorAll(q)];

  /* ---------- 그리기 ---------- */
  function keyOptions() {
    $('[data-key]').innerHTML = T.KEYS.map(k => `<option value="${k}">${k}${doc.minor ? 'm' : ''}</option>`).join('');
    $('[data-key]').value = doc.key;
  }
  function renderBars() {
    const row = $('[data-bars-row]'); row.innerHTML = '';
    doc.bars.forEach((bar, i) => {
      const el = document.createElement('div');
      el.className = 'barcell' + (i === sel ? ' sel' : '') + (bar.b ? ' split' : '');
      el.dataset.i = i;
      const half = (which) => {
        const name = bar[which];
        const deg = name ? T.degreeOf(name, doc.key, doc.minor) : null;
        const fn = deg ? T.FUNCTIONS[deg] : null;
        return `<button class="half ${which}${i === sel && slot === which ? ' on' : ''}" data-i="${i}" data-slot="${which}">
          <span class="cname">${name || '—'}</span>
          <span class="cdeg ${fn ? 'fn-' + fn : ''}">${deg || (name ? '?' : '')}</span></button>`;
      };
      el.innerHTML = `<div class="barno">${i + 1}</div><div class="halves">${half('a')}${bar.b !== null ? half('b') : ''}</div>`;
      row.appendChild(el);
    });
    row.querySelectorAll('.half').forEach(b => b.onclick = () => { sel = +b.dataset.i; slot = b.dataset.slot; renderBars(); renderPalette(); });
    analyse();
  }
  function analyse() {
    const names = doc.bars.flatMap(b => [b.a, b.b].filter(Boolean));
    if (!names.length) { $('[data-analysis]').textContent = '마디를 눌러 코드를 넣어 보세요.'; return; }
    const degs = names.map(n => T.degreeOf(n, doc.key, doc.minor) || '?');
    const fns = degs.map(d => T.FUNCTIONS[d] || '·').join(' → ');
    const last = degs[degs.length - 1], first = degs[0];
    let tip = '';
    const tonic = doc.minor ? 'i' : 'I', dom = doc.minor ? 'v' : 'V';
    if (last === dom || last === 'V') tip = ' · 마지막이 V → 반종지(열린 끝). 벌스·프리코러스에 어울립니다.';
    else if (last === tonic) tip = ' · 마지막이 I → 닫힌 끝. 코러스 마무리에 어울립니다.';
    else if (last === 'vi' && degs[degs.length - 2] === 'V') tip = ' · V→vi 거짓 마침. 곡을 이어갈 때 씁니다.';
    if (first === 'vi' || first === 'VI') tip += ' 시작이 vi라 어둡게 출발합니다.';
    $('[data-analysis]').innerHTML = `<b>${degs.join(' – ')}</b> &nbsp;|&nbsp; 기능 ${fns}${tip}`;
  }
  function renderPalette() {
    const dia = T.diatonic(doc.key, doc.minor), degs = doc.minor ? T.MIN_DEGREES : T.MAJ_DEGREES;
    $('[data-target]').textContent = `→ ${sel + 1}마디${doc.bars[sel].b !== null ? (slot === 'a' ? ' 앞쪽' : ' 뒤쪽') : ''}`;
    $('[data-pal-dia]').innerHTML = dia.map((c, i) => {
      const fn = T.FUNCTIONS[degs[i]];
      return `<button class="palc fn-${fn}" data-c="${c}"><b>${c}</b><i>${degs[i]}</i></button>`;
    }).join('');
    const out = [...T.borrowed(doc.key, doc.minor), ...T.secondary(doc.key, doc.minor)];
    $('[data-pal-out]').innerHTML = out.map(o => `<button class="palc out" data-c="${o.name}" title="${o.target ? o.target + '로 가는 다리' : o.note}"><b>${o.name}</b><i>${o.degree}</i></button>`).join('');
    $$('.palc').forEach(b => b.onclick = () => {
      doc.bars[sel][slot] = b.dataset.c;
      Engine.resume(); const t = Engine.now() + 0.02;
      Engine.chord(doc.inst, CHORDS.voicing(b.dataset.c, 57), t, 0.7, 0.7);
      const bn = CHORDS.bassNote(b.dataset.c, 40); if (bn != null) Engine.note('bass', bn, t, 0.7, 0.8);
      // 다음 칸으로 자동 이동
      if (slot === 'a' && doc.bars[sel].b !== null) slot = 'b';
      else if (sel < doc.bars.length - 1) { sel++; slot = 'a'; }
      renderBars(); renderPalette();
    });
  }
  function renderPresets() {
    $('[data-presets]').innerHTML = T.PRESETS.map(p => `<button class="chip" data-p="${p.id}">${p.name}<em>${p.tag}</em></button>`).join('');
    $$('[data-p]').forEach(b => b.onclick = () => {
      const p = T.PRESETS.find(x => x.id === b.dataset.p);
      doc.bars = p.degrees.map(d => ({ a: T.chordForDegree(d, doc.key, doc.minor) || null, b: null }));
      sel = 0; slot = 'a'; renderBars(); renderPalette();
    });
  }
  function renderWorks() {
    const ws = Store.works().filter(w => w.type === 'chords');
    $('[data-works]').innerHTML = ws.length ? ws.map(w => `<div class="work-row${w.id === doc.id ? ' cur' : ''}">
      <button class="work-open" data-open="${w.id}">${w.name}<em>${w.key}${w.minor ? 'm' : ''} · ${w.bars.length}마디 · ${w.bpm}</em></button>
      <button class="work-del" data-del="${w.id}" title="삭제">✕</button></div>`).join('')
      : '<p class="small">저장한 진행이 없습니다. 아래 「저장」을 누르면 이 기기에 보관됩니다.</p>';
    $$('[data-open]').forEach(b => b.onclick = () => { stop(); doc = loadDoc(b.dataset.open); sel = 0; slot = 'a'; syncControls(); renderAll(); });
    $$('[data-del]').forEach(b => b.onclick = () => { if (confirm('이 진행을 지울까요?')) { Store.deleteWork(b.dataset.del); renderWorks(); } });
  }
  function renderAll() { keyOptions(); renderBars(); renderPalette(); renderPresets(); renderWorks(); }
  function syncControls() {
    $('[data-name]').value = doc.name;
    $('[data-bpm]').value = doc.bpm; $('[data-bpmv]').textContent = doc.bpm;
    $('[data-mode]').value = doc.minor ? 'min' : 'maj';
    $('[data-inst]').value = doc.inst;
    $('[data-t="drums"]').classList.toggle('on', doc.drums);
    $('[data-t="bassOn"]').classList.toggle('on', doc.bassOn);
  }

  /* ---------- 재생 ---------- */
  function events() {                       // 16분 칸 → 코드
    const out = [];
    doc.bars.forEach((bar, i) => {
      const base = i * 16;
      if (bar.b !== null) { if (bar.a) out.push({ step: base, len: 8, name: bar.a }); if (bar.b) out.push({ step: base + 8, len: 8, name: bar.b }); }
      else if (bar.a) out.push({ step: base, len: 16, name: bar.a });
    });
    return out;
  }
  function start() {
    const evs = events(); if (!evs.length) return;
    const steps = doc.bars.length * 16;
    seq = new Engine.Sequencer({ bpm: doc.bpm, steps, loop: true,
      onPaint: i => { const bar = Math.floor(i / 16); $$('.barcell').forEach((c, k) => c.classList.toggle('now', k === bar && i >= 0)); },
      onStep: (i, t, sd) => {
        evs.forEach(e => { if (e.step === i) {
          Engine.chord(doc.inst, CHORDS.voicing(e.name, 57), t, sd * e.len * 0.95, 0.55);
          if (doc.bassOn) { const b = CHORDS.bassNote(e.name, 40); if (b != null) { Engine.note('bass', b, t, sd * 3.6, 0.85); Engine.note('bass', b, t + sd * 8, sd * 3.6, 0.7); } }
        } });
        if (doc.drums) { const p = i % 16; if (p === 0 || p === 8) Engine.drum('kick', t); if (p === 4 || p === 12) Engine.drum('snare', t); if (p % 2 === 0) Engine.drum('hat', t, 0.7); }
      } });
    seq.start();
    $('[data-play] .ico').textContent = '■'; $('[data-play] span:last-child').textContent = '정지';
  }
  function stop() { if (seq) seq.stop(); seq = null; $$('.barcell').forEach(c => c.classList.remove('now')); const p = $('[data-play]'); if (p) { p.querySelector('.ico').textContent = '▶'; p.querySelector('span:last-child').textContent = '재생'; } }

  /* ---------- 조작 ---------- */
  $('[data-play]').onclick = () => (seq && seq.playing) ? stop() : start();
  $('[data-bpm]').oninput = e => { doc.bpm = +e.target.value; $('[data-bpmv]').textContent = doc.bpm; if (seq) seq.bpm = doc.bpm; };
  $('[data-key]').onchange = e => {
    const from = doc.key, to = e.target.value;
    doc.bars = doc.bars.map(b => ({ a: b.a ? T.transposeProgression([b.a], from, to, doc.minor)[0] : null, b: b.b ? T.transposeProgression([b.b], from, to, doc.minor)[0] : null }));
    doc.key = to; renderBars(); renderPalette();
  };
  $('[data-mode]').onchange = e => { doc.minor = e.target.value === 'min'; keyOptions(); renderBars(); renderPalette(); };
  $('[data-inst]').onchange = e => { doc.inst = e.target.value; };
  $$('.toggle').forEach(b => b.onclick = () => { const k = b.dataset.t; doc[k] = !doc[k]; b.classList.toggle('on', doc[k]); });
  $('[data-name]').oninput = e => { doc.name = e.target.value; };
  $('[data-bars="4"]').onclick = () => { doc.bars.push(...emptyBars(4)); renderBars(); };
  $('[data-bars="-4"]').onclick = () => { if (doc.bars.length > 4) { doc.bars = doc.bars.slice(0, -4); sel = Math.min(sel, doc.bars.length - 1); renderBars(); } };
  $('[data-clear]').onclick = () => { doc.bars = emptyBars(doc.bars.length); renderBars(); };
  $('[data-split]').onclick = () => { const b = doc.bars[sel]; b.b = b.b === null ? (b.a || null) : null; renderBars(); renderPalette(); };
  $('[data-erase]').onclick = () => { doc.bars[sel] = { a: null, b: null }; renderBars(); };
  $('[data-save]').onclick = () => { Store.saveWork(JSON.parse(JSON.stringify(doc))); renderWorks(); $('[data-saved]').textContent = `저장했습니다 · ${new Date().toLocaleTimeString('ko-KR')}`; };
  $('[data-new]').onclick = () => { stop(); doc = loadDoc(null); sel = 0; slot = 'a'; syncControls(); renderAll(); };
  $('[data-tosong]').onclick = () => { Store.saveWork(JSON.parse(JSON.stringify(doc))); Store.set('lastChordWork', doc.id); location.hash = '#/lab/song'; };
  $('[data-midi]').onclick = () => {
    const evs = events();
    const chordEvents = [], bassEvents = [], drumEvents = [];
    evs.forEach(e => {
      CHORDS.voicing(e.name, 57).forEach(m => chordEvents.push({ step: e.step, len: e.len, midi: m, vel: 0.7 }));
      const b = CHORDS.bassNote(e.name, 40);
      if (b != null) { bassEvents.push({ step: e.step, len: Math.min(e.len, 4), midi: b, vel: 0.9 }); if (e.len >= 16) bassEvents.push({ step: e.step + 8, len: 4, midi: b, vel: 0.8 }); }
    });
    for (let i = 0; i < doc.bars.length * 16; i++) {
      const p = i % 16;
      if (p === 0 || p === 8) drumEvents.push({ step: i, len: 1, midi: GM_DRUM.kick, ch: 9, vel: 0.9 });
      if (p === 4 || p === 12) drumEvents.push({ step: i, len: 1, midi: GM_DRUM.snare, ch: 9, vel: 0.85 });
      if (p % 2 === 0) drumEvents.push({ step: i, len: 1, midi: GM_DRUM.hat, ch: 9, vel: 0.6 });
    }
    const tracks = [{ name: 'Chords', events: chordEvents, program: GM[doc.inst] ?? GM.piano, ch: 0 }];
    if (doc.bassOn) tracks.push({ name: 'Bass', events: bassEvents, program: GM.bass, ch: 1 });
    if (doc.drums) tracks.push({ name: 'Drums', events: drumEvents, ch: 9 });
    downloadMidi(buildMidi(tracks, { bpm: doc.bpm }), (doc.name || 'progression') + '.mid');
  };

  syncControls(); renderAll();
  return { destroy: stop };
}

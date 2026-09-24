/* 멜로디 랩 — 코드 위 멜로디 예시 8종, 피아노롤, 파트 토글, 악기 선택 */
import { Engine, CHORDS } from '../audio/engine.js';
import { Store } from '../store.js';

const VERSE = ['F#m', 'D', 'A', 'E'], CHORUS = ['A', 'E', 'F#m', 'D'];
export const EXAMPLES = [
  { id:'m1', name:'① 코드톤만', sub:'안전하지만 밋밋하다', chords:VERSE, bpm:96,
    notes:[[0,0,4,66],[0,4,4,69],[0,8,8,73],[1,0,4,74],[1,4,4,69],[1,8,8,66],[2,0,4,73],[2,4,4,69],[2,8,8,64],[3,0,4,64],[3,4,4,68],[3,8,8,71]],
    how:'모든 음이 그 마디 코드 안에 있습니다(전부 초록). 코드와 절대 부딪히지 않습니다.', learn:'코드톤(Chord tone)만 쓰면 안정적이지만, 화음을 따라 읽는 것처럼 들려 노래 같지 않습니다.', say:'멜로디를 처음 쓸 때 여기서 출발하세요. 부딪힐 걱정 없이 윤곽부터 잡을 수 있습니다.' },
  { id:'m2', name:'② 코드톤 + 비화성음', sub:'같은 뼈대에 살 붙이기', chords:VERSE, bpm:96,
    notes:[[0,0,2,66],[0,2,2,68],[0,4,4,69],[0,8,2,71],[0,10,6,73],[1,0,2,74],[1,2,2,73],[1,4,2,71],[1,6,2,69],[1,8,8,66],[2,0,4,69],[2,4,2,71],[2,6,2,73],[2,8,8,69],[3,0,2,71],[3,2,2,69],[3,4,4,68],[3,8,8,64]],
    how:'①과 뼈대는 같고 사이사이에 빨간 음(비화성음)이 들어갔습니다. 짧게 지나가기 때문에 부딪히지 않습니다.', learn:'비화성음(Non-chord tone)은 코드톤 사이를 이어 주는 다리입니다. 짧게, 그리고 약박에 두는 것이 요령입니다.', say:'이 예시가 실제 곡에서 가장 흔한 형태입니다. ①과 번갈아 들어 보세요.' },
  { id:'m3', name:'③ 부딪히는 멜로디', sub:'강박에 비화성음을 길게', chords:VERSE, bpm:96,
    notes:[[0,0,8,68],[0,8,8,66],[1,0,8,64],[1,8,8,66],[2,0,8,62],[2,8,8,61],[3,0,8,66],[3,8,8,64]],
    how:'각 마디 첫 박에 빨간 음이 길게 놓여 있습니다. 코드와 계속 비벼지는 느낌이 납니다.', learn:'같은 비화성음도 강박에 길게 두면 긴장이 됩니다. 의도한 것이 아니라면 피해야 할 배치입니다.', say:'코드를 끄고 멜로디만 들으면 멀쩡합니다. 멜로디는 반드시 코드와 함께 확인하세요.' },
  { id:'m4', name:'④ 리듬만 바꾸기 A', sub:'8분음표로 꽉 채운 버전', chords:VERSE, bpm:96,
    notes:[[0,0,2,66],[0,2,2,68],[0,4,2,69],[0,6,2,71],[0,8,2,73],[0,10,2,71],[0,12,2,69],[0,14,2,66],[1,0,2,74],[1,2,2,73],[1,4,2,71],[1,6,2,69],[1,8,2,66],[1,10,2,69],[1,12,2,66],[1,14,2,64],[2,0,2,69],[2,2,2,71],[2,4,2,73],[2,6,2,71],[2,8,2,69],[2,10,2,66],[2,12,2,64],[2,14,2,66],[3,0,2,71],[3,2,2,69],[3,4,2,68],[3,6,2,64],[3,8,2,68],[3,10,2,71],[3,12,4,64]],
    how:'쉼표 없이 8분음표가 계속됩니다. 숨 쉴 곳이 없습니다.', learn:'음이 많다고 좋은 멜로디가 아닙니다. 보컬은 숨을 쉬어야 하고, 듣는 사람도 쉴 곳이 필요합니다.', say:'⑤와 번갈아 들어 보세요. 음높이는 거의 같은데 인상이 완전히 다릅니다.' },
  { id:'m5', name:'⑤ 리듬만 바꾸기 B', sub:'쉼표와 당김을 넣은 버전', chords:VERSE, bpm:96,
    notes:[[0,2,2,66],[0,4,2,68],[0,6,4,69],[0,12,4,73],[1,0,2,74],[1,2,6,71],[1,10,2,69],[1,12,4,66],[2,2,2,69],[2,4,2,71],[2,6,6,73],[2,14,2,69],[3,0,4,71],[3,6,2,68],[3,8,8,64]],
    how:'④와 같은 음들을 쓰지만 시작을 반 박 뒤로 미루고 중간에 쉼표를 넣었습니다.', learn:'멜로디의 인상은 음높이보다 리듬이 먼저 결정합니다. 쉼표는 비어 있는 것이 아니라 설계된 자리입니다.', say:'가사를 붙일 때도 이 쉼표 자리가 숨 쉬는 지점이 됩니다(6장).' },
  { id:'m6', name:'⑥ 모티프 반복·변형', sub:'같은 조각을 세 번, 네 번째만 다르게', chords:CHORUS, bpm:96,
    notes:[[0,0,2,69],[0,2,2,71],[0,4,4,73],[1,0,2,68],[1,2,2,71],[1,4,4,73],[2,0,2,66],[2,2,2,69],[2,4,4,73],[3,0,2,74],[3,2,2,73],[3,4,2,71],[3,6,2,69],[3,8,8,66]],
    how:'1~3마디가 같은 모양(두 번 짧게 → 한 번 길게)이고, 4마디만 길게 내려옵니다.', learn:'모티프(Motif)를 세 번 반복하고 네 번째를 바꾸는 AAAB 구조는 가장 기억에 남는 형태 중 하나입니다.', say:'코드가 바뀌어도 모양은 유지하고, 음만 그 코드에 맞게 옮기면 됩니다.' },
  { id:'m7', name:'⑦ 벌스와 코러스', sub:'낮고 촘촘하게 → 높고 길게', chords:['F#m','D','A','E'], bpm:96,
    notes:[[0,0,2,61],[0,2,2,66],[0,4,2,64],[0,6,2,61],[0,8,4,59],[0,12,4,61],[1,0,2,62],[1,2,2,66],[1,4,2,64],[1,6,2,62],[1,8,8,57],[2,0,8,73],[2,8,8,76],[3,0,4,76],[3,4,12,71]],
    how:'1~2마디가 벌스(낮고 음이 많음), 3~4마디가 코러스(높고 음이 길음)입니다.', learn:'코러스를 크게 들리게 하는 것은 음량이 아니라 음역과 음 길이의 대비입니다.', say:'벌스에서 아껴 둔 높은 음을 코러스에서 쓰는 것, 이것이 가장 확실한 설계입니다.' },
  { id:'m8', name:'⑧ 완성 예시곡', sub:'벌스 4마디 + 코러스 4마디', chords:['F#m','D','A','E','A','E','F#m','D'], bpm:96,
    notes:[[0,0,2,66],[0,2,2,68],[0,4,4,69],[0,8,2,71],[0,10,6,73],[1,0,2,74],[1,2,2,73],[1,4,2,71],[1,6,2,69],[1,8,8,66],[2,0,4,69],[2,4,2,71],[2,6,2,73],[2,8,8,69],[3,0,2,71],[3,2,2,69],[3,4,4,68],[3,8,4,64],[4,0,4,69],[4,4,4,73],[4,8,8,76],[5,0,4,71],[5,4,4,68],[5,8,8,71],[6,0,4,73],[6,4,4,74],[6,8,8,73],[7,0,4,74],[7,4,4,69],[7,8,8,66]],
    how:'앞 4마디가 벌스(②와 같은 멜로디), 뒤 4마디가 코러스입니다. 코러스에서 음역이 올라가고 음이 길어집니다.', learn:'교재 5장에서 단계별로 만든 멜로디의 완성본입니다. 드럼·베이스를 켜면 밴드 데모에 가까워집니다.', say:'이 위에 가사를 붙이는 것이 6장입니다.' },
];
const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const BLACK = [1, 3, 6, 8, 10];

export function mountMelodyLab(root, initialId) {
  const s = Store.settings();
  let cur = EXAMPLES[0], seq = null;
  const st = { mel: true, chord: true, drum: true, bass: true, click: false, inst: s.instrument || 'lead', chordInst: 'pad' };
  root.innerHTML = `
  <div class="lab">
    <header class="lab-head"><div class="eyebrow">LAB · CHAPTER 5</div><h1>멜로디 랩</h1><p>같은 코드 위에서 멜로디가 어떻게 달라지는지 들어 보세요. 모두 A키 · 96 BPM, 교재 예시곡과 같은 진행입니다.</p></header>
    <div class="transport">
      <button class="play" data-play><span class="ico">▶</span><span>재생</span></button>
      <label class="field"><span>BPM <b data-bpmv>96</b></span><input type="range" data-bpm min="60" max="140" value="96"></label>
      <div class="toggles">
        <button class="toggle on" data-t="mel">멜로디</button><button class="toggle on" data-t="chord">코드</button>
        <button class="toggle on" data-t="drum">드럼</button><button class="toggle on" data-t="bass">베이스</button><button class="toggle" data-t="click">클릭</button>
      </div>
      <label class="field small"><span>멜로디 악기</span><select data-inst>${Object.entries(Engine.INSTRUMENTS).filter(([k]) => k !== 'bass').map(([k, v]) => `<option value="${k}" ${k === st.inst ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
      <label class="field small"><span>코드 악기</span><select data-cinst>${['pad', 'piano', 'epiano', 'guitar'].map(k => `<option value="${k}" ${k === st.chordInst ? 'selected' : ''}>${Engine.INSTRUMENTS[k].label}</option>`).join('')}</select></label>
    </div>
    <div class="chips" data-chips></div>
    <section class="panel">
      <h2 data-name></h2><div class="meta" data-meta></div>
      <div class="rollwrap"><div class="roll" data-roll></div></div>
      <div class="legend"><span class="lt">코드톤</span><span class="ln">비화성음</span></div>
      <div class="notes"><div><b>듣는 법</b><span data-how></span></div><div><b>배우는 것</b><span data-learn></span></div></div>
      <div class="say" data-say></div>
    </section>
  </div>`;
  const $ = q => root.querySelector(q);
  const chips = $('[data-chips]');
  EXAMPLES.forEach(e => { const b = document.createElement('button'); b.className = 'chip'; b.dataset.id = e.id; b.textContent = e.name; b.onclick = () => select(e, true); chips.appendChild(b); });
  const isTone = (m, ch) => CHORDS.tones(ch).includes(((m % 12) + 12) % 12);
  const total = () => cur.chords.length * 16;

  function buildRoll() {
    const roll = $('[data-roll]'); roll.innerHTML = '';
    const bars = cur.chords.length, steps = bars * 16;
    const lo = Math.min(...cur.notes.map(n => n[3])) - 1, hi = Math.max(...cur.notes.map(n => n[3])) + 1;
    const barrow = document.createElement('div'); barrow.className = 'barrow';
    cur.chords.forEach(c => { const d = document.createElement('div'); d.textContent = c; barrow.appendChild(d); });
    roll.appendChild(barrow);
    const grid = document.createElement('div'); grid.className = 'pgrid';
    for (let m = hi; m >= lo; m--) {
      const r = document.createElement('div'); r.className = 'rowline ' + (BLACK.includes(((m % 12) + 12) % 12) ? 'black' : 'white');
      for (let i = 0; i < steps; i++) { const sp = document.createElement('span'); if (i % 4 === 3) sp.className = 'beat'; r.appendChild(sp); }
      if (((m % 12) + 12) % 12 === 9 || ((m % 12) + 12) % 12 === 0) { const lab = document.createElement('div'); lab.className = 'pitchlab'; lab.style.top = ((hi - m) * 13 - 2) + 'px'; lab.textContent = NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); grid.appendChild(lab); }
      grid.appendChild(r);
    }
    const head = document.createElement('div'); head.className = 'phead'; head.hidden = true; grid.appendChild(head);
    cur.notes.forEach(([bar, s0, len, m]) => {
      const el = document.createElement('div'); el.className = 'pnote' + (isTone(m, cur.chords[bar]) ? '' : ' nct');
      el.style.top = ((hi - m) * 13 + 1) + 'px'; el.style.left = (((bar * 16 + s0) / steps) * 100) + '%'; el.style.width = ((len / steps) * 100) + '%';
      el.dataset.at = bar * 16 + s0; grid.appendChild(el);
    });
    roll.appendChild(grid);
  }
  function paint(i) {
    const head = $('.phead'); if (!head) return;
    root.querySelectorAll('.pnote.now').forEach(n => n.classList.remove('now'));
    if (i < 0) { head.hidden = true; return; }
    head.hidden = false; head.style.left = ((i / total()) * 100) + '%';
    root.querySelectorAll(`.pnote[data-at="${i}"]`).forEach(n => n.classList.add('now'));
  }
  function select(e, push) {
    cur = e; $('[data-bpm]').value = e.bpm; $('[data-bpmv]').textContent = e.bpm;
    $('[data-name]').textContent = e.name; $('[data-meta]').textContent = `${e.sub} · A키 · ${e.chords.join(' – ')} · ${e.chords.length}마디`;
    $('[data-how]').textContent = e.how; $('[data-learn]').textContent = e.learn; $('[data-say]').textContent = e.say;
    root.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.id === e.id));
    buildRoll();
    if (seq) { seq.steps = total(); seq.step = 0; seq.bpm = e.bpm; }
    if (push) history.replaceState(null, '', '#/lab/melody/' + e.id);
  }
  function start() {
    seq = new Engine.Sequencer({ bpm: +$('[data-bpm]').value, steps: total(), onPaint: paint, onStep: (i, t, sd) => {
      const bar = Math.floor(i / 16), inBar = i % 16, ch = cur.chords[bar];
      if (st.chord && inBar === 0) Engine.chord(st.chordInst, CHORDS.voicing(ch, 57), t, sd * 16 * 0.95, 0.7);
      if (st.bass && (inBar === 0 || inBar === 8)) Engine.note('bass', CHORDS.bassNote(ch, 40), t, sd * 7, 0.8);
      if (st.drum) { if (inBar === 0 || inBar === 8) Engine.drum('kick', t); if (inBar === 4 || inBar === 12) Engine.drum('snare', t); if (inBar % 2 === 0) Engine.drum('hat', t, 0.7); }
      if (st.click && inBar % 4 === 0) Engine.drum('click', t, inBar === 0 ? 1 : 0.6);
      if (st.mel) cur.notes.forEach(n => { if (n[0] === bar && n[1] === inBar) Engine.note(st.inst, n[3], t, sd * n[2] * 0.92, 1); });
    } });
    seq.start(); $('[data-play] .ico').textContent = '■'; $('[data-play] span:last-child').textContent = '정지';
  }
  function stop() { if (seq) seq.stop(); seq = null; $('[data-play] .ico').textContent = '▶'; $('[data-play] span:last-child').textContent = '재생'; }
  $('[data-play]').onclick = () => (seq && seq.playing) ? stop() : start();
  $('[data-bpm]').oninput = e => { $('[data-bpmv]').textContent = e.target.value; if (seq) seq.bpm = +e.target.value; };
  root.querySelectorAll('.toggle').forEach(b => b.onclick = () => { const k = b.dataset.t; st[k] = !st[k]; b.classList.toggle('on', st[k]); });
  $('[data-inst]').onchange = e => { st.inst = e.target.value; Store.saveSettings({ instrument: st.inst }); };
  $('[data-cinst]').onchange = e => { st.chordInst = e.target.value; };
  select(EXAMPLES.find(e => e.id === initialId) || EXAMPLES[0], false);
  return { destroy: stop, select: id => { const e = EXAMPLES.find(e => e.id === id); if (e) select(e, false); } };
}

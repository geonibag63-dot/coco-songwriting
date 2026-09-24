/* 그루브 랩 — 드럼 패턴 8종, BPM·스윙·파트 토글, 칸 편집 */
import { Engine } from '../audio/engine.js';
import { Store } from '../store.js';

export const GROOVES = [
  { id:'g1', name:'8비트 기본', en:'Basic 8-beat', steps:16, bpm:92, swing:0, k:[0,8], s:[4,12], h:[0,2,4,6,8,10,12,14], acc:[0,8],
    feel:'가장 표준적인 록·팝 비트. 2·4박의 스네어(백비트)가 곡을 끌고 간다.', use:'거의 모든 장르의 기본값. 벌스든 코러스든 우선 여기서 출발한다.', bass:'킥과 같은 자리(1·3박)에 근음을 두면 단단하게 붙는다.', say:'"8비트로, 백비트 확실하게" — 드러머에게 이 한마디면 통합니다.' },
  { id:'g2', name:'8비트 변형 (당김)', en:'Syncopated 8-beat', steps:16, bpm:96, swing:0, k:[0,10], s:[4,12], h:[0,2,4,6,8,10,12,14], acc:[0],
    feel:'세 번째 박 뒤(3의 &)로 킥이 밀리면서 앞으로 당겨지는 느낌이 생긴다.', use:'기본 8비트가 심심할 때. 벌스에서 코러스로 넘어가기 전 구간.', bass:'킥이 당겨진 자리를 베이스도 함께 당기면 그루브가 또렷해진다.', say:'"3박 뒤에 킥 하나 당겨서" 라고 위치를 짚어 주세요.' },
  { id:'g3', name:'16비트', en:'16th-note groove', steps:16, bpm:88, swing:0, k:[0,10], s:[4,12], h:[...Array(16).keys()], acc:[0,4,8,12],
    feel:'하이햇이 두 배로 촘촘해져 잘게 흐르는 느낌. 같은 BPM인데 더 바쁘게 들린다.', use:'펑크·시티팝·R&B 계열, 또는 느린 곡에서 밀도를 올릴 때.', bass:'베이스도 16분으로 쪼개면 과밀해진다. 공간을 남기고 고스트 노트로 채우는 편이 낫다.', say:'"하이햇 16으로, 나머지는 그대로" 처럼 한 파트만 지정하세요.' },
  { id:'g4', name:'하프타임', en:'Half-time', steps:16, bpm:96, swing:0, k:[0,10], s:[8], h:[0,2,4,6,8,10,12,14], acc:[0,8],
    feel:'스네어가 3박에만 오면서 템포는 그대로인데 절반으로 느려진 듯 묵직해진다.', use:'브리지, 마지막 코러스 직전, 또는 곡 전체를 무겁게 끌고 갈 때.', bass:'길게 뻗는 음으로 공간을 채운다. 음을 적게 쓸수록 효과가 크다.', say:'"여기서 하프타임" — BPM은 그대로 두라는 말까지 붙이면 오해가 없습니다.' },
  { id:'g5', name:'포 온 더 플로어', en:'Four on the floor', steps:16, bpm:124, swing:0, k:[0,4,8,12], s:[4,12], h:[2,6,10,14], acc:[0,8],
    feel:'킥이 네 박 모두에 박혀 계속 달린다. 하이햇이 뒷박에 오면 더 튀어 오른다.', use:'댄스·디스코 계열, 신나는 코러스, 앙코르용 업템포 곡.', bass:'킥이 꽉 차 있으니 베이스는 뒷박이나 8분으로 엇갈리게 놓아야 자리가 생긴다.', say:'"포 온 더 플로어, 하이햇은 뒷박" 이라고 두 가지를 같이 지정하세요.' },
  { id:'g6', name:'셔플 · 스윙', en:'Shuffle', steps:16, bpm:104, swing:58, k:[0,8], s:[4,12], h:[0,2,4,6,8,10,12,14], acc:[0,8],
    feel:'8분음표의 뒷부분이 뒤로 밀리면서 통통 튀는 3박자 느낌이 된다.', use:'블루스, 로큰롤, 흥겨운 미디엄 템포 곡.', bass:'베이스도 같은 스윙으로 밀어야 한다. 한 파트만 스트레이트면 바로 어긋나 들린다.', say:'"셔플로" 또는 "스윙 느낌으로" — 스윙 슬라이더를 0으로 내리면 차이를 바로 알 수 있습니다.' },
  { id:'g7', name:'트레인 비트', en:'Train beat', steps:16, bpm:132, swing:0, k:[0,8], s:[0,2,4,6,8,10,12,14], h:[], acc:[4,12],
    feel:'스네어가 8분으로 계속 달리고 2·4박에 악센트가 붙어 기차처럼 밀고 나간다.', use:'질주하는 펑크·컨트리록, 짧고 빠른 곡의 벌스.', bass:'8분음표 근음 연타가 가장 잘 맞는다. 손가락 힘을 아끼려면 두 손가락 교대를 정확히.', say:'"트레인 비트" 또는 "스네어로 8분 달려 줘".' },
  { id:'g8', name:'6/8 발라드', en:'6/8 ballad', steps:12, bpm:66, swing:0, k:[0,6], s:[6], h:[0,2,4,6,8,10], acc:[0,6],
    feel:'한 박을 셋으로 나눠 세는 박자. 흔들리듯 넘실대는 느낌이 난다.', use:'발라드, 왈츠풍 곡, 감정을 크게 부풀리는 마지막 코러스.', bass:'첫 박에 근음을 길게 두고 나머지는 비워 두면 보컬이 살아난다.', say:'"6/8로" — 4/4 곡에 익숙한 멤버에겐 한 마디를 "하나-둘-셋, 둘-둘-셋"으로 세어 주세요.' },
];

export function mountGrooveLab(root, initialId) {
  const s = Store.settings();
  Engine.setKit(s.kit);
  let cur = GROOVES[0], pattern = null, seq = null;
  const st = { k: true, s: true, h: true, bass: false, click: true };
  root.innerHTML = `
  <div class="lab">
    <header class="lab-head"><div class="eyebrow">LAB · CHAPTER 4</div><h1>그루브 랩</h1><p>패턴을 듣고, 속도를 바꾸고, 파트를 하나씩 꺼 보세요. 칸을 눌러 직접 고칠 수도 있습니다.</p></header>
    <div class="transport">
      <button class="play" data-play><span class="ico">▶</span><span>재생</span></button>
      <label class="field"><span>BPM <b data-bpmv>92</b></span><input type="range" data-bpm min="50" max="180" value="92"></label>
      <label class="field"><span>스윙 <b data-swv>0%</b></span><input type="range" data-sw min="0" max="66" value="0"></label>
      <div class="toggles">
        <button class="toggle on" data-t="k" style="--c:var(--kick)">킥</button><button class="toggle on" data-t="s" style="--c:var(--snare)">스네어</button>
        <button class="toggle on" data-t="h" style="--c:var(--hat)">하이햇</button><button class="toggle" data-t="bass">베이스</button><button class="toggle on" data-t="click">클릭</button>
      </div>
      <label class="field small"><span>드럼킷</span><select data-kit>${Object.entries(Engine.KITS).map(([k, v]) => `<option value="${k}" ${k === s.kit ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
    </div>
    <div class="chips" data-chips></div>
    <section class="panel">
      <h2 data-name></h2><div class="meta" data-meta></div>
      <div class="gridwrap"><table class="dgrid" data-grid><tbody></tbody></table></div>
      <div class="legend"><span class="lk">킥</span><span class="ls">스네어</span><span class="lh">하이햇</span><span>테두리 = 악센트</span></div>
      <div class="notes"><div><b>느낌</b><span data-feel></span></div><div><b>쓰는 곳</b><span data-use></span></div><div><b>베이스</b><span data-bass></span></div></div>
      <div class="say" data-say></div>
    </section>
  </div>`;
  const $ = q => root.querySelector(q);
  const chips = $('[data-chips]');
  GROOVES.forEach((g, i) => { const b = document.createElement('button'); b.className = 'chip'; b.dataset.id = g.id; b.textContent = `${i + 1}. ${g.name}`; b.onclick = () => select(g, true); chips.appendChild(b); });

  function buildGrid() {
    const tb = $('[data-grid] tbody'); tb.innerHTML = '';
    const head = document.createElement('tr'); head.appendChild(document.createElement('td'));
    for (let i = 0; i < cur.steps; i++) {
      const th = document.createElement('th');
      if (cur.steps === 12) { th.textContent = i % 3 === 0 ? String(i / 3 + 1) : '·'; if (i % 3 === 0) th.className = 'beat'; }
      else { th.textContent = i % 4 === 0 ? String(i / 4 + 1) : ['', 'e', '&', 'a'][i % 4]; if (i % 4 === 0) th.className = 'beat'; }
      head.appendChild(th);
    }
    tb.appendChild(head);
    [['h', '하이햇'], ['s', '스네어'], ['k', '킥']].forEach(([key, label]) => {
      const tr = document.createElement('tr'); const td = document.createElement('td'); td.className = 'lab'; td.textContent = label; tr.appendChild(td);
      for (let i = 0; i < cur.steps; i++) {
        const cell = document.createElement('td'); const btn = document.createElement('button');
        btn.className = 'cell ' + key + (pattern[key].includes(i) ? ' on' : '') + (pattern.acc.includes(i) && pattern[key].includes(i) ? ' accent' : '');
        btn.dataset.i = i; btn.dataset.row = key; btn.setAttribute('aria-label', `${label} ${i + 1}`);
        btn.onclick = () => { const arr = pattern[key], at = arr.indexOf(i); if (at >= 0) arr.splice(at, 1); else arr.push(i); btn.classList.toggle('on'); };
        cell.appendChild(btn); tr.appendChild(cell);
      }
      tb.appendChild(tr);
    });
    paintMutes();
  }
  function paintMutes() { root.querySelectorAll('.cell').forEach(c => c.classList.toggle('muted', !st[c.dataset.row])); }
  function paint(i) { root.querySelectorAll('.cell.now').forEach(c => c.classList.remove('now')); if (i < 0) return; root.querySelectorAll(`.cell[data-i="${i}"]`).forEach(c => c.classList.add('now')); }
  function select(g, push) {
    cur = g; pattern = { k: [...g.k], s: [...g.s], h: [...g.h], acc: [...g.acc] };
    $('[data-bpm]').value = g.bpm; $('[data-bpmv]').textContent = g.bpm; $('[data-sw]').value = g.swing; $('[data-swv]').textContent = g.swing + '%';
    $('[data-name]').textContent = g.name; $('[data-meta]').textContent = `${g.en} · ${g.steps === 12 ? '6/8박자' : '4/4박자'} · 권장 ${g.bpm} BPM`;
    $('[data-feel]').textContent = g.feel; $('[data-use]').textContent = g.use; $('[data-bass]').textContent = g.bass; $('[data-say]').textContent = g.say;
    root.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.id === g.id));
    buildGrid();
    if (seq) { seq.bpm = g.bpm; seq.swing = g.swing; seq.steps = g.steps; seq.step = 0; }
    if (push) history.replaceState(null, '', '#/lab/groove/' + g.id);
  }
  function start() {
    seq = new Engine.Sequencer({ bpm: +$('[data-bpm]').value, steps: cur.steps, onPaint: paint, onStep: (i, t) => {
      if (st.k && pattern.k.includes(i)) { Engine.drum('kick', t); if (st.bass) Engine.note('bass', 45, t, 0.35, 0.8); }
      if (st.s && pattern.s.includes(i)) Engine.drum('snare', t, pattern.acc.includes(i) ? 1 : 0.72);
      if (st.h && pattern.h.includes(i)) Engine.drum('hat', t, pattern.acc.includes(i) ? 1 : 0.7);
      if (st.click && i % (cur.steps === 12 ? 3 : 4) === 0) Engine.drum('click', t, i === 0 ? 1 : 0.6);
    } });
    seq.swing = +$('[data-sw]').value; seq.start();
    $('[data-play] .ico').textContent = '■'; $('[data-play] span:last-child').textContent = '정지';
  }
  function stop() { if (seq) seq.stop(); seq = null; $('[data-play] .ico').textContent = '▶'; $('[data-play] span:last-child').textContent = '재생'; }
  $('[data-play]').onclick = () => (seq && seq.playing) ? stop() : start();
  $('[data-bpm]').oninput = e => { $('[data-bpmv]').textContent = e.target.value; if (seq) seq.bpm = +e.target.value; };
  $('[data-sw]').oninput = e => { $('[data-swv]').textContent = e.target.value + '%'; if (seq) seq.swing = +e.target.value; };
  root.querySelectorAll('.toggle').forEach(b => b.onclick = () => { const k = b.dataset.t; st[k] = !st[k]; b.classList.toggle('on', st[k]); paintMutes(); });
  $('[data-kit]').onchange = e => { Engine.setKit(e.target.value); Store.saveSettings({ kit: e.target.value }); };
  select(GROOVES.find(g => g.id === initialId) || GROOVES[0], false);
  return { destroy: stop, select: id => { const g = GROOVES.find(g => g.id === id); if (g) select(g, false); } };
}

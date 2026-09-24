/* 코코와 작곡하기 — 앱 셸, 라우터, 챕터 뷰 */
import { Store } from './store.js';
import { Engine } from './audio/engine.js';
import { mountStaff, stopAllPlayers } from './notation.js';
import { STAFFS } from '../data/staffs.js';
import { TOC } from '../data/toc.js';
import { mountGrooveLab } from './labs/groove.js';
import { mountMelodyLab } from './labs/melody.js';
import { mountChordLab } from './labs/chords.js';
import { TTS } from './tts.js';

const $ = (q, el = document) => el.querySelector(q);
const view = () => $('#view');
let currentLab = null;

/* ---------- 테마·설정 적용 ---------- */
function applySettings() {
  const s = Store.settings();
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.style.setProperty('--font-scale', s.fontScale);
}

/* ---------- 네비게이션 ---------- */
function renderNav() {
  const p = Store.progress();
  const chapters = TOC.map(c => {
    if (c.planned) return `<div class="nav-item planned"><span class="num">${c.n}</span><span>${c.title.split(' — ')[0]}</span><em>예정</em></div>`;
    const done = Object.keys(p.read[`ch${c.n}`] || {}).length, tot = c.sections.length;
    return `<a class="nav-item" href="#/ch/${c.n}" data-ch="${c.n}"><span class="num">${c.n}</span><span>${c.title}</span><i class="bar"><b style="width:${tot ? Math.round(done / tot * 100) : 0}%"></b></i></a>`;
  }).join('');
  $('#nav').innerHTML = `
    <div class="nav-group"><div class="nav-title">교재</div><a class="nav-item" href="#/guide"><span class="num">i</span><span>사용법 · 시작하기</span></a>${chapters}</div>
    <div class="nav-group"><div class="nav-title">실습</div>
      <a class="nav-item" href="#/lab/groove"><span class="num">♪</span><span>그루브 랩</span></a>
      <a class="nav-item" href="#/lab/melody"><span class="num">♪</span><span>멜로디 랩</span></a>
      <a class="nav-item" href="#/lab/chords"><span class="num">♪</span><span>코드 진행 편집기</span></a>
      <a class="nav-item" href="#/lab/song"><span class="num">♪</span><span>곡 만들기</span><em>2단계</em></a></div>
    <div class="nav-group"><div class="nav-title">나</div>
      <a class="nav-item" href="#/quest"><span class="num">✓</span><span>퀘스트 보드</span></a>
      <a class="nav-item" href="#/coco"><span class="num">C</span><span>코코에게 묻기</span><em>3단계</em></a>
      <a class="nav-item" href="#/settings"><span class="num">⚙</span><span>설정</span></a></div>`;
}
function setActiveNav(hash) {
  document.querySelectorAll('#nav .nav-item').forEach(a => a.classList.toggle('active', a.getAttribute('href') && hash.startsWith(a.getAttribute('href'))));
}

/* ---------- 챕터 ---------- */
async function loadChapter(n, secId) {
  const ch = `ch${n}`;
  const meta = TOC.find(c => c.n === n);
  const html = await (await fetch(`content/${ch}.html`)).text();
  let ans = '';
  try { const r = await fetch(`content/answers${n}.html`); if (r.ok) ans = await r.text(); } catch (e) { }
  const v = view();
  v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter');
  v.innerHTML = `<article class="chapter-view" data-ch="${ch}">${html}
    ${ans ? `<details class="answers-box"><summary>정답과 해설 보기 (${n}장)</summary><div class="answers">${ans}</div></details>` : ''}
    <nav class="chapter-foot">${n > 1 ? `<a class="btn ghost" href="#/ch/${n - 1}">← ${n - 1}장</a>` : '<span></span>'}${TOC.find(c => c.n === n + 1 && !c.planned) ? `<a class="btn" href="#/ch/${n + 1}">${n + 1}장 →</a>` : '<span class="small">다음 장은 준비 중</span>'}</nav>
  </article>`;
  enhanceChapter(v.firstElementChild, ch, meta);
  if (secId) { const h = [...v.querySelectorAll('h2.sec')].find(h => h.textContent.trim().startsWith(secId)); if (h) h.scrollIntoView(); }
  else window.scrollTo(0, 0);
}

function enhanceChapter(root, ch, meta) {
  // 악보
  root.querySelectorAll('.staff[data-staff]').forEach(el => { const spec = STAFFS[el.dataset.staff]; if (spec) mountStaff(el, spec); else el.textContent = '(악보 준비 중)'; });
  // 섹션 id + 읽음 추적
  const secs = [...root.querySelectorAll('h2.sec')];
  secs.forEach(h => { const id = h.textContent.trim().split(' ')[0]; h.id = 'sec-' + id; h.dataset.sec = id; });
  // 읽어주기 (섹션 단위)
  if (TTS.ok) secs.forEach((h, i) => {
    const b = document.createElement('button'); b.className = 'read-btn'; b.title = '이 섹션 읽어주기'; b.innerHTML = '<span>🔊</span><span class="t">읽어주기</span>';
    b.addEventListener('click', () => {
      if (b.classList.contains('on')) { TTS.stop(); return; }
      const parts = []; let el = h.nextElementSibling;
      while (el && !el.matches('h2.sec, .exercise-head, .summary')) { if (!el.matches('figure, .quiz, script, style')) parts.push(el.innerText); el = el.nextElementSibling; }
      const s = Store.settings();
      document.querySelectorAll('.read-btn.on').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      TTS.speak(h.innerText + '. ' + parts.join('. '), { rate: s.ttsRate || 1, voice: s.ttsVoice || null, onend: () => b.classList.remove('on') });
    });
    h.appendChild(b);
  });
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { Store.markRead(ch, e.target.dataset.sec); renderNav(); setActiveNav(location.hash); } }), { threshold: 0.6 });
  secs.forEach(h => io.observe(h));
  // 퀴즈
  const p = Store.progress();
  root.querySelectorAll('.quiz').forEach((q, qi) => {
    const qid = (q.querySelector('.qh')?.textContent || '').replace(/[^0-9-]/g, '') || String(qi);
    const items = [...q.querySelectorAll('ol > li')];
    const ansEl = q.querySelector('.ans');
    const ansText = ansEl ? ansEl.innerHTML.replace(/<b>정답<\/b>\s*/, '') : '';
    const parts = ansText.split(/\s*&nbsp;\s*(?=\d\))/).map(s => s.replace(/^\d\)\s*/, '').trim());
    const saved = (p.quiz[ch] || {})[qid] || null;
    const savedA = Store.answers(ch);
    items.forEach((li, i) => {
      const wrap = document.createElement('div'); wrap.className = 'qa';
      const inp = document.createElement('input'); inp.type = 'text'; inp.placeholder = '답을 적어 보세요'; inp.value = savedA[`quiz${qid}:${i}`] || '';
      inp.addEventListener('input', () => Store.saveAnswer(ch, `quiz${qid}:${i}`, inp.value));
      const a = document.createElement('div'); a.className = 'qa-ans'; a.innerHTML = `<b>정답</b> ${parts[i] || ''}`;
      const mark = document.createElement('div'); mark.className = 'qa-mark'; mark.innerHTML = `<button data-m="1">맞았다</button><button data-m="0">틀렸다</button>`;
      wrap.append(inp, a, mark); li.appendChild(wrap);
      mark.querySelectorAll('button').forEach(b => b.onclick = () => { const marks = (Store.progress().quiz[ch] || {})[qid] || {}; marks[i] = +b.dataset.m; Store.markQuiz(ch, qid, marks); paintMarks(); });
    });
    if (ansEl) ansEl.remove();
    const btn = document.createElement('button'); btn.className = 'btn small'; btn.textContent = '정답 확인';
    const norm = s => (s || '').toLowerCase().replace(/♭/g, 'b').replace(/♯/g, '#').replace(/[\s·,.–\-()·]/g, '').replace(/<[^>]+>/g, '');
    btn.onclick = () => {
      q.classList.add('revealed'); btn.remove();
      // 짧은 답은 자동 채점: 정답의 핵심 토큰(괄호 앞부분)과 비교
      const marks = (Store.progress().quiz[ch] || {})[qid] || {};
      items.forEach((li, i) => {
        const mine = norm(li.querySelector('input')?.value);
        const key = norm((parts[i] || '').replace(/<[^>]+>/g, '').split(/[(—]/)[0]);
        if (mine && key && key.length <= 24 && (mine === key || key.split(/[·,]/).every(t => mine.includes(norm(t))))) { marks[i] = 1; li.classList.add('auto'); }
      });
      if (Object.keys(marks).length) { Store.markQuiz(ch, qid, marks); }
      paintMarks();
    };
    q.appendChild(btn);
    const paintMarks = () => { const marks = (Store.progress().quiz[ch] || {})[qid] || {}; items.forEach((li, i) => { li.classList.toggle('ok', marks[i] === 1); li.classList.toggle('ng', marks[i] === 0); }); const done = Object.keys(marks).length === items.length; q.classList.toggle('done', done); renderNav(); };
    if (saved) { q.classList.add('revealed'); btn.remove(); }
    paintMarks();
  });
  // 연습 문제 답안
  const savedA = Store.answers(ch);
  root.querySelectorAll('.prob').forEach((pr, pi) => {
    const key = `p${pi + 1}`;
    const writes = pr.querySelectorAll('.write');
    if (writes.length) {
      const ta = document.createElement('textarea'); ta.rows = Math.max(2, writes.length); ta.placeholder = '여기에 답을 적으세요 (자동 저장)'; ta.value = savedA[`${key}:t`] || '';
      ta.addEventListener('input', () => Store.saveAnswer(ch, `${key}:t`, ta.value));
      writes[0].replaceWith(ta); writes.forEach((w, i) => { if (i) w.remove(); });
    }
    pr.querySelectorAll('.fill').forEach((f, fi) => { const inp = document.createElement('input'); inp.className = 'fill-in'; inp.value = savedA[`${key}:f${fi}`] || ''; inp.addEventListener('input', () => Store.saveAnswer(ch, `${key}:f${fi}`, inp.value)); f.replaceWith(inp); });
    pr.querySelectorAll('table.worksheet td').forEach((td, ti) => { if (td.textContent.trim() === '' && !td.querySelector('*')) { td.contentEditable = 'true'; td.classList.add('edit'); td.textContent = savedA[`${key}:c${ti}`] || ''; td.addEventListener('input', () => Store.saveAnswer(ch, `${key}:c${ti}`, td.textContent)); } });
  });
  // 체크박스(.box) 저장
  root.querySelectorAll('.box').forEach((b, bi) => { const k = `box${bi}`; if (savedA[k]) b.classList.add('on'); b.onclick = () => { b.classList.toggle('on'); Store.saveAnswer(ch, k, b.classList.contains('on') ? 1 : ''); }; });
  // 그림 폰트
  root.querySelectorAll('svg[font-family]').forEach(s => s.setAttribute('font-family', "'Noto Sans KR', sans-serif"));
}

/* ---------- 기타 페이지 ---------- */
async function loadGuide() {
  const html = await (await fetch('content/guide.html')).text();
  view().innerHTML = `<article class="chapter-view"><div class="ch-open"><div class="no">START</div><h1>코코와 작곡하기</h1><div class="en">밴드 작곡가를 위한 설계 교과서 — 앱판</div></div>
  <div class="labbox"><div class="labbox-ico">🎧</div><div><b>소리를 켜세요</b><p>이 교재의 악보에는 모두 <b>들어보기</b> 버튼이 있고, 4·5장에는 실습 랩이 연결되어 있습니다. 휴대폰은 무음 모드를 풀어 주세요.</p></div></div>
  <section class="front">${html.replace(/<h2>학습 퀘스트 보드[\s\S]*$/, '')}</section>
  <p><a class="btn" href="#/ch/1">1장부터 시작하기 →</a> &nbsp; <a class="btn ghost" href="#/quest">퀘스트 보드 보기</a></p></article>`;
  window.scrollTo(0, 0);
}
function loadQuest() {
  const p = Store.progress();
  const rows = TOC.map(c => {
    if (c.planned) return `<tr class="planned"><td>${c.n}</td><td class="l">${c.title.split(' — ')[0]}</td><td colspan="4">예정</td></tr>`;
    const ch = `ch${c.n}`; const read = Object.keys(p.read[ch] || {}).length, tot = c.sections.length;
    const quizzes = Object.values(p.quiz[ch] || {}); const qdone = quizzes.filter(m => Object.keys(m).length > 0).length;
    const probs = Object.values(p.prob[ch] || {}).filter(Boolean).length;
    const pct = Math.round((read / Math.max(tot, 1)) * 60 + Math.min(qdone, 8) / 8 * 25 + Math.min(probs, 10) / 10 * 15);
    return `<tr><td>${c.n}</td><td class="l"><a href="#/ch/${c.n}">${c.title}</a></td><td>${read}/${tot}</td><td>${qdone}</td><td>${probs}</td><td><i class="bar"><b style="width:${pct}%"></b></i> ${pct}%</td></tr>`;
  }).join('');
  const total = TOC.filter(c => !c.planned).length;
  const overall = Math.round(TOC.filter(c => !c.planned).reduce((a, c) => { const ch = `ch${c.n}`; return a + Object.keys(p.read[ch] || {}).length / Math.max(c.sections.length, 1); }, 0) / total * 100);
  view().innerHTML = `<article class="chapter-view"><div class="ch-open"><div class="no">QUEST BOARD</div><h1>학습 퀘스트 보드</h1><div class="en">읽은 섹션, 푼 퀴즈, 적은 답안을 앱이 자동으로 기록합니다.</div></div>
  <div class="overall"><div class="overall-num">${overall}%</div><div><b>전체 진행률</b> (1~${total}장 본문 기준)<i class="bar big"><b style="width:${overall}%"></b></i></div></div>
  <table class="t"><tr><th>장</th><th class="l">제목</th><th>읽음</th><th>퀴즈</th><th>답안</th><th>진행</th></tr>${rows}</table>
  <p class="small">진행률 = 읽은 섹션 60% + 퀴즈 25% + 연습 문제 답안 15%. 섹션은 화면에 충분히 보이면 읽은 것으로 기록됩니다.</p>
  <h3>내 데이터</h3><p><button class="btn ghost" id="exp">백업 파일 만들기</button> <label class="btn ghost">백업 불러오기<input type="file" id="imp" accept="application/json" hidden></label> <button class="btn ghost danger" id="reset">진도 초기화</button></p></article>`;
  $('#exp').onclick = () => { const blob = new Blob([JSON.stringify(Store.exportAll())], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'coco-backup.json'; a.click(); };
  $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { Store.importAll(JSON.parse(t)); alert('불러왔습니다.'); route(); }); };
  $('#reset').onclick = () => { if (confirm('읽은 기록과 퀴즈 채점을 지울까요? (답안은 남습니다)')) { Store.set('progress', { read: {}, quiz: {}, prob: {} }); route(); } };
  window.scrollTo(0, 0);
}
function loadSettings() {
  const s = Store.settings();
  view().innerHTML = `<article class="chapter-view"><div class="ch-open"><div class="no">SETTINGS</div><h1>설정</h1></div>
  <section class="settings">
    <h3>화면</h3>
    <label class="row"><span>테마</span><select id="theme"><option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>어둡게 (스튜디오)</option><option value="light" ${s.theme === 'light' ? 'selected' : ''}>밝게 (종이)</option></select></label>
    <label class="row"><span>글자 크기</span><input type="range" id="fs" min="0.85" max="1.3" step="0.05" value="${s.fontScale}"><b id="fsv">${Math.round(s.fontScale * 100)}%</b></label>
    <h3>소리</h3>
    <label class="row"><span>기본 멜로디 악기</span><select id="inst">${Object.entries(Engine.INSTRUMENTS).map(([k, v]) => `<option value="${k}" ${k === s.instrument ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
    <label class="row"><span>드럼킷</span><select id="kit">${Object.entries(Engine.KITS).map(([k, v]) => `<option value="${k}" ${k === s.kit ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
    <p><button class="btn ghost" id="test">소리 테스트</button></p>
    <h3>읽어주기</h3>
    <label class="row"><span>음성</span><select id="voice"><option value="">기기 기본 (한국어)</option>${TTS.voices().map(v => `<option value="${v.name}" ${v.name === s.ttsVoice ? 'selected' : ''}>${v.name}</option>`).join('')}</select></label>
    <label class="row"><span>속도</span><input type="range" id="rate" min="0.7" max="1.4" step="0.05" value="${s.ttsRate || 1}"><b id="ratev">${(s.ttsRate || 1).toFixed(2)}x</b></label>
    <p><button class="btn ghost" id="ttstest">읽어주기 테스트</button> <span class="small">${TTS.ok ? '이 기기에서 음성 읽기를 쓸 수 있습니다.' : '이 브라우저는 음성 읽기를 지원하지 않습니다.'}</span></p>
    <h3>오디오 입력 (2단계)</h3>
    <p class="small">오디오 인터페이스가 연결되면 오른쪽 위에 초록 표시가 켜지고, 실습 페이지에서 베이스를 루프 위에 연주하거나 단음을 인식해 악보로 기록할 수 있게 됩니다. 2단계에서 활성화됩니다.</p>
    <h3>코코 (3단계)</h3>
    <label class="row"><span>Anthropic API 키</span><input type="password" id="key" value="${s.apiKey || ''}" placeholder="sk-ant-..."></label>
    <label class="row"><span>말투</span><select id="tone"><option value="casual" ${s.cocoTone !== 'polite' ? 'selected' : ''}>친근한 반말</option><option value="polite" ${s.cocoTone === 'polite' ? 'selected' : ''}>부드러운 존댓말</option></select></label>
    <label class="row"><span>성격</span><input type="text" id="persona" value="${(s.cocoPersona || '20년차 밴드 프로듀서. 칭찬보다 구체적인 지적을 먼저').replace(/"/g, '&quot;')}"></label>
    <label class="row"><span>답을 음성으로</span><select id="cocotts"><option value="1" ${s.cocoTts !== false ? 'selected' : ''}>켬</option><option value="0" ${s.cocoTts === false ? 'selected' : ''}>끔</option></select></label>
    <p class="small">키는 이 기기의 브라우저에만 저장되고 Anthropic 서버로만 전송됩니다. 코코는 3단계에서 켜집니다.</p>
    <p><button class="btn" id="save">저장</button></p>
  </section></article>`;
  $('#fs').oninput = e => { $('#fsv').textContent = Math.round(e.target.value * 100) + '%'; document.documentElement.style.setProperty('--font-scale', e.target.value); };
  $('#theme').onchange = e => { document.documentElement.dataset.theme = e.target.value; };
  $('#rate').oninput = e => { $('#ratev').textContent = (+e.target.value).toFixed(2) + 'x'; };
  $('#ttstest').onclick = () => TTS.speak('안녕, 나는 코코야. 이 앱에서 작곡을 같이 배워 볼 거야.', { rate: +$('#rate').value, voice: $('#voice').value || null });
  $('#test').onclick = () => { Engine.resume(); const t = Engine.now() + 0.05; [60, 64, 67, 72].forEach((m, i) => Engine.note($('#inst').value, m, t + i * 0.18, 0.5)); Engine.drum('kick', t + 0.8); Engine.drum('snare', t + 1.0); };
  $('#save').onclick = () => { Store.saveSettings({ theme: $('#theme').value, fontScale: +$('#fs').value, instrument: $('#inst').value, kit: $('#kit').value, apiKey: $('#key').value.trim(), ttsVoice: $('#voice').value, ttsRate: +$('#rate').value, cocoTone: $('#tone').value, cocoPersona: $('#persona').value.trim(), cocoTts: $('#cocotts').value === '1' }); Engine.setKit($('#kit').value); applySettings(); alert('저장했습니다.'); };
}
function loadPlaceholder(title, stage, desc) {
  view().innerHTML = `<article class="chapter-view"><div class="ch-open"><div class="no">${stage}</div><h1>${title}</h1><div class="en">${desc}</div></div><p class="small">이 화면은 다음 제작 단계에서 채워집니다.</p></article>`;
}

/* ---------- 라우터 ---------- */
async function route() {
  stopAllPlayers(); TTS.stop();
  const vv = view(); vv.classList.remove('enter'); void vv.offsetWidth; vv.classList.add('enter');
  if (currentLab) { currentLab.destroy(); currentLab = null; }
  const h = location.hash || '#/guide';
  const [, kind, a, b] = h.split('/');
  $('#drawer-check').checked = false;
  setActiveNav(h);
  if (kind === 'ch') await loadChapter(+a, b);
  else if (kind === 'lab' && a === 'groove') { view().innerHTML = ''; currentLab = mountGrooveLab(view(), b); window.scrollTo(0, 0); }
  else if (kind === 'lab' && a === 'melody') { view().innerHTML = ''; currentLab = mountMelodyLab(view(), b); window.scrollTo(0, 0); }
  else if (kind === 'lab' && a === 'chords') { view().innerHTML = ''; currentLab = mountChordLab(view(), b); window.scrollTo(0, 0); }
  else if (kind === 'lab' && a === 'song') loadPlaceholder('곡 만들기', 'LAB · STAGE 2', '코드·드럼·멜로디·베이스를 한 화면에서 만들고 저장합니다.');
  else if (kind === 'quest') loadQuest();
  else if (kind === 'coco') loadPlaceholder('코코에게 묻기', 'STAGE 3', '교재와 내 작업물을 아는 베테랑 프로듀서 코코와 실시간으로 이야기합니다.');
  else if (kind === 'settings') loadSettings();
  else await loadGuide();
}

/* ---------- 오디오 입력 표시 (2단계에서 활성) ---------- */
async function checkAudioInput() {
  const dot = $('#audio-dot'); if (!navigator.mediaDevices?.enumerateDevices) return;
  try { const devs = await navigator.mediaDevices.enumerateDevices(); const ins = devs.filter(d => d.kind === 'audioinput'); dot.classList.toggle('on', ins.length > 0 && ins.some(d => d.label)); dot.title = ins.length ? `오디오 입력 ${ins.length}개 (2단계에서 사용)` : '오디오 입력 없음'; } catch (e) { }
}

/* ---------- 시작 ---------- */
applySettings(); renderNav();
window.addEventListener('hashchange', route);
route(); checkAudioInput();
document.addEventListener('click', () => Engine.resume(), { once: true, capture: true });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });

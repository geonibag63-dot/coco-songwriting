/* 기기 저장소 (localStorage) — 진도, 답안, 설정, 작업물 */
const NS = 'coco.';
function read(key, def) { try { const v = localStorage.getItem(NS + key); return v == null ? def : JSON.parse(v); } catch (e) { return def; } }
function write(key, val) { try { localStorage.setItem(NS + key, JSON.stringify(val)); } catch (e) { /* 저장 불가 환경 */ } }

export const Store = {
  get: read, set: write,
  settings() { return read('settings', { theme: 'dark', fontScale: 1, apiKey: '', cocoModel: 'claude-sonnet-4-5', instrument: 'piano', kit: 'studio' }); },
  saveSettings(patch) { const s = { ...this.settings(), ...patch }; write('settings', s); return s; },
  progress() { return read('progress', { read: {}, quiz: {}, prob: {} }); },
  markRead(ch, sec) { const p = this.progress(); p.read[ch] = p.read[ch] || {}; if (!p.read[ch][sec]) { p.read[ch][sec] = Date.now(); write('progress', p); } },
  markQuiz(ch, qid, marks) { const p = this.progress(); p.quiz[ch] = p.quiz[ch] || {}; p.quiz[ch][qid] = marks; write('progress', p); },
  answers(ch) { return read('answers.' + ch, {}); },
  saveAnswer(ch, key, val) { const a = this.answers(ch); a[key] = val; write('answers.' + ch, a); const p = this.progress(); p.prob[ch] = p.prob[ch] || {}; p.prob[ch][key.split(':')[0]] = !!val; write('progress', p); },
  works() { return read('works', []); },
  saveWork(w) { const ws = this.works(); const i = ws.findIndex(x => x.id === w.id); w.updated = Date.now(); if (i >= 0) ws[i] = w; else ws.unshift(w); write('works', ws); return w; },
  deleteWork(id) { write('works', this.works().filter(w => w.id !== id)); },
  chat(ch) { return read('chat.' + ch, []); },
  saveChat(ch, msgs) { write('chat.' + ch, msgs.slice(-60)); },
  exportAll() { const out = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(NS)) out[k] = localStorage.getItem(k); } return out; },
  importAll(obj) { Object.entries(obj).forEach(([k, v]) => { if (k.startsWith(NS)) localStorage.setItem(k, v); }); },
};

/* 읽어주기 — 브라우저 내장 음성(Web Speech API) */
export const TTS = (() => {
  const ok = 'speechSynthesis' in window;
  let current = null, onEnd = null;
  function voices() { return ok ? speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('ko')) : []; }
  function pick(name) { const vs = voices(); return vs.find(v => v.name === name) || vs[0] || null; }
  function clean(text) { return text.replace(/\s+/g, ' ').replace(/[▶■✔☐]/g, '').replace(/\((?:[A-Za-z][^)]*)\)/g, m => m.length < 40 ? m : '').trim(); }
  function speak(text, { rate = 1.0, voice = null, onend = null } = {}) {
    if (!ok) return false;
    stop();
    const u = new SpeechSynthesisUtterance(clean(text));
    u.lang = 'ko-KR'; u.rate = rate; const v = pick(voice); if (v) u.voice = v;
    u.onend = () => { current = null; onend && onend(); }; u.onerror = u.onend;
    current = u; speechSynthesis.speak(u); return true;
  }
  function stop() { if (ok && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel(); if (current) { const c = current; current = null; c.onend && c.onend(); } }
  function speaking() { return ok && speechSynthesis.speaking; }
  if (ok) speechSynthesis.onvoiceschanged = () => {};
  return { ok, speak, stop, speaking, voices };
})();

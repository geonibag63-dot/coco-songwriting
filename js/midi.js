/* 표준 MIDI 파일(SMF Type 1) 만들기 — Cakewalk로 가져가기 위한 내보내기 */

function vlq(n) { const b = [n & 0x7f]; n >>= 7; while (n > 0) { b.unshift((n & 0x7f) | 0x80); n >>= 7; } return b; }
function str(s) { return [...s].map(c => c.charCodeAt(0) & 0x7f); }
function chunk(id, data) {
  const len = data.length;
  return [...str(id), (len >> 24) & 255, (len >> 16) & 255, (len >> 8) & 255, len & 255, ...data];
}

const PPQ = 480;                      // 4분음표 한 개 = 480틱
const TICK = PPQ / 4;                 // 16분음표 한 칸

/* events: [{step, len, midi, vel, ch}] — step/len은 16분음표 칸 단위 */
function track(name, events, { program = null, ch = 0, tempo = null, timeSig = null } = {}) {
  const raw = [];
  raw.push({ t: 0, d: [0xff, 0x03, ...vlq(str(name).length).slice(-1), ...str(name)] });
  if (tempo) { const us = Math.round(60000000 / tempo); raw.push({ t: 0, d: [0xff, 0x51, 0x03, (us >> 16) & 255, (us >> 8) & 255, us & 255] }); }
  if (timeSig) raw.push({ t: 0, d: [0xff, 0x58, 0x04, timeSig[0], Math.log2(timeSig[1]), 24, 8] });
  if (program != null) raw.push({ t: 0, d: [0xc0 | ch, program & 127] });
  events.forEach(e => {
    const on = Math.round(e.step * TICK), off = on + Math.max(1, Math.round(e.len * TICK)) - 2;
    raw.push({ t: on, d: [0x90 | (e.ch ?? ch), e.midi & 127, Math.round((e.vel ?? 0.85) * 110) & 127], p: 1 });
    raw.push({ t: off, d: [0x80 | (e.ch ?? ch), e.midi & 127, 0], p: 0 });
  });
  raw.sort((a, b) => a.t - b.t || (a.p ?? 0) - (b.p ?? 0));
  const out = []; let last = 0;
  raw.forEach(ev => { out.push(...vlq(ev.t - last), ...ev.d); last = ev.t; });
  out.push(...vlq(0), 0xff, 0x2f, 0x00);
  return chunk('MTrk', out);
}

/* tracks: [{name, events, program, ch}] */
export function buildMidi(tracks, { bpm = 96, timeSig = [4, 4] } = {}) {
  const n = tracks.length + 1;
  const head = chunk('MThd', [0, 1, (n >> 8) & 255, n & 255, (PPQ >> 8) & 255, PPQ & 255]);
  const conductor = track('Tempo', [], { tempo: bpm, timeSig });
  const body = tracks.map(t => track(t.name, t.events, { program: t.program, ch: t.ch ?? 0 }));
  return new Uint8Array([...head, ...conductor, ...body.flat()]);
}

export function downloadMidi(bytes, filename) {
  const blob = new Blob([bytes], { type: 'audio/midi' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename.endsWith('.mid') ? filename : filename + '.mid';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* 자주 쓰는 악기 프로그램 번호(General MIDI) */
export const GM = { piano: 0, epiano: 4, pad: 89, guitar: 27, bass: 33, lead: 80, strings: 48 };
/* GM 드럼(10번 채널) 노트 번호 */
export const GM_DRUM = { kick: 36, snare: 38, hat: 42, hatOpen: 46, ride: 51, crash: 49 };

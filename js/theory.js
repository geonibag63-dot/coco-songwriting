/* 화성 계산 — 교재 2~3장의 규칙을 코드로 (다이어토닉, 디그리, 이조, 차용화음, 세컨더리 도미넌트) */

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NAT = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const MAJ_STEPS = [2, 2, 1, 2, 2, 2, 1];
const NMIN_STEPS = [2, 1, 2, 2, 1, 2, 2];

export function pc(name) {
  let v = NAT[name[0].toUpperCase()];
  for (const a of name.slice(1)) v += a === '#' ? 1 : a === 'b' || a === '♭' ? -1 : 0;
  return ((v % 12) + 12) % 12;
}
export function spell(letter, target) {
  let d = (target - NAT[letter] + 12) % 12;
  if (d > 6) d -= 12;
  return letter + (d > 0 ? '#'.repeat(d) : 'b'.repeat(-d));
}
export function scale(tonic, minor = false) {
  const steps = minor ? NMIN_STEPS : MAJ_STEPS;
  let li = LETTERS.indexOf(tonic[0].toUpperCase()), p = pc(tonic);
  const out = [tonic];
  for (let i = 0; i < 6; i++) { li = (li + 1) % 7; p = (p + steps[i]) % 12; out.push(spell(LETTERS[li], p)); }
  return out;
}
const QUAL_BY_IV = { '4,7': '', '3,7': 'm', '3,6': 'dim', '4,8': 'aug' };
export function diatonic(tonic, minor = false) {
  const sc = scale(tonic, minor);
  return sc.map((r, i) => {
    const t = sc[(i + 2) % 7], f = sc[(i + 4) % 7];
    const a = (pc(t) - pc(r) + 12) % 12, b = (pc(f) - pc(r) + 12) % 12;
    const q = QUAL_BY_IV[`${a},${b}`] ?? '';
    return r + q;
  });
}
export const MAJ_DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
export const MIN_DEGREES = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
export const FUNCTIONS = { I: 'T', ii: 'S', iii: 'T', IV: 'S', V: 'D', vi: 'T', 'vii°': 'D', i: 'T', 'ii°': 'S', III: 'T', iv: 'S', v: 'D', VI: 'T', VII: 'S' };

/* 같은으뜸음조에서 빌려오는 코드 (3.5) */
export function borrowed(tonic, minor = false) {
  const other = diatonic(tonic, !minor);
  const labels = minor ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] : ['i', 'ii°', '♭III', 'iv', 'v', '♭VI', '♭VII'];
  const pick = minor ? [3, 4, 0] : [3, 6, 5, 0];     // 장조: iv ♭VII ♭VI i / 단조: IV V I
  return pick.map(i => ({ name: other[i], degree: labels[i], note: minor ? '장조에서' : '단조에서' }));
}
/* 세컨더리 도미넌트 (3.6) */
export function secondary(tonic, minor = false) {
  const sc = scale(tonic, minor), dia = diatonic(tonic, minor);
  const targets = minor ? [3, 4, 5, 6] : [1, 2, 3, 4, 5];
  const degs = minor ? MIN_DEGREES : MAJ_DEGREES;
  return targets.map(i => {
    const t = sc[i];
    const root = spell(LETTERS[(LETTERS.indexOf(t[0].toUpperCase()) + 4) % 7], (pc(t) + 7) % 12);
    return { name: root + '7', degree: `V/${degs[i].replace('°', '')}`, target: dia[i] };
  });
}
/* 코드 이름 → 그 키에서의 디그리(없으면 null) */
export function degreeOf(chordName, tonic, minor = false) {
  const dia = diatonic(tonic, minor), degs = minor ? MIN_DEGREES : MAJ_DEGREES;
  const i = dia.findIndex(c => c === chordName);
  if (i >= 0) return degs[i];
  const b = borrowed(tonic, minor).find(x => x.name === chordName);
  if (b) return b.degree;
  const s = secondary(tonic, minor).find(x => x.name === chordName);
  if (s) return s.degree;
  return null;
}
/* 디그리 → 새 키의 코드 이름 (이조) */
export function chordForDegree(degree, tonic, minor = false) {
  const degs = minor ? MIN_DEGREES : MAJ_DEGREES;
  const i = degs.indexOf(degree);
  if (i >= 0) return diatonic(tonic, minor)[i];
  const b = borrowed(tonic, minor).find(x => x.degree === degree);
  if (b) return b.name;
  const s = secondary(tonic, minor).find(x => x.degree === degree);
  if (s) return s.name;
  return null;
}
/* 진행을 다른 키로 옮기기: 디그리를 거쳐 변환, 모르는 코드는 반음 이동 */
export function transposeProgression(chords, fromKey, toKey, minor = false) {
  const shift = (pc(toKey) - pc(fromKey) + 12) % 12;
  return chords.map(c => {
    if (!c) return c;
    const d = degreeOf(c, fromKey, minor);
    if (d) { const n = chordForDegree(d, toKey, minor); if (n) return n; }
    const m = /^([A-G][#b]?)(.*)$/.exec(c);
    if (!m) return c;
    const target = (pc(m[1]) + shift) % 12;
    const sc = scale(toKey, minor);
    const found = sc.find(n => pc(n) === target);
    return (found || ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][target]) + m[2];
  });
}
export const KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

/* 교재 3.2 진행 사전 — 디그리로 저장해 어느 키에서나 쓸 수 있게 */
export const PRESETS = [
  { id: 'p1', name: 'I–V–vi–IV', tag: '밝고 안전 · 코러스', degrees: ['I', 'V', 'vi', 'IV'] },
  { id: 'p2', name: 'vi–IV–I–V', tag: '어두운 출발 · 벌스', degrees: ['vi', 'IV', 'I', 'V'] },
  { id: 'p3', name: 'I–vi–IV–V', tag: '복고풍 (50년대)', degrees: ['I', 'vi', 'IV', 'V'] },
  { id: 'p4', name: 'IV–V–iii–vi', tag: '왕도 진행 4536', degrees: ['IV', 'V', 'iii', 'vi'] },
  { id: 'p5', name: 'ii–V–I', tag: '단단한 해결', degrees: ['ii', 'V', 'I', 'I'] },
  { id: 'p6', name: '캐논 8코드', tag: '하행 베이스 · 머니코드', degrees: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'ii', 'V'] },
  { id: 'p7', name: '12마디 블루스', tag: '록의 뿌리', degrees: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I'] },
];

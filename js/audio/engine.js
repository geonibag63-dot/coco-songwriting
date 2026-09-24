/* 코코와 작곡하기 — 오디오 엔진
 * 합성 악기 프리셋 + 드럼 + 16분음표 스케줄러. 외부 파일 없이 브라우저에서 소리를 만든다.
 */
export const Engine = (() => {
  let ac = null, master = null, NOISE = null;
  const state = { volume: 0.9 };

  function ctx() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = state.volume;
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -12; comp.ratio.value = 4;
      master.connect(comp); comp.connect(ac.destination);
    }
    return ac;
  }
  function resume() { ctx(); if (ac.state !== 'running') ac.resume(); }
  function now() { return ctx().currentTime; }
  function setVolume(v) { state.volume = v; if (master) master.gain.value = v; }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function noise() {
    if (NOISE) return NOISE;
    const b = ctx().createBuffer(1, ctx().sampleRate * 0.5, ctx().sampleRate);
    const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return NOISE = b;
  }
  function env(t, peak, a, d, s, r, dur) {
    const g = ctx().createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(peak * s, 0.0002), t + a + d);
    g.gain.setValueAtTime(Math.max(peak * s, 0.0002), Math.max(t + a + d, t + dur));
    g.gain.exponentialRampToValueAtTime(0.0001, Math.max(t + a + d, t + dur) + r);
    g.connect(master);
    return g;
  }

  /* ---------- 악기 프리셋 ---------- */
  const INSTRUMENTS = {
    piano:  { label: '피아노',     make: pianoVoice },
    epiano: { label: '일렉 피아노', make: epianoVoice },
    pad:    { label: '패드',       make: padVoice },
    guitar: { label: '기타(클린)', make: guitarVoice },
    bass:   { label: '베이스',     make: bassVoice },
    lead:   { label: '리드(보컬 대용)', make: leadVoice },
  };
  function osc(type, f, t, det = 0) { const o = ctx().createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = det; return o; }
  function stopAll(os, t) { os.forEach(o => { o.start(t); o.stop(t + 6); }); }
  function pianoVoice(m, t, dur, v) {
    const f = hz(m), g = env(t, 0.32 * v, 0.006, 0.35, 0.35, 0.25, dur);
    const o1 = osc('triangle', f, t), o2 = osc('sine', f * 2, t), o3 = osc('sine', f * 3, t);
    const g2 = ctx().createGain(); g2.gain.value = 0.35; const g3 = ctx().createGain(); g3.gain.value = 0.12;
    const lp = ctx().createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3600, t); lp.frequency.exponentialRampToValueAtTime(1200, t + 0.5);
    o1.connect(lp); o2.connect(g2); g2.connect(lp); o3.connect(g3); g3.connect(lp); lp.connect(g);
    stopAll([o1, o2, o3], t);
  }
  function epianoVoice(m, t, dur, v) {
    const f = hz(m), g = env(t, 0.3 * v, 0.004, 0.5, 0.3, 0.3, dur);
    const car = osc('sine', f, t), mod = osc('sine', f * 14, t);
    const mg = ctx().createGain(); mg.gain.setValueAtTime(f * 1.2, t); mg.gain.exponentialRampToValueAtTime(f * 0.15, t + 0.4);
    mod.connect(mg); mg.connect(car.frequency); car.connect(g);
    stopAll([car, mod], t);
  }
  function padVoice(m, t, dur, v) {
    const f = hz(m), g = env(t, 0.13 * v, 0.25, 0.4, 0.8, 0.6, dur);
    const o1 = osc('sawtooth', f, t, -6), o2 = osc('sawtooth', f, t, 6), o3 = osc('triangle', f / 2, t);
    const lp = ctx().createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.linearRampToValueAtTime(1800, t + 0.6);
    o1.connect(lp); o2.connect(lp); o3.connect(lp); lp.connect(g);
    stopAll([o1, o2, o3], t);
  }
  function guitarVoice(m, t, dur, v) {
    const f = hz(m), g = env(t, 0.3 * v, 0.003, 0.6, 0.15, 0.2, Math.min(dur, 1.2));
    const o1 = osc('sawtooth', f, t), o2 = osc('square', f * 2, t);
    const g2 = ctx().createGain(); g2.gain.value = 0.08;
    const lp = ctx().createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.7);
    o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g);
    stopAll([o1, o2], t);
  }
  function bassVoice(m, t, dur, v) {
    const f = hz(m), g = env(t, 0.42 * v, 0.004, 0.25, 0.6, 0.12, dur);
    const o1 = osc('sawtooth', f, t), o2 = osc('sine', f, t);
    const lp = ctx().createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(520, t); lp.frequency.exponentialRampToValueAtTime(260, t + 0.3);
    o1.connect(lp); o2.connect(lp); lp.connect(g);
    stopAll([o1, o2], t);
  }
  function leadVoice(m, t, dur, v) {
    const f = hz(m), g = env(t, 0.28 * v, 0.02, 0.2, 0.7, 0.18, dur);
    const o1 = osc('triangle', f, t), o2 = osc('sine', f * 2, t);
    const g2 = ctx().createGain(); g2.gain.value = 0.25;
    const vib = osc('sine', 5.5, t); const vg = ctx().createGain(); vg.gain.value = 3; vib.connect(vg); vg.connect(o1.detune);
    o1.connect(g); o2.connect(g2); g2.connect(g);
    stopAll([o1, o2, vib], t);
  }
  function note(inst, midi, t, dur = 0.5, vel = 1) {
    (INSTRUMENTS[inst] || INSTRUMENTS.piano).make(midi, t, dur, vel);
  }
  function chord(inst, midis, t, dur, vel = 0.8) { midis.forEach(m => note(inst, m, t, dur, vel)); }

  /* ---------- 드럼 ---------- */
  const KITS = {
    studio: { label: '스튜디오', kickF: 150, kickEnd: 48, snareF: 1900, hatF: 8200 },
    tight:  { label: '타이트',   kickF: 120, kickEnd: 55, snareF: 2400, hatF: 9500 },
    room:   { label: '룸(넓게)', kickF: 170, kickEnd: 42, snareF: 1500, hatF: 7000 },
  };
  let kit = KITS.studio;
  function setKit(name) { kit = KITS[name] || KITS.studio; }
  function drum(name, t, v = 1) {
    const c = ctx();
    if (name === 'kick') {
      const g = env(t, 0.85 * v, 0.004, 0.3, 0.001, 0.05, 0.3);
      const o = osc('sine', kit.kickF, t); o.frequency.exponentialRampToValueAtTime(kit.kickEnd, t + 0.11); o.connect(g); o.start(t); o.stop(t + 0.5);
    } else if (name === 'snare') {
      const n = c.createBufferSource(); n.buffer = noise(); const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = kit.snareF; f.Q.value = 0.8;
      const g = env(t, 0.5 * v, 0.002, 0.16, 0.001, 0.05, 0.16); n.connect(f); f.connect(g); n.start(t); n.stop(t + 0.25);
      const o = osc('triangle', 190, t); const g2 = env(t, 0.22 * v, 0.002, 0.1, 0.001, 0.03, 0.1); o.connect(g2); o.start(t); o.stop(t + 0.15);
    } else if (name === 'hat' || name === 'hatOpen') {
      const n = c.createBufferSource(); n.buffer = noise(); const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = kit.hatF;
      const d = name === 'hat' ? 0.04 : 0.28; const g = env(t, 0.17 * v, 0.001, d, 0.001, 0.02, d); n.connect(f); f.connect(g); n.start(t); n.stop(t + d + 0.1);
    } else if (name === 'ride') {
      const n = c.createBufferSource(); n.buffer = noise(); const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 6000; f.Q.value = 2;
      const g = env(t, 0.14 * v, 0.001, 0.5, 0.01, 0.1, 0.4); n.connect(f); f.connect(g); n.start(t); n.stop(t + 0.7);
    } else if (name === 'crash') {
      const n = c.createBufferSource(); n.buffer = noise(); const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 4000;
      const g = env(t, 0.28 * v, 0.002, 1.2, 0.01, 0.2, 1.0); n.connect(f); f.connect(g); n.start(t); n.stop(t + 1.6);
    } else if (name === 'click') {
      const o = osc('square', v > 0.9 ? 1600 : 1100, t); const g = env(t, 0.07, 0.001, 0.03, 0.001, 0.01, 0.02); o.connect(g); o.start(t); o.stop(t + 0.05);
    }
  }

  /* ---------- 스케줄러 (16분음표 단위) ---------- */
  class Sequencer {
    constructor({ bpm = 96, steps = 16, onStep = null, onPaint = null, loop = true } = {}) {
      Object.assign(this, { bpm, steps, onStep, onPaint, loop, playing: false, step: 0, nextT: 0, timer: null, swing: 0 });
    }
    stepDur() { return 60 / this.bpm / 4; }
    swingOffset(i) { return (this.swing && i % 4 === 2) ? this.stepDur() * (this.swing / 100) * 0.9 : 0; }
    start(fromStep = 0) {
      resume(); noise();
      this.playing = true; this.step = fromStep; this.nextT = now() + 0.08;
      this.timer = setInterval(() => this.tick(), 25);
    }
    stop() { this.playing = false; clearInterval(this.timer); this.timer = null; if (this.onPaint) this.onPaint(-1); }
    tick() {
      while (this.nextT < now() + 0.12) {
        const i = this.step, t = this.nextT + this.swingOffset(i);
        if (this.onStep) this.onStep(i, t, this.stepDur());
        if (this.onPaint) { const delay = Math.max(0, (t - now()) * 1000); setTimeout(() => { if (this.playing) this.onPaint(i); }, delay); }
        this.nextT += this.stepDur();
        this.step += 1;
        if (this.step >= this.steps) { if (this.loop) this.step = 0; else { this.stopAt(this.nextT); break; } }
      }
    }
    stopAt(t) { const d = Math.max(0, (t - now()) * 1000); clearInterval(this.timer); setTimeout(() => this.stop(), d + 60); }
  }

  return { ctx, resume, now, hz, note, chord, drum, setKit, KITS, INSTRUMENTS, Sequencer, setVolume, state };
})();

/* 코드 이름 → MIDI 구성음 (4옥타브 근처 보이싱) */
export const CHORDS = (() => {
  const PC = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  const QUAL = {
    '': [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], '5': [0, 7],
    maj7: [0, 4, 7, 11], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], '7': [0, 4, 7, 10], m7b5: [0, 3, 6, 10], 'ø7': [0, 3, 6, 10], dim7: [0, 3, 6, 9],
    sus2: [0, 2, 7], sus4: [0, 5, 7], add9: [0, 4, 7, 14], m9: [0, 3, 7, 10, 14], '9': [0, 4, 7, 10, 14], '6': [0, 4, 7, 9], m6: [0, 3, 7, 9],
  };
  function parse(name) {
    const m = /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/.exec(name.replace('♭', 'b').replace('♯', '#').trim());
    if (!m) return null;
    const root = PC[m[1]], q = m[2].replace('°', 'dim').replace('Δ', 'maj7');
    const iv = QUAL[q] ?? QUAL[''];
    return { root, iv, bass: m[3] ? PC[m[3]] : root, name };
  }
  function voicing(name, base = 60) {
    const p = parse(name); if (!p) return [];
    const r = base + ((p.root - base % 12) + 12) % 12;
    const notes = p.iv.map(i => r + i);
    while (notes[0] > base + 7) notes.forEach((_, k) => notes[k] -= 12);
    return notes;
  }
  function bassNote(name, base = 40) {
    const p = parse(name); if (!p) return null;
    return base + ((p.bass - base % 12) + 12) % 12;
  }
  function tones(name) { const p = parse(name); return p ? p.iv.map(i => (p.root + i) % 12) : []; }
  return { parse, voicing, bassNote, tones, PC };
})();

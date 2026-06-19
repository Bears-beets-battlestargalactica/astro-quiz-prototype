import type { CharacterId } from "../types/game";

export type SoundName = "select" | "correct" | "wrong" | "round" | "launch" | "win" | "lose";
export type MusicTrack =
  | "intro"
  | "select"
  | "round"
  | "battle"
  | "win"
  | "lose"
  | "closing"
  | `character:${CharacterId}`;

let audioContext: AudioContext | null = null;
let musicTimer: number | null = null;
let currentMusicTrack: MusicTrack | null = null;
let currentMusicStep = 0;
let musicEnabled = true;

const getAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

const resumeContext = () => {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
};

const tone = (
  frequency: number,
  start: number,
  duration: number,
  volume = 0.08,
  oscillatorType: OscillatorType = "square",
  destination?: AudioNode
) => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = oscillatorType;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(destination ?? ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
};

const chord = (frequencies: number[], start: number, duration: number, volume = 0.035, type: OscillatorType = "triangle") => {
  frequencies.forEach((frequency) => tone(frequency, start, duration, volume / frequencies.length, type));
};

const noise = (start: number, duration: number, volume = 0.08) => {
  const ctx = getAudioContext();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(start);
};

const musicPatterns: Record<string, number[]> = {
  intro: [262, 330, 392, 330, 262, 0, 392, 440, 392, 330, 294, 0],
  select: [330, 0, 392, 0, 494, 0, 392, 0, 440, 0, 523, 0],
  round: [220, 262, 330, 392, 330, 262, 220, 0],
  battle: [196, 247, 294, 247, 196, 247, 330, 247],
  win: [523, 659, 784, 1047, 784, 1047, 1319, 0],
  lose: [330, 294, 262, 220, 196, 175, 147, 0],
  closing: [392, 330, 294, 262, 0, 262, 330, 392],
  "character:ed": [196, 247, 294, 247, 196, 165, 196, 0],
  "character:edd": [330, 392, 494, 392, 330, 392, 523, 0],
  "character:eddy": [247, 330, 370, 330, 247, 330, 415, 0],
  "character:courage": [294, 0, 247, 0, 220, 247, 294, 0],
  "character:grim": [147, 175, 196, 175, 147, 131, 147, 0],
  "character:dexter": [392, 494, 587, 659, 587, 494, 392, 0],
  "character:johnny-bravo": [220, 277, 330, 415, 330, 277, 220, 0],
  "character:blossom": [523, 659, 784, 659, 523, 587, 659, 0],
  "character:bubbles": [659, 784, 880, 784, 659, 784, 988, 0],
  "character:buttercup": [196, 262, 330, 262, 196, 247, 294, 0],
};

const playMusicStep = () => {
  if (!musicEnabled || !currentMusicTrack) return;

  try {
    const ctx = resumeContext();
    const key = currentMusicTrack;
    const pattern = musicPatterns[key] ?? musicPatterns.battle;
    const note = pattern[currentMusicStep % pattern.length];
    const now = ctx.currentTime;

    if (note > 0) {
      const isResult = key === "win" || key === "lose" || key === "closing";
      const type: OscillatorType = key === "lose" || key === "character:grim" ? "sawtooth" : "triangle";
      tone(note, now, isResult ? 0.32 : 0.22, isResult ? 0.035 : 0.025, type);

      if (currentMusicStep % 4 === 0) {
        const bassNote = Math.max(note / 2, 80);
        tone(bassNote, now, 0.18, 0.018, "square");
      }
    }

    currentMusicStep += 1;
  } catch {
    // Browser may still be waiting for user interaction.
  }
};

export const stopMusic = () => {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  currentMusicTrack = null;
  currentMusicStep = 0;
};

export const setAudioEnabled = (enabled: boolean) => {
  musicEnabled = enabled;
  if (!enabled) {
    stopMusic();
  }
};

export const setMusicTrack = (track: MusicTrack, enabled: boolean) => {
  musicEnabled = enabled;
  if (!enabled) {
    stopMusic();
    return;
  }

  if (currentMusicTrack === track && musicTimer !== null) return;

  stopMusic();
  currentMusicTrack = track;
  currentMusicStep = 0;
  playMusicStep();
  musicTimer = window.setInterval(playMusicStep, track === "round" ? 230 : 310);
};

export const playCharacterJingle = (characterId: CharacterId, enabled: boolean) => {
  if (!enabled) return;

  try {
    const ctx = resumeContext();
    const now = ctx.currentTime;
    const pattern = musicPatterns[`character:${characterId}`] ?? musicPatterns.battle;
    const notes = pattern.filter((note) => note > 0).slice(0, 4);

    notes.forEach((note, index) => {
      tone(note, now + index * 0.09, 0.12, 0.055, "triangle");
    });
  } catch {
    // User interaction may be needed before audio can play.
  }
};

export const playClosingMusic = (enabled: boolean) => {
  setMusicTrack("closing", enabled);
};

export const playGameSound = (name: SoundName, enabled: boolean) => {
  if (!enabled) return;

  try {
    const ctx = resumeContext();
    const now = ctx.currentTime;

    switch (name) {
      case "select":
        tone(420, now, 0.08, 0.05);
        tone(640, now + 0.06, 0.08, 0.04);
        break;
      case "correct":
        tone(640, now, 0.09);
        tone(880, now + 0.08, 0.11);
        tone(1180, now + 0.18, 0.13, 0.07);
        break;
      case "wrong":
        tone(220, now, 0.18, 0.08, "sawtooth");
        tone(160, now + 0.16, 0.22, 0.07, "sawtooth");
        break;
      case "round":
        tone(330, now, 0.11);
        tone(500, now + 0.11, 0.11);
        tone(720, now + 0.22, 0.16);
        break;
      case "launch":
        noise(now, 0.65, 0.11);
        tone(120, now, 0.45, 0.08, "sawtooth");
        tone(90, now + 0.34, 0.4, 0.06, "sawtooth");
        break;
      case "win":
        chord([520, 660, 790], now, 0.18, 0.09);
        tone(1040, now + 0.28, 0.38, 0.07);
        break;
      case "lose":
        tone(300, now, 0.17, 0.07, "sawtooth");
        tone(230, now + 0.18, 0.17, 0.07, "sawtooth");
        tone(170, now + 0.36, 0.28, 0.06, "sawtooth");
        break;
      default:
        break;
    }
  } catch {
    // Some browsers block WebAudio until a user interaction. The next click usually enables it.
  }
};

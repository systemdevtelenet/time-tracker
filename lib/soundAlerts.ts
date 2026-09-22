// Audio Alarm & Sound Notification System
// Default sound: Welcome to the Jungle (classic)

export const DEFAULT_RINGTONE_ID = 'jungle';
export const RINGTONE_STORAGE_KEY = 'ctnp_alarm_ringtone';

export interface RingtoneOption {
  id: string;
  name: string;
  description?: string;
}

export const RINGTONE_OPTIONS: RingtoneOption[] = [
  { id: 'jungle', name: 'Welcome to the Jungle (classic)', description: '80s Rock guitar arpeggiation' },
  { id: 'phone', name: 'Classic Phone', description: 'Twin-bell rotary telephone' },
  { id: 'beep', name: 'Digital Beep', description: 'Wristwatch alarm beep pattern' },
  { id: 'chime', name: 'Soft Chime', description: 'Warm harmonic bell chime' },
  { id: 'retro', name: 'Retro Alarm', description: '8-bit arcade laser buzzer' },
  { id: 'gong', name: 'Zen Singing Bowl', description: 'Resonant meditation gong' },
  { id: 'dingdong', name: 'Elevator Ding-Dong', description: 'Two-tone chime announcement' },
  { id: 'sparkle', name: 'Ascending Sparkle', description: 'Crystal sparkle arpeggio' },
  { id: 'woodblock', name: 'Woodblock Knock', description: 'Organic woodblock double knock' },
  { id: 'synthpad', name: 'Warm Synth Wave', description: 'Polyphonic synth chord' },
];

export function getSelectedRingtone(): string {
  if (typeof window === 'undefined') return DEFAULT_RINGTONE_ID;
  try {
    const saved = localStorage.getItem(RINGTONE_STORAGE_KEY);
    if (saved && RINGTONE_OPTIONS.some((r) => r.id === saved)) {
      return saved;
    }
    // Default to 'jungle'
    localStorage.setItem(RINGTONE_STORAGE_KEY, DEFAULT_RINGTONE_ID);
    return DEFAULT_RINGTONE_ID;
  } catch (e) {
    return DEFAULT_RINGTONE_ID;
  }
}

export function setSelectedRingtone(ringtoneId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RINGTONE_STORAGE_KEY, ringtoneId);
    window.dispatchEvent(
      new CustomEvent('alarm-ringtone-changed', {
        detail: { ringtoneId },
      })
    );
  } catch (e) {
    console.warn('Could not persist alarm ringtone:', e);
  }
}

let activeAudioCtx: AudioContext | null = null;

export function playAlarmSound(ringtoneId?: string, onComplete?: () => void): void {
  if (typeof window === 'undefined') return;
  try {
    const targetId = ringtoneId || getSelectedRingtone();
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    if (!activeAudioCtx || activeAudioCtx.state === 'closed') {
      activeAudioCtx = new AudioCtx();
    } else if (activeAudioCtx.state === 'suspended') {
      activeAudioCtx.resume();
    }

    const ctx = activeAudioCtx;
    const now = ctx.currentTime;

    if (targetId === 'jungle') {
      // Welcome to the Jungle Classic 80s Rock Guitar riff (E minor pentatonic driving riff)
      const notes = [
        { freq: 164.81, dur: 0.12 }, // E3
        { freq: 196.00, dur: 0.12 }, // G3
        { freq: 220.00, dur: 0.12 }, // A3
        { freq: 246.94, dur: 0.14 }, // B3
        { freq: 293.66, dur: 0.14 }, // D4
        { freq: 246.94, dur: 0.12 }, // B3
        { freq: 220.00, dur: 0.12 }, // A3
        { freq: 196.00, dur: 0.14 }, // G3
        { freq: 164.81, dur: 0.25 }, // E3 root hit
      ];

      let elapsed = 0;
      notes.forEach(({ freq, dur }, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + elapsed);
        
        // Add distortion/drive emulation with quick envelope
        gain.gain.setValueAtTime(0.18, now + elapsed);
        gain.gain.exponentialRampToValueAtTime(0.001, now + elapsed + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + elapsed);
        osc.stop(now + elapsed + dur);
        elapsed += dur * 0.9;
      });

      setTimeout(() => onComplete?.(), (elapsed + 0.2) * 1000);
    } else if (targetId === 'phone') {
      // Classic twin-bell rotary telephone ring burst
      [0, 0.06, 0.12, 0.18, 0.32, 0.38, 0.44, 0.50].forEach((offset) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(750, now + offset);
        osc2.frequency.setValueAtTime(850, now + offset);
        gain.gain.setValueAtTime(0.14, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now + offset);
        osc2.start(now + offset);
        osc1.stop(now + offset + 0.05);
        osc2.stop(now + offset + 0.05);
      });
      setTimeout(() => onComplete?.(), 800);
    } else if (targetId === 'beep') {
      // Digital wristwatch alarm beep pattern
      [0, 0.12, 0.24, 0.36].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2048, now + offset);
        gain.gain.setValueAtTime(0.1, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
      setTimeout(() => onComplete?.(), 600);
    } else if (targetId === 'chime') {
      // Warm soft harmonic bell chime
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.2, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.7);
      });
      setTimeout(() => onComplete?.(), 1200);
    } else if (targetId === 'retro') {
      // Retro 8-bit arcade laser buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
      setTimeout(() => onComplete?.(), 500);
    } else if (targetId === 'gong') {
      // Deep resonant Zen singing bowl
      [180, 220, 330, 440].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const volume = idx === 0 ? 0.35 : 0.14;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.8);
      });
      setTimeout(() => onComplete?.(), 1800);
    } else if (targetId === 'dingdong') {
      // Two-tone elevator Ding-Dong
      const tones = [
        { freq: 783.99, time: 0, dur: 0.8 },
        { freq: 523.25, time: 0.35, dur: 0.9 },
      ];
      tones.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.24, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur);
      });
      setTimeout(() => onComplete?.(), 1300);
    } else if (targetId === 'sparkle') {
      // Ascending crystal sparkle
      [587.33, 739.99, 880, 1174.66, 1479.98].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.16, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
      setTimeout(() => onComplete?.(), 900);
    } else if (targetId === 'woodblock') {
      // Woodblock knock
      [0, 0.14].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const freq = idx === 0 ? 880 : 1046.5;
        osc.frequency.setValueAtTime(freq, now + offset);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + offset + 0.05);
        gain.gain.setValueAtTime(0.35, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });
      setTimeout(() => onComplete?.(), 300);
    } else if (targetId === 'synthpad') {
      // Polyphonic synth wave
      [261.63, 329.63, 392.00, 493.88].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
      setTimeout(() => onComplete?.(), 1200);
    }
  } catch (err) {
    console.error('Alarm audio playback exception:', err);
    onComplete?.();
  }
}

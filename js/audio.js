/**
 * Web Audio API синтезаторы - дыбыстық эффектілер
 * Ешқандай сыртқы аудио файлдарсыз, толық дербес жұмыс істейді
 */
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.printerOsc = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.15, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.2);
    });
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playSuccessFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      { t: 0.0, f: [523.25, 659.25, 783.99], d: 0.2 },
      { t: 0.25, f: [523.25, 659.25, 783.99], d: 0.2 },
      { t: 0.5, f: [659.25, 783.99, 1046.50], d: 0.6 }
    ];

    chords.forEach(chord => {
      chord.f.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + chord.t);

        gain.gain.setValueAtTime(0.12, now + chord.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chord.t + chord.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + chord.t);
        osc.stop(now + chord.t + chord.d);
      });
    });
  }

  // 3D Принтердің экструдер дыбысы
  startPrinterSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      if (this.printerOsc) this.stopPrinterSound();
      this.printerOsc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      this.printerOsc.type = 'triangle';
      this.printerOsc.frequency.setValueAtTime(180, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      this.printerOsc.connect(gain);
      gain.connect(this.ctx.destination);
      this.printerOsc.start();
    } catch(e) {}
  }

  stopPrinterSound() {
    if (this.printerOsc) {
      try {
        this.printerOsc.stop();
        this.printerOsc.disconnect();
      } catch(e) {}
      this.printerOsc = null;
    }
  }
}

window.sounds = new SoundEffects();

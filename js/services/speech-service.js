class SpeechService {
  constructor() {
    this.isPlaying = false;

    this.currentItem = null;

    this.audioCtx = null;
  }

  async play(items, getText, callbacks = {}) {
    if (this.isPlaying) return;

    this.isPlaying = true;

    try {
      for (const item of items) {
        this.currentItem = item;

        callbacks.onStart?.(item);

        await this.speak(getText(item));

        callbacks.onEnd?.(item);
      }
    } finally {
      this.currentItem = null;

      this.isPlaying = false;
    }
  }
 speak(text, options = {}) {

    if (this.isPlaying) {
        return Promise.resolve(false);
    }

    this.isPlaying = true;

    return new Promise((resolve) => {

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = options.lang ?? "pt-BR";
        utterance.rate = options.rate ?? 0.8;
        utterance.pitch = options.pitch ?? 1;
        utterance.volume = options.volume ?? 1;

        const finish = () => {
            this.isPlaying = false;
            resolve(true);
        };

        utterance.onend = finish;

        utterance.onerror = (e) => {

            this.isPlaying = false;

            if (e.error !== "interrupted") {
                console.error(e);
            }

            resolve(false);
        };

        speechSynthesis.speak(utterance);

    });

}

  async waitIdle() {
    while (speechSynthesis.speaking || speechSynthesis.pending) {
      await this.wait(50);
    }
  }

  stop() {
    speechSynthesis.cancel();

    this.currentItem = null;

    this.isPlaying = false;
  }

  playTone(seed, duration) {
    return new Promise((resolve) => {
      if (!this.audioCtx) {
        setTimeout(resolve, duration);

        return;
      }

      const osc = this.audioCtx.createOscillator();

      const gain = this.audioCtx.createGain();

      osc.type = "sine";

      osc.frequency.value = 320 + seed * 70;

      gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);

      gain.gain.exponentialRampToValueAtTime(
        0.08,
        this.audioCtx.currentTime + 0.02,
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        this.audioCtx.currentTime + duration / 1000,
      );

      osc.connect(gain);

      gain.connect(this.audioCtx.destination);

      osc.start();

      osc.stop(this.audioCtx.currentTime + duration / 1000);

      osc.onended = () => resolve();
    });
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async speakCard(card) {
        return this.speak(card.text);
  }
}

window.Speech = new SpeechService();

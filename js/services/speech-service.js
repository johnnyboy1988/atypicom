class SpeechService {

  constructor() {

    this.isPlaying = false;

    this.queueRunning = false;

    this.currentItem = null;

    this.queue = [];

    this.audioCtx = null;
  }


  async play(items, getText, callbacks = {}) {

    if (this.queueRunning) {
      return false;
    }

    this.queueRunning = true;

    try {

      for (const item of items) {

        this.currentItem = item;

        callbacks.onStart?.(item);

        await this.speak(getText(item));

        callbacks.onEnd?.(item);

      }

    } finally {

      this.currentItem = null;
      this.queueRunning = false;

    }

    return true;
  }


  speak(text, options = {}) {

    return new Promise((resolve) => {

      this.queue.push({
        text,
        options,
        resolve
      });

      this.processQueue();

    });

  }

  async processQueue() {

    if (this.isPlaying) {
      return;
    }

    while (this.queue.length) {

      const job = this.queue.shift();

      this.isPlaying = true;

      await this.execute(job);

      this.isPlaying = false;

      await this.waitIdle();

    }

  }

  execute(job) {

    return new Promise((resolve) => {

      const utterance = new SpeechSynthesisUtterance(job.text);

      utterance.lang = job.options.lang ?? "pt-BR";
      utterance.rate = job.options.rate ?? 0.8;
      utterance.pitch = job.options.pitch ?? 1;
      utterance.volume = job.options.volume ?? 1;

      utterance.onend = () => {

        job.resolve(true);

        resolve();

      };

      utterance.onerror = (e) => {

        if (e.error !== "interrupted") {
          console.error(e);
        }

        job.resolve(false);

        resolve();

      };

      speechSynthesis.speak(utterance);

    });

  }


  async waitIdle() {

    while (speechSynthesis.speaking || speechSynthesis.pending) {

      await this.wait(20);

    }

  }


  stop() {

    speechSynthesis.cancel();

    this.queue.length = 0;

    this.currentItem = null;

    this.isPlaying = false;

    this.queueRunning = false;

  }

  async speakCard(card) {

    return this.speak(card.text);

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

      gain.gain.setValueAtTime(
        0.0001,
        this.audioCtx.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.08,
        this.audioCtx.currentTime + 0.02
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        this.audioCtx.currentTime + duration / 1000
      );

      osc.connect(gain);

      gain.connect(this.audioCtx.destination);

      osc.start();

      osc.stop(
        this.audioCtx.currentTime + duration / 1000
      );

      osc.onended = () => resolve();

    });

  }

  wait(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

  }

}

window.Speech = new SpeechService();
class SpeechService {
  constructor() {
    this.isPlaying = false;
    this.queueRunning = false;
    this.currentItem = null;
    this.queue = [];
    this.audioCtx = null;
    this.voices = [];

    this.hasSpeech = !!(
      typeof speechSynthesis !== "undefined" &&
      typeof speechSynthesis.speak === "function" &&
      typeof SpeechSynthesisUtterance !== "undefined"
    );

    console.log(
      `🔊 Speech: ${this.hasSpeech ? "✅ Disponível" : "⚠️ Indisponível"}`,
    );

    this.setupVoices();
  }

  /**
   * Configura as vozes disponíveis
   */
  setupVoices() {
    if (!this.hasSpeech) return;

    const updateVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        this.voices = voices || [];
      } catch (error) {
        console.warn("⚠️ Erro ao obter vozes:", error);
        this.voices = [];
      }
    };

    updateVoices();

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
      } catch (error) {
        console.warn("⚠️ Erro ao adicionar listener voiceschanged:", error);
      }
    }
  }

  /**
   * Verifica se pode falar
   */
  canSpeak() {
    return (
      this.hasSpeech &&
      window.speechSynthesis &&
      typeof window.speechSynthesis.speak === "function"
    );
  }

  /**
   * Obtém uma voz adequada para o idioma
   */
  getVoiceForLang(lang = "pt-BR") {
    if (!this.voices || this.voices.length === 0) {
      return null;
    }

    let voice = this.voices.find((v) => v.lang === lang);

    if (!voice) {
      voice = this.voices.find(
        (v) => v.lang && v.lang.startsWith(lang.substring(0, 2)),
      );
    }

    if (!voice) {
      voice = this.voices[0];
    }

    return voice;
  }

  /**
   * Toca uma lista de itens
   */
  async play(items, getText, callbacks = {}) {
    if (!this.canSpeak()) {
      console.warn("⏭️ Play ignorado - suporte a voz indisponível");
      if (callbacks.onStart) {
        for (const item of items) {
          callbacks.onStart(item);
          await this.wait(50);
          callbacks.onEnd?.(item);
        }
      }
      return false;
    }

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

  /**
   * Fala um texto
   */
  speak(text, options = {}) {
    return new Promise((resolve) => {
      if (!this.canSpeak()) {
        console.warn("⏭️ Speak ignorado - suporte a voz indisponível");
        resolve(false);
        return;
      }

      if (!text || text.trim() === "") {
        resolve(true);
        return;
      }

      this.queue.push({
        text,
        options,
        resolve,
      });

      this.processQueue();
    });
  }

  /**
   * Processa a fila de fala
   */
  async processQueue() {
    if (this.isPlaying) {
      return;
    }

    while (this.queue.length) {
      const job = this.queue.shift();

      if (!this.canSpeak()) {
        job.resolve(false);
        continue;
      }

      this.isPlaying = true;
      await this.execute(job);
      this.isPlaying = false;
      await this.waitIdle();
    }
  }

  /**
   * Executa um job de fala
   */
  execute(job) {
    return new Promise((resolve) => {
      if (!this.canSpeak()) {
        job.resolve(false);
        resolve();
        return;
      }

      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(job.text);

      utterance.lang = job.options.lang ?? "pt-BR";
      utterance.rate = job.options.rate ?? 0.8;
      utterance.pitch = job.options.pitch ?? 1;
      utterance.volume = job.options.volume ?? 1;

      const voice = this.getVoiceForLang(utterance.lang);
      if (voice) {
        utterance.voice = voice;
      }

      let finished = false;

      const finish = (success) => {
        if (finished) return;
        finished = true;

        clearTimeout(timeoutId);

        utterance.onstart = null;
        utterance.onend = null;
        utterance.onerror = null;
        utterance.oncancel = null;

        job.resolve(success);
        resolve();
      };

      utterance.onstart = () => {
        console.log(`🔊 Iniciando fala: "${job.text.substring(0, 30)}..."`);
      };

      utterance.onend = () => {
        console.log(`✅ Fala concluída: "${job.text.substring(0, 30)}..."`);
        finish(true);
      };

      utterance.onerror = (event) => {
        if (event.error === "interrupted" || event.error === "canceled") {
          console.log(
            `🛑 Fala interrompida: "${job.text.substring(0, 30)}..."`,
          );
          finish(false);
        } else {
          console.error(`❌ Erro na fala:`, event.error);
          finish(false);
        }
      };

      utterance.oncancel = () => {
        console.log(`🛑 Fala cancelada: "${job.text.substring(0, 30)}..."`);
        finish(false);
      };

      try {
        if (synth.speaking || synth.pending) {
          synth.cancel();
        }

        if (synth.paused) {
          synth.resume();
        }
      } catch (error) {
        console.warn("⚠️ Erro ao limpar fala anterior:", error);
      }

      const timeoutId = setTimeout(() => {
        if (!finished) {
          console.warn(
            `⏱️ Timeout na fala (20s): "${job.text.substring(0, 30)}..."`,
          );
          try {
            synth.cancel();
          } catch (e) {}
          finish(false);
        }
      }, 20000);

      try {
        console.log(`🗣️ Falando: "${job.text.substring(0, 30)}..."`);
        synth.speak(utterance);
      } catch (error) {
        console.error("❌ Exception em speechSynthesis.speak():", error);
        finish(false);
      }
    });
  }

  /**
   * Aguarda o sistema de síntese ficar ocioso
   */
  async waitIdle() {
    if (!this.canSpeak()) {
      return;
    }

    const synth = window.speechSynthesis;
    let attempts = 0;

    while ((synth.speaking || synth.pending) && attempts < maxAttempts) {
      await this.wait(20);
      attempts++;
    }

    if (synth.speaking || synth.pending) {
      console.warn("⏱️ Timeout aguardando síntese, forçando cancelamento");
      try {
        synth.cancel();
      } catch (e) {}
    }
  }

  /**
   * Para a fala imediatamente
   */
  stop() {
    if (this.canSpeak()) {
      try {
        window.speechSynthesis.cancel();
        console.log("🛑 Síntese cancelada");
      } catch (e) {
        console.warn("⚠️ Erro ao cancelar fala:", e);
      }
    }

    this.queue.length = 0;
    this.currentItem = null;
    this.isPlaying = false;
    this.queueRunning = false;
  }

  /**
   * Fala um card específico
   */
  async speakCard(card) {
    if (!this.canSpeak()) {
      console.warn("⏭️ speakCard ignorado - suporte a voz indisponível");
      return false;
    }
    return this.speak(card?.text || "");
  }

  /**
   * Inicializa o contexto de áudio (apenas para playTone)
   */
  initAudioContext() {
    if (!this.audioCtx) {
      try {
        this.audioCtx = new (
          window.AudioContext || window.webkitAudioContext
        )();
        console.log("🎵 AudioContext criado");
      } catch (error) {
        console.warn("⚠️ Erro ao criar AudioContext:", error);
        this.audioCtx = null;
      }
    }
    return this.audioCtx;
  }

  /**
   * Toca um tom (feedback sonoro)
   */
  playTone(seed, duration) {
    return new Promise((resolve) => {
      this.initAudioContext();

      if (!this.audioCtx) {
        setTimeout(resolve, duration);
        return;
      }

      try {
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
      } catch (error) {
        console.warn("⚠️ Erro ao tocar tom:", error);
        resolve();
      }
    });
  }

  /**
   * Retorna o estado atual do SpeechSynthesis
   */
  getState() {
    if (!this.canSpeak()) {
      return { available: false };
    }

    const synth = window.speechSynthesis;
    return {
      available: true,
      speaking: synth.speaking,
      pending: synth.pending,
      paused: synth.paused,
      voices: this.voices.length,
      queueSize: this.queue.length,
      isPlaying: this.isPlaying,
      queueRunning: this.queueRunning,
    };
  }

  /**
   * Método utilitário para wait
   */
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const speechInstance = new SpeechService();

window.Speech = speechInstance;


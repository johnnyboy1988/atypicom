// app.js – Módulo Esperar
function esperarApp() {
  return {
    // Configuração
    minutes: 5,
    totalMinutes: 5,
    remainingMinutes: 5,
    remainingSeconds: 0,
    totalSeconds: 0,

    // Grid
    grid: [],
    mouseRow: 0,
    mouseCol: 0,
    cheeseRow: 0,
    cheeseCol: 0,
    gridSize: 0,
    totalCells: 0,
    currentCellIndex: 0,
    moveInterval: null,

    // Estado
    gameStarted: false,
    gameFinished: false,
    progress: 0,
    timer: null,
    secondTimer: null,

    // ===== TEXTOS DO RATINHO =====
    mouseSounds: [
      "nhac nhac",
      "sniff sniff",
      "qui qui",
      "q q queijo!",
      "to indo!",
      "hum.. ",
      "vamos ",
      "tic tic",
      "tic tac",
    ],

    // Celebração
    celebration: {
      show: false,
      title: "",
      subtitle: "",
    },

    // Toast
    _toastShow: false,
    _toastMessage: "",
    _toastTimeout: null,

    // Controle de fala
    _isSpeaking: false,
    _speakTimeout: null,

    // ===== INIT =====
    async init() {
      console.log("=== INICIANDO ESPERAR ===");

      if (typeof loadComponents === "function") {
        await loadComponents();
      }

      this.Speech = window.Speech || null;

      console.log("[Esperar] Speech disponível:", !!this.Speech);

      // Testa a fala
      setTimeout(() => {
        this.testSpeech();
      }, 1000);

      this.resetGame();
      console.log("Esperar inicializado com sucesso!");
    },

    // ===== TESTE DE FALA =====
    testSpeech() {
      console.log("[Esperar] Testando fala...");
      if (this.Speech && typeof this.Speech.speak === 'function') {
        this.Speech.speak("Olá, eu sou o ratinho!", {
          rate: 0.8,
          pitch: 1.0,
          lang: "pt-BR"
        }).catch(e => console.warn("[Esperar] Erro no teste:", e));
      } else {
        console.warn("[Esperar] Speech não disponível para teste");
      }
    },

    // ===== FALA DO RATINHO =====
    async speakMouse() {
      const text = this.getRandomMouseSound();
      if (!text) return;

      console.log("🐭 Ratinho falou:", text);

      // Se já está falando, ignora
      if (this._isSpeaking) {
        console.log("[Esperar] Já falando, ignorando:", text);
        return;
      }

      // Cancela timeout pendente
      if (this._speakTimeout) {
        clearTimeout(this._speakTimeout);
        this._speakTimeout = null;
      }

      this._isSpeaking = true;

      try {
        // Usa o SpeechService
        if (this.Speech && typeof this.Speech.speak === "function") {
          console.log("[Esperar] Enviando fala via SpeechService...");
          
          // CHAMA SEM AWAIT PARA NÃO BLOQUEAR
          this.Speech.speak(text, {
            rate: 0.7,
            pitch: 1.2,
            lang: "pt-BR",
          }).catch((error) => {
            console.warn("[Esperar] Erro na fala SpeechService:", error);
          });
          
          console.log("[Esperar] Fala enviada (SpeechService)");
        } 
        // Fallback: SpeechSynthesis
        else if (window.speechSynthesis) {
          console.log("[Esperar] Usando fallback SpeechSynthesis");
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "pt-BR";
          utterance.rate = 0.7;
          utterance.pitch = 1.2;
          utterance.volume = 1;
          
          utterance.onstart = () => {
            console.log("[Esperar] Falando (fallback):", text);
          };
          utterance.onend = () => {
            console.log("[Esperar] Fala concluída (fallback)");
          };
          utterance.onerror = (e) => {
            console.warn("[Esperar] Erro na fala (fallback):", e);
          };
          
          window.speechSynthesis.speak(utterance);
          console.log("[Esperar] Fala enviada via SpeechSynthesis");
        } else {
          console.warn("[Esperar] Nenhum serviço de fala disponível");
        }
      } catch (error) {
        console.warn("[Esperar] Erro na fala:", error);
      }

      // Libera após um delay
      this._speakTimeout = setTimeout(() => {
        this._isSpeaking = false;
        this._speakTimeout = null;
      }, 500);
    },

    getRandomMouseSound() {
      const index = Math.floor(Math.random() * this.mouseSounds.length);
      return this.mouseSounds[index];
    },

    // ===== RESET =====
    resetGame() {
      console.log("🔄 Resetando jogo...");

      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.secondTimer) {
        clearInterval(this.secondTimer);
        this.secondTimer = null;
      }
      if (this.moveInterval) {
        clearInterval(this.moveInterval);
        this.moveInterval = null;
      }

      this.gameStarted = false;
      this.gameFinished = false;
      this.progress = 0;
      this.remainingMinutes = this.minutes;
      this.remainingSeconds = 0;
      this.totalSeconds = this.minutes * 60;
      this.totalMinutes = this.minutes;
      this.celebration.show = false;
      this.grid = [];
      this.mouseRow = 0;
      this.mouseCol = 0;
      this.cheeseRow = 0;
      this.cheeseCol = 0;
      this.gridSize = 0;
      this.totalCells = 0;
      this.currentCellIndex = 0;
      this._isSpeaking = false;
      
      if (this._speakTimeout) {
        clearTimeout(this._speakTimeout);
        this._speakTimeout = null;
      }
      
      // Cancela qualquer fala pendente
      if (this.Speech && typeof this.Speech.cancel === 'function') {
        this.Speech.cancel();
      } else if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    },

    // ===== INICIAR JOGO =====
    startGame() {
      console.log("🚀 Iniciando jogo com", this.minutes, "minutos");

      if (this.minutes < 1) {
        this.showToast("Escolha pelo menos 1 minuto");
        return;
      }

      this.resetGame();
      this.gameStarted = true;
      this.totalMinutes = this.minutes;
      this.totalSeconds = this.minutes * 60;
      this.remainingMinutes = this.minutes;
      this.remainingSeconds = 0;

      this.generateGrid();

      console.log("Grid:", this.gridSize, "x", this.gridSize);
      console.log("Total de células:", this.totalCells);
      console.log("Ratinho em:", this.mouseRow, this.mouseCol);
      console.log("Queijo em:", this.cheeseRow, this.cheeseCol);

      // Timer que atualiza a cada segundo
      this.secondTimer = setInterval(() => {
        this.updateTimer();
      }, 1000);

      // Calcula o intervalo de movimento
      const totalMs = this.totalSeconds * 1000;
      const cellsToMove = this.totalCells - 1;
      const intervalMs = Math.max(totalMs / cellsToMove, 100);

      console.log("Intervalo entre movimentos:", intervalMs, "ms");
      console.log("Total de movimentos:", cellsToMove);

      // Inicia o movimento do ratinho
      this.moveInterval = setInterval(() => {
        this.moveMouse();
      }, intervalMs);

      // Fala inicial do ratinho
      setTimeout(() => {
        this.speakMouse();
      }, 500);

      this.showToast(`⏳ Espere ${this.minutes} minutos!`);
    },

    // ===== GERAR GRID =====
    generateGrid() {
      let size = 2;
      if (this.minutes <= 2) size = 3;
      else if (this.minutes <= 4) size = 4;
      else if (this.minutes <= 6) size = 5;
      else if (this.minutes <= 8) size = 6;
      else if (this.minutes <= 12) size = 7;
      else if (this.minutes <= 16) size = 8;
      else if (this.minutes <= 20) size = 9;
      else size = 10;

      this.gridSize = size;
      this.totalCells = size * size;

      this.grid = Array.from({ length: size }, () => Array(size).fill(null));

      this.mouseRow = 0;
      this.mouseCol = 0;
      this.grid[0][0] = "mouse";
      this.currentCellIndex = 0;

      this.cheeseRow = size - 1;
      this.cheeseCol = size - 1;
      this.grid[size - 1][size - 1] = "cheese";
    },

    // ===== MOVER RATINHO =====
    moveMouse() {
      if (this.gameFinished) return;

      this.currentCellIndex++;

      if (this.currentCellIndex >= this.totalCells) {
        this.endGame();
        return;
      }

      const newRow = Math.floor(this.currentCellIndex / this.gridSize);
      const newCol = this.currentCellIndex % this.gridSize;

      this.grid[this.mouseRow][this.mouseCol] = null;

      this.mouseRow = newRow;
      this.mouseCol = newCol;
      this.grid[newRow][newCol] = "mouse";

      // Fala a cada 5 movimentos
      if (this.currentCellIndex % 5 === 0) {
        this.speakMouse();
      }

      if (newRow === this.cheeseRow && newCol === this.cheeseCol) {
        this.endGame();
        return;
      }

      if (this.currentCellIndex % 10 === 0) {
        console.log(
          `🐭 Movido para (${newRow}, ${newCol}) - ${this.currentCellIndex}/${this.totalCells}`,
        );
      }
    },

    // ===== ATUALIZAR TIMER =====
    updateTimer() {
      if (this.gameFinished) return;

      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else if (this.remainingMinutes > 0) {
        this.remainingMinutes--;
        this.remainingSeconds = 59;
      } else {
        if (this.remainingSeconds === 0 && this.remainingMinutes === 0) {
          if (!this.gameFinished) {
            console.log("⏰ Tempo esgotado, forçando chegada ao queijo");
            this.currentCellIndex = this.totalCells;
            this.grid[this.mouseRow][this.mouseCol] = null;
            this.mouseRow = this.cheeseRow;
            this.mouseCol = this.cheeseCol;
            this.grid[this.cheeseRow][this.cheeseCol] = "mouse";
            this.endGame();
          }
          return;
        }
      }

      const elapsedSeconds =
        this.totalSeconds -
        (this.remainingMinutes * 60 + this.remainingSeconds);
      this.progress = Math.min(elapsedSeconds / this.totalSeconds, 1);
    },

    // ===== FIM DE JOGO =====
    endGame() {
      console.log("🏁 Finalizando jogo...");

      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.secondTimer) {
        clearInterval(this.secondTimer);
        this.secondTimer = null;
      }
      if (this.moveInterval) {
        clearInterval(this.moveInterval);
        this.moveInterval = null;
      }

      this.gameFinished = true;
      this.gameStarted = false;
      this.progress = 1;
      this.remainingMinutes = 0;
      this.remainingSeconds = 0;

      // Fala de vitória do ratinho
      this.speakMouse();

      this.grid[this.mouseRow][this.mouseCol] = null;
      this.mouseRow = this.cheeseRow;
      this.mouseCol = this.cheeseCol;
      this.grid[this.cheeseRow][this.cheeseCol] = "mouse";

      const minutes = this.totalMinutes;
      const message = `Parabéns! Você esperou por ${minutes} ${minutes === 1 ? "minuto" : "minutos"}!`;
      console.log("🎉", message);
      this.showToast("🎉 " + message);

      // Fala da vitória
      try {
        if (this.Speech && typeof this.Speech.speak === "function") {
          console.log("[Esperar] Falando vitória via SpeechService");
          this.Speech.speak(message, {
            rate: 0.9,
            pitch: 1.0,
            lang: "pt-BR",
          }).catch(e => console.warn("[Esperar] Erro na fala de vitória:", e));
        } else if (window.speechSynthesis) {
          console.log("[Esperar] Falando vitória via SpeechSynthesis");
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = "pt-BR";
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.warn("[Esperar] Erro na fala de vitória:", error);
      }

      this.celebration.title = "🎉 Parabéns!";
      this.celebration.subtitle = `Você esperou por ${minutes} ${minutes === 1 ? "minuto" : "minutos"}!`;
      this.celebration.show = true;

      this.generateConfetti();

      setTimeout(() => {
        this.celebration.show = false;
      }, 5000);
    },

    // ===== GERAR CONFETES =====
    generateConfetti() {
      const colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#FF8A5C",
        "#A29BFE",
      ];
      const count = 50;
      const container = document.querySelector("main");
      if (!container) return;

      document.querySelectorAll(".confetti").forEach((el) => el.remove());

      for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.className = "confetti";
        const size = 6 + Math.random() * 10;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2 + Math.random() * 3;
        const rotation = Math.random() * 360;
        const isCircle = Math.random() > 0.5;
        el.style.cssText = `
                    position: fixed;
                    left: ${left}%;
                    top: -10%;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    border-radius: ${isCircle ? "50%" : "2px"};
                    transform: rotate(${rotation}deg);
                    animation: confettiFall ${duration}s linear infinite;
                    animation-delay: ${delay}s;
                    pointer-events: none;
                    z-index: 9999;
                `;
        container.appendChild(el);
      }
      setTimeout(() => {
        document.querySelectorAll(".confetti").forEach((el) => el.remove());
      }, 6000);
    },

    // ===== TOAST =====
    showToast(message) {
      if (this._toastTimeout) clearTimeout(this._toastTimeout);
      this._toastMessage = message;
      this._toastShow = true;
      this._toastTimeout = setTimeout(() => {
        this._toastShow = false;
      }, 3000);
    },

    // ===== COMPUTED =====
    get gridSizeDisplay() {
      return this.gridSize || 0;
    },

    get cells() {
      const cells = [];
      if (!this.grid || this.grid.length === 0) return cells;
      this.grid.forEach((row) => {
        row.forEach((cell) => {
          cells.push(cell);
        });
      });
      return cells;
    },

    get isRunning() {
      return this.gameStarted && !this.gameFinished;
    },

    get timeDisplay() {
      const mins = String(this.remainingMinutes).padStart(2, "0");
      const secs = String(this.remainingSeconds).padStart(2, "0");
      return `${mins}:${secs}`;
    },

    get progressPercent() {
      return Math.round(this.progress * 100);
    },
  };
}
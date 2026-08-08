function mazeApp() {
  return {
    // Dados do labirinto
    grid: [],
    start: { row: 0, col: 0 },
    end: { row: 7, col: 7 },
    solution: [],

    // Estado do jogo
    mouseRow: 0,
    mouseCol: 0,
    steps: 0,
    gameOver: false,
    won: false,
    showHelp: false,

    // Estados de seleção
    isMouseSelected: false,
    validMoves: [],

    // ===== CELEBRAÇÃO =====
    celebration: {
      show: false,
      title: "",
      subtitle: "",
    },

    // ===== CONTADOR DE VERSÃO =====
    _version: 0,

    // ===== CONTROLE DE FALA =====
    _isSpeaking: false,
    _speakTimeout: null,

    // ===== TEXTOS DO RATINHO =====
    mouseSounds: [
      'nhac nhac',
      'sniff sniff',
      'qui qui',
      'q q queijo!',
      'to indo!',
      'hum.. ',
      'vamos ',
      'tic tic',
      'tic tac',
    ],

    async init() {
      if (typeof loadComponents === "function") {
        await loadComponents();
      }

      // Inicializa Speech
      this.Speech = window.Speech || null;
      
      this.resetGame();
    },

    resetGame() {
      if (typeof MazeGenerator === "undefined") {
        console.error('[Maze] MazeGenerator não carregado');
        return;
      }

      const generator = new MazeGenerator(8);
      const result = generator.generate();

      this.grid = result.grid;
      this.start = result.start;
      this.end = result.end;
      this.solution = result.solution || [];

      this.mouseRow = this.start.row;
      this.mouseCol = this.start.col;
      this.steps = 0;
      this.gameOver = false;
      this.won = false;
      this.isMouseSelected = false;
      this.validMoves = [];
      this.celebration.show = false;
      this._isSpeaking = false;
      
      if (this._speakTimeout) {
        clearTimeout(this._speakTimeout);
        this._speakTimeout = null;
      }

      this._version++;
    },

    // ===== FALA DO RATINHO (COM CONTROLE DE FLUXO) =====
    async speakMouse(text) {
      if (!text) return;
      
      // Se já está falando, ignora
      if (this._isSpeaking) {
        console.log("[Maze] Já falando, ignorando:", text);
        return;
      }

      // Cancela timeout pendente
      if (this._speakTimeout) {
        clearTimeout(this._speakTimeout);
        this._speakTimeout = null;
      }

      this._isSpeaking = true;
      
      try {
        const speechService = this.Speech || window.Speech;
        
        if (speechService && typeof speechService.speak === "function") {
          await speechService.speak(text, {
            rate: 0.7,
            pitch: 1.2,
            lang: "pt-BR",
          });
        } else {
          console.warn("[Maze] SpeechService não disponível");
        }
      } catch (error) {
        console.warn("[Maze] Erro na fala:", error);
      } finally {
        // Libera após um pequeno delay para evitar falas consecutivas
        this._speakTimeout = setTimeout(() => {
          this._isSpeaking = false;
          this._speakTimeout = null;
        }, 300);
      }
    },

    // ===== OBTÉM UM TEXTO ALEATÓRIO DO RATINHO =====
    getRandomMouseSound() {
      const index = Math.floor(Math.random() * this.mouseSounds.length);
      return this.mouseSounds[index];
    },

    // ===== CELEBRAÇÃO =====
    async celebrate(title, subtitle) {
      this.celebration.title = title;
      this.celebration.subtitle = subtitle;
      this.celebration.show = true;

      try {
        const victoryText = `Parabéns! O ratinho encontrou o queijo em ${this.steps} passos!`;
        const speechService = this.Speech || window.Speech;
        
        if (speechService && typeof speechService.speak === "function") {
          await speechService.speak(victoryText, {
            rate: 0.9,
            pitch: 1.0,
            lang: "pt-BR",
          });
        }
      } catch (error) {
        console.warn("[Maze] Erro na fala de vitória:", error);
      }

      setTimeout(() => {
        this.celebration.show = false;
      }, 4000);
    },

    // ===== CÉLULAS LINEARIZADAS =====
    get cells() {
      const cells = [];
      if (!this.grid || this.grid.length === 0) return cells;

      this.grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          cells.push({
            cell,
            row: rowIndex,
            col: colIndex,
          });
        });
      });

      return cells;
    },

    // ===== FUNÇÕES DE VERIFICAÇÃO =====
    isMouse(row, col) {
      return row === this.mouseRow && col === this.mouseCol;
    },

    isCheese(row, col) {
      return row === this.end.row && col === this.end.col;
    },

    isOnSolutionPath(row, col) {
      return this.solution.some((p) => p.row === row && p.col === col);
    },

    getStepNumber(row, col) {
      const idx = this.solution.findIndex(
        (p) => p.row === row && p.col === col,
      );
      return idx >= 0 ? idx : "";
    },

    get distance() {
      return (
        Math.abs(this.mouseRow - this.end.row) +
        Math.abs(this.mouseCol - this.end.col)
      );
    },

    isPath(row, col) {
      if (row < 0 || row >= 8 || col < 0 || col >= 8) return false;
      return this.grid[row][col] === 0;
    },

    // ===== DESTAQUE DE MOVIMENTOS VÁLIDOS =====
    isHighlighted(row, col) {
      return this.validMoves.some((m) => m.row === row && m.col === col);
    },

    isSelected() {
      return this.isMouseSelected;
    },

    // ===== OBTÉM VIZINHOS VÁLIDOS =====
    getValidNeighbors(row, col) {
      const neighbors = [];
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];

      for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (
          this.isPath(nr, nc) &&
          !(nr === this.mouseRow && nc === this.mouseCol)
        ) {
          neighbors.push({ row: nr, col: nc });
        }
      }

      return neighbors;
    },

    // ===== HANDLER ÚNICO PARA CLIQUE (COM CONTROLE DE FALA) =====
    async handleCellClick(row, col) {
      if (this.gameOver || this.won) return;

      // Caso 1: Clicou no ratinho
      if (this.isMouse(row, col)) {
        if (this.isMouseSelected) return;

        this.isMouseSelected = true;
        this.validMoves = this.getValidNeighbors(row, col);

        if (this.validMoves.length === 0) {
          this.gameOver = true;
          this.isMouseSelected = false;
          // Fala game over (apenas uma vez)
          if (!this._isSpeaking) {
            this.speakMouse('ih, sem saída! 😰');
          }
        } else {
          // Fala do ratinho quando selecionado (apenas uma vez)
          if (!this._isSpeaking) {
            this.speakMouse(this.getRandomMouseSound());
          }
        }

        this._version++;
        return;
      }

      // Caso 2: Clicou em uma célula destacada
      if (this.isHighlighted(row, col)) {
        // Fala do ratinho antes de andar (apenas se não estiver falando)
        if (!this._isSpeaking) {
          const sound = this.getRandomMouseSound();
          await this.speakMouse(sound);
        }

        this.mouseRow = row;
        this.mouseCol = col;
        this.steps++;
        this.isMouseSelected = false;
        this.validMoves = [];
        this._version++;

        // Verifica se chegou ao queijo
        if (row === this.end.row && col === this.end.col) {
          this.won = true;
          // Fala especial do queijo (força a fala mesmo se estiver falando)
          this._isSpeaking = false; // Reseta para permitir a fala
          if (this._speakTimeout) {
            clearTimeout(this._speakTimeout);
            this._speakTimeout = null;
          }
          await this.speakMouse('Queijo! Queijo! 🧀🎉');
          this.generateConfetti();
          this.celebrate("🎉 Parabéns!", `O ratinho encontrou o queijo em ${this.steps} passos!`);
          return;
        }

        // Verifica se está preso
        const neighbors = this.getValidNeighbors(row, col);
        if (neighbors.length === 0 && !this.won) {
          this.gameOver = true;
          if (!this._isSpeaking) {
            await this.speakMouse('ih, sem saída! 😰');
          }
        }
      }
    },

    // ===== VITÓRIA =====
    getRandomVictoryText() {
      const texts = [
        `Parabéns! O ratinho encontrou o queijo!`,
        `Você conseguiu! Ajudou o ratinho a encontrar o queijo!`,
        `Queijo encontrado! Ratinho adora queijo!`,
        `Parabéns! O ratinho chegou ao queijo em ${this.steps} passos!`,
      ];
      return texts[Math.floor(Math.random() * texts.length)];
    },

    // ===== CONFETES =====
    generateConfetti() {
      const colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
        "#FFEAA7", "#DDA0DD", "#FF8A5C", "#A29BFE"
      ];
      const confettiCount = 60;
      const container = document.querySelector(".maze-wrapper");

      if (!container) {
        console.warn("[Maze] Container .maze-wrapper não encontrado");
        return;
      }

      document.querySelectorAll(".confetti").forEach((el) => el.remove());

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";
        const size = 6 + Math.random() * 10;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2 + Math.random() * 3;
        const rotation = Math.random() * 360;
        const isCircle = Math.random() > 0.5;

        confetti.style.cssText = `
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

        container.appendChild(confetti);
      }

      setTimeout(() => {
        document.querySelectorAll(".confetti").forEach((el) => el.remove());
      }, 6000);
    },

    // ===== HELPERS =====
    toggleHelp() {
      this.showHelp = !this.showHelp;
    },

    debugMaze() {
      // Desativado para produção
      return;
    }
  };
}
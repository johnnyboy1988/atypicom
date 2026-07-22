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

    // ===== CELEBRAÇÃO (igual ao memory) =====
    celebration: {
      show: false,
      title: "",
      subtitle: "",
    },
    // ===== NOVO: CONTADOR DE VERSÃO PARA FORÇAR RE-RENDERIZAÇÃO =====
    _version: 0,

    async init() {
      if (typeof loadComponents === "function") {
        await loadComponents();
      }

      //   console.log('[Maze] MazeGenerator:', typeof MazeGenerator);
      this.resetGame();
    },

    resetGame() {
      if (typeof MazeGenerator === "undefined") {
        // console.error('[Maze] MazeGenerator não carregado')
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

      this._version++; // <-- INCREMENTA VERSÃO

      //   console.log('[Maze] Jogo reiniciado');
      this.debugMaze();
    },
    // ===== CELEBRAÇÃO (com fala) =====
    async celebrate(title, subtitle) {
      this.celebration.title = title;
      this.celebration.subtitle = subtitle;
      this.celebration.show = true;

      // ===== FALA DO TEXTO DE VITÓRIA =====
      try {
        // Verifica se o SpeechService está disponível
        if (window.Speech && typeof window.Speech.speak === "function") {
          // Texto completo da vitória
          const victoryText = `Parabéns! O ratinho encontrou o queijo em ${this.steps} passos!`;
          await window.Speech.speak(victoryText, {
            rate: 0.9,
            pitch: 1.0,
            lang: "pt-BR",
          });
          console.log("[Maze] Fala de vitória concluída");
        } else {
          console.warn("[Maze] SpeechService não disponível");
        }
      } catch (error) {
        console.warn("[Maze] Erro na fala:", error);
      }

      // Fecha automaticamente após 4 segundos (um pouco mais para a fala)
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
    // ===== HANDLER ÚNICO PARA CLIQUE =====

    async handleCellClick(row, col) {
      // console.log("[Maze] Clique:", row, col);

      if (this.gameOver || this.won) return;

      // Caso 1: Clicou no ratinho
      if (this.isMouse(row, col)) {
        if (this.isMouseSelected) {
          return;
        }

        this.isMouseSelected = true;
        this.validMoves = this.getValidNeighbors(row, col);

        if (this.validMoves.length === 0) {
          this.gameOver = true;
          this.isMouseSelected = false;
        }

        this._version++;
        this.debugMaze();
        return;
      }

      // Caso 2: Clicou em uma célula destacada
      if (this.isHighlighted(row, col)) {
        this.mouseRow = row;
        this.mouseCol = col;
        this.steps++;
        this.isMouseSelected = false;
        this.validMoves = [];
        this._version++;

        if (row === this.end.row && col === this.end.col) {
          this.won = true;
          console.log("[Maze] => 🎉 VENCEU!");

          const victoryText = this.getRandomVictoryText();
          this.celebrate("🎉 " + victoryText + "🎉 ");
          await window.Speech.speak(victoryText, {
            rate: 0.9,
            pitch: 1.0,
            lang: "pt-BR",
          });

          this.generateConfetti();

          return;
        }

        const neighbors = this.getValidNeighbors(row, col);
        if (neighbors.length === 0 && !this.won) {
          this.gameOver = true;
        }
        this.debugMaze();
        return;
      }
    },
    getRandomVictoryText() {
      const texts = [
        `Parabéns! O ratinho encontrou o queijo!`,
        `Você conseguiu! Ajudou o ratinho a encontrar o queijo!`,
        `Queijo encontrado! Ratinho adora queijo!`,
        `Parabéns! O ratinho chegou ao queijo em ${this.steps} passos!`,
      ];
      return texts[Math.floor(Math.random() * texts.length)];
    },
    // ===== FUNÇÃO PARA GERAR CONFETES =====
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
      const confettiCount = 60;
      const container = document.querySelector(".maze-wrapper");

      if (!container) {
        console.warn(
          "[Maze] Container .maze-wrapper não encontrado para confetes",
        );
        return;
      }

      // Remove confetes anteriores
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

      // Remove confetes após 6 segundos
      setTimeout(() => {
        document.querySelectorAll(".confetti").forEach((el) => el.remove());
      }, 6000);
    },
    // ===== DEBUG =====

    debugMaze() {
      return; // Desativa debug para produção
      console.log("[Maze] ===== ESTADO =====");
      console.log("[Maze] mouse:", this.mouseRow, this.mouseCol);
      console.log("[Maze] selected:", this.isMouseSelected);
      console.log("[Maze] validMoves:", this.validMoves);
      console.log("[Maze] gameOver:", this.gameOver, "won:", this.won);
      console.log("[Maze] Grid:");
      for (let r = 0; r < 8; r++) {
        let row = r + " ";
        for (let c = 0; c < 8; c++) {
          let char = this.grid[r][c] === 0 ? "·" : "█";
          if (this.isMouse(r, c)) char = "🐭";
          else if (this.isCheese(r, c)) char = "🧀";
          else if (this.isHighlighted(r, c)) char = "🔵";
          row += char + " ";
        }
        console.log(row);
      }
    },

    // ===== HELPERS =====

    toggleHelp() {
      this.showHelp = !this.showHelp;
    },
    // ===== FUNÇÃO PARA GERAR CONFETES =====
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
      const confettiCount = 50;
      const container = document.querySelector(".maze-wrapper");

      if (!container) return;

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

      // Remove confetes após 5 segundos
      setTimeout(() => {
        document.querySelectorAll(".confetti").forEach((el) => el.remove());
      }, 5000);
    },
  };
}

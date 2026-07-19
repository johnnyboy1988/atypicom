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
    
    // ===== NOVO: CONTADOR DE VERSÃO PARA FORÇAR RE-RENDERIZAÇÃO =====
    _version: 0,
    
    async init() {
      if (typeof loadComponents === 'function') {
        await loadComponents();
      }
      
      console.log('[Maze] MazeGenerator:', typeof MazeGenerator);
      this.resetGame();
    },

    resetGame() {
      if (typeof MazeGenerator === 'undefined') {
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
      
      this._version++; // <-- INCREMENTA VERSÃO
      
      console.log('[Maze] Jogo reiniciado');
      this.debugMaze();
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
            col: colIndex
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
      return this.solution.some(p => p.row === row && p.col === col);
    },

    getStepNumber(row, col) {
      const idx = this.solution.findIndex(p => p.row === row && p.col === col);
      return idx >= 0 ? idx : '';
    },

    get distance() {
      return Math.abs(this.mouseRow - this.end.row) + Math.abs(this.mouseCol - this.end.col);
    },

    isPath(row, col) {
      if (row < 0 || row >= 8 || col < 0 || col >= 8) return false;
      return this.grid[row][col] === 0;
    },

    // ===== DESTAQUE DE MOVIMENTOS VÁLIDOS =====
    
    isHighlighted(row, col) {
      return this.validMoves.some(m => m.row === row && m.col === col);
    },

    isSelected() {
      return this.isMouseSelected;
    },

    // ===== OBTÉM VIZINHOS VÁLIDOS =====
    
    getValidNeighbors(row, col) {
      const neighbors = [];
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];

      for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (this.isPath(nr, nc) && !(nr === this.mouseRow && nc === this.mouseCol)) {
          neighbors.push({ row: nr, col: nc });
        }
      }
      
      return neighbors;
    },

    // ===== HANDLER ÚNICO PARA CLIQUE =====
    
    handleCellClick(row, col) {
    //   console.log('[Maze] Clique:', row, col);
      
      if (this.gameOver || this.won) return;
      
      // Caso 1: Clicou no ratinho
      if (this.isMouse(row, col)) {
        // console.log('[Maze] => Clicou no RATINHO!');
        if (this.isMouseSelected) {
          this.isMouseSelected = false;
          this.validMoves = [];
        } else {
          this.isMouseSelected = true;
          this.validMoves = this.getValidNeighbors(row, col);
          if (this.validMoves.length === 0) {
            this.gameOver = true;
            this.isMouseSelected = false;
          }
        }
        this._version++; // <-- FORÇA RE-RENDERIZAÇÃO
        this.debugMaze();
        return;
      }
      
      // Caso 2: Clicou em uma célula destacada
      if (this.isHighlighted(row, col)) {
        // console.log('[Maze] => Clicou em DESTAQUE! Movendo...');
        this.mouseRow = row;
        this.mouseCol = col;
        this.steps++;
        this.isMouseSelected = false;
        this.validMoves = [];
        this._version++; // <-- FORÇA RE-RENDERIZAÇÃO
        
        if (row === this.end.row && col === this.end.col) {
          this.won = true;
        //   console.log('[Maze] => 🎉 VENCEU!');
        }
        
        const neighbors = this.getValidNeighbors(row, col);
        if (neighbors.length === 0 && !this.won) {
          this.gameOver = true;
        //   console.log('[Maze] => GAME OVER - Sem saída!');
        }
        this.debugMaze();
        return;
      }
      
      console.log('[Maze] => Clique IGNORADO');
    },

    // ===== DEBUG =====
    
    debugMaze() {
      return; // Desativa debug para produção
      console.log('[Maze] ===== ESTADO =====');
      console.log('[Maze] mouse:', this.mouseRow, this.mouseCol);
      console.log('[Maze] selected:', this.isMouseSelected);
      console.log('[Maze] validMoves:', this.validMoves);
      console.log('[Maze] gameOver:', this.gameOver, 'won:', this.won);
      console.log('[Maze] Grid:');
      for (let r = 0; r < 8; r++) {
        let row = r + ' ';
        for (let c = 0; c < 8; c++) {
          let char = this.grid[r][c] === 0 ? '·' : '█';
          if (this.isMouse(r, c)) char = '🐭';
          else if (this.isCheese(r, c)) char = '🧀';
          else if (this.isHighlighted(r, c)) char = '🔵';
          row += char + ' ';
        }
        console.log(row);
      }
    },

    // ===== HELPERS =====
    
    toggleHelp() {
      this.showHelp = !this.showHelp;
    }
  };
}
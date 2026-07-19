// maze-generator.js - Versão com Distância Mínima
// ============================================
// MAZE GENERATOR - Labirinto 8x8
// ============================================

class MazeGenerator {
  constructor(size = 8) {
    this.size = size;
    this.grid = [];
    this.start = { row: 0, col: 0 };
    this.end = null;
    this.solution = [];
    
    // ===== DISTÂNCIA MÍNIMA ENTRE RATO E QUEIJO =====
    this.minDistance = 6; // Distância mínima de Manhattan
  }

  generate() {
    // Inicializa grid com paredes
    this.grid = [];
    for (let r = 0; r < this.size; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.size; c++) {
        this.grid[r][c] = 1;
      }
    }

    this.start = { row: 0, col: 0 };
    this.grid[0][0] = 0;

    this.generateMaze();
    this.end = this.findRandomCheesePosition();
    this.ensurePathToCheese();
    this.findSolution();

    // console.log('[MazeGenerator] Queijo em:', this.end.row, this.end.col);
    // console.log('[MazeGenerator] Distância do rato:', this.calculateDistance(this.start, this.end));

    return {
      grid: this.grid,
      start: this.start,
      end: this.end,
      solution: this.solution
    };
  }

  generateMaze() {
    const visited = [];
    for (let r = 0; r < this.size; r++) {
      visited[r] = [];
      for (let c = 0; c < this.size; c++) {
        visited[r][c] = false;
      }
    }

    const dfs = (row, col) => {
      visited[row][col] = true;

      const dirs = [
        [-2, 0], [2, 0], [0, -2], [0, 2]
      ];
      
      for (let i = dirs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
      }

      for (const [dr, dc] of dirs) {
        const nr = row + dr;
        const nc = col + dc;

        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && !visited[nr][nc]) {
          const midR = row + dr / 2;
          const midC = col + dc / 2;
          this.grid[midR][midC] = 0;
          this.grid[nr][nc] = 0;
          dfs(nr, nc);
        }
      }
    };

    dfs(0, 0);
    this.ensureOpenBorders();
  }

  // ===== GARANTE QUE AS BORDAS NÃO ESTEJAM TOTALMENTE BLOQUEADAS =====
  ensureOpenBorders() {
    const lastRow = this.size - 1;
    const lastCol = this.size - 1;

    let hasPathOnLastRow = false;
    for (let c = 0; c < this.size; c++) {
      if (this.grid[lastRow][c] === 0) {
        hasPathOnLastRow = true;
        break;
      }
    }
    if (!hasPathOnLastRow) {
      const randomCol = Math.floor(Math.random() * this.size);
      this.grid[lastRow][randomCol] = 0;
      if (randomCol > 0) this.grid[lastRow][randomCol - 1] = 0;
      if (randomCol < this.size - 1) this.grid[lastRow][randomCol + 1] = 0;
    }

    let hasPathOnLastCol = false;
    for (let r = 0; r < this.size; r++) {
      if (this.grid[r][lastCol] === 0) {
        hasPathOnLastCol = true;
        break;
      }
    }
    if (!hasPathOnLastCol) {
      const randomRow = Math.floor(Math.random() * this.size);
      this.grid[randomRow][lastCol] = 0;
      if (randomRow > 0) this.grid[randomRow - 1][lastCol] = 0;
      if (randomRow < this.size - 1) this.grid[randomRow + 1][lastCol] = 0;
    }
  }

  // ===== CALCULA DISTÂNCIA DE MANHATTAN =====
  calculateDistance(pos1, pos2) {
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
  }

  // ===== ENCONTRA POSIÇÃO ALEATÓRIA PARA O QUEIJO COM DISTÂNCIA MÍNIMA =====
  findRandomCheesePosition() {
    const candidates = [];
    
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        // Não pode ser a posição inicial
        if (r === this.start.row && c === this.start.col) continue;
        
        // Só pode ser em célula de caminho
        if (this.grid[r][c] === 0) {
          // Calcula distância do rato
          const distance = this.calculateDistance(this.start, { row: r, col: c });
          
          // ===== SÓ ADICIONA SE A DISTÂNCIA FOR MAIOR QUE A MÍNIMA =====
          if (distance >= this.minDistance) {
            candidates.push({ 
              row: r, 
              col: c, 
              distance: distance 
            });
          }
        }
      }
    }

    // Se não houver candidatos com a distância mínima, usa todos os caminhos
    if (candidates.length === 0) {
    //   console.log('[MazeGenerator] Nenhum candidato com distância >=', this.minDistance, '. Usando todos os caminhos.');
      
      // Fallback: todos os caminhos
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (r === this.start.row && c === this.start.col) continue;
          if (this.grid[r][c] === 0) {
            candidates.push({ row: r, col: c, distance: this.calculateDistance(this.start, { row: r, col: c }) });
          }
        }
      }
    }

    // Ordena por distância (do mais distante para o mais próximo)
    candidates.sort((a, b) => b.distance - a.distance);

    // Pega os top 30% mais distantes (para garantir variedade)
    const topCount = Math.max(1, Math.floor(candidates.length * 0.3));
    const topCandidates = candidates.slice(0, topCount);

    // Escolhe aleatoriamente entre os top candidatos
    const randomIndex = Math.floor(Math.random() * topCandidates.length);
    const selected = topCandidates[randomIndex];

    // console.log('[MazeGenerator] Queijo selecionado com distância:', selected.distance);
    
    return { row: selected.row, col: selected.col };
  }

  // ===== VERIFICA VIZINHOS VÁLIDOS =====
  getValidNeighbors(row, col) {
    const neighbors = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.grid[nr][nc] === 0) {
        neighbors.push({ row: nr, col: nc });
      }
    }

    return neighbors;
  }

  // ===== GARANTE QUE O QUEIJO SEJA ACESSÍVEL =====
  ensurePathToCheese() {
    const endR = this.end.row;
    const endC = this.end.col;
    
    this.grid[endR][endC] = 0;

    const neighbors = this.getValidNeighbors(endR, endC);
    
    if (neighbors.length === 0) {
      // console.log('[MazeGenerator] Queijo em', endR, endC, 'inacessível! Abrindo caminho...');
      
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];
      
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }
      
      for (const [dr, dc] of directions) {
        const nr = endR + dr;
        const nc = endC + dc;
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
          if (this.grid[nr][nc] === 0) {
            // console.log('[MazeGenerator] Caminho aberto para o queijo via:', nr, nc);
            return;
          }
        }
      }
      
      for (const [dr, dc] of directions) {
        const nr = endR + dr;
        const nc = endC + dc;
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
          this.grid[nr][nc] = 0;
        //   console.log('[MazeGenerator] Forçando caminho para o queijo via:', nr, nc);
          return;
        }
      }
    } else {
      console.log('[MazeGenerator] Queijo em', endR, endC, 'já é acessível!');
    }
  }

  // ===== ENCONTRA SOLUÇÃO =====
  findSolution() {
    this.solution = [];
    const visited = new Set();
    const path = [];

    const dfs = (row, col) => {
      const key = `${row},${col}`;
      
      if (row === this.end.row && col === this.end.col) {
        this.solution = [...path, { row, col }];
        return true;
      }

      visited.add(key);
      path.push({ row, col });

      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];

      for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        const nKey = `${nr},${nc}`;
        
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size &&
            !visited.has(nKey) &&
            this.grid[nr][nc] === 0) {
          if (dfs(nr, nc)) return true;
        }
      }

      path.pop();
      return false;
    };

    dfs(this.start.row, this.start.col);
    
    if (this.solution.length === 0) {
      this.findSolutionBFS();
    }
  }

  // ===== BFS COMO FALLBACK =====
  findSolutionBFS() {
    const queue = [{ row: this.start.row, col: this.start.col, path: [{ row: this.start.row, col: this.start.col }] }];
    const visited = new Set();
    visited.add(`${this.start.row},${this.start.col}`);

    while (queue.length > 0) {
      const current = queue.shift();
      const { row, col, path } = current;

      if (row === this.end.row && col === this.end.col) {
        this.solution = path;
        return;
      }

      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];

      for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        const key = `${nr},${nc}`;
        
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size &&
            !visited.has(key) &&
            this.grid[nr][nc] === 0) {
          visited.add(key);
          queue.push({ row: nr, col: nc, path: [...path, { row: nr, col: nc }] });
        }
      }
    }
  }

  // ===== VERIFICA SE É CAMINHO =====
  isPath(row, col) {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return false;
    return this.grid[row][col] === 0;
  }
}

// Exporta para uso global
window.MazeGenerator = MazeGenerator;
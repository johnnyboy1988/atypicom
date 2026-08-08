// app.js – Jogo da Velha (Tic-Tac-Toe)
function ticTacToeApp() {
    return {
        // Tabuleiro
        board: Array(9).fill(null),
        winningCells: [],
        currentPlayer: 'x',
        winner: null,
        gameOver: false,
        isCPUTurn: false,

        // Configurações
        gameMode: 'cpu', // 'cpu' ou 'pvp'
        difficulty: 'medium', // 'easy', 'medium', 'hard'
        playerSymbol: 'x',
        narrateMoves: true,

        // Estatísticas
        stats: {
            x: 0,
            o: 0,
            draws: 0
        },

        // UI
        showSettings: false,

        // Speech
        Speech: null,

        // Celebração
        celebration: {
            show: false,
            title: '',
            subtitle: ''
        },

        // Toast
        _toastShow: false,
        _toastMessage: '',
        _toastTimeout: null,

        // ===== INIT =====
        async init() {
            console.log("=== INICIANDO JOGO DA VELHA ===");

            if (typeof loadComponents === 'function') {
                await loadComponents();
            }

            this.Speech = window.Speech || null;

            if (this.Speech) {
                console.log("[TicTacToe] SpeechService disponível");
            }

            this.loadConfig();
            this.resetGame();
            console.log("Jogo da Velha inicializado com sucesso!");
        },

        // ===== CONFIGURAÇÕES =====
        loadConfig() {
            try {
                const saved = localStorage.getItem('tictactoe_config');
                if (saved) {
                    const config = JSON.parse(saved);
                    this.gameMode = config.gameMode || 'cpu';
                    this.difficulty = config.difficulty || 'medium';
                    this.playerSymbol = config.playerSymbol || 'x';
                    this.narrateMoves = config.narrateMoves !== undefined ? config.narrateMoves : true;
                    this.stats = config.stats || { x: 0, o: 0, draws: 0 };
                }
            } catch (e) {
                console.warn('[TicTacToe] Erro ao carregar configurações:', e);
            }
        },

        saveConfig() {
            try {
                const config = {
                    gameMode: this.gameMode,
                    difficulty: this.difficulty,
                    playerSymbol: this.playerSymbol,
                    narrateMoves: this.narrateMoves,
                    stats: this.stats
                };
                localStorage.setItem('tictactoe_config', JSON.stringify(config));
            } catch (e) {
                console.warn('[TicTacToe] Erro ao salvar configurações:', e);
            }
        },

        setGameMode(mode) {
            this.gameMode = mode;
            this.saveConfig();
            this.resetGame();
        },

        setDifficulty(level) {
            this.difficulty = level;
            this.saveConfig();
            this.showToast(this.getDifficultyLabel(level));
            this.resetGame();
        },

        getDifficultyLabel(level) {
            const labels = {
                easy: '😊 Fácil',
                medium: '🤔 Médio',
                hard: '🧠 Difícil'
            };
            return labels[level] || level;
        },

        setPlayerSymbol(symbol) {
            this.playerSymbol = symbol;
            this.saveConfig();
            this.resetGame();
        },

        toggleNarrateMoves() {
            this.narrateMoves = !this.narrateMoves;
            this.saveConfig();
            this.showToast(this.narrateMoves ? '🔊 Narração ativada' : '🔇 Narração desativada');
        },

        resetStats() {
            this.stats = { x: 0, o: 0, draws: 0 };
            this.saveConfig();
            this.showToast('📊 Placar resetado!');
        },

        // ===== RESET =====
        resetGame() {
            this.board = Array(9).fill(null);
            this.winningCells = [];
            this.winner = null;
            this.gameOver = false;
            this.isCPUTurn = false;
            this.celebration.show = false;

            this.currentPlayer = this.playerSymbol;

            if (this.gameMode === 'cpu' && this.playerSymbol === 'o') {
                this.isCPUTurn = true;
                setTimeout(() => {
                    this.cpuMove();
                }, 500);
            }
        },

        // ===== FAZER JOGADA =====
        makeMove(index) {
            if (this.gameOver) return;
            if (this.board[index]) return;
            if (this.isCPUTurn) return;

            if (this.gameMode === 'cpu') {
                const isPlayerTurn = this.currentPlayer === this.playerSymbol;
                if (!isPlayerTurn) return;
            }

            this.executeMove(index);
        },

        executeMove(index) {
            this.board[index] = this.currentPlayer;

            if (this.narrateMoves) {
                this.speakMove(this.currentPlayer, index);
            }

            const winResult = this.checkWinner();
            if (winResult) {
                this.handleGameEnd(winResult);
                return;
            }

            if (!this.board.includes(null)) {
                this.handleGameEnd('draw');
                return;
            }

            this.switchPlayer();

            if (this.gameMode === 'cpu' && this.currentPlayer !== this.playerSymbol) {
                this.isCPUTurn = true;
                setTimeout(() => {
                    this.cpuMove();
                }, 400);
            }
        },

        switchPlayer() {
            this.currentPlayer = this.currentPlayer === 'x' ? 'o' : 'x';
        },

        // ===== CPU MOVE (COM DIFICULDADE) =====
        cpuMove() {
            if (this.gameOver) {
                this.isCPUTurn = false;
                return;
            }

            if (!this.board.includes(null)) {
                this.isCPUTurn = false;
                return;
            }

            let move = null;

            switch (this.difficulty) {
                case 'easy':
                    move = this.getEasyMove();
                    break;
                case 'medium':
                    move = this.getMediumMove();
                    break;
                case 'hard':
                default:
                    move = this.getHardMove();
                    break;
            }

            if (move !== null) {
                this.executeMove(move);
            } else {
                // Fallback: escolhe a primeira posição vazia
                const emptyIndex = this.board.indexOf(null);
                if (emptyIndex !== -1) {
                    this.executeMove(emptyIndex);
                }
            }

            this.isCPUTurn = false;
        },

        // ===== DIFICULDADE FÁCIL (ALEATÓRIO) =====
        getEasyMove() {
            // Pega todas as posições vazias
            const emptyPositions = [];
            for (let i = 0; i < this.board.length; i++) {
                if (!this.board[i]) {
                    emptyPositions.push(i);
                }
            }

            if (emptyPositions.length === 0) return null;

            // Escolhe uma posição aleatória
            const randomIndex = Math.floor(Math.random() * emptyPositions.length);
            return emptyPositions[randomIndex];
        },

        // ===== DIFICULDADE MÉDIA (60% MINIMAX, 40% ALEATÓRIO) =====
        getMediumMove() {
            // 60% de chance de usar Minimax, 40% aleatório
            const useMinimax = Math.random() < 0.6;

            if (useMinimax) {
                return this.getBestMove(this.board, this.currentPlayer);
            } else {
                return this.getEasyMove();
            }
        },

        // ===== DIFICULDADE DIFÍCIL (MINIMAX PERFEITO) =====
        getHardMove() {
            return this.getBestMove(this.board, this.currentPlayer);
        },

        // ===== MINIMAX =====
        getBestMove(board, player) {
            let bestScore = -Infinity;
            let bestMove = null;

            for (let i = 0; i < board.length; i++) {
                if (board[i]) continue;

                const newBoard = [...board];
                newBoard[i] = player;

                const score = this.minimax(newBoard, this.getOpponent(player), false);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }

            return bestMove;
        },

        minimax(board, player, isMaximizing) {
            const winner = this.checkWinner(board);

            if (winner === 'x') return isMaximizing ? -10 : 10;
            if (winner === 'o') return isMaximizing ? -10 : 10;
            if (winner === 'draw') return 0;

            if (!board.includes(null)) return 0;

            const opponent = this.getOpponent(player);

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < board.length; i++) {
                    if (board[i]) continue;
                    const newBoard = [...board];
                    newBoard[i] = player;
                    const score = this.minimax(newBoard, opponent, false);
                    bestScore = Math.max(score, bestScore);
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < board.length; i++) {
                    if (board[i]) continue;
                    const newBoard = [...board];
                    newBoard[i] = player;
                    const score = this.minimax(newBoard, opponent, true);
                    bestScore = Math.min(score, bestScore);
                }
                return bestScore;
            }
        },

        getOpponent(player) {
            return player === 'x' ? 'o' : 'x';
        },

        // ===== FALA =====
        speakMove(player, index) {
            if (!this.narrateMoves) return;
            
            const positions = ['primeira', 'segunda', 'terceira', 'quarta', 'quinta', 'sexta', 'sétima', 'oitava', 'nona'];
            
            const symbolName = player === 'x' ? 'xis' : 'círculo';
            const pos = positions[index] || `posição ${index + 1}`;
            const text = `${symbolName} na ${pos}`;
            
            try {
                if (this.Speech && typeof this.Speech.speak === 'function') {
                    this.Speech.speak(text, { 
                        rate: 0.7, 
                        pitch: 0.8, 
                        lang: 'pt-BR' 
                    });
                }
            } catch (e) {
                // Ignora erro
            }
        },

        speakText(text) {
            if (!text) return;
            try {
                if (this.Speech && typeof this.Speech.speak === 'function') {
                    this.Speech.speak(text, { rate: 0.9, pitch: 1.0, lang: 'pt-BR' });
                } else if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'pt-BR';
                    utterance.rate = 0.9;
                    window.speechSynthesis.speak(utterance);
                }
            } catch (e) {
                console.warn('[TicTacToe] Erro na fala:', e);
            }
        },

        // ===== VERIFICAR VENCEDOR =====
        checkWinner(board = null) {
            const b = board || this.board;
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];

            for (const pattern of winPatterns) {
                const [a, bIndex, c] = pattern;
                if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) {
                    if (board === null) {
                        this.winningCells = pattern;
                    }
                    return b[a];
                }
            }

            if (!b.includes(null)) return 'draw';
            return null;
        },

        // ===== FIM DE JOGO =====
        handleGameEnd(result) {
            this.gameOver = true;
            this.winner = result;

            let message = '';
            let title = '';

            if (result === 'x' || result === 'o') {
                const symbol = result === 'x' ? '❌' : '⭕';
                this.stats[result]++;

                if (this.gameMode === 'cpu') {
                    const isPlayerWin = result === this.playerSymbol;
                    if (isPlayerWin) {
                        title = '🎉 Parabéns!';
                        message = `Você venceu!`;
                        this.speakText('Parabéns! Você venceu o jogo!');
                    } else {
                        title = '😅 Que pena!';
                        message = `A CPU venceu!`;
                        this.speakText('A CPU venceu! Tente novamente!');
                    }
                } else {
                    const playerName = result === 'x' ? 'Jogador 1' : 'Jogador 2';
                    title = '🎉 Vitória!';
                    message = `${playerName} venceu!`;
                    this.speakText(`${playerName} venceu o jogo!`);
                }
            } else {
                this.stats.draws++;
                title = '🤝 Empate!';
                message = 'O jogo empatou!';
                this.speakText('O jogo empatou!');
            }

            this.saveConfig();

            setTimeout(() => {
                this.celebration.title = title;
                this.celebration.subtitle = message;
                this.celebration.show = true;

                if (result === 'x' || result === 'o') {
                    this.generateConfetti();
                }

                setTimeout(() => {
                    this.celebration.show = false;
                }, 3000);
            }, 300);
        },

        // ===== CONFETES =====
        generateConfetti() {
            const colors = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#FF8A5C','#A29BFE'];
            const count = 50;
            const container = document.querySelector('main');
            if (!container) return;

            document.querySelectorAll('.confetti').forEach(el => el.remove());

            for (let i = 0; i < count; i++) {
                const el = document.createElement('div');
                el.className = 'confetti';
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
                    border-radius: ${isCircle ? '50%' : '2px'};
                    transform: rotate(${rotation}deg);
                    animation: confettiFall ${duration}s linear infinite;
                    animation-delay: ${delay}s;
                    pointer-events: none;
                    z-index: 9999;
                `;
                container.appendChild(el);
            }
            setTimeout(() => {
                document.querySelectorAll('.confetti').forEach(el => el.remove());
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
        get gameStatus() {
            if (this.gameOver) {
                if (this.winner === 'x') return '❌ Venceu!';
                if (this.winner === 'o') return '⭕ Venceu!';
                return '🤝 Empate!';
            }
            if (this.isCPUTurn) return '🤖 CPU pensando...';
            if (this.gameMode === 'pvp') {
                return this.currentPlayer === 'x' ? 'Vez do ❌' : 'Vez do ⭕';
            }
            return this.currentPlayer === this.playerSymbol ? 'Sua vez! 🎯' : '🤖 Vez da CPU...';
        },

        getDifficultyLabel() {
            const labels = {
                easy: '😊 Fácil',
                medium: '🤔 Médio',
                hard: '🧠 Difícil'
            };
            return labels[this.difficulty] || this.difficulty;
        }
    };
}
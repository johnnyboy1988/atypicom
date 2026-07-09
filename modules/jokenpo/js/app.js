function jokenpoApp() {
  return {
    // Estado do jogo
    player1Score: 0,
    player2Score: 0,
    cpuScore: 0,
    roundsPlayed: 0,
    result: null,
    resultMessage: '',
    
    // Escolhas
    player1Choice: null,
    player2Choice: null,
    cpuChoice: null,
    selectedChoice: null,
    selectedChoice2: null,
    
    // Estados de animação
    isWaiting: false,
    isThinking: false,
    isRevealing: false,
    isCooldown: false,
    
    // Modo de jogo
    twoPlayerMode: false,
    
    // Configurações
    clearDelay: 3000,
    minDelay: 1000,
    
    // Drag
    dragOver: false,
    isDragging: false,
    currentPlayer: 'player1',
    
    // UI
    showRules: false,
    showSettings: false,
    
    // Opções do jogo
    choices: [
      { id: 'rock', name: 'Pedra', emoji: '🪨' },
      { id: 'paper', name: 'Papel', emoji: '📄' },
      { id: 'scissors', name: 'Tesoura', emoji: '✂️' }
    ],

    // Objeto com as mensagens de vitória
    victoryMessages: {
      win: {
        'rock': 'Pedra venceu Tesoura',
        'paper': 'Papel venceu Pedra',
        'scissors': 'Tesoura venceu Papel'
      },
      lose: {
        'rock': 'Papel venceu Pedra',
        'paper': 'Tesoura venceu Papel',
        'scissors': 'Pedra venceu Tesoura'
      },
      draw: 'Jogo empatado'
    },

    headerConfig: {
      badge: 'Jogo interativo',
      title: 'Pedra, Papel e Tesoura',
      subtitle: 'Arraste sua escolha para a arena',
      showSettings: true,
      settingsContent: `
        <div class="border border-slate-200 rounded-2xl p-4 bg-white mb-3">
          <div class="text-sm font-semibold mb-3">Modo de jogo</div>
          <div class="flex gap-2">
            <button class="flex-1 rounded-xl py-2 px-3 font-semibold text-sm transition-all duration-200"
                    :class="!twoPlayerMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                    @click="twoPlayerMode = false">
              <span class="flex items-center justify-center gap-2">
                <span>🤖 vs CPU</span>
              </span>
            </button>
            <button class="flex-1 rounded-xl py-2 px-3 font-semibold text-sm transition-all duration-200"
                    :class="twoPlayerMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                    @click="twoPlayerMode = true">
              <span class="flex items-center justify-center gap-2">
                <span>👥 2 Jogadores</span>
              </span>
            </button>
          </div>
          <div class="text-xs text-slate-500 mt-2">
            <span x-show="!twoPlayerMode">🤖 Jogue contra a CPU</span>
            <span x-show="twoPlayerMode">👥 Jogue contra outro jogador localmente</span>
          </div>
        </div>
        <div class="border border-slate-200 rounded-2xl p-4 bg-white mb-3">
          <div class="text-sm font-semibold mb-3">⏱️ Tempo de exibição do resultado</div>
          <div class="flex gap-2 mb-3">
            <button class="flex-1 rounded-xl py-2 px-3 font-semibold text-sm transition-all duration-200"
                    :class="clearDelay === 3000 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                    @click="clearDelay = 3000">3s</button>
            <button class="flex-1 rounded-xl py-2 px-3 font-semibold text-sm transition-all duration-200"
                    :class="clearDelay === 5000 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                    @click="clearDelay = 5000">5s</button>
            <button class="flex-1 rounded-xl py-2 px-3 font-semibold text-sm transition-all duration-200"
                    :class="clearDelay === 7000 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                    @click="clearDelay = 7000">7s</button>
            <button class="flex-1 rounded-xl py-2 px-3 font-semibold text-sm transition-all duration-200"
                    :class="clearDelay === 10000 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                    @click="clearDelay = 10000">10s</button>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-medium text-slate-600">Personalizado:</span>
            <input type="number" 
                   x-model="clearDelay" 
                   min="1000" 
                   max="30000" 
                   step="500"
                   class="w-24 rounded-xl border border-slate-200 p-2 text-sm font-semibold text-center focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
            <span class="text-xs text-slate-500">ms</span>
          </div>
          <div class="text-xs text-slate-500 mt-2">
            <span>🔄 Resultado ficará visível por <strong x-text="(clearDelay / 1000).toFixed(0) + 's'"></strong></span>
          </div>
        </div>
        <button class="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold hover:bg-slate-50 transition"
                @click="showRules = true; settings.open = false">
          📖 Ver regras
        </button>
      `,
      buttons: [
        {
          icon: '🔄',
          title: 'Reiniciar jogo',
          action: () => this.resetGame()
        }
      ]
    },

    settings: { open: false },

    async init() {
      await loadComponents();
      
      // Inicializar SpeechService
      this.Speech = window.Speech;
      
      if (this.Speech) {
        console.log('[Jokenpo] SpeechService inicializado com sucesso!');
      } else {
        console.warn('[Jokenpo] SpeechService não disponível');
      }
      
      document.addEventListener('pointerup', this.onPointerUp.bind(this));
      document.addEventListener('pointermove', this.onPointerMove.bind(this));
      
      this.resetGame();
    },

    canPlay() {
      if (this.isThinking || this.isRevealing || this.result) return false;
      
      if (this.twoPlayerMode) {
        return !this.isCooldown || this.isWaiting;
      }
      
      return !this.isCooldown;
    },

    startDrag(event, choice, player = 'player1') {
      if (!this.canPlay()) return;
      
      this.isDragging = true;
      this.currentPlayer = player;
      
      if (player === 'player1') {
        this.selectedChoice = choice.id;
      } else {
        this.selectedChoice2 = choice.id;
      }
      
      this.dragOver = true;
      
      const clone = event.target.closest('button').cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.pointerEvents = 'none';
      clone.style.opacity = '0.8';
      clone.style.transform = 'scale(1.1)';
      clone.style.zIndex = '999';
      clone.style.width = '120px';
      clone.id = 'drag-clone';
      
      const rect = event.target.closest('button').getBoundingClientRect();
      clone.style.left = (event.clientX - rect.width / 2) + 'px';
      clone.style.top = (event.clientY - rect.height / 2) + 'px';
      
      document.body.appendChild(clone);
    },

    onPointerMove(event) {
      if (!this.isDragging) return;
      
      const clone = document.getElementById('drag-clone');
      if (clone) {
        clone.style.left = (event.clientX - 60) + 'px';
        clone.style.top = (event.clientY - 60) + 'px';
      }
      
      const dropzone = this.$refs.dropzone;
      if (dropzone) {
        const rect = dropzone.getBoundingClientRect();
        const isOver = event.clientX >= rect.left && event.clientX <= rect.right &&
                       event.clientY >= rect.top && event.clientY <= rect.bottom;
        this.dragOver = isOver;
      }
    },

    onPointerUp(event) {
      if (!this.isDragging) return;
      
      const clone = document.getElementById('drag-clone');
      if (clone) clone.remove();
      
      const dropzone = this.$refs.dropzone;
      if (dropzone) {
        const rect = dropzone.getBoundingClientRect();
        const isOver = event.clientX >= rect.left && event.clientX <= rect.right &&
                       event.clientY >= rect.top && event.clientY <= rect.bottom;
        
        if (isOver && this.canPlay()) {
          let choiceId = this.currentPlayer === 'player1' ? this.selectedChoice : this.selectedChoice2;
          const choice = this.choices.find(c => c.id === choiceId);
          
          if (choice) {
            if (this.twoPlayerMode) {
              const centerX = rect.left + rect.width / 2;
              if (event.clientX < centerX && this.currentPlayer === 'player1') {
                this.playChoice(choice, 'player1');
              } else if (event.clientX >= centerX && this.currentPlayer === 'player2') {
                this.playChoice(choice, 'player2');
              } else if (this.currentPlayer === 'player1') {
                this.playChoice(choice, 'player1');
              } else {
                this.playChoice(choice, 'player2');
              }
            } else {
              this.playChoice(choice, 'player1');
            }
          }
        }
      }
      
      this.isDragging = false;
      this.dragOver = false;
      this.selectedChoice = null;
      this.selectedChoice2 = null;
    },

    playChoice(choice, player = 'player1') {
      if (this.isDragging || !this.canPlay()) return;
      
      if (player === 'player1') {
        this.selectedChoice = choice.id;
      } else {
        this.selectedChoice2 = choice.id;
      }
      
      this.playRound(choice, player);
    },

    playRound(playerChoice, player = 'player1') {
      if (this._clearTimeout) {
        clearTimeout(this._clearTimeout);
        this._clearTimeout = null;
      }

      if (this.twoPlayerMode) {
        if (player === 'player1') {
          this.player1Choice = playerChoice;
          this.isWaiting = true;
          this.isCooldown = true;
          this.resultMessage = '⏳ Jogador 1 escolheu, aguardando Jogador 2...';
          
          if (this.player2Choice) {
            this.isWaiting = false;
            this.revealChoices();
          }
        } else {
          this.player2Choice = playerChoice;
          this.isWaiting = true;
          this.isCooldown = true;
          this.resultMessage = '⏳ Jogador 2 escolheu, aguardando Jogador 1...';
          
          if (this.player1Choice) {
            this.isWaiting = false;
            this.revealChoices();
          }
        }
        return;
      }

      // === MODO VS CPU ===
      this.isCooldown = true;
      this.player1Choice = playerChoice;
      this.cpuChoice = null;
      this.isThinking = true;
      this.isWaiting = false;
      this.result = null;
      this.resultMessage = '🤔 CPU pensando...';
      
      setTimeout(() => {
        this.cpuChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
        this.isThinking = false;
        this.isRevealing = true;
        this.resultMessage = '⚔️ Revelando...';
        
        setTimeout(() => {
          this.roundsPlayed++;
          const result = this.determineWinner(playerChoice.id, this.cpuChoice.id);
          this.applyResult(result, 'cpu', playerChoice.id, this.cpuChoice.id);
          this.isRevealing = false;
          this.isCooldown = false;
          
          this._clearTimeout = setTimeout(() => {
            this.clearArena();
          }, this.clearDelay);
        }, 400);
      }, 600 + Math.random() * 400);
    },

    revealChoices() {
      this.isRevealing = true;
      this.resultMessage = '⚔️ Revelando...';
      
      setTimeout(() => {
        this.roundsPlayed++;
        const result = this.determineWinner(this.player1Choice.id, this.player2Choice.id);
        this.applyResult(result, 'player2', this.player1Choice.id, this.player2Choice.id);
        
        this.isRevealing = false;
        this.isWaiting = false;
        this.isCooldown = false;
        
        this._clearTimeout = setTimeout(() => {
          this.clearArena();
        }, this.clearDelay);
      }, 500);
    },

    // ========== Aplicar resultado com fala ==========
    applyResult(result, opponent, playerId, opponentId) {
      let message = '';
      let speechText = '';
      
      if (result === 'win') {
        this.player1Score++;
        this.result = 'win';
        
        const victoryMessage = this.victoryMessages.win[playerId] || 'Você venceu!';
        message = `🎉 ${victoryMessage}`;
        speechText = `${victoryMessage}`;
        
      } else if (result === 'lose') {
        if (opponent === 'cpu') {
          this.cpuScore++;
        } else {
          this.player2Score++;
        }
        this.result = 'lose';
        
        const loseMessage = this.victoryMessages.lose[playerId] || 'Oponente venceu!';
        message = `😅 ${loseMessage}`;
        speechText = `${loseMessage}`;
        
      } else {
        this.result = 'draw';
        message = '🤝 Jogo empatado!';
        speechText = 'Jogo empatado!';
      }
      
      this.resultMessage = message;
      
      // Falar o resultado
      this.speakResult(speechText);
    },

    // ========== Função de fala ==========
    speakResult(text) {
      console.log('[Jokenpo] Falando:', text);
      
      if (!text || text.trim() === '') {
        console.warn('[Jokenpo] Texto vazio, ignorando fala');
        return;
      }
      
      // Tentar usar o SpeechService primeiro
      if (this.Speech && typeof this.Speech.speak === 'function') {
        try {
          this.Speech.speak(text, { 
            rate: 0.85, 
            pitch: 1.0,
            lang: 'pt-BR'
          });
          console.log('[Jokenpo] Fala enviada via SpeechService');
          return;
        } catch (e) {
          console.warn('[Jokenpo] SpeechService falhou:', e);
        }
      }
      
      // Fallback: usar SpeechSynthesis diretamente
      if (window.speechSynthesis) {
        try {
          // Cancela qualquer fala anterior
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'pt-BR';
          utterance.rate = 0.85;
          utterance.pitch = 1.0;
          utterance.volume = 1;
          
          utterance.onend = () => {
            console.log('[Jokenpo] Fala concluída (fallback)');
          };
          
          utterance.onerror = (e) => {
            console.warn('[Jokenpo] Erro na fala (fallback):', e);
          };
          
          window.speechSynthesis.speak(utterance);
          console.log('[Jokenpo] Fala enviada via fallback');
        } catch (e) {
          console.warn('[Jokenpo] Fallback também falhou:', e);
        }
      } else {
        console.warn('[Jokenpo] SpeechSynthesis não disponível');
      }
    },

    determineWinner(player, opponent) {
      if (player === opponent) return 'draw';
      const rules = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
      };
      return rules[player] === opponent ? 'win' : 'lose';
    },

    clearArena() {
      this.isCooldown = true;
      
      this.player1Choice = null;
      this.player2Choice = null;
      this.cpuChoice = null;
      this.selectedChoice = null;
      this.selectedChoice2 = null;
      this.result = null;
      this.resultMessage = '';
      this.isThinking = false;
      this.isWaiting = false;
      this.isRevealing = false;
      
      if (this._clearTimeout) {
        clearTimeout(this._clearTimeout);
        this._clearTimeout = null;
      }
      
      setTimeout(() => {
        this.isCooldown = false;
      }, this.minDelay);
    },

    resetGame() {
    this.isCooldown = true;
    
    // Garantir que as escolhas estejam vazias
    this.player1Choice = null;
    this.player2Choice = null;
    this.cpuChoice = null;
    this.selectedChoice = null;
    this.selectedChoice2 = null;
    
    this.clearArena();
    this.player1Score = 0;
    this.player2Score = 0;
    this.cpuScore = 0;
    this.roundsPlayed = 0;
    this.clearDelay = 3000;
    
    setTimeout(() => {
        this.isCooldown = false;
    }, this.minDelay);
    },

    formatDelay(ms) {
      return (ms / 1000).toFixed(0) + 's';
    }
  };
}
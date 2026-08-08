function jokenpoApp() {
  return {
    player1Score: 0,
    player2Score: 0,
    cpuScore: 0,
    ties: 0,
    roundsPlayed: 0,
    totalGames: 0,
    
    result: null,
    resultMessage: "",
    
    player1Choice: null,
    player2Choice: null,
    cpuChoice: null,
    selectedChoice: null,
    selectedChoice2: null,
    bothPlayersChosen: false,
    
    isWaiting: false,
    isThinking: false,
    isRevealing: false,
    isCooldown: false,
    
    twoPlayerMode: false,
    useHandIcons: false,
    clearDelay: 3000,
    showRules: false,
    showSettings: false,
    minDelay: 1000,
    _clearTimeout: null,

    _toastShow: false,
    _toastMessage: "",
    _toastTimeout: null,

    choices: [
      { id: "rock", name: "Pedra", emoji: "🪨", handEmoji: "✊" },
      { id: "paper", name: "Papel", emoji: "📄", handEmoji: "✋" },
      { id: "scissors", name: "Tesoura", emoji: "✂️", handEmoji: "✌️" },
    ],

    victoryMessages: {
      win: {
        rock: "Pedra venceu Tesoura",
        paper: "Papel venceu Pedra",
        scissors: "Tesoura venceu Papel",
      },
      lose: {
        rock: "Papel venceu Pedra",
        paper: "Tesoura venceu Papel",
        scissors: "Pedra venceu Tesoura",
      },
    },

    drawMessages: {
      rock: "🪨 Pedra empatou com Pedra!",
      paper: "📄 Papel empatou com Papel!",
      scissors: "✂️ Tesoura empatou com Tesoura!",
    },

    getChoiceEmoji(choice) {
      if (!choice) return "❓";
      return this.useHandIcons ? choice.handEmoji : choice.emoji;
    },

    getPlayer1Emoji() {
      return this.getChoiceEmoji(this.player1Choice);
    },

    getPlayer2Emoji() {
      return this.getChoiceEmoji(this.player2Choice);
    },

    getCpuEmoji() {
      return this.getChoiceEmoji(this.cpuChoice);
    },

    getDrawMessage(choiceId) {
      return this.drawMessages[choiceId] || "🤝 Jogo empatado!";
    },

    async init() {
      console.log("=== INICIANDO JOKENPÔ ===");
      
      await loadComponents();
      await this.$nextTick();

      this.Speech = window.Speech;

      this.loadConfig();

      this.showRules = false;
      this.showSettings = false;

      if (this.Speech) {
        console.log("[Jokenpo] SpeechService inicializado com sucesso!");
      } else {
        console.warn("[Jokenpo] SpeechService não disponível");
      }

      window.__jokenpoApp = this;
      
      console.log("Jokenpô inicializado com sucesso!");
    },

    loadConfig() {
      try {
        const config = JokenpoConfig.load();
        this.twoPlayerMode = config.twoPlayerMode || false;
        this.useHandIcons = config.useHandIcons || false;
        this.clearDelay = config.clearDelay || 3000;
        this.player1Score = config.player1Score || 0;
        this.player2Score = config.player2Score || 0;
        this.cpuScore = config.cpuScore || 0;
        this.ties = config.ties || 0;
        this.roundsPlayed = config.totalGames || 0;
        this.totalGames = config.totalGames || 0;
        this.showRules = false;
        this.showSettings = false;
      } catch (e) {
        console.warn("Erro ao carregar configurações:", e);
        this.showRules = false;
        this.showSettings = false;
      }
    },

    saveConfig() {
      try {
        const config = {
          twoPlayerMode: this.twoPlayerMode,
          useHandIcons: this.useHandIcons,
          clearDelay: this.clearDelay,
          player1Score: this.player1Score,
          player2Score: this.player2Score,
          cpuScore: this.cpuScore,
          ties: this.ties,
          totalGames: this.roundsPlayed,
          showRules: false,
          showSettings: false
        };
        JokenpoConfig.save(config);
      } catch (e) {
        console.warn("Erro ao salvar configurações:", e);
      }
    },

    setMode(twoPlayer) {
      this.twoPlayerMode = twoPlayer;
      this.saveConfig();
      this.resetGame();
    },

    setIconStyle(useHands) {
      this.useHandIcons = useHands;
      this.saveConfig();
    },

    setDelay(delay) {
      this.clearDelay = delay;
      this.saveConfig();
    },

    resetGame() {
      this.isCooldown = true;
      this.clearArena();
      this.player1Score = 0;
      this.player2Score = 0;
      this.cpuScore = 0;
      this.ties = 0;
      this.roundsPlayed = 0;
      this.totalGames = 0;
      this.saveConfig();
      
      setTimeout(() => {
        this.isCooldown = false;
      }, this.minDelay);
      
      this.showToast('🔄 Placar resetado!');
    },

    canPlay() {
      if (this.isThinking || this.isRevealing || this.result) return false;
      
      if (this.twoPlayerMode) {
        return !this.isCooldown || this.isWaiting;
      }
      
      return !this.isCooldown;
    },

    playChoice(choice, player = "player1") {
      if (!this.canPlay()) return;

      if (player === "player1") {
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
      this.player1Choice = null;
      this.cpuChoice = null;
      this.isThinking = true;
      this.isWaiting = false;
      this.result = null;
      this.resultMessage = '🤔 CPU pensando...';
      
      const playerChoiceId = playerChoice.id;
      
      setTimeout(() => {
        const cpuChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
        
        this.player1Choice = playerChoice;
        this.cpuChoice = cpuChoice;
        this.isThinking = false;
        this.isRevealing = true;
        this.resultMessage = '⚔️ Revelando...';
        
        setTimeout(() => {
          this.roundsPlayed++;
          this.totalGames++;
          const result = this.determineWinner(playerChoiceId, cpuChoice.id);
          this.applyResult(result, 'cpu', playerChoiceId, cpuChoice.id);
          this.isRevealing = false;
          this.isCooldown = false;
          this.saveConfig();
          
          this._clearTimeout = setTimeout(() => {
            this.clearArena();
          }, this.clearDelay);
        }, 400);
      }, 600 + Math.random() * 400);
    },

    revealChoices() {
      this.isRevealing = true;
      this.resultMessage = "⚔️ Revelando...";

      setTimeout(() => {
        this.roundsPlayed++;
        this.totalGames++;
        const result = this.determineWinner(
          this.player1Choice.id,
          this.player2Choice.id,
        );
        this.applyResult(
          result,
          "player2",
          this.player1Choice.id,
          this.player2Choice.id,
        );

        this.isRevealing = false;
        this.isWaiting = false;
        this.isCooldown = false;
        this.saveConfig();

        this._clearTimeout = setTimeout(() => {
          this.clearArena();
        }, this.clearDelay);
      }, 500);
    },

    // ===== APLICAR RESULTADO (COM MENSAGENS DE EMPATE MELHORADAS) =====
    applyResult(result, opponent, playerId, opponentId) {
      let message = "";
      let speechText = "";

      if (result === "win") {
        this.player1Score++;
        this.result = "win";
        const victoryMessage = this.victoryMessages.win[playerId] || "Você venceu!";
        message = `🎉 ${victoryMessage}`;
        speechText = `${victoryMessage}`;
      } else if (result === "lose") {
        if (opponent === "cpu") {
          this.cpuScore++;
        } else {
          this.player2Score++;
        }
        this.result = "lose";
        const loseMessage = this.victoryMessages.lose[playerId] || "Oponente venceu!";
        message = `😅 ${loseMessage}`;
        speechText = `${loseMessage}`;
      } else {
        this.ties++;
        this.result = "draw";
        message = this.getDrawMessage(playerId);
        speechText = message.replace(/[🪨📄✂️]/g, '').trim();
      }

      this.resultMessage = message;
      this.saveConfig();
      this.speakResult(speechText);
    },

    determineWinner(player, opponent) {
      if (player === opponent) return "draw";
      const rules = {
        rock: "scissors",
        paper: "rock",
        scissors: "paper",
      };
      return rules[player] === opponent ? "win" : "lose";
    },

    clearArena() {
      this.isCooldown = true;
      this.player1Choice = null;
      this.player2Choice = null;
      this.cpuChoice = null;
      this.selectedChoice = null;
      this.selectedChoice2 = null;
      this.result = null;
      this.resultMessage = "";
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

    speakResult(text) {
      console.log("[Jokenpo] Falando:", text);

      if (!text || text.trim() === "") {
        console.warn("[Jokenpo] Texto vazio, ignorando fala");
        return;
      }

      if (this.Speech && typeof this.Speech.speak === "function") {
        try {
          this.Speech.speak(text, {
            rate: 0.85,
            pitch: 1.0,
            lang: "pt-BR",
          });
          console.log("[Jokenpo] Fala enviada via SpeechService");
          return;
        } catch (e) {
          console.warn("[Jokenpo] SpeechService falhou:", e);
        }
      }

      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "pt-BR";
          utterance.rate = 0.85;
          utterance.pitch = 1.0;
          utterance.volume = 1;
          window.speechSynthesis.speak(utterance);
          console.log("[Jokenpo] Fala enviada via fallback");
        } catch (e) {
          console.warn("[Jokenpo] Fallback também falhou:", e);
        }
      } else {
        console.warn("[Jokenpo] SpeechSynthesis não disponível");
      }
    },

    showToast(message) {
      if (this._toastTimeout) clearTimeout(this._toastTimeout);
      this._toastMessage = message;
      this._toastShow = true;
      this._toastTimeout = setTimeout(() => {
        this._toastShow = false;
      }, 2000);
    },

    formatDelay(ms) {
      return (ms / 1000).toFixed(0) + "s";
    },
  };
}
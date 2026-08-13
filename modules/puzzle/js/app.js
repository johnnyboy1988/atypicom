// app.js – Quebra-Cabeças (Jigsaw Puzzle)
function puzzleApp() {
  return {
    // Configurações
    gridSize: 4,
    currentImageIndex: 0,
    showPieceNumbers: true,
    randomizeOnReset: true,
    interactionMode: 'drag',
    selectedPieceIndex: null,

    // ===== IMAGENS DISPONÍVEIS =====
    imageOptions: [
      // Animais
      "https://picsum.photos/seed/puzzle_animal1/400/400",
      "https://picsum.photos/seed/puzzle_animal2/400/400",
      "https://picsum.photos/seed/puzzle_animal3/400/400",
      "https://picsum.photos/seed/puzzle_animal4/400/400",
      // Natureza
      "https://picsum.photos/seed/puzzle_nature1/400/400",
      "https://picsum.photos/seed/puzzle_nature2/400/400",
      "https://picsum.photos/seed/puzzle_nature3/400/400",
      "https://picsum.photos/seed/puzzle_nature4/400/400",
      // Cidade
      "https://picsum.photos/seed/puzzle_city1/400/400",
      "https://picsum.photos/seed/puzzle_city2/400/400",
      "https://picsum.photos/seed/puzzle_city3/400/400",
      // Comida
      "https://picsum.photos/seed/puzzle_food1/400/400",
      "https://picsum.photos/seed/puzzle_food2/400/400",
      "https://picsum.photos/seed/puzzle_food3/400/400",
      // Cores/Arte
      "https://picsum.photos/seed/puzzle_art1/400/400",
      "https://picsum.photos/seed/puzzle_art2/400/400",
      "https://picsum.photos/seed/puzzle_art3/400/400",
      // Esportes
      "https://picsum.photos/seed/puzzle_sport1/400/400",
      "https://picsum.photos/seed/puzzle_sport2/400/400",
      // Aleatórios
      "https://picsum.photos/seed/puzzle_rand1/400/400",
      "https://picsum.photos/seed/puzzle_rand2/400/400",
      "https://picsum.photos/seed/puzzle_rand3/400/400",
      "https://picsum.photos/seed/puzzle_rand4/400/400",
      "https://picsum.photos/seed/puzzle_rand5/400/400",
    ],

    // ===== FRASES DE ERRO =====
    errorMessages: [
      "Tente novamente!",
      "Não encaixou!",
      "Quase!",
      "Ops!",
      "Não é aqui!",
      "Tenta de novo!",
      "Ups!",
      "Errou! Tente outra vez!",
      "Não foi dessa vez!",
      "Quase lá!",
      "Tenta mais uma vez!",
    ],

    // Estado do jogo
    shuffledPieces: [],
    gridPieces: [],
    dragPieceIndex: null,
    dragOver: false,
    placedPieces: 0,
    isComplete: false,
    imageLoaded: false,

    // UI
    showSettings: false,

    // Speech
    Speech: null,

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

    // ===== INIT =====
    async init() {
      console.log("=== INICIANDO QUEBRA-CABEÇAS ===");

      if (typeof loadComponents === "function") {
        await loadComponents();
      }

      this.Speech = window.Speech || null;

      if (this.Speech) {
        console.log("[Puzzle] SpeechService disponível");
      }

      this.loadConfig();

      if (this.randomizeOnReset) {
        this.currentImageIndex = this.getRandomImageIndex();
      }

      await this.preloadImage(this.currentImage);
      this.initPuzzle();

      window.addEventListener("resize", () => {
        if (this.gridPieces) {
          this.$forceUpdate();
        }
      });

      console.log("Quebra-Cabeças inicializado com sucesso!");
      console.log(
        `Imagem selecionada: ${this.currentImageIndex + 1}/${this.imageOptions.length}`
      );
    },

    // ===== UTILITÁRIOS =====
    getRandomImageIndex() {
      return Math.floor(Math.random() * this.imageOptions.length);
    },

    getRandomImage() {
      const idx = this.getRandomImageIndex();
      return {
        index: idx,
        url: this.imageOptions[idx],
      };
    },

    // ===== PRÉ-CARREGAR IMAGEM =====
    preloadImage(src) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.imageLoaded = true;
          this.imageNaturalWidth = img.naturalWidth;
          this.imageNaturalHeight = img.naturalHeight;
          resolve();
        };
        img.onerror = () => {
          console.warn("[Puzzle] Erro ao carregar imagem:", src);
          this.imageLoaded = true;
          resolve();
        };
        img.src = src;
      });
    },

    // ===== CONFIGURAÇÕES - CARREGAR =====
    loadConfig() {
      try {
        const saved = localStorage.getItem("puzzle_config");
        
        if (saved) {
          const config = JSON.parse(saved);
          this.gridSize = config.gridSize || 4;
          this.currentImageIndex = config.imageIndex || 0;
          this.showPieceNumbers = config.showPieceNumbers !== undefined ? config.showPieceNumbers : true;
          this.randomizeOnReset = config.randomizeOnReset !== undefined ? config.randomizeOnReset : true;
          this.interactionMode = config.interactionMode || 'drag';
          
        } else {
          console.log("[Puzzle] Nenhuma configuração salva, usando padrões");
        }
      } catch (e) {
        console.warn("[Puzzle] Erro ao carregar configurações:", e);
      }
    },

    // ===== CONFIGURAÇÕES - SALVAR =====
    saveConfig() {
      try {
        const config = {
          gridSize: this.gridSize,
          imageIndex: this.currentImageIndex,
          showPieceNumbers: this.showPieceNumbers,
          randomizeOnReset: this.randomizeOnReset,
          interactionMode: this.interactionMode,
          savedAt: new Date().toISOString(),
        };
        
        localStorage.setItem("puzzle_config", JSON.stringify(config));
      } catch (e) {
        console.warn("[Puzzle] Erro ao salvar configurações:", e);
      }
    },

    // ===== MÉTODOS QUE SALVAM CONFIGURAÇÕES =====
    setGridSize(size) {
      this.gridSize = size;
      this.saveConfig();
      this.initPuzzle();
      this.showToast(`📐 Grid ${size}×${size}`);
    },

    selectImage(index) {
      this.currentImageIndex = index;
      this.saveConfig();
      this.preloadImage(this.currentImage).then(() => {
        this.initPuzzle();
        this.showToast("🖼️ Imagem alterada!");
      });
    },

    togglePieceNumbers() {
      this.showPieceNumbers = !this.showPieceNumbers;
      this.saveConfig();
      this.showToast(
        this.showPieceNumbers ? "🔢 Números visíveis" : "🔢 Números ocultos"
      );
    },

    toggleRandomizeOnReset() {
      this.randomizeOnReset = !this.randomizeOnReset;
      this.saveConfig();
      this.showToast(
        this.randomizeOnReset
          ? "🎲 Randomizar ao reiniciar: ATIVADO"
          : "🎲 Randomizar ao reiniciar: DESATIVADO"
      );
    },

    toggleInteractionMode(mode) {
      console.log("[Puzzle] Alternando modo para:", mode);
      this.interactionMode = mode;
      this.selectedPieceIndex = null;
      this.saveConfig();
      
      const message = mode === 'drag' 
        ? '🖱️ Modo Arrastar ativado' 
        : '👆 Modo Clique ativado - Clique na peça e no destino';
      
      this.showToast(message);
    },

    handlePieceClick(index) {
      if (this.interactionMode !== 'click') return;
      if (this.shuffledPieces[index].placed) return;
      if (this.isComplete) return;

      if (this.selectedPieceIndex === index) {
        this.selectedPieceIndex = null;
        return;
      }

      this.selectedPieceIndex = index;
    },

    handleSlotClick(slotIndex) {
      if (this.interactionMode !== 'click') return;
      if (this.selectedPieceIndex === null) return;
      if (this.isComplete) return;

      const piece = this.shuffledPieces[this.selectedPieceIndex];
      if (!piece || piece.placed) {
        this.selectedPieceIndex = null;
        return;
      }

      if (this.gridPieces[slotIndex]) {
        this.showToast('⚠️ Este espaço já está ocupado!');
        this.selectedPieceIndex = null;
        return;
      }

      if (piece.index === slotIndex) {
        this.placePiece(this.selectedPieceIndex, slotIndex);
        this.selectedPieceIndex = null;
      } else {
        this.speakError();
        this.showToast('❌ Peça incorreta! Tente outra.');
        
        setTimeout(() => {
          const slotEl = document.querySelector(`[data-slot-index="${slotIndex}"] .slot-empty`);
          if (slotEl) {
            slotEl.classList.add('shake');
            setTimeout(() => {
              slotEl.classList.remove('shake');
            }, 500);
          }
        }, 50);
        
        this.selectedPieceIndex = null;
      }
    },

    // ===== INICIALIZAR QUEBRA-CABEÇAS =====
    initPuzzle() {
      const total = this.gridSize * this.gridSize;
      this.gridPieces = Array(total).fill(null);
      this.placedPieces = 0;
      this.isComplete = false;
      this.celebration.show = false;
      this.dragPieceIndex = null;
      this.selectedPieceIndex = null;

      const pieces = [];
      for (let i = 0; i < total; i++) {
        const row = Math.floor(i / this.gridSize);
        const col = i % this.gridSize;
        pieces.push({
          index: i,
          row: row,
          col: col,
          image: this.currentImage,
          bgPositionX: (col / (this.gridSize - 1)) * 100,
          bgPositionY: (row / (this.gridSize - 1)) * 100,
          bgSize: this.gridSize * 100,
          placed: false,
        });
      }

      this.shuffledPieces = this.shuffleArray([...pieces]);
      this.dragOver = false;

    },

    resetPuzzle() {

      if (this.randomizeOnReset) {
        let newIndex;
        if (this.imageOptions.length > 1) {
          let attempts = 0;
          do {
            newIndex = this.getRandomImageIndex();
            attempts++;
            if (attempts > 50) break;
          } while (
            newIndex === this.currentImageIndex &&
            this.imageOptions.length > 1
          );
        } else {
          newIndex = 0;
        }

        this.currentImageIndex = newIndex;
        this.saveConfig();

        this.preloadImage(this.currentImage).then(() => {
          this.initPuzzle();
          this.showToast("🔄 Nova imagem carregada!");
        });
      } else {
        this.initPuzzle();
        this.showToast("🔄 Quebra-cabeças reiniciado!");
      }
    },

    // ===== SHUFFLE =====
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },

    // ===== FALA =====
    speakPiecePlaced(piece) {
      if (!this.Speech) return;
      try {
        const texts = ["peça encaixada!", "boa!", "certo!", "perfeito!"];
        const text = texts[Math.floor(Math.random() * texts.length)];
        this.Speech.speak(text, { rate: 0.8, pitch: 1.0, lang: "pt-BR" });
      } catch (e) {
        /* ignora */
      }
    },

    speakError() {
      if (!this.Speech) return;
      try {
        const text = this.errorMessages[Math.floor(Math.random() * this.errorMessages.length)];
        this.Speech.speak(text, {
          rate: 0.8,
          pitch: 0.9,
          lang: "pt-BR",
        });
      } catch (e) {
        /* ignora */
      }
    },

    speakComplete() {
      if (!this.Speech) return;
      try {
        this.Speech.speak("Parabéns! Você completou o quebra-cabeças!", {
          rate: 0.9,
          pitch: 1.0,
          lang: "pt-BR",
        });
      } catch (e) {
        /* ignora */
      }
    },

    // ===== DRAG & DROP =====
    handleDragStart(event, index) {
      if (this.interactionMode === 'click') {
        event.preventDefault();
        return;
      }
      
      this.dragPieceIndex = index;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", index.toString());
      setTimeout(() => {
        event.target.classList.add("dragging");
      }, 0);
    },

    handleDragEnd(event) {
      event.target.classList.remove("dragging");
      this.dragPieceIndex = null;
    },

    handleDragOver(event) {
      if (this.interactionMode === 'click') return;
      this.dragOver = true;
    },

    handleDragLeave(event) {
      this.dragOver = false;
    },

    handleDrop(event) {
      if (this.interactionMode === 'click') return;
      
      this.dragOver = false;

      const dragIndex = parseInt(event.dataTransfer.getData("text/plain"));
      if (isNaN(dragIndex)) return;

      const piece = this.shuffledPieces[dragIndex];
      if (piece.placed) return;

      const target = event.target.closest(".drop-zone");
      if (!target) return;

      let gridOverlay = target.querySelector(".grid-overlay");
      if (!gridOverlay) {
        const inner = target.querySelector(".puzzle-stage-inner");
        if (inner) {
          gridOverlay = inner.querySelector(".grid-overlay");
        }
      }

      if (!gridOverlay) {
        console.warn("Grid overlay não encontrado");
        this.showToast("⚠️ Erro: grid não encontrado");
        return;
      }

      const rect = gridOverlay.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        this.showToast("❌ Solte a peça dentro do grid!");
        return;
      }

      const col = Math.floor((x / rect.width) * this.gridSize);
      const row = Math.floor((y / rect.height) * this.gridSize);

      const gridCol = Math.min(Math.max(col, 0), this.gridSize - 1);
      const gridRow = Math.min(Math.max(row, 0), this.gridSize - 1);

      const correctIndex = piece.index;
      const targetIndex = gridRow * this.gridSize + gridCol;

      if (this.gridPieces[targetIndex]) {
        this.showToast("⚠️ Este espaço já está ocupado!");
        return;
      }

      if (correctIndex === targetIndex) {
        this.placePiece(dragIndex, targetIndex);
      } else {
        this.speakError();
        this.showToast("❌ Posição incorreta! Tente novamente.");
        const pieces = document.querySelectorAll(".puzzle-piece");
        pieces.forEach((p) => (p.style.animation = "shake 0.3s ease"));
        setTimeout(() => {
          pieces.forEach((p) => (p.style.animation = ""));
        }, 300);
      }
    },

    placePiece(dragIndex, gridIndex) {
      const piece = this.shuffledPieces[dragIndex];

      this.gridPieces[gridIndex] = {
        ...piece,
        placed: true,
      };
      piece.placed = true;
      this.placedPieces++;

      this.speakPiecePlaced(piece);

      if (this.placedPieces === this.totalPieces) {
        this.completePuzzle();
      }

      this.$forceUpdate();
    },

    // ===== COMPLETAR =====
    completePuzzle() {
      this.isComplete = true;
      this.speakComplete();

      this.celebration.title = "🧩 Parabéns!";
      this.celebration.subtitle = `Você completou o quebra-cabeças ${this.gridSize}×${this.gridSize}!`;
      this.celebration.show = true;

      this.generateConfetti();

      setTimeout(() => {
        this.celebration.show = false;
      }, 4000);
    },

    // ===== CONFETES =====
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
      const count = 60;
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
      }, 2500);
    },

    // ===== COMPUTED =====
    get currentImage() {
      return this.imageOptions[this.currentImageIndex] || this.imageOptions[0];
    },

    get totalPieces() {
      return this.gridSize * this.gridSize;
    },

    // ===== ESTILO DA PEÇA =====
    getPieceStyle(piece) {
      if (!piece) return {};
      const gridSize = this.gridSize;
      const bgSize = gridSize * 100;

      return {
        backgroundImage: `url(${this.currentImage})`,
        backgroundSize: `${bgSize}%`,
        backgroundPosition: `${piece.bgPositionX}% ${piece.bgPositionY}%`,
        backgroundRepeat: "no-repeat",
        borderRadius: "0.5rem",
        width: "100%",
        height: "100%",
      };
    },

    // ===== FORÇAR ATUALIZAÇÃO =====
    $forceUpdate() {
      if (this.$el) {
        this.$el.dispatchEvent(new CustomEvent('alpine:updated'));
      }
    },

    // ===== MÉTODO PARA DEBUG =====
    debugConfig() {
      console.log("=== DEBUG CONFIGURAÇÕES ===");
      console.log("Configurações atuais:", {
        gridSize: this.gridSize,
        currentImageIndex: this.currentImageIndex,
        showPieceNumbers: this.showPieceNumbers,
        randomizeOnReset: this.randomizeOnReset,
        interactionMode: this.interactionMode,
      });
      console.log("localStorage:", localStorage.getItem("puzzle_config"));
      console.log("=== FIM DEBUG ===");
    }
  };
}
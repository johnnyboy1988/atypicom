// app.js - Memory Game
function memoryApp() {
  return {
    cards: [],
    visibleCards: [],
    settings: {
      open: false,
      categories: [],
      tags: [],
      gridSize: 4,
      mode: "image-text",
      useCategoryColors: true,
    },
    celebration: {
      show: false,
      title: "",
      subtitle: "",
    },
    stats: {
      totalPairs: 0,
      foundPairs: 0,
      time: "00:00",
      attempts: 0,
    },

    gameStatus: {
      title: "",
      subtitle: "",
    },

    categories: [],
    tags: [],
    activeCollection: null,

    // engine do jogo (classe)
    game: null,

    async init() {
      console.log("=== INICIANDO MEMORY GAME ===");
      
      await loadComponents();
      await this.$nextTick();

      // Carrega a coleção
      this.activeCollection = window.AACStore || null;

      // Extrai dados da coleção
      const collectionData = this.extractCollectionData();
      this.categories = collectionData.categories || [];
      this.tags = collectionData.tags || [];
      this.cards = collectionData.cards || [];

      // ===== CARREGA CONFIGURAÇÕES SALVAS =====
      if (window.MemoryConfig) {
        const savedSettings = window.MemoryConfig.load();
        // Mantém as configurações salvas, mas preserva o gridSize
        this.settings = { 
          ...this.settings, 
          ...savedSettings,
          // Garante que gridSize seja um número
          gridSize: Number(savedSettings.gridSize) || 4
        };
        console.log("Configurações carregadas:", this.settings);
      }

      // Inicializa configurações padrão se estiverem vazias
      this.initSettings();

      // Cria a engine do jogo
      this.game = new MemoryGame(this);

      // Reseta o estado do jogo
      this.resetGameState();

      console.log("Memory Game inicializado com sucesso!");
      console.log("Cards carregados:", this.cards.length);
    },

    // ===== INICIALIZAR CONFIGURAÇÕES =====
    initSettings() {
      // Se não houver categorias selecionadas e houver categorias disponíveis
      if (this.settings.categories.length === 0 && this.categories.length > 0) {
        this.settings.categories = this.categories.map(c => c.name);
        if (window.MemoryConfig) {
          window.MemoryConfig.save(this.settings);
        }
      }
      
      // Se não houver tags selecionadas e houver tags disponíveis
      if (this.settings.tags.length === 0 && this.tags.length > 0) {
        this.settings.tags = this.tags.map(t => typeof t === 'string' ? t : t.name);
        if (window.MemoryConfig) {
          window.MemoryConfig.save(this.settings);
        }
      }
    },

    // ===== MÉTODOS DE CONFIGURAÇÃO =====
    toggleSettingCategory(categoryName) {
      if (window.MemoryConfig) {
        window.MemoryConfig.toggleCategory(this.settings, categoryName);
      } else {
        const index = this.settings.categories.indexOf(categoryName);
        if (index >= 0) {
          this.settings.categories.splice(index, 1);
        } else {
          this.settings.categories.push(categoryName);
        }
      }
    },

    toggleSettingTag(tagName) {
      if (window.MemoryConfig) {
        window.MemoryConfig.toggleTag(this.settings, tagName);
      } else {
        const index = this.settings.tags.indexOf(tagName);
        if (index >= 0) {
          this.settings.tags.splice(index, 1);
        } else {
          this.settings.tags.push(tagName);
        }
      }
    },

    resetSettings() {
      if (window.MemoryConfig) {
        this.settings = window.MemoryConfig.reset();
      } else {
        this.settings = {
          open: false,
          categories: [],
          tags: [],
          gridSize: 4,
          mode: "image-text",
          useCategoryColors: true,
        };
      }
      this.initSettings();
      this.showToast('Configurações resetadas!');
    },

    extractCollectionData() {
      const collection = this.activeCollection;

      if (!collection) {
        console.warn("[Memory] Nenhuma coleção ativa encontrada");
        return { categories: [], tags: [], cards: [] };
      }

      const categories = collection.categories || [];

      let tags = [];

      if (collection.tags && collection.tags.length > 0) {
        tags = collection.tags;
      } else {
        const tagSet = new Set();
        collection.cards.forEach((card) => {
          if (card.tags && Array.isArray(card.tags)) {
            card.tags.forEach((tag) => tagSet.add(tag));
          }
        });

        if (tagSet.size > 0) {
          tags = Array.from(tagSet);
        } else {
          tags = categories.map((cat) => cat.name);
        }
      }

      const cards = collection.cards || [];

      return { categories, tags, cards };
    },

    getCategoryWithColor(categoryName) {
      const category = this.categories.find((cat) => cat.name === categoryName);
      return category || { name: categoryName, color: "#CCCCCC" };
    },

    getColorForCategory(categoryName) {
      const category = this.getCategoryWithColor(categoryName);
      return category.color;
    },

    getCardsWithColors() {
      return this.cards.map((card) => ({
        ...card,
        color: this.getColorForCategory(card.category),
      }));
    },

    getCardsByCategory() {
      const grouped = {};

      this.cards.forEach((card) => {
        if (!grouped[card.category]) {
          grouped[card.category] = [];
        }
        grouped[card.category].push(card);
      });

      return grouped;
    },

    getCardsByTag(tagName) {
      return this.cards.filter(
        (card) => card.tags && card.tags.includes(tagName),
      );
    },

    getCardsByCategoryName(categoryName) {
      return this.cards.filter((card) => card.category === categoryName);
    },

    // ===== FUNÇÃO DE FILTRO =====
    applyFilters(collection, settings) {
      const { categories, tags } = settings;
      
      if (!collection || collection.length === 0) {
        return [];
      }

      if (categories.length === 0 && tags.length === 0) {
        return collection;
      }

      return collection.filter((card) => {
        const categoryMatch = categories.length === 0 || categories.includes(card.category);
        const tagMatch = tags.length === 0 || (card.tags || []).some(tag => tags.includes(tag));
        return categoryMatch && tagMatch;
      });
    },

    // =========================
    // GAME CONTROL
    // =========================
    startGameFromSettings() {
      console.log("=== INICIANDO JOGO ===");
      console.log("GridSize selecionado:", this.settings.gridSize);
      
      try {
        const collection = this.activeCollection?.cards || [];

        if (collection.length === 0) {
          this.showToast('Nenhum card disponível!');
          return;
        }

        // Aplica filtros
        const filtered = this.applyFilters(collection, this.settings);

        if (filtered.length === 0) {
          this.showToast('Nenhum card encontrado com os filtros selecionados!');
          return;
        }

        // Constrói o jogo - PASSA O GRIDSIZE CORRETAMENTE
        const result = this.game.build(filtered, this.settings);

        if (!result || result.cards.length === 0) {
          this.showToast('Não foi possível criar o jogo!');
          return;
        }

        this.cards = result.cards;
        this.visibleCards = [...result.cards];

        this.stats.totalPairs = result.pairs ? result.pairs.length : Math.floor(result.cards.length / 2);
        this.stats.foundPairs = 0;
        this.stats.attempts = 0;
        this.stats.time = "00:00";

        this.gameStatus.title = "Jogo iniciado";
        this.gameStatus.subtitle = `${this.stats.totalPairs} pares`;

        this.settings.open = false;
        
        if (window.MemoryConfig) {
          window.MemoryConfig.save(this.settings);
        }

        this.showToast(`🎮 Jogo iniciado com ${this.stats.totalPairs} pares em grid ${this.settings.gridSize}x${this.settings.gridSize}!`);
        console.log("Jogo iniciado com grid:", this.settings.gridSize);
      } catch (error) {
        console.error("Erro ao iniciar jogo:", error);
        this.showToast('Erro ao iniciar o jogo!');
      }
    },

    getCategoryColor(categoryName) {
      return (
        this.categories.find((c) => c.name === categoryName)?.color || "#CBD5E1"
      );
    },

    reset() {
      // reset UI state
      this.cards = [];
      this.visibleCards = [];

      // reset settings - MANTÉM O GRIDSIZE
      this.settings = {
        open: false,
        categories: [],
        tags: [],
        gridSize: this.settings.gridSize || 4,
        mode: "image-text",
        useCategoryColors: true,
      };

      // reset stats
      this.stats = {
        totalPairs: 0,
        foundPairs: 0,
        time: "00:00",
        attempts: 0,
      };

      // reset status
      this.gameStatus = {
        title: "",
        subtitle: "",
      };

      // reset engine
      if (this.game) {
        this.game.reset();
      }

      this.showToast('🔄 Jogo resetado!');
    },

    restartGame() {
      this.reset();
      this.startGameFromSettings();
    },

    resetGameState() {
      this.cards = [];
      this.visibleCards = [];

      if (this.game) {
        this.game.reset();
      }
    },

    // =========================
    // GAME ACTIONS
    // =========================
    flipCard(card) {
      if (this.game) {
        this.game.flip(card);
        this.stats.attempts++;
      }
    },

    async celebrate(title, subtitle) {
      this.celebration.title = title || "🎉 Parabéns!";
      this.celebration.subtitle = subtitle || "Você completou o jogo!";
      this.celebration.show = true;

      try {
        if (window.Speech && typeof window.Speech.speak === 'function') {
          await window.Speech.speak("Parabéns! Você completou o jogo!");
        }
      } catch (e) {
        console.warn("Erro ao falar:", e);
      }

      setTimeout(() => {
        this.celebration.show = false;
      }, 3500);
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
  };
}
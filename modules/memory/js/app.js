function memoryApp() {
  return {
    // =========================
    // STATE GLOBAL (UI)
    // =========================

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

    // engine do jogo (classe)
    game: null,
    async init() {
      console.log("[Memory] init");

      await loadComponents();

      this.categories = window.CARD_CATEGORIES || [];
      this.tags = window.CARD_TAGS || [];

      // store única (overwrite)
      this.activeCollection = window.AACStore || null;

      this.game = new MemoryGame(this);

      this.resetGameState();
    },

    // =========================
    // GAME CONTROL
    // =========================
    startGameFromSettings() {
      const collection = this.activeCollection?.cards || [];

      const filtered = applyFilters(collection, this.settings);

      const result = this.game.build(filtered, this.settings);

      this.cards = result.cards;
      this.visibleCards = [...result.cards];

      this.stats.totalPairs = result.pairs.length;
      this.stats.foundPairs = 0;

      this.gameStatus.title = "Jogo iniciado";
      this.gameStatus.subtitle = `${result.pairs.length} pares`;

      this.settings.open = false;
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

      // reset settings
      this.settings = {
        open: false,
        categories: [],
        tags: [],
        gridSize: 4,
        mode: "image-text",
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

      this.gridSize = 4;
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
      this.game.flip(card);
    },
    async celebrate(title, subtitle) {
      this.celebration.title = title;
      this.celebration.subtitle = subtitle;
      this.celebration.show = true;

      await window.Speech.speak("Parabéns! Você completou o jogo!");

      setTimeout(() => {
        this.celebration.show = false;
      }, 3500);
    },
  };
}

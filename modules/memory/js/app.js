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

    // engine do jogo (classe)
    game: null,
    async init() {

      await loadComponents();

      const collectionData = this.extractCollectionData();

      this.categories = collectionData.categories;
      this.tags = collectionData.tags;
      this.cards = collectionData.cards;

      this.activeCollection = window.AACStore || null;

      this.game = new MemoryGame(this);

      this.resetGameState();
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

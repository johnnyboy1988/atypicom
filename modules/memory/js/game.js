class MemoryGame {
  constructor(vm) {
    this.vm = vm;

    // trava durante comparação dos pares
    this.lock = false;

    // cartas abertas
    this.openCards = [];

    // coleção utilizada na partida
    this.pairs = [];
    this.cards = [];
  }

  // =========================
  // HELPERS
  // =========================

  get busy() {
    return this.lock || window.Speech.isPlaying;
  }

  // =========================
  // PAIRS
  // =========================

  createPairs(collection) {
    return collection.map((item) => ({
      id: item.id,
      text: item.frontText,
      image: item.image || null,
      category: item.category,
      tags: item.tags || [],
    }));
  }

  // =========================
  // CARD FACTORY
  // =========================

  createCard(pair) {
    return {
      id: pair.id + "-" + Math.random().toString(36).slice(2),

      pairId: pair.id,

      text: pair.text,
      image: pair.image,

      flipped: false,
      matched: false,
    };
  }

  // =========================
  // SHUFFLE
  // =========================

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  // =========================
  // BUILD
  // =========================

  build(collection, settings) {

    this.reset();

    this.pairs = this.createPairs(collection);

    const gridSize = Number(settings?.gridSize || 4);

    const maxCards = gridSize * gridSize;
    const maxPairs = Math.floor(maxCards / 2);

    const limitedPairs = this.pairs.slice(0, maxPairs);

    const cards = this.shuffle(
      limitedPairs.flatMap((pair) => [
        this.createCard(pair),
        this.createCard(pair),
      ])
    );

    this.cards = cards;

    return {
      pairs: limitedPairs,
      cards,
      gridSize,
    };
  }

  // =========================
  // BOARD SIZE
  // =========================

  calculateBoardSize(pairCount) {

    const totalCards = pairCount * 2;

    let best = 2;

    for (let size = 2; size <= 8; size += 2) {

      if (size * size <= totalCards) {
        best = size;
      }

    }

    return best;
  }

  // =========================
  // GAME
  // =========================
async flip(card) {

    if (this.lock) return;

    if (window.Speech.isPlaying) return;

    if (card.flipped || card.matched) return;

    this.lock = true;

    card.flipped = true;

    await window.Speech.speakCard(card);

    this.openCards.push(card);

    if (this.openCards.length < 2) {
        this.lock = false;
        return;
    }

    const [a, b] = this.openCards;

    if (a.pairId === b.pairId) {

        a.matched = true;
        b.matched = true;

        this.vm.stats.foundPairs++;

        this.openCards = [];

        this.lock = false;

        await this.checkWin();

        return;
    }

    setTimeout(() => {

        a.flipped = false;
        b.flipped = false;

        this.openCards = [];

        this.lock = false;

    }, 800);

}

  // =========================
  // WIN
  // =========================

  async checkWin() {

    if (this.vm.stats.foundPairs < this.vm.stats.totalPairs) {
      return;
    }

    this.vm.gameStatus.title = "Parabéns!";
    this.vm.gameStatus.subtitle = "Você completou o jogo";

    // impede novos cliques enquanto comemora
    this.lock = true;

    await this.vm.celebrate(
      "🎉 Parabéns!",
      "Você completou o jogo!"
    );

    // não precisa liberar, pois a partida terminou
  }

  // =========================
  // RESET
  // =========================

  reset() {

    this.lock = false;

    this.openCards = [];

    this.pairs = [];
    this.cards = [];
  }
}

window.MemoryGame = MemoryGame;
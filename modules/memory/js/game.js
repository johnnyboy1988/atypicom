class MemoryGame {

  constructor(vm) {

    // referência para o Alpine (view-model)
    this.vm = vm;

    // estado interno do jogo
    this.lock = false;
    this.openCards = [];

    this.pairs = [];
    this.cards = [];

  }

  // =========================
  // PAIRS
  // =========================

  createPairs(collection) {

    return collection.map(item => ({
      id: item.id,
      text: item.text || item.name,
      image: item.image || null,
      category: item.category,
      tags: item.tags || []
    }));

  }

  // =========================
  // CARD FACTORY
  // =========================

  createCard(pair) {

    return {
      id: pair.id + '-' + Math.random().toString(36).slice(2),
      pairId: pair.id,
      text: pair.text,
      image: pair.image,

      flipped: false,
      matched: false
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
  // BUILD GAME
  // =========================

build(collection, settings) {

  this.reset();

  this.pairs = this.createPairs(collection);

  const gridSize = Number(settings?.gridSize || 4);

  // 🔥 CAPACIDADE MÁXIMA DO GRID
  const maxCards = gridSize * gridSize;
  const maxPairs = Math.floor(maxCards / 2);

  // 🔥 corta a coleção para caber no grid
  const limitedPairs = this.pairs.slice(0, maxPairs);

  const cards = this.shuffle(
    limitedPairs.flatMap(pair => [
      this.createCard(pair),
      this.createCard(pair)
    ])
  );

  this.cards = cards;

  return {
    pairs: limitedPairs,
    cards,
    gridSize
  };
}
  // =========================
  // GRID SIZE AUTO CALC
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
  // GAME LOGIC (FLIP)
  // =========================

  flip(card) {

    if (this.lock) return;
    if (card.flipped || card.matched) return;

    card.flipped = true;

    this.openCards.push(card);

    if (this.openCards.length < 2) return;

    this.lock = true;

    const [a, b] = this.openCards;

    if (a.pairId === b.pairId) {

      a.matched = true;
      b.matched = true;

      this.vm.stats.foundPairs++;

      this.openCards = [];
      this.lock = false;

      this.checkWin();

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
  // WIN CONDITION
  // =========================

  checkWin() {

    const total = this.vm.stats.totalPairs;
    const found = this.vm.stats.foundPairs;

    if (found >= total) {

      this.vm.gameStatus.title = 'Parabéns!';
      this.vm.gameStatus.subtitle = 'Você completou o jogo';

      this.lock = true;

    }

  }

  // =========================
  // RESET GAME ENGINE
  // =========================

  reset() {

    this.lock = false;
    this.openCards = [];

    this.pairs = [];
    this.cards = [];

  }

}

window.MemoryGame = MemoryGame;
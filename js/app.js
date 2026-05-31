function aacApp() {
  return {
    cards: JSON.parse(JSON.stringify(AACStore.cards)),

    categories: [...AACStore.categories],

    tags: [...AACStore.tags],
    phrase: [],
    uidCounter: 1,

    filterMode: "categories",

    showCreateModal: false,

    selectedTagToAdd: "",

    loadingIcons: false,

    iconResults: [],

    isPlaying: false,

    playingUid: null,

    drag: {
      active: false,
      source: null,
      sourceIndex: null,
      card: null,
      x: 0,
      y: 0,
      overDropzone: false,
      insertIndex: null,
    },

    toast: {
      show: false,
      message: "",
      timer: null,
    },

    selectedCategory: "Todas",
    selectedTag: "Todas",

    createForm: {
      frontText: "",
      backText: "",
      category: "Objetos",
      newCategory: "",
      tags: [],
      newTag: "",
      search: "",
      selectedImage: "",
    },

    async init() {
      await loadComponents();

      window.addEventListener("pointermove", this.onPointerMove.bind(this), {
        passive: false,
      });

      window.addEventListener("pointerup", this.onPointerUp.bind(this));
    },

    get filteredCards() {
      return this.cards.filter((card) => {
        const cat =
          this.selectedCategory === "Todas" ||
          card.category === this.selectedCategory;

        const tag =
          this.selectedTag === "Todas" || card.tags.includes(this.selectedTag);

        return cat && tag;
      });
    },

    displayText(item) {
      return item.flipped ? item.backText : item.frontText;
    },

    createPhraseCard(card) {
      return {
        ...card,
        uid: "phrase-" + this.uidCounter++,
        flipped: false,
      };
    },

    quickAdd(card) {
      // if (this.phrase.length >= 5) {

      //   this.showToast('Máximo de 5 cartões');
      //   return;
      // }

      this.phrase.push(this.createPhraseCard(card));
    },

    flipCard(uid) {
      const item = this.phrase.find((i) => i.uid === uid);

      if (item) {
        item.flipped = !item.flipped;
      }
    },

    removeFromPhrase(index) {
      this.phrase.splice(index, 1);
    },

    clearPhrase() {
      this.phrase = [];
    },

    showToast(message) {
      clearTimeout(this.toast.timer);

      this.toast.message = message;
      this.toast.show = true;

      this.toast.timer = setTimeout(() => {
        this.toast.show = false;
      }, 1800);
    },

    startDragFromLibrary(event, card) {
      this.beginDrag(event, "library", card, null);
    },

    startDragFromPhrase(event, index) {
      this.beginDrag(event, "phrase", this.phrase[index], index);
    },

    beginDrag(event, source, card, index) {
      this.drag.active = true;
      this.drag.source = source;
      this.drag.sourceIndex = index;
      this.drag.card = { ...card };

      this.drag.x = event.clientX;
      this.drag.y = event.clientY;
    },

    onPointerMove(event) {
      if (!this.drag.active) return;

      event.preventDefault();

      this.drag.x = event.clientX;
      this.drag.y = event.clientY;

      const zone = this.$refs.dropzone.getBoundingClientRect();

      const inside =
        event.clientX >= zone.left &&
        event.clientX <= zone.right &&
        event.clientY >= zone.top &&
        event.clientY <= zone.bottom;

      this.drag.overDropzone = inside;

      if (inside) {
        this.drag.insertIndex = this.calculateInsertIndex(
          event.clientX,
          event.clientY,
        );
      }
    },

    onPointerUp(event) {
      if (!this.drag.active) return;
      if (!this.drag.card) return;

      const zone = this.$refs.dropzone.getBoundingClientRect();

      const inside =
        event.clientX >= zone.left &&
        event.clientX <= zone.right &&
        event.clientY >= zone.top &&
        event.clientY <= zone.bottom;

      if (inside) {
        if (this.drag.source === "library") {
          if (this.phrase.length >= 5) {
            this.showToast("Máximo de 5 cartões");
          } else {
            const insertAt = this.drag.insertIndex ?? this.phrase.length;

            this.phrase.splice(
              insertAt,
              0,
              this.createPhraseCard(this.drag.card),
            );
          }
        } else if (this.drag.source === "phrase") {
          const item = this.phrase[this.drag.sourceIndex];

          this.phrase.splice(this.drag.sourceIndex, 1);

          let insertAt = this.drag.insertIndex ?? this.phrase.length;

          if (insertAt > this.drag.sourceIndex) {
            insertAt--;
          }

          this.phrase.splice(insertAt, 0, item);
        }
      } else if (this.drag.source === "phrase") {
        this.removeFromPhrase(this.drag.sourceIndex);

        this.showToast("Cartão removido");
      }

      this.cancelDrag();
    },

    cancelDrag() {
      this.drag.active = false;
      this.drag.source = null;
      this.drag.sourceIndex = null;
      this.drag.card = null;
      this.drag.overDropzone = false;
      this.drag.insertIndex = null;
    },

    calculateInsertIndex(x, y) {
      const wrappers = this.$refs.dropzone.querySelectorAll(
        '[data-gjs-name="Phrase Card Wrapper"]',
      );

      if (!wrappers.length) return 0;

      let index = wrappers.length;

      wrappers.forEach((el, i) => {
        const rect = el.getBoundingClientRect();

        const before =
          y < rect.top + rect.height * 0.5 ||
          (y >= rect.top &&
            y <= rect.bottom &&
            x < rect.left + rect.width * 0.5);

        if (index === wrappers.length && before) {
          index = i;
        }
      });

      return index;
    },

    async playPhrase() {
      if (!this.phrase.length || this.isPlaying) {
        return;
      }

      this.isPlaying = true;

      for (const item of this.phrase) {
        this.playingUid = item.uid;

        const text = this.displayText(item);

        await this.speakText(text);
      }

      this.playingUid = null;
      this.isPlaying = false;
    },
    playTone(seed, duration) {
      return new Promise((resolve) => {
        if (!this.audioCtx) {
          setTimeout(resolve, duration);
          return;
        }

        const osc = this.audioCtx.createOscillator();

        const gain = this.audioCtx.createGain();

        osc.type = "sine";

        osc.frequency.value = 320 + seed * 70;

        gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);

        gain.gain.exponentialRampToValueAtTime(
          0.08,
          this.audioCtx.currentTime + 0.02,
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          this.audioCtx.currentTime + duration / 1000,
        );

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();

        osc.stop(this.audioCtx.currentTime + duration / 1000);

        osc.onended = () => resolve();
      });
    },
    speakText(text) {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = "pt-BR";
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
          console.log("Terminou:", text);
          resolve();
        };

        utterance.onerror = (e) => {
          console.error("Erro:", e);
          resolve();
        };

        speechSynthesis.speak(utterance);
      });
    },
    async waitSpeechIdle() {
      while (speechSynthesis.speaking || speechSynthesis.pending) {
        await this.wait(50);
      }
    },
    async searchIcons() {
      const query = this.createForm.search.trim().toLowerCase();

      if (!query) {
        this.showToast("Digite algo para buscar");
        return;
      }

      this.loadingIcons = true;

      try {
        const response = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=60`,
        );

        if (!response.ok) {
          throw new Error("Erro API");
        }

        const data = await response.json();

        /*
              transforma resultados
            */

        this.iconResults = (data.icons || []).map((iconName) => ({
          name: iconName,

          url: `https://api.iconify.design/${iconName}.svg`,
        }));

        if (!this.iconResults.length) {
          this.showToast("Nenhum ícone encontrado");
        }
      } catch (e) {
        console.error(e);

        this.showToast("Erro ao buscar ícones");
      } finally {
        this.loadingIcons = false;
      }
    },

    wait(ms) {
      return new Promise((r) => setTimeout(r, ms));
    },
    addNewCategory() {
      const name = this.createForm.newCategory.trim();

      if (!name) {
        this.showToast("Digite a categoria");
        return;
      }

      const exists = this.categories.some(
        (c) => c.toLowerCase() === name.toLowerCase(),
      );

      if (!exists) {
        this.categories.push(name);

        this.showToast("Categoria criada");
      }

      this.createForm.category = name;
      this.createForm.newCategory = "";
    },
    addTagToCard(tag) {
      if (!tag) return;

      if (!this.createForm.tags.includes(tag)) {
        this.createForm.tags.push(tag);
      }

      this.selectedTagToAdd = "";
    },
    createAndAddTag() {
      const tag = this.createForm.newTag.trim();

      if (!tag) {
        this.showToast("Digite a tag");
        return;
      }

      const exists = this.tags.some(
        (t) => t.toLowerCase() === tag.toLowerCase(),
      );

      if (!exists) {
        this.tags.push(tag);

        this.showToast("Tag criada");
      }

      this.addTagToCard(tag);

      this.createForm.newTag = "";
    },
    removeTag(tag) {
      this.createForm.tags = this.createForm.tags.filter((t) => t !== tag);
    },
    saveCustomCard() {
      if (!this.createForm.frontText.trim()) {
        this.showToast("Informe o texto da frente");
        return;
      }

      if (!this.createForm.backText.trim()) {
        this.showToast("Informe o texto do verso");
        return;
      }

      if (!this.createForm.category) {
        this.showToast("Informe uma categoria");
        return;
      }

      const categoryExists = this.categories.some(
        (c) => c.toLowerCase() === this.createForm.category.toLowerCase(),
      );

      if (!categoryExists) {
        this.categories.push(this.createForm.category);
      }

      this.createForm.tags.forEach((tag) => {
        const exists = this.tags.some(
          (t) => t.toLowerCase() === tag.toLowerCase(),
        );

        if (!exists) {
          this.tags.push(tag);
        }
      });

      const colors = [
        "#DBEAFE",
        "#FDE68A",
        "#FBCFE8",
        "#DDD6FE",
        "#BBF7D0",
        "#FECACA",
        "#E0F2FE",
      ];

      this.cards.unshift({
        id: Date.now(),

        category: this.createForm.category,

        tags: this.createForm.tags.length
          ? this.createForm.tags
          : ["Personalizado"],

        image: this.createForm.selectedImage,

        frontText: this.createForm.frontText,

        backText: this.createForm.backText,

        color: colors[Math.floor(Math.random() * colors.length)],
      });

      this.showCreateModal = false;

      this.iconResults = [];

      this.createForm = {
        category: "Objetos",
        newCategory: "",
        tags: [],
        newTag: "",
        search: "",
        selectedImage: "",
      };

      this.selectedTagToAdd = "";

      this.showToast("Cartão criado com sucesso");
    },
  };
}

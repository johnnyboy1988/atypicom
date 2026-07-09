function aacApp() {
  return {
    cards: JSON.parse(JSON.stringify(AACStore.cards)),

    categories: [...AACStore.categories],

    tags: [...AACStore.tags],
    phrase: [],
    uidCounter: 1,

    filterMode: "OR",

    showCreateModal: false,

    editMode: false,

    editingCardId: null,
    selectedTagToAdd: "",

    loadingIcons: false,

    iconResults: [],

    isPlaying: false,

    playingUid: null,
    configMode: {
      open: false,
      createCard: true,
      createTag: true,
      createCategory: true,
      editCard: false,
      iconProviders: {
        iconify: true,
        openmoji: true,
      },
    },
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

    selectedCategories: [],
    selectedTags: [],
    filtersCollapsed: false,
    createForm: {
      frontText: "",
      backText: "",
      category: "Objetos",
      categoryColor: "",
      newCategory: "",
      tags: [],
      newTag: "",
      newTagColor: "",
      search: "",
      selectedImage: "",
    },

    async init() {
      await loadComponents();

      this.Speech = window.Speech;

      this.createForm.categoryColor = this.randomColor();
      this.createForm.newTagColor = this.randomColor();

      window.addEventListener("pointermove", this.onPointerMove.bind(this), {
        passive: false,
      });

      window.addEventListener("pointerup", this.onPointerUp.bind(this));
    },
    toggleCategory(category) {
      if (this.filterMode === 'OR') {
        if (this.selectedCategories.includes(category)) {
          this.selectedCategories = [];
        } else {
          this.selectedCategories = [category];
        }
      } else {
        const idx = this.selectedCategories.indexOf(category);
        if (idx >= 0) {
          this.selectedCategories.splice(idx, 1);
        } else {
          this.selectedCategories.push(category);
        }
      }
    },

    toggleTag(tag) {
      if (this.filterMode === 'OR') {
        if (this.selectedTags.includes(tag)) {
          this.selectedTags = [];
        } else {
          this.selectedTags = [tag];
        }
      } else {
        const idx = this.selectedTags.indexOf(tag);
        if (idx >= 0) {
          this.selectedTags.splice(idx, 1);
        } else {
          this.selectedTags.push(tag);
        }
      }
    },
   get filteredCards() {
    return this.cards.filter((card) => {
        const hasCategories = this.selectedCategories.length > 0;
        const hasTags = this.selectedTags.length > 0;

        // Se não há filtros, mostra tudo
        if (!hasCategories && !hasTags) {
            return true;
        }

        // Verifica match de categoria
        const categoryMatch = !hasCategories || 
            this.selectedCategories.includes(card.category);

        // Verifica match de tags
        const tagMatch = !hasTags || 
            (card.tags || []).some((tag) => this.selectedTags.includes(tag));

        // Modo AND: precisa corresponder a TODOS os filtros
        if (this.filterMode === 'AND') {
            // Se há categorias selecionadas, precisa corresponder
            if (hasCategories && !categoryMatch) return false;
            // Se há tags selecionadas, precisa corresponder
            if (hasTags && !tagMatch) return false;
            return true;
        }

        // Modo OR: corresponde a QUALQUER filtro
        // Se há categorias, precisa corresponder a pelo menos uma
        if (hasCategories && categoryMatch) return true;
        // Se há tags, precisa corresponder a pelo menos uma
        if (hasTags && tagMatch) return true;
        
        return false;
    });
},
    getCategory(name) {
      return this.categories.find((c) => c.name === name);
    },

    getTag(name) {
      return this.tags.find((t) => t.name === name);
    },
    getCategoryColor(categoryName) {
      return (
        this.categories.find((c) => c.name === categoryName)?.color || "#CBD5E1"
      );
    },

    getTagColor(name) {
      return this.getTag(name)?.color || "#64748B";
    },
    randomColor() {
      const colors = [
        "#6366F1", // indigo
        "#8B5CF6", // violet
        "#EC4899", // pink
        "#F97316", // orange
        "#EAB308", // yellow
        "#22C55E", // green
        "#10B981", // emerald
        "#14B8A6", // teal
        "#06B6D4", // cyan
        "#3B82F6", // blue
        "#EF4444", // red
        "#84CC16", // lime
      ];

      return colors[Math.floor(Math.random() * colors.length)];
    },
    resetCreateForm() {
      this.createForm = {
        frontText: "",
        backText: "",

        category: this.categories[0]?.name || "",

        categoryColor: this.randomColor(),

        newCategory: "",

        tags: [],

        newTag: "",

        newTagColor: this.randomColor(),

        search: "",

        selectedImage: "",
      };
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

    /***MODAL */
    addNewCategory() {
      const name = this.createForm.newCategory.trim();

      if (!name) {
        this.showToast("Digite a categoria");
        return;
      }

      const exists = this.categories.some(
        (c) => c.name.toLowerCase() === name.toLowerCase(),
      );

      if (!exists) {
        this.categories.push({
          name,
          color: this.createForm.categoryColor,
        });
      }

      this.createForm.category = name;
      this.createForm.newCategory = "";
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
            const insertAt = this.drag.insertIndex ?? this.phrase.length;

            this.phrase.splice(
              insertAt,
              0,
              this.createPhraseCard(this.drag.card),
            );
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
      await Speech.play(
        this.phrase,

        (item) => this.displayText(item),

        {
          onStart: (item) => {
            this.playingUid = item.uid;
          },

          onEnd: () => {
            this.playingUid = null;
          },
        },
      );
    },

    async searchIconify(query) {
      const response = await fetch(
        `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=60`,
      );

      if (!response.ok) {
        throw new Error("Erro Iconify");
      }

      const data = await response.json();

      return (data.icons || []).map((iconName) => ({
        source: "iconify",
        name: iconName,
        url: `https://api.iconify.design/${iconName}.svg`,
      }));
    },
    async searchIcons() {
      if (
        !this.configMode.iconProviders.iconify &&
        !this.configMode.iconProviders.openmoji
      ) {
        this.showToast("Selecione ao menos uma biblioteca de ícones");
        return;
      }

      const query = this.createForm.search.trim();

      if (!query) {
        this.showToast("Digite algo para buscar");
        return;
      }

      this.loadingIcons = true;

      try {
        const promises = [];

        if (this.configMode.iconProviders.iconify) {
          promises.push(this.searchIconify(query));
        }

        if (this.configMode.iconProviders.openmoji) {
          promises.push(this.searchOpenMoji(query));
        }

        const results = await Promise.all(promises);

        this.iconResults = results.flat();
      } catch (err) {
        console.error(err);

        this.showToast("Erro ao buscar imagens");
      } finally {
        this.loadingIcons = false;
      }
    },
    async searchOpenMoji(query) {
      await this.loadOpenMoji();

      const q = query.toLowerCase();

      return this.openMojiIndex
        .filter((item) => {
          const annotation = (item.annotation || "").toLowerCase();

          const tags = Array.isArray(item.tags)
            ? item.tags.join(" ").toLowerCase()
            : String(item.tags || "").toLowerCase();

          const keywords = Array.isArray(item.keywords)
            ? item.keywords.join(" ").toLowerCase()
            : String(item.keywords || "").toLowerCase();

          return (
            annotation.includes(q) || tags.includes(q) || keywords.includes(q)
          );
        })
        .slice(0, 30)
        .map((item) => ({
          source: "openmoji",
          name: item.annotation,
          url: `https://cdn.jsdelivr.net/npm/openmoji@latest/color/svg/${item.hexcode}.svg`,
        }));
    },
    async loadOpenMoji() {
      if (this.openMojiIndex) {
        return;
      }

      const response = await fetch(
        "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/data/openmoji.json",
      );

      this.openMojiIndex = await response.json();
    },
    wait(ms) {
      return new Promise((r) => setTimeout(r, ms));
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

      /*
       * garante categoria
       */

      const categoryExists = this.categories.some(
        (c) => c.name.toLowerCase() === this.createForm.category.toLowerCase(),
      );

      if (!categoryExists) {
        this.categories.push({
          name: this.createForm.category,

          color: this.createForm.categoryColor || "#6366F1",
        });
      }

      /*
       * garante tags
       */

      this.createForm.tags.forEach((tag) => {
        const exists = this.tags.some(
          (t) => t.name.toLowerCase() === tag.toLowerCase(),
        );

        if (!exists) {
          this.tags.push({
            name: tag,

            color: this.createForm.newTagColor || "#6366F1",
          });
        }
      });

      this.cards.unshift({
        id: Date.now(),

        category: this.createForm.category,

        tags:
          this.createForm.tags.length > 0
            ? [...this.createForm.tags]
            : ["Personalizado"],

        image: this.createForm.selectedImage,

        frontText: this.createForm.frontText.trim(),

        backText: this.createForm.backText.trim(),
      });

      this.closeCreateModal();
      this.showToast("Cartão criado com sucesso");
    },
    importJson(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          // validação mínima
          if (!data.cards && !data.categories && !data.tags) {
            this.showToast("JSON inválido");
            return;
          }

          /*
           * MERGE CATEGORIES
           */
          if (Array.isArray(data.categories)) {
            data.categories.forEach((cat) => {
              const exists = this.categories.some(
                (c) => c.name.toLowerCase() === cat.name.toLowerCase(),
              );

              if (!exists) {
                this.categories.push(cat);
              }
            });
          }

          /*
           * MERGE TAGS
           */
          if (Array.isArray(data.tags)) {
            data.tags.forEach((tag) => {
              const exists = this.tags.some(
                (t) => t.name.toLowerCase() === tag.name.toLowerCase(),
              );

              if (!exists) {
                this.tags.push(tag);
              }
            });
          }

          /*
           * MERGE CARDS
           */
          if (Array.isArray(data.cards)) {
            data.cards.forEach((card) => {
              const exists = this.cards.some(
                (c) =>
                  c.frontText === card.frontText &&
                  c.backText === card.backText,
              );

              if (!exists) {
                this.cards.unshift({
                  ...card,
                  id: card.id || Date.now() + Math.random(),
                });
              }
            });
          }

          this.showToast("Importação concluída com sucesso");
        } catch (err) {
          console.error(err);
          this.showToast("Erro ao ler JSON");
        }
      };

      reader.readAsText(file);

      // limpa input (permite reimportar mesmo arquivo)
      event.target.value = "";
    },

    exportJson() {
      const data = {
        cards: this.cards,
        categories: this.categories,
        tags: this.tags,
      };

      const json = JSON.stringify(data, null, 2);

      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast("Backup exportado com sucesso");
    },
    toggleEditMode() {
      this.editMode = !this.editMode;

      this.showToast(
        this.editMode ? "Modo edição ativado" : "Modo edição desativado",
      );
    },

    onLibraryCardClick(card) {
      if (this.editMode) {
        this.openEditCard(card);

        return;
      }

      this.quickAdd(card);
    },
    openCreateModal() {
      this.closeCreateModal();
      this.showCreateModal = true;
    },
    openEditCard(card) {
      this.editMode = true;

      this.editingCardId = card.id;

      this.createForm = {
        frontText: card.frontText || "",
        backText: card.backText || "",

        category: card.category || "",

        categoryColor:
          this.getCategory(card.category)?.color || this.randomColor(),

        newCategory: "",

        tags: [...(card.tags || [])],

        newTag: "",

        newTagColor: this.randomColor(),

        search: "",

        selectedImage: card.image || "",
      };

      this.showCreateModal = true;
    },

    updateCard() {
      const card = this.cards.find((c) => c.id === this.editingCardId);

      if (!card) {
        this.showToast("Cartão não encontrado");
        return;
      }

      card.frontText = this.createForm.frontText.trim();

      card.backText = this.createForm.backText.trim();

      card.category = this.createForm.category;

      card.tags = [...this.createForm.tags];

      card.image = this.createForm.selectedImage;

      this.closeCreateModal();

      this.showToast("Cartão atualizado com sucesso");
    },

    closeCreateModal() {
      this.showCreateModal = false;

      this.editMode = false;

      this.editingCardId = null;

      this.iconResults = [];

      this.selectedTagToAdd = "";

      this.resetCreateForm();
    },
  };
}

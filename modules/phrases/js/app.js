let appInstance = null;

function aacApp() {
  if (appInstance) {
    console.log("Retornando instância existente");
    return appInstance;
  }

  const instance = {
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

    savedPhrases: [],
    showSavePhraseModal: false,
    showLoadPhraseModal: false,
    phraseName: "",

    configMode: {
      open: false,
      createCard: true,
      createTag: true,
      editLibrary: true,
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

    // Adicione no return do aacApp()
    showLibraryConfigModal: false,
    libraryConfigRows: 3,
    libraryConfigMaxHeight: 38,
    libraryConfigCardWidth: 120,
    libraryConfigCardWidthMd: 155,
    libraryConfigShowCategory: true,
    libraryConfigShowIcons: true,
    libraryConfigOrientation: "columns",

    showComposerConfigModal: false,
    composerConfigMaxHeight: 30,
    composerConfigColumnsMobile: 2,
    composerConfigColumnsDesktop: 4,
    composerConfigShowCategory: true,
    composerConfigShowTags: true,

    // Adicione os métodos
    loadLibraryConfig() {
      this.libraryConfigRows = LibraryConfig.getRows();
      this.libraryConfigMaxHeight = LibraryConfig.getMaxHeight();
      this.libraryConfigCardWidth = LibraryConfig.getCardWidth();
      this.libraryConfigCardWidthMd = LibraryConfig.getCardWidthMd();
      this.libraryConfigShowCategory = LibraryConfig.getShowCategory();
      this.libraryConfigShowIcons = LibraryConfig.getShowIcons();
      this.libraryConfigOrientation = LibraryConfig.getOrientation();
    },

    updateLibraryConfig(newConfig) {
      LibraryConfig.updateConfig(newConfig);
      this.loadLibraryConfig();
      this.refreshComposer();
    },

    resetLibraryConfig() {
      LibraryConfig.reset();
      this.loadLibraryConfig();
      this.showToast("Configuração restaurada!");
    },

    loadComposerConfig() {
      if (typeof window.ComposerConfig === "undefined") {
        console.warn("ComposerConfig não disponível");
        return;
      }
      this.composerConfigMaxHeight = window.ComposerConfig.getMaxHeight();
      this.composerConfigColumnsMobile =
        window.ComposerConfig.getColumnsMobile();
      this.composerConfigColumnsDesktop =
        window.ComposerConfig.getColumnsDesktop();
      this.composerConfigShowCategory = window.ComposerConfig.getShowCategory();
      this.composerConfigShowTags = window.ComposerConfig.getShowTags();
    },
    refreshComposer() {
      if (Array.isArray(this.phrase)) {
        if (this.phrase.length > 0) {
          this.phrase = [...this.phrase];
        } else {
          this.phrase = [];
        }
      } else {
        this.phrase = [];
      }
    },
    updateComposerConfig(newConfig) {
      if (typeof window.ComposerConfig === "undefined") {
        console.warn("ComposerConfig não disponível");
        return;
      }
      window.ComposerConfig.updateConfig(newConfig);
      this.loadComposerConfig();
      // Força atualização da UI
      this.$nextTick(() => {
        this.refreshComposer();
      });
    },

    resetComposerConfig() {
      if (typeof window.ComposerConfig === "undefined") {
        console.warn("ComposerConfig não disponível");
        return;
      }
      window.ComposerConfig.reset();
      this.loadComposerConfig();
      this.showToast("Configuração restaurada!");
    },

    // ===== INIT =====
    async init() {
      window.__appInstance = this;
      appInstance = this;

      await loadComponents();
      await this.$nextTick();

      this.Speech = window.Speech;

      this.createForm.categoryColor = this.randomColor();
      this.createForm.newTagColor = this.randomColor();

      this.loadPhrasesFromStorage();
      this.loadLibraryConfig();
      this.loadComposerConfig();
    },

    // ===== FILTROS =====
    toggleCategory(category) {
      if (this.filterMode === "OR") {
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
      if (this.filterMode === "OR") {
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

        if (!hasCategories && !hasTags) {
          return true;
        }

        const categoryMatch =
          !hasCategories || this.selectedCategories.includes(card.category);

        const tagMatch =
          !hasTags ||
          (card.tags || []).some((tag) => this.selectedTags.includes(tag));

        if (this.filterMode === "AND") {
          if (hasCategories && !categoryMatch) return false;
          if (hasTags && !tagMatch) return false;
          return true;
        }

        if (hasCategories && categoryMatch) return true;
        if (hasTags && tagMatch) return true;

        return false;
      });
    },

    // ===== HELPERS =====
    getCategory(name) {
      return this.categories.find((c) => c.name === name);
    },

    getTag(name) {
      return this.tags.find((t) => t.name === name);
    },

    getCategoryIcon(name) {
      return this.categories.find((c) => c.name === name)?.icon || "";
    },
    getTagIcon(name) {
      return this.tags.find((t) => t.name === name)?.icon || "";
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
        "#6366F1",
        "#8B5CF6",
        "#EC4899",
        "#F97316",
        "#EAB308",
        "#22C55E",
        "#10B981",
        "#14B8A6",
        "#06B6D4",
        "#3B82F6",
        "#EF4444",
        "#84CC16",
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

    // ===== PHRASE =====
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
      this.phrase.push(this.createPhraseCard(card));
    },

    flipCard(uid) {
      const item = this.phrase.find((i) => i.uid === uid);
      if (item) {
        item.flipped = !item.flipped;
      }
    },

    removeFromPhrase(index) {
      if (index >= 0 && index < this.phrase.length) {
        this.phrase.splice(index, 1);
      }
    },

    clearPhrase() {
      this.phrase = [];
    },

    // ===== VERIFICAÇÃO DE INSTÂNCIA =====
    checkInstance() {
      return window.__appInstance === this;
    },

    // ===== TOAST =====
    showToast(message) {
      clearTimeout(this.toast.timer);
      this.toast.message = message;
      this.toast.show = true;
      this.toast.timer = setTimeout(() => {
        this.toast.show = false;
      }, 1800);
    },

    // ===== DRAG & DROP =====
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

    // ===== ÁUDIO =====
    async playPhrase() {
      if (!Array.isArray(this.phrase) || this.phrase.length === 0) {
        this.showToast("Adicione cartões para tocar");
        return;
      }
      await Speech.play(this.phrase, (item) => this.displayText(item), {
        onStart: (item) => {
          this.playingUid = item.uid;
        },
        onEnd: () => {
          this.playingUid = null;
        },
      });
    },

    // ===== CRIAÇÃO DE CATEGORIAS =====
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

    // ===== CRIAÇÃO DE TAGS =====
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
        (t) => t.name.toLowerCase() === tag.toLowerCase(),
      );

      if (!exists) {
        this.tags.push({
          name: tag,
          color: this.createForm.newTagColor || "#6366F1",
        });
        this.showToast("Tag criada");
      }

      this.addTagToCard(tag);
      this.createForm.newTag = "";
    },

    removeTag(tag) {
      this.createForm.tags = this.createForm.tags.filter((t) => t !== tag);
    },

    // ===== SALVAR CARD =====
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
        (c) => c.name.toLowerCase() === this.createForm.category.toLowerCase(),
      );

      if (!categoryExists) {
        this.categories.push({
          name: this.createForm.category,
          color: this.createForm.categoryColor || "#6366F1",
        });
      }

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
        image: this.createForm.selectedImage || "",
        frontText: this.createForm.frontText.trim(),
        backText: this.createForm.backText.trim(),
      });

      this.closeCreateModal();
      this.showToast("Cartão criado com sucesso");
    },

    // ===== EDIÇÃO DE CARD =====
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

    openCreateModal() {
      this.closeCreateModal();
      this.showCreateModal = true;
    },

    // ===== BUSCA DE ÍCONES =====
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

    async searchIconify(query) {
      const response = await fetch(
        `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=60`,
      );
      if (!response.ok) throw new Error("Erro Iconify");
      const data = await response.json();
      return (data.icons || []).map((iconName) => ({
        source: "iconify",
        name: iconName,
        url: `https://api.iconify.design/${iconName}.svg`,
      }));
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
      if (this.openMojiIndex) return;
      const response = await fetch(
        "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/data/openmoji.json",
      );
      this.openMojiIndex = await response.json();
    },

    // ===== IMPORTAÇÃO/EXPORTAÇÃO =====
    importJson(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.cards && !data.categories && !data.tags) {
            this.showToast("JSON inválido");
            return;
          }

          if (Array.isArray(data.categories)) {
            data.categories.forEach((cat) => {
              const exists = this.categories.some(
                (c) => c.name.toLowerCase() === cat.name.toLowerCase(),
              );
              if (!exists) this.categories.push(cat);
            });
          }

          if (Array.isArray(data.tags)) {
            data.tags.forEach((tag) => {
              const exists = this.tags.some(
                (t) => t.name.toLowerCase() === tag.name.toLowerCase(),
              );
              if (!exists) this.tags.push(tag);
            });
          }

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

    // ===== SALVAR E CARREGAR FRASES =====
    savePhrase() {
      if (!Array.isArray(this.phrase) || this.phrase.length === 0) {
        this.showToast("A frase está vazia");
        return;
      }

      const phraseName = this.phrase
        .map((item) => item.frontText || "")
        .filter((text) => text.trim() !== "")
        .join(" ");

      this.phraseName = phraseName;

      this.showSavePhraseModal = true;
    },

    confirmSavePhrase() {
      const name = this.phraseName.trim();
      if (!name) {
        this.showToast("Digite um nome para a frase");
        return;
      }

      if (!Array.isArray(this.savedPhrases)) {
        this.savedPhrases = [];
      }

      const exists = this.savedPhrases.some(
        (p) => p.name && p.name.toLowerCase() === name.toLowerCase(),
      );
      if (exists) {
        this.showToast("Já existe uma frase com este nome");
        return;
      }

      const cardsToSave = this.phrase.map((item) => ({
        id: item.id,
        category: item.category,
        tags: Array.isArray(item.tags) ? [...item.tags] : [],
        image: item.image,
        frontText: item.frontText,
        backText: item.backText,
      }));

      const newPhrase = {
        id: Date.now(),
        name: name,
        cards: cardsToSave,
        createdAt: new Date().toISOString(),
      };

      this.savedPhrases.push(newPhrase);
      this.savePhrasesToStorage();
      this.showSavePhraseModal = false;
      this.showToast("Frase salva com sucesso!");
    },

    loadPhrase(phraseId) {
      console.log("=== INICIANDO CARREGAMENTO ===");
      console.log("ID da frase:", phraseId);

      if (window.__appInstance !== this) {
        console.warn("Instância diferente detectada! Usando instância global");
        const globalApp = window.__appInstance;
        if (globalApp) {
          return globalApp.loadPhrase(phraseId);
        }
      }

      if (!Array.isArray(this.savedPhrases)) {
        this.savedPhrases = [];
        this.showToast("Nenhuma frase salva");
        return;
      }

      const phrase = this.savedPhrases.find((p) => {
        const pId = typeof p.id === "string" ? parseInt(p.id) : p.id;
        const targetId =
          typeof phraseId === "string" ? parseInt(phraseId) : phraseId;
        return pId === targetId;
      });

      if (!phrase) {
        this.showToast("Frase não encontrada");
        return;
      }

      if (!Array.isArray(phrase.cards)) {
        this.showToast("Frase corrompida");
        return;
      }

      this.phrase = [];

      phrase.cards.forEach((card) => {
        const cardData = {
          id: card.id,
          category: card.category || "Sem categoria",
          tags: Array.isArray(card.tags) ? [...card.tags] : [],
          image: card.image || "",
          frontText: card.frontText || "Sem texto",
          backText: card.backText || "Sem texto",
        };
        this.phrase.push(this.createPhraseCard(cardData));
      });

      console.log("Frase carregada com", this.phrase.length, "cards");

      this.showLoadPhraseModal = false;
      this.showToast(
        `Frase "${phrase.name}" carregada com ${this.phrase.length} cards!`,
      );

      this.$nextTick(() => {
        this.phrase = [...this.phrase];
        console.log("After nextTick:", this.phrase.length, "cards");
      });
    },

    deleteSavedPhrase(phraseId) {
      if (!confirm("Tem certeza que deseja excluir esta frase?")) return;

      if (!Array.isArray(this.savedPhrases)) {
        this.savedPhrases = [];
        return;
      }

      const targetId =
        typeof phraseId === "string" ? parseInt(phraseId) : phraseId;
      this.savedPhrases = this.savedPhrases.filter((p) => {
        const pId = typeof p.id === "string" ? parseInt(p.id) : p.id;
        return pId !== targetId;
      });

      this.savePhrasesToStorage();
      this.showToast("Frase excluída");
    },

    savePhrasesToStorage() {
      try {
        if (!Array.isArray(this.savedPhrases)) {
          this.savedPhrases = [];
        }
        localStorage.setItem(
          "saved_phrases",
          JSON.stringify(this.savedPhrases),
        );
        console.log("Frases salvas no localStorage:", this.savedPhrases.length);
      } catch (e) {
        console.error("Erro ao salvar frases:", e);
      }
    },

    loadPhrasesFromStorage() {
      try {
        const data = localStorage.getItem("saved_phrases");
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            this.savedPhrases = parsed.map((item) => ({
              ...item,
              cards: Array.isArray(item.cards) ? item.cards : [],
              id: item.id || Date.now(),
              name: item.name || "Frase sem nome",
              createdAt: item.createdAt || new Date().toISOString(),
            }));
          } else {
            this.savedPhrases = [];
          }
        } else {
          this.savedPhrases = [];
        }
      } catch (e) {
        console.error("Erro ao carregar frases:", e);
        this.savedPhrases = [];
      }
    },
  };

  appInstance = instance;
  return instance;
}

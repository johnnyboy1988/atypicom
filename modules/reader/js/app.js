function readerApp() {
  return {
    // Dados
    cards: [],
    categories: [],
    tags: [],
    
    // Seleção
    selectedCategory: 'Todas',
    selectedTags: [],
    
    // Estado de fala
    speakingId: null,
    isSpeaking: false,
    
    // UI
    settingsOpen: false,
    showCreateModal: false,
    
    // Formulário de criação
    createForm: {
      frontText: '',
      backText: '',
      category: '',
      tags: [],
      image: '',
      search: '',
      selectedImage: ''
    },
    selectedTagToAdd: '',
    iconResults: [],
    loadingIcons: false,
    toast: { show: false, message: '' },

    async init() {
      await loadComponents();
      
      this.Speech = window.Speech;
      
      // Carregar dados da coleção
      if (window.READER_COLLECTION) {
        this.cards = JSON.parse(JSON.stringify(window.READER_COLLECTION.cards));
        this.categories = JSON.parse(JSON.stringify(window.READER_COLLECTION.categories));
        this.tags = JSON.parse(JSON.stringify(window.READER_COLLECTION.tags));
      }
      
      // Configurar categoria padrão
      if (this.categories.length > 0) {
        this.createForm.category = this.categories[0].name;
      }
      
      console.log('[Reader] Inicializado com', this.cards.length, 'cards');
    },

    // ===== FILTROS =====
    get filteredCards() {
      return this.cards.filter(card => {
        // Filtro por categoria
        if (this.selectedCategory !== 'Todas' && card.category !== this.selectedCategory) {
          return false;
        }
        
        // Filtro por tags
        if (this.selectedTags.length > 0) {
          const cardTags = card.tags || [];
          return this.selectedTags.some(tag => cardTags.includes(tag));
        }
        
        return true;
      });
    },

    getCategoryCount(categoryName) {
      return this.cards.filter(c => c.category === categoryName).length;
    },

    getCategoryColor(categoryName) {
      const cat = this.categories.find(c => c.name === categoryName);
      return cat ? cat.color : '#CBD5E1';
    },

    getTagColor(tagName) {
      const tag = this.tags.find(t => t.name === tagName);
      return tag ? tag.color : '#CBD5E1';
    },

    toggleTag(tag) {
      const idx = this.selectedTags.indexOf(tag);
      if (idx >= 0) {
        this.selectedTags.splice(idx, 1);
      } else {
        this.selectedTags.push(tag);
      }
    },

    // ===== FALA =====
    async speakCard(card) {
      if (this.isSpeaking) {
        this.Speech.stop();
        this.isSpeaking = false;
        this.speakingId = null;
        
        // Pequeno delay para permitir nova fala
        await new Promise(r => setTimeout(r, 200));
      }
      
      this.speakingId = card.id;
      this.isSpeaking = true;
      
      try {
        await this.Speech.speak(card.backText, { rate: 0.85, pitch: 1.0, lang: 'pt-BR' });
      } catch (error) {
        console.warn('[Reader] Erro na fala:', error);
      }
      
      this.isSpeaking = false;
      this.speakingId = null;
    },

    // ===== CRIAÇÃO DE CARDS =====
    openCreateModal() {
      this.showCreateModal = true;
      this.createForm = {
        frontText: '',
        backText: '',
        category: this.categories.length > 0 ? this.categories[0].name : '',
        tags: [],
        image: '',
        search: '',
        selectedImage: ''
      };
    },

    async searchIcons() {
      const query = this.createForm.search.trim();
      if (!query) {
        this.showToast('Digite algo para buscar');
        return;
      }
      
      this.loadingIcons = true;
      this.iconResults = [];
      
      try {
        const response = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=40`
        );
        if (response.ok) {
          const data = await response.json();
          this.iconResults = (data.icons || []).map(iconName => ({
            name: iconName,
            url: `https://api.iconify.design/${iconName}.svg`
          }));
        }
      } catch (error) {
        console.error('[Reader] Erro ao buscar ícones:', error);
        this.showToast('Erro ao buscar ícones');
      }
      
      this.loadingIcons = false;
    },

    addTagToCard(tag) {
      if (!tag || this.createForm.tags.includes(tag)) return;
      this.createForm.tags.push(tag);
      this.selectedTagToAdd = '';
    },

    removeTag(tag) {
      this.createForm.tags = this.createForm.tags.filter(t => t !== tag);
    },

    saveCard() {
      if (!this.createForm.frontText.trim()) {
        this.showToast('Informe o texto da frente');
        return;
      }
      if (!this.createForm.backText.trim()) {
        this.showToast('Informe o texto do verso');
        return;
      }
      if (!this.createForm.category) {
        this.showToast('Selecione uma categoria');
        return;
      }
      
      const newCard = {
        id: Date.now(),
        category: this.createForm.category,
        tags: [...this.createForm.tags],
        image: this.createForm.selectedImage || '',
        frontText: this.createForm.frontText.trim(),
        backText: this.createForm.backText.trim()
      };
      
      this.cards.unshift(newCard);
      this.showCreateModal = false;
      this.showToast('Card criado com sucesso!');
      
      // Reset form
      this.createForm = {
        frontText: '',
        backText: '',
        category: this.categories.length > 0 ? this.categories[0].name : '',
        tags: [],
        image: '',
        search: '',
        selectedImage: ''
      };
      this.iconResults = [];
      this.selectedTagToAdd = '';
    },

    // ===== TOAST =====
    showToast(message) {
      this.toast.message = message;
      this.toast.show = true;
      clearTimeout(this.toast.timer);
      this.toast.timer = setTimeout(() => {
        this.toast.show = false;
      }, 2500);
    },

    // ===== UTILS =====
    randomColor() {
      const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F97316', '#F59E0B', '#22C55E', '#10B981', '#3B82F6'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  };
}
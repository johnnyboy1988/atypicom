// library.js - Configurações da Biblioteca

(function() {
    'use strict';

    const LibraryConfig = {
        // Valores padrão
        defaults: {
            gridSize: 3,
            maxHeight: 38,
            cardWidth: 110,
            cardWidthMd: 140,
            cardHeight: 0, // 0 = automático, >0 = altura máxima
            showCategory: true,
            showIcons: true,
            orientation: 'vertical',
        },

        state: {
            gridSize: 3,
            maxHeight: 38,
            cardWidth: 110,
            cardWidthMd: 140,
            cardHeight: 0,
            showCategory: true,
            showIcons: true,
            orientation: 'vertical',
        },

        // Inicializa
        init() {
            this.loadFromStorage();
            this.applyConfig();
            console.log('📚 LibraryConfig inicializado:', this.state);
            return this;
        },

        // Carrega do localStorage
        loadFromStorage() {
            try {
                const saved = localStorage.getItem('library_config');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    this.state = { ...this.defaults, ...parsed };
                    console.log('📚 Configuração carregada:', this.state);
                } else {
                    this.state = { ...this.defaults };
                }
            } catch (e) {
                console.error('Erro ao carregar configuração:', e);
                this.state = { ...this.defaults };
            }
        },

        // Salva no localStorage
        saveToStorage() {
            try {
                localStorage.setItem('library_config', JSON.stringify(this.state));
                console.log('📚 Configuração salva:', this.state);
            } catch (e) {
                console.error('Erro ao salvar configuração:', e);
            }
        },

        // Aplica a configuração ao DOM
        applyConfig() {
            const library = document.querySelector('#library-container section');
            if (!library) return;

            library.style.height = `${this.state.maxHeight}vh`;
            
            document.dispatchEvent(new CustomEvent('library-config-updated', {
                detail: { config: this.state }
            }));
        },

        // Atualiza configuração
        updateConfig(newConfig) {
            this.state = { ...this.state, ...newConfig };
            this.saveToStorage();
            this.applyConfig();
            
            document.dispatchEvent(new CustomEvent('library-config-updated', {
                detail: { config: this.state }
            }));
        },

        // Getters
        getGridSize() { return this.state.gridSize; },
        getMaxHeight() { return this.state.maxHeight; },
        getCardWidth() { return this.state.cardWidth; },
        getCardWidthMd() { return this.state.cardWidthMd; },
        getCardHeight() { return this.state.cardHeight; }, // NOVO
        getShowCategory() { return this.state.showCategory; },
        getShowIcons() { return this.state.showIcons; },
        getOrientation() { return this.state.orientation; },

        // Atalhos para atualização
        setGridSize(value) { this.updateConfig({ gridSize: value }); },
        setMaxHeight(value) { this.updateConfig({ maxHeight: value }); },
        setCardWidth(value) { this.updateConfig({ cardWidth: value }); },
        setCardWidthMd(value) { this.updateConfig({ cardWidthMd: value }); },
        setCardHeight(value) { this.updateConfig({ cardHeight: value }); }, // NOVO
        setShowCategory(value) { this.updateConfig({ showCategory: value }); },
        setShowIcons(value) { this.updateConfig({ showIcons: value }); },
        setOrientation(value) { this.updateConfig({ orientation: value }); },

        // Reseta para padrão
        reset() {
            this.state = { ...this.defaults };
            this.saveToStorage();
            this.applyConfig();
            console.log('📚 Configuração resetada para padrão');
        }
    };

    // Exporta para uso global
    window.LibraryConfig = LibraryConfig;

    // Inicializa automaticamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => LibraryConfig.init());
    } else {
        LibraryConfig.init();
    }

    document.addEventListener('components-loaded', () => {
        LibraryConfig.applyConfig();
    });

})();
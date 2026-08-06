// library.js - Configurações da Biblioteca

(function() {
    'use strict';

    const LibraryConfig = {
        // Valores padrão
        defaults: {
            rows: 3,
            maxHeight: 38,
            cardWidth: 110,
            cardWidthMd: 140,
            showCategory: true,
            showIcons: true,
            orientation: 'columns', 
        },

        // Estado atual
        state: {
            rows: 3,
            maxHeight: 38,
            cardWidth: 110,
            cardWidthMd: 140,
            showCategory: true,
            showIcons: true,
            orientation: 'columns',
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

            // Aplica altura
            library.style.height = `${this.state.maxHeight}vh`;
            
            // Dispara evento para outros componentes
            document.dispatchEvent(new CustomEvent('library-config-updated', {
                detail: { config: this.state }
            }));
        },

        // Atualiza configuração
        updateConfig(newConfig) {
            this.state = { ...this.state, ...newConfig };
            this.saveToStorage();
            this.applyConfig();
            
            // Dispara evento para atualizar a UI
            document.dispatchEvent(new CustomEvent('library-config-updated', {
                detail: { config: this.state }
            }));
        },

        // Getters
        getRows() { return this.state.rows; },
        getMaxHeight() { return this.state.maxHeight; },
        getCardWidth() { return this.state.cardWidth; },
        getCardWidthMd() { return this.state.cardWidthMd; },
        getShowCategory() { return this.state.showCategory; },
        getShowIcons() { return this.state.showIcons; },

        // Atalhos para atualização
        setRows(value) { this.updateConfig({ rows: value }); },
        setMaxHeight(value) { this.updateConfig({ maxHeight: value }); },
        setCardWidth(value) { this.updateConfig({ cardWidth: value }); },
        setCardWidthMd(value) { this.updateConfig({ cardWidthMd: value }); },
        setShowCategory(value) { this.updateConfig({ showCategory: value }); },
        setShowIcons(value) { this.updateConfig({ showIcons: value }); },


        getRows() { return this.state.rows; },
        getMaxHeight() { return this.state.maxHeight; },
        getCardWidth() { return this.state.cardWidth; },
        getCardWidthMd() { return this.state.cardWidthMd; },
        getShowCategory() { return this.state.showCategory; },
        getShowIcons() { return this.state.showIcons; },
        getOrientation() { return this.state.orientation; },

        // Atalhos para atualização
        setRows(value) { this.updateConfig({ rows: value }); },
        setMaxHeight(value) { this.updateConfig({ maxHeight: value }); },
        setCardWidth(value) { this.updateConfig({ cardWidth: value }); },
        setCardWidthMd(value) { this.updateConfig({ cardWidthMd: value }); },
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

    // Listener para quando os componentes forem carregados
    document.addEventListener('components-loaded', () => {
        LibraryConfig.applyConfig();
    });

})();
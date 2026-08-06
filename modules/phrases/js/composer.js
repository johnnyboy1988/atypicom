
(function() {
    'use strict';

    const ComposerConfig = {
        defaults: {
            maxHeight: 30, // em vh
            columnsMobile: 2,
            columnsDesktop: 4,
            showCategory: true,
            showTags: true,
        },

        state: {
            maxHeight: 30,
            columnsMobile: 2,
            columnsDesktop: 4,
            showCategory: true,
            showTags: true,
        },

        init() {
            this.loadFromStorage();
            this.applyConfig();
            console.log('📝 ComposerConfig inicializado:', this.state);
            return this;
        },

        loadFromStorage() {
            try {
                const saved = localStorage.getItem('composer_config');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    this.state = { ...this.defaults, ...parsed };
                    console.log('📝 Configuração carregada:', this.state);
                } else {
                    this.state = { ...this.defaults };
                }
            } catch (e) {
                console.error('Erro ao carregar configuração:', e);
                this.state = { ...this.defaults };
            }
        },

        saveToStorage() {
            try {
                localStorage.setItem('composer_config', JSON.stringify(this.state));
                console.log('📝 Configuração salva:', this.state);
            } catch (e) {
                console.error('Erro ao salvar configuração:', e);
            }
        },

        applyConfig() {
            const composer = document.querySelector('#composer-container section');
            if (!composer) return;

            const scrollContainer = composer.querySelector('.composer-scroll');
            if (scrollContainer) {
                scrollContainer.style.maxHeight = `${this.state.maxHeight}vh`;
            }
            
            document.dispatchEvent(new CustomEvent('composer-config-updated', {
                detail: { config: this.state }
            }));
        },

        updateConfig(newConfig) {
            this.state = { ...this.state, ...newConfig };
            this.saveToStorage();
            this.applyConfig();
            
            document.dispatchEvent(new CustomEvent('composer-config-updated', {
                detail: { config: this.state }
            }));
        },

        getMaxHeight() { return this.state.maxHeight; },
        getColumnsMobile() { return this.state.columnsMobile; },
        getColumnsDesktop() { return this.state.columnsDesktop; },
        getShowCategory() { return this.state.showCategory; },
        getShowTags() { return this.state.showTags; },

        setMaxHeight(value) { this.updateConfig({ maxHeight: value }); },
        setColumnsMobile(value) { this.updateConfig({ columnsMobile: value }); },
        setColumnsDesktop(value) { this.updateConfig({ columnsDesktop: value }); },
        setShowCategory(value) { this.updateConfig({ showCategory: value }); },
        setShowTags(value) { this.updateConfig({ showTags: value }); },

        reset() {
            this.state = { ...this.defaults };
            this.saveToStorage();
            this.applyConfig();
            console.log('📝 Configuração resetada para padrão');
        }
    };

    window.ComposerConfig = ComposerConfig;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ComposerConfig.init());
    } else {
        ComposerConfig.init();
    }

    document.addEventListener('components-loaded', () => {
        ComposerConfig.applyConfig();
    });

})();
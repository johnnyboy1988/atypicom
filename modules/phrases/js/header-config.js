// header-config.js
// Gerenciamento de configurações do header

const HEADER_CONFIG_KEY = 'header_config';

// Configurações padrão
const DEFAULT_CONFIG = {
    displayMode: 'phrases', // 'phrases' | 'snap-grid'
    filterMode: 'OR', // 'AND' | 'OR'
    createCard: true,
    editCard: false,
    createTag: true,
    createCategory: true,
    iconProviders: {
        iconify: true,
        openmoji: true,
    },
};

// Classe HeaderConfig
class HeaderConfig {
    constructor() {
        this.config = this.loadConfig();
    }

    // Carrega configuração do localStorage
    loadConfig() {
        try {
            const saved = localStorage.getItem(HEADER_CONFIG_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge com defaults (garante que novas propriedades existam)
                return { ...DEFAULT_CONFIG, ...parsed };
            }
        } catch (e) {
            console.warn('Erro ao carregar config do header:', e);
        }
        return { ...DEFAULT_CONFIG };
    }

    // Salva configuração no localStorage
    saveConfig() {
        try {
            localStorage.setItem(HEADER_CONFIG_KEY, JSON.stringify(this.config));
        } catch (e) {
            console.warn('Erro ao salvar config do header:', e);
        }
    }

    // Atualiza uma configuração específica
    updateConfig(newConfig) {
        // Atualiza o objeto de configuração
        Object.assign(this.config, newConfig);
        // Salva no localStorage
        this.saveConfig();
        // Dispara evento para sincronizar outras instâncias
        window.dispatchEvent(new CustomEvent('header-config-changed', {
            detail: { config: this.config }
        }));
        return this.config;
    }

    // Atualiza o modo de exibição
    setDisplayMode(mode) {
        if (mode === 'phrases' || mode === 'snap-grid') {
            return this.updateConfig({ displayMode: mode });
        }
        return this.config;
    }

    // Atualiza o modo de filtro
    setFilterMode(mode) {
        if (mode === 'AND' || mode === 'OR') {
            return this.updateConfig({ filterMode: mode });
        }
        return this.config;
    }

    // Atualiza configurações de ícones
    setIconProvider(provider, enabled) {
        const iconProviders = { ...this.config.iconProviders };
        if (provider === 'iconify' || provider === 'openmoji') {
            iconProviders[provider] = enabled;
            return this.updateConfig({ iconProviders });
        }
        return this.config;
    }

    // Toggle de uma configuração booleana
    toggleConfig(key) {
        if (typeof this.config[key] === 'boolean') {
            return this.updateConfig({ [key]: !this.config[key] });
        }
        return this.config;
    }

    // Reseta para configurações padrão
    reset() {
        this.config = { ...DEFAULT_CONFIG };
        this.saveConfig();
        window.dispatchEvent(new CustomEvent('header-config-changed', {
            detail: { config: this.config }
        }));
        return this.config;
    }

    // Getters
    getDisplayMode() {
        return this.config.displayMode;
    }

    getFilterMode() {
        return this.config.filterMode;
    }

    getConfig() {
        return { ...this.config };
    }

    // Verifica se uma configuração está ativa
    isEnabled(key) {
        return this.config[key] === true;
    }

    // Verifica se um provider de ícone está ativo
    isIconProviderEnabled(provider) {
        return this.config.iconProviders && this.config.iconProviders[provider] === true;
    }
}

// Cria uma instância única (Singleton)
const headerConfig = new HeaderConfig();

// Expõe globalmente para uso em outras partes do código
window.HeaderConfig = headerConfig;

// Expõe também a classe para uso em outras partes
window.HeaderConfigClass = HeaderConfig;

console.log('HeaderConfig carregado:', headerConfig.getConfig());

// Exemplo de uso:
// window.HeaderConfig.setDisplayMode('snap-grid')
// window.HeaderConfig.setFilterMode('AND')
// window.HeaderConfig.toggleConfig('createCard')
// window.HeaderConfig.reset()
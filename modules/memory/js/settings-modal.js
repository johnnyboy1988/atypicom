const MEMORY_CONFIG_KEY = 'memory_game_config';

const DEFAULT_CONFIG = {
    categories: [],
    tags: [],
    gridSize: 4,
    mode: 'image-text',
    useCategoryColors: true,
    open: false
};

function loadMemoryConfig() {
    try {
        const data = localStorage.getItem(MEMORY_CONFIG_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return { ...DEFAULT_CONFIG, ...parsed };
        }
    } catch (e) {
        console.error('Erro ao carregar configurações do Memory Game:', e);
    }
    return { ...DEFAULT_CONFIG };
}

function saveMemoryConfig(config) {
    try {
        localStorage.setItem(MEMORY_CONFIG_KEY, JSON.stringify(config));
        console.log('Configurações do Memory Game salvas:', config);
    } catch (e) {
        console.error('Erro ao salvar configurações do Memory Game:', e);
    }
}

function resetMemoryConfig() {
    try {
        localStorage.removeItem(MEMORY_CONFIG_KEY);
        console.log('Configurações do Memory Game resetadas');
        return { ...DEFAULT_CONFIG };
    } catch (e) {
        console.error('Erro ao resetar configurações do Memory Game:', e);
        return { ...DEFAULT_CONFIG };
    }
}

function updateMemoryConfig(config, key, value) {
    config[key] = value;
    saveMemoryConfig(config);
    return config;
}

function toggleMemoryCategory(config, categoryName) {
    const index = config.categories.indexOf(categoryName);
    if (index >= 0) {
        config.categories.splice(index, 1);
    } else {
        config.categories.push(categoryName);
    }
    saveMemoryConfig(config);
    return config;
}

function toggleMemoryTag(config, tagName) {
    const index = config.tags.indexOf(tagName);
    if (index >= 0) {
        config.tags.splice(index, 1);
    } else {
        config.tags.push(tagName);
    }
    saveMemoryConfig(config);
    return config;
}

window.MemoryConfig = {
    load: loadMemoryConfig,
    save: saveMemoryConfig,
    reset: resetMemoryConfig,
    update: updateMemoryConfig,
    toggleCategory: toggleMemoryCategory,
    toggleTag: toggleMemoryTag,
    DEFAULT: DEFAULT_CONFIG,
    KEY: MEMORY_CONFIG_KEY
};

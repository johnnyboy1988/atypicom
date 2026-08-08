const JOKENPO_CONFIG_KEY = 'jokenpo_config';

const DEFAULT_CONFIG = {
    twoPlayerMode: false,
    useHandIcons: true,
    clearDelay: 5000,
    showRules: false,
    showSettings: false,
    player1Score: 0,
    player2Score: 0,
    ties: 0,
    totalGames: 0
};

function loadJokenpoConfig() {
    try {
        const data = localStorage.getItem(JOKENPO_CONFIG_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return { ...DEFAULT_CONFIG, ...parsed };
        }
    } catch (e) {
        console.error('Erro ao carregar configurações do Jokenpô:', e);
    }
    return { ...DEFAULT_CONFIG };
}

function saveJokenpoConfig(config) {
    try {
        localStorage.setItem(JOKENPO_CONFIG_KEY, JSON.stringify(config));
        console.log('Configurações do Jokenpô salvas:', config);
    } catch (e) {
        console.error('Erro ao salvar configurações do Jokenpô:', e);
    }
}

function resetJokenpoGame(config) {
    config.player1Score = 0;
    config.player2Score = 0;
    config.ties = 0;
    config.totalGames = 0;
    saveJokenpoConfig(config);
    return config;
}

function updateJokenpoConfig(config, key, value) {
    config[key] = value;
    saveJokenpoConfig(config);
    return config;
}

window.JokenpoConfig = {
    load: loadJokenpoConfig,
    save: saveJokenpoConfig,
    reset: resetJokenpoGame,
    update: updateJokenpoConfig,
    DEFAULT: DEFAULT_CONFIG,
    KEY: JOKENPO_CONFIG_KEY
};
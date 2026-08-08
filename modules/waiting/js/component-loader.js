const COMPONENTS_PATH = './components';

async function loadComponent(containerId, componentName) {
    try {
        const response = await fetch(`${COMPONENTS_PATH}/${componentName}.html`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ao carregar ${componentName}.html`);
        }
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container "${containerId}" não encontrado.`);
        }
        container.innerHTML = await response.text();
        if (window.Alpine) {
            Alpine.initTree(container);
        }
    } catch (error) {
        console.error(`Erro ao carregar "${componentName}":`, error);
        throw error;
    }
}

async function loadComponents() {
    const components = [
        ['header-container', 'header']
    ];
    await Promise.all(components.map(([containerId, componentName]) =>
        loadComponent(containerId, componentName)
    ));
    document.dispatchEvent(new CustomEvent('components-loaded'));
}

window.loadComponents = loadComponents;
const COMPONENTS_PATH = './components';

async function loadComponent(containerId, componentName) {

    try {

        const response = await fetch(
            `${COMPONENTS_PATH}/${componentName}.html`
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status} ao carregar ${componentName}.html`
            );
        }

        const container = document.getElementById(containerId);

        if (!container) {
            throw new Error(
                `Container "${containerId}" não encontrado.`
            );
        }

        container.innerHTML = await response.text();

    } catch (error) {

        console.error(
            `Erro ao carregar o componente "${componentName}":`,
            error
        );

        throw error;
    }

}

async function loadComponents() {

    const components = [
        ['header-container', 'header'],
        ['composer-container', 'composer'],
        ['filters-container', 'filters'],
        ['library-container', 'library'],
        ['modal-container', 'modal-create-card']
    ];

    await Promise.all(
        components.map(([containerId, componentName]) =>
            loadComponent(containerId, componentName)
        )
    );

    document.dispatchEvent(
        new CustomEvent('components-loaded')
    );

}
async function loadComponent(containerId, file) {

    const response = await fetch(file);

    if (!response.ok) {
        throw new Error(`Erro carregando ${file}`);
    }

    const html = await response.text();

    document.getElementById(containerId).innerHTML = html;
}

async function loadComponents() {

    await Promise.all([
        loadComponent('header-container', './components/header.html'),
        loadComponent('composer-container', './components/composer.html'),
        loadComponent('filters-container', './components/filters.html'),
        loadComponent('library-container', './components/library.html'),
        loadComponent('modal-container', './components/modal-create-card.html')
    ]);

    document.dispatchEvent(
        new CustomEvent('components-loaded')
    );
}
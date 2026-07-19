async function loadComponents() {
  const components = [
    { id: 'header-container', path: './components/header.html' },
    { id: 'controls-container', path: './components/controls.html' },
    { id: 'maze-container', path: './components/maze-grid.html' }
  ];

  await Promise.all(components.map(async (comp) => {
    try {
      const response = await fetch(comp.path);
      const html = await response.text();
      const container = document.getElementById(comp.id);
      if (container) {
        container.innerHTML = html;
      }
    } catch (error) {
      console.error(`Erro ao carregar ${comp.path}:`, error);
    }
  }));

  // console.log('[ComponentLoader] Todos os componentes carregados');
}
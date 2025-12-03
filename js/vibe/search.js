// Setup search functionality
function setupSearch(prompts) {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
      renderMainPrompts(prompts);
      renderSidebarPrompts(prompts);
      return;
    }

    const filtered = prompts.filter(prompt => {
      const app = (prompt.app || '').toLowerCase();
      const content = (prompt.prompt || '').toLowerCase();
      const techstack = (prompt.techstack || '').toLowerCase();
      const contributor = (prompt.contributor || '').toLowerCase();
      
      return app.includes(query) || 
             content.includes(query) || 
             techstack.includes(query) ||
             contributor.includes(query);
    });

    renderMainPrompts(filtered);
    renderSidebarPrompts(filtered);
  });
}

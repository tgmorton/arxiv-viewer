document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const categorySelect = document.getElementById('category-select');
  const refreshBtn = document.getElementById('refresh-btn');
  const papersContainer = document.getElementById('papers-container');
  const modal = document.getElementById('paper-modal');
  const modalContent = document.getElementById('modal-content');
  const closeModal = document.querySelector('.close-modal');
  
  // Load papers on page load
  loadPapers();
  
  // Event listeners
  categorySelect.addEventListener('change', loadPapers);
  refreshBtn.addEventListener('click', loadPapers);
  closeModal.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
  
  // Functions
  async function loadPapers() {
    try {
      // Show loading
      papersContainer.innerHTML = '<div class="loading">Loading papers...</div>';
      
      // Get selected feed URL
      const feedUrl = categorySelect.value;
      
      // Fetch papers from API
      const response = await fetch(`/api/papers?feed=${encodeURIComponent(feedUrl)}`);
      if (!response.ok) throw new Error('Failed to fetch papers');
      
      const papers = await response.json();
      
      if (papers.length === 0) {
        papersContainer.innerHTML = '<div class="loading">No papers found</div>';
        return;
      }
      
      // Render papers
      renderPapers(papers);
    } catch (error) {
      console.error('Error loading papers:', error);
      papersContainer.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
    }
  }
  
  function renderPapers(papers) {
    // Clear container
    papersContainer.innerHTML = '';
    
    // Create and append paper cards
    papers.forEach(paper => {
      const card = createPaperCard(paper);
      papersContainer.appendChild(card);
      
      // Add click event to open modal
      card.addEventListener('click', () => openPaperModal(paper));
    });
  }
  
  function createPaperCard(paper) {
    const card = document.createElement('div');
    card.className = 'paper-card';
    
    // Format date
    const date = new Date(paper.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Clean description (remove HTML tags)
    const cleanDescription = paper.description ? paper.description.replace(/<\/?[^>]+(>|$)/g, "") : 'No summary available';
    
    // Create card content
    card.innerHTML = `
      <h3 class="paper-title">${paper.title}</h3>
      <p class="paper-author">${paper.creator || 'Unknown authors'}</p>
      <p class="paper-date">${formattedDate}</p>
      <p class="paper-summary">${cleanDescription}</p>
    `;
    
    return card;
  }
  
  function openPaperModal(paper) {
    // Clean description (remove HTML tags)
    const cleanDescription = paper.description ? paper.description.replace(/<\/?[^>]+(>|$)/g, "") : 'No summary available';
    
    // Format date
    const date = new Date(paper.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Set modal content
    modalContent.innerHTML = `
      <h2 class="modal-paper-title">${paper.title}</h2>
      <p class="modal-paper-authors">${paper.creator || 'Unknown authors'}</p>
      <p class="modal-paper-date">${formattedDate}</p>
      <div class="modal-paper-summary">${cleanDescription}</div>
      <a href="${paper.link}" class="paper-link" target="_blank">View on ArXiv</a>
    `;
    
    // Show modal
    modal.style.display = 'block';
  }
});
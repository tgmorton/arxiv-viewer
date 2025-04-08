document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const categorySelect = document.getElementById('category-select');
  const refreshBtn = document.getElementById('refresh-btn');
  const papersContainer = document.getElementById('papers-container');
  const papersTable = document.getElementById('papers-table');
  const papersTableBody = papersTable.querySelector('tbody');
  const gridViewBtn = document.getElementById('grid-view-btn');
  const tableViewBtn = document.getElementById('table-view-btn');
  const modal = document.getElementById('paper-modal');
  const modalContent = document.getElementById('modal-content');
  const closeModal = document.querySelector('.close-modal');
  
  // State
  let currentView = 'table'; // 'grid' or 'table'
  let paperData = []; // Store papers data
  let expandedPapers = {}; // Track expanded abstracts
  let selectedPapers = {}; // Track selected papers
  
  // Load papers on page load
  loadPapers();
  
  // Event listeners
  categorySelect.addEventListener('change', loadPapers);
  refreshBtn.addEventListener('click', loadPapers);
  closeModal.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
  
  // View toggle listeners
  gridViewBtn.addEventListener('click', () => {
    setView('grid');
  });
  
  tableViewBtn.addEventListener('click', () => {
    setView('table');
  });
  
  // Functions
  function setView(view) {
    currentView = view;
    
    // Update button states
    gridViewBtn.classList.toggle('active', view === 'grid');
    tableViewBtn.classList.toggle('active', view === 'table');
    
    // Update visibility
    papersContainer.style.display = view === 'grid' ? 'grid' : 'none';
    papersTable.style.display = view === 'table' ? 'table' : 'none';
    
    // Render if we have data
    if (paperData.length > 0) {
      if (view === 'grid') {
        renderPapersGrid(paperData);
      } else {
        renderPapersTable(paperData);
      }
    }
  }
  
  function toggleAbstract(event, paperId) {
    event.stopPropagation(); // Prevent opening the modal
    expandedPapers[paperId] = !expandedPapers[paperId];
    
    // Re-render based on current view
    if (currentView === 'grid') {
      renderPapersGrid(paperData);
    } else {
      renderPapersTable(paperData);
    }
  }
  
  function togglePaperSelection(event, paperId) {
    event.stopPropagation(); // Prevent opening the modal
    selectedPapers[paperId] = !selectedPapers[paperId];
    
    // Re-render based on current view
    if (currentView === 'grid') {
      renderPapersGrid(paperData);
    } else {
      renderPapersTable(paperData);
    }
  }
  
  function truncateText(text, maxLength = 150) {
    if (!text) return 'No summary available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  async function loadPapers() {
    try {
      // Show loading
      papersTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="loading">Loading papers...</div>
          </td>
        </tr>
      `;
      papersContainer.innerHTML = '<div class="loading">Loading papers...</div>';
      
      // Get selected feed URL
      const feedUrl = categorySelect.value;
      
      // Fetch papers from API
      const response = await fetch(`/api/papers?feed=${encodeURIComponent(feedUrl)}`);
      if (!response.ok) throw new Error('Failed to fetch papers');
      
      const papers = await response.json();
      
      if (papers.length === 0) {
        papersTableBody.innerHTML = `
          <tr>
            <td colspan="5">
              <div class="loading">No papers found</div>
            </td>
          </tr>
        `;
        papersContainer.innerHTML = '<div class="loading">No papers found</div>';
        return;
      }
      
      // Store the data
      paperData = papers;
      
      // Render based on current view
      if (currentView === 'grid') {
        renderPapersGrid(papers);
      } else {
        renderPapersTable(papers);
      }
    } catch (error) {
      console.error('Error loading papers:', error);
      papersTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="loading">Error: ${error.message}</div>
          </td>
        </tr>
      `;
      papersContainer.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
    }
  }
  
  function renderPapersGrid(papers) {
    // Clear container
    papersContainer.innerHTML = '';
    
    // Create and append paper cards
    papers.forEach(paper => {
      const card = createPaperCard(paper);
      papersContainer.appendChild(card);
    });
  }
  
  function renderPapersTable(papers) {
    // Clear table body
    papersTableBody.innerHTML = '';
    
    // Create and append table rows
    papers.forEach(paper => {
      const row = createPaperRow(paper);
      papersTableBody.appendChild(row);
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
    
    // Determine if expanded
    const isExpanded = expandedPapers[paper.id];
    const displayDescription = isExpanded ? cleanDescription : truncateText(cleanDescription);
    
    // Create checkbox for selection
    const isSelected = selectedPapers[paper.id];
    
    // Create card content
    card.innerHTML = `
      <div class="paper-id">${paper.id}</div>
      <input type="checkbox" class="paper-select" ${isSelected ? 'checked' : ''}>
      <h3 class="paper-title">${paper.title}</h3>
      <p class="paper-author">${paper.creator || 'Unknown authors'}</p>
      <p class="paper-date">${formattedDate}</p>
      <p class="paper-summary">
        ${displayDescription}
        <button class="more-less-btn">${isExpanded ? '[less]' : '[more]'}</button>
      </p>
      <a href="${paper.link}" class="paper-link" target="_blank">View on ArXiv</a>
    `;
    
    // Add event listeners
    const moreBtn = card.querySelector('.more-less-btn');
    moreBtn.addEventListener('click', (e) => toggleAbstract(e, paper.id));
    
    const checkbox = card.querySelector('.paper-select');
    checkbox.addEventListener('change', (e) => togglePaperSelection(e, paper.id));
    
    // Add click event to open modal (except for checkboxes and more/less buttons)
    card.addEventListener('click', () => openPaperModal(paper));
    
    return card;
  }
  
  function createPaperRow(paper) {
    const row = document.createElement('tr');
    row.classList.add(paper.id % 2 === 0 ? 'even' : 'odd');
    
    // Format date
    const date = new Date(paper.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Clean description (remove HTML tags)
    const cleanDescription = paper.description ? paper.description.replace(/<\/?[^>]+(>|$)/g, "") : 'No summary available';
    
    // Determine if expanded
    const isExpanded = expandedPapers[paper.id];
    const displayDescription = isExpanded ? cleanDescription : truncateText(cleanDescription);
    
    // Determine if selected
    const isSelected = selectedPapers[paper.id];
    
    // Create row content
    row.innerHTML = `
      <td class="checkbox-cell">
        <input type="checkbox" class="paper-select" ${isSelected ? 'checked' : ''}>
      </td>
      <td class="paper-id">${paper.id}</td>
      <td>
        <div class="paper-title">${paper.title}</div>
        <div class="paper-author">${paper.creator || 'Unknown authors'}</div>
        <div class="paper-summary">
          ${displayDescription}
          <button class="more-less-btn">${isExpanded ? '[less]' : '[more]'}</button>
        </div>
      </td>
      <td class="date-cell">${formattedDate}</td>
      <td class="link-cell">
        <a href="${paper.link}" class="paper-link-small" target="_blank">view</a>
      </td>
    `;
    
    // Add event listeners
    const moreBtn = row.querySelector('.more-less-btn');
    moreBtn.addEventListener('click', (e) => toggleAbstract(e, paper.id));
    
    const checkbox = row.querySelector('.paper-select');
    checkbox.addEventListener('change', (e) => togglePaperSelection(e, paper.id));
    
    // Add click event to open modal (delegated to the row)
    row.addEventListener('click', (e) => {
      // Only open modal if not clicking on checkbox, link or more/less button
      if (!e.target.closest('.paper-select') && 
          !e.target.closest('.more-less-btn') &&
          !e.target.closest('.paper-link-small')) {
        openPaperModal(paper);
      }
    });
    
    return row;
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
      <div class="modal-paper-id">${paper.id}</div>
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
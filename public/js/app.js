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
  const selectionModal = document.getElementById('selection-modal');
  const selectionContent = document.getElementById('selection-content');
  const closeSelectionModal = document.querySelector('.close-selection-modal');
  const showSelectionBtn = document.getElementById('show-selection-btn');
  const selectionCount = document.getElementById('selection-count');
  const copySelectionBtn = document.getElementById('copy-selection-btn');
  const clearSelectionBtn = document.getElementById('clear-selection-btn');
  
  // State
  let currentView = 'table'; // 'grid' or 'table'
  let paperData = []; // Store papers data
  let expandedPapers = {}; // Track expanded abstracts
  let selectedPapers = {}; // Track selected papers
  let channelInfo = {}; // Store info about the current feed
  
  // Load papers on page load
  loadPapers();
  
  // Event listeners
  categorySelect.addEventListener('change', loadPapers);
  refreshBtn.addEventListener('click', loadPapers);
  closeModal.addEventListener('click', () => modal.style.display = 'none');
  closeSelectionModal.addEventListener('click', () => selectionModal.style.display = 'none');
  showSelectionBtn.addEventListener('click', showSelectionModal);
  copySelectionBtn.addEventListener('click', copySelectionToClipboard);
  clearSelectionBtn.addEventListener('click', clearSelection);
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === selectionModal) selectionModal.style.display = 'none';
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
    
    // Find the paper in our data
    const paper = paperData.find(p => p.id === paperId);
    if (!paper) return;
    
    // Toggle selection state
    if (selectedPapers[paperId]) {
      delete selectedPapers[paperId];
    } else {
      selectedPapers[paperId] = paper;
    }
    
    // Update selection count and button visibility
    updateSelectionUI();
    
    // Re-render based on current view
    if (currentView === 'grid') {
      renderPapersGrid(paperData);
    } else {
      renderPapersTable(paperData);
    }
  }
  
  function updateSelectionUI() {
    const count = Object.keys(selectedPapers).length;
    
    // Update selection count
    selectionCount.textContent = count > 0 ? `(${count})` : '';
    
    // Show/hide selection button
    showSelectionBtn.style.display = count > 0 ? 'block' : 'none';
  }
  
  function showSelectionModal() {
    const count = Object.keys(selectedPapers).length;
    
    if (count === 0) {
      selectionContent.innerHTML = '<div class="no-selection-message">No papers selected</div>';
    } else {
      // Create table for selected papers
      let html = `
        <table class="selection-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Authors</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      // Add row for each selected paper
      Object.values(selectedPapers).forEach((paper, index) => {
        html += `
          <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
            <td class="paper-id">${paper.id}</td>
            <td>${paper.title}</td>
            <td>${paper.creator || 'Unknown authors'}</td>
            <td class="link-cell">
              <a href="${paper.link}" class="paper-link-small" target="_blank">view</a>
            </td>
          </tr>
        `;
      });
      
      html += '</tbody></table>';
      selectionContent.innerHTML = html;
    }
    
    // Show the modal
    selectionModal.style.display = 'block';
  }
  
  function copySelectionToClipboard() {
    const count = Object.keys(selectedPapers).length;
    
    if (count === 0) return;
    
    // Format the selection as text - only URLs
    const text = Object.values(selectedPapers).map(paper => paper.link).join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Paper URLs copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy to clipboard');
      });
  }
  
  function clearSelection() {
    selectedPapers = {};
    updateSelectionUI();
    
    // Re-render the current view
    if (currentView === 'grid') {
      renderPapersGrid(paperData);
    } else {
      renderPapersTable(paperData);
    }
    
    // Close the modal
    selectionModal.style.display = 'none';
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
          <td colspan="6">
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
      
      const data = await response.json();
      
      // Store the channel info
      channelInfo = data.channelInfo || {
        title: 'ArXiv Papers',
        isComplete: true,
        totalResults: 0
      };
      
      // Get papers array
      const papers = data.papers || [];
      
      if (papers.length === 0) {
        papersTableBody.innerHTML = `
          <tr>
            <td colspan="6">
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
          <td colspan="6">
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
    
    // Add end of feed message if applicable
    if (channelInfo.isComplete) {
      const endMessage = document.createElement('div');
      endMessage.className = 'end-of-feed';
      endMessage.textContent = `End of results • ${papers.length} papers from ${channelInfo.title}`;
      papersContainer.appendChild(endMessage);
    }
  }
  
  function renderPapersTable(papers) {
    // Clear table body
    papersTableBody.innerHTML = '';
    
    // Create and append table rows
    papers.forEach(paper => {
      const rowsFragment = createPaperRow(paper);
      papersTableBody.appendChild(rowsFragment);
    });
    
    // Add end of feed message if applicable
    if (channelInfo.isComplete) {
      const endRow = document.createElement('tr');
      endRow.innerHTML = `
        <td colspan="6">
          <div class="end-of-feed">End of results • ${papers.length} papers from ${channelInfo.title}</div>
        </td>
      `;
      papersTableBody.appendChild(endRow);
    }
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
    // Create main row for paper details
    const mainRow = document.createElement('tr');
    mainRow.classList.add(paper.id % 2 === 0 ? 'even' : 'odd', 'paper-row');
    
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
    const displayDescription = isExpanded ? cleanDescription : truncateText(cleanDescription, 300);
    
    // Determine if selected
    const isSelected = selectedPapers[paper.id];
    
    // Create main row content (title and metadata)
    mainRow.innerHTML = `
      <td class="checkbox-cell">
        <input type="checkbox" class="paper-select" ${isSelected ? 'checked' : ''}>
      </td>
      <td class="paper-id">${paper.id}</td>
      <td class="paper-title">${paper.title}</td>
      <td class="paper-author">${paper.creator || 'Unknown authors'}</td>
      <td class="date-cell">${formattedDate}</td>
      <td class="link-cell">
        <a href="${paper.link}" class="paper-link-small" target="_blank">view</a>
      </td>
    `;
    
    // Create abstract row
    const abstractRow = document.createElement('tr');
    abstractRow.classList.add(paper.id % 2 === 0 ? 'even' : 'odd');
    abstractRow.innerHTML = `
      <td colspan="6" class="paper-summary">
        ${displayDescription}
        <button class="more-less-btn">${isExpanded ? '[less]' : '[more]'}</button>
      </td>
    `;
    
    // Create a document fragment to hold both rows
    const fragment = document.createDocumentFragment();
    fragment.appendChild(mainRow);
    fragment.appendChild(abstractRow);
    
    // Add event listeners
    const moreBtn = abstractRow.querySelector('.more-less-btn');
    moreBtn.addEventListener('click', (e) => toggleAbstract(e, paper.id));
    
    const checkbox = mainRow.querySelector('.paper-select');
    checkbox.addEventListener('change', (e) => togglePaperSelection(e, paper.id));
    
    // Add click event to open modal (delegated to the rows)
    mainRow.addEventListener('click', (e) => {
      // Only open modal if not clicking on checkbox, link or more/less button
      if (!e.target.closest('.paper-select') && 
          !e.target.closest('.paper-link-small')) {
        openPaperModal(paper);
      }
    });
    
    abstractRow.addEventListener('click', (e) => {
      // Only open modal if not clicking on more/less button
      if (!e.target.closest('.more-less-btn')) {
        openPaperModal(paper);
      }
    });
    
    return fragment;
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
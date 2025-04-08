document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const categorySelect = document.getElementById('category-select');
  const resultsPerPageSelect = document.getElementById('results-per-page');
  const refreshBtn = document.getElementById('refresh-btn');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  const paginationInfo = document.getElementById('pagination-info');
  // Bottom pagination elements
  const prevPageBtnBottom = document.getElementById('prev-page-btn-bottom');
  const nextPageBtnBottom = document.getElementById('next-page-btn-bottom');
  const paginationInfoBottom = document.getElementById('pagination-info-bottom');
  const papersContainer = document.getElementById('papers-container');
  const papersTable = document.getElementById('papers-table');
  const papersTableHead = papersTable.querySelector('thead');
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
  let currentPage = 1; // Current page number
  let currentSearchTerm = ''; // Current search term
  
  // Load papers on page load
  loadPapers();
  
  // Column resizing variables
  let isResizing = false;
  let currentResizer = null;
  let startX, startWidth, nextStartWidth;
  
  // Event listeners
  categorySelect.addEventListener('change', () => {
    currentPage = 1;
    loadPapers();
  });
  
  resultsPerPageSelect.addEventListener('change', () => {
    currentPage = 1;
    loadPapers();
  });
  
  refreshBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchTerm = '';
    loadPapers();
  });
  
  // Search functionality
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== currentSearchTerm) {
      currentSearchTerm = searchTerm;
      currentPage = 1;
      loadPapers();
    }
  }
  
  prevPageBtn.addEventListener('click', goToPrevPage);
  nextPageBtn.addEventListener('click', goToNextPage);
  
  // Bottom pagination button event listeners
  prevPageBtnBottom.addEventListener('click', goToPrevPage);
  nextPageBtnBottom.addEventListener('click', goToNextPage);
  
  closeModal.addEventListener('click', () => modal.style.display = 'none');
  closeSelectionModal.addEventListener('click', () => selectionModal.style.display = 'none');
  showSelectionBtn.addEventListener('click', showSelectionModal);
  copySelectionBtn.addEventListener('click', copySelectionToClipboard);
  clearSelectionBtn.addEventListener('click', clearSelection);
  
  // Initialize column resizing after table is loaded
  function initColumnResizing() {
    const headers = papersTableHead.querySelectorAll('th');
    
    headers.forEach((header, index) => {
      if (index < headers.length - 1) { // Skip last header
        const resizer = header;
        
        resizer.addEventListener('mousedown', function(e) {
          // Only activate if clicking on the resizer area (right 5px)
          const headerRect = header.getBoundingClientRect();
          const resizerAreaX = headerRect.right - 5;
          
          if (e.clientX >= resizerAreaX) {
            isResizing = true;
            currentResizer = header;
            startX = e.pageX;
            startWidth = parseInt(window.getComputedStyle(header).width, 10);
            
            // Get the next header for adjustment
            const nextHeader = headers[index + 1];
            if (nextHeader) {
              nextStartWidth = parseInt(window.getComputedStyle(nextHeader).width, 10);
            }
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            e.preventDefault();
          }
        });
      }
    });
    
    function handleMouseMove(e) {
      if (!isResizing) return;
      
      const index = Array.from(headers).indexOf(currentResizer);
      const nextHeader = headers[index + 1];
      
      if (!nextHeader) return;
      
      const diffX = e.pageX - startX;
      
      // Limit minimum width to 30px
      const newWidth = Math.max(30, startWidth + diffX);
      const newNextWidth = Math.max(30, nextStartWidth - diffX);
      
      currentResizer.style.width = `${newWidth}px`;
      nextHeader.style.width = `${newNextWidth}px`;
      
      // Update all cells in this column
      const tableRows = papersTable.querySelectorAll('tr');
      tableRows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length > index) {
          cells[index].style.width = `${newWidth}px`;
          if (cells.length > index + 1) {
            cells[index + 1].style.width = `${newNextWidth}px`;
          }
        }
      });
    }
    
    function handleMouseUp() {
      isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }
  
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
  
  function truncateText(text, maxLength = 500) {
    if (!text) return 'No summary available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  function goToPrevPage() {
    if (channelInfo.hasPrevPage) {
      currentPage--;
      loadPapers();
      window.scrollTo(0, 0);
    }
  }
  
  function goToNextPage() {
    if (channelInfo.hasNextPage) {
      currentPage++;
      loadPapers();
      window.scrollTo(0, 0);
    }
  }
  
  function updatePaginationUI() {
    // Update pagination display for both top and bottom
    const paginationText = `Page ${channelInfo.page} of ${channelInfo.totalPages || 1}`;
    paginationInfo.textContent = paginationText;
    paginationInfoBottom.textContent = paginationText;
    
    // Enable/disable pagination buttons (both top and bottom)
    const hasPrev = channelInfo.hasPrevPage;
    const hasNext = channelInfo.hasNextPage;
    
    prevPageBtn.disabled = !hasPrev;
    nextPageBtn.disabled = !hasNext;
    
    prevPageBtnBottom.disabled = !hasPrev;
    nextPageBtnBottom.disabled = !hasNext;
  }
  
  async function loadPapers() {
    try {
      // Show loading
      papersTableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="loading">Loading papers...</div>
          </td>
        </tr>
      `;
      papersContainer.innerHTML = '<div class="loading">Loading papers...</div>';
      
      // Get parameters
      const category = categorySelect.value;
      const pageSize = parseInt(resultsPerPageSelect.value);
      
      // Build the API URL with search parameters if needed
      let apiUrl = `/api/papers?category=${encodeURIComponent(category)}&page=${currentPage}&pageSize=${pageSize}`;
      
      // Add search term if present
      if (currentSearchTerm) {
        apiUrl += `&search=${encodeURIComponent(currentSearchTerm)}`;
      }
      
      // Fetch papers from API
      const response = await fetch(apiUrl);
      
      if (!response.ok) throw new Error('Failed to fetch papers');
      
      const data = await response.json();
      
      // Store the channel info
      channelInfo = data.channelInfo || {
        title: 'ArXiv Papers',
        isComplete: true,
        totalResults: 0,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      };
      
      // Update pagination
      updatePaginationUI();
      
      // Get papers array
      const papers = data.papers || [];
      
      if (papers.length === 0) {
        papersTableBody.innerHTML = `
          <tr>
            <td colspan="7">
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
        // Initialize column resizing after table is rendered
        setTimeout(initColumnResizing, 100);
      }
    } catch (error) {
      console.error('Error loading papers:', error);
      papersTableBody.innerHTML = `
        <tr>
          <td colspan="7">
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
    
    // Add results count message
    const resultsMessage = document.createElement('div');
    resultsMessage.className = 'end-of-feed';
    let messageText = `Showing ${papers.length} of ${channelInfo.totalResults} papers from ${channelInfo.title}`;
    
    // Add search term info if searched
    if (currentSearchTerm) {
      messageText += ` matching "${currentSearchTerm}"`;
    }
    
    resultsMessage.textContent = messageText;
    papersContainer.appendChild(resultsMessage);
  }
  
  function renderPapersTable(papers) {
    // Clear table body
    papersTableBody.innerHTML = '';
    
    // Create and append table rows
    papers.forEach(paper => {
      const rowsFragment = createPaperRow(paper);
      papersTableBody.appendChild(rowsFragment);
    });
    
    // Add results count message
    const resultsRow = document.createElement('tr');
    
    let messageText = `Showing ${papers.length} of ${channelInfo.totalResults} papers from ArXiv ${channelInfo.description || ''}`;
    
    // Add search term info if searched
    if (currentSearchTerm) {
      messageText += ` matching "${currentSearchTerm}"`;
    }
    
    resultsRow.innerHTML = `
      <td colspan="7">
        <div class="end-of-feed">${messageText}</div>
      </td>
    `;
    papersTableBody.appendChild(resultsRow);
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
    const displayDescription = isExpanded ? cleanDescription : truncateText(cleanDescription);
    
    // Determine if selected
    const isSelected = selectedPapers[paper.id];
    
    // Get PDF link if available
    const pdfLink = paper.pdfLink || paper.link.replace('/abs/', '/pdf/') + '.pdf';
    
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
        <a href="${pdfLink}" class="paper-link-small" target="_blank" title="Download PDF">PDF</a>
      </td>
      <td class="link-cell">
        <a href="${paper.link}" class="paper-link-small" target="_blank" title="View on ArXiv">view</a>
      </td>
    `;
    
    // Create abstract row
    const abstractRow = document.createElement('tr');
    abstractRow.classList.add('abstract-row');
    abstractRow.innerHTML = `
      <td colspan="7">
        <div class="paper-summary">
          ${displayDescription}
          <button class="more-less-btn">${isExpanded ? '[less]' : '[more]'}</button>
        </div>
      </td>
    `;
    
    // Create a document fragment to hold both rows
    const fragment = document.createDocumentFragment();
    fragment.appendChild(mainRow);
    fragment.appendChild(abstractRow);
    
    // Add event listeners
    const moreBtn = abstractRow.querySelector('.more-less-btn');
    moreBtn.addEventListener('click', (e) => toggleAbstract(e, paper.id));
    
    // Make the entire abstract row clickable to toggle
    abstractRow.addEventListener('click', (e) => {
      // Don't trigger if clicking specifically on the more/less button
      if (!e.target.closest('.more-less-btn')) {
        toggleAbstract(e, paper.id);
      }
    });
    
    const checkbox = mainRow.querySelector('.paper-select');
    checkbox.addEventListener('change', (e) => togglePaperSelection(e, paper.id));
    
    // Add click event to toggle selection (delegated to the main row)
    mainRow.addEventListener('click', (e) => {
      // Only toggle selection if not clicking on checkbox or links
      if (!e.target.closest('.paper-select') && 
          !e.target.closest('a')) {
        togglePaperSelection(e, paper.id);
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
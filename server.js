const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Proxy endpoint for ArXiv RSS feeds (legacy)
app.get('/api/papers-rss', async (req, res) => {
  try {
    const feed = req.query.feed || 'https://rss.arxiv.org/rss/cs.ai';
    const response = await axios.get(feed);
    
    // Parse XML
    const parser = new xml2js.Parser({
      explicitArray: false,
      normalize: true,
      normalizeTags: true
    });
    
    parser.parseString(response.data, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to parse RSS feed' });
      }
      
      // Extract and format paper data
      const items = result.rss.channel.item;
      const papers = Array.isArray(items) ? items.map(item => {
        // Extract paper ID from link
        const idMatch = item.link.match(/abs\/([0-9.]+)$/);
        const id = idMatch ? idMatch[1] : 'unknown';
        
        return {
          id,
          title: item.title,
          link: item.link,
          description: item.description,
          creator: item['dc:creator'],
          date: item.pubdate || new Date().toISOString()
        };
      }) : [];
      
      // Add channel info to include feed title and description
      const channelInfo = {
        title: result.rss.channel.title || 'ArXiv Papers',
        description: result.rss.channel.description || '',
        totalResults: papers.length,
        isComplete: true, // RSS feeds typically provide all results at once
        page: 1,
        totalPages: 1
      };
      
      res.json({
        papers: papers,
        channelInfo: channelInfo
      });
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

// New endpoint using the ArXiv API with pagination and search
app.get('/api/papers', async (req, res) => {
  try {
    // Get query parameters
    const category = req.query.category || 'cs.AI';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 100;
    const sortBy = req.query.sortBy || 'submittedDate';
    const sortOrder = req.query.sortOrder || 'descending';
    const searchTerm = req.query.search || '';
    
    // Calculate start index for pagination
    const start = (page - 1) * pageSize;
    
    // Construct the ArXiv API query
    const apiUrl = 'http://export.arxiv.org/api/query';
    
    // Build search query based on presence of search term
    let searchQuery;
    if (searchTerm) {
      // Search in title and abstract
      searchQuery = `search_query=AND+cat:${category}+AND+%28ti:"${encodeURIComponent(searchTerm)}"+OR+abs:"${encodeURIComponent(searchTerm)}"%29`;
    } else {
      searchQuery = `search_query=cat:${category}`;
    }
    
    const query = `${searchQuery}&start=${start}&max_results=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    
    const response = await axios.get(`${apiUrl}?${query}`);
    
    // Parse XML
    const parser = new xml2js.Parser({
      explicitArray: false,
      normalize: true,
      normalizeTags: true
    });
    
    parser.parseString(response.data, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to parse ArXiv API response' });
      }
      
      // Extract total results and calculate pagination info
      const opensearchTotalResults = parseInt(result.feed['opensearch:totalresults']?._ || 0);
      const totalResults = Math.min(opensearchTotalResults, 10000); // ArXiv API limits to 10k results
      const totalPages = Math.ceil(totalResults / pageSize);
      
      // Extract and format paper data
      const entries = result.feed.entry;
      const papers = Array.isArray(entries) ? entries.map(entry => {
        // Format authors
        const authors = Array.isArray(entry.author) 
          ? entry.author.map(author => author.name).join(', ')
          : entry.author?.name || 'Unknown';
        
        // Extract paper ID from id field
        const idMatch = entry.id.match(/abs\/([0-9.]+)(?:v[0-9]+)?$/);
        const id = idMatch ? idMatch[1] : 'unknown';
        
        // Get primary category
        const primaryCategory = entry.primarycategory?.term || 
                               (Array.isArray(entry.category) ? entry.category[0]?.term : entry.category?.term);
        
        return {
          id,
          title: entry.title.replace(/\\n/g, ' ').trim(),
          link: entry.id,
          description: entry.summary.replace(/\\n/g, ' ').trim(),
          creator: authors,
          date: entry.published || entry.updated || new Date().toISOString(),
          category: primaryCategory,
          pdfLink: entry.link.find(link => link.$.title === 'pdf')?.$.href || null
        };
      }) : [];
      
      // Add channel info
      const channelInfo = {
        title: result.feed.title || 'ArXiv Papers',
        description: `${category} papers from ArXiv`,
        totalResults,
        isComplete: totalResults <= pageSize,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
      
      res.json({
        papers,
        channelInfo
      });
    });
  } catch (error) {
    console.error('Error fetching from ArXiv API:', error);
    res.status(500).json({ error: 'Failed to fetch papers from ArXiv API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
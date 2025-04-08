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

// Proxy endpoint for ArXiv RSS feeds
app.get('/api/papers', async (req, res) => {
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
      
      res.json(papers);
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
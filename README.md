# ArXiv Viewer

A streamlined application for browsing ArXiv research papers with an information-dense interface inspired by financial publications. Built to simplify the discovery and reading of academic papers across different research categories.

This application was designed and coded by [Claude](https://claude.ai/), Anthropic's AI assistant.

## Features

- Browse papers from multiple ArXiv categories with pagination
- View papers in table or grid layout
- Search papers by title and abstract content
- Select and copy paper links to clipboard
- Expandable abstracts for quick scanning
- Direct links to PDF files and ArXiv pages
- Resizable columns for customized viewing
- Responsive design for desktop and mobile devices

![CleanShot 2025-04-07 at 19 05 26@2x](https://github.com/user-attachments/assets/4e77f43d-a8d7-405c-97fa-58f1cab77bc4)


## Installation

```bash
# Clone the repository
git clone https://github.com/tgmorton/arxiv-viewer.git
cd arxiv-viewer

# Install dependencies
npm install

# Start the application
npm start

# For development with auto-reload
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Select a category from the dropdown menu
3. Use the search box to find specific papers
4. Click on a paper row to select it, or use the checkboxes
5. Expand abstracts using the [more] button or by clicking the abstract
6. Access PDFs directly using the PDF link
7. Adjust column widths by dragging the column edges

## Technologies

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript (no frameworks)
- **API**: ArXiv API for paper data
- **Styling**: Custom CSS with responsive design

## License

This project is licensed under the MIT License.

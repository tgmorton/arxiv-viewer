- arXiv viewer application follows design principles inspired by financial publications like the Wall Street Journal, prioritizing information density while maintaining readability. The design aims to create a professional, utilitarian interface that allows researchers to quickly scan and assess large numbers of academic papers.

## Core Design Principles

1. **Information Density**: Maximize the amount of useful content visible at once
2. **Readability**: Ensure text remains legible despite compact presentation
3. **Hierarchy**: Establish clear visual importance through typography and spacing
4. **Functionality**: Prioritize utility over aesthetics while maintaining visual quality
5. **Economy**: Use space, color, and ornamentation sparingly and purposefully

## Typography

### Font Families

- **Primary Text**: Serif fonts that evoke print publications
  - **Preferred**: Georgia, Times New Roman, serif
  - **Fallback**: System serif fonts
- **Monospace Elements**: For paper IDs and technical information
  - **Preferred**: Consolas, Monaco, 'Courier New', monospace

### Font Sizes

- **Base font size**: 12px (body text)
- **Micro text**: 10px (metadata, dates, auxiliary information)
- **Title text**: 13-14px (paper titles)
- **Header text**: 15-16px (section headings)

### Font Weights

- **Normal**: 400 (body text, abstracts)
- **Bold**: 700 (titles, headers, important metadata)
- **Semi-bold**: 600 (sub-headings, emphasized text)

### Line Heights

- **Dense**: 1.2 (data tables, metadata)
- **Readable**: 1.4 (abstracts, descriptions)
- **Headings**: 1.1 (titles and headers)

## Color Palette

### Primary Colors

- **Background**: #FFFFFF (white)
- **Text**: #000000 (black)
- **Secondary background**: #F5F5F5 (light gray for alternating rows)
- **Borders**: #D0D0D0 (medium gray)

### Accent Colors

- **Primary accent**: #121212 (near-black for headers and buttons)
- **Secondary accent**: #1A478E (dark blue for links and interactive elements)
- **Tertiary accent**: #8B0000 (dark red for important elements and selected states)

### Functional Colors

- **Success**: #006400 (dark green)
- **Warning**: #B22222 (firebrick)
- **Error**: #8B0000 (dark red)
- **Selected**: #F0F8FF (very light blue background)
- **Hover**: #F8F8F8 (light gray background)

## Layout and Spacing

### Grid System

- **Base unit**: 4px
- **Vertical rhythm**: Multiples of 4px (4, 8, 12, 16, 24, 32)
- **Horizontal spacing**: Conservative padding (4-8px for dense layouts)
- **Column structure**: 
  - Compact view: Full-width table with fixed columns for metadata
  - Grid view: 2-column or 3-column layout depending on screen width

### Margins and Padding

- **Table cells**: 4px padding (vertical), 8px padding (horizontal)
- **Section margins**: 12px (top and bottom)
- **Component padding**: 8px-12px for bordered components
- **Content separation**: 4px between related items, 12px between groups

### Borders

- **Standard border**: 1px solid #D0D0D0
- **Emphasis border**: 1px solid #000000
- **Section dividers**: 1px solid #000000 (top and bottom for major sections)
- **Cell dividers**: 1px solid #E0E0E0 (lighter for table rows)

## Components

### Tables

- **Row height**: Compact (determined by content rather than fixed)
- **Alternating rows**: White (#FFFFFF) and light gray (#F5F5F5)
- **Header style**: Bold, uppercase, light gray background (#F0F0F0)
- **Cell alignment**: 
  - Left-aligned for text content
  - Right-aligned for numerical data
  - Center-aligned for actions/buttons
- **Hover effect**: Subtle background change (#F8F8F8)

#### Example Table Specification

```
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  line-height: 1.2;
}

.table th {
  background-color: #F0F0F0;
  text-align: left;
  padding: 4px 8px;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid #000000;
}

.table td {
  padding: 4px 8px;
  border-bottom: 1px solid #E0E0E0;
  vertical-align: top;
}

.table tr:nth-child(even) {
  background-color: #F5F5F5;
}

.table tr:hover {
  background-color: #F8F8F8;
}
```

### Cards (Grid View)

- **Border**: 1px solid #D0D0D0
- **Background**: White (#FFFFFF)
- **Padding**: 12px
- **Spacing between cards**: 12px
- **Shadow**: None (flat design)
- **Header area**: Small top margin, bottom border optional
- **Content area**: 8px top margin
- **Footer area**: 8px top margin, optional top border

#### Example Card Specification

```
.card {
  border: 1px solid #D0D0D0;
  background-color: #FFFFFF;
  padding: 12px;
  font-size: 12px;
  line-height: 1.4;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
}

.card-meta {
  font-size: 10px;
  color: #505050;
  margin-bottom: 8px;
}

.card-content {
  margin-top: 8px;
}

.card-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #E0E0E0;
  display: flex;
  justify-content: space-between;
}
```

### Buttons

- **Primary buttons**: Dark background (#121212), white text, no border
- **Secondary buttons**: Light gray background (#E0E0E0), black text
- **Text buttons**: No background, underline on hover
- **Button sizes**: 
  - Small: 20px height, 8px horizontal padding, 10px font
  - Medium: 24px height, 12px horizontal padding, 12px font
- **Button states**: 
  - Hover: Slight lightening of background
  - Active: Slight darkening of background
  - Disabled: Gray (#CCCCCC) with reduced opacity

#### Example Button Specification

```
.button {
  font-size: 12px;
  padding: 4px 12px;
  border: none;
  background-color: #121212;
  color: #FFFFFF;
  cursor: pointer;
}

.button:hover {
  background-color: #303030;
}

.button:active {
  background-color: #000000;
}

.button-secondary {
  background-color: #E0E0E0;
  color: #000000;
}

.button-secondary:hover {
  background-color: #D0D0D0;
}

.button-text {
  background: none;
  color: #1A478E;
  padding: 0;
  text-decoration: none;
}

.button-text:hover {
  text-decoration: underline;
}
```

### Form Elements

- **Input fields**: 1px solid border (#D0D0D0), 4px vertical padding, 8px horizontal
- **Select dropdowns**: Same as input fields, with right-aligned dropdown arrow
- **Checkboxes**: Small (12px × 12px), custom styling to match design
- **Labels**: Inline with fields when possible, 12px font size
- **Focus states**: 1px solid border (#1A478E), subtle highlight or glow

#### Example Form Element Specification

```
.input {
  border: 1px solid #D0D0D0;
  padding: 4px 8px;
  font-size: 12px;
  line-height: 1.2;
  width: 100%;
}

.input:focus {
  border-color: #1A478E;
  outline: none;
}

.select {
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="6"><path d="M0 0 L6 6 L12 0" fill="none" stroke="black" stroke-width="1.5"/></svg>');
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 24px;
}

.checkbox {
  width: 12px;
  height: 12px;
  border: 1px solid #D0D0D0;
}
```

## Paper Entry Specifications

### Compact View (Table)

- **ID Column**: Monospace font, 10-11px, fixed width
- **Title**: Bold, 13px, serif font
- **Authors**: Regular weight, 11px, gray color (#505050)
- **Abstract**: Regular weight, 12px, truncated with ellipsis
- **Date**: 10px, gray color (#505050), right-aligned
- **Action buttons**: Small, uppercase text

### Grid View (Cards)

- **ID**: Top-right corner, monospace, 10px
- **Title**: Bold, 13-14px, serif font
- **Authors**: Regular weight, 11px, gray color
- **Date**: 10px, gray color, below authors
- **Abstract**: Regular weight, 12px, truncated with ellipsis
- **Action buttons**: Bottom of card, right-aligned

## Visual Hierarchy Guidelines

1. **Primary elements**: Paper titles (bold, larger)
2. **Secondary elements**: Authors, abstracts (regular weight, standard size)
3. **Tertiary elements**: Metadata, dates, IDs (smaller, lighter color)
4. **Interactive elements**: Buttons, links (accent colors, position separate from content)

## Interaction Design

### Hover States

- **Table rows**: Light background change (#F8F8F8)
- **Cards**: Subtle border color change or background shift
- **Buttons**: Background lightening
- **Links**: Underline on hover

### Selection States

- **Selected rows**: Light blue background (#F0F8FF)
- **Selected cards**: Blue left border or background tint
- **Active filters**: Bold text or background highlight

### Transitions

- **Hover transitions**: 150ms ease-in-out
- **Panel open/close**: 200ms ease-in-out
- **Checkbox toggles**: 100ms ease-in

## Responsive Design

While maintaining density is a priority, the design should adapt to different screen sizes:

### Desktop (Standard)
- Full implementation as described above
- 2-column grid for grid view

### Large Desktop
- Potentially 3-column grid for grid view
- Slightly increased base font size (13-14px)

### Tablet
- Single column grid view
- Horizontally scrollable tables for compact view
- Slightly larger touch targets

### Mobile
- Optimized card view only (no table view)
- Stacked controls in header
- Larger touch targets
- Simplified metadata display

## Best Practices

1. **Maintain alignment**: Use consistent alignment throughout the interface
2. **Limit color usage**: Rely primarily on typography and spacing for hierarchy
3. **Preserve whitespace**: Even in dense layouts, strategic whitespace improves readability
4. **Truncate thoughtfully**: Show the most important information first in truncated text
5. **Be consistent**: Apply the same styling patterns across similar elements
6. **Prioritize content**: Design should fade into the background, letting content stand out
7. **Test readability**: Despite small text sizes, all content must remain legible

## Implementation Notes

The style guide should be implemented using CSS variables to maintain consistency:

```css
:root {
  /* Colors */
  --color-text-primary: #000000;
  --color-text-secondary: #505050;
  --color-background-primary: #FFFFFF;
  --color-background-secondary: #F5F5F5;
  --color-border: #D0D0D0;
  --color-border-dark: #000000;
  --color-accent-primary: #121212;
  --color-accent-secondary: #1A478E;
  --color-accent-tertiary: #8B0000;
  
  /* Typography */
  --font-family-primary: Georgia, Times, 'Times New Roman', serif;
  --font-family-mono: Consolas, Monaco, 'Courier New', monospace;
  --font-size-micro: 10px;
  --font-size-small: 11px;
  --font-size-base: 12px;
  --font-size-title: 14px;
  --font-size-header: 16px;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
}
```

## Enhancements Beyond Initial Design

1. **Typography refinement**: Consider a more sophisticated typographic scale with precise ratios
2. **Micro-interactions**: Add subtle animations for state changes and transitions
3. **Advanced table features**: Implement fixed headers, column sorting, and resizable columns
4. **Keyboard shortcuts**: Add keyboard navigation and shortcuts for power users
5. **Custom abstract expansion**: Allow users to drag to see more of abstract rather than binary show/hide
6. **Data visualization**: Add small sparklines or indicators for citation counts or recency
7. **Theme options**: Provide light/dark mode and print-optimized view
8. **Advanced filtering**: Add inline filtering capabilities beyond category selection
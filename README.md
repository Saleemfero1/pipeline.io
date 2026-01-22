# Pipeline Diagram Editor

A completely custom-built React diagramming application with no external diagramming library dependencies. Built from scratch using React, SVG, and vanilla JavaScript.

## Features

- **100% Custom Built**: No GoJS, ReactFlow, or JointJS dependencies
- **Left Toolbar**: Shape palette with various shapes (Rectangle, Circle, Diamond, Triangle, Hexagon, Cylinder, Cloud, Document, Database, Process) and line types
- **Center Canvas**: Custom SVG-based diagram editor with pan and zoom
- **Right Panel**: Properties panel for styling selected shapes
- **Drag & Drop**: Drag shapes from the toolbar and drop them onto the canvas
- **Connections**: Connect shapes with lines (one-to-one or one-to-many) by clicking connection points
- **Resizable Shapes**: All shapes are adjustable and resizable with corner handles
- **Styling Options**: 
  - Fill color customization
  - Stroke color and width
  - Opacity/transparency control
  - Text editing
- **Zoom Controls**: Zoom in, zoom out, and reset zoom (50% - 200%)
- **Pan Support**: Pan the canvas by holding Ctrl+Left click or Middle mouse button
- **Lock Editor**: Lock/unlock the editor to prevent accidental changes
- **Export to JSON**: Export diagram data including all nodes and connections to JSON format

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Usage

1. **Adding Shapes**: Drag any shape from the left toolbar and drop it onto the canvas
2. **Connecting Shapes**: 
   - Click on a shape to select it (green connection points will appear)
   - Click on a connection point (green circle) and drag to another shape's connection point
3. **Editing Shapes**: 
   - Click on a shape to select it
   - Use the right panel to change fill color, stroke color, opacity, and text
   - Resize shapes by dragging the blue corner handles
4. **Moving Shapes**: Click and drag a shape to move it
5. **Panning**: Hold Ctrl+Left click or Middle mouse button and drag to pan the canvas
6. **Zooming**: Use the zoom controls in the top toolbar
7. **Locking**: Click the lock icon to prevent editing
8. **Exporting**: Click "Export JSON" to download the diagram data

## Project Structure

```
src/
├── components/
│   ├── DiagramCanvas.js    # Main SVG canvas component
│   ├── PropertiesPanel.js  # Right panel for styling
│   ├── ShapePalette.js     # Left toolbar with shapes
│   └── Toolbar.js          # Top toolbar with controls
├── utils/
│   ├── shapeRenderer.js    # Custom shape rendering logic
│   └── connectionRenderer.js # Connection line rendering
├── App.js                   # Main application component
└── index.js                 # Application entry point
```

## Technologies Used

- **React 18**: UI framework
- **SVG**: For rendering shapes and connections
- **Vanilla JavaScript**: All diagramming logic is custom-built
- **CSS3**: Styling with dark theme

## Export Format

The exported JSON contains:
- `nodes`: Array of all shapes with their properties (id, type, position, size, colors, text, etc.)
- `links`: Array of all connections between shapes (id, from, to, type, styling)
- `metadata`: Export information including node and link counts

## License

MIT


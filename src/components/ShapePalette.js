import React from 'react';
import './ShapePalette.css';

const shapes = [
  { type: 'Rectangle', icon: '▭', category: 'Basic' },
  { type: 'Circle', icon: '○', category: 'Basic' },
  { type: 'Diamond', icon: '◇', category: 'Basic' },
  { type: 'Triangle', icon: '△', category: 'Basic' },
  { type: 'Hexagon', icon: '⬡', category: 'Basic' },
  { type: 'Cylinder', icon: '▱', category: 'Basic' },
  { type: 'Cloud', icon: '☁', category: 'Basic' },
  { type: 'Document', icon: '📄', category: 'Basic' },
  { type: 'Database', icon: '🗄', category: 'Basic' },
  { type: 'Process', icon: '⚙', category: 'Basic' },
];

const lineTypes = [
  { type: 'Straight', icon: '─', category: 'Lines' },
  { type: 'Orthogonal', icon: '┌', category: 'Lines' },
  { type: 'Bezier', icon: '~', category: 'Lines' },
];

const ShapePalette = () => {
  const handleDragStart = (e, shapeType) => {
    e.dataTransfer.setData('shapeType', shapeType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="shape-palette">
      <div className="palette-header">
        <input 
          type="text" 
          placeholder="Type / to search" 
          className="palette-search"
        />
      </div>
      
      <div className="palette-section">
        <h3 className="section-title">General</h3>
        <div className="shapes-grid">
          {shapes.map((shape, index) => (
            <div
              key={index}
              className="shape-item"
              draggable
              onDragStart={(e) => handleDragStart(e, shape.type)}
              title={shape.type}
            >
              <span className="shape-icon">{shape.icon}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="palette-section">
        <h3 className="section-title">Lines</h3>
        <div className="shapes-grid">
          {lineTypes.map((line, index) => (
            <div
              key={index}
              className="shape-item"
              draggable
              onDragStart={(e) => handleDragStart(e, line.type)}
              title={line.type}
            >
              <span className="shape-icon">{line.icon}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="palette-footer">
        <button className="more-shapes-btn">+ More Shapes</button>
      </div>
    </div>
  );
};

export default ShapePalette;


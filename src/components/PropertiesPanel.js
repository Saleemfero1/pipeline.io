import React, { useEffect, useState } from 'react';
import './PropertiesPanel.css';

const PropertiesPanel = ({ selectedNode, setSelectedNode }) => {
  const [localNode, setLocalNode] = useState(selectedNode || {
    fill: '#2d2d2d',
    stroke: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
  });

  useEffect(() => {
    if (selectedNode) {
      setLocalNode({
        fill: selectedNode.fill || '#2d2d2d',
        stroke: selectedNode.stroke || '#ffffff',
        strokeWidth: selectedNode.strokeWidth || 2,
        opacity: selectedNode.opacity !== undefined ? selectedNode.opacity : 1,
        text: selectedNode.text || '',
      });
    } else {
      setLocalNode({
        fill: '#2d2d2d',
        stroke: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        text: '',
      });
    }
  }, [selectedNode]);

  const handlePropertyChange = (property, value) => {
    const updated = { ...localNode, [property]: value };
    setLocalNode(updated);
    if (selectedNode && setSelectedNode) {
      setSelectedNode({ ...selectedNode, ...updated });
    }
  };

  const colorPresets = [
    '#2d2d2d', '#0066cc', '#00cc66', '#cc0066', '#ffcc00',
    '#ff6600', '#9900ff', '#00ccff', '#ff0066', '#ffffff'
  ];

  if (!selectedNode) {
    return (
      <div className="properties-panel">
        <div className="panel-header">
          <h3>Properties</h3>
        </div>
        <div className="panel-content empty">
          <p>Select a shape to edit properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <h3>Style</h3>
      </div>
      <div className="panel-content">
        <div className="property-section">
          <label className="property-label">Fill Color</label>
          <div className="color-picker-group">
            <input
              type="color"
              value={localNode.fill}
              onChange={(e) => handlePropertyChange('fill', e.target.value)}
              className="color-input"
            />
            <div className="color-presets">
              {colorPresets.map((color, index) => (
                <button
                  key={index}
                  className="color-preset"
                  style={{ backgroundColor: color }}
                  onClick={() => handlePropertyChange('fill', color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="property-section">
          <label className="property-label">Stroke Color</label>
          <div className="color-picker-group">
            <input
              type="color"
              value={localNode.stroke}
              onChange={(e) => handlePropertyChange('stroke', e.target.value)}
              className="color-input"
            />
            <div className="color-presets">
              {colorPresets.map((color, index) => (
                <button
                  key={index}
                  className="color-preset"
                  style={{ backgroundColor: color }}
                  onClick={() => handlePropertyChange('stroke', color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="property-section">
          <label className="property-label">Stroke Width</label>
          <input
            type="number"
            min="1"
            max="10"
            value={localNode.strokeWidth}
            onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
            className="property-input"
          />
        </div>

        <div className="property-section">
          <label className="property-label">Opacity</label>
          <div className="opacity-control">
            <input
              type="range"
              min="0"
              max="100"
              value={localNode.opacity * 100}
              onChange={(e) => handlePropertyChange('opacity', e.target.value / 100)}
              className="opacity-slider"
            />
            <span className="opacity-value">{Math.round(localNode.opacity * 100)}%</span>
          </div>
        </div>

        <div className="property-section">
          <label className="property-label">Text</label>
          <textarea
            value={localNode.text || ''}
            onChange={(e) => handlePropertyChange('text', e.target.value)}
            className="property-input property-textarea"
            placeholder="Enter text... (supports multiple lines)"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;


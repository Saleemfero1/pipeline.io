import React from 'react';
import './Toolbar.css';

const Toolbar = ({ zoomLevel, setZoomLevel, isLocked, setIsLocked, diagramData, onDeleteNode, selectedNode }) => {
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  const handleExportJSON = () => {
    if (!diagramData || (!diagramData.nodes || diagramData.nodes.length === 0)) {
      alert('No diagram data to export. Please add some shapes first.');
      return;
    }

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      nodes: diagramData.nodes || [],
      links: diagramData.links || [],
      metadata: {
        nodeCount: diagramData.nodes?.length || 0,
        linkCount: diagramData.links?.length || 0
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h2 className="toolbar-title">Pipeline Diagram Editor</h2>
      </div>
      <div className="toolbar-center">
        <button 
          className="toolbar-btn" 
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          ➖
        </button>
        <span className="zoom-level">{zoomLevel}%</span>
        <button 
          className="toolbar-btn" 
          onClick={handleZoomIn}
          title="Zoom In"
        >
          ➕
        </button>
        <button 
          className="toolbar-btn" 
          onClick={handleZoomReset}
          title="Reset Zoom"
        >
          🔍
        </button>
        <button 
          className={`toolbar-btn ${isLocked ? 'active' : ''}`}
          onClick={() => setIsLocked(!isLocked)}
          title={isLocked ? "Unlock Editor" : "Lock Editor"}
        >
          {isLocked ? '🔒' : '🔓'}
        </button>
      </div>
      <div className="toolbar-right">
        <button 
          className={`toolbar-btn delete-btn ${!selectedNode ? 'disabled' : ''}`}
          onClick={onDeleteNode}
          disabled={!selectedNode || isLocked}
          title={selectedNode ? "Delete Selected Shape (Delete/Backspace)" : "Select a shape to delete"}
        >
          🗑️ Delete
        </button>
        <button 
          className="toolbar-btn export-btn" 
          onClick={handleExportJSON}
          title="Export to JSON"
        >
          📥 Export JSON
        </button>
      </div>
    </div>
  );
};

export default Toolbar;


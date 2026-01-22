import React, { useState, useRef } from 'react';
import './App.css';
import ShapePalette from './components/ShapePalette';
import DiagramCanvas from './components/DiagramCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';

function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [diagramData, setDiagramData] = useState({ nodes: [], links: [] });
  const [isLocked, setIsLocked] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const deleteNodeRef = useRef(null);

  const handleDeleteNode = () => {
    if (deleteNodeRef.current) {
      deleteNodeRef.current();
    }
  };

  return (
    <div className="app">
      <Toolbar 
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        diagramData={diagramData}
        onDeleteNode={handleDeleteNode}
        selectedNode={selectedNode}
      />
      <div className="app-content">
        <ShapePalette />
        <DiagramCanvas
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          setDiagramData={setDiagramData}
          isLocked={isLocked}
          zoomLevel={zoomLevel}
          deleteNodeRef={deleteNodeRef}
        />
        <PropertiesPanel 
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
      </div>
    </div>
  );
}

export default App;


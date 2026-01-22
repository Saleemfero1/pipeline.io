import React, { useState, useRef, useEffect, useCallback } from 'react';
import './DiagramCanvas.css';
import { renderShape } from '../utils/shapeRenderer';

const DiagramCanvas = ({ selectedNode, setSelectedNode, setDiagramData, isLocked, zoomLevel, deleteNodeRef }) => {
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [standaloneLines, setStandaloneLines] = useState([]); // Lines dragged from palette
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMovingLineEndpoint, setIsMovingLineEndpoint] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [connectionStart, setConnectionStart] = useState(null);
  const [tempConnection, setTempConnection] = useState(null);
  const [lineEndpointBeingMoved, setLineEndpointBeingMoved] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Delete selected node/line and its connections
  const handleDeleteNode = useCallback(() => {
    if (!selectedNode || isLocked) return;

    const itemToDelete = selectedNode;

    // Check if it's a line (standalone or connection)
    if (itemToDelete.id?.startsWith('line-')) {
      // Remove standalone line
      setStandaloneLines(prev => prev.filter(l => l.id !== itemToDelete.id));
    } else if (itemToDelete.from && itemToDelete.to) {
      // Remove connection link
      setLinks(prev => prev.filter(link => link.id !== itemToDelete.id));
    } else {
      // Remove the node
      setNodes(prev => prev.filter(n => n.id !== itemToDelete.id));
      
      // Remove all links connected to this node
      setLinks(prev => prev.filter(link => 
        link.from !== itemToDelete.id && link.to !== itemToDelete.id
      ));
    }
    
    // Clear selection
    setSelectedNode(null);
  }, [selectedNode, isLocked, setSelectedNode]);

  // Expose delete function to parent via ref
  useEffect(() => {
    if (deleteNodeRef) {
      deleteNodeRef.current = handleDeleteNode;
    }
  }, [handleDeleteNode, deleteNodeRef]);

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLocked) return;
      
      // Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode) {
        // Prevent default browser behavior
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleDeleteNode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, isLocked, handleDeleteNode]);

  // Update diagram data when nodes, links, or standalone lines change
  useEffect(() => {
    setDiagramData({ nodes, links, standaloneLines });
  }, [nodes, links, standaloneLines, setDiagramData]);

  // Update node when selectedNode properties change
  useEffect(() => {
    if (selectedNode) {
      setNodes(prev => prev.map(n => 
        n.id === selectedNode.id ? { ...n, ...selectedNode } : n
      ));
    }
  }, [selectedNode]);

  // Handle zoom changes
  useEffect(() => {
    if (svgRef.current) {
      const svg = svgRef.current;
      const scale = zoomLevel / 100;
      svg.style.transform = `scale(${scale})`;
      svg.style.transformOrigin = '0 0';
    }
  }, [zoomLevel]);

  // Handle drop from palette
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (isLocked) return;

    const shapeType = e.dataTransfer.getData('shapeType');
    if (!shapeType) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / (zoomLevel / 100);
    const y = (e.clientY - rect.top - pan.y) / (zoomLevel / 100);

    // Check if it's a line type
    const lineTypes = ['Straight', 'Orthogonal', 'Bezier'];
    if (lineTypes.includes(shapeType)) {
      // Create a standalone line
      const newLine = {
        id: `line-${Date.now()}`,
        type: shapeType.toLowerCase(),
        x1: x - 50,
        y1: y,
        x2: x + 50,
        y2: y,
        stroke: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
      };
      setStandaloneLines(prev => [...prev, newLine]);
      setSelectedNode(newLine);
    } else {
      // Create a shape node
      const newNode = {
        id: `node-${Date.now()}`,
        type: shapeType,
        x: x - 60,
        y: y - 30,
        width: 120,
        height: 60,
        fill: '#2d2d2d',
        stroke: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        text: shapeType,
      };
      setNodes(prev => [...prev, newNode]);
    }
  }, [isLocked, pan, zoomLevel, setSelectedNode]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!isLocked) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, [isLocked]);

  // Handle shape selection and dragging
  const handleShapeMouseDown = useCallback((e, node) => {
    if (isLocked) return;
    e.stopPropagation();
    
    // Get the actual node from nodes array to ensure we have the latest data
    const actualNode = nodes.find(n => n.id === node.id) || node;
    setSelectedNode({ ...actualNode });
    
    if (e.button === 0) { // Left click
      const rect = svgRef.current.getBoundingClientRect();
      const startX = (e.clientX - rect.left - pan.x) / (zoomLevel / 100);
      const startY = (e.clientY - rect.top - pan.y) / (zoomLevel / 100);
      
      setDragStart({ x: startX, y: startY, node: actualNode });
      setIsDragging(true);
    }
  }, [isLocked, pan, zoomLevel, nodes, setSelectedNode]);

  // Handle double-click to edit text
  const handleShapeDoubleClick = useCallback((e, node) => {
    if (isLocked) return;
    e.stopPropagation();
    e.preventDefault();
    
    setEditingNode(node);
    setEditingText(node.text || '');
  }, [isLocked]);

  // Handle text editing completion
  const handleTextEditComplete = useCallback(() => {
    if (editingNode) {
      setNodes(prev => prev.map(n => 
        n.id === editingNode.id 
          ? { ...n, text: editingText }
          : n
      ));
      
      if (selectedNode && selectedNode.id === editingNode.id) {
        setSelectedNode({ ...selectedNode, text: editingText });
      }
      
      setEditingNode(null);
      setEditingText('');
    }
  }, [editingNode, editingText, selectedNode, setSelectedNode]);

  // Handle text edit cancel (Escape key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingNode) {
        setEditingNode(null);
        setEditingText('');
      } else if (e.key === 'Enter' && e.ctrlKey && editingNode) {
        // Ctrl+Enter to finish editing
        handleTextEditComplete();
      }
    };

    if (editingNode) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [editingNode, handleTextEditComplete]);

  // Handle line selection and endpoint dragging
  const handleLineMouseDown = useCallback((e, line, endpoint = null) => {
    if (isLocked) return;
    e.stopPropagation();
    
    setSelectedNode(line);
    
    if (e.button === 0) { // Left click
      const rect = svgRef.current.getBoundingClientRect();
      const startX = (e.clientX - rect.left - pan.x) / (zoomLevel / 100);
      const startY = (e.clientY - rect.top - pan.y) / (zoomLevel / 100);
      
      if (endpoint) {
        // Moving a line endpoint
        setIsMovingLineEndpoint(true);
        setLineEndpointBeingMoved({ line, endpoint, startX, startY });
      } else {
        // Moving the entire line
        setDragStart({ x: startX, y: startY, line });
        setIsDragging(true);
      }
    }
  }, [isLocked, pan, zoomLevel, setSelectedNode]);

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isLocked) return;

      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const currentX = (e.clientX - rect.left - pan.x) / (zoomLevel / 100);
      const currentY = (e.clientY - rect.top - pan.y) / (zoomLevel / 100);

      if (isResizing && resizeHandle && dragStart) {
        const node = dragStart.node;
        const deltaX = currentX - dragStart.x;
        const deltaY = currentY - dragStart.y;
        
        let newWidth = node.width;
        let newHeight = node.height;
        let newX = node.x;
        let newY = node.y;

        switch (resizeHandle) {
          case 'se': // Southeast
            newWidth = Math.max(60, node.width + deltaX);
            newHeight = Math.max(40, node.height + deltaY);
            break;
          case 'sw': // Southwest
            newWidth = Math.max(60, node.width - deltaX);
            newHeight = Math.max(40, node.height + deltaY);
            newX = node.x + (node.width - newWidth);
            break;
          case 'ne': // Northeast
            newWidth = Math.max(60, node.width + deltaX);
            newHeight = Math.max(40, node.height - deltaY);
            newY = node.y + (node.height - newHeight);
            break;
          case 'nw': // Northwest
            newWidth = Math.max(60, node.width - deltaX);
            newHeight = Math.max(40, node.height - deltaY);
            newX = node.x + (node.width - newWidth);
            newY = node.y + (node.height - newHeight);
            break;
          default:
            break;
        }

        const updatedNode = { 
          ...node, 
          x: newX, 
          y: newY, 
          width: newWidth, 
          height: newHeight 
        };
        
        setNodes(prev => prev.map(n => 
          n.id === node.id ? updatedNode : n
        ));
        
        // Update selected node to reflect new size
        if (selectedNode && selectedNode.id === node.id) {
          setSelectedNode(updatedNode);
        }
        
        setDragStart({ ...dragStart, x: currentX, y: currentY, node: updatedNode });
      } else if (isDragging && dragStart && !dragStart.isPan) {
        if (dragStart.node) {
          // Moving a shape
          const deltaX = currentX - dragStart.x;
          const deltaY = currentY - dragStart.y;
          
          setNodes(prev => prev.map(n => 
            n.id === dragStart.node.id 
              ? { ...n, x: n.x + deltaX, y: n.y + deltaY }
              : n
          ));
          setDragStart({ ...dragStart, x: currentX, y: currentY });
        } else if (dragStart.line) {
          // Moving a standalone line
          const deltaX = currentX - dragStart.x;
          const deltaY = currentY - dragStart.y;
          
          setStandaloneLines(prev => prev.map(l => 
            l.id === dragStart.line.id 
              ? { 
                  ...l, 
                  x1: l.x1 + deltaX, 
                  y1: l.y1 + deltaY,
                  x2: l.x2 + deltaX,
                  y2: l.y2 + deltaY
                }
              : l
          ));
          setDragStart({ ...dragStart, x: currentX, y: currentY });
        }
      } else if (isMovingLineEndpoint && lineEndpointBeingMoved) {
        // Moving a line endpoint
        const { line, endpoint } = lineEndpointBeingMoved;
        const deltaX = currentX - lineEndpointBeingMoved.startX;
        const deltaY = currentY - lineEndpointBeingMoved.startY;
        
        setStandaloneLines(prev => prev.map(l => 
          l.id === line.id 
            ? { 
                ...l, 
                [endpoint === 'start' ? 'x1' : 'x2']: (endpoint === 'start' ? line.x1 : line.x2) + deltaX,
                [endpoint === 'start' ? 'y1' : 'y2']: (endpoint === 'start' ? line.y1 : line.y2) + deltaY
              }
            : l
        ));
        setLineEndpointBeingMoved({ ...lineEndpointBeingMoved, startX: currentX, startY: currentY });
      } else if (isConnecting && connectionStart) {
        setTempConnection({
          from: { x: connectionStart.x, y: connectionStart.y },
          to: { x: currentX, y: currentY }
        });
      }
    };

    if (isDragging || isResizing || isConnecting || isMovingLineEndpoint || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isDragging, isResizing, isConnecting, isMovingLineEndpoint, isPanning, dragStart, resizeHandle, connectionStart, lineEndpointBeingMoved, pan, zoomLevel, isLocked]);

  // Handle mouse up
  useEffect(() => {
    const handleMouseUp = () => {
      if (isConnecting && connectionStart && tempConnection) {
        // Find node at connection end point
        const endNode = nodes.find(n => {
          return tempConnection.to.x >= n.x && 
                 tempConnection.to.x <= n.x + n.width &&
                 tempConnection.to.y >= n.y && 
                 tempConnection.to.y <= n.y + n.height;
        });

        if (endNode && connectionStart.nodeId !== endNode.id) {
          const newLink = {
            id: `link-${Date.now()}`,
            from: connectionStart.nodeId,
            to: endNode.id,
            type: 'straight',
            stroke: '#ffffff',
            strokeWidth: 2,
          };
          setLinks(prev => [...prev, newLink]);
        }
      }

      setIsDragging(false);
      setIsResizing(false);
      setIsConnecting(false);
      setIsMovingLineEndpoint(false);
      setIsPanning(false);
      setDragStart(null);
      setResizeHandle(null);
      setConnectionStart(null);
      setTempConnection(null);
      setLineEndpointBeingMoved(null);
    };

    if (isDragging || isResizing || isConnecting || isMovingLineEndpoint || isPanning) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging, isResizing, isConnecting, isMovingLineEndpoint, isPanning, connectionStart, tempConnection, nodes]);

  // Handle panning - right click or space + drag, or drag on empty canvas
  const handlePanStart = useCallback((e) => {
    // Right mouse button, middle mouse, or space key + left click for panning
    if (e.button === 2 || e.button === 1 || (e.button === 0 && e.spaceKey)) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY, isPan: true });
      setIsDragging(true);
    } else if (e.button === 0) {
      // Left click on empty canvas - check if we should pan
      const target = e.target;
      const isCanvasBackground = target === svgRef.current || 
                                 (target.tagName === 'rect' && target.getAttribute('fill') === 'url(#grid)') ||
                                 (target.tagName === 'path' && target.getAttribute('fill') === 'url(#grid)') ||
                                 target.tagName === 'svg';
      
      if (isCanvasBackground) {
        // Check if clicking on a shape
        const clickedOnShape = nodes.some(n => {
          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) return false;
          const clickX = (e.clientX - rect.left - pan.x) / (zoomLevel / 100);
          const clickY = (e.clientY - rect.top - pan.y) / (zoomLevel / 100);
          return clickX >= n.x && clickX <= n.x + n.width &&
                 clickY >= n.y && clickY <= n.y + n.height;
        });
        
        // Also check standalone lines
        const clickedOnLine = standaloneLines.some(l => {
          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) return false;
          const clickX = (e.clientX - rect.left - pan.x) / (zoomLevel / 100);
          const clickY = (e.clientY - rect.top - pan.y) / (zoomLevel / 100);
          // Simple distance check to line
          const distToStart = Math.sqrt(Math.pow(clickX - l.x1, 2) + Math.pow(clickY - l.y1, 2));
          const distToEnd = Math.sqrt(Math.pow(clickX - l.x2, 2) + Math.pow(clickY - l.y2, 2));
          return distToStart < 10 || distToEnd < 10;
        });
        
        if (!clickedOnShape && !clickedOnLine) {
          // Start panning on empty canvas
          setIsPanning(true);
          setDragStart({ x: e.clientX, y: e.clientY, isPan: true });
          setIsDragging(true);
        }
      }
    }
  }, [nodes, standaloneLines, pan, zoomLevel]);

  // Handle space key for panning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isLocked) {
        e.preventDefault();
        if (svgRef.current) {
          svgRef.current.style.cursor = 'grab';
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        if (svgRef.current) {
          svgRef.current.style.cursor = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isLocked]);

  useEffect(() => {
    const handlePanMove = (e) => {
      if (isPanning && dragStart && dragStart.isPan) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        setDragStart({ x: e.clientX, y: e.clientY, isPan: true });
      }
    };

    if (isPanning && dragStart && dragStart.isPan) {
      window.addEventListener('mousemove', handlePanMove);
      return () => window.removeEventListener('mousemove', handlePanMove);
    }
  }, [isPanning, dragStart]);

  // Handle connection start
  const handleConnectionPointClick = useCallback((e, nodeId, point) => {
    if (isLocked) return;
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    let connectionPoint;
    switch (point) {
      case 'top':
        connectionPoint = { x: node.x + node.width / 2, y: node.y };
        break;
      case 'bottom':
        connectionPoint = { x: node.x + node.width / 2, y: node.y + node.height };
        break;
      case 'left':
        connectionPoint = { x: node.x, y: node.y + node.height / 2 };
        break;
      case 'right':
        connectionPoint = { x: node.x + node.width, y: node.y + node.height / 2 };
        break;
      default:
        return;
    }

    setConnectionStart({ nodeId, x: connectionPoint.x, y: connectionPoint.y });
    setIsConnecting(true);
  }, [isLocked, nodes]);

  // Handle resize handle mouse down
  const handleResizeMouseDown = useCallback((e, node, handle) => {
    if (isLocked) return;
    e.stopPropagation();
    const rect = svgRef.current.getBoundingClientRect();
    const startX = (e.clientX - rect.left - pan.x) / (zoomLevel / 100);
    const startY = (e.clientY - rect.top - pan.y) / (zoomLevel / 100);
    
    setResizeHandle(handle);
    setDragStart({ x: startX, y: startY, node });
    setIsResizing(true);
  }, [isLocked, pan, zoomLevel]);

  // Render resize handles
  const renderResizeHandles = (node) => {
    if (selectedNode?.id !== node.id || isLocked) return null;

    const handles = [
      { pos: 'nw', x: node.x - 5, y: node.y - 5 },
      { pos: 'ne', x: node.x + node.width - 5, y: node.y - 5 },
      { pos: 'sw', x: node.x - 5, y: node.y + node.height - 5 },
      { pos: 'se', x: node.x + node.width - 5, y: node.y + node.height - 5 },
    ];

    return handles.map(handle => (
      <rect
        key={handle.pos}
        x={handle.x}
        y={handle.y}
        width={10}
        height={10}
        fill="#0066cc"
        stroke="#ffffff"
        strokeWidth={1}
        onMouseDown={(e) => handleResizeMouseDown(e, node, handle.pos)}
        style={{ cursor: `${handle.pos}-resize` }}
      />
    ));
  };

  // Render connection points
  const renderConnectionPoints = (node) => {
    if (selectedNode?.id !== node.id || isLocked) return null;

    const points = [
      { pos: 'top', x: node.x + node.width / 2, y: node.y },
      { pos: 'bottom', x: node.x + node.width / 2, y: node.y + node.height },
      { pos: 'left', x: node.x, y: node.y + node.height / 2 },
      { pos: 'right', x: node.x + node.width, y: node.y + node.height / 2 },
    ];

    return points.map(point => (
      <circle
        key={point.pos}
        cx={point.x}
        cy={point.y}
        r={6}
        fill="#00cc66"
        stroke="#ffffff"
        strokeWidth={2}
        onMouseDown={(e) => handleConnectionPointClick(e, node.id, point.pos)}
        style={{ cursor: 'crosshair' }}
      />
    ));
  };

  // Render selection outline
  const renderSelectionOutline = (node) => {
    if (selectedNode?.id !== node.id) return null;
    
    // Outline matches the shape exactly to show the actual size
    return (
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        fill="none"
        stroke="#0066cc"
        strokeWidth={3}
        strokeDasharray="5,5"
        pointerEvents="none"
        opacity={0.8}
      />
    );
  };

  // Calculate path for standalone line
  const calculateLinePath = (line) => {
    const { x1, y1, x2, y2, type } = line;
    switch (type) {
      case 'orthogonal':
        const midX = (x1 + x2) / 2;
        return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
      case 'bezier':
        const dx = x2 - x1;
        const cp1x = x1 + dx * 0.5;
        const cp1y = y1;
        const cp2x = x1 + dx * 0.5;
        const cp2y = y2;
        return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
      default: // straight
        return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
  };

  // Handle canvas click to deselect
  const handleCanvasClick = useCallback((e) => {
    // Only deselect if clicking on the background (not on a shape, line, or connection point)
    if (e.target === svgRef.current || 
        (e.target.tagName === 'rect' && e.target.getAttribute('fill') === 'url(#grid)') ||
        (e.target.tagName === 'path' && e.target.getAttribute('fill') === 'url(#grid)')) {
      setSelectedNode(null);
    }
  }, [setSelectedNode]);

  return (
    <div 
      className="diagram-canvas-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseDown={handlePanStart}
      onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
      onClick={handleCanvasClick}
      style={{ 
        cursor: isLocked ? 'not-allowed' : (isPanning ? 'grabbing' : 'grab'), 
        opacity: isLocked ? 0.7 : 1,
        userSelect: 'none'
      }}
    >
      <svg
        ref={svgRef}
        className="diagram-canvas"
        width="100%"
        height="100%"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#ffffff" />
          </marker>
        </defs>
        
        {/* Grid pattern */}
        <pattern
          id="grid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#404040"
            strokeWidth="0.5"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Render connections between shapes */}
        {links.map(link => {
          const fromNode = nodes.find(n => n.id === link.from);
          const toNode = nodes.find(n => n.id === link.to);
          const isSelected = selectedNode?.id === link.id;
          
          if (!fromNode || !toNode) return null;
          
          const fromPoint = {
            x: fromNode.x + (link.fromPoint === 'left' ? 0 : link.fromPoint === 'right' ? fromNode.width : fromNode.width / 2),
            y: fromNode.y + (link.fromPoint === 'top' ? 0 : link.fromPoint === 'bottom' ? fromNode.height : fromNode.height / 2)
          };
          const toPoint = {
            x: toNode.x + (link.toPoint === 'left' ? 0 : link.toPoint === 'right' ? toNode.width : toNode.width / 2),
            y: toNode.y + (link.toPoint === 'top' ? 0 : link.toPoint === 'bottom' ? toNode.height : toNode.height / 2)
          };
          
          let pathD = '';
          if (link.type === 'orthogonal') {
            const midX = (fromPoint.x + toPoint.x) / 2;
            pathD = `M ${fromPoint.x} ${fromPoint.y} L ${midX} ${fromPoint.y} L ${midX} ${toPoint.y} L ${toPoint.x} ${toPoint.y}`;
          } else if (link.type === 'bezier') {
            const dx = toPoint.x - fromPoint.x;
            const cp1x = fromPoint.x + dx * 0.5;
            const cp1y = fromPoint.y;
            const cp2x = fromPoint.x + dx * 0.5;
            const cp2y = toPoint.y;
            pathD = `M ${fromPoint.x} ${fromPoint.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPoint.x} ${toPoint.y}`;
          } else {
            pathD = `M ${fromPoint.x} ${fromPoint.y} L ${toPoint.x} ${toPoint.y}`;
          }
          
          return (
            <g key={link.id}>
              <path
                d={pathD}
                stroke={link.stroke || '#ffffff'}
                strokeWidth={link.strokeWidth || 2}
                fill="none"
                markerEnd="url(#arrowhead)"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setSelectedNode(link);
                }}
                style={{ cursor: 'pointer' }}
              />
              {isSelected && (
                <path
                  d={pathD}
                  stroke="#0066cc"
                  strokeWidth={4}
                  fill="none"
                  opacity={0.3}
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })}
        
        {/* Render standalone lines */}
        {standaloneLines.map(line => {
          const path = calculateLinePath(line);
          const isSelected = selectedNode?.id === line.id;
          
          return (
            <g key={line.id}>
              <path
                d={path}
                stroke={line.stroke || '#ffffff'}
                strokeWidth={line.strokeWidth || 2}
                fill="none"
                opacity={line.opacity || 1}
                onMouseDown={(e) => handleLineMouseDown(e, line)}
                style={{ cursor: 'pointer' }}
              />
              {isSelected && (
                <>
                  {/* Selection outline */}
                  <path
                    d={path}
                    stroke="#0066cc"
                    strokeWidth={4}
                    fill="none"
                    opacity={0.3}
                    pointerEvents="none"
                  />
                  {/* Endpoint handles */}
                  <circle
                    cx={line.x1}
                    cy={line.y1}
                    r={6}
                    fill="#00cc66"
                    stroke="#ffffff"
                    strokeWidth={2}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleLineMouseDown(e, line, 'start');
                    }}
                    style={{ cursor: 'move' }}
                  />
                  <circle
                    cx={line.x2}
                    cy={line.y2}
                    r={6}
                    fill="#00cc66"
                    stroke="#ffffff"
                    strokeWidth={2}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleLineMouseDown(e, line, 'end');
                    }}
                    style={{ cursor: 'move' }}
                  />
                </>
              )}
            </g>
          );
        })}
        
        {/* Render temporary connection */}
        {tempConnection && (
          <line
            x1={tempConnection.from.x}
            y1={tempConnection.from.y}
            x2={tempConnection.to.x}
            y2={tempConnection.to.y}
            stroke="#ffffff"
            strokeWidth={2}
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead)"
          />
        )}

        {/* Render shapes */}
        {nodes.map(node => (
          <g key={node.id}>
            {renderShape(node, handleShapeMouseDown, handleShapeDoubleClick)}
            {renderSelectionOutline(node)}
            {renderResizeHandles(node)}
            {renderConnectionPoints(node)}
          </g>
        ))}

        {/* Render text editing input overlay */}
        {editingNode && (() => {
          const node = nodes.find(n => n.id === editingNode.id) || editingNode;
          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) return null;
          
          return (
            <foreignObject
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={handleTextEditComplete}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleTextEditComplete();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setEditingNode(null);
                      setEditingText('');
                    }
                  }}
                  style={{
                    width: '90%',
                    height: '80%',
                    padding: '4px',
                    textAlign: 'center',
                    border: '2px solid #0066cc',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontSize: '14px',
                    resize: 'none',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                  autoFocus
                  spellCheck={false}
                />
              </div>
            </foreignObject>
          );
        })()}
      </svg>
    </div>
  );
};

export default DiagramCanvas;


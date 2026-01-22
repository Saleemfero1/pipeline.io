import React from 'react';

// Custom connection line rendering
export const renderConnection = (link, nodes, onMouseDown) => {
  const fromNode = nodes.find(n => n.id === link.from);
  const toNode = nodes.find(n => n.id === link.to);
  
  if (!fromNode || !toNode) return null;

  const fromPoint = getConnectionPoint(fromNode, link.fromPoint || 'bottom');
  const toPoint = getConnectionPoint(toNode, link.toPoint || 'top');

  const path = calculatePath(fromPoint, toPoint, link.type || 'straight');

  return (
    <path
      key={link.id}
      d={path}
      stroke={link.stroke || '#ffffff'}
      strokeWidth={link.strokeWidth || 2}
      fill="none"
      markerEnd="url(#arrowhead)"
      onMouseDown={(e) => onMouseDown && onMouseDown(e, link)}
      style={{ cursor: 'pointer' }}
    />
  );
};

const getConnectionPoint = (node, side) => {
  const { x, y, width, height } = node;
  switch (side) {
    case 'top':
      return { x: x + width / 2, y };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x, y: y + height / 2 };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    default:
      return { x: x + width / 2, y: y + height };
  }
};

const calculatePath = (from, to, type) => {
  switch (type) {
    case 'straight':
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
      
    case 'orthogonal':
      const midX = (from.x + to.x) / 2;
      return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
      
    case 'bezier':
      const dx = to.x - from.x;
      const cp1x = from.x + dx * 0.5;
      const cp1y = from.y;
      const cp2x = from.x + dx * 0.5;
      const cp2y = to.y;
      return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
      
    default:
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
};


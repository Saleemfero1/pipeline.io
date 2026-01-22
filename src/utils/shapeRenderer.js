import React from 'react';

// Custom shape rendering utilities
export const renderShape = (node, onMouseDown, onDoubleClick = null) => {
  const { id, x, y, width, height, type, fill, stroke, strokeWidth, opacity, text } = node;
  
  const baseProps = {
    fill,
    stroke,
    strokeWidth,
    opacity,
    onMouseDown: (e) => onMouseDown(e, node),
    onDoubleClick: (e) => {
      if (onDoubleClick) {
        onDoubleClick(e, node);
      }
    },
    style: { cursor: 'move' },
  };

  let shapeElement;
  
  switch (type) {
    case 'Rectangle':
      shapeElement = (
        <rect
          key={id}
          {...baseProps}
          x={x}
          y={y}
          width={width}
          height={height}
          rx={0}
        />
      );
      break;
      
    case 'Circle':
      const radius = Math.min(width, height) / 2;
      shapeElement = (
        <circle
          key={id}
          {...baseProps}
          cx={x + width / 2}
          cy={y + height / 2}
          r={radius}
        />
      );
      break;
      
    case 'Diamond':
      const points = [
        `${x + width / 2},${y}`,
        `${x + width},${y + height / 2}`,
        `${x + width / 2},${y + height}`,
        `${x},${y + height / 2}`
      ].join(' ');
      shapeElement = (
        <polygon
          key={id}
          {...baseProps}
          points={points}
        />
      );
      break;
      
    case 'Triangle':
      const triPoints = [
        `${x + width / 2},${y}`,
        `${x + width},${y + height}`,
        `${x},${y + height}`
      ].join(' ');
      shapeElement = (
        <polygon
          key={id}
          {...baseProps}
          points={triPoints}
        />
      );
      break;
      
    case 'Hexagon':
      const hexPoints = [];
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const hexRadius = Math.min(width, height) / 2;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        hexPoints.push(`${centerX + hexRadius * Math.cos(angle)},${centerY + hexRadius * Math.sin(angle)}`);
      }
      shapeElement = (
        <polygon
          key={id}
          {...baseProps}
          points={hexPoints.join(' ')}
        />
      );
      break;
      
    case 'Cylinder':
      const cylRadius = width / 4;
      shapeElement = (
        <g key={id}>
          <ellipse
            {...baseProps}
            cx={x + width / 2}
            cy={y + cylRadius}
            rx={width / 2}
            ry={cylRadius}
          />
          <rect
            {...baseProps}
            x={x}
            y={y + cylRadius}
            width={width}
            height={height - cylRadius * 2}
          />
          <ellipse
            {...baseProps}
            cx={x + width / 2}
            cy={y + height - cylRadius}
            rx={width / 2}
            ry={cylRadius}
          />
        </g>
      );
      break;
      
    case 'Cloud':
      shapeElement = (
        <path
          key={id}
          {...baseProps}
          d={`M ${x + width * 0.3} ${y + height * 0.5}
              Q ${x} ${y + height * 0.3} ${x + width * 0.2} ${y + height * 0.3}
              Q ${x + width * 0.1} ${y} ${x + width * 0.4} ${y + height * 0.2}
              Q ${x + width * 0.5} ${y} ${x + width * 0.6} ${y + height * 0.2}
              Q ${x + width * 0.9} ${y} ${x + width * 0.8} ${y + height * 0.3}
              Q ${x + width} ${y + height * 0.3} ${x + width * 0.7} ${y + height * 0.5}
              Q ${x + width * 0.9} ${y + height * 0.7} ${x + width * 0.8} ${y + height * 0.7}
              Q ${x + width * 0.9} ${y + height} ${x + width * 0.6} ${y + height * 0.8}
              Q ${x + width * 0.5} ${y + height} ${x + width * 0.4} ${y + height * 0.8}
              Q ${x + width * 0.1} ${y + height} ${x + width * 0.2} ${y + height * 0.7}
              Q ${x} ${y + height * 0.7} ${x + width * 0.3} ${y + height * 0.5}
              Z`}
        />
      );
      break;
      
    case 'Document':
      shapeElement = (
        <g key={id}>
          <path
            {...baseProps}
            d={`M ${x} ${y} L ${x + width * 0.8} ${y} L ${x + width} ${y + height * 0.2} L ${x + width} ${y + height} L ${x} ${y + height} Z`}
          />
          <path
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
            d={`M ${x + width * 0.8} ${y} L ${x + width * 0.8} ${y + height * 0.2} L ${x + width} ${y + height * 0.2}`}
          />
        </g>
      );
      break;
      
    case 'Database':
      const dbRadius = width / 4;
      shapeElement = (
        <g key={id}>
          <ellipse
            {...baseProps}
            cx={x + width / 2}
            cy={y + dbRadius}
            rx={width / 2}
            ry={dbRadius}
          />
          <rect
            {...baseProps}
            x={x}
            y={y + dbRadius}
            width={width}
            height={height - dbRadius * 2}
          />
          <ellipse
            {...baseProps}
            cx={x + width / 2}
            cy={y + height - dbRadius}
            rx={width / 2}
            ry={dbRadius}
          />
        </g>
      );
      break;
      
    case 'Process':
      shapeElement = (
        <rect
          key={id}
          {...baseProps}
          x={x}
          y={y}
          width={width}
          height={height}
          rx={10}
        />
      );
      break;
      
    default:
      shapeElement = (
        <rect
          key={id}
          {...baseProps}
          x={x}
          y={y}
          width={width}
          height={height}
        />
      );
  }

  // Add text label with multi-line support
  const textElement = text ? (() => {
    const fontSize = Math.max(10, Math.min(16, Math.min(width, height) / 6));
    const lines = text.split('\n'); // Keep all lines including empty ones and spaces
    
    // Calculate max width per line (with padding)
    const maxLineWidth = width * 0.9;
    const charsPerLine = Math.floor(maxLineWidth / (fontSize * 0.6));
    
    // Wrap long lines
    const wrappedLines = [];
    lines.forEach(line => {
      if (line.length <= charsPerLine) {
        wrappedLines.push(line);
      } else {
        // Split long lines
        for (let i = 0; i < line.length; i += charsPerLine) {
          wrappedLines.push(line.substring(i, i + charsPerLine));
        }
      }
    });
    
    const finalLineHeight = fontSize * 1.2;
    const finalTotalHeight = wrappedLines.length * finalLineHeight;
    const finalStartY = y + height / 2 - (finalTotalHeight / 2) + (fontSize / 2);
    
    return (
      <text
        x={x + width / 2}
        y={finalStartY}
        fill={stroke}
        textAnchor="middle"
        fontSize={fontSize}
        pointerEvents="none"
        style={{ userSelect: 'none' }}
      >
        {wrappedLines.map((line, index) => (
          <tspan
            key={index}
            x={x + width / 2}
            dy={index === 0 ? 0 : finalLineHeight}
          >
            {line}
          </tspan>
        ))}
      </text>
    );
  })() : null;

  return (
    <g key={id}>
      {shapeElement}
      {textElement}
    </g>
  );
};

export const getShapeBounds = (node) => {
  return {
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    centerX: node.x + node.width / 2,
    centerY: node.y + node.height / 2,
  };
};

export const getConnectionPoints = (node) => {
  const { x, y, width, height } = node;
  return {
    top: { x: x + width / 2, y },
    bottom: { x: x + width / 2, y: y + height },
    left: { x, y: y + height / 2 },
    right: { x: x + width, y: y + height / 2 },
  };
};


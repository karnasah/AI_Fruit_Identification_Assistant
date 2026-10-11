import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BoundingBox = ({ imageUrl, detections, onBoxClick, className = '' }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [selectedBox, setSelectedBox] = useState(null);
  const [hoveredBox, setHoveredBox] = useState(null);

  // Colors for different fruits
  const fruitColors = {
    apple: '#ef4444',
    banana: '#eab308',
    orange: '#f97316',
    mango: '#eab308',
    grape: '#a855f7',
    strawberry: '#ef4444',
    watermelon: '#22c55e',
    pineapple: '#eab308',
    peach: '#f97316',
    pear: '#84cc16',
    kiwi: '#84cc16',
    blueberry: '#3b82f6',
    raspberry: '#dc2626',
    blackberry: '#8b5cf6',
    cherry: '#dc2626',
    lemon: '#eab308',
    lime: '#84cc16',
    coconut: '#d97706',
    avocado: '#65a30d',
    pomegranate: '#dc2626',
    fig: '#a855f7',
    date: '#d97706',
    default: '#3b82f6',
  };

  const getColorForFruit = (fruitName) => {
    if (!fruitName) return fruitColors.default;
    const lowerName = fruitName.toLowerCase();
    for (const [fruit, color] of Object.entries(fruitColors)) {
      if (lowerName.includes(fruit)) return color;
    }
    return fruitColors.default;
  };

  useEffect(() => {
    if (!imageUrl || !canvasRef.current || !containerRef.current) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate image scaling to fit container while maintaining aspect ratio
      const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const xOffset = (containerWidth - scaledWidth) / 2;
      const yOffset = (containerHeight - scaledHeight) / 2;
      
      setImageSize({
        width: scaledWidth,
        height: scaledHeight,
        xOffset,
        yOffset,
        scale,
        originalWidth: img.width,
        originalHeight: img.height,
      });
      
      drawCanvas(img, scaledWidth, scaledHeight, xOffset, yOffset);
    };
  }, [imageUrl]);

  const drawCanvas = (img, scaledWidth, scaledHeight, xOffset, yOffset) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;
    const ctx = canvas.getContext('2d');
    
    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, xOffset, yOffset, scaledWidth, scaledHeight);
    
    // Draw bounding boxes if detections exist
    if (detections && detections.length > 0) {
      detections.forEach((detection, index) => {
        const color = getColorForFruit(detection.fruitName);
        const isSelected = selectedBox === index;
        const isHovered = hoveredBox === index;
        
        // Scale coordinates from original image to displayed image
        const scale = scaledWidth / img.width;
        const x = detection.x * scale + xOffset;
        const y = detection.y * scale + yOffset;
        const width = detection.width * scale;
        const height = detection.height * scale;
        
        // Draw rectangle
        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 4 : isHovered ? 3 : 2;
        ctx.strokeRect(x, y, width, height);
        
        // Draw fill with transparency
        ctx.fillStyle = `${color}20`;
        ctx.fillRect(x, y, width, height);
        
        // Draw label background
        const label = `${detection.fruitName} (${Math.round(detection.confidence)}%)`;
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = color;
        ctx.fillRect(x, y - 28, textWidth + 12, 24);
        
        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.fillText(label, x + 6, y - 10);
        
        // Draw confidence bar at bottom of box
        const confidencePercent = detection.confidence;
        const barWidth = width * (confidencePercent / 100);
        ctx.fillStyle = `${color}cc`;
        ctx.fillRect(x, y + height - 4, barWidth, 4);
        
        // Draw corner markers for selected box
        if (isSelected) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          const cornerSize = 10;
          // Top-left
          ctx.strokeRect(x - 2, y - 2, cornerSize, cornerSize);
          // Top-right
          ctx.strokeRect(x + width - cornerSize + 2, y - 2, cornerSize, cornerSize);
          // Bottom-left
          ctx.strokeRect(x - 2, y + height - cornerSize + 2, cornerSize, cornerSize);
          // Bottom-right
          ctx.strokeRect(x + width - cornerSize + 2, y + height - cornerSize + 2, cornerSize, cornerSize);
        }
      });
    }
  };

  const handleCanvasClick = (e) => {
    if (!detections || !imageSize || detections.length === 0) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // Check if click is inside any bounding box
    for (let i = 0; i < detections.length; i++) {
      const detection = detections[i];
      const scale = imageSize.scale;
      const x = detection.x * scale + imageSize.xOffset;
      const y = detection.y * scale + imageSize.yOffset;
      const width = detection.width * scale;
      const height = detection.height * scale;
      
      if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
        setSelectedBox(i);
        if (onBoxClick) onBoxClick(detection, i);
        break;
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!detections || !imageSize || detections.length === 0) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    let hoveredIndex = null;
    for (let i = 0; i < detections.length; i++) {
      const detection = detections[i];
      const scale = imageSize.scale;
      const x = detection.x * scale + imageSize.xOffset;
      const y = detection.y * scale + imageSize.yOffset;
      const width = detection.width * scale;
      const height = detection.height * scale;
      
      if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
        hoveredIndex = i;
        break;
      }
    }
    
    if (hoveredIndex !== hoveredBox) {
      setHoveredBox(hoveredIndex);
      // Change cursor style
      canvasRef.current.style.cursor = hoveredIndex !== null ? 'pointer' : 'default';
    }
  };

  // Redraw on window resize, selection change, or hover change
  useEffect(() => {
    if (!imageUrl || !imageSize.width) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      drawCanvas(img, imageSize.width, imageSize.height, imageSize.xOffset, imageSize.yOffset);
    };
  }, [detections, selectedBox, hoveredBox, imageSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const container = containerRef.current;
          if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const xOffset = (containerWidth - scaledWidth) / 2;
            const yOffset = (containerHeight - scaledHeight) / 2;
            
            setImageSize(prev => ({
              ...prev,
              width: scaledWidth,
              height: scaledHeight,
              xOffset,
              yOffset,
              scale,
            }));
            
            drawCanvas(img, scaledWidth, scaledHeight, xOffset, yOffset);
          }
        };
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center min-h-[300px] ${className}`}>
        <div className="text-center">
          <div className="text-5xl mb-3">🖼️</div>
          <p className="text-gray-500 dark:text-gray-400">No image selected</p>
          <p className="text-sm text-gray-400 mt-1">Upload an image to see detection results</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div 
        ref={containerRef} 
        className="relative bg-black rounded-xl overflow-hidden"
        style={{ minHeight: '300px', height: 'auto', maxHeight: '500px' }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => {
            setHoveredBox(null);
            canvasRef.current.style.cursor = 'default';
          }}
          className="w-full h-auto cursor-pointer"
          style={{ display: 'block' }}
        />
      </div>
      
      {/* Detections Legend */}
      {detections && detections.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 w-full mb-1">
            🎯 Click on any highlighted fruit to see details
          </p>
          <div className="flex flex-wrap gap-2">
            {detections.map((detection, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedBox(idx);
                  if (onBoxClick) onBoxClick(detection, idx);
                  // Scroll to make it visible if needed
                  const legendItem = document.getElementById(`legend-item-${idx}`);
                  if (legendItem) {
                    legendItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }}
                id={`legend-item-${idx}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  selectedBox === idx
                    ? 'ring-2 ring-offset-2 ring-primary-500 scale-105'
                    : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: `${getColorForFruit(detection.fruitName)}20`,
                  border: `1.5px solid ${getColorForFruit(detection.fruitName)}`,
                  color: getColorForFruit(detection.fruitName),
                }}
              >
                <span className="text-base">{detection.emoji || getFruitEmoji(detection.fruitName)}</span>
                <span className="font-medium">{detection.fruitName}</span>
                <span className="opacity-80">({Math.round(detection.confidence)}%)</span>
                {selectedBox === idx && <span className="ml-1">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* No Detections Message */}
      {detections && detections.length === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ No fruits detected in this image. Try a clearer image with better lighting.
          </p>
        </div>
      )}
      
      {/* Instruction Tooltip */}
      {detections && detections.length > 0 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <span>💡</span>
            <span>Click on any colored box to select a fruit</span>
            <span className="mx-1">•</span>
            <span>Hover to highlight</span>
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to get fruit emoji
const getFruitEmoji = (fruitName) => {
  const emojiMap = {
    apple: '🍎',
    banana: '🍌',
    orange: '🍊',
    mango: '🥭',
    grape: '🍇',
    strawberry: '🍓',
    watermelon: '🍉',
    pineapple: '🍍',
    peach: '🍑',
    pear: '🍐',
    kiwi: '🥝',
    lemon: '🍋',
    coconut: '🥥',
    avocado: '🥑',
    cherry: '🍒',
    blueberry: '🫐',
    raspberry: '🍓',
    blackberry: '🫐',
    pomegranate: '🍎',
    fig: '🍐',
    date: '🥥',
  };
  
  if (!fruitName) return '🍎';
  const lowerName = fruitName.toLowerCase();
  for (const [fruit, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(fruit)) return emoji;
  }
  return '🍎';
};

// Individual Fruit Box Component (for non-canvas approach)
export const FruitBox = ({ fruit, x, y, width, height, color, onClick, isSelected, isHovered }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute cursor-pointer group"
      style={{
        left: x,
        top: y,
        width,
        height,
        border: `${isSelected ? '3px' : isHovered ? '2.5px' : '2px'} solid ${color}`,
        backgroundColor: `${color}20`,
        borderRadius: '8px',
        boxShadow: isSelected ? `0 0 0 2px ${color}80` : 'none',
        transition: 'all 0.2s ease',
      }}
      onClick={onClick}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      {/* Label */}
      <motion.div 
        className="absolute -top-7 left-0 px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap shadow-md"
        style={{ backgroundColor: color, color: '#fff' }}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {fruit.name} ({Math.round(fruit.confidence)}%)
      </motion.div>
      
      {/* Hover effect overlay */}
      <div 
        className="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-10 transition-opacity"
        style={{ borderRadius: '6px' }}
      />
      
      {/* Corner accents */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white rounded-tl-md" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white rounded-tr-md" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white rounded-bl-md" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white rounded-br-md" />
        </>
      )}
    </motion.div>
  );
};

export default BoundingBox;
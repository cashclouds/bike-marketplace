'use client';
import { useState, useRef, useEffect } from 'react';

export default function EditableBlock({ id, children, defaultWidth = '100%', defaultHeight = 'auto' }: { id: string; children: React.ReactNode; defaultWidth?: string; defaultHeight?: string }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: defaultWidth as string | number, height: defaultHeight as string | number });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showHandles, setShowHandles] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  const minWidth = 100;
  const minHeight = 80;

  // Загрузить сохранённую позицию и размер
  useEffect(() => {
    const savedPos = localStorage.getItem(`block-pos-${id}`);
    const savedSize = localStorage.getItem(`block-size-${id}`);

    if (savedPos) setPosition(JSON.parse(savedPos));
    if (savedSize) setSize(JSON.parse(savedSize));
  }, [id]);

  // Сохранить позицию
  useEffect(() => {
    if (!isDragging) return;
    const timer = setTimeout(() => {
      localStorage.setItem(`block-pos-${id}`, JSON.stringify(position));
    }, 300);
    return () => clearTimeout(timer);
  }, [position, isDragging, id]);

  // Сохранить размер
  useEffect(() => {
    if (!isResizing) return;
    const timer = setTimeout(() => {
      localStorage.setItem(`block-size-${id}`, JSON.stringify(size));
    }, 300);
    return () => clearTimeout(timer);
  }, [size, isResizing, id]);

  // Очистка таймера при unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      setShowHandles(true);
    }, 1500);
  };

  const handleMouseLeave = () => {
    setShowHandles(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  const startDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag') || (e.target as HTMLElement).closest('.resize-handle')) return;

    e.preventDefault();
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { ...position };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      setPosition({
        x: startOffset.current.x + deltaX,
        y: startOffset.current.y + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startResize = (e: React.MouseEvent, direction: string) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;

    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };

    const rect = blockRef.current?.getBoundingClientRect();
    startSize.current = {
      width: rect?.width || 0,
      height: (rect?.height === 0 ? 200 : rect?.height) || 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;
      let newPos = { ...position };

      if (direction.includes('right')) {
        newWidth = Math.max(minWidth, startSize.current.width + deltaX);
      }
      if (direction.includes('left')) {
        newWidth = Math.max(minWidth, startSize.current.width - deltaX);
        newPos.x = position.x + deltaX;
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(minHeight, startSize.current.height + deltaY);
      }
      if (direction.includes('top')) {
        newHeight = Math.max(minHeight, startSize.current.height - deltaY);
        newPos.y = position.y + deltaY;
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition(newPos);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={blockRef}
      className={`relative ${isDragging ? 'z-50 opacity-80' : ''}`}
      style={{
        width: typeof size.width === 'number' ? `${size.width}px` : size.width,
        height: typeof size.height === 'number' ? `${size.height}px` : size.height,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging || isResizing ? 'none' : 'transform 0.2s',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={startDrag}
    >
      {/* Drag Handle - иконка для перетаскивания */}
      <div
        className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded cursor-grab active:cursor-grabbing transition-colors z-40 select-none"
        onMouseDown={(e) => {
          e.stopPropagation();
          startDrag(e);
        }}
        title="Перетащи блок"
      >
        <span className="text-lg">≡</span>
      </div>

      {/* Resize Handles */}
      {(showHandles || isResizing) && (
        <>
          {/* Right */}
          <div
            className="resize-handle absolute top-0 right-0 w-2 h-full cursor-ew-resize bg-blue-500 opacity-30 hover:opacity-70 transition-opacity z-50"
            onMouseDown={(e) => startResize(e, 'right')}
          />
          {/* Left */}
          <div
            className="resize-handle absolute top-0 left-0 w-2 h-full cursor-ew-resize bg-blue-500 opacity-30 hover:opacity-70 transition-opacity z-50"
            onMouseDown={(e) => startResize(e, 'left')}
          />
          {/* Bottom */}
          <div
            className="resize-handle absolute bottom-0 left-0 w-full h-2 cursor-ns-resize bg-blue-500 opacity-30 hover:opacity-70 transition-opacity z-50"
            onMouseDown={(e) => startResize(e, 'bottom')}
          />
          {/* Top */}
          <div
            className="resize-handle absolute top-0 left-0 w-full h-2 cursor-ns-resize bg-blue-500 opacity-30 hover:opacity-70 transition-opacity z-50"
            onMouseDown={(e) => startResize(e, 'top')}
          />
          {/* Bottom-right corner */}
          <div
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-blue-600 opacity-50 hover:opacity-100 transition-opacity rounded-full z-50"
            onMouseDown={(e) => startResize(e, 'right bottom')}
          />
          {/* Bottom-left corner */}
          <div
            className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize bg-blue-600 opacity-50 hover:opacity-100 transition-opacity rounded-full z-50"
            onMouseDown={(e) => startResize(e, 'left bottom')}
          />
          {/* Top-right corner */}
          <div
            className="resize-handle absolute top-0 right-0 w-4 h-4 cursor-nesw-resize bg-blue-600 opacity-50 hover:opacity-100 transition-opacity rounded-full z-50"
            onMouseDown={(e) => startResize(e, 'right top')}
          />
          {/* Top-left corner */}
          <div
            className="resize-handle absolute top-0 left-0 w-4 h-4 cursor-nwse-resize bg-blue-600 opacity-50 hover:opacity-100 transition-opacity rounded-full z-50"
            onMouseDown={(e) => startResize(e, 'left top')}
          />
        </>
      )}

      {isResizing && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-mono z-50 shadow-lg whitespace-nowrap">
          {Math.round(typeof size.width === 'number' ? size.width : 0)}px × {Math.round(typeof size.height === 'number' ? size.height : 0)}px
        </div>
      )}

      {isDragging && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-mono z-50 shadow-lg whitespace-nowrap">
          x: {Math.round(position.x)}, y: {Math.round(position.y)}
        </div>
      )}

      {children}
    </div>
  );
}

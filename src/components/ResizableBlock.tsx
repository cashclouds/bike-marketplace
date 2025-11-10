'use client';
import { useState, useRef, useEffect } from 'react';

interface ResizableBlockProps {
  id: string;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: string | number;
  minWidth?: number;
  minHeight?: number;
}

export default function ResizableBlock({ id, children, defaultWidth = 100, defaultHeight = 'auto', minWidth = 100, minHeight = 80 }: ResizableBlockProps) {
  const [size, setSize] = useState({ width: defaultWidth as number | string, height: defaultHeight as number | string });
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showHandles, setShowHandles] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const saved = localStorage.getItem(`block-size-${id}`);
    if (saved) {
      setSize(JSON.parse(saved));
    }
  }, [id]);

  // Очистка таймера при unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isResizing) {
      const timer = setTimeout(() => {
        localStorage.setItem(`block-size-${id}`, JSON.stringify(size));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [size, isResizing, id]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Запускаем таймер на 1.5 сек перед показом ручек
    hoverTimerRef.current = setTimeout(() => {
      setShowHandles(true);
    }, 1500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowHandles(false);
    // Очищаем таймер если мышка ушла до истечения времени
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  const startResize = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };

    const rect = blockRef.current?.getBoundingClientRect();
    startSize.current = {
      width: rect?.width || 0,
      height: (rect?.height === 0 ? 200 : rect?.height) || 0
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;

      if (direction.includes('right')) {
        newWidth = Math.max(minWidth, startSize.current.width + deltaX);
      }
      if (direction.includes('left')) {
        newWidth = Math.max(minWidth, startSize.current.width - deltaX);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(minHeight, startSize.current.height + deltaY);
      }
      if (direction.includes('top')) {
        newHeight = Math.max(minHeight, startSize.current.height - deltaY);
      }

      setSize({ width: newWidth, height: newHeight });
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
      className="relative group"
      style={{
        width: typeof size.width === 'number' ? `${size.width}px` : size.width,
        height: typeof size.height === 'number' ? `${size.height}px` : size.height,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Resize handles - показываем после 1.5 сек hover или при resizing */}
      {(showHandles || isResizing) && (
        <>
          {/* Right */}
          <div
            className="absolute top-0 right-0 w-2 h-full cursor-ew-resize bg-blue-500 opacity-30 hover:opacity-70 transition-opacity z-50"
            onMouseDown={(e) => startResize(e, 'right')}
          />
          {/* Left */}
          <div
            className="absolute top-0 left-0 w-2 h-full cursor-ew-resize bg-blue-500 opacity-30 hover:opacity-70 transition-opacity z-50"
            onMouseDown={(e) => startResize(e, 'left')}
          />
          {/* Bottom */}
          <div
            className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize bg-blue-500 opacity-30 hover:opacity-70 transition-opacity z-50"
            onMouseDown={(e) => startResize(e, 'bottom')}
          />
          {/* Top */}
          <div
            className="absolute top-0 left-0 w-full h-2 cursor-ns-resize bg-blue-500 opacity-30 hover:opacity-70 transition-opacity z-50"
            onMouseDown={(e) => startResize(e, 'top')}
          />
          {/* Bottom-right corner */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-blue-600 opacity-50 hover:opacity-100 transition-opacity rounded-full z-50"
            onMouseDown={(e) => startResize(e, 'right bottom')}
          />
          {/* Bottom-left corner */}
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize bg-blue-600 opacity-50 hover:opacity-100 transition-opacity rounded-full z-50"
            onMouseDown={(e) => startResize(e, 'left bottom')}
          />
          {/* Top-right corner */}
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize bg-blue-600 opacity-50 hover:opacity-100 transition-opacity rounded-full z-50"
            onMouseDown={(e) => startResize(e, 'right top')}
          />
          {/* Top-left corner */}
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize bg-blue-600 opacity-50 hover:opacity-100 transition-opacity rounded-full z-50"
            onMouseDown={(e) => startResize(e, 'left top')}
          />
        </>
      )}

      {isResizing && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-mono z-50 shadow-lg">
          {Math.round(typeof size.width === 'number' ? size.width : 0)}px × {Math.round(typeof size.height === 'number' ? size.height : 0)}px
        </div>
      )}
    </div>
  );
}
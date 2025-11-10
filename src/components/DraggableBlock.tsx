'use client';
import { useState, useRef, useEffect } from 'react';

export default function DraggableBlock({ id, children, onDelete }: { id: string; children: React.ReactNode; onDelete?: (id: string) => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const blockRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem(`block-pos-${id}`);
    if (saved) {
      setPosition(JSON.parse(saved));
    }
  }, [id]);

  useEffect(() => {
    if (isDragging) {
      const timer = setTimeout(() => {
        localStorage.setItem(`block-pos-${id}`, JSON.stringify(position));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [position, isDragging, id]);

  const startDrag = (e: React.MouseEvent) => {
    // Только с Ctrl или если кликнули на специальную ручку
    if (!e.ctrlKey && !(e.target as HTMLElement).closest('.drag-handle')) return;
    if ((e.target as HTMLElement).closest('.no-drag')) return;

    e.preventDefault();
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { ...position };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      const newPos = {
        x: startOffset.current.x + deltaX,
        y: startOffset.current.y + deltaY,
      };

      setPosition(newPos);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div
      ref={blockRef}
      className={`relative ${isDragging ? 'z-50 opacity-80' : ''} group`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s',
      }}
    >
      {/* Drag Handle - видимая иконка для активации перетаскивания */}
      <div
        className="drag-handle absolute top-2 right-2 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded cursor-grab active:cursor-grabbing transition-colors z-40"
        onMouseDown={startDrag}
        title="Зажми и перетащи блок"
      >
        <span className="text-lg select-none">≡</span>
      </div>

      {/* Delete Button - видна при наведении */}
      <div className="absolute top-2 left-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="no-drag bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
          title="Удалить элемент"
        >
          <span>🗑️</span>
          <span className="text-xs">Удалить</span>
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 rounded-lg z-50 flex items-center justify-center no-drag">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl text-center">
            <p className="text-gray-800 dark:text-gray-200 mb-4 font-medium">
              Вы уверены что хотите удалить этот элемент?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Удалить
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {isDragging && (
        <>
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-mono z-50 shadow-lg whitespace-nowrap">
             x: {Math.round(position.x)}, y: {Math.round(position.y)}
          </div>
          <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none" />
        </>
      )}
      {children}
    </div>
  );
}
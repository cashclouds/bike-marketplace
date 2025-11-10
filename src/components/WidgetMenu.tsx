'use client';
import { useState } from 'react';

const AVAILABLE_WIDGETS = [
  { id: 'favorites', name: '📋 Избранное', description: 'Сохранённые объявления' },
  { id: 'search', name: '🔍 Быстрый поиск', description: 'Поиск по брендам и моделям' },
  { id: 'stats', name: '📊 Статистика', description: 'Статистика по объявлениям' },
  { id: 'notes', name: '📝 Заметки', description: 'Ваши личные заметки' },
  { id: 'links', name: '🔗 Быстрые ссылки', description: 'Ссылки на популярные страницы' },
  { id: 'ads', name: '📺 Реклама', description: 'Рекламный блок' },
];

export default function WidgetMenu({ onAddWidget, isOpen, onClose }: { onAddWidget: (widgetId: string) => void; isOpen: boolean; onClose: () => void }) {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);

  const handleToggleWidget = (widgetId: string) => {
    if (selectedWidgets.includes(widgetId)) {
      setSelectedWidgets(selectedWidgets.filter(id => id !== widgetId));
    } else {
      setSelectedWidgets([...selectedWidgets, widgetId]);
    }
  };

  const handleAddSelected = () => {
    selectedWidgets.forEach(widgetId => {
      onAddWidget(widgetId);
    });
    setSelectedWidgets([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-lg shadow-2xl z-50 w-96 max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">Добавить виджет</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-2">
          {AVAILABLE_WIDGETS.map(widget => (
            <label
              key={widget.id}
              className="flex items-start p-3 border dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedWidgets.includes(widget.id)}
                onChange={() => handleToggleWidget(widget.id)}
                className="mt-1 mr-3 w-4 h-4 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-semibold dark:text-white">{widget.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{widget.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedWidgets.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Добавить ({selectedWidgets.length})
          </button>
        </div>
      </div>
    </>
  );
}

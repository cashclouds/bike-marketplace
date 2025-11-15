'use client';
import { useState } from 'react';
import { useLayout } from '@/contexts/LayoutContext';

export default function Widget({ widgetData }: { widgetData: any }) {
  const { removeWidget } = useLayout();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const widgetContent = {
    favorites: {
      icon: '📋',
      title: 'Избранное',
      content: 'Здесь будут ваши сохранённые объявления',
    },
    search: {
      icon: '🔍',
      title: 'Быстрый поиск',
      content: 'Поиск по брендам и моделям велосипедов',
    },
    stats: {
      icon: '📊',
      title: 'Статистика',
      content: 'Статистика по активным объявлениям',
    },
    notes: {
      icon: '📝',
      title: 'Заметки',
      content: 'Ваши личные заметки и напоминания',
    },
    links: {
      icon: '🔗',
      title: 'Быстрые ссылки',
      content: 'Ссылки на популярные страницы маркетплейса',
    },
    ads: {
      icon: '📺',
      title: 'Реклама',
      content: 'Рекламный блок',
    },
  };

  const config = (widgetContent as any)[widgetData.type] || {
    icon: '?',
    title: 'Виджет',
    content: 'Содержание виджета',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col border dark:border-slate-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <h3 className="text-white font-bold">{config.title}</h3>
        </div>
        <button
          onClick={() => removeWidget(widgetData.id)}
          className="text-white hover:bg-blue-700 dark:hover:bg-blue-900 rounded px-2 py-1 transition-colors"
          title="Удалить виджет"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {config.content}
        </p>
        {/* Placeholder для будущего содержимого */}
        <div className="mt-4 p-3 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-600 dark:text-gray-400">
          Виджет "{config.title}" будет развёрнут в следующих версиях
        </div>
      </div>
    </div>
  );
}

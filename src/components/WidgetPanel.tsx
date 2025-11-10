'use client';
import { useState } from 'react';
import Widget from './Widget';
import WidgetMenu from './WidgetMenu';
import { useLayout } from '@/contexts/LayoutContext';

export default function WidgetPanel() {
  const { widgets, addWidget } = useLayout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Кнопка "+ Add Widget" в углу */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold transition-all hover:scale-110 z-30"
        title="Добавить виджет"
      >
        +
      </button>

      {/* Menu для выбора виджетов */}
      <WidgetMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onAddWidget={addWidget}
      />

      {/* Контейнер для виджетов */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {widgets.map((widget: any) => (
          <div key={widget.id} className="pointer-events-auto">
            <Widget widgetData={widget} />
          </div>
        ))}
      </div>
    </>
  );
}

'use client';
import { useLayout } from '@/contexts/LayoutContext';

export default function EditableSection({ section, title, children }: { section: string; title: string; children: React.ReactNode }) {
  const { editMode, layout, toggleSection, moveSection } = useLayout();

  if (!(layout as any)[section]?.visible) {
    return editMode ? (
      <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Hidden: {title}</p>
        <button
          onClick={() => toggleSection(section)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
           Show
        </button>
      </div>
    ) : null;
  }

  return (
    <div className="relative">
      {editMode && (
        <div className="absolute top-2 right-2 z-10 flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border-2 border-blue-500">
          <button
            onClick={() => moveSection(section, 'up')}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            title="Move Up"
          >
            
          </button>
          <button
            onClick={() => moveSection(section, 'down')}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            title="Move Down"
          >
            
          </button>
          <button
            onClick={() => toggleSection(section)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            title="Hide"
          >
            
          </button>
        </div>
      )}
      <div className={editMode ? 'border-2 border-dashed border-blue-500 rounded-lg' : ''}>
        {children}
      </div>
    </div>
  );
}
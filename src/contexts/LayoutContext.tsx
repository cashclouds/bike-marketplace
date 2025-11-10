'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext<any>(null);

const defaultLayout = {
  hero: { visible: true, order: 1 },
  categories: { visible: true, order: 2 },
  brands: { visible: true, order: 3 },
  listings: { visible: true, order: 4 },
  howItWorks: { visible: true, order: 5 },
};

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState(defaultLayout);
  const [widgets, setWidgets] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('layoutConfig');
      if (saved) {
        try {
          setLayout(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse layout config', e);
        }
      }

      // Загрузить виджеты
      const savedWidgets = localStorage.getItem('activeWidgets');
      if (savedWidgets) {
        try {
          setWidgets(JSON.parse(savedWidgets));
        } catch (e) {
          console.error('Failed to parse widgets', e);
        }
      }
    }
  }, []);

  const saveLayout = (newLayout: any) => {
    setLayout(newLayout);
    if (typeof window !== 'undefined') {
      localStorage.setItem('layoutConfig', JSON.stringify(newLayout));
    }
  };

  const toggleSection = (section: string) => {
    const newLayout = {
      ...layout,
      [section]: {
        ...(layout as any)[section],
        visible: !(layout as any)[section].visible,
      },
    };
    saveLayout(newLayout);
  };

  const moveSection = (section: string, direction: string) => {
    const sections = Object.keys(layout);
    const currentIndex = sections.findIndex(s => s === section);

    if (direction === 'up' && currentIndex > 0) {
      const newLayout = { ...(layout as any) };
      const temp = (newLayout as any)[sections[currentIndex]].order;
      (newLayout as any)[sections[currentIndex]].order = (newLayout as any)[sections[currentIndex - 1]].order;
      (newLayout as any)[sections[currentIndex - 1]].order = temp;
      saveLayout(newLayout);
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      const newLayout = { ...(layout as any) };
      const temp = (newLayout as any)[sections[currentIndex]].order;
      (newLayout as any)[sections[currentIndex]].order = (newLayout as any)[sections[currentIndex + 1]].order;
      (newLayout as any)[sections[currentIndex + 1]].order = temp;
      saveLayout(newLayout);
    }
  };

  const resetLayout = () => {
    saveLayout(defaultLayout);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const createContextValue = () => ({
    editMode,
    layout,
    toggleEditMode,
    toggleSection,
    moveSection,
    resetLayout,
    widgets,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetSize,
  });

  const addWidget = (widgetId: string) => {
    const newWidget = {
      id: `${widgetId}-${Date.now()}`,
      type: widgetId,
      x: 0,
      y: 0,
      width: 300,
      height: 400,
    };
    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeWidgets', JSON.stringify(updatedWidgets));
    }
  };

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter((w: any) => w.id !== widgetId);
    setWidgets(updatedWidgets);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeWidgets', JSON.stringify(updatedWidgets));
    }
  };

  const updateWidgetPosition = (widgetId: string, x: number, y: number) => {
    const updatedWidgets = widgets.map((w: any) =>
      w.id === widgetId ? { ...w, x, y } : w
    );
    setWidgets(updatedWidgets);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeWidgets', JSON.stringify(updatedWidgets));
    }
  };

  const updateWidgetSize = (widgetId: string, width: number, height: number) => {
    const updatedWidgets = widgets.map((w: any) =>
      w.id === widgetId ? { ...w, width, height } : w
    );
    setWidgets(updatedWidgets);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeWidgets', JSON.stringify(updatedWidgets));
    }
  };

  return (
    <LayoutContext.Provider value={createContextValue()}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => {
  const context = useContext(LayoutContext) as any;
  if (!context) {
    // Return default values if context is not available
    return {
      editMode: false,
      layout: defaultLayout,
      toggleEditMode: () => {},
      toggleSection: (section: string) => {},
      moveSection: (section: string, direction: string) => {},
      resetLayout: () => {},
      widgets: [],
      addWidget: (widgetId: string) => {},
      removeWidget: (widgetId: string) => {},
      updateWidgetPosition: (widgetId: string, x: number, y: number) => {},
      updateWidgetSize: (widgetId: string, width: number, height: number) => {},
    };
  }
  return context;
};
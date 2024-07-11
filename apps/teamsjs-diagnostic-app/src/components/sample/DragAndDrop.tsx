import React, { createContext, useContext, ReactNode } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ApiComponent } from './ApiComponents';

interface DragAndDropProviderProps {
  addToScenario: (api: ApiComponent, func: string, input?: string) => void;
  children: ReactNode;
}

const DragAndDropContext = createContext<{
  addToScenario: (api: ApiComponent, func: string, input?: string) => void;
} | null>(null);

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ addToScenario, children }) => {
  return (
    <DragAndDropContext.Provider value={{ addToScenario }}>
      {children}
    </DragAndDropContext.Provider>
  );
};

export const useDragAndDrop = () => {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error('useDragAndDrop must be used within a DragAndDropProvider');
  }
  return context;
};

interface DragAndDropProps {
  apiComponent: ApiComponent;
}

export const DragAndDrop: React.FC<DragAndDropProps> = ({ apiComponent }) => {
  const { addToScenario } = useDragAndDrop();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'API',
    item: { api: apiComponent },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'API',
    drop: (item: { api: ApiComponent }) => {
      addToScenario(item.api, 'defaultFunction');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} style={{ opacity: isOver ? 0.7 : 1 }}>
      <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        {apiComponent.title}
      </div>
    </div>
  );
};

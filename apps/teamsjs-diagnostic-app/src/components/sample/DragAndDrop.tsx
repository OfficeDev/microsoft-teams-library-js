import React from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from './ApiComponents';

interface DragAndDropProps {
  apiComponent: ApiComponent;
  addToScenario: (api: ApiComponent, func: string, input?: string) => void;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({ apiComponent, addToScenario }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'API',
    item: { api: apiComponent },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div className="api-container" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="api-header">{apiComponent.title}</div>
    </div>
  );
};

export default DragAndDrop;

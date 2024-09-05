import { useDrag } from 'react-dnd';

export const useDragAndDrop = (type: string, item: any) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [item]);

  return { isDragging, drag };
};

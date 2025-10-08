import { useState } from 'react';

export function useDragAndDrop<T extends { id: string }>(
  items: T[],
  onReorder: (newItems: T[]) => void
) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, item: T) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (!draggedItem) return;

    const dragIndex = items.findIndex(item => item.id === draggedItem.id);

    if (dragIndex !== dropIndex && dragIndex !== -1) {
      const newItems = [...items];
      const [removed] = newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, removed);

      onReorder(newItems);
    }

    cleanup();
  };

  const handleDragEnd = () => {
    cleanup();
  };

  const cleanup = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
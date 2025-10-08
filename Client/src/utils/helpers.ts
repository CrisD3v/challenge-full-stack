import type { Task } from '../types';

export const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatearFechaCompleta = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const esFechaVencida = (date: string): boolean => {
  return new Date(date) < new Date();
};

export const obtenerColorPrioridad = (priority: 'baja' | 'media' | 'alta'): string => {
  const colores = {
    baja: '#10b981',
    media: '#f59e0b',
    alta: '#ef4444',
  };
  return colores[priority];
};

export const exportarCSV = (tasks: Task[]): void => {
  const headers = ['Título', 'Descripción', 'Completada', 'Prioridad', 'Fecha Vencimiento', 'Categoría', 'Etiquetas', 'Creada'];

  const csvContent = [
    headers.join(','),
    ...tasks.map(task => [
      `"${task.title}"`,
      `"${task.description || ''}"`,
      task.completed ? 'Sí' : 'No',
      task.priority,
      task.dueDate ? formatearFecha(task.dueDate) : '',
      task.categories?.name || '',
      task.tags?.map(e => e.name).join('; ') || '',
      formatearFecha(task.createdAt)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `tareas_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportarJSON = (tareas: Task[]): void => {
  const jsonContent = JSON.stringify(tareas, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `tareas_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const generarColorAleatorio = (): string => {
  const colores = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e'
  ];
  return colores[Math.floor(Math.random() * colores.length)];
};

export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const truncarTexto = (texto: string, longitud: number): string => {
  if (texto.length <= longitud) return texto;
  return texto.substring(0, longitud) + '...';
};
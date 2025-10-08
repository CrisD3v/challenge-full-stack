import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { Tag } from '../types';

export function useTags() {
  const [etiquetas, setEtiquetas] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función helper para asegurar que siempre sea un array
  const ensureArray = (data: any): Tag[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.etiquetas)) return data.etiquetas;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    console.warn('Datos de etiquetas no son un array:', data);
    return [];
  };

  const cargarEtiquetas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('useEtiquetas - Cargando etiquetas...');
      const etiquetasObtenidas = await apiService.obtenerEtiquetas();
      console.log('useEtiquetas - Etiquetas obtenidas:', etiquetasObtenidas);

      // Verificar que sea un array
      const etiquetasArray = ensureArray(etiquetasObtenidas);
      console.log('useEtiquetas - Etiquetas como array:', etiquetasArray);

      setEtiquetas(etiquetasArray);
    } catch (err: any) {
      console.error('useEtiquetas - Error al cargar etiquetas:', err);
      setError(err.response?.data?.message || 'Error al cargar las etiquetas');
      setEtiquetas([]); // Asegurar que siempre sea un array
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('useEtiquetas useEffect - Token:', token ? 'Presente' : 'Ausente');
    if (token) {
      console.log('useEtiquetas useEffect - Cargando etiquetas porque hay token');
      cargarEtiquetas();
    } else {
      console.log('useEtiquetas useEffect - No hay token, no cargando etiquetas');
    }
  }, [cargarEtiquetas]);

  // Escuchar evento de login exitoso
  useEffect(() => {
    const handleUserLoggedIn = () => {
      console.log('useEtiquetas - Usuario logueado, recargando etiquetas');
      cargarEtiquetas();
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, [cargarEtiquetas]);

  const crearEtiqueta = async (data: Omit<Tag, 'id' | 'usuarioId' | 'createdAt' | 'updatedAt'>): Promise<Tag> => {
    try {
      setError(null);
      const nuevaEtiqueta = await apiService.crearEtiqueta(data);
      setEtiquetas(prev => {
        const prevArray = ensureArray(prev);
        return [...prevArray, nuevaEtiqueta];
      });
      return nuevaEtiqueta;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la etiqueta');
      throw err;
    }
  };

  const eliminarEtiqueta = async (id: string): Promise<void> => {
    try {
      setError(null);
      await apiService.eliminarEtiqueta(id);
      setEtiquetas(prev => {
        const prevArray = ensureArray(prev);
        return prevArray.filter(etiqueta => etiqueta.id !== id);
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar la etiqueta');
      throw err;
    }
  };

  const limpiarError = () => {
    setError(null);
  };

  return {
    etiquetas,
    isLoading,
    error,
    crearEtiqueta,
    eliminarEtiqueta,
    cargarEtiquetas,
    limpiarError,
  };
}
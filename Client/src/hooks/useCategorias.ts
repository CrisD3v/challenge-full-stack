import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { Category } from '../types';

export function useCategorias() {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función helper para asegurar que siempre sea un array
  const ensureArray = (data: any): Category[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.categorias)) return data.categorias;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    console.warn('Datos de categorías no son un array:', data);
    return [];
  };

  const cargarCategorias = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('useCategorias - Cargando categorías...');
      const categoriasObtenidas = await apiService.obtenerCategorias();
      console.log('useCategorias - Categorías obtenidas:', categoriasObtenidas);

      // Verificar que sea un array
      const categoriasArray = ensureArray(categoriasObtenidas);
      console.log('useCategorias - Categorías como array:', categoriasArray);

      setCategorias(categoriasArray);
    } catch (err: any) {
      console.error('useCategorias - Error al cargar categorías:', err);
      setError(err.response?.data?.message || 'Error al cargar las categorías');
      setCategorias([]); // Asegurar que siempre sea un array
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('useCategorias useEffect - Token:', token ? 'Presente' : 'Ausente');
    if (token) {
      console.log('useCategorias useEffect - Cargando categorías porque hay token');
      cargarCategorias();
    } else {
      console.log('useCategorias useEffect - No hay token, no cargando categorías');
    }
  }, [cargarCategorias]);

  // Escuchar evento de login exitoso
  useEffect(() => {
    const handleUserLoggedIn = () => {
      console.log('useCategorias - Usuario logueado, recargando categorías');
      cargarCategorias();
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, [cargarCategorias]);

  const crearCategoria = async (data: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    try {
      setError(null);
      const nuevaCategoria = await apiService.crearCategoria(data);
      setCategorias(prev => {
        const prevArray = ensureArray(prev);
        return [...prevArray, nuevaCategoria];
      });
      return nuevaCategoria;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la categoría');
      throw err;
    }
  };

  const actualizarCategoria = async (id: string, data: Partial<Category>): Promise<Category> => {
    try {
      setError(null);
      const categoriaActualizada = await apiService.actualizarCategoria(id, data);
      setCategorias(prev => {
        const prevArray = ensureArray(prev);
        return prevArray.map(categoria =>
          categoria.id === id ? categoriaActualizada : categoria
        );
      });
      return categoriaActualizada;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la categoría');
      throw err;
    }
  };

  const eliminarCategoria = async (id: string): Promise<void> => {
    try {
      setError(null);
      await apiService.eliminarCategoria(id);
      setCategorias(prev => {
        const prevArray = ensureArray(prev);
        return prevArray.filter(categoria => categoria.id !== id);
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar la categoría');
      throw err;
    }
  };

  const limpiarError = () => {
    setError(null);
  };

  return {
    categorias,
    isLoading,
    error,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    cargarCategorias,
    limpiarError,
  };
}
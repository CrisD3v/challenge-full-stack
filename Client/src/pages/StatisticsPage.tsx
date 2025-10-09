import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Loading } from '../components/Commons/Loading';
import { ErrorMessage } from '../components/Commons/ErrorMessage';
import { useTasks } from '../hooks/useTasks';
import { useCategories } from '../hooks/useCategorias';
import { apiService } from '../services/api';
import type { StatisticsTasks } from '../types';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  
  @media (max-width: 480px) {
    padding: 0 0.75rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
`;

const PageDescription = styled.p`
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--color-shadow-light);
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
  box-sizing: border-box;
  min-width: 0; /* Permite que el contenido se contraiga */

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--color-shadow);
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const ChartCard = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--color-shadow-light);
  width: 100%;
  box-sizing: border-box;
  min-width: 0; /* Permite que el contenido se contraiga */
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1.5rem 0;
`;

const PriorityChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PriorityItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PriorityInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PriorityColor = styled.div<{ $priority: 'alta' | 'media' | 'baja' }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.$priority) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baja': return '#10b981';
      default: return '#64748b';
    }
  }};
`;

const PriorityLabel = styled.span`
  font-size: 0.875rem;
  color: var(--color-text);
  text-transform: capitalize;
`;

const PriorityValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
`;

const CategoryChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 350px;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* Estilos para el scrollbar - más sutil */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 2px;
    opacity: 0.5;
  }
  
  /* Solo mostrar scrollbar al hacer hover en el contenedor */
  &:hover::-webkit-scrollbar-thumb {
    opacity: 0.8;
  }
  
  /* Para Firefox */
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  min-width: 0; /* Permite que el contenido se contraiga */
  
  &:hover {
    background-color: var(--color-bg);
    border-color: var(--color-border);
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const CategoryName = styled.span`
  font-size: 0.875rem;
  color: var(--color-text);
  flex: 1;
  min-width: 0; /* Permite que el texto se trunque si es necesario */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const CategoryStats = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0; /* No se contrae */
  
  @media (max-width: 480px) {
    gap: 0.25rem;
  }
`;

const CategoryCount = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  min-width: 2rem;
  text-align: right;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    min-width: 1.5rem;
  }
`;

const CategoryPercentage = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  min-width: 3rem;
  text-align: right;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    min-width: 2.5rem;
  }
`;

const ProgressSection = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--color-shadow-light);
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ProgressTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1.5rem 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, var(--color-success) 0%, var(--color-primary) 100%);
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

export function StaticsPage() {
  const { tasks, isLoading: tareasLoading, error } = useTasks();
  const { categorias, isLoading: categoriasLoading } = useCategories();
  const [estadisticas, setEstadisticas] = useState<StatisticsTasks | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setIsLoadingStats(true);
        const stats = await apiService.obtenerEstadisticas();
        setEstadisticas(stats);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (!tareasLoading) {
      cargarEstadisticas();
    }
  }, [tareasLoading]);

  const isLoading = tareasLoading || isLoadingStats || categoriasLoading;

  // Asegurar que tareas y categorías sean arrays
  const tareasArray = Array.isArray(tasks) ? tasks : [];
  const categoriasArray = Array.isArray(categorias) ? categorias : [];

  // Crear un mapa de ID de categoría a nombre para búsqueda rápida
  const categoryMap = new Map(
    categoriasArray.map(cat => [cat.id, cat.name])
  );

  // Calcular estadísticas locales si no hay del servidor
  const statsLocales = {
    total: tareasArray.length,
    completeds: tareasArray.filter(t => t.completed).length,
    pending: tareasArray.filter(t => !t.completed).length,
    perPriority: {
      alta: tareasArray.filter(t => t.priority === 'alta').length,
      media: tareasArray.filter(t => t.priority === 'media').length,
      baja: tareasArray.filter(t => t.priority === 'baja').length,
    },
    perCategory: (() => {
      const categoryCountMap = new Map<string, number>();

      tareasArray.forEach(tarea => {
        let categoryName: string;

        // Priorizar el nombre de la categoría si está disponible en el objeto
        if (tarea.categories?.name) {
          categoryName = tarea.categories.name;
        }
        // Si no, buscar por categoryId en el mapa de categorías
        else if (tarea.categoryId && categoryMap.has(tarea.categoryId)) {
          categoryName = categoryMap.get(tarea.categoryId)!;
        }
        // Si no tiene categoría asignada
        else {
          categoryName = 'Sin categoría';
        }

        const currentCount = categoryCountMap.get(categoryName) || 0;
        categoryCountMap.set(categoryName, currentCount + 1);
      });

      // Convertir el Map a array y ordenar
      return Array.from(categoryCountMap.entries())
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => {
          // Poner "Sin categoría" al final
          if (a.category === 'Sin categoría') return 1;
          if (b.category === 'Sin categoría') return -1;
          // Ordenar el resto alfabéticamente
          return a.category.localeCompare(b.category);
        });
    })(),
  };

  const stats = estadisticas || statsLocales;
  const porcentajeCompletado = stats.total > 0 ? (stats.completeds / stats.total) * 100 : 0;

  if (isLoading) {
    return <Loading size="large" texto="Cargando estadísticas..." />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Estadísticas</PageTitle>
        <PageDescription>
          Analiza tu productividad y el progreso de tus tareas
        </PageDescription>
      </PageHeader>

      {error && (
        <ErrorMessage mensaje={error} />
      )}

      <StatsGrid>
        <StatCard>
          <StatIcon>📋</StatIcon>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total de Tareas</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>✅</StatIcon>
          <StatValue>{stats.completeds}</StatValue>
          <StatLabel>Tareas Completadas</StatLabel>
          <StatSubtext>
            {porcentajeCompletado.toFixed(1)}% del total
          </StatSubtext>
        </StatCard>

        <StatCard>
          <StatIcon>⏳</StatIcon>
          <StatValue>{stats.pending}</StatValue>
          <StatLabel>Tareas Pendientes</StatLabel>
          <StatSubtext>
            {stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}% del total
          </StatSubtext>
        </StatCard>

        <StatCard>
          <StatIcon>🎯</StatIcon>
          <StatValue>{porcentajeCompletado.toFixed(0)}%</StatValue>
          <StatLabel>Progreso General</StatLabel>
          <StatSubtext>
            {stats.pending} tareas por completar
          </StatSubtext>
        </StatCard>
      </StatsGrid>

      <ChartsSection>
        <ChartCard>
          <ChartTitle>Tareas por Prioridad</ChartTitle>
          <PriorityChart>
            <PriorityItem>
              <PriorityInfo>
                <PriorityColor $priority="alta" />
                <PriorityLabel>Alta prioridad</PriorityLabel>
              </PriorityInfo>
              <PriorityValue>{stats.perPriority.alta}</PriorityValue>
            </PriorityItem>

            <PriorityItem>
              <PriorityInfo>
                <PriorityColor $priority="media" />
                <PriorityLabel>Media prioridad</PriorityLabel>
              </PriorityInfo>
              <PriorityValue>{stats.perPriority.media}</PriorityValue>
            </PriorityItem>

            <PriorityItem>
              <PriorityInfo>
                <PriorityColor $priority="baja" />
                <PriorityLabel>Baja prioridad</PriorityLabel>
              </PriorityInfo>
              <PriorityValue>{stats.perPriority.baja}</PriorityValue>
            </PriorityItem>
          </PriorityChart>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Tareas por Categoría</ChartTitle>
          <CategoryChart>
            {stats.perCategory.length > 0 ? (
              stats.perCategory.map((item, index) => {
                const percentage = stats.total > 0 ? ((item.total / stats.total) * 100).toFixed(1) : '0.0';
                return (
                  <CategoryItem key={`${item.category}-${index}`}>
                    <CategoryName
                      style={{
                        fontStyle: item.category === 'Sin categoría' ? 'italic' : 'normal',
                        color: item.category === 'Sin categoría' ?
                          'var(--color-text-secondary)' :
                          'var(--color-text)'
                      }}
                    >
                      {item.category === 'Sin categoría' ? '📝 Sin categoría' : `📁 ${item.category}`}
                    </CategoryName>
                    <CategoryStats>
                      <CategoryCount>{item.total}</CategoryCount>
                      <CategoryPercentage>({percentage}%)</CategoryPercentage>
                    </CategoryStats>
                  </CategoryItem>
                );
              })
            ) : (
              <div style={{
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                padding: '2rem',
                fontStyle: 'italic'
              }}>
                📝 No hay tareas registradas
              </div>
            )}
          </CategoryChart>
        </ChartCard>
      </ChartsSection>

      <ProgressSection>
        <ProgressTitle>Progreso General</ProgressTitle>
        <ProgressBar>
          <ProgressFill $percentage={porcentajeCompletado} />
        </ProgressBar>
        <ProgressText>
          {stats.completeds} de {stats.total} tareas completadas ({porcentajeCompletado.toFixed(1)}%)
        </ProgressText>
      </ProgressSection>
    </PageContainer>
  );
}
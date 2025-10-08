import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Loading } from '../components/Commons/Loading';
import { ErrorMessage } from '../components/Commons/ErrorMessage';
import { useTasks } from '../hooks/useTasks';
import { apiService } from '../services/api';
import type { StatisticsTasks } from '../types';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--color-shadow-light);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--color-shadow);
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

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--color-shadow-light);
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
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: var(--color-bg-secondary);
  border-radius: 6px;
`;

const CategoryName = styled.span`
  font-size: 0.875rem;
  color: var(--color-text);
`;

const CategoryCount = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
`;

const ProgressSection = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--color-shadow-light);
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

  const isLoading = tareasLoading || isLoadingStats;

  // Asegurar que tareas sea un array
  const tareasArray = Array.isArray(tasks) ? tasks : [];

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
    perCategory: tareasArray.reduce((acc, tarea) => {
      const category = tarea.categories?.name || 'Sin categoría';
      const existing = acc.find(item => item.category === category);
      if (existing) {
        existing.total++;
      } else {
        acc.push({ category, total: 1 });
      }
      return acc;
    }, [] as Array<{ category: string; total: number }>),
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
              stats.perCategory.map((item, index) => (
                <CategoryItem key={index}>
                  <CategoryName>{item.category}</CategoryName>
                  <CategoryCount>{item.total}</CategoryCount>
                </CategoryItem>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                padding: '2rem'
              }}>
                No hay datos de categorías
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
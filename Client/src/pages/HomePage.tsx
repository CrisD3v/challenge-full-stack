import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ErrorMessage } from '../components/Commons/ErrorMessage';
import { Loading } from '../components/Commons/Loading';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategorias';
import { useTasks } from '../hooks/useTasks';
import { formatearFecha } from '../utils/helpers';


const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
`;

const QuickActionsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const QuickActionCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--color-shadow);
    border-color: var(--color-primary);
  }
`;

const ActionIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const ActionTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ActionDescription = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: center;
`;

const RecentTasksSection = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
`;


const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 0.75rem;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  gap: 1rem;
`;

const TaskInfo = styled.div`
  flex: 1;
`;

const TaskTitle = styled.div`
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
`;

const TaskMeta = styled.div`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

const PriorityBadge = styled.span<{ $priority: 'baja' | 'media' | 'alta' }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.$priority) {
      case 'alta': return '#fef2f2';
      case 'media': return '#fffbeb';
      case 'baja': return '#f0fdf4';
      default: return '#f8fafc';
    }
  }};
  color: ${props => {
    switch (props.$priority) {
      case 'alta': return '#dc2626';
      case 'media': return '#d97706';
      case 'baja': return '#16a34a';
      default: return '#64748b';
    }
  }};
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
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

export function HomePage() {
  const { usuario } = useAuth();
  const { tasks, isLoading: tareasLoading, error: tareasError, cargarTareas: _cargarTareas } = useTasks();
  const { categorias, isLoading: categoriasLoading, cargarCategorias: _cargarCategorias } = useCategories();


  const isLoading = tareasLoading || categoriasLoading;

  // Asegurar que tareas sea un array
  const tareasArray = Array.isArray(tasks) ? tasks : [];
  const categoriasArray = Array.isArray(categorias) ? categorias : [];

  // Calcular estadísticas
  const stats = {
    totalTareas: tareasArray.length,
    tareasCompletadas: tareasArray.filter(t => t.completed).length,
    tareasPendientes: tareasArray.filter(t => !t.completed).length,
    totalCategorias: categoriasArray.length,
  };

  // Obtener tareas recientes (últimas 5)
  const tareasRecientes = tareasArray
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const quickActions = [
    {
      to: '/dashboard/tareas',
      icon: '➕',
      title: 'Nueva Tarea',
      description: 'Crear una nueva tarea'
    },
    {
      to: '/dashboard/categorias',
      icon: '📁',
      title: 'Gestionar Categorías',
      description: 'Organizar tus categorías'
    },
    {
      to: '/dashboard/estadisticas',
      icon: '📊',
      title: 'Ver Estadísticas',
      description: 'Analizar tu productividad'
    },
    {
      to: '/dashboard/exportar',
      icon: '📤',
      title: 'Exportar Datos',
      description: 'Descargar tus tareas'
    }
  ];

  if (isLoading) {
    return <Loading size="large" texto="Cargando dashboard..." />;
  }

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>¡Hola, {usuario?.name}! 👋</WelcomeTitle>
        <WelcomeSubtitle>
          Aquí tienes un resumen de tus tareas y productividad
        </WelcomeSubtitle>
      </WelcomeSection>

      {tareasError && (
        <ErrorMessage mensaje={tareasError} />
      )}

      <StatsGrid>
        <StatCard>
          <StatIcon>📋</StatIcon>
          <StatValue>{stats.totalTareas}</StatValue>
          <StatLabel>Total de Tareas</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>✅</StatIcon>
          <StatValue>{stats.tareasCompletadas}</StatValue>
          <StatLabel>Tareas Completadas</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>⏳</StatIcon>
          <StatValue>{stats.tareasPendientes}</StatValue>
          <StatLabel>Tareas Pendientes</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>📁</StatIcon>
          <StatValue>{stats.totalCategorias}</StatValue>
          <StatLabel>Categorías</StatLabel>
        </StatCard>
      </StatsGrid>

      <QuickActionsSection>
        <SectionTitle>Acciones Rápidas</SectionTitle>
        <QuickActionsGrid>
          {quickActions.map((action) => (
            <QuickActionCard key={action.to} to={action.to}>
              <ActionIcon>{action.icon}</ActionIcon>
              <ActionTitle>{action.title}</ActionTitle>
              <ActionDescription>{action.description}</ActionDescription>
            </QuickActionCard>
          ))}
        </QuickActionsGrid>
      </QuickActionsSection>

      <RecentTasksSection>
        <SectionTitle>Tareas Recientes</SectionTitle>
        {tareasRecientes.length > 0 ? (
          <TaskList>
            {tareasRecientes.map((tarea) => (
              <TaskItem key={tarea.id}>
                <TaskInfo>
                  <TaskTitle>{tarea.title}</TaskTitle>
                  <TaskMeta>
                    Creada el {formatearFecha(tarea.createdAt)}
                    {tarea.categories && ` • ${tarea.categories.name}`}
                  </TaskMeta>
                </TaskInfo>
                <PriorityBadge $priority={tarea.priority}>
                  {tarea.priority}
                </PriorityBadge>
              </TaskItem>
            ))}
          </TaskList>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem' }}>
            No tienes tareas aún. ¡Crea tu primera tarea!
          </p>
        )}
      </RecentTasksSection>
    </DashboardContainer>
  );
}

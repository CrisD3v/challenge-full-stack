import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';


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

export function HomePage() {
    const { usuario } = useAuth();


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

    return (
        <DashboardContainer>
            <WelcomeSection>
                <WelcomeTitle>¡Hola, {usuario?.name}! 👋</WelcomeTitle>
                <WelcomeSubtitle>
                    Aquí tienes un resumen de tus tareas y productividad
                </WelcomeSubtitle>
            </WelcomeSection>

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
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem' }}>
                    No tienes tareas aún. ¡Crea tu primera tarea!
                </p>
            </RecentTasksSection>
        </DashboardContainer>
    );
}
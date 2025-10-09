import type { FiltrosTareas } from '../../types';

interface QuickPriorityTestProps {
  filtros: FiltrosTareas;
  onFiltrosChange: (filtros: FiltrosTareas) => void;
}

export function QuickPriorityTest({ filtros, onFiltrosChange }: QuickPriorityTestProps) {
  const applyFilter = (priority: string | undefined) => {
    console.log('QuickPriorityTest: Applying filter', priority);

    const newFiltros = { ...filtros };
    if (priority) {
      newFiltros.priority = priority as any;
    } else {
      delete newFiltros.priority;
    }

    onFiltrosChange(newFiltros);
  };

  const buttonStyle = (isActive: boolean, color: string) => ({
    padding: '0.5rem 1rem',
    margin: '0.25rem',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isActive ? color : '#6b7280',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem'
  });

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      margin: '1rem 0',
      border: '2px solid #3b82f6'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#3b82f6' }}>
        🧪 Test Rápido de Filtro de Prioridad
      </h3>

      <div>
        <button
          style={buttonStyle(!filtros.priority, '#374151')}
          onClick={() => applyFilter(undefined)}
        >
          Todas
        </button>

        <button
          style={buttonStyle(filtros.priority === 'alta', '#ef4444')}
          onClick={() => applyFilter('alta')}
        >
          Alta
        </button>

        <button
          style={buttonStyle(filtros.priority === 'media', '#f59e0b')}
          onClick={() => applyFilter('media')}
        >
          Media
        </button>

        <button
          style={buttonStyle(filtros.priority === 'baja', '#10b981')}
          onClick={() => applyFilter('baja')}
        >
          Baja
        </button>
      </div>

      <div style={{
        marginTop: '1rem',
        fontSize: '0.875rem',
        color: '#374151'
      }}>
        Filtro actual: <strong>{filtros.priority || 'Ninguno'}</strong>
      </div>
    </div>
  );
}

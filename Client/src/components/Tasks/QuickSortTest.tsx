import type { OrdenTareas } from '../../types';

interface QuickSortTestProps {
  orden: OrdenTareas;
  onOrdenChange: (orden: OrdenTareas) => void;
  applySortOrder?: (field: string, direction: 'asc' | 'desc') => void;
  changeSortField?: (field: string) => void;
  changeSortDirection?: (direction: 'asc' | 'desc') => void;
  toggleSortDirection?: () => void;
}

export function QuickSortTest({
  orden,
  onOrdenChange,
  applySortOrder,
  changeSortField,
  changeSortDirection,
  toggleSortDirection
}: QuickSortTestProps) {
  const applySort = (field: string, direction: 'asc' | 'desc') => {
    console.log('QuickSortTest: Applying sort', { field, direction });

    if (applySortOrder) {
      applySortOrder(field, direction);
    } else {
      const newOrden = { field: field as any, direction };
      onOrdenChange(newOrden);
    }
  };

  const buttonStyle = (isActive: boolean, color: string = '#3b82f6') => ({
    padding: '0.4rem 0.8rem',
    margin: '0.2rem',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isActive ? color : '#6b7280',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  const fieldLabels = {
    createdAt: 'Fecha Creación',
    title: 'Título',
    priority: 'Prioridad',
    dueDate: 'Fecha Venc.'
  };

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      margin: '1rem 0',
      border: '2px solid #0ea5e9'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#0ea5e9' }}>
        📊 Test Rápido de Ordenamiento
      </h3>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#374151' }}>
          Campo de Ordenamiento:
        </h4>
        <div>
          {Object.entries(fieldLabels).map(([field, label]) => (
            <button
              key={field}
              style={buttonStyle(orden.field === field, '#0ea5e9')}
              onClick={() => applySort(field, orden.direction)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#374151' }}>
          Dirección:
        </h4>
        <div>
          <button
            style={buttonStyle(orden.direction === 'desc', '#ef4444')}
            onClick={() => applySort(orden.field, 'desc')}
          >
            ⬇️ Descendente
          </button>

          <button
            style={buttonStyle(orden.direction === 'asc', '#10b981')}
            onClick={() => applySort(orden.field, 'asc')}
          >
            ⬆️ Ascendente
          </button>

          {toggleSortDirection && (
            <button
              style={{
                ...buttonStyle(false, '#8b5cf6'),
                marginLeft: '0.5rem'
              }}
              onClick={toggleSortDirection}
            >
              🔄 Alternar
            </button>
          )}
        </div>
      </div>

      <div style={{
        fontSize: '0.875rem',
        color: '#374151',
        backgroundColor: '#ffffff',
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #d1d5db'
      }}>
        <strong>Ordenamiento actual:</strong><br />
        Campo: <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>
          {fieldLabels[orden.field as keyof typeof fieldLabels] || orden.field}
        </span><br />
        Dirección: <span style={{
          color: orden.direction === 'desc' ? '#ef4444' : '#10b981',
          fontWeight: 'bold'
        }}>
          {orden.direction === 'desc' ? '⬇️ Descendente' : '⬆️ Ascendente'}
        </span>
      </div>
    </div>
  );
}

import { useState } from 'react';
import styled from 'styled-components';
import { useTasks } from '../hooks/useTasks';
import { apiService } from '../services/api';
import { exportarCSV, exportarJSON } from '../utils/helpers';
import { Loading } from '../components/Commons/Loading';
import { ErrorMessage } from '../components/Commons/ErrorMessage';

const PageContainer = styled.div`
  max-width: 800px;
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

const ExportSection = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px var(--color-shadow-light);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
`;

const ExportOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ExportCard = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  background-color: var(--color-bg-secondary);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--color-shadow);
  }
`;

const ExportIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const ExportTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
`;

const ExportDescription = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
`;

const ExportButton = styled.button`
  width: 100%;
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatsSection = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px var(--color-shadow-light);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoBox = styled.div`
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
`;

const InfoTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: var(--color-primary);
  margin: 0;
  line-height: 1.4;
`;

const InfoList = styled.ul`
  font-size: 0.875rem;
  color: var(--color-primary);
  margin: 0.5rem 0 0 1rem;
  line-height: 1.4;
`;

export function ExportPages() {
  const { tasks, isLoading, error } = useTasks();
  const [exportando, setExportando] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const handleExportarCSV = async () => {
    try {
      setExportando('csv');
      setMensajeExito(null);

      // Usar función local para exportar
      exportarCSV(tareasArray);

      setMensajeExito('Archivo CSV descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
    } finally {
      setExportando(null);
      setTimeout(() => setMensajeExito(null), 3000);
    }
  };

  const handleExportarJSON = async () => {
    try {
      setExportando('json');
      setMensajeExito(null);

      // Usar función local para exportar
      exportarJSON(tareasArray);

      setMensajeExito('Archivo JSON descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar JSON:', error);
    } finally {
      setExportando(null);
      setTimeout(() => setMensajeExito(null), 3000);
    }
  };

  const handleExportarServidorCSV = async () => {
    try {
      setExportando('server-csv');
      setMensajeExito(null);

      const blob = await apiService.exportarTareas('csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tareas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMensajeExito('Archivo CSV del servidor descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar desde servidor:', error);
    } finally {
      setExportando(null);
      setTimeout(() => setMensajeExito(null), 3000);
    }
  };

  const handleExportarServidorJSON = async () => {
    try {
      setExportando('server-json');
      setMensajeExito(null);

      const blob = await apiService.exportarTareas('json');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tareas_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMensajeExito('Archivo JSON del servidor descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar desde servidor:', error);
    } finally {
      setExportando(null);
      setTimeout(() => setMensajeExito(null), 3000);
    }
  };

  // Asegurar que tareas sea un array
  const tareasArray = Array.isArray(tasks) ? tasks : [];

  const stats = {
    total: tareasArray.length,
    completadas: tareasArray.filter(t => t.completed).length,
    pendientes: tareasArray.filter(t => !t.completed).length,
    conCategoria: tareasArray.filter(t => t.categories).length,
    conEtiquetas: tareasArray.filter(t => t.tags && t.tags.length > 0).length,
  };

  if (isLoading) {
    return <Loading size="large" texto="Cargando datos para exportar..." />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Exportar Datos</PageTitle>
        <PageDescription>
          Descarga tus tareas en diferentes formatos para respaldo o análisis
        </PageDescription>
      </PageHeader>

      {error && (
        <ErrorMessage mensaje={error} />
      )}

      {mensajeExito && (
        <InfoBox>
          <InfoTitle>✅ Exportación Exitosa</InfoTitle>
          <InfoText>{mensajeExito}</InfoText>
        </InfoBox>
      )}

      <InfoBox>
        <InfoTitle>ℹ️ Información sobre la Exportación</InfoTitle>
        <InfoText>Los archivos exportados incluyen:</InfoText>
        <InfoList>
          <li>Título y descripción de las tareas</li>
          <li>Estado de completado y prioridad</li>
          <li>Fechas de creación y vencimiento</li>
          <li>Categorías y etiquetas asociadas</li>
          <li>Metadatos adicionales</li>
        </InfoList>
      </InfoBox>

      <ExportSection>
        <SectionTitle>Exportación Local</SectionTitle>
        <ExportOptions>
          <ExportCard>
            <ExportIcon>📊</ExportIcon>
            <ExportTitle>Exportar como CSV</ExportTitle>
            <ExportDescription>
              Formato ideal para análisis en Excel, Google Sheets u otras herramientas de hojas de cálculo.
            </ExportDescription>
            <ExportButton
              onClick={handleExportarCSV}
              disabled={exportando === 'csv' || tasks.length === 0}
            >
              {exportando === 'csv' ? (
                <Loading size="small" mostrarTexto={false} />
              ) : (
                <>📊 Descargar CSV</>
              )}
            </ExportButton>
          </ExportCard>

          <ExportCard>
            <ExportIcon>📄</ExportIcon>
            <ExportTitle>Exportar como JSON</ExportTitle>
            <ExportDescription>
              Formato estructurado perfecto para respaldos completos o integración con otras aplicaciones.
            </ExportDescription>
            <ExportButton
              onClick={handleExportarJSON}
              disabled={exportando === 'json' || tasks.length === 0}
            >
              {exportando === 'json' ? (
                <Loading size="small" mostrarTexto={false} />
              ) : (
                <>📄 Descargar JSON</>
              )}
            </ExportButton>
          </ExportCard>
        </ExportOptions>
      </ExportSection>

      {/* <ExportSection>
        <SectionTitle>Exportación desde Servidor</SectionTitle>
        <ExportOptions>
          <ExportCard>
            <ExportIcon>🌐</ExportIcon>
            <ExportTitle>CSV desde Servidor</ExportTitle>
            <ExportDescription>
              Exportación procesada en el servidor con datos completos y formateo optimizado.
            </ExportDescription>
            <ExportButton
              onClick={handleExportarServidorCSV}
              disabled={exportando === 'server-csv' || tareas.length === 0}
            >
              {exportando === 'server-csv' ? (
                <Cargando size="small" mostrarTexto={false} />
              ) : (
                <>🌐 Descargar CSV</>
              )}
            </ExportButton>
          </ExportCard>

          <ExportCard>
            <ExportIcon>🔗</ExportIcon>
            <ExportTitle>JSON desde Servidor</ExportTitle>
            <ExportDescription>
              Exportación completa con todas las relaciones y metadatos procesados en el servidor.
            </ExportDescription>
            <ExportButton
              onClick={handleExportarServidorJSON}
              disabled={exportando === 'server-json' || tareas.length === 0}
            >
              {exportando === 'server-json' ? (
                <Cargando size="small" mostrarTexto={false} />
              ) : (
                <>🔗 Descargar JSON</>
              )}
            </ExportButton>
          </ExportCard>
        </ExportOptions>
      </ExportSection> */}

      <StatsSection>
        <SectionTitle>Resumen de Datos</SectionTitle>
        <StatsGrid>
          <StatItem>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Tareas</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.completadas}</StatValue>
            <StatLabel>Completadas</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.pendientes}</StatValue>
            <StatLabel>Pendientes</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.conCategoria}</StatValue>
            <StatLabel>Con Categoría</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.conEtiquetas}</StatValue>
            <StatLabel>Con Etiquetas</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsSection>
    </PageContainer>
  );
}
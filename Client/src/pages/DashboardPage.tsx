import { Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { HomePage } from './HomePage';
import { CategoryPage } from './CategoryPage';
import { TaskPage } from './TaskPage';
import { StaticsPage } from './StatisticsPage';
import { ExportPages } from './ExportPage';

export function Dashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tareas" element={<TaskPage />} />
        <Route path="/categorias" element={<CategoryPage />} />
        <Route path="/estadisticas" element={<StaticsPage />} />
        <Route path="/exportar" element={<ExportPages />} />
      </Routes>
    </Layout>
  );
}
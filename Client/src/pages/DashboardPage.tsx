import { Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { HomePage } from './HomePage';
import { CategoryPage } from './CategoryPage';
import { TaskPage } from './TaskPage';

export function Dashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tareas" element={<TaskPage />} />
        <Route path="/categorias" element={<CategoryPage />} />
      </Routes>
    </Layout>
  );
}
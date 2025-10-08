import { Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { HomePage } from './HomePage';
import { CategoryPage } from './CategoryPage';

export function Dashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categorias" element={<CategoryPage />} />
      </Routes>
    </Layout>
  );
}
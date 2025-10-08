import { Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { HomePage } from './HomePage';

export function Dashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}
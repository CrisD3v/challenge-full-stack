import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { AuthPage } from './pages/AuthPage';
import { ErrorBoundary } from './components/Commons/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/globals.css'


function AppRoutes() {

  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<AuthPage />}
      />
      <Route
        path="/dashboard/*"
        element={<AuthPage />}
      />
      <Route
        path="/"
        element={<AuthPage />}
      />

    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App

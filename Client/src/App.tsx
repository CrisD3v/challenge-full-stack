import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/Commons/ErrorBoundary';
import { ToastProvider } from './components/Commons/ErrorToast';
import { GlobalErrorHandler } from './components/Commons/GlobalErrorHandler';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/DashboardPage';
import './styles/globals.css';


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
        element={usuario ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />
      <Route
        path="/dashboard/*"
        element={usuario ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/"
        element={<Navigate to={usuario ? "/dashboard" : "/login"} replace />}
      />

    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <GlobalErrorHandler />
          <AuthProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App

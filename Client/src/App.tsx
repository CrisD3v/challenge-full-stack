import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './styles/globals.css'
import { AuthPage } from './pages/AuthPage';


function AppRoutes() {

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
    <>
      <Router>
        <AppRoutes />
      </Router>
    </>
  );
}

export default App

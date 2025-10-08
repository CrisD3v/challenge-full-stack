import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: var(--color-bg);
  overflow: hidden;
`;

const MainContent = styled.main<{ $sidebarOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <LayoutContainer>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <MainContent $sidebarOpen={sidebarOpen}>
        <Header onToggleSidebar={toggleSidebar} />
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
}
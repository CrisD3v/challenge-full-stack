import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.aside<{ $isOpen: boolean }>`
  width: 250px;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  transition: all 0.3s ease;
  height: 100vh;
  overflow-y: auto;
  flex-shrink: 0;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 200;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }

  @media (min-width: 769px) {
    position: relative;
    width: ${props => props.$isOpen ? '250px' : '0px'};
    min-width: ${props => props.$isOpen ? '250px' : '0px'};
    overflow: ${props => props.$isOpen ? 'visible' : 'hidden'};
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Navigation = styled.nav`
  padding: 1rem 0;
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 1.5rem;
  margin-bottom: 0.5rem;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text);
  }

  &.active {
    background-color: var(--color-primary-light);
    color: var(--color-primary);
    font-weight: 600;
  }

  &.active::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: var(--color-primary);
  }
`;

const NavIcon = styled.span`
  font-size: 1.125rem;
  width: 20px;
  text-align: center;
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 150;
  display: ${props => props.$isOpen ? 'block' : 'none'};

  @media (min-width: 769px) {
    display: none;
  }
`;

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const navItems = [
    {
      section: 'Principal',
      items: [
        { to: '/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/dashboard/tareas', icon: '✅', label: 'Tareas' },
        { to: '/dashboard/categorias', icon: '📁', label: 'Categorías' },
      ]
    },
    {
      section: 'Herramientas',
      items: [
        { to: '/dashboard/estadisticas', icon: '📈', label: 'Estadísticas' },
        { to: '/dashboard/exportar', icon: '📤', label: 'Exportar' },
      ]
    }
  ];

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onToggle} />
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <Logo>
            <span>📋</span>
            Task Manager
          </Logo>
        </SidebarHeader>

        <Navigation>
          {navItems.map((section) => (
            <NavSection key={section.section}>
              <SectionTitle>{section.section}</SectionTitle>
              <NavList>
                {section.items.map((item) => (
                  <NavItem key={item.to}>
                    <StyledNavLink
                      to={item.to}
                      end={item.to === '/dashboard'}
                      onClick={() => window.innerWidth <= 768 && onToggle()}
                    >
                      <NavIcon>{item.icon}</NavIcon>
                      {item.label}
                    </StyledNavLink>
                  </NavItem>
                ))}
              </NavList>
            </NavSection>
          ))}
        </Navigation>
      </SidebarContainer>
    </>
  );
}
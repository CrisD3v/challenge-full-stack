import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const HeaderContainer = styled.header`
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px var(--color-shadow-light);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-bg-secondary);
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-bg-secondary);
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media (max-width: 480px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
`;

const UserEmail = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

const LogoutButton = styled.button`
  background-color: var(--color-error);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #dc2626;
  }
`;

interface HeaderProps {
    onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
    const { usuario, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = async () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            await logout();
        }
    };

    return (
        <HeaderContainer>
            <LeftSection>
                <MenuButton onClick={onToggleSidebar}>
                    ☰
                </MenuButton>
                <Title>Task Manager</Title>
            </LeftSection>

            <RightSection>
                <ThemeToggle onClick={toggleTheme} title="Cambiar tema">
                    {theme.mode === 'light' ? '🌙' : '☀️'}
                </ThemeToggle>

                <UserMenu>
                    <UserInfo>
                        <UserName>{usuario?.name}</UserName>
                        <UserEmail>{usuario?.email}</UserEmail>
                    </UserInfo>
                    <LogoutButton onClick={handleLogout}>
                        Salir
                    </LogoutButton>
                </UserMenu>
            </RightSection>
        </HeaderContainer>
    );
}
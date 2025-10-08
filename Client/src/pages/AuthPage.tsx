import { useState } from 'react';
import styled from 'styled-components';
import { FormLogin } from '../components/Auth/FormLogin';
import { FormRegister } from '../components/Auth/FormRegister';

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-secondary) 100%);
  padding: 1rem;
`;

const AuthWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.5s ease-out;
`;

export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <AuthContainer>
            <AuthWrapper>
                {isLogin ? (
                    <FormLogin onSwitchToRegister={() => setIsLogin(false)} />
                ) : (
                    <FormRegister onSwitchToLogin={() => setIsLogin(true)} />
                )}
            </AuthWrapper>
        </AuthContainer>
    );
}
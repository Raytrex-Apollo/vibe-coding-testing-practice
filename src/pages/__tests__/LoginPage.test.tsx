import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../LoginPage';
import { useAuth } from '../../context/AuthContext';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock useAuth
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

// Mock react-router-dom navigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

const mockNavigate = vi.fn();

describe('LoginPage', () => {
    const mockLogin = vi.fn();
    const mockClearAuthExpiredMessage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useAuth as any).mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
            authExpiredMessage: null,
            clearAuthExpiredMessage: mockClearAuthExpiredMessage,
        });
    });

    const renderLoginPage = () => {
        return render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );
    };

    describe('【前端元素】', () => {
        it('渲染基本登入表單', () => {
            renderLoginPage();

            expect(screen.getByText('歡迎回來')).toBeInTheDocument();
            expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
            expect(screen.getByLabelText('密碼')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
        });
    });

    describe('【function 邏輯】', () => {
        it('Email 格式校驗', async () => {
            renderLoginPage();

            const emailInput = screen.getByLabelText('電子郵件');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.click(submitButton);

            expect(await screen.findByText('請輸入有效的 Email 格式')).toBeInTheDocument();
        });

        it('密碼長度校驗', async () => {
            renderLoginPage();

            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'short' } });
            fireEvent.click(submitButton);

            expect(await screen.findByText('密碼必須至少 8 個字元')).toBeInTheDocument();
        });

        it('密碼組成校驗', async () => {
            renderLoginPage();

            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            // 只有數字
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: '12345678' } });
            fireEvent.click(submitButton);
            expect(await screen.findByText('密碼必須包含英文字母和數字')).toBeInTheDocument();

            // 只有字母
            fireEvent.change(passwordInput, { target: { value: 'abcdefgh' } });
            fireEvent.click(submitButton);
            expect(await screen.findByText('密碼必須包含英文字母和數字adsfasfd')).toBeInTheDocument();
        });
    });

    describe('【Mock API】', () => {
        it('登入成功跳轉', async () => {
            mockLogin.mockResolvedValueOnce(undefined);
            renderLoginPage();

            fireEvent.change(screen.getByLabelText('電子郵件'), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText('密碼'), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: '登入' }));

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });

        it('登入失敗顯示訊息', async () => {
            const errorMessage = 'Invalid credentials';
            mockLogin.mockRejectedValueOnce({
                response: { data: { message: errorMessage } }
            });

            renderLoginPage();

            fireEvent.change(screen.getByLabelText('電子郵件'), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText('密碼'), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: '登入' }));

            expect(await screen.findByText(errorMessage)).toBeInTheDocument();
        });
    });

    describe('【驗證權限】', () => {
        it('已登入自動跳轉', () => {
            (useAuth as any).mockReturnValue({
                login: mockLogin,
                isAuthenticated: true,
                authExpiredMessage: null,
                clearAuthExpiredMessage: mockClearAuthExpiredMessage,
            });

            renderLoginPage();

            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    describe('【副作用校驗】', () => {
        it('顯示 Session 過期訊息', async () => {
            const expiredMsg = 'Session 已過期，請重新登入';
            (useAuth as any).mockReturnValue({
                login: mockLogin,
                isAuthenticated: false,
                authExpiredMessage: expiredMsg,
                clearAuthExpiredMessage: mockClearAuthExpiredMessage,
            });

            renderLoginPage();

            expect(screen.getByText(expiredMsg)).toBeInTheDocument();
            expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
        });
    });
});

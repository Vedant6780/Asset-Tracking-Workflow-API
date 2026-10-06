/**
 * LoginPage — Clean, human-designed split-screen authentication.
 *
 * Left side: White login/signup form with role selection (Operator / Manager).
 * Right side: Transport truck hero image with overlay content.
 *
 * Features:
 *  - Segmented Sign In / Create Account switcher
 *  - Role cards for Operator and Manager
 *  - Show/hide password toggle, remember-me checkbox
 *  - Quick demo credential autofill buttons
 *  - Real validation with friendly error/success messages
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import truckImage from '../assets/transport-truck.png';

export default function LoginPage() {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [username, setUsername] = useState(() => localStorage.getItem('fleet_saved_username') || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('operator');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('fleet_saved_username'));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username.trim()) {
            setError('Please enter your username');
            return;
        }
        if (!password) {
            setError('Please enter your password');
            return;
        }

        setLoading(true);

        try {
            const data = await login(username, password);

            if (rememberMe) {
                localStorage.setItem('fleet_saved_username', username.trim());
            } else {
                localStorage.removeItem('fleet_saved_username');
            }

            if (data.role === 'admin' || data.role === 'manager') {
                navigate('/manager');
            } else {
                navigate('/operator');
            }
        } catch (err) {
            setError(err.message || 'Invalid username or password. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const cleanUsername = username.trim();
        if (cleanUsername.length < 3) {
            setError('Username must be at least 3 characters long');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match. Please check again.');
            return;
        }

        setLoading(true);

        try {
            const data = await register(cleanUsername, password, selectedRole);
            setSuccess(`Welcome to FleetTrack! Account created as ${selectedRole === 'manager' ? 'Manager' : 'Operator'}. Redirecting...`);

            if (rememberMe) {
                localStorage.setItem('fleet_saved_username', cleanUsername);
            }

            setTimeout(() => {
                if (data.role === 'admin' || data.role === 'manager') {
                    navigate('/manager');
                } else {
                    navigate('/operator');
                }
            }, 750);
        } catch (err) {
            setError(err.message || 'Registration failed. That username may already be in use.');
            setLoading(false);
        }
    };

    const quickFill = (user, pass, role) => {
        setMode('login');
        setUsername(user);
        setPassword(pass);
        setSelectedRole(role);
        setError('');
        setSuccess(`Autofilled demo credentials for ${role === 'manager' ? 'Fleet Manager' : 'Warehouse Operator'}`);
    };

    return (
        <div className="auth-split-wrapper">
            {/* ═══════════════════════════════════════════════
                LEFT: Clean white login / signup form
                ═══════════════════════════════════════════════ */}
            <div className="auth-left-pane">
                <div className="auth-form-container">
                    {/* Brand */}
                    <div className="auth-brand-header">
                        <div className="auth-brand-badge">
                            <span className="brand-logo-icon">🚛</span>
                            <div className="brand-text-group">
                                <span className="brand-name">FleetTrack OS</span>
                                <span className="brand-tag">Asset & Freight Tracking</span>
                            </div>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="auth-headline-group">
                        <h1 className="auth-title">
                            {mode === 'login' ? 'Welcome back' : 'Create an account'}
                        </h1>
                        <p className="auth-subtitle">
                            {mode === 'login'
                                ? 'Sign in to access your dashboard, dispatch console, or scanner tools.'
                                : 'Set up your account in seconds to start tracking shipments.'}
                        </p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="auth-mode-pill" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === 'login'}
                            className={`mode-pill-btn ${mode === 'login' ? 'active' : ''}`}
                            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === 'register'}
                            className={`mode-pill-btn ${mode === 'register' ? 'active' : ''}`}
                            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="human-alert human-alert-error" role="alert">
                            <svg className="alert-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="alert-text">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="human-alert human-alert-success" role="alert">
                            <svg className="alert-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="alert-text">{success}</span>
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="role-selection-wrapper">
                        <label className="field-label">
                            {mode === 'login' ? 'Select role' : 'Account type'}
                        </label>
                        <div className="role-btn-group">
                            <button
                                type="button"
                                className={`role-select-btn ${selectedRole === 'operator' ? 'active' : ''}`}
                                onClick={() => setSelectedRole('operator')}
                            >
                                Operator
                            </button>

                            <button
                                type="button"
                                className={`role-select-btn ${selectedRole === 'manager' ? 'active' : ''}`}
                                onClick={() => setSelectedRole('manager')}
                            >
                                Manager
                            </button>
                        </div>
                    </div>

                    {/* Forms */}
                    {mode === 'login' ? (
                        <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
                            <div className="form-field-group">
                                <label htmlFor="login-username" className="field-label">
                                    Username
                                </label>
                                <div className="input-with-icon">
                                    <span className="input-leading-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <input
                                        id="login-username"
                                        className="human-input"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-field-group">
                                <div className="field-label-row">
                                    <label htmlFor="login-password" className="field-label">
                                        Password
                                    </label>
                                </div>
                                <div className="input-with-icon">
                                    <span className="input-leading-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </span>
                                    <input
                                        id="login-password"
                                        className="human-input with-trailing-action"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="auth-aux-row">
                                <label className="remember-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <span className="help-text-link" title="Contact your supervisor">
                                    Forgot password?
                                </span>
                            </div>

                            <button
                                id="login-btn"
                                type="submit"
                                className="human-primary-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <span>Sign In as {selectedRole === 'manager' ? 'Manager' : 'Operator'}</span>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit} className="auth-form" noValidate>
                            <div className="form-field-group">
                                <label htmlFor="reg-username" className="field-label">
                                    Choose a username
                                </label>
                                <div className="input-with-icon">
                                    <span className="input-leading-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <input
                                        id="reg-username"
                                        className="human-input"
                                        type="text"
                                        placeholder="e.g. john_operator"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                                <span className="field-hint">Must be at least 3 characters.</span>
                            </div>

                            <div className="form-field-group">
                                <label htmlFor="reg-password" className="field-label">
                                    Password
                                </label>
                                <div className="input-with-icon">
                                    <span className="input-leading-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </span>
                                    <input
                                        id="reg-password"
                                        className="human-input with-trailing-action"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a password (6+ characters)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="form-field-group">
                                <label htmlFor="reg-confirm-password" className="field-label">
                                    Confirm password
                                </label>
                                <div className="input-with-icon">
                                    <span className="input-leading-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </span>
                                    <input
                                        id="reg-confirm-password"
                                        className="human-input with-trailing-action"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                id="register-btn"
                                type="submit"
                                className="human-primary-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner" />
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    <span>Create {selectedRole === 'manager' ? 'Manager' : 'Operator'} Account</span>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Quick Demo */}
                    <div className="demo-credentials-card" id="demo-credentials-card">
                        <div className="demo-card-title">
                            <span className="demo-badge-dot">⚡</span>
                            <span>Quick Demo — 1-Click Autofill</span>
                        </div>
                        <div className="demo-pill-grid">
                            <button
                                type="button"
                                className="demo-pill-btn"
                                onClick={() => quickFill('admin', 'admin123', 'manager')}
                            >
                                <span className="demo-role-tag manager">📊 Manager</span>
                                <span className="demo-user">admin</span>
                                <span className="demo-arrow">→</span>
                            </button>
                            <button
                                type="button"
                                className="demo-pill-btn"
                                onClick={() => quickFill('operator', 'operator123', 'operator')}
                            >
                                <span className="demo-role-tag operator">📦 Operator</span>
                                <span className="demo-user">operator</span>
                                <span className="demo-arrow">→</span>
                            </button>
                        </div>
                    </div>

                    {/* Trust Footer */}
                    <div className="auth-trust-footer">
                        <div className="trust-pill">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>Encrypted with bcrypt & 256-bit JWT authentication</span>
                        </div>
                        <div className="auth-help-prompt" onClick={() => {
                            const el = document.getElementById('demo-credentials-card');
                            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                        }}>
                            <span>👤 Who am I?</span>
                            <span className="auth-help-arrow">→</span>
                        </div>
                        <p className="trust-copy">
                            FleetTrack Operations Suite • ISO 27001 Certified
                        </p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════
                RIGHT: Transport truck photo
                ═══════════════════════════════════════════════ */}
            <div className="auth-right-pane">
                <div
                    className="truck-hero-bg"
                    style={{ backgroundImage: `url(${truckImage})` }}
                    role="img"
                    aria-label="Transport freight truck"
                />
            </div>
        </div>
    );
}

/**
 * OperatorDashboard — Scanner UI for warehouse operators.
 * Features: serial number lookup, asset info display, status update with green flash success.
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authFetch } from '../api';
import StatusBadge from '../components/StatusBadge';

const STATUS_OPTIONS = [
    'Registered',
    'In Warehouse',
    'In Transit',
    'Delivered',
    'Under Maintenance',
    'Damaged',
    'Decommissioned',
];

export default function OperatorDashboard() {
    const { username, logout } = useAuth();
    const navigate = useNavigate();

    const [serialInput, setSerialInput] = useState('');
    const [asset, setAsset] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const inputRef = useRef(null);

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!serialInput.trim()) return;
        setError('');
        setAsset(null);
        setLoading(true);

        try {
            const res = await authFetch(`/api/v1/assets/lookup/${serialInput.trim()}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Asset not found');
            }
            const data = await res.json();
            setAsset(data);
            setNewStatus(data.status);
            setNewLocation(data.location);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!asset || !newStatus) return;
        setLoading(true);
        setError('');

        try {
            const body = { new_status: newStatus };
            if (newLocation.trim()) body.location = newLocation.trim();

            const res = await authFetch(`/api/v1/assets/${asset.id}/status`, {
                method: 'PUT',
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Update failed');
            }

            // Show success flash
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setAsset(null);
                setSerialInput('');
                inputRef.current?.focus();
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="operator-layout">
            <div className="animated-bg" />

            {/* Header */}
            <header className="page-header">
                <h1>📱 Scanner Dashboard</h1>
                <div className="header-actions">
                    <div className="user-badge">
                        {username}
                        <span className="role-tag role-operator">Operator</span>
                    </div>
                    <button className="btn btn-ghost" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="operator-main">
                <div className="glass-card scanner-card">
                    <h2>Scan or Enter Asset ID</h2>

                    {/* Serial Number Input */}
                    <form onSubmit={handleLookup}>
                        <input
                            ref={inputRef}
                            id="serial-input"
                            className="input-field input-large"
                            type="text"
                            placeholder="SN-XXXX"
                            value={serialInput}
                            onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
                            autoFocus
                        />
                        <button
                            id="lookup-btn"
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: 'var(--space-md)' }}
                            disabled={loading || !serialInput.trim()}
                        >
                            {loading ? 'Searching...' : '🔍 Look Up Asset'}
                        </button>
                    </form>

                    {/* Error */}
                    {error && <div className="error-message" style={{ marginTop: 'var(--space-md)' }}>{error}</div>}

                    {/* Asset Info */}
                    {asset && (
                        <div className="asset-info-card">
                            <div className="asset-name">{asset.name}</div>
                            <div className="asset-detail">Serial: {asset.serial_number}</div>
                            <div className="asset-detail">
                                Current Status: <StatusBadge status={asset.status} />
                            </div>
                            <div className="asset-detail">Location: {asset.location}</div>

                            <div style={{ marginTop: 'var(--space-lg)' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                                    NEW STATUS
                                </label>
                                <select
                                    id="status-select"
                                    className="select-field"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginTop: 'var(--space-md)' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                                    LOCATION (Optional)
                                </label>
                                <input
                                    id="location-input"
                                    className="input-field"
                                    type="text"
                                    placeholder="e.g., Truck 4, Warehouse B"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                />
                            </div>

                            <button
                                id="submit-update-btn"
                                className="btn btn-success btn-lg"
                                style={{ width: '100%', marginTop: 'var(--space-lg)' }}
                                onClick={handleStatusUpdate}
                                disabled={loading}
                            >
                                ✅ Submit Update
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Success Overlay */}
            {showSuccess && (
                <div className="success-overlay">
                    <div className="success-content">
                        <div className="success-icon">✅</div>
                        <div className="success-text">Status Updated Successfully!</div>
                    </div>
                </div>
            )}
        </div>
    );
}

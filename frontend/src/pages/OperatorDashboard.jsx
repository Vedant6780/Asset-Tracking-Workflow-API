/**
 * OperatorDashboard — Clean, human-crafted scanner terminal for warehouse operators.
 * Serial number lookup, asset info display, status + location update, visual feedback.
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
                throw new Error(err.detail || 'Asset not found. Please verify the serial number.');
            }
            const data = await res.json();
            setAsset(data);
            setNewStatus(data.status);
            setNewLocation(data.location || '');
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
                throw new Error(err.detail || 'Status update failed');
            }

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setAsset(null);
                setSerialInput('');
                inputRef.current?.focus();
            }, 1800);
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

            {/* Navbar */}
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.35rem' }}>🚛</span>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.1rem' }}>FleetTrack OS</h1>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Warehouse Scanner Terminal
                        </span>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="user-badge">
                        <span style={{ color: 'var(--text-light)' }}>Operator:</span>
                        <strong>{username}</strong>
                        <span className="role-tag role-operator">Floor Tech</span>
                    </div>
                    <button className="btn btn-ghost" onClick={handleLogout} title="Sign out">
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Scanner */}
            <main className="operator-main">
                <div className="glass-card scanner-card">
                    <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '2.25rem', marginBottom: '4px' }}>📦</div>
                        <h2>Barcode & Asset Scanner</h2>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                            Scan a barcode or type a serial number to record checkpoint status.
                        </p>
                    </div>

                    <form onSubmit={handleLookup}>
                        <input
                            ref={inputRef}
                            id="serial-input"
                            className="input-field input-large"
                            type="text"
                            placeholder="SN-1001"
                            value={serialInput}
                            onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
                            autoFocus
                        />

                        <button
                            id="lookup-btn"
                            type="submit"
                            className="human-primary-btn"
                            style={{ marginTop: '10px', width: '100%' }}
                            disabled={loading || !serialInput.trim()}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner" />
                                    <span>Scanning...</span>
                                </>
                            ) : (
                                <span>🔍 Look Up Asset</span>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
                            💡 Try demo serials: <strong>SN-9982</strong>, <strong>SN-7721</strong>, or <strong>SN-4410</strong>
                        </span>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="human-alert human-alert-error" style={{ marginTop: '1rem' }}>
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    {/* Asset Info & Update */}
                    {asset && (
                        <div className="asset-info-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                    <div className="asset-name">{asset.name}</div>
                                    <div className="asset-detail" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                                        Serial: {asset.serial_number}
                                    </div>
                                </div>
                                <StatusBadge status={asset.status} />
                            </div>

                            <div className="asset-detail" style={{ color: 'var(--text-secondary)' }}>
                                📍 Location: <strong>{asset.location || 'Warehouse Intake'}</strong>
                            </div>

                            <div style={{ marginTop: '1.25rem' }}>
                                <label className="field-label">
                                    New Status
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

                            <div style={{ marginTop: '10px' }}>
                                <label className="field-label">
                                    Current Location
                                </label>
                                <input
                                    id="location-input"
                                    className="human-input"
                                    style={{ paddingLeft: '16px' }}
                                    type="text"
                                    placeholder="e.g., Truck #42, Bay 3"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                />
                            </div>

                            <button
                                id="submit-update-btn"
                                className="btn btn-success btn-lg"
                                style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}
                                onClick={handleStatusUpdate}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : '✓ Confirm Status Update'}
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
                        <div className="success-text">Status Updated!</div>
                        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            Saved to fleet database & audit trail.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

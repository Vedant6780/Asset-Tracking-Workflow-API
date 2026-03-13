/**
 * ManagerDashboard — Live Operations Center for logistics managers.
 * Features: asset table, WebSocket live updates, stat cards, audit side-panel.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authFetch, createDashboardSocket } from '../api';
import AssetTable from '../components/AssetTable';
import AuditPanel from '../components/AuditPanel';
import LiveIndicator from '../components/LiveIndicator';

export default function ManagerDashboard() {
    const { username, logout } = useAuth();
    const navigate = useNavigate();

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wsConnected, setWsConnected] = useState(false);
    const [flashId, setFlashId] = useState(null);
    const [selectedAssetId, setSelectedAssetId] = useState(null);
    const wsRef = useRef(null);

    // Fetch all assets
    const fetchAssets = useCallback(async () => {
        try {
            const res = await authFetch('/api/v1/assets');
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (err) {
            console.error('Failed to fetch assets:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Connect WebSocket
    useEffect(() => {
        fetchAssets();

        wsRef.current = createDashboardSocket(
            // onMessage
            (data) => {
                if (data.event === 'status_update') {
                    setAssets((prev) =>
                        prev.map((a) =>
                            a.id === data.asset_id
                                ? { ...a, status: data.new_status, location: data.location, updated_at: new Date().toISOString() }
                                : a
                        )
                    );
                    setFlashId(data.asset_id);
                    setTimeout(() => setFlashId(null), 2500);
                } else if (data.event === 'asset_created') {
                    setAssets((prev) => [
                        {
                            id: data.asset_id,
                            name: data.name,
                            serial_number: data.serial_number,
                            status: data.status,
                            location: data.location,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                        ...prev,
                    ]);
                    setFlashId(data.asset_id);
                    setTimeout(() => setFlashId(null), 2500);
                } else if (data.event === 'asset_deleted') {
                    setAssets((prev) => prev.filter((a) => a.id !== data.asset_id));
                }
            },
            // onOpen
            () => setWsConnected(true),
            // onClose
            () => setWsConnected(false)
        );

        return () => {
            wsRef.current?.close();
        };
    }, [fetchAssets]);

    const handleLogout = () => {
        wsRef.current?.close();
        logout();
        navigate('/');
    };

    const handleRowClick = (assetId) => {
        setSelectedAssetId(assetId);
    };

    const handleCloseAudit = () => {
        setSelectedAssetId(null);
    };

    // Stats
    const stats = {
        total: assets.length,
        inTransit: assets.filter((a) => a.status === 'In Transit').length,
        delivered: assets.filter((a) => a.status === 'Delivered').length,
        maintenance: assets.filter((a) => a.status === 'Under Maintenance' || a.status === 'Damaged').length,
    };

    return (
        <div className="manager-layout">
            <div className="animated-bg" />

            {/* Header */}
            <header className="page-header">
                <h1>🏢 Live Operations Center</h1>
                <div className="header-actions">
                    <LiveIndicator connected={wsConnected} />
                    <div className="user-badge">
                        {username}
                        <span className="role-tag role-admin">Admin</span>
                    </div>
                    <button className="btn btn-ghost" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="manager-main">
                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="glass-card stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Assets</div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-value" style={{ background: 'linear-gradient(135deg, var(--accent-yellow), var(--accent-orange))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {stats.inTransit}
                        </div>
                        <div className="stat-label">In Transit</div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-value" style={{ background: 'linear-gradient(135deg, var(--accent-green), #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {stats.delivered}
                        </div>
                        <div className="stat-label">Delivered</div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-value" style={{ background: 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {stats.maintenance}
                        </div>
                        <div className="stat-label">Needs Attention</div>
                    </div>
                </div>

                {/* Asset Table */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner" />
                        <span>Loading assets...</span>
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <AssetTable assets={assets} flashId={flashId} onRowClick={handleRowClick} />
                    </div>
                )}
            </main>

            {/* Audit Side Panel */}
            {selectedAssetId && (
                <AuditPanel assetId={selectedAssetId} onClose={handleCloseAudit} />
            )}
        </div>
    );
}

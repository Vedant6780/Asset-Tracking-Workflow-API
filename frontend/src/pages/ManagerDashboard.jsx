/**
 * ManagerDashboard — Live operations center for logistics managers.
 * Real-time asset table with WebSocket updates, stat cards, and audit side panel.
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

    // WebSocket for live updates
    useEffect(() => {
        fetchAssets();

        wsRef.current = createDashboardSocket(
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
            () => setWsConnected(true),
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

    // Compute stats
    const stats = {
        total: assets.length,
        inTransit: assets.filter((a) => a.status === 'In Transit').length,
        inWarehouse: assets.filter((a) => a.status === 'In Warehouse' || a.status === 'Registered').length,
        delivered: assets.filter((a) => a.status === 'Delivered').length,
        attention: assets.filter((a) => a.status === 'Under Maintenance' || a.status === 'Damaged').length,
    };

    return (
        <div className="manager-layout">
            <div className="animated-bg" />

            {/* Navbar */}
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.35rem' }}>🚛</span>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.1rem' }}>FleetTrack OS</h1>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Fleet Operations Center
                        </span>
                    </div>
                </div>

                <div className="header-actions">
                    <LiveIndicator connected={wsConnected} />
                    <div className="user-badge">
                        <span style={{ color: 'var(--text-light)' }}>Manager:</span>
                        <strong>{username}</strong>
                        <span className="role-tag role-admin">Manager</span>
                    </div>
                    <button className="btn btn-ghost" onClick={fetchAssets} title="Refresh data">
                        🔄 Refresh
                    </button>
                    <button className="btn btn-ghost" onClick={handleLogout} title="Sign out">
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="manager-main">
                {/* Stat Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Assets</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--amber)' }}>
                            {stats.inTransit}
                        </div>
                        <div className="stat-label">🚚 In Transit</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--purple)' }}>
                            {stats.inWarehouse}
                        </div>
                        <div className="stat-label">📦 In Warehouse</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--green)' }}>
                            {stats.delivered}
                        </div>
                        <div className="stat-label">✅ Delivered</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: stats.attention > 0 ? 'var(--red)' : 'var(--text-light)' }}>
                            {stats.attention}
                        </div>
                        <div className="stat-label">⚠️ Needs Attention</div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="dashboard-section-header">
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Active Shipments</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            Tap or click any shipment to inspect its complete audit trail.
                        </p>
                    </div>
                    <span className="live-pulse-badge">
                        <span className="live-dot" />
                        <span>Live Sync Active</span>
                    </span>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="loading-container glass-card" style={{ padding: '3rem' }}>
                        <div className="spinner" />
                        <span>Loading fleet data...</span>
                    </div>
                ) : (
                    <div className="table-container">
                        <AssetTable assets={assets} flashId={flashId} onRowClick={handleRowClick} />
                    </div>
                )}
            </main>

            {/* Audit Panel */}
            {selectedAssetId && (
                <AuditPanel assetId={selectedAssetId} onClose={handleCloseAudit} />
            )}
        </div>
    );
}

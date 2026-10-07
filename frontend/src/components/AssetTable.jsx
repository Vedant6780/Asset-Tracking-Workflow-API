/**
 * AssetTable — Responsive data display with desktop table and mobile card views.
 * Features flash animations on live updates and click-to-audit interaction.
 */

import StatusBadge from './StatusBadge';

export default function AssetTable({ assets, flashId, onRowClick }) {
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (assets.length === 0) {
        return (
            <div className="loading-container" style={{ padding: '3rem' }}>
                <span style={{ fontSize: '2rem' }}>📭</span>
                <span>No assets registered yet.</span>
            </div>
        );
    }

    return (
        <div className="asset-display-container">
            {/* Desktop / Tablet Table View */}
            <div className="desktop-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Serial Number</th>
                            <th>Status</th>
                            <th>Location</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => (
                            <tr
                                key={asset.id}
                                id={`asset-row-${asset.id}`}
                                className={flashId === asset.id ? 'flash-yellow' : ''}
                                onClick={() => onRowClick(asset.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td style={{ fontWeight: 600, color: 'var(--blue)' }}>#{asset.id}</td>
                                <td>{asset.name}</td>
                                <td style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1px' }}>{asset.serial_number}</td>
                                <td><StatusBadge status={asset.status} /></td>
                                <td>{asset.location}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(asset.updated_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Touch-Friendly Card View */}
            <div className="mobile-cards-wrapper">
                {assets.map((asset) => (
                    <div
                        key={asset.id}
                        id={`asset-card-${asset.id}`}
                        className={`mobile-asset-card ${flashId === asset.id ? 'flash-yellow' : ''}`}
                        onClick={() => onRowClick(asset.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRowClick(asset.id); }}
                    >
                        <div className="mobile-card-top">
                            <div className="mobile-card-title-group">
                                <span className="mobile-card-id">#{asset.id}</span>
                                <h3 className="mobile-card-title">{asset.name}</h3>
                            </div>
                            <StatusBadge status={asset.status} />
                        </div>

                        <div className="mobile-card-body">
                            <div className="mobile-card-row">
                                <span className="mobile-card-label">Serial</span>
                                <span className="mobile-card-value serial-code">{asset.serial_number}</span>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-card-label">Location</span>
                                <span className="mobile-card-value">{asset.location || 'Warehouse Intake'}</span>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-card-label">Updated</span>
                                <span className="mobile-card-value text-muted">{formatDate(asset.updated_at)}</span>
                            </div>
                        </div>

                        <div className="mobile-card-footer">
                            <span className="mobile-audit-prompt">View audit history</span>
                            <span className="mobile-card-arrow">→</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * AssetTable — Data table with sortable columns, flash animations, and row click handler.
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
                        <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>#{asset.id}</td>
                        <td>{asset.name}</td>
                        <td style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{asset.serial_number}</td>
                        <td><StatusBadge status={asset.status} /></td>
                        <td>{asset.location}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(asset.updated_at)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

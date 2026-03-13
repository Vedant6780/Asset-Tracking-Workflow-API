/**
 * AuditPanel — Side-panel modal showing complete timestamped audit history of an asset.
 */

import { useState, useEffect } from 'react';
import { authFetch } from '../api';
import StatusBadge from './StatusBadge';

export default function AuditPanel({ assetId, onClose }) {
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAudit = async () => {
            setLoading(true);
            try {
                const res = await authFetch(`/api/v1/assets/${assetId}`);
                if (res.ok) {
                    const data = await res.json();
                    setAsset(data);
                }
            } catch (err) {
                console.error('Failed to fetch audit:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAudit();
    }, [assetId]);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="audit-overlay" onClick={onClose}>
            <div className="audit-panel" onClick={(e) => e.stopPropagation()}>
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner" />
                        <span>Loading audit history...</span>
                    </div>
                ) : asset ? (
                    <>
                        {/* Header */}
                        <div className="audit-panel-header">
                            <div>
                                <h2>{asset.name}</h2>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    {asset.serial_number}
                                </span>
                            </div>
                            <button className="close-btn" onClick={onClose}>✕</button>
                        </div>

                        {/* Current Status */}
                        <div style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                                Current Status
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <StatusBadge status={asset.status} />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{asset.location}</span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-md)' }}>
                            Audit History ({asset.audit_logs?.length || 0} events)
                        </div>

                        <div className="audit-timeline">
                            {asset.audit_logs?.map((log) => (
                                <div key={log.id} className="audit-item">
                                    <div className="audit-action">{log.action.replace('_', ' ')}</div>
                                    <div className="audit-meta">
                                        by <strong>{log.changed_by}</strong> • {formatDate(log.changed_at)}
                                    </div>
                                    {log.old_status && (
                                        <div className="audit-change">
                                            Status: {log.old_status} → {log.new_status}
                                        </div>
                                    )}
                                    {!log.old_status && (
                                        <div className="audit-change">
                                            Initial status: {log.new_status}
                                        </div>
                                    )}
                                    {log.old_location && log.new_location && log.old_location !== log.new_location && (
                                        <div className="audit-change">
                                            Location: {log.old_location} → {log.new_location}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="loading-container">
                        <span>Failed to load audit data.</span>
                    </div>
                )}
            </div>
        </div>
    );
}

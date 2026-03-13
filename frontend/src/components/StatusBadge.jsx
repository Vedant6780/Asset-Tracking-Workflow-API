/**
 * StatusBadge — Color-coded status indicator with pulse dot.
 */

export default function StatusBadge({ status }) {
    const classMap = {
        'Registered': 'status-registered',
        'In Warehouse': 'status-in-warehouse',
        'In Transit': 'status-in-transit',
        'Delivered': 'status-delivered',
        'Under Maintenance': 'status-under-maintenance',
        'Damaged': 'status-damaged',
        'Decommissioned': 'status-decommissioned',
    };

    const className = classMap[status] || 'status-registered';

    return <span className={`status-badge ${className}`}>{status}</span>;
}

/**
 * LiveIndicator — WebSocket connection status indicator with animated dot.
 */

export default function LiveIndicator({ connected }) {
    return (
        <div className={`live-indicator ${connected ? 'connected' : 'disconnected'}`}>
            <span className="live-dot" />
            <span className="live-label-desktop">{connected ? 'Live Connection Active' : 'Disconnected'}</span>
            <span className="live-label-mobile">{connected ? 'Live' : 'Offline'}</span>
        </div>
    );
}

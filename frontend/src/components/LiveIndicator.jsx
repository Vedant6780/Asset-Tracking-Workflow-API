/**
 * LiveIndicator — WebSocket connection status indicator with animated dot.
 */

export default function LiveIndicator({ connected }) {
    return (
        <div className={`live-indicator ${connected ? 'connected' : 'disconnected'}`}>
            <span className="live-dot" />
            {connected ? 'Live Connection Active' : 'Disconnected'}
        </div>
    );
}

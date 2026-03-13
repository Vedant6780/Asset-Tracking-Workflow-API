"""
WebSocket Connection Manager — tracks and broadcasts to connected clients.
"""

from fastapi import WebSocket
from typing import List
import json


class ConnectionManager:
    """Manages active WebSocket connections for the live dashboard."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket from the active list."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Send a JSON message to all connected clients."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        # Clean up broken connections
        for conn in disconnected:
            self.disconnect(conn)


# Singleton instance used across the app
manager = ConnectionManager()

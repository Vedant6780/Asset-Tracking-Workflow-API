"""
WebSocket Router — live dashboard connection endpoint.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError, jwt

from config import SECRET_KEY, ALGORITHM
from websocket_manager import manager

router = APIRouter(prefix="/api/v1/ws", tags=["WebSocket"])


@router.websocket("/dashboard")
async def websocket_dashboard(websocket: WebSocket, token: str = Query(None)):
    """
    WebSocket endpoint for the manager dashboard.
    Validates JWT from query param before accepting the connection.
    """
    # Validate token
    if not token:
        await websocket.close(code=4001, reason="Missing authentication token")
        return

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        username = payload.get("sub")
        if role != "admin":
            await websocket.close(code=4003, reason="Admin access required")
            return
    except JWTError:
        await websocket.close(code=4001, reason="Invalid authentication token")
        return

    # Accept and register
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; listen for client pings
            data = await websocket.receive_text()
            # Echo back as heartbeat acknowledgment
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from app.ConnectionManager.manager import ConnectionManager
from app.Dependencies.Auth import get_current_user_ws

router = APIRouter(prefix="/notification", tags=["Notifications"])
manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user=Depends(get_current_user_ws)
):
    key = (user["id"], user["role"])

    print(f"🔔 [WS] New connection: {key}")
    await manager.connect(key, websocket)
    print("✅ Connection successful")

    try:
        while True:
            data = await websocket.receive_text()
            print(f"📨 [WS] Received message: {data}")
    except WebSocketDisconnect:
        print(f"⏹️ [WS] Disconnected: {key}")
        manager.disconnect(key, websocket)
    except Exception as e:
        print(f"❌ [WS] Exception: {e}")
        manager.disconnect(key, websocket)
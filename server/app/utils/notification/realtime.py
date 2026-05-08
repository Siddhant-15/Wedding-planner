from app.routers.notification.websocket import manager


async def send_realtime_notification(
    recipient_id: int,
    recipient_type: str,
    payload: dict
):
    key = (recipient_id, recipient_type)

    print(f"🔔 [WS] Attempting send → {key}")
    print(f"📦 Payload → {payload}")

    try:
        if key not in manager.connections:
            print(f"⚠️ No active WS connections for {key}")
            return

        print(f"✅ Found {len(manager.connections[key])} active connections")

        await manager.send(key, payload)

        print(f"🚀 Notification sent to {key}")

    except Exception as e:
        print(f"❌ WS send failed: {e}")
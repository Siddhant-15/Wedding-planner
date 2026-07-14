class ConnectionManager:
    def __init__(self):
        self.connections = {}  # key: (id, type)

    async def connect(self, key, websocket):
        await websocket.accept()
        self.connections.setdefault(key, []).append(websocket)
        print(f"🟢 New connection: {key} | Total: {len(self.connections[key])}")
        print(f"🟢 All active connections: {self.connections}")

    def disconnect(self, key, websocket):
        if key in self.connections:
            if websocket in self.connections[key]:
                self.connections[key].remove(websocket)
                print(f"🔴 Disconnected: {key}")
                print(f"🔴 All active connections: {self.connections}")

            # cleanup empty lists
            if not self.connections[key]:
                del self.connections[key]
                print(f"🔴 Cleaned up empty key: {key}")
                print(f"🔴 All active connections: {self.connections}")

    async def send(self, key, data):
        if key not in self.connections:
            print(f"⚠️ No active WS connections for {key}")
            return

        dead_connections = []

        for ws in self.connections[key]:
            try:
                await ws.send_json(data)
                print(f"🚀 Notification sent to {key}")
                print(f"📦 Payload → {data}")
            except Exception as e:
                dead_connections.append(ws)
                print(f"❌ Failed to send notification to {key}: {e}")

        # remove broken sockets
        for ws in dead_connections:
            self.disconnect(key, ws)
            print(f"🔴 Removed broken connection for {key}")
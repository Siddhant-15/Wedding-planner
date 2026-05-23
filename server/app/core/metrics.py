# core/metrics.py
from prometheus_client import Counter, Histogram, make_asgi_app

service_creates = Counter("service_creates_total", "Total service create attempts", ["status"])
upload_duration = Histogram("upload_duration_seconds", "File upload duration", ["media_type"])
moderation_queue_size = Counter("moderation_queue_total", "Items entering moderation")
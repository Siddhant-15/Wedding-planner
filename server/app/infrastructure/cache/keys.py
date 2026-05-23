# infrastructure/cache/keys.py
def service_catalog_key(service_type: str, city: str, page: int) -> str:
    return f"catalog:{service_type}:{city}:{page}"

def vendor_services_key(vendor_id: int) -> str:
    return f"vendor_services:{vendor_id}"

def service_detail_key(service_id: int) -> str:
    return f"service:{service_id}"

# TTL strategy:
# catalog pages: 5 minutes
# service detail: 1 hour (invalidated on publish)
# vendor dashboard: 30 seconds (near-realtime)
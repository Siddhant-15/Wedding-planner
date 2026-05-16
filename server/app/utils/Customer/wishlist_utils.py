PRIORITY_TO_INT = {
    "low": 0,
    "medium": 1,
    "high": 2,
}

def map_priority(p: int) -> str:
    return {0: "low", 1: "medium", 2: "high"}.get(p, "low")


def extract_pricing(service):
    if not service.variants:
        return {}

    for variant in service.variants:
        pricing = variant.pricing or {}

        # veg / non-veg
        if "veg_price" in pricing or "non_veg_price" in pricing:
            return {
                **({ "veg_price": float(pricing["veg_price"]) } if pricing.get("veg_price") else {}),
                **({ "non_veg_price": float(pricing["non_veg_price"]) } if pricing.get("non_veg_price") else {}),
                "pricing_mode": pricing.get("pricing_mode", "per_plate")
            }

        # rental
        if pricing.get("rental_price") is not None:
            return {
                "price": float(pricing["rental_price"]),
                "pricing_mode": "rental"
            }

        # base price
        if pricing.get("base_price") is not None:
            return {
                "price": float(pricing["base_price"]),
                "pricing_mode": "starting_from"
            }

    return {}
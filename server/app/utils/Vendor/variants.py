from app.schemas.Vendor.vendor_services import ServiceVariantCreate


def enforce_variants(variants: list[ServiceVariantCreate]):
    if not variants:
        return [
            ServiceVariantCreate(
                variant_name="Basic Package",
                pricing_type="BASE_PRICE",
                pricing={"base_price": 0},
                is_default=True
            )
        ]

    default_count = sum(v.is_default for v in variants)

    if default_count == 0:
        variants[0].is_default = True

    elif default_count > 1:
        found = False
        for v in variants:
            if v.is_default:
                if found:
                    v.is_default = False
                else:
                    found = True

    return variants
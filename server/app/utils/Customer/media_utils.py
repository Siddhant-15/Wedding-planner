def get_preview_media(media_items, limit=8):
    sorted_media = sorted(
        media_items,
        key=lambda x: (
            not x.is_cover,
            x.display_order or 0,
            x.id
        )
    )
    return sorted_media[:limit]


def sort_media(media_items):
    return sorted(
        media_items,
        key=lambda x: (
            not x.is_cover,
            x.display_order or 0,
            x.id
        )
    )
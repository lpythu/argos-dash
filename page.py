DEFAULT_SIZE = 20
MAX_SIZE = 50


def parse(page: int, page_size: int) -> tuple[int, int]:
    page = page if page > 0 else 1
    size = page_size if page_size > 0 else DEFAULT_SIZE
    if size > MAX_SIZE:
        size = MAX_SIZE
    return page, size


def of(items: list, page: int, size: int, has_more: bool) -> dict:
    return {"items": items, "page": page, "page_size": size, "has_more": has_more}


def take(rows: list, page: int, page_size: int) -> dict:
    page, size = parse(page, page_size)
    start = (page - 1) * size
    if start >= len(rows):
        return of([], page, size, False)
    end = start + size
    return of(rows[start:end], page, size, end < len(rows))

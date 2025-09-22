from django import template
import hashlib

register = template.Library()


def _clamp(x, a, b):
    return max(a, min(x, b))


@register.filter
def sku_color(sku: str) -> str:
    if not sku:
        return "#9ca3af"
    h = hashlib.md5(str(sku).encode("utf-8")).hexdigest()
    r = int(h[0:2], 16)
    g = int(h[2:4], 16)
    b = int(h[4:6], 16)
    r = _clamp(r, 60, 200)
    g = _clamp(g, 60, 200)
    b = _clamp(b, 60, 200)
    return f"#{r:02x}{g:02x}{b:02x}"

from django import template


register = template.Library()


@register.filter(name='calc_subtotal')
def calc_subtotal(price, quantity):
    return price * quantity


@register.filter
def mul(value, arg):
    """Multiply value by arg."""
    return value * arg

from django import forms
from checkout.models import Order


class OrderForm(forms.ModelForm):
    """
    A form for creating or updating an order.
    """
    class Meta:
        model = Order
        fields = (
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "country",
            "postcode",
            "town_or_city",
            "street_address1",
            "street_address2",
            "county",
        )

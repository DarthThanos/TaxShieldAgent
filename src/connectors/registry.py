"""
Connector registry for TaxShieldAgent.

Central registry of all supported platform connectors with a factory
function for instantiating them by name.
"""

from __future__ import annotations

from .amazon_csv import AmazonCSVConnector
from .base import BaseConnector
from .etsy_connector import EtsyConnector
from .paypal_connector import PayPalConnector
from .shopify_connector import ShopifyConnector
from .square_connector import SquareConnector
from .stripe_connector import StripeConnector

# Maps platform name (lowercase) to its connector class
CONNECTOR_REGISTRY: dict[str, type[BaseConnector]] = {
    "stripe": StripeConnector,
    "shopify": ShopifyConnector,
    "etsy": EtsyConnector,
    "paypal": PayPalConnector,
    "square": SquareConnector,
    "amazon": AmazonCSVConnector,
}

SUPPORTED_PLATFORMS: list[str] = [
    "stripe",
    "shopify",
    "etsy",
    "paypal",
    "square",
    "amazon",
]

_DISPLAY_NAMES: dict[str, str] = {
    "stripe": "Stripe",
    "shopify": "Shopify",
    "etsy": "Etsy",
    "paypal": "PayPal",
    "square": "Square",
    "amazon": "Amazon (CSV Import)",
}


def get_platform_display_name(platform: str) -> str:
    """Return the human-readable name for a platform."""
    return _DISPLAY_NAMES.get(platform.lower(), platform.title())


def get_connector(platform: str, **kwargs) -> BaseConnector:
    """Factory function: instantiate a connector by platform name.

    Args:
        platform: One of the SUPPORTED_PLATFORMS.
        **kwargs: Platform-specific constructor arguments.

    Raises:
        ValueError: If the platform is not supported.
    """
    key = platform.lower()
    cls = CONNECTOR_REGISTRY.get(key)
    if cls is None:
        raise ValueError(
            f"Unsupported platform: {platform!r}. "
            f"Supported: {', '.join(SUPPORTED_PLATFORMS)}"
        )
    return cls(**kwargs)

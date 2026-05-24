#!/usr/bin/env python3
"""
One-time setup script: creates TaxShieldAgent Stripe Products + Prices
and prints the Price IDs to paste into your .env file.

Usage:
    python scripts/setup_stripe_products.py
    python scripts/setup_stripe_products.py --key sk_test_YOUR_FULL_KEY

NOTE: Requires a Stripe key with Products + Prices WRITE permission.
The restricted key in .env only has payment_intents_read / tax_registrations_write.
If this script fails with a permissions error, log into the Stripe Dashboard and
use your full secret key:  Developers → API keys → Secret key (sk_test_...)
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

# ── Load .env so the default key is available ────────────────────────────────
try:
    from dotenv import load_dotenv, find_dotenv
    load_dotenv(find_dotenv(usecwd=True), override=True)
except ImportError:
    pass  # dotenv not installed — rely on real env vars

try:
    import stripe
except ImportError:
    print("ERROR: stripe package not installed. Run: pip install stripe")
    sys.exit(1)


# ── Products & Prices to create ──────────────────────────────────────────────
PRODUCTS = [
    {
        "name": "TaxShieldAgent Pro (Monthly)",
        "description": "Monitor all 50 states, unlimited alerts, AI explanations, audit export.",
        "price_cents": 999,
        "currency": "usd",
        "interval": "month",
        "env_key": "STRIPE_PRO_PRICE_ID",
    },
    {
        "name": "TaxShieldAgent Pro (Annual)",
        "description": "TaxShieldAgent Pro billed annually — 2 months free ($99.90/yr).",
        "price_cents": 9990,
        "currency": "usd",
        "interval": "year",
        "env_key": "STRIPE_PRO_ANNUAL_PRICE_ID",
    },
    {
        "name": "TaxShieldAgent Agency (Monthly)",
        "description": "Multi-merchant dashboard, white-label branding, API access, priority support.",
        "price_cents": 4900,
        "currency": "usd",
        "interval": "month",
        "env_key": "STRIPE_AGENCY_PRICE_ID",
    },
    {
        "name": "TaxShieldAgent Agency (Annual)",
        "description": "TaxShieldAgent Agency billed annually — 2 months free ($490/yr).",
        "price_cents": 49000,
        "currency": "usd",
        "interval": "year",
        "env_key": "STRIPE_AGENCY_ANNUAL_PRICE_ID",
    },
]


def create_products(api_key: str) -> dict[str, str]:
    """Create all products and prices. Returns {env_key: price_id}."""
    stripe.api_key = api_key
    results: dict[str, str] = {}

    for spec in PRODUCTS:
        print(f"\n  Creating product: {spec['name']} ...", end=" ", flush=True)

        # Create the Product
        product = stripe.Product.create(
            name=spec["name"],
            description=spec["description"],
            metadata={"app": "taxshieldagent"},
        )

        # Create the Price attached to the Product
        price = stripe.Price.create(
            product=product["id"],
            unit_amount=spec["price_cents"],
            currency=spec["currency"],
            recurring={"interval": spec["interval"]},
            metadata={"app": "taxshieldagent"},
        )

        print(f"OK  ->  {price['id']}")
        results[spec["env_key"]] = price["id"]

    return results


def write_env(price_ids: dict[str, str], env_path: Path) -> None:
    """Patch the existing .env file with the new Price IDs."""
    if not env_path.exists():
        print(f"\nWARN: {env_path} not found — cannot auto-update .env")
        return

    content = env_path.read_text(encoding="utf-8")
    for key, value in price_ids.items():
        # Replace blank or placeholder lines:  KEY=  or  KEY=price_xxx
        import re
        content = re.sub(
            rf"^({re.escape(key)}=).*$",
            rf"\g<1>{value}",
            content,
            flags=re.MULTILINE,
        )
    env_path.write_text(content, encoding="utf-8")
    print(f"\n  .env updated at {env_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create TaxShieldAgent Stripe Products")
    parser.add_argument(
        "--key",
        default=os.getenv("STRIPE_SECRET_KEY", ""),
        help="Stripe secret key (default: STRIPE_SECRET_KEY from .env)",
    )
    parser.add_argument(
        "--no-write",
        action="store_true",
        help="Print IDs but do NOT update .env",
    )
    args = parser.parse_args()

    if not args.key:
        print("ERROR: No Stripe key found. Pass --key sk_test_... or set STRIPE_SECRET_KEY in .env")
        sys.exit(1)

    if args.key.startswith("rk_"):
        print(
            "\nWARN: You are using a RESTRICTED key (rk_...).\n"
            "      Creating products requires a full secret key (sk_test_...).\n"
            "      Find it in the Stripe Dashboard → Developers → API keys.\n"
            "      Re-run with:  python scripts/setup_stripe_products.py --key sk_test_YOUR_KEY\n"
        )
        sys.exit(1)

    print("\nTaxShieldAgent — Stripe Product Setup")
    print("=" * 45)
    print(f"  Using key: {args.key[:12]}...{args.key[-4:]}")
    print(f"  Mode: {'test' if '_test_' in args.key else 'LIVE'}")
    print()

    try:
        price_ids = create_products(args.key)
    except stripe.AuthenticationError:
        print("\nERROR: Authentication failed. Check your Stripe key.")
        sys.exit(1)
    except stripe.PermissionError as exc:
        print(f"\nERROR: Permission denied — {exc}")
        print("       Use a full secret key (sk_test_...) not a restricted key.")
        sys.exit(1)
    except stripe.StripeError as exc:
        print(f"\nERROR: Stripe API error — {exc}")
        sys.exit(1)

    print("\n" + "=" * 45)
    print("  SUCCESS — Price IDs created:\n")
    for key, value in price_ids.items():
        print(f"    {key}={value}")

    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not args.no_write:
        write_env(price_ids, env_path)
        print("\n  Done! Restart the API server to pick up the new Price IDs.")
    else:
        print(f"\n  (--no-write set — copy the IDs above into {env_path})")


if __name__ == "__main__":
    main()

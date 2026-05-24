"""
Configuration for Stripe App backend URLs and identifiers.

Dev:        http://localhost:8001
Production: https://api.taxshieldagent.com (Railway deployment)
"""

from __future__ import annotations

import os

BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8001")
STRIPE_APP_ID: str = os.getenv("STRIPE_APP_ID", "com.taxshieldagent.app")

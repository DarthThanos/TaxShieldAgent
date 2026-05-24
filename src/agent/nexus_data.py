"""
50-state Economic Nexus threshold database for US sales tax compliance.

Each state's thresholds determine when a remote seller must collect and remit
sales tax. The standard is $100k revenue OR 200 transactions per year, but
several states deviate from this baseline.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class NexusThreshold:
    state_code: str
    state_name: str
    revenue_threshold: float
    transaction_threshold: int | None
    has_sales_tax: bool
    notes: str


INF = float("inf")

NEXUS_THRESHOLDS: dict[str, NexusThreshold] = {
    "AL": NexusThreshold("AL", "Alabama", 250_000, None, True, "$250k revenue threshold; no transaction count"),
    "AK": NexusThreshold("AK", "Alaska", INF, None, False, "No statewide sales tax; some local jurisdictions levy sales tax"),
    "AZ": NexusThreshold("AZ", "Arizona", 100_000, 200, True, "Standard threshold"),
    "AR": NexusThreshold("AR", "Arkansas", 100_000, 200, True, "Standard threshold"),
    "CA": NexusThreshold("CA", "California", 500_000, None, True, "$500k revenue threshold; no transaction count"),
    "CO": NexusThreshold("CO", "Colorado", 100_000, 200, True, "Standard threshold"),
    "CT": NexusThreshold("CT", "Connecticut", 100_000, 200, True, "Standard threshold"),
    "DE": NexusThreshold("DE", "Delaware", INF, None, False, "No sales tax"),
    "FL": NexusThreshold("FL", "Florida", 100_000, 200, True, "Standard threshold; effective July 2021"),
    "GA": NexusThreshold("GA", "Georgia", 100_000, 200, True, "Standard threshold"),
    "HI": NexusThreshold("HI", "Hawaii", 100_000, 200, True, "Hawaii uses GET (General Excise Tax) rather than traditional sales tax"),
    "ID": NexusThreshold("ID", "Idaho", 100_000, None, True, "$100k revenue threshold; no transaction count"),
    "IL": NexusThreshold("IL", "Illinois", 100_000, 200, True, "Standard threshold"),
    "IN": NexusThreshold("IN", "Indiana", 100_000, 200, True, "Standard threshold"),
    "IA": NexusThreshold("IA", "Iowa", 100_000, None, True, "$100k revenue threshold; no transaction count"),
    "KS": NexusThreshold("KS", "Kansas", 0, None, True, "No threshold — any sales into Kansas create nexus"),
    "KY": NexusThreshold("KY", "Kentucky", 100_000, 200, True, "Standard threshold"),
    "LA": NexusThreshold("LA", "Louisiana", 100_000, 200, True, "Standard threshold"),
    "ME": NexusThreshold("ME", "Maine", 100_000, 200, True, "Standard threshold"),
    "MD": NexusThreshold("MD", "Maryland", 100_000, 200, True, "Standard threshold"),
    "MA": NexusThreshold("MA", "Massachusetts", 100_000, None, True, "$100k revenue threshold; no transaction count"),
    "MI": NexusThreshold("MI", "Michigan", 100_000, 200, True, "Standard threshold"),
    "MN": NexusThreshold("MN", "Minnesota", 100_000, 200, True, "Standard threshold; includes retail sales and taxable services"),
    "MS": NexusThreshold("MS", "Mississippi", 250_000, None, True, "$250k revenue threshold; no transaction count"),
    "MO": NexusThreshold("MO", "Missouri", 100_000, None, True, "$100k revenue threshold; enacted January 2023"),
    "MT": NexusThreshold("MT", "Montana", INF, None, False, "No sales tax"),
    "NE": NexusThreshold("NE", "Nebraska", 100_000, 200, True, "Standard threshold"),
    "NV": NexusThreshold("NV", "Nevada", 100_000, 200, True, "Standard threshold"),
    "NH": NexusThreshold("NH", "New Hampshire", INF, None, False, "No sales tax"),
    "NJ": NexusThreshold("NJ", "New Jersey", 100_000, 200, True, "Standard threshold"),
    "NM": NexusThreshold("NM", "New Mexico", 100_000, None, True, "$100k revenue threshold; uses Gross Receipts Tax"),
    "NY": NexusThreshold("NY", "New York", 500_000, 100, True, "$500k and 100 transactions (both must be met)"),
    "NC": NexusThreshold("NC", "North Carolina", 100_000, 200, True, "Standard threshold"),
    "ND": NexusThreshold("ND", "North Dakota", 100_000, None, True, "$100k revenue threshold; no transaction count"),
    "OH": NexusThreshold("OH", "Ohio", 100_000, 200, True, "Standard threshold"),
    "OK": NexusThreshold("OK", "Oklahoma", 100_000, 200, True, "Standard threshold"),
    "OR": NexusThreshold("OR", "Oregon", INF, None, False, "No sales tax"),
    "PA": NexusThreshold("PA", "Pennsylvania", 100_000, None, True, "$100k revenue threshold; no transaction count"),
    "RI": NexusThreshold("RI", "Rhode Island", 100_000, 200, True, "Standard threshold"),
    "SC": NexusThreshold("SC", "South Carolina", 100_000, None, True, "$100k revenue threshold; no transaction count"),
    "SD": NexusThreshold("SD", "South Dakota", 100_000, 200, True, "Standard threshold; origin of Wayfair v. South Dakota"),
    "TN": NexusThreshold("TN", "Tennessee", 100_000, None, True, "$100k revenue threshold; no transaction count"),
    "TX": NexusThreshold("TX", "Texas", 500_000, None, True, "$500k revenue threshold; no transaction count"),
    "UT": NexusThreshold("UT", "Utah", 100_000, 200, True, "Standard threshold"),
    "VT": NexusThreshold("VT", "Vermont", 100_000, 200, True, "Standard threshold"),
    "VA": NexusThreshold("VA", "Virginia", 100_000, 200, True, "Standard threshold"),
    "WA": NexusThreshold("WA", "Washington", 100_000, None, True, "$100k revenue threshold; includes B&O tax considerations"),
    "WV": NexusThreshold("WV", "West Virginia", 100_000, 200, True, "Standard threshold"),
    "WI": NexusThreshold("WI", "Wisconsin", 100_000, None, True, "$100k revenue threshold; no transaction count"),
    "WY": NexusThreshold("WY", "Wyoming", 100_000, 200, True, "Standard threshold"),
    "DC": NexusThreshold("DC", "District of Columbia", 100_000, 200, True, "Standard threshold"),
}


def get_threshold(state_code: str) -> NexusThreshold | None:
    """Look up a state's nexus threshold by two-letter code (case-insensitive)."""
    return NEXUS_THRESHOLDS.get(state_code.upper())


def is_nexus_state(state_code: str) -> bool:
    """Return True if the state levies sales tax (i.e. nexus is relevant)."""
    threshold = get_threshold(state_code)
    if threshold is None:
        return False
    return threshold.has_sales_tax

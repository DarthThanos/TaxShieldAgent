"""
Claude AI integration for TaxShieldAgent.

Uses the Anthropic Python SDK to generate plain-English compliance
explanations, alert messages, and fix confirmations for merchants.
"""

from __future__ import annotations

import anthropic

MODEL = "claude-opus-4-6"

SYSTEM_PROMPT = (
    "You are TaxShield, a friendly and knowledgeable compliance advisor for "
    "online merchants. You explain US sales tax and economic nexus concepts in "
    "plain, approachable English. You are not a lawyer and you do not provide "
    "legal advice — you provide practical guidance to help merchants stay "
    "compliant. Keep responses concise and actionable. Never use legalese when "
    "a simpler phrase works."
)


class ComplianceAgent:
    """Generates human-readable compliance messages via Claude."""

    def __init__(self, api_key: str) -> None:
        self.client = anthropic.Anthropic(api_key=api_key)

    def _ask(self, user_message: str, max_tokens: int = 300) -> str:
        """Send a single-turn message to Claude and return the text response."""
        try:
            response = self.client.messages.create(
                model=MODEL,
                max_tokens=max_tokens,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_message}],
            )
            return response.content[0].text
        except anthropic.APIError:
            return ""

    def generate_alert_message(
        self,
        state: str,
        total_sales: float,
        threshold: float,
        pct: float,
        tx_count: int,
    ) -> str:
        prompt = (
            f"A Stripe merchant has ${total_sales:,.2f} in sales and {tx_count} "
            f"transactions in {state} this year. The economic nexus threshold "
            f"for {state} is ${threshold:,.2f}, and they are at {pct:.0f}% of "
            f"that threshold. Write a 2-3 sentence alert explaining the risk, "
            f"what economic nexus means in this context, and what could happen "
            f"if they don't register to collect sales tax. Be direct but not "
            f"scary."
        )
        result = self._ask(prompt)
        if result:
            return result
        # Fallback if the API is unavailable
        return (
            f"You've reached {pct:.0f}% of {state}'s economic nexus threshold "
            f"(${threshold:,.0f}) with ${total_sales:,.2f} in sales across "
            f"{tx_count} transactions. Economic nexus means {state} may require "
            f"you to collect and remit sales tax. Failing to register could "
            f"result in back-taxes, penalties, and interest."
        )

    def generate_fix_confirmation(self, state: str, total_sales: float) -> str:
        prompt = (
            f"A merchant is about to register for sales tax collection in "
            f"{state}. They have ${total_sales:,.2f} in sales there. Write a "
            f"short confirmation message (2-3 sentences) explaining what "
            f"registering does (they'll start collecting sales tax on future "
            f"orders to that state) and that a $1 processing fee will be "
            f"charged to handle the registration. Keep it reassuring."
        )
        result = self._ask(prompt)
        if result:
            return result
        return (
            f"By registering in {state}, you'll begin collecting sales tax on "
            f"future orders shipped there — keeping you compliant going forward. "
            f"A one-time $1 processing fee will be charged to your account to "
            f"cover the registration filing."
        )

    def explain_nexus_concept(self, state: str) -> str:
        prompt = (
            f"A merchant who has never heard of economic nexus is asking what "
            f"it means for their online business in {state}. Explain the "
            f"concept in plain English in 3-4 sentences: what economic nexus "
            f"is, why it exists (Wayfair v. South Dakota), and what it means "
            f"practically for a Stripe seller. Do not use legal jargon."
        )
        result = self._ask(prompt, max_tokens=400)
        if result:
            return result
        return (
            f"Economic nexus is a rule that says if you sell enough into a "
            f"state — even without a physical presence there — you're required "
            f"to collect and send sales tax to that state. This came from a "
            f"2018 Supreme Court case (South Dakota v. Wayfair) that changed "
            f"the rules for online sellers. For {state}, once you cross their "
            f"sales threshold, you need to register, collect tax on orders "
            f"going there, and file returns. It sounds complicated, but "
            f"TaxShield handles the registration for you."
        )

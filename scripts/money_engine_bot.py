"""ClearGlassInc Artemis ethical money engine bot.

Production-oriented skeleton focused on compliant revenue ops and BTC settlement
tracking to a public receiving address.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any

BTC_RECEIVE_ADDRESS = "bc1qppmeg3sr7h9kncthwslm9aj6gtkdnva7artfkk"


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    ISSUED = "issued"
    PENDING_CONFIRMATION = "pending_confirmation"
    PAID = "paid"
    EXPIRED = "expired"


@dataclass(slots=True)
class Invoice:
    invoice_id: str
    account_id: str
    offer_code: str
    amount_usd: float
    amount_btc: float
    btc_address: str = BTC_RECEIVE_ADDRESS
    status: InvoiceStatus = InvoiceStatus.DRAFT
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class PaymentEvent:
    txid: str
    invoice_id: str
    amount_btc: float
    confirmations: int
    observed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class PolicyViolation(Exception):
    """Raised when an action violates governance controls."""


class WalletPolicy:
    required_confirmations = 2

    @staticmethod
    def validate_receive_address(address: str) -> None:
        if address != BTC_RECEIVE_ADDRESS:
            raise PolicyViolation("Payout path blocked: non-approved BTC address.")
        if not address.startswith("bc1"):
            raise PolicyViolation("Address must be a bech32 mainnet receive address.")


class MoneyEngineBot:
    """Coordinates lead->invoice->payment confirmation->fulfillment automation."""

    def __init__(self) -> None:
        self.invoices: dict[str, Invoice] = {}

    def create_invoice(self, *, invoice_id: str, account_id: str, offer_code: str, amount_usd: float, btc_rate: float) -> Invoice:
        WalletPolicy.validate_receive_address(BTC_RECEIVE_ADDRESS)
        amount_btc = round(amount_usd / btc_rate, 8)
        invoice = Invoice(
            invoice_id=invoice_id,
            account_id=account_id,
            offer_code=offer_code,
            amount_usd=amount_usd,
            amount_btc=amount_btc,
            status=InvoiceStatus.ISSUED,
        )
        self.invoices[invoice.invoice_id] = invoice
        self.emit_event("invoice.issued", {"invoice_id": invoice.invoice_id, "amount_btc": invoice.amount_btc})
        return invoice

    def handle_payment_event(self, evt: PaymentEvent) -> Invoice:
        inv = self.invoices[evt.invoice_id]
        WalletPolicy.validate_receive_address(inv.btc_address)
        if evt.amount_btc < inv.amount_btc:
            raise PolicyViolation("Underpayment detected; hold fulfillment.")

        inv.status = (
            InvoiceStatus.PAID
            if evt.confirmations >= WalletPolicy.required_confirmations
            else InvoiceStatus.PENDING_CONFIRMATION
        )
        inv.updated_at = datetime.now(timezone.utc)

        self.emit_event(
            "payment.confirmed" if inv.status == InvoiceStatus.PAID else "payment.pending",
            {
                "invoice_id": inv.invoice_id,
                "txid": evt.txid,
                "confirmations": evt.confirmations,
            },
        )

        if inv.status == InvoiceStatus.PAID:
            self.trigger_delivery(inv)
        return inv

    def trigger_delivery(self, invoice: Invoice) -> None:
        self.emit_event(
            "delivery.start",
            {
                "invoice_id": invoice.invoice_id,
                "account_id": invoice.account_id,
                "offer_code": invoice.offer_code,
            },
        )

    def emit_event(self, event_name: str, payload: dict[str, Any]) -> None:
        # Replace with Kafka/Pulsar/Foundry event sink.
        print({"event": event_name, "payload": payload, "ts": datetime.now(timezone.utc).isoformat()})


if __name__ == "__main__":
    bot = MoneyEngineBot()
    invoice = bot.create_invoice(
        invoice_id="inv-1001",
        account_id="acct-77",
        offer_code="SEC_AUDIT_PRO",
        amount_usd=1500,
        btc_rate=75000,
    )
    bot.handle_payment_event(
        PaymentEvent(
            txid="test-txid-001",
            invoice_id=invoice.invoice_id,
            amount_btc=invoice.amount_btc,
            confirmations=2,
        )
    )

"""Autonomous revenue website + content bot for ClearGlassInc Artemis.

This bot is designed for GitHub-native operation:
- Generates SEO-ready pages and micro-tools from structured strategy config.
- Enforces monetization guardrails (ads, affiliate, donation, subscription, digital products).
- Captures leads via provider-integrated forms (no direct PII persistence in static pages).
- Emits analytics/ops manifests for downstream processing.

Usage:
    python automation/revenue_content_bot.py
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
import html
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "revenue_bot_config.json"
OUTPUT_DIR = ROOT / "generated"


class ComplianceError(RuntimeError):
    """Raised when configuration violates monetization or security controls."""


@dataclass(slots=True)
class LeadCaptureConfig:
    provider: str
    endpoint: str
    required_fields: list[str] = field(default_factory=lambda: ["email"])


@dataclass(slots=True)
class MonetizationConfig:
    ads_enabled: bool
    affiliate_enabled: bool
    donations_enabled: bool
    subscriptions_enabled: bool
    digital_products_enabled: bool
    btc_donation_address: str | None = None


@dataclass(slots=True)
class ContentTopic:
    slug: str
    title: str
    summary: str
    primary_keyword: str
    cta: str


@dataclass(slots=True)
class BotConfig:
    site_name: str
    base_url: str
    lead_capture: LeadCaptureConfig
    monetization: MonetizationConfig
    topics: list[ContentTopic]

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "BotConfig":
        topics = [ContentTopic(**topic) for topic in payload["topics"]]
        lead = LeadCaptureConfig(**payload["lead_capture"])
        monetization = MonetizationConfig(**payload["monetization"])
        return cls(
            site_name=payload["site_name"],
            base_url=payload["base_url"],
            lead_capture=lead,
            monetization=monetization,
            topics=topics,
        )


class RevenueContentBot:
    """Generates high-quality, monetization-ready static artifacts."""

    def __init__(self, config: BotConfig) -> None:
        self.config = config

    def run(self) -> None:
        self._validate_guardrails()
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        generated_pages: list[dict[str, str]] = []
        for topic in self.config.topics:
            path = OUTPUT_DIR / f"{topic.slug}.html"
            path.write_text(self._render_topic_page(topic), encoding="utf-8")
            generated_pages.append({"slug": topic.slug, "title": topic.title, "path": str(path.relative_to(ROOT))})

        landing = OUTPUT_DIR / "revenue-hub.html"
        landing.write_text(self._render_hub_page(generated_pages), encoding="utf-8")

        manifest = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "site": self.config.site_name,
            "base_url": self.config.base_url,
            "pages": generated_pages,
            "lead_capture_provider": self.config.lead_capture.provider,
            "monetization": asdict(self.config.monetization),
        }
        (OUTPUT_DIR / "revenue_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    def _validate_guardrails(self) -> None:
        m = self.config.monetization
        if m.donations_enabled and not m.btc_donation_address:
            raise ComplianceError("Donations enabled but no compliant donation address configured.")
        if m.btc_donation_address and not m.btc_donation_address.startswith("bc1"):
            raise ComplianceError("Only compliant bech32 BTC donation addresses are allowed.")

        forbidden_tokens = {"trading-bot", "arbitrage", "wash trade", "pump"}
        for topic in self.config.topics:
            content = f"{topic.title} {topic.summary} {topic.cta}".lower()
            if any(token in content for token in forbidden_tokens):
                raise ComplianceError(f"Forbidden trading/deceptive language detected in topic: {topic.slug}")

    def _render_topic_page(self, topic: ContentTopic) -> str:
        page_title = html.escape(topic.title)
        summary = html.escape(topic.summary)
        keyword = html.escape(topic.primary_keyword)
        cta = html.escape(topic.cta)
        lead_endpoint = html.escape(self.config.lead_capture.endpoint)
        btc = html.escape(self.config.monetization.btc_donation_address or "")

        return f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>{page_title} | {html.escape(self.config.site_name)}</title>
  <meta name=\"description\" content=\"{summary}\" />
  <meta name=\"keywords\" content=\"{keyword}, clearglassinc artemis, enterprise intelligence\" />
  <meta property=\"og:title\" content=\"{page_title}\" />
  <meta property=\"og:description\" content=\"{summary}\" />
  <link rel=\"canonical\" href=\"{self.config.base_url}/generated/{topic.slug}.html\" />
</head>
<body>
  <main>
    <h1>{page_title}</h1>
    <p>{summary}</p>

    <section aria-label=\"Monetization\">
      <h2>Support & Access</h2>
      <ul>
        <li>Ads inventory: Contextual and policy-compliant placements.</li>
        <li>Affiliate placements: Only relevant, disclosed recommendations.</li>
        <li>Subscriptions: Premium playbooks and monthly intelligence briefings.</li>
        <li>Digital products: Templates, checklists, and implementation kits.</li>
      </ul>
    </section>

    <section aria-label=\"Lead capture\">
      <h2>Request access</h2>
      <form method=\"post\" action=\"{lead_endpoint}\">
        <label>Email <input type=\"email\" name=\"email\" required /></label>
        <label>Company <input type=\"text\" name=\"company\" /></label>
        <button type=\"submit\">{cta}</button>
      </form>
    </section>

    <section aria-label=\"Donations\">
      <h2>Donation Option</h2>
      <p>BTC donations are optional and processed only as compliant donations/payment receipts.</p>
      <code>{btc}</code>
    </section>
  </main>
</body>
</html>
"""

    def _render_hub_page(self, pages: list[dict[str, str]]) -> str:
        links = "\n".join(
            f'<li><a href="{html.escape(item["slug"])}.html">{html.escape(item["title"])}</a></li>' for item in pages
        )
        return f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Revenue Hub | {html.escape(self.config.site_name)}</title>
  <meta name=\"description\" content=\"Automated revenue-ready resource hub generated by the content bot.\" />
</head>
<body>
  <main>
    <h1>{html.escape(self.config.site_name)} Revenue Hub</h1>
    <p>Automatically generated content and tools optimized for quality traffic, conversions, and trust.</p>
    <ul>{links}</ul>
  </main>
</body>
</html>
"""


def load_config(path: Path = CONFIG_PATH) -> BotConfig:
    return BotConfig.from_dict(json.loads(path.read_text(encoding="utf-8")))


if __name__ == "__main__":
    bot = RevenueContentBot(load_config())
    bot.run()
    print("Revenue content artifacts generated in /generated")

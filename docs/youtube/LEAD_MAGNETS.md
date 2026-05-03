# ClearGlassInc Artemis — Lead Magnet Templates
**Channel:** @ClearGlassArtemis  
**Purpose:** Free resources offered in video descriptions and pinned comments to capture email subscribers

---

## LEAD MAGNET 1: The Artemis Security Checklist for Technical Founders

**Format:** PDF checklist (4–6 pages)  
**Offer headline:** "The Security Checklist Every Technical Founder Needs (But Nobody Talks About)"  
**Conversion trigger:** Video 2 (Cybersecurity Stack) + all security-pillar videos  
**Delivery:** Email (via ConvertKit/Beehiiv automation)

---

### COVER PAGE COPY

```
THE ARTEMIS SECURITY CHECKLIST
FOR TECHNICAL FOUNDERS

Stop being an easy target.
This checklist covers every layer of your security posture —
from identity to infrastructure — in 30 minutes or less.

Desmond Odhiambo | ClearGlassInc Artemis
clearglassinc.io
```

---

### CHECKLIST CONTENT (print-ready source)

#### SECTION 1: IDENTITY AND ACCESS MANAGEMENT

**Priority: CRITICAL — Do these first**

```
☐ 1.1  Password manager installed and in use for ALL accounts
        Recommended: 1Password (Business) or Bitwarden (open source)
        All passwords are 20+ characters, randomly generated
        No password is reused across any two accounts

☐ 1.2  Hardware MFA (security key) on all critical accounts
        Recommended: YubiKey 5 Series
        Critical accounts: email, cloud providers, domain registrar, GitHub,
        banking, DNS provider, password manager vault
        
☐ 1.3  SMS MFA removed from all critical accounts
        Replace with: authenticator app (Authy, Google Authenticator) 
        or hardware key
        Reason: SIM swapping is a common, low-skill attack against founders
        
☐ 1.4  Backup recovery codes stored securely offline
        Not in email. Not in cloud storage. Printed or encrypted USB.
        
☐ 1.5  Business email on custom domain (not personal Gmail)
        Reason: Gmail accounts are common social engineering targets
        Minimum: Google Workspace with proper SPF/DKIM/DMARC configured
        
☐ 1.6  SPF, DKIM, and DMARC records configured on your domain
        Test at: mxtoolbox.com/EmailHeaders.aspx
        DMARC policy: minimum p=quarantine, target p=reject
        
☐ 1.7  Privileged accounts isolated
        Use a separate email address for domain registrar, cloud billing, 
        and financial accounts — not your day-to-day business email
```

#### SECTION 2: DEVICE SECURITY

**Priority: HIGH**

```
☐ 2.1  Full disk encryption enabled on all work devices
        Mac: FileVault (System Settings → Privacy & Security → FileVault)
        Windows: BitLocker (requires Pro/Enterprise edition)
        Verify: it should be ON, not just configured
        
☐ 2.2  Screen lock set to 30 seconds or less (auto-lock on idle)
        
☐ 2.3  Endpoint protection software installed
        Recommended: Malwarebytes, CrowdStrike Falcon Go (paid), 
        or built-in OS security (Windows Defender + macOS XProtect) at minimum
        
☐ 2.4  Operating system and software on automatic updates
        No exceptions. Patches protect against known exploits.
        
☐ 2.5  Separate browser profiles: personal vs. work
        Prevents cookie theft from personal browsing affecting work accounts
        
☐ 2.6  Browser extensions audited
        Remove all extensions you haven't used in 30 days
        Extensions have full access to every page you visit
        
☐ 2.7  No software installed from unverified sources
        Mac: Gatekeeper enabled (verified developers only)
        Windows: No executables from email attachments or unverified sites
        
☐ 2.8  Devices have remote wipe capability configured
        Mac: Find My (iCloud) with remote erase enabled
        Windows: Microsoft Find My Device or MDM solution
        
☐ 2.9  Work and personal device are separate (or profiles are fully isolated)
```

#### SECTION 3: NETWORK AND COMMUNICATIONS

**Priority: HIGH**

```
☐ 3.1  Home router firmware is current (updated in last 6 months)
        Default admin credentials changed to strong unique password
        Remote management disabled
        
☐ 3.2  WiFi uses WPA3 encryption (or WPA2 minimum, WEP never)
        Guest network enabled and isolated from main network
        
☐ 3.3  VPN in use on all public/untrusted networks
        Recommended: ProtonVPN (privacy-focused) or Mullvad
        Note: VPN is not a magic security shield — it protects against 
        network-level eavesdropping, not endpoint compromise
        
☐ 3.4  DNS over HTTPS (DoH) or secure DNS resolver configured
        Recommended: Cloudflare 1.1.1.1 or NextDNS
        NextDNS allows custom blocklists for malicious domains
        
☐ 3.5  Sensitive communications on end-to-end encrypted channels
        Recommended: Signal for messaging, ProtonMail for sensitive email
        
☐ 3.6  Business video calls use waiting rooms and meeting passwords
        
☐ 3.7  Outbound firewall monitoring (optional but recommended)
        Mac: Little Snitch — alerts you when apps try to phone home
```

#### SECTION 4: CLOUD INFRASTRUCTURE

**Priority: CRITICAL if you run any infrastructure**

```
☐ 4.1  No root/admin AWS/GCP/Azure accounts used for daily operations
        Create IAM users with minimum necessary permissions
        Root account: MFA enabled, used only for billing/account recovery
        
☐ 4.2  API keys and secrets NOT stored in code repositories
        Not in .env files committed to git
        Not in code comments
        Use: AWS Secrets Manager, HashiCorp Vault, or environment secrets
        
☐ 4.3  All API keys rotated in the last 90 days
        
☐ 4.4  GitHub/GitLab repository secret scanning enabled
        GitHub: Settings → Security → Secret scanning
        
☐ 4.5  No public S3 buckets, storage blobs, or object storage
        Audit all storage: everything should be private by default
        
☐ 4.6  Server ports: only necessary ports open to public internet
        Audit with: nmap -sV [your server IP] or Shodan.io
        SSH should NOT be on port 22 if publicly accessible
        
☐ 4.7  SSH key authentication only (password authentication disabled)
        
☐ 4.8  Cloud billing alerts configured (unusual spend = possible compromise)
        
☐ 4.9  Logging enabled on all cloud infrastructure
        CloudTrail (AWS), Cloud Audit Logs (GCP), Activity Logs (Azure)
```

#### SECTION 5: DATA AND SAAS HYGIENE

**Priority: HIGH**

```
☐ 5.1  Audit of all SaaS tools completed
        List every tool. Note: what data it has, who has access, last login.
        Remove: any tool unused in 30+ days
        
☐ 5.2  Third-party app permissions audited
        Google: myaccount.google.com/permissions
        GitHub: Settings → Applications → Authorized OAuth Apps
        Remove any app you don't recognize or no longer use
        
☐ 5.3  3-2-1 backup rule in place
        3 copies of important data
        2 different storage media types
        1 copy offsite (cloud counts)
        Backups tested (can you actually restore from them?)
        
☐ 5.4  Sensitive files encrypted before cloud storage
        Tool: Cryptomator (free, open source) — encrypts files before upload
        
☐ 5.5  Client/customer data inventory exists
        What data do you hold? Where? Who has access? Legal basis?
        
☐ 5.6  Data retention and deletion policy defined
        Old client data, old employee data, test data — do you delete it?
        
☐ 5.7  Shared accounts eliminated or documented
        Every login should be traceable to one person
```

#### SECTION 6: INCIDENT RESPONSE READINESS

**Priority: MEDIUM (but becomes critical when you need it)**

```
☐ 6.1  You know who to call if your account is compromised
        Domain registrar support: [number saved]
        Cloud provider security: [number saved]
        Bank fraud line: [number saved]
        
☐ 6.2  Recovery account process documented for every critical service
        "If I lose access to X, I can recover by Y"
        
☐ 6.3  Your team knows what to do if they receive a suspicious email
        Simple rule: when in doubt, don't click — forward to [designated contact]
        
☐ 6.4  You have a trusted security advisor/contact for incidents
        (This is one of the things I do at ClearGlassInc — clearglassinc.io)
```

---

### SCORING GUIDE

```
Count your checkmarks:

50–54 checked: Excellent posture — you're harder to compromise than 95% of founders
40–49 checked: Good foundation — close the gaps in unchecked items this week
30–39 checked: Moderate risk — prioritize Section 1 and 4 immediately
Below 30:       High risk — book a security review before something happens

→ Book a security review: clearglassinc.io
→ Join the Artemis Inner Circle for ongoing security intelligence: [link]
```

---

### BACK COVER / FINAL PAGE

```
ABOUT CLEARGLASSINC ARTEMIS

ClearGlassInc Artemis is an enterprise cybersecurity and AI intelligence 
platform founded by Desmond Odhiambo.

We help technical founders and organizations design security infrastructure 
that actually works — not compliance theater, but intelligence-led defense.

→ YouTube: @ClearGlassArtemis
→ Website: clearglassinc.io
→ Book a strategy call: clearglassinc.io/call

This checklist is updated regularly. Share it freely.
```

---

## LEAD MAGNET 2: AI Agent Architecture Blueprint

**Format:** PDF diagram + annotations (2–3 pages)  
**Offer headline:** "The 5-Layer AI Agent Architecture Blueprint (Production-Ready)"  
**Conversion trigger:** Video 1 (AI Platform Architecture) + all AI-pillar videos

---

### COVER PAGE COPY
```
THE ARTEMIS AI AGENT ARCHITECTURE BLUEPRINT

The 5-layer framework for building AI systems that don't break in production.

Based on the architecture behind ClearGlassInc Artemis — 
the enterprise AI intelligence platform.

Desmond Odhiambo | ClearGlassInc Artemis | clearglassinc.io
```

---

### BLUEPRINT CONTENT

#### The 5-Layer Framework (annotated diagram description for designer)

```
[DIAGRAM: Vertical stack of 5 layers, top to bottom, with arrows showing 
bidirectional data flow between adjacent layers and a feedback loop from 
Layer 5 back to Layer 1]

LAYER 5: EVOLUTION LOOP (top)
├── Weekly performance reports
├── Prompt refinement cycle  
├── Threshold calibration
└── Data source expansion review
        ↕ (feeds back into all layers)

LAYER 4: ADAPTIVE EXECUTION
├── Track 1: Standard execution (expected case)
├── Track 2: Degraded execution (reduced confidence)  
└── Track 3: Safe mode (critical failure, human handoff)
        ↕

LAYER 3: SELF-MONITORING AND ALERTING
├── Latency monitoring
├── Output confidence distribution
├── Validation failure rate
├── Human override rate
└── Data freshness tracking
        ↕

LAYER 2: REASONING ENGINE
├── Structured prompt system (templates + constraints)
├── Chain-of-thought verification (dual-path for high-risk decisions)
├── RAG layer (vector DB of verified intelligence)
└── Output validation (format + factual consistency check)
        ↕

LAYER 1: DATA INGESTION (bottom)
├── Validation gate (schema enforcement)
├── Quarantine queue (non-conforming data)
├── Primary feed
├── Secondary feed (redundancy)
└── Freshness tracking
```

---

#### Key Design Principles (annotation text)

```
Principle 1: The LLM is not the system.
The LLM is Layer 2's reasoning component. The system is all 5 layers.

Principle 2: Monitor before you automate.
Layer 3 should be built before Layer 2. Blind spots in production are 
expensive. Monitoring is cheap.

Principle 3: Design for graceful degradation, not just success.
Every layer needs a "what happens when this fails" path. Safe mode 
is not an afterthought — it's a design requirement.

Principle 4: Feedback is the engine of evolution.
Layer 5 is what separates a static deployment from a living system.
Without it, performance drifts and you don't notice until it's too late.

Principle 5: Bad data kills good models.
Invest 3x more than you think you need to in Layer 1.
The best reasoning engine in the world produces garbage on garbage data.
```

---

#### Implementation Priority Order

```
For teams starting from scratch:

Week 1–2:   Build Layer 1 (data ingestion + validation)
Week 2–4:   Build Layer 3 (monitoring) — before reasoning
Week 4–6:   Build Layer 2 (reasoning engine)
Week 6–8:   Build Layer 4 (adaptive execution)
Week 8+:    Build Layer 5 (evolution loop)

Note: Most teams build in the wrong order (Layer 2 first) and pay for it 
with production failures they can't diagnose. The monitoring layer must 
exist before anything is automated.
```

---

#### Technology Stack Reference

```
Layer 1 — Data Ingestion
Options: Apache Kafka, AWS Kinesis, or simple Python async queues
Schema validation: Pydantic (Python), Zod (TypeScript), JSON Schema
Storage: PostgreSQL + vector DB (Pinecone, Weaviate, or pgvector)

Layer 2 — Reasoning Engine
LLM: Claude (Anthropic), GPT-4o (OpenAI), or local Llama/Mistral
Orchestration: LangChain, LlamaIndex, or custom
RAG: Pinecone / Weaviate / pgvector + embedding model

Layer 3 — Monitoring
Metrics: Prometheus + Grafana, or Datadog, or CloudWatch
Alerting: PagerDuty, OpsGenie, or simple email/Slack alerts
Logging: Structured logs (JSON) to ELK stack or CloudWatch Logs

Layer 4 — Adaptive Execution
State machine: Python state machines or temporal.io for complex workflows
Queue: Celery (Python), BullMQ (Node), or AWS SQS
Decision routing: custom logic based on monitoring Layer 3 signals

Layer 5 — Evolution Loop
Report generation: scheduled Python job + LLM summarization
Storage: Notion, Confluence, or simple markdown in git
Review cycle: weekly automated + monthly human review
```

---

## LEAD MAGNET 3: Sovereign Business Stack (Notion Template)

**Format:** Notion template (shareable link)  
**Offer headline:** "The Founder OS: The Exact Notion Template I Use to Run ClearGlassInc"  
**Conversion trigger:** Founder OS series + Sovereign Business Systems pillar

---

### Template Structure

```
ARTEMIS FOUNDER OS — NOTION TEMPLATE

1. INTELLIGENCE HUB
   ├── Daily AI briefing (auto-populated via integration)
   ├── Threat feed summary
   ├── Industry signal log
   └── Decision log (what decisions were made and why)

2. PROJECTS & SYSTEMS
   ├── Active projects (kanban)
   ├── System inventory (what's running, what it does, who owns it)
   ├── Automation log (what's automated, where it runs, cost)
   └── Technical debt tracker

3. BUSINESS OPERATIONS
   ├── Revenue dashboard (manual input weekly)
   ├── Pipeline tracker (leads, proposals, clients)
   ├── Content calendar (linked to YouTube strategy)
   └── Weekly review template

4. KNOWLEDGE BASE
   ├── Client SOPs
   ├── Security runbooks
   ├── Architecture decision records (ADRs)
   └── Lessons learned

5. WEEKLY REVIEW TEMPLATE
   ├── What shipped this week
   ├── What broke (and what I did about it)
   ├── Revenue: actual vs. target
   ├── Top 3 priorities for next week
   └── One decision I made that I want to remember
```

---

### Offer Text (for description and email)

```
The Artemis Founder OS is the Notion template I use to run ClearGlassInc 
every week. It's built around the principle that a technical founder's most 
valuable operating system is the one that keeps intelligence, projects, 
revenue, and decisions in one place — without needing a team to maintain it.

What's inside:
→ Intelligence hub (AI-briefing ready, threat feed log)
→ Project and automation tracker
→ Revenue and pipeline dashboard
→ Knowledge base with ADR template
→ Weekly review system

Duplicate it to your Notion workspace in 30 seconds.
[LINK TO NOTION TEMPLATE]
```

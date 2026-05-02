# Risk Ownership Governance (ClearGlassInc Artemis)

**Core principle:** tools, permissions, and logs are controls; ownership is accountability. Without a named owner per risk, the control plane is fragile.

## Ownership model
For every production risk, define one accountable owner (`A`) using RACI.

| Risk Domain | Accountable (A) | Responsible (R) | Consulted (C) | Informed (I) |
|---|---|---|---|---|
| GitHub Pages production availability | Platform Owner | DevOps Engineer | Security Lead | Product + Ops |
| CI/CD policy and branch protection | Platform Owner | Repo Maintainer | Security Lead | Engineering |
| Netlify/GitHub integration conflicts | Platform Owner | DevOps Engineer | Web Lead | Engineering |
| Incident response + rollback | Incident Commander | On-call Engineer | Security + SRE | Leadership |

## Mandatory controls
1. Every workflow file must include an explicit `service_owner` in metadata comments.
2. Every protected branch rule must map to an owner in this matrix.
3. Every failed required check must have an assigned owner within 15 minutes.
4. Every deployment incident must capture owner, decision log, and rollback authority.

## Decision policy
- If ownership is unclear, **deployment is blocked** until owner is assigned.
- If two teams claim ownership, the Platform Owner is final tie-breaker.

## Lightweight implementation checklist
- [ ] Add CODEOWNERS entries for `.github/workflows/*` and deployment docs.
- [ ] Add branch protection required check naming standard.
- [ ] Add `owner` field in incident templates.
- [ ] Review ownership matrix monthly.

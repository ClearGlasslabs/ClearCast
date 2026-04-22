#!/usr/bin/env python3
"""Repository integrity checker for ClearGlassInc Artemis.

Checks:
1) Internal links in HTML/Markdown resolve to tracked files.
2) Required repo assets exist.
3) Workflow hygiene (trigger + permissions on deploy workflows).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HTML_MD_SUFFIXES = {".html", ".md"}
REQUIRED_FILES = [
    "README.md",
    "index.html",
    "privacy.html",
    "terms.html",
    "CNAME",
    ".github/workflows/jekyll-docker.yml",
]

HTML_REF_RE = re.compile(r"(?:href|src)=[\"']([^\"'#?]+)")
MD_REF_RE = re.compile(r"\[[^\]]+\]\(([^)#?]+)")


def is_external(link: str) -> bool:
    return link.startswith(("http://", "https://", "mailto:", "tel:", "data:", "javascript:"))


def resolve_target(source: Path, link: str) -> Path:
    if link.startswith("/"):
        return (ROOT / link.lstrip("/")).resolve()
    return (source.parent / link).resolve()


def scan_links() -> list[str]:
    errors: list[str] = []
    for source in ROOT.rglob("*"):
        if not source.is_file() or source.suffix.lower() not in HTML_MD_SUFFIXES:
            continue
        text = source.read_text(encoding="utf-8", errors="ignore")
        refs = HTML_REF_RE.findall(text)
        if source.suffix.lower() == ".md":
            refs.extend(MD_REF_RE.findall(text))
        for link in refs:
            if not link or is_external(link):
                continue
            target = resolve_target(source, link)
            if not target.exists():
                rel = source.relative_to(ROOT).as_posix()
                errors.append(f"Broken link in {rel}: {link}")
    return errors


def check_required_files() -> list[str]:
    errors: list[str] = []
    for file_name in REQUIRED_FILES:
        if not (ROOT / file_name).exists():
            errors.append(f"Missing required file: {file_name}")
    return errors


def check_workflow_permissions() -> list[str]:
    errors: list[str] = []
    workflows = list((ROOT / ".github/workflows").glob("*.yml"))
    for wf in workflows:
        content = wf.read_text(encoding="utf-8", errors="ignore")
        if "pages" in wf.name.lower() or "deploy" in content.lower():
            if "permissions:" not in content:
                errors.append(f"Workflow {wf.name} should declare permissions explicitly")
            if "workflow_dispatch:" not in content:
                errors.append(f"Workflow {wf.name} should support manual workflow_dispatch")
    return errors


def main() -> int:
    checks = [scan_links(), check_required_files(), check_workflow_permissions()]
    errors = [err for group in checks for err in group]
    if errors:
        print("Integrity check FAILED:")
        for err in errors:
            print(f" - {err}")
        return 1
    print("Integrity check PASSED.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

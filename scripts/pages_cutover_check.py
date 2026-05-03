#!/usr/bin/env python3
"""Quick local validator for GitHub Pages cutover readiness."""
from pathlib import Path

REQUIRED = [
    Path('.github/workflows/deploy-pages.yml'),
    Path('index.html'),
    Path('README.md'),
]
OPTIONAL = [
    Path('CNAME'),
    Path('netlify.toml'),
    Path('CODEOWNERS'),
]


def main() -> int:
    print('ClearGlassInc Artemis :: GitHub Pages cutover check')
    ok = True
    for path in REQUIRED:
        exists = path.exists()
        print(f"[{'OK' if exists else 'MISSING'}] required: {path}")
        ok = ok and exists

    for path in OPTIONAL:
        state = 'present' if path.exists() else 'absent'
        print(f"[INFO] optional: {path} ({state})")

    if Path('netlify.toml').exists():
        print('[WARN] netlify.toml exists: ensure Netlify checks are removed from branch protection if migrating fully.')

    print('\nNext UI checks:')
    print('1) GitHub Settings -> Pages -> Source = GitHub Actions')
    print('2) Branch protection -> remove Netlify required checks')
    print('3) Keep GitHub Pages / verify as required')

    return 0 if ok else 1


if __name__ == '__main__':
    raise SystemExit(main())

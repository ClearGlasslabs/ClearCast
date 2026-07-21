# ClearGlass Vision MVP

Privacy-first browser camera intelligence for authorized defensive and operational use.

## Capabilities

- Live browser camera and local video input
- On-device COCO-SSD object detection with bounding boxes and confidence
- Operator consent gate and explicit start/stop controls
- Entry event ledger, JSON export, and SHA-256 evidence snapshots
- Responsive ClearGlass operator console
- No facial recognition, identity inference, audio capture, cloud upload, or automatic recording

## Run

Serve the repository over HTTPS or localhost, then open `/camera/`. Camera access will not work from an insecure HTTP origin.

```bash
python -m http.server 8080
# open http://localhost:8080/camera/
```

The first run downloads TensorFlow.js and the COCO-SSD model from jsDelivr. Inference then runs in the browser. For controlled or disconnected deployments, vendor and integrity-pin these dependencies before production.

## Production hardening

Add authentication and role-based access, a strict Content Security Policy, signed model artifacts, encrypted storage, retention policy enforcement, health telemetry, tests on supported devices, and a human review gate before connecting real operational cameras. Do not use this MVP for automated enforcement, biometric surveillance, or decisions affecting legal rights.

Founder attribution: Desmond Otieno Odhiambo, ClearGlassInc.

# clearglass-vision

Standalone deployable bundle for ClearGlassInc Artemis vision operations.

## Includes
- Frigate + Mosquitto + Double-Take + CompreFace + Ollama + Tailscale sidecar via Docker Compose
- ESP32-S3 firmware scaffold (ESP-IDF / PlatformIO)
- Python VLM bridge (`frigate/events` -> Ollama Qwen3-VL -> `clearglass/vision/notice`)
- Home Assistant automation template
- NGINX reverse proxy template with mTLS directives

## 10-minute quickstart
1. Update camera RTSP URLs in `frigate/config.yml`.
2. Start stack: `docker compose up -d`.
3. Pull model: `docker exec -it <ollama_container> ollama pull qwen3-vl`.
4. Verify MQTT notice topic: `mosquitto_sub -h localhost -t clearglass/vision/notice -v`.

## Hardware BoM
- Raspberry Pi 5 (or x86 host), Coral USB TPU (optional), NVIDIA GPU host for TensorRT optional.
- ESP32-S3 + OV5640 camera modules.

## Troubleshooting
- If no snapshots resolve, verify Frigate event IDs on `frigate/events`.
- If VLM responses are empty, check Ollama model availability and token budget.
- If remote access fails, verify Tailscale auth key and MagicDNS settings.

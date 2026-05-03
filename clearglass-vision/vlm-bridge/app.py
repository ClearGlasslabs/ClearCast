import json, os, requests
from paho.mqtt import client as mqtt

MQTT_HOST = os.getenv("MQTT_HOST", "localhost")
FRIGATE_URL = os.getenv("FRIGATE_URL", "http://localhost:5000")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "qwen3-vl")
PROMPT = "Assess suspicious behavior and return compact JSON: severity, rationale, recommended_action."


def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode())
    event_id = payload.get("after", {}).get("id")
    if not event_id:
        return
    snap_url = f"{FRIGATE_URL}/api/events/{event_id}/snapshot.jpg"
    image = requests.get(snap_url, timeout=10).content
    resp = requests.post(f"{OLLAMA_URL}/api/generate", json={"model": MODEL, "prompt": PROMPT, "images": [image.hex()], "stream": False}, timeout=60)
    notice = {"event_id": event_id, "vlm": resp.json().get("response", "")}
    client.publish("clearglass/vision/notice", json.dumps(notice), qos=1)


c = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
c.on_message = on_message
c.connect(MQTT_HOST, 1883)
c.subscribe("frigate/events", qos=1)
c.loop_forever()

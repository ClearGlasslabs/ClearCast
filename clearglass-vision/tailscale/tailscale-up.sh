#!/bin/sh
tailscaled &
sleep 2
tailscale up --accept-routes=true --ssh=true
wait

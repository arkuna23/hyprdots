#!/bin/bash

if ! pgrep 'hyprlock' > /dev/null; then
    playerctl pause
    hyprlock
    loginctl unlock-session
fi

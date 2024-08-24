#!/usr/bin/env sh

workspace_action() {
    read -r monitor
    case "$monitor" in
        "$MONITOR_1")
            hyprctl dispatch "$1" "$2"
            ;;
        "$MONITOR_2")
            hyprctl dispatch "$1" $((10 + $2))
            ;;
    esac
}

get_monitor() {
    hyprctl activeworkspace -j | jq -r '.monitor'
}

case "$1" in
    "switch")
         get_monitor | workspace_action "workspace" "$2"
        ;;
    "move")
        get_monitor | workspace_action "movetoworkspace" "$2"
        ;;
esac

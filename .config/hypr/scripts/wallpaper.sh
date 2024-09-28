#!/usr/bin/env bash

random_file() {
    local directory="$1"

    local files=()
    for file in "$directory"/*; do
        if [ -f "$file" ]; then
            files+=("$file")
        fi
    done

    local random_index=$((RANDOM % ${#files[@]}))
    echo "${files[$random_index]}"
}

switch() {
    local path=~/.config/hypr/assets
    local rand_hori
    rand_hori=$(random_file "$path/hori_wall")
    local rand_vert
    rand_vert=$(random_file "$path/vert_wall")
    swww img -o "$MONITOR_1" --transition-type random --transition-duration 1 --transition-fps 75 "$rand_hori"
    swww img -o "$MONITOR_2" --transition-type random --transition-duration 1 --transition-fps 75 "$rand_vert"
}

swww-daemon &
sleep 5
if [ ! -f "${HOME}/.cache/swww/$MONITOR_1" ]; then
    switch
fi
while true; do
    sleep 1200
    switch
done

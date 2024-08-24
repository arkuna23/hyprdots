#!/bin/bash

color=$(hyprpicker | tr -d '\n')
if [ -n "$color" ]; then
	echo -n "$color" | wl-copy
	notify-send 'Color Picker' $color -u normal
fi

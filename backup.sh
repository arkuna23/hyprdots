#!/usr/bin/env bash

function update()
{
    echo -n "update ${1}"
    exclude_args=()
    for item in "${@:2}"; do
        echo -n ", exclude ${item}"
        exclude_args+=(--exclude "$item")
    done
    echo

    rsync -avq --delete ~/.config/"${1}" ./.config/ "${exclude_args[@]}"
}

function update_rc()
{
    echo -n "update ${1}"
    cp ~/."${1}" ./
}

update alacritty themes
update gtk-3.0
update gtk-4.0
update ags node_modules types package.json package-lock.json css
update mako
update hypr
update rofi

update_rc hexerrc

#!/bin/bash
cp ~/.profile .profile

function update()
{
  echo -n "update ${1}"

  exclude_args=""
  for item in "${@:2}"; do
    echo -n ",exclude ${item}";
    exclude_args+="--exclude $item ";
  done
  rsync -avq --delete ~/.config/${1} ./.config/ $exclude_args
  echo
}

update alacritty themes
update gtk-3.0
update waybar
update nvim
update mako
update hypr
update rofi
update neofetch

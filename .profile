export EDITOR=nvim
alias vi=$EDITOR
alias vim=$EDITOR

function load_wm_env
{
	export LANG=zh_CN.UTF-8
	unset LESS
	export http_proxy='http://127.0.0.1:7890'
	export https_proxy=$http_proxy

  export ELECTRON_FLAGS="--enable-features=WaylandWindowDecorations\n--ozone-platform-hint=auto\n--enable-wayland-ime"
  export ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/
}

if [ -v ZSH_NAME ]; then
	source '/usr/share/autojump/autojump.zsh'
fi

function clear_clipboard
{
	cliphist list | while IFS= read -r line; do echo "$line" | cliphist delete; done
}

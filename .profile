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

clear_clipboard()
{
	cliphist list | while IFS= read -r line; do echo "$line" | cliphist delete; done
}

set_global_var()
{
  echo "export $1='$2'" >> ~/.profile
  export $1="$2"
  echo "set var $1=$2"
}

alplpha() {
  printf "%x\n" $(echo "scale=0; 255 * $1" | bc)
}

export BG_COLOR=#17456e
export TXT_COLOR=#e6e6e6
export BG_ALPHA=0.7
export CODE_FONT='JetBrainsMono Nerd Font Mono'
export INTERACTIVE_COLOR_0='#447ff5'
export INTERACTIVE_COLOR_1='#00036c'

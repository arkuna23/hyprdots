import Gtk from 'gi://Gtk?version=3.0';
import { MprisPlayer } from 'resource:///com/github/Aylur/ags/service/mpris.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js'
import Mpris from 'resource:///com/github/Aylur/ags/service/mpris.js';
import { Props } from 'types/service';
import { onFirstDrawAction } from 'ts/utils';
import { AnimatedCircularProgress } from 'ts/components/widgets';
import { AgsBox, AgsEventBox, AgsStack } from 'ts/imports';
import { AnimationDuration, PX_PER_REM } from 'ts/vars';
import AnimationService, { EaseFunc } from 'ts/services/animation';
import { LabelProps } from 'types/widgets/label';
import GLib from 'gi://GLib';

const InfoBoxWidth = (18 + 1.2) * PX_PER_REM;

const labelStack = (props: LabelProps<unknown>, duration: number, init: string) => {
    const stack = Widget.Stack({
        transition_duration: duration,
        attribute: {
            label: '',
            change(label: string, isPrev: boolean) {
                if (typeof props !== 'object')
                    props = {};

                stack.attribute.label = label;
                label = GLib.markup_escape_text(label, -1) ?? 'invalid label';
                stack.transition = isPrev ? 'slide_right' : 'slide_left';
                stack.children['next'].label = label;
                stack.shown = 'next';
                setTimeout(() => {
                    if (stack.is_destroyed) return;
                    stack.transition = 'none';
                    stack.children['curr'].label = label;
                    stack.shown = 'curr';
                }, duration);
            }
        },
        children: {
            'curr': Widget.Label({ label: init, ...(props as any) }),
            'next': Widget.Label({ label: init, ...(props as any) })
        }
    });
    return stack;
}

const bindMusicPlayer = (bar: AnimatedCircularProgress, coverImage: AgsBox, player: MprisPlayer) => {
    return {
        interval: setInterval(() => bar.value_animated = player.position / player.length, 1000),
        coverImage: coverImage.bind('css', player, 'cover_path', path => {
            return `background-image: url('${path}');`;
        })
    };
}

type PlayerCover = {
    interval?: GLib.Source,
    coverImage: AgsBox,
    progressBar: AnimatedCircularProgress,
}

type PlayerCoverReturn = PlayerCover & {
    coverBox: AgsBox
}

const createPlayerCover = (player?: MprisPlayer) => {
    const progress = AnimatedCircularProgress(Widget.CircularProgress({
        class_names: ['state-circle'],
        rounded: true
    }), {
        duration: AnimationDuration.State,
        easing: EaseFunc.easeInQuad
    });
    const coverImage = Widget.Box({
        class_names: ['cover']
    });
    const coverOverlay = Widget.Overlay({
        child: progress.bar,
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER,
    });

    if (player) {
        const bindResult = bindMusicPlayer(progress, coverImage, player);
        coverOverlay.overlays = [bindResult.coverImage];

        return {
            ...bindResult,
            progressBar: progress,
            coverBox: Widget.Box({
                class_names: ['cover-box'],
                children: [
                    coverOverlay
                ]
            })
        } as PlayerCoverReturn;
    } else {
        coverOverlay.overlays = [coverImage];
        return {
            coverImage,
            progressBar: progress,
            coverBox: Widget.Box({
                class_names: ['cover-box'],
                children: [
                    coverOverlay
                ]
            })
        } as PlayerCoverReturn;
    }
}

type PlayerBox = PlayerCover & {
    playerBox: AgsBox<{ symbol: Symbol }>
}

type PlayerBoxOpts = {
    player: MprisPlayer
    firstBox?: PlayerBox
}

const createPlayerBox = (() => {
    const createMainBox = (props: Props<AgsBox | undefined>) => Widget.Box({
        ...props,
        attribute: {
            symbol: Symbol(),
        },
        class_names: ['player'],
        orientation: Gtk.Orientation.HORIZONTAL,
    });
    return (opts?: PlayerBoxOpts) => {
        if (!opts) {
            const cover = createPlayerCover();
            return {
                playerBox: createMainBox({
                    children: [cover.coverBox]
                }),
                ...cover
            } as PlayerBox;
        } else {
            const { firstBox, player } = opts;
            
            let prev = false;
            const titleStack = labelStack({
                class_names: ['title'],
                truncate: 'end',
                justification: 'center',
                use_markup: true,
                max_width_chars: 15
            }, 350, 'No Music').hook(Mpris, (self, busName) => {
                if (busName === player.bus_name && player.track_title !== self.attribute.label) {
                    self.attribute.change(player.track_title, prev);
                    prev = false;
                }
            }, 'player-changed');
            const title = Widget.Box({
                class_names: ['title-box'],
                orientation: Gtk.Orientation.VERTICAL,
                valign: Gtk.Align.CENTER,
                children: [
                    titleStack
                ]
            }); // title label
    
            const artistsStack = labelStack({
                class_names: ['artists'],
                truncate: 'end',
                justification: 'center',
                use_markup: true,
                max_width_chars: 10
            }, 350, '（¯\\_(ツ)_/¯）').hook(Mpris, (self, busName) => {
                if (busName === player.bus_name && player.track_artists.join(', ') !== self.attribute.label) {
                    self.attribute.change(player.track_artists.join(', '), prev);
                    prev = false;
                }
            }, 'player-changed');
            const artists = Widget.Box({
                class_names: ['artists-box'],
                orientation: Gtk.Orientation.VERTICAL,
                valign: Gtk.Align.CENTER,
                children: [
                    artistsStack
                ]
            }); // artists label
    
            const controlIcon = (name: string, icon: string, prop: keyof Props<MprisPlayer>, size: number = 16) => Widget.Icon({
                class_names: [`${name}-icon`], size, icon
            }).bind('class_names', player, prop, status => {
                if (status)
                    return [`${name}-icon`];
                else
                    return [`${name}-icon`, 'disabled'];
            });
            const control = Widget.Box({
                class_names: ['control'],
                halign: Gtk.Align.CENTER,
                children: [ 
                    Widget.Button({
                        child: controlIcon('prev', 'media-skip-backward-symbolic', 'can_go_prev'),
                        on_primary_click: () => {
                            prev = true;
                            player.previous();
                        },
                        sensitive: player.bind('can_go_prev')
                    }),
                    Widget.Button({
                        child: controlIcon('state', '', 'can_play', 20).bind('icon', player, 'play_back_status', status => {
                            if (status === 'Playing') 
                                return 'media-playback-pause-symbolic';
                            else
                                return 'media-playback-start-symbolic';
                        }),
                        on_primary_click: () => player.playPause(),
                        sensitive: player.bind('can_play')
                    }),
                    Widget.Button({
                        child: controlIcon('next', 'media-skip-forward-symbolic', 'can_go_next'),
                        on_primary_click: () => player.next(),
                        sensitive: player.bind('can_go_next')
                    })
                ]
            }); // music control
    
            const order: ("artists" | "control")[] = ['artists', 'control'];
            const rightStack = Widget.Stack({
                transition: 'crossfade',
                transition_duration: AnimationDuration.Scroll,
                children: {
                    'artists': artists,
                    'control': control
                },
                setup(self) {
                    onFirstDrawAction(self, () => self.shown = order[0]);
                },
            }); // bar right
    
            const barPrimary = Widget.Box({
                class_names: ['info'],
                orientation: Gtk.Orientation.HORIZONTAL,
                children: [
                    title, 
                    Widget.Label({
                        class_names: ['separator'],
                        label: '♫',
                    }),
                    Widget.EventBox({
                        child: rightStack,
                        on_hover: () => rightStack.shown = order[1],
                        on_hover_lost: () => rightStack.shown = order[0]
                    })
                ]
            })
    
            if (firstBox) {
                const { coverImage, progressBar, playerBox } = firstBox;
                const bindResult = bindMusicPlayer(progressBar, coverImage, player);
                firstBox.interval = bindResult.interval;

                const { width, height } = playerBox.get_allocation();
                AnimationService.animate({
                    action(progress) {
                        playerBox.set_size_request(width + InfoBoxWidth * progress, height);
                    },
                    duration: AnimationDuration.State,
                    easing: EaseFunc.easeInQuad,
                    onFinish() {
                        const children = playerBox.children;
                        children.push(barPrimary);
                        playerBox.children = children;
                    },
                    symbol: playerBox.attribute.symbol
                });
            } else {
                const cover = createPlayerCover(player);
                return {
                    playerBox: createMainBox({
                        children: [cover.coverBox, barPrimary]
                    }),
                    ...cover
                } as PlayerBox;
            }
        }
    }
})()

type PlayerMap = Map<string, PlayerBox>;

let firstBox: PlayerBox | undefined;
// player or childrenMap is undefind means only icon music bar(no music playing)
const addPlayerBox =  (stack: AgsStack, player?: MprisPlayer, childrenMap?: PlayerMap) => {
    // todo animations
    if (!(player && childrenMap)) {
        firstBox = createPlayerBox();
        stack.children = {
            '0': firstBox!.playerBox
        }
        stack.shown = '0'
    } else {
        if (childrenMap.has(player.bus_name)) return;

        let playerBox: PlayerBox;
        if (childrenMap.size === 0) {
            createPlayerBox({ player, firstBox });
            const children = stack.children;
            children[player.bus_name] = children['0'];
            delete children['0'];
            stack.children = children;
            playerBox = firstBox!;
        } else {
            playerBox = createPlayerBox({ player })!;
            const children = stack.children;
            children[player.bus_name] = playerBox.playerBox;
            stack.children = children;
            stack.shown = player.bus_name;
        }
        childrenMap.set(player.bus_name, playerBox);
        console.log(`add player ${player.bus_name}`)
        return playerBox;
    }
}

const removePlayer = (busName: string, childrenMap: PlayerMap, stack: AgsStack) => {
    const player = childrenMap.get(busName);
    if (player) {
        clearInterval(player.interval!);
        childrenMap.delete(busName);
        if (childrenMap.size === 0) {
            const { playerBox, coverImage } = player;
            const children = playerBox.children;
            children.pop()?.destroy();
            playerBox.children = children;
            const { width } = coverImage.get_allocation();
            const { height } = playerBox.get_allocation();
            const deltaWidth = playerBox.get_allocation().width - width;
            AnimationService.animate({
                action(progress) {
                    playerBox.set_size_request(width + deltaWidth * (1 - progress), height);
                },
                duration: AnimationDuration.State,
                easing: EaseFunc.easeInQuad,
                symbol: playerBox.attribute!['symbol'],
            })
            player.progressBar.value_animated = 0;
            player.coverImage.css = `background-image: none;`;
            firstBox = player;
        } else {
            const children = stack.children;
            let last: string | undefined;
            const entries = Object.entries(children);
            for (const [key, value] of entries) {
                if (key === busName) {
                    stack.shown = last ?? entries[1][0];
                    setTimeout(() => {
                        value.destroy();
                        delete children[key];
                        stack.children = children;
                    }, stack.transition_duration);
                    break;
                }
                last = key;
            }
        }
        console.log(`remove player ${busName}`)
    }

    return player;
}

const AudioBar = () => {
    const childrenMap = new Map<string, PlayerBox>();
    const busNames: string[] = [];
    const stack = Widget.Stack({
        transition: 'slide_up_down',
        class_names: ['audio-bar'],
        setup(self) {
            addPlayerBox(self);
            onFirstDrawAction(self, () => {
                const players = Mpris.players;
                for (const player of players) {
                    if (player.track_title.length > 0) {
                        self.shown = player.bus_name;
                        break;
                    }
                }   
            });
        },
    }).hook(Mpris, (self, busName) => {
        if (!busName) return;

        const player = addPlayerBox(self, Mpris.players.filter((player) => player.bus_name === busName)[0], childrenMap);
        if (player) {
            busNames.push(busName);
        }
    }, 'player-added')
    .hook(Mpris, (self, busName) => {
        if (!busName) return;
        
        removePlayer(busName, childrenMap, self);
        busNames.splice(busNames.indexOf(busName), 1);
    }, 'player-closed');
    const change = (diff: number) => (self: AgsEventBox<{ curr: number }>) => {
        const next = (self.attribute.curr + busNames.length + diff) % busNames.length;
        self.attribute.curr = next;
        stack.shown = busNames[next];
    };
    return Widget.EventBox({
        child: stack,
        attribute: {
            curr: 0 //current show
        },
        on_scroll_up: change(-1),
        on_scroll_down: change(1),
    });
}

export default AudioBar;
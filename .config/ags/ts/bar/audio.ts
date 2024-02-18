import { Audio } from "resource:///com/github/Aylur/ags/service/audio.js";
import { Widget } from "resource:///com/github/Aylur/ags/widget.js";
import { AgsCircularProgress } from "ts/imports";
import AnimationService, { EaseFunc } from "ts/services/animation";
import { AnimationDuration } from "ts/vars";

const audio = new Audio();
export const VolumeSlider = (type: 'speaker' | 'microphone' = 'speaker') => {
    const label = Widget.Label({
        class_names: ['volume-label']
    }).hook(audio, (self) => {
        const volume = audio[type]?.volume || 0;
        self.label = `${Math.ceil(volume * 100)}%`
    }, `${type}-changed`);
    const icon = Widget.Icon({
        class_names: ['volume-icon'],
        attribute: 0
    }).hook(audio, (self) => {
        const volume = audio[type]?.volume || 0

        let state = 0
        if (volume > 0.7)
            state = 3;
        else if (volume > 0.35)
            state = 2;
        else if (volume > 0)
            state = 1;
        
        if (self.attribute === state)
            return;
        else {
            switch (state) {
                case 0:
                    self.icon = 'audio-volume-muted-symbolic'
                    break;
                case 1:
                    self.icon = 'audio-volume-low-symbolic'
                    break;
                case 2:
                    self.icon = 'audio-volume-medium-symbolic'
                    break;
                case 3:
                    self.icon = 'audio-volume-high-symbolic'
                    break;
            }
        }
    });
    return Widget.EventBox({
        class_name: 'volume-slider',
        on_scroll_up() {
            const target = audio[type];
            if (target)
                target.volume += 0.02;
        },
        on_scroll_down() {
            const target = audio[type];
            if (target)
                target.volume -= 0.02;
        },
        on_hover() {
            label.class_names = ['volume-label', 'hover'];
            icon.class_names = ['volume-icon', 'hover'];
        },
        on_hover_lost() {
            label.class_names = ['volume-label'];
            icon.class_names = ['volume-icon'];
        },
        child: Widget.Overlay({
            child: Widget.CircularProgress({
                class_names: ['state-circle'],
                rounded: true,
                attribute: {
                    symbol: Symbol()
                }
            }).hook(audio, (self: AgsCircularProgress) => {
                let volume = audio[type]?.volume || 0
                AnimationService.animatedProp<typeof self>({
                    obj: self,
                    prop_name: 'value',
                    symbol: self.attribute!['symbol'],
                    duration: AnimationDuration.Scroll,
                    easing: EaseFunc.easeInQuad,
                    to: volume
                });
            }, `${type}-changed`),
            overlays: [
                Widget.Overlay({
                    child: label,
                    overlays: [
                        icon
                    ]
                })
            ]
        })
    })
}


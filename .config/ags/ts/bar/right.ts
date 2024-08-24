import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import {SysState, SysTray} from './system';
import {Spacing} from 'ts/utils';
import {VolumeSlider} from './audio';

export const Clock = () => {
    const time_label = Widget.Label({
        class_name: 'time',
        hpack: 'end',
        xalign: 0
    });
    const date_label = Widget.Label({
        class_name: 'date',
        hpack: 'end',
        xalign: 0
    });

    const updater = () => {
        const date = new Date();
        time_label.label = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        date_label.label = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    };
    updater();
    setInterval(updater, 1000);
    return Widget.Box({
        class_name: 'clock',
        vertical: true,
        children: [time_label, date_label]
    });
};

export const BarRight = () =>
    Widget.Box({
        class_name: 'right',
        children: [VolumeSlider(), Spacing(), SysTray(), SysState(), Clock()]
    });

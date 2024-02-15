import { monitorScss } from './utils'
import { Bar } from './bar/main'
import App from 'resource:///com/github/Aylur/ags/app.js';
import PowerMenu from './power/main';

monitorScss();
globalThis.openPowerMenu = () => {
    PowerMenu().show_all();
}

export default {
    windows: [
        Bar()
    ],
    icons: `${App.configDir}/assets/icons`
}
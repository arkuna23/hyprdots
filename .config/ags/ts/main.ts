import { monitorScss } from './utils'
import { Bar } from './bar/main'
import App from 'resource:///com/github/Aylur/ags/app.js';
import PowerMenu from './power/main';

monitorScss();
globalThis.openPowerMenu = () => {
    const menu = PowerMenu();
    menu.show_all();
    setTimeout(() => menu.destroy(), 3000);
}

export default {
    windows: [
        Bar()
    ],
    icons: `${App.configDir}/assets/icons`
}
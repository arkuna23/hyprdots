import { monitorScss } from './utils'
import { Bar } from './bar/main'
import Gtk from 'gi://Gtk';
import App from 'resource:///com/github/Aylur/ags/app.js';

monitorScss();
Gtk.IconTheme.get_default().append_search_path(`${App.configDir}/assets/icons`);

export default {
    windows: [
        Bar()
    ]
}
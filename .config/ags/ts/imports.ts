import Gtk30 from "gi://Gtk?version=3.0"
import Box from "types/widgets/box"
import Button from "types/widgets/button"
import CircularProgress from "types/widgets/circularprogress"
import EventBox from "types/widgets/eventbox"
import Icon from "types/widgets/icon"
import Label from "types/widgets/label"
import Overlay from "types/widgets/overlay"
import Stack from "types/widgets/stack"
import Window from "types/widgets/window"

export const GLib = imports.gi.GLib

type Attr = { [name: string]: any } | unknown

export type AgsWindow<A extends Attr = unknown> = Window<Gtk30.Widget, A>
export type AgsCircularProgress<A extends Attr = unknown> = CircularProgress<Gtk30.Widget, A>
export type AgsIcon<A extends Attr = unknown> = Icon<A>
export type AgsBox<A extends Attr = unknown> = Box<Gtk30.Widget, A>
export type AgsStack<A extends Attr = unknown> = Stack<{ [name: string]: Gtk30.Widget }, A>
export type AgsEventBox<A extends Attr = unknown> = EventBox<Gtk30.Widget, A>
export type AgsButton<A extends Attr = unknown> = Button<Gtk30.Widget, A> 
export type AgsOverlay<A extends Attr = unknown> = Overlay<Gtk30.Widget, Gtk30.Widget, A>
export type AgsLabel<A extends Attr = unknown> = Label<A>
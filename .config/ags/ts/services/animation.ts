import Service, { Binding } from "resource:///com/github/Aylur/ags/service.js"
import { GLib } from "ts/imports";
import SystemService from "./system";

export interface AnimateBaseOpt {
    duration: number; // unit:ms
    easing: (x: number) => number;// 0 <= x <= 1
    onFinish?: () => void
}

export interface AnimateOpt extends AnimateBaseOpt {
    symbol?: Symbol;
    action: (progress: number) => void;
}

interface InnerAnimateOpt extends AnimateOpt {
    start: number;
}

export interface AnimationHandle {
    stop: () => void;
}

export const EaseFunc = {
    linear: (x) => x,
    easeInQuad: (x) => x * x,
    easeOutQuad: (x) => x * (2 - x),
    easeInQubic: (x) => Math.pow(x, 3),
    easeOutQubic: (x) => 1 - Math.pow(1 - x, 3),
}

class _AnimationService extends Service {
    static {
        Service.register(
            this,
            {
                'animation-frame': []
            }
        )
    }
    
    private _animations: Map<Symbol, InnerAnimateOpt>; 
    // use symbol to distinguish animations, making them can be interrupted

    constructor() {
        super();
        this._animations = new Map();
    }

    private _running = false;

    private run() {
        if (this._running) return;
        this._running = true;

        const service = this;
        const animator = () => {
            const startTime = GLib.get_real_time();
            for (const [id, options] of service._animations) {
                const progress = (GLib.get_real_time() - options.start) / options.duration;
                if (progress >= 1) {
                    try {
                        options.action(1);
                        options.onFinish?.();
                    } catch(e) {
                        console.error(e as any)
                    }
                    service._animations.delete(id);
                } else {
                    try {
                        options.action(options.easing(progress));
                    } catch(e) {
                        console.error(e as any)
                    }
                }
            }
            service.emit('animation-frame');
            if (service._animations.size === 0) {
                service._running = false;
                return;
            }
            
            const elapsed = GLib.get_real_time() - startTime;
            const delay = 1000/SystemService.refresh_rate - elapsed/1000;
            setTimeout(animator, delay > 0 ? delay : 0)
        }
        animator()
    }

    public animate(options: AnimateOpt) {
        options.duration *= 1000;
        const id = options.symbol ?? Symbol();
        this._animations.set(id, {
            start: GLib.get_real_time(), ...options
        });
        this.run();
        return {
            stop: () => this._animations.delete(id)
        } as AnimationHandle;
    }

    public animatedProp<T>(opts: {
        obj: T,
        symbol?: Symbol,
        prop_name: keyof T,
        to: T[keyof T],
        change?: (progress: number) => T[keyof T],
    } & AnimateBaseOpt) {
        const { obj, prop_name, to } = opts;
        let changeFun: any;
        if (!opts.change) {
            const from = obj[prop_name] as number
            changeFun = (p: number) => from + (to as number - from) * p;
        } else {
            changeFun = opts.change;
        }

        return this.animate({
            action: (progress) => {
                obj[prop_name] = changeFun(progress);
            }, ...opts
        })
    }
}

const AnimationService = new _AnimationService();
export default AnimationService;
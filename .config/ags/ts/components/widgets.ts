import AnimationService, { AnimateBaseOpt, EaseFunc } from "ts/services/animation";
import { AnimationDuration } from "ts/vars";
import AgsCircularProgress from "types/widgets/circularprogress";

export type AnimatedCircularProgress = {
    bar: AgsCircularProgress,
    animation_setting: AnimateBaseOpt,
    symbol: symbol,
    value_animated: number
}

export function AnimatedCircularProgress(
    bar: AgsCircularProgress, 
    animation_setting: AnimateBaseOpt = {
        duration: AnimationDuration.State,
        easing: EaseFunc.easeInQuad
}): AnimatedCircularProgress {
    return {
        bar,
        animation_setting: animation_setting,
        symbol: Symbol(),
        set value_animated(value: number) {
            AnimationService.animatedProp<{ value: number }>({
                obj: this.bar,
                prop_name: 'value',
                symbol: this.symbol,
                to: value,
                ...animation_setting
            })
        }
    }
}
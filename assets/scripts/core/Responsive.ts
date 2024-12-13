import { _decorator, Component } from 'cc';
import { Orientation, UIManager } from '../managers/UIManager';
const { ccclass } = _decorator;

@ccclass('Responsive')
export class Responsive extends Component {
    onLoad() {
        window.addEventListener('orientationchange', this.onOrientationChange.bind(this));
    }

    onDestroy() {
        window.removeEventListener('orientationchange', this.onOrientationChange.bind(this));
    }

    protected start(): void {
        this.onOrientationChange();
    }

    private onOrientationChange() {
        const screen_orientation = window.screen.orientation; // 0, 90, -90 gibi değerler döner
        const orientation =  screen_orientation.type === Orientation.Portrait ? Orientation.Portrait : Orientation.Landscape 
        UIManager.getInstance().alingItems(orientation)
    }
}

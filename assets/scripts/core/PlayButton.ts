import { _decorator, Component, Button, log } from 'cc';
import { DeivceDetector } from '../helpers/DeviceDetector';

const { ccclass, property } = _decorator;

@ccclass('PlayButton')
export class PlayButton extends Component {
    onLoad() {
        const button = this.getComponent(Button);

        if (!button) {
            log('PlayButton: Button component is missing on this node.');
            return;
        }

        button.node.on('click', this.onClick, this); // Butona tıklama olayını bağla
    }

    onClick() {
        DeivceDetector.redirectToStore();
    }
}

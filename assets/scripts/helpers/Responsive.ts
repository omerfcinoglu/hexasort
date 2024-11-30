import { _decorator, Component, Node, Vec3 } from 'cc';
import { DeivceDetector , Orientation } from './DeviceDetector';
import { UIManager } from '../managers/UIManager';
import { CameraManager } from '../managers/CameraManager';
const { ccclass, property } = _decorator;

@ccclass('Responsive')
export class Responsive extends Component {

    private currentOrientation : Orientation = Orientation.Landscape;

    protected onLoad(): void {
        // window.addEventListener("resize", this.resize.bind(this));
        window.addEventListener("orientationchange",this.orientationChange.bind(this));
    }

    start() {
        this.orientationChange();
    }

    resize(){
        const orientation = DeivceDetector.getOrientation();
        UIManager.getInstance().alingItems(orientation);
    }

    orientationChange(){
        const orientation = DeivceDetector.getOrientation();
        CameraManager.getInstance().changePosition(orientation);
        UIManager.getInstance().alingItems(orientation);

    }
}


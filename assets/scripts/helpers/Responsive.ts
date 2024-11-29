import { _decorator, Component, Node } from 'cc';
import { DeivceDetector , Orientation } from './DeviceDetector';
const { ccclass, property } = _decorator;

@ccclass('Responsive')
export class Responsive extends Component {

    private currentOrientation : Orientation = Orientation.Landscape;

    protected onLoad(): void {
        window.addEventListener("resize", this.resize.bind(this));
        window.addEventListener("orientationchange",this.resize.bind(this));
    }

    start() {
        this.resize();
    }

    resize(){
        console.log("something");
        const orientation = DeivceDetector.getOrientation();
        if(orientation !== this.currentOrientation) this.currentOrientation = orientation;
    }
}


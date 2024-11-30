import { _decorator, Component, Node } from 'cc';
import { DeivceDetector , Orientation } from './DeviceDetector';
import { UIManager } from '../managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('Responsive')
export class Responsive extends Component {

    private currentOrientation : Orientation = Orientation.Landscape;

    protected onLoad(): void {
        window.addEventListener("resize", this.resize.bind(this));
        window.addEventListener("orientationchange",this.orationChange.bind(this));
    }

    start() {
        this.resize();
    }

    resize(){
        const orientation = DeivceDetector.getOrientation();
        if(orientation !== this.currentOrientation) this.currentOrientation = orientation;
        UIManager.getInstance().alingItems(this.currentOrientation);
    }

    orationChange(){
        console.log("kamera");
        
    }
}

